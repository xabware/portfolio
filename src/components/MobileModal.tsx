/**
 * =====================================================
 * MOBILE MODAL - Modal a pantalla completa para móviles
 * =====================================================
 * 
 * Modal overlay que muestra contenido a pantalla completa en
 * dispositivos móviles. Se usa como fallback del WindowPortal.
 * =====================================================
 */

import { memo, useEffect } from 'react';
import { X } from 'lucide-react';
import './MobileModal.css';

interface MobileModalProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

const MobileModal = memo(({ children, title, icon, onClose }: MobileModalProps) => {
  // Prevenir scroll del body mientras la modal está abierta
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="mobile-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mobile-modal-header">
        <div className="mobile-modal-title">
          {icon}
          <span>{title}</span>
        </div>
        <button className="mobile-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="mobile-modal-body">
        {children}
      </div>
    </div>
  );
});

MobileModal.displayName = 'MobileModal';

export default MobileModal;
