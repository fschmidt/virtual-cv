import type { CVNodeType } from '../types';

interface FormData {
  label?: string;
  description?: string;
  content?: string;
  attributes?: Record<string, string | undefined>;
}

interface NodeEditFormProps {
  nodeType: CVNodeType;
  formData: FormData;
  onFieldChange: (field: string, value: string, isAttribute?: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}

function NodeEditForm({
  nodeType,
  formData,
  onFieldChange,
  onCancel,
  onSave,
  isSaving,
  error,
}: NodeEditFormProps) {
  return (
    <div className="inspector-edit-form">
      <div className="edit-form-header">
        <h2>Edit Node</h2>
        <button className="edit-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {error && <div className="edit-error">{error}</div>}

      <div className="edit-form-fields">
        <label className="edit-field">
          <span>Label</span>
          <input
            type="text"
            value={formData.label ?? ''}
            onChange={(e) => onFieldChange('label', e.target.value)}
          />
        </label>
        <label className="edit-field">
          <span>Description</span>
          <textarea
            value={formData.description ?? ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            rows={3}
          />
        </label>

        {/* Item-specific fields */}
        {nodeType === 'item' && (
          <>
            <label className="edit-field">
              <span>Company</span>
              <input
                type="text"
                value={(formData.attributes?.company as string) ?? ''}
                onChange={(e) => onFieldChange('company', e.target.value, true)}
              />
            </label>
            <label className="edit-field">
              <span>Date Range</span>
              <input
                type="text"
                value={(formData.attributes?.dateRange as string) ?? ''}
                onChange={(e) => onFieldChange('dateRange', e.target.value, true)}
              />
            </label>
            <label className="edit-field">
              <span>Location</span>
              <input
                type="text"
                value={(formData.attributes?.location as string) ?? ''}
                onChange={(e) => onFieldChange('location', e.target.value, true)}
              />
            </label>
          </>
        )}

        {/* Skill-specific fields */}
        {(nodeType === 'skill' || nodeType === 'skill-group') && (
          <label className="edit-field">
            <span>Proficiency Level</span>
            <select
              value={(formData.attributes?.proficiencyLevel as string) ?? ''}
              onChange={(e) => onFieldChange('proficiencyLevel', e.target.value, true)}
            >
              <option value="">Select level</option>
              <option value="expert">Expert</option>
              <option value="advanced">Advanced</option>
              <option value="intermediate">Intermediate</option>
              <option value="beginner">Beginner</option>
            </select>
          </label>
        )}

        {/* Markdown content */}
        <label className="edit-field edit-field-content">
          <span>Content (Markdown)</span>
          <textarea
            value={formData.content ?? ''}
            onChange={(e) => onFieldChange('content', e.target.value)}
            rows={8}
            placeholder="Enter markdown content..."
          />
        </label>
      </div>

      <button className="edit-save-btn" onClick={onSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

export default NodeEditForm;
