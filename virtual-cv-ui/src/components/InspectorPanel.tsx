import { memo, useRef, useCallback, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import CreateNodeDialog from './CreateNodeDialog';
import NodeViewProfile from './NodeViewProfile';
import NodeEditProfile from './NodeEditProfile';
import NodeView from './NodeView';
import NodeEditForm from './NodeEditForm';
import { CvNodeDtoType } from '../api/generated';
import type { CVNode, CVData, CVSection, CVNodeType } from '../types';
import { profileAttrs, itemAttrs, skillAttrs } from '../types';
import { getParentChain, getSectionIcon } from '../utils/node-utils';
import type { ContentMap, UpdateNodeCommand, CreateNodeCommand } from '../services';
import { toUpdateNodeCommand, type FormData } from '../utils/form-utils';
import './InspectorPanel.css';

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 80;

interface InspectorPanelProps {
  selectedId: string | null;
  cvData: CVData;
  contentMap: ContentMap;
  sections: CVSection[];
  onClose: () => void;
  editModeEnabled?: boolean;
  onSave?: (id: string, updates: UpdateNodeCommand) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCreate?: (type: CVNodeType, data: CreateNodeCommand) => Promise<void>;
  onPublish?: (id: string, publish: boolean) => Promise<void>;
}

// Build form data from node
function buildFormDataFromNode(node: CVNode): FormData {
  const base: FormData = {
    label: node.label,
  };

  switch (node.type) {
    case CvNodeDtoType.PROFILE: {
      const p = profileAttrs(node);
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
    case CvNodeDtoType.ITEM: {
      const item = itemAttrs(node);
      return {
        ...base,
        attributes: {
          company: item.company,
          dateRange: item.dateRange,
          location: item.location,
        },
      };
    }
    case CvNodeDtoType.SKILL:
    case CvNodeDtoType.SKILL_GROUP: {
      const skill = skillAttrs(node);
      return {
        ...base,
        attributes: {
          proficiencyLevel: skill.proficiencyLevel,
        },
      };
    }
    default:
      return base;
  }
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
  onPublish,
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

  // Publish mode state
  const [isPublishing, setIsPublishing] = useState(false);

  const node = selectedId ? cvData.nodes.find((n) => n.id === selectedId) : null;
  const hasChildren = selectedId ? cvData.nodes.some((n) => n.parentId === selectedId) : false;
  const canDelete = node ? node.type !== CvNodeDtoType.PROFILE : false;
  const canHaveChildren = node ? node.type !== CvNodeDtoType.ITEM && node.type !== CvNodeDtoType.SKILL : false;
  const isProfile = node?.type === CvNodeDtoType.PROFILE;

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

  const handlePublish = useCallback(async () => {
    if (!selectedId || !onPublish || !node) return;
    setIsPublishing(true);
    try {
      const { isDraft } = await import('../types');
      await onPublish(selectedId, isDraft(node));
    } catch {
      // Error is handled by App.tsx via toast
    } finally {
      setIsPublishing(false);
    }
  }, [selectedId, onPublish, node]);

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
        markdownContent: contentMap[selectedId] ?? '',
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
      await onSave(selectedId, toUpdateNodeCommand(formData));
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
          return { ...prev, attributes: { ...prev.attributes, [field]: value } };
        }
        return { ...prev, [field]: value };
      });
    },
    []
  );

  if (!selectedId || !node) return null;

  const content = contentMap[selectedId];
  const parentChain = getParentChain(selectedId, cvData.nodes);
  const sectionIcon = getSectionIcon(node, cvData.nodes, sections);

  const touchHandlers = {
    ref: panelRef,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  const closeButton = (
    <button className="inspector-close" onClick={onClose} title="Close">
      <X size={20} strokeWidth={2} />
    </button>
  );

  // Profile edit form
  if (isProfile && isEditing) {
    return (
      <div className="inspector-panel" {...touchHandlers}>
        {closeButton}
        <NodeEditProfile
          formData={formData}
          onFieldChange={handleFieldChange}
          onCancel={handleCancelEdit}
          onSave={handleSave}
          isSaving={isSaving}
          error={error}
        />
      </div>
    );
  }

  // Profile view
  if (isProfile) {
    return (
      <div className="inspector-panel" {...touchHandlers}>
        {closeButton}
        <NodeViewProfile
          node={node}
          content={content}
          editModeEnabled={editModeEnabled}
          canHaveChildren={canHaveChildren}
          showEdit={!!onSave}
          showPublish={!!onPublish}
          showCreateChild={!!onCreate}
          isPublishing={isPublishing}
          onStartEdit={handleStartEdit}
          onPublish={handlePublish}
          onCreateChild={() => setIsCreateDialogOpen(true)}
        />
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

  // Generic node edit form
  if (isEditing) {
    return (
      <div className="inspector-panel" {...touchHandlers}>
        {closeButton}
        <NodeEditForm
          nodeType={node.type}
          formData={formData}
          onFieldChange={handleFieldChange}
          onCancel={handleCancelEdit}
          onSave={handleSave}
          isSaving={isSaving}
          error={error}
        />
      </div>
    );
  }

  // Generic node view
  return (
    <div className="inspector-panel" {...touchHandlers}>
      {closeButton}
      <NodeView
        node={node}
        selectedId={selectedId}
        content={content}
        parentChain={parentChain}
        sectionIcon={sectionIcon}
        editModeEnabled={editModeEnabled}
        hasChildren={hasChildren}
        canDelete={canDelete}
        canHaveChildren={canHaveChildren}
        showEdit={!!onSave}
        showPublish={!!onPublish}
        showDelete={!!onDelete}
        showCreateChild={!!onCreate}
        isPublishing={isPublishing}
        onStartEdit={handleStartEdit}
        onPublish={handlePublish}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onCreateChild={() => setIsCreateDialogOpen(true)}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        nodeName={node.label.split('\n')[0]}
        hasChildren={hasChildren}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isDeleting={isDeleting}
      />

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
