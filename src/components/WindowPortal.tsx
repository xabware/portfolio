/**
 * =====================================================
 * usePopupWindow - Hook para ventanas emergentes
 * =====================================================
 * 
 * Gestiona ventanas popup del navegador imperativamente.
 * open() DEBE llamarse desde click handlers para evitar bloqueo.
 * Devuelve un container DOM para usar con createPortal().
 * =====================================================
 */

import { useRef, useState, useCallback, useEffect } from 'react';

interface PopupWindowOptions {
  width?: number;
  height?: number;
  windowId: string;
}

export function usePopupWindow({ width = 650, height = 800, windowId }: PopupWindowOptions) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const windowRef = useRef<Window | null>(null);
  const observersRef = useRef<{ disconnect: () => void }[]>([]);

  /** Abrir la ventana popup. DEBE llamarse desde un click handler (gesto del usuario). */
  const open = useCallback((title: string): boolean => {
    // Si ya está abierta, solo enfocar y actualizar título
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.document.title = title;
      windowRef.current.focus();
      return true;
    }

    const left = window.screenX + window.outerWidth;
    const top = window.screenY;
    const features = [
      `width=${width}`, `height=${height}`,
      `left=${left}`, `top=${top}`,
      'menubar=no', 'toolbar=no', 'location=no', 'status=no',
      'resizable=yes', 'scrollbars=yes',
    ].join(',');

    const popup = window.open('', windowId, features);
    if (!popup) return false;

    windowRef.current = popup;
    popup.document.title = title;

    // Copiar tema actual
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    popup.document.documentElement.setAttribute('data-theme', theme);

    // Copiar estilos del documento principal
    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
      popup.document.head.appendChild(node.cloneNode(true));
    });

    // Estilos base del popup
    const baseStyle = popup.document.createElement('style');
    baseStyle.textContent = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-primary, #0f0f0f);
        color: var(--text-primary, #e0e0e0);
        overflow: hidden;
      }
      #portal-root {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
    `;
    popup.document.head.appendChild(baseStyle);

    // Contenedor root para el portal
    const rootDiv = popup.document.createElement('div');
    rootDiv.id = 'portal-root';
    popup.document.body.appendChild(rootDiv);

    // Sincronizar cambios de tema
    const themeObs = new MutationObserver(() => {
      if (!popup.closed) {
        const newTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        popup.document.documentElement.setAttribute('data-theme', newTheme);
      }
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Sincronizar nuevos estilos (HMR en desarrollo)
    const styleObs = new MutationObserver((mutations) => {
      if (popup.closed) return;
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === 'stylesheet')) {
            popup.document.head.appendChild(node.cloneNode(true));
          }
        });
      }
    });
    styleObs.observe(document.head, { childList: true });

    observersRef.current = [themeObs, styleObs];

    // Manejar cierre de la ventana por el usuario
    popup.addEventListener('beforeunload', () => {
      observersRef.current.forEach(o => o.disconnect());
      observersRef.current = [];
      windowRef.current = null;
      setContainer(null);
    });

    setContainer(rootDiv);
    return true;
  }, [width, height, windowId]);

  /** Cerrar la ventana popup programáticamente */
  const close = useCallback(() => {
    observersRef.current.forEach(o => o.disconnect());
    observersRef.current = [];
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
    windowRef.current = null;
    setContainer(null);
  }, []);

  /** Enfocar la ventana si está abierta */
  const focus = useCallback(() => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
    }
  }, []);

  // Limpiar al desmontar el componente
  useEffect(() => () => {
    observersRef.current.forEach(o => o.disconnect());
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
  }, []);

  return { open, close, focus, container, isOpen: container !== null };
}
