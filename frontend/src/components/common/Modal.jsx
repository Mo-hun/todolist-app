import { useEffect } from 'react';
import useI18n from '@/hooks/useI18n';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { t } = useI18n();
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size === 'sm' ? 'max-w-sm' : 'max-w-md';

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full ${sizeClass} mx-4 p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-black">{title}</h2>
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={onClose}
              className="text-text-secondary transition-colors hover:text-black"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
