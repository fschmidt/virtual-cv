import { memo, useRef, useCallback, useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import SectionIcon from './SectionIcon';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import CreateNodeDialog from './CreateNodeDialog';
import type { CVNode, CVProfileNode, CVData, CVSection, CVNodeType } from '../types';
import type { ContentMap, UpdateNodeCommand, CreateNodeCommand } from '../services';
import { setNodeContent } from '../services';

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 80;

// Local form data type with flat string attributes for UI
interface FormData {
  label?: string;
  description?: string;
  content?: string; // Markdown content
  attributes?: Record<string, string | undefined>;
}

interface InspectorPanelProps {
  selectedId: string | null;
  cvData: CVData;
  contentMap: ContentMap;
  sections: CVSection[];
  onClose: () => void;
  editModeEnabled?: boolean;
  onSave?: (id: string, updates: UpdateNodeCommand, content?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCreate?: (type: CVNodeType, data: CreateNodeCommand) => Promise<void>;
}

// Type guards
function isProfileNode(node: CVNode): node is CVProfileNode {
  return node.type === 'profile';
}

// Get parent chain for breadcrumb
function getParentChain(nodeId: string, nodes: CVNode[]): CVNode[] {
  const chain: CVNode[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (node) {
      chain.unshift(node);
      currentId = node.parentId;
    } else {
      break;
    }
  }

  return chain;
}

// Get section icon for a node
function getSectionIcon(node: CVNode, nodes: CVNode[], sections: CVSection[]): string | null {
  // Walk up to find category
  let current: CVNode | undefined = node;
  while (current && current.type !== 'category') {
    current = nodes.find((n) => n.id === current?.parentId);
  }

  if (current?.type === 'category' && 'sectionId' in current) {
    const section = sections.find((s) => s.id === current.sectionId);
    return section?.icon || null;
  }

  return null;
}

// Build form data from node
function buildFormDataFromNode(node: CVNode): FormData {
  const base: FormData = {
    label: node.label,
    description: node.description,
  };

  switch (node.type) {
    case 'profile': {
      const p = node as CVProfileNode;
      return {
        ...base,
        attributes: {
          name: p.name,
          title: p.title,
          subtitle: p.subtitle,
          experience: p.experience,
          email: p.email,
          location: p.location,
          photoUrl: p.photoUrl,
        },
      };
    }
    case 'item':
      return {
        ...base,
        attributes: {
          company: 'company' in node ? node.company : undefined,
          dateRange: 'dateRange' in node ? node.dateRange : undefined,
          location: 'location' in node ? node.location : undefined,
        },
      };
    case 'skill':
    case 'skill-group':
      return {
        ...base,
        attributes: {
          proficiencyLevel: 'proficiencyLevel' in node ? node.proficiencyLevel : undefined,
        },
      };
    default:
      return base;
  }
}

// Convert FormData to UpdateNodeCommand for API
function toUpdateNodeCommand(data: FormData): UpdateNodeCommand {
  const result: UpdateNodeCommand = {
    label: data.label,
    description: data.description,
  };

  if (data.attributes && Object.keys(data.attributes).length > 0) {
    // Cast to bypass strict typing - API accepts flat attributes
    result.attributes = data.attributes as unknown as UpdateNodeCommand['attributes'];
  }

  return result;
}

// Edit button component
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="inspector-edit-btn" onClick={onClick} title="Edit">
      <Pencil size={18} strokeWidth={2} color="#a78bfa" />
    </button>
  );
}

// Delete button component
function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="inspector-delete-btn" onClick={onClick} title="Delete">
      <Trash2 size={18} strokeWidth={2} color="#f87171" />
    </button>
  );
}

function InspectorPanel({
  selectedId,
  cvData,
  contentMap,
  sections,
  onClose,
  editModeEnabled = false,
  onSave,
  onDelete,
  onCreate,
}: InspectorPanelProps) {
  // Swipe to close tracking
  const touchStartY = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete mode state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create mode state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get node early to use in effects
  const node = selectedId ? cvData.nodes.find((n) => n.id === selectedId) : null;

  // Check if this node has children
  const hasChildren = selectedId ? cvData.nodes.some((n) => n.parentId === selectedId) : false;

  // Can this node be deleted? (profile cannot be deleted)
  const canDelete = node && node.type !== 'profile';

  // Can this node have children? (item and skill are leaf nodes)
  const canHaveChildren = node && node.type !== 'item' && node.type !== 'skill';

  // Reset edit state when selected node changes
  useEffect(() => {
    setIsEditing(false);
    setIsDeleteDialogOpen(false);
    setIsCreateDialogOpen(false);
    setError(null);
    if (node) {
      setFormData(buildFormDataFromNode(node));
    }
  }, [selectedId, node]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!selectedId || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(selectedId);
      setIsDeleteDialogOpen(false);
      onClose();
    } catch {
      // Error is handled by App.tsx via toast
    } finally {
      setIsDeleting(false);
    }
  }, [selectedId, onDelete, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (panelRef.current && panelRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;

      const deltaY = e.touches[0].clientY - touchStartY.current;

      if (deltaY > SWIPE_THRESHOLD) {
        touchStartY.current = null;
        onClose();
      }
    },
    [onClose]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  const handleStartEdit = useCallback(() => {
    if (node && selectedId) {
      setFormData({
        ...buildFormDataFromNode(node),
        content: contentMap[selectedId] ?? '',
      });
      setIsEditing(true);
      setError(null);
    }
  }, [node, selectedId, contentMap]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setError(null);
    if (node) {
      setFormData(buildFormDataFromNode(node));
    }
  }, [node]);

  const handleSave = useCallback(async () => {
    if (!selectedId || !onSave) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(selectedId, toUpdateNodeCommand(formData), formData.content);
      // Update local content service
      if (formData.content !== undefined) {
        setNodeContent(selectedId, formData.content);
      }
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [selectedId, formData, onSave]);

  const handleFieldChange = useCallback(
    (field: string, value: string, isAttribute = false) => {
      setFormData((prev: FormData): FormData => {
        if (isAttribute) {
          return {
            ...prev,
            attributes: {
              ...prev.attributes,
              [field]: value,
            },
          };
        }
        return {
          ...prev,
          [field]: value,
        };
      });
    },
    []
  );

  if (!selectedId || !node) return null;

  const content = contentMap[selectedId];
  const parentChain = getParentChain(selectedId, cvData.nodes);
  const sectionIcon = getSectionIcon(node, cvData.nodes, sections);

  // Close button (visible on mobile only via CSS)
  const closeButton = (
    <button className="inspector-close" onClick={onClose} title="Close">
      <X size={20} strokeWidth={2} />
    </button>
  );

  // Touch handlers for swipe-to-close
  const touchHandlers = {
    ref: panelRef,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  // Edit form for profile nodes
  if (isProfileNode(node) && isEditing) {
    return (
      <div className="inspector-panel" {...touchHandlers}>
        {closeButton}
        <div className="inspector-edit-form">
          <div className="edit-form-header">
            <h2>Edit Profile</h2>
            <button className="edit-cancel-btn" onClick={handleCancelEdit}>
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
                onChange={(e) => handleFieldChange('name', e.target.value, true)}
              />
            </label>
            <label className="edit-field">
              <span>Title</span>
              <input
                type="text"
                value={(formData.attributes?.title as string) ?? ''}
                onChange={(e) => handleFieldChange('title', e.target.value, true)}
              />
            </label>
            <label className="edit-field">
              <span>Subtitle</span>
              <input
                type="text"
                value={(formData.attributes?.subtitle as string) ?? ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value, true)}
              />
            </label>
            <label className="edit-field">
              <span>Experience</span>
              <input
                type="text"
                value={(formData.attributes?.experience as string) ?? ''}
                onChange={(e) => handleFieldChange('experience', e.target.value, true)}
              />
            </label>
            <label className="edit-field">
              <span>Email</span>
              <input
                type="email"
                value={(formData.attributes?.email as string) ?? ''}
                onChange={(e) => handleFieldChange('email', e.target.value, true)}
              />
            </label>
            <label className="edit-field">
              <span>Location</span>
              <input
                type="text"
                value={(formData.attributes?.location as string) ?? ''}
                onChange={(e) => handleFieldChange('location', e.target.value, true)}
              />
            </label>

            {/* Markdown content */}
            <label className="edit-field edit-field-content">
              <span>About (Markdown)</span>
              <textarea
                value={formData.content ?? ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                rows={8}
                placeholder="Enter markdown content..."
              />
            </label>
          </div>

          <button className="edit-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  // Profile node - view mode (no delete button for profile)
  if (isProfileNode(node)) {
    return (
      <div className="inspector-panel" {...touchHandlers}>
        {closeButton}
        {editModeEnabled && onSave && (
          <div className="inspector-action-buttons">
            <EditButton onClick={handleStartEdit} />
          </div>
        )}
        <div className="inspector-profile">
          <div className="inspector-profile-photo">
            <img src={node.photoUrl} alt={node.name} />
          </div>
          <h1 className="inspector-profile-name">{node.name}</h1>
          <h2 className="inspector-profile-title">{node.title}</h2>
          <p className="inspector-profile-subtitle">{node.subtitle}</p>
          <div className="inspector-profile-details">
            <span className="inspector-experience">{node.experience}</span>
            <span className="inspector-location">{node.location}</span>
            <span className="inspector-email">{node.email}</span>
          </div>
          {content && (
            <div className="inspector-content markdown-content">
              <Markdown>{content}</Markdown>
            </div>
          )}

          {/* Add child button */}
          {editModeEnabled && onCreate && canHaveChildren && (
            <button
              className="inspector-add-child-btn"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus size={18} strokeWidth={2} />
              Add Child Node
            </button>
          )}
        </div>

        {/* Create node dialog */}
        {onCreate && (
          <CreateNodeDialog
            isOpen={isCreateDialogOpen}
            parentNode={node}
            onClose={() => setIsCreateDialogOpen(false)}
            onCreate={onCreate}
          />
        )}
      </div>
    );
  }

  // Edit form for other nodes
  if (isEditing) {
    return (
      <div className="inspector-panel" {...touchHandlers}>
        {closeButton}
        <div className="inspector-edit-form">
          <div className="edit-form-header">
            <h2>Edit Node</h2>
            <button className="edit-cancel-btn" onClick={handleCancelEdit}>
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
                onChange={(e) => handleFieldChange('label', e.target.value)}
              />
            </label>
            <label className="edit-field">
              <span>Description</span>
              <textarea
                value={formData.description ?? ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={3}
              />
            </label>

            {/* Item-specific fields */}
            {node.type === 'item' && (
              <>
                <label className="edit-field">
                  <span>Company</span>
                  <input
                    type="text"
                    value={(formData.attributes?.company as string) ?? ''}
                    onChange={(e) => handleFieldChange('company', e.target.value, true)}
                  />
                </label>
                <label className="edit-field">
                  <span>Date Range</span>
                  <input
                    type="text"
                    value={(formData.attributes?.dateRange as string) ?? ''}
                    onChange={(e) => handleFieldChange('dateRange', e.target.value, true)}
                  />
                </label>
                <label className="edit-field">
                  <span>Location</span>
                  <input
                    type="text"
                    value={(formData.attributes?.location as string) ?? ''}
                    onChange={(e) => handleFieldChange('location', e.target.value, true)}
                  />
                </label>
              </>
            )}

            {/* Skill-specific fields */}
            {(node.type === 'skill' || node.type === 'skill-group') && (
              <label className="edit-field">
                <span>Proficiency Level</span>
                <select
                  value={(formData.attributes?.proficiencyLevel as string) ?? ''}
                  onChange={(e) => handleFieldChange('proficiencyLevel', e.target.value, true)}
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
                onChange={(e) => handleFieldChange('content', e.target.value)}
                rows={8}
                placeholder="Enter markdown content..."
              />
            </label>
          </div>

          <button className="edit-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  // Other nodes - view mode
  return (
    <div className="inspector-panel" {...touchHandlers}>
      {closeButton}
      {editModeEnabled && (onSave || onDelete) && (
        <div className="inspector-action-buttons">
          {onSave && <EditButton onClick={handleStartEdit} />}
          {onDelete && canDelete && (
            <DeleteButton onClick={() => setIsDeleteDialogOpen(true)} />
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="inspector-breadcrumb">
        {parentChain.map((n, i) => (
          <span key={n.id}>
            {i > 0 && <span className="breadcrumb-separator">/</span>}
            <span className={n.id === selectedId ? 'breadcrumb-current' : 'breadcrumb-item'}>
              {n.label.split('\n')[0]}
            </span>
          </span>
        ))}
      </div>

      {/* Header with icon */}
      <div className="inspector-header">
        {sectionIcon && <SectionIcon icon={sectionIcon} size={28} className="inspector-icon" />}
        <h1 className="inspector-title">{node.label.replace(/\n/g, ' ')}</h1>
      </div>

      {/* Meta info for items */}
      {'company' in node && node.company && <p className="inspector-company">{node.company}</p>}
      {'dateRange' in node && node.dateRange && <p className="inspector-date">{node.dateRange}</p>}

      {/* Proficiency for skills */}
      {'proficiencyLevel' in node && node.proficiencyLevel && (
        <div className="inspector-proficiency">
          <span className={`proficiency-badge ${node.proficiencyLevel}`}>{node.proficiencyLevel}</span>
        </div>
      )}

      {/* Markdown content */}
      {content && (
        <div className="inspector-content markdown-content">
          <Markdown>{content}</Markdown>
        </div>
      )}

      {/* Fallback for nodes without content */}
      {!content && node.description && <p className="inspector-description">{node.description}</p>}

      {/* Add child button */}
      {editModeEnabled && onCreate && canHaveChildren && (
        <button
          className="inspector-add-child-btn"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus size={18} strokeWidth={2} />
          Add Child Node
        </button>
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        nodeName={node.label.split('\n')[0]}
        hasChildren={hasChildren}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isDeleting={isDeleting}
      />

      {/* Create node dialog */}
      {onCreate && (
        <CreateNodeDialog
          isOpen={isCreateDialogOpen}
          parentNode={node}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}

export default memo(InspectorPanel);
