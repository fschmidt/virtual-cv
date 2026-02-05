import { memo, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  nodeName: string;
  hasChildren: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

function DeleteConfirmDialog({
  isOpen,
  nodeName,
  hasChildren,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  // Focus dialog when opened
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="delete-confirm-overlay"
      onClick={isDeleting ? undefined : onCancel}
    >
      <div
        ref={dialogRef}
        className="delete-confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="delete-confirm-header">
          <AlertTriangle size={24} strokeWidth={2} color="#f87171" />
          <h2>Delete Node</h2>
          <button
            className="delete-confirm-close"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <p className="delete-confirm-message">
          Are you sure you want to delete <strong>{nodeName}</strong>?
        </p>

        {hasChildren && (
          <div className="delete-confirm-warning">
            <AlertCircle size={16} strokeWidth={2} />
            <span>This will also delete all child nodes.</span>
          </div>
        )}

        <div className="delete-confirm-actions">
          <button
            className="delete-cancel-btn"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(DeleteConfirmDialog);
