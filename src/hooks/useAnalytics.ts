import { useEffect, useRef, useCallback } from 'react';
import { isAnalyticsEnabled } from '../config/analyticsConfig';

type AnalyticsModule = typeof import('../services/analyticsService');

let analyticsModulePromise: Promise<AnalyticsModule> | null = null;

function loadAnalyticsModule(): Promise<AnalyticsModule> | null {
  if (!isAnalyticsEnabled) return null;

  analyticsModulePromise ??= import('../services/analyticsService');
  return analyticsModulePromise;
}

/**
 * Hook para integrar el servicio de analíticas en la app.
 *
 * - Al montar: registra la visita y configura listeners de salida.
 * - Expone funciones para trackear cambios de página y eventos.
 */
export function useAnalytics() {
  const initialized = useRef(false);

  // Inicializar analíticas una sola vez al montar el componente raíz
  useEffect(() => {
    if (!isAnalyticsEnabled) return;
    if (initialized.current) return;
    initialized.current = true;

    let cleanupListeners: (() => void) | undefined;
    let cancelled = false;

    loadAnalyticsModule()?.then(({ analytics }) => {
      if (cancelled) return;

      // Registrar visitante (async, no bloquea el render)
      analytics.trackVisitor();

      // Registrar fin de sesión al cerrar/salir
      const handleBeforeUnload = () => {
        analytics.trackSessionEnd();
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          analytics.trackSessionEnd();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      cleanupListeners = () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    });

    return () => {
      cancelled = true;
      cleanupListeners?.();
    };
  }, []);

  // Trackear cambio de sección/página
  const trackPageView = useCallback((page: string) => {
    if (!isAnalyticsEnabled) return;

    loadAnalyticsModule()?.then(({ analytics }) => {
      analytics.trackPageView(page);
    });
  }, []);

  // Trackear evento custom
  const trackEvent = useCallback((eventName: string, eventData: Record<string, unknown> = {}) => {
    if (!isAnalyticsEnabled) return;

    loadAnalyticsModule()?.then(({ analytics }) => {
      analytics.trackEvent(eventName, eventData);
    });
  }, []);

  return { trackPageView, trackEvent };
}
