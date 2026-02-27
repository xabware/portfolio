import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, increment, setDoc } from 'firebase/firestore';

// ==========================================
// Tipos
// ==========================================

export interface VisitorData {
  // Identificación de sesión
  sessionId: string;
  fingerprint: string;

  // Timestamps
  timestamp: ReturnType<typeof serverTimestamp>;
  localTime: string;
  timezone: string;
  timezoneOffset: number;

  // Navegador
  userAgent: string;
  browser: string;
  browserVersion: string;
  platform: string;
  language: string;
  languages: string[];
  cookiesEnabled: boolean;
  doNotTrack: boolean;

  // Pantalla y dispositivo
  screenWidth: number;
  screenHeight: number;
  screenColorDepth: number;
  windowWidth: number;
  windowHeight: number;
  devicePixelRatio: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  touchSupport: boolean;
  maxTouchPoints: number;

  // Red
  connectionType: string;
  connectionEffectiveType: string;
  connectionDownlink: number;
  online: boolean;

  // Navegación
  referrer: string;
  currentUrl: string;
  pageTitle: string;
  entryPage: string;

  // Hardware
  hardwareConcurrency: number;
  deviceMemory: number;

  // Geolocalización (via IP API)
  geo: {
    ip: string;
    country: string;
    countryCode: string;
    region: string;
    city: string;
    lat: number;
    lon: number;
    isp: string;
    org: string;
    as: string;
  } | null;
}

export interface PageViewData {
  sessionId: string;
  page: string;
  timestamp: ReturnType<typeof serverTimestamp>;
  localTime: string;
  timeOnPreviousPage: number | null;
}

export interface EventData {
  sessionId: string;
  eventName: string;
  eventData: Record<string, unknown>;
  timestamp: ReturnType<typeof serverTimestamp>;
  localTime: string;
}

// ==========================================
// Utilidades
// ==========================================

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Genera un fingerprint simple basado en propiedades del navegador.
 * No es tan robusto como FingerprintJS pero es suficiente para un portfolio
 * y no requiere librerías externas.
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
    navigator.maxTouchPoints || 0,
    navigator.platform,
  ];

  // Simple hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function detectBrowser(): { name: string; version: string } {
  const ua = navigator.userAgent;

  if (ua.includes('Firefox/')) {
    return { name: 'Firefox', version: ua.split('Firefox/')[1]?.split(' ')[0] || '' };
  }
  if (ua.includes('Edg/')) {
    return { name: 'Edge', version: ua.split('Edg/')[1]?.split(' ')[0] || '' };
  }
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    return { name: 'Chrome', version: ua.split('Chrome/')[1]?.split(' ')[0] || '' };
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    return { name: 'Safari', version: ua.split('Version/')[1]?.split(' ')[0] || '' };
  }
  if (ua.includes('Opera') || ua.includes('OPR/')) {
    return { name: 'Opera', version: ua.split('OPR/')[1]?.split(' ')[0] || '' };
  }

  return { name: 'Unknown', version: '' };
}

function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent.toLowerCase();

  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    return 'mobile';
  }
  if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
}

function getConnectionInfo() {
  const conn = (navigator as Navigator & {
    connection?: {
      type?: string;
      effectiveType?: string;
      downlink?: number;
    };
  }).connection;

  return {
    type: conn?.type || 'unknown',
    effectiveType: conn?.effectiveType || 'unknown',
    downlink: conn?.downlink || 0,
  };
}

async function getGeoData(): Promise<VisitorData['geo']> {
  try {
    // freeipapi.com: gratis, HTTPS, CORS habilitado
    const response = await fetch('https://freeipapi.com/api/json');
    if (!response.ok) throw new Error('freeipapi failed');

    const data = await response.json();

    return {
      ip: data.ipAddress || '',
      country: data.countryName || '',
      countryCode: data.countryCode || '',
      region: data.regionName || '',
      city: data.cityName || '',
      lat: data.latitude || 0,
      lon: data.longitude || 0,
      isp: '',
      org: '',
      as: '',
    };
  } catch {
    // Fallback: ipapi.co (gratis, HTTPS, 1000 req/día)
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) return null;

      const data = await response.json();
      return {
        ip: data.ip || '',
        country: data.country_name || '',
        countryCode: data.country_code || '',
        region: data.region || '',
        city: data.city || '',
        lat: data.latitude || 0,
        lon: data.longitude || 0,
        isp: data.org || '',
        org: data.org || '',
        as: data.asn ? String(data.asn) : '',
      };
    } catch {
      return null;
    }
  }
}

// ==========================================
// Servicio principal de analíticas
// ==========================================

class AnalyticsService {
  private sessionId: string;
  private fingerprint: string;
  private lastPageChangeTime: number;
  private currentPage: string;
  private initialized = false;

  constructor() {
    this.sessionId = generateSessionId();
    this.fingerprint = generateFingerprint();
    this.lastPageChangeTime = Date.now();
    this.currentPage = 'portfolio';
  }

  /**
   * Registra la visita inicial con toda la información del visitante.
   * Se llama una sola vez al cargar la página.
   */
  async trackVisitor(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const browser = detectBrowser();
      const connection = getConnectionInfo();
      const geo = await getGeoData();

      const visitorData: VisitorData = {
        sessionId: this.sessionId,
        fingerprint: this.fingerprint,

        timestamp: serverTimestamp(),
        localTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),

        userAgent: navigator.userAgent,
        browser: browser.name,
        browserVersion: browser.version,
        platform: navigator.platform,
        language: navigator.language,
        languages: [...navigator.languages],
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1',

        screenWidth: screen.width,
        screenHeight: screen.height,
        screenColorDepth: screen.colorDepth,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        deviceType: detectDeviceType(),
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,

        connectionType: connection.type,
        connectionEffectiveType: connection.effectiveType,
        connectionDownlink: connection.downlink,
        online: navigator.onLine,

        referrer: document.referrer || 'direct',
        currentUrl: window.location.href,
        pageTitle: document.title,
        entryPage: window.location.pathname + window.location.hash,

        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,

        geo,
      };

      await addDoc(collection(db, 'visitors'), visitorData);

      // Actualizar contador de visitas únicas por fingerprint
      await this.updateUniqueVisitorCount();

      // Registrar la primera pageview
      await this.trackPageView(this.currentPage);

      console.log('[Analytics] Visitor tracked successfully');
    } catch (error) {
      console.warn('[Analytics] Error tracking visitor:', error);
    }
  }

  /**
   * Registra un cambio de página/sección dentro de la SPA.
   */
  async trackPageView(page: string): Promise<void> {
    const now = Date.now();
    const timeOnPreviousPage = this.currentPage !== page
      ? Math.round((now - this.lastPageChangeTime) / 1000) // en segundos
      : null;

    try {
      const pageViewData: PageViewData = {
        sessionId: this.sessionId,
        page,
        timestamp: serverTimestamp(),
        localTime: new Date().toISOString(),
        timeOnPreviousPage,
      };

      await addDoc(collection(db, 'pageviews'), pageViewData);

      this.currentPage = page;
      this.lastPageChangeTime = now;
    } catch (error) {
      console.warn('[Analytics] Error tracking page view:', error);
    }
  }

  /**
   * Registra un evento personalizado (ej: click en proyecto, uso del chat, etc.)
   */
  async trackEvent(eventName: string, eventData: Record<string, unknown> = {}): Promise<void> {
    try {
      const event: EventData = {
        sessionId: this.sessionId,
        eventName,
        eventData,
        timestamp: serverTimestamp(),
        localTime: new Date().toISOString(),
      };

      await addDoc(collection(db, 'events'), event);
    } catch (error) {
      console.warn('[Analytics] Error tracking event:', error);
    }
  }

  /**
   * Lleva un conteo de visitantes únicos por fingerprint.
   * Usa setDoc con merge para no necesitar leer antes de escribir.
   */
  private async updateUniqueVisitorCount(): Promise<void> {
    try {
      const visitorRef = doc(db, 'unique_visitors', this.fingerprint);
      // merge: true crea el doc si no existe, o actualiza si ya existe
      // increment() funciona tanto para crear (valor inicial 1) como para incrementar
      await setDoc(visitorRef, {
        fingerprint: this.fingerprint,
        lastVisit: serverTimestamp(),
        lastLocalTime: new Date().toISOString(),
        visitCount: increment(1),
      }, { merge: true });
    } catch (error) {
      console.warn('[Analytics] Error updating unique visitor count:', error);
    }
  }

  /**
   * Registra la duración de la sesión cuando el usuario cierra/sale.
   * Se llama en beforeunload/visibilitychange.
   */
  trackSessionEnd(): void {
    try {
      const sessionDuration = Math.round((Date.now() - (this.lastPageChangeTime - (Date.now() - this.lastPageChangeTime))) / 1000);

      // Usamos sendBeacon para asegurar que se envía incluso al cerrar
      const data = JSON.stringify({
        sessionId: this.sessionId,
        endTime: new Date().toISOString(),
        lastPage: this.currentPage,
        sessionDuration,
      });

      // Nota: sendBeacon no envía directamente a Firestore.
      // Registramos el evento final de forma síncrona como fallback.
      addDoc(collection(db, 'session_ends'), {
        sessionId: this.sessionId,
        endTime: new Date().toISOString(),
        lastPage: this.currentPage,
        approximateDuration: Math.round((Date.now() - parseInt(this.sessionId.split('-')[0])) / 1000),
        timestamp: serverTimestamp(),
      }).catch(() => {
        // Si falla, intentar con sendBeacon a un endpoint propio (si lo tienes)
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/session-end', data);
        }
      });
    } catch {
      // Silently fail on session end
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton
export const analytics = new AnalyticsService();
