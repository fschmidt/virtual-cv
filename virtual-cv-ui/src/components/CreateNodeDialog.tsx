import { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import DialogOverlay from './DialogOverlay';
import type { CVNode, CVNodeType, CVSectionId, CVCategoryNode } from '../types';
import { CV_SECTIONS } from '../types';
import type { CreateNodeCommand } from '../services';
import { getErrorMessage } from '../api/errors';
import { getNodeTypeLabel } from '../utils/node-utils';
import './CreateNodeDialog.css';

interface CreateNodeDialogProps {
  isOpen: boolean;
  parentNode: CVNode;
  onClose: () => void;
  onCreate: (type: CVNodeType, data: CreateNodeCommand) => Promise<void>;
}

// Determine allowed child types based on parent
function getAllowedChildTypes(parent: CVNode): CVNodeType[] {
  switch (parent.type) {
    case 'profile':
      return ['category'];
    case 'category': {
      // Check sectionId to determine if skills section
      const categoryNode = parent as CVCategoryNode;
      if (categoryNode.sectionId === 'skills') {
        return ['skill-group'];
      }
      return ['item'];
    }
    case 'skill-group':
      return ['skill'];
    default:
      return []; // item and skill are leaf nodes
  }
}

interface FormData {
  label: string;
  description: string;
  // Category-specific
  sectionId?: CVSectionId;
  // Item-specific
  company?: string;
  dateRange?: string;
  location?: string;
  // Skill-specific
  proficiencyLevel?: string;
}

function CreateNodeDialog({ isOpen, parentNode, onClose, onCreate }: CreateNodeDialogProps) {
  // Memoize to prevent infinite loop in the reset effect below
  const allowedTypes = useMemo(() => getAllowedChildTypes(parentNode), [parentNode]);
  const [selectedType, setSelectedType] = useState<CVNodeType | null>(
    allowedTypes.length === 1 ? allowedTypes[0] : null
  );
  const [formData, setFormData] = useState<FormData>({
    label: '',
    description: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedType(allowedTypes.length === 1 ? allowedTypes[0] : null);
      setFormData({ label: '', description: '' });
      setError(null);
    }
  }, [isOpen, allowedTypes]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedType || !formData.label.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      // Build the command based on type
      const command: CreateNodeCommand = {
        id: crypto.randomUUID(),
        parentId: parentNode.id,
        label: formData.label.trim(),
        description: formData.description.trim() || undefined,
      };

      // Add type-specific fields
      if (selectedType === 'category' && formData.sectionId) {
        (command as Record<string, unknown>).sectionId = formData.sectionId;
      }
      if (selectedType === 'item') {
        if (formData.company) (command as Record<string, unknown>).company = formData.company;
        if (formData.dateRange) (command as Record<string, unknown>).dateRange = formData.dateRange;
        if (formData.location) (command as Record<string, unknown>).location = formData.location;
      }
      if ((selectedType === 'skill' || selectedType === 'skill-group') && formData.proficiencyLevel) {
        (command as Record<string, unknown>).proficiencyLevel = formData.proficiencyLevel;
      }

      // New nodes always start as drafts
      (command as Record<string, unknown>).attributes = {
        ...((command as Record<string, unknown>).attributes as Record<string, unknown> | undefined),
        isDraft: true,
      };

      await onCreate(selectedType, command);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  }, [selectedType, formData, parentNode.id, onCreate, onClose]);

  if (allowedTypes.length === 0) return null;

  const canSubmit = selectedType && formData.label.trim() &&
    (selectedType !== 'category' || formData.sectionId);

  return (
    <DialogOverlay
      isOpen={isOpen}
      onClose={onClose}
      closeDisabled={isCreating}
      overlayClassName="create-node-overlay"
      dialogClassName="create-node-dialog"
    >
      <div className="create-node-header">
        <Plus size={24} strokeWidth={2} color="#667eea" />
        <h2>Create New Node</h2>
        <button
          className="create-node-close"
          onClick={onClose}
          disabled={isCreating}
          aria-label="Close"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="create-node-content">
        {/* Type selector if multiple options */}
        {allowedTypes.length > 1 && (
          <div className="create-node-type-selector">
            <span className="type-selector-label">Type</span>
            <div className="type-selector-options">
              {allowedTypes.map((type) => (
                <button
                  key={type}
                  className={`type-option ${selectedType === type ? 'active' : ''}`}
                  onClick={() => setSelectedType(type)}
                  disabled={isCreating}
                >
                  {getNodeTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="edit-error">{error}</div>}

        {selectedType && (
          <div className="edit-form-fields">
            <label className="edit-field">
              <span>Label *</span>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleFieldChange('label', e.target.value)}
                placeholder="Enter label..."
                autoFocus
                disabled={isCreating}
              />
            </label>

            <label className="edit-field">
              <span>Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Optional description..."
                rows={3}
                disabled={isCreating}
              />
            </label>

            {/* Category-specific fields */}
            {selectedType === 'category' && (
              <label className="edit-field">
                <span>Section *</span>
                <select
                  value={formData.sectionId ?? ''}
                  onChange={(e) => handleFieldChange('sectionId', e.target.value as CVSectionId)}
                  disabled={isCreating}
                >
                  <option value="">Select section...</option>
                  {CV_SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Item-specific fields */}
            {selectedType === 'item' && (
              <>
                <label className="edit-field">
                  <span>Company / Organization</span>
                  <input
                    type="text"
                    value={formData.company ?? ''}
                    onChange={(e) => handleFieldChange('company', e.target.value)}
                    placeholder="e.g., Acme Corp"
                    disabled={isCreating}
                  />
                </label>
                <label className="edit-field">
                  <span>Date Range</span>
                  <input
                    type="text"
                    value={formData.dateRange ?? ''}
                    onChange={(e) => handleFieldChange('dateRange', e.target.value)}
                    placeholder="e.g., 2020 - Present"
                    disabled={isCreating}
                  />
                </label>
                <label className="edit-field">
                  <span>Location</span>
                  <input
                    type="text"
                    value={formData.location ?? ''}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    placeholder="e.g., Berlin, Germany"
                    disabled={isCreating}
                  />
                </label>
              </>
            )}

            {/* Skill-specific fields */}
            {(selectedType === 'skill' || selectedType === 'skill-group') && (
              <label className="edit-field">
                <span>Proficiency Level</span>
                <select
                  value={formData.proficiencyLevel ?? ''}
                  onChange={(e) => handleFieldChange('proficiencyLevel', e.target.value)}
                  disabled={isCreating}
                >
                  <option value="">Select level...</option>
                  <option value="expert">Expert</option>
                  <option value="advanced">Advanced</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="beginner">Beginner</option>
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      <div className="create-node-actions">
        <button
          className="delete-cancel-btn"
          onClick={onClose}
          disabled={isCreating}
        >
          Cancel
        </button>
        <button
          className="edit-save-btn"
          onClick={handleSubmit}
          disabled={isCreating || !canSubmit}
        >
          {isCreating ? 'Creating...' : 'Create'}
        </button>
      </div>
    </DialogOverlay>
  );
}

export default memo(CreateNodeDialog);
