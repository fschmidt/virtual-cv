import { useEffect, useRef, type ReactNode } from 'react';

interface DialogOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** When true, overlay click and Escape key are disabled (e.g. during async operations) */
  closeDisabled?: boolean;
  /** CSS class for the overlay element */
  overlayClassName: string;
  /** CSS class for the dialog element */
  dialogClassName: string;
  children: ReactNode;
}

function DialogOverlay({
  isOpen,
  onClose,
  closeDisabled = false,
  overlayClassName,
  dialogClassName,
  children,
}: DialogOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen || closeDisabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDisabled, onClose]);

  // Focus dialog when opened
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={overlayClassName} onClick={closeDisabled ? undefined : onClose}>
      <div
        ref={dialogRef}
        className={dialogClassName}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}

export default DialogOverlay;
