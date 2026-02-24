/**
 * =====================================================
 * POPUP CONTEXT - Puente entre Chatbot y ventanas popup
 * =====================================================
 * 
 * Permite a componentes hijos (Chatbot) abrir/cerrar ventanas
 * popup o modales desde sus click handlers directamente.
 * =====================================================
 */

import { createContext, useContext } from 'react';

interface PopupContextType {
  /** Abre el visor de PDF en popup (PC) o modal (móvil). LLAMAR DESDE CLICK HANDLER. */
  openPdfPopup: (fileName: string, page: number) => void;
  /** Cierra el visor de PDF */
  closePdfPopup: () => void;
  /** Abre el panel de debug en popup (PC) o modal (móvil). LLAMAR DESDE CLICK HANDLER. */
  openDebugPopup: () => void;
  /** Cierra el panel de debug */
  closeDebugPopup: () => void;
}

export const PopupContext = createContext<PopupContextType>({
  openPdfPopup: () => {},
  closePdfPopup: () => {},
  openDebugPopup: () => {},
  closeDebugPopup: () => {},
});

export const usePopup = () => useContext(PopupContext);
