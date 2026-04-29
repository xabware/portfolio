/**
 * Carga datos CMS desde Firebase al arrancar la app.
 * Mientras carga, no renderiza hijos (flash invisible).
 * Si falla, se usan los datos estáticos.
 */
import { useState, useEffect, type ReactNode } from 'react';
import { isFirebaseCmsEnabled } from '../config/cmsConfig';
import { applyCMSData, cmsStore } from '../stores/cmsDataStore';

export function CMSLoader({ children }: { children: ReactNode }) {
  const [, setReady] = useState(cmsStore.loaded);

  useEffect(() => {
    if (cmsStore.loaded) return;

    if (!isFirebaseCmsEnabled) {
      cmsStore.loaded = true;
      applyCMSData({});
      setReady(true);
      return;
    }

    let cancelled = false;

    import('../services/cmsService')
      .then(({ loadAllCMSData }) => loadAllCMSData())
      .then(({ projects, about, skills, translations, settings, space }) => {
        if (cancelled) return;

        applyCMSData({ projects, about, skills, translations, settings, space });
      })
      .catch((err) => {
        console.warn('[CMS] Failed to load, using static data:', err);
      })
      .finally(() => {
        if (cancelled) return;

        if (!cmsStore.loaded) applyCMSData({});
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Renderiza inmediatamente con datos estáticos; cuando Firebase responde
  // setReady(true) dispara un re-render y los hijos usan los datos CMS.
  return <>{children}</>;
}
