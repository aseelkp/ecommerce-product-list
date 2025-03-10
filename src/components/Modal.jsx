import { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actionLabel,
  onAction,
  size = 'md',
  hideCloseButton = false,
  footer,
  customFooter,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    '8xl': 'max-w-8xl',
    full: 'max-w-full',
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className={`modal-box px-0 ${sizeClasses[size] || 'max-w-md'}`}>
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
          >
            ✕
          </button>
        )}
        {title && <h3 className="mb-4 px-8 text-lg font-bold">{title}</h3>}
        <div className="py-2">{children}</div>
        {customFooter ? (
          <div className="modal-footer px-8 py-2">{customFooter}</div>
        ) : footer ? (
          <div className="modal-footer px-8 py-2">{footer}</div>
        ) : (
          actionLabel && (
            <div className="modal-action px-8 py-2">
              <button className="btn" onClick={onAction}>
                {actionLabel}
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
            </div>
          )
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default Modal;
