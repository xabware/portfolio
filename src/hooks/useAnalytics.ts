import { useEffect, useRef, useCallback } from 'react';
import { analytics } from '../services/analyticsService';

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
    if (initialized.current) return;
    initialized.current = true;

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

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Trackear cambio de sección/página
  const trackPageView = useCallback((page: string) => {
    analytics.trackPageView(page);
  }, []);

  // Trackear evento custom
  const trackEvent = useCallback((eventName: string, eventData: Record<string, unknown> = {}) => {
    analytics.trackEvent(eventName, eventData);
  }, []);

  return { trackPageView, trackEvent };
}
