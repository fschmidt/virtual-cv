interface FormData {
  label?: string;
  description?: string;
  content?: string;
  attributes?: Record<string, string | undefined>;
}

interface NodeEditProfileProps {
  formData: FormData;
  onFieldChange: (field: string, value: string, isAttribute?: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}

function NodeEditProfile({
  formData,
  onFieldChange,
  onCancel,
  onSave,
  isSaving,
  error,
}: NodeEditProfileProps) {
  return (
    <div className="inspector-edit-form">
      <div className="edit-form-header">
        <h2>Edit Profile</h2>
        <button className="edit-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {error && <div className="edit-error">{error}</div>}

      <div className="edit-form-fields">
        <label className="edit-field">
          <span>Name</span>
          <input
            type="text"
            value={(formData.attributes?.name as string) ?? ''}
            onChange={(e) => onFieldChange('name', e.target.value, true)}
          />
        </label>
        <label className="edit-field">
          <span>Title</span>
          <input
            type="text"
            value={(formData.attributes?.title as string) ?? ''}
            onChange={(e) => onFieldChange('title', e.target.value, true)}
          />
        </label>
        <label className="edit-field">
          <span>Subtitle</span>
          <input
            type="text"
            value={(formData.attributes?.subtitle as string) ?? ''}
            onChange={(e) => onFieldChange('subtitle', e.target.value, true)}
          />
        </label>
        <label className="edit-field">
          <span>Experience</span>
          <input
            type="text"
            value={(formData.attributes?.experience as string) ?? ''}
            onChange={(e) => onFieldChange('experience', e.target.value, true)}
          />
        </label>
        <label className="edit-field">
          <span>Email</span>
          <input
            type="email"
            value={(formData.attributes?.email as string) ?? ''}
            onChange={(e) => onFieldChange('email', e.target.value, true)}
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

        <label className="edit-field edit-field-content">
          <span>About (Markdown)</span>
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

export default NodeEditProfile;
