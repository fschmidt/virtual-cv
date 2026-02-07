import { memo } from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import DialogOverlay from './DialogOverlay';
import './DeleteConfirmDialog.css';

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
  return (
    <DialogOverlay
      isOpen={isOpen}
      onClose={onCancel}
      closeDisabled={isDeleting}
      overlayClassName="delete-confirm-overlay"
      dialogClassName="delete-confirm-dialog"
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
    </DialogOverlay>
  );
}

export default memo(DeleteConfirmDialog);
