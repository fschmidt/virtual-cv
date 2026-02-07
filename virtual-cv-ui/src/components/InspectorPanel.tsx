import { memo, useRef, useCallback, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import CreateNodeDialog from './CreateNodeDialog';
import NodeViewProfile from './NodeViewProfile';
import NodeEditProfile from './NodeEditProfile';
import NodeView from './NodeView';
import NodeEditForm from './NodeEditForm';
import type { CVNode, CVProfileNode, CVData, CVSection, CVNodeType } from '../types';
import { getParentChain, getSectionIcon } from '../utils/node-utils';
import type { ContentMap, UpdateNodeCommand, CreateNodeCommand } from '../services';
import { setNodeContent } from '../services';
import './InspectorPanel.css';

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 80;

// Local form data type with flat string attributes for UI
interface FormData {
  label?: string;
  description?: string;
  content?: string;
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
  onPublish?: (id: string, publish: boolean) => Promise<void>;
}

function isProfileNode(node: CVNode): node is CVProfileNode {
  return node.type === 'profile';
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
    result.attributes = data.attributes as unknown as UpdateNodeCommand['attributes'];
  }

  return result;
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
  const canDelete = node ? node.type !== 'profile' : false;
  const canHaveChildren = node ? node.type !== 'item' && node.type !== 'skill' : false;

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
      await onPublish(selectedId, node.isDraft ?? false);
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
  if (isProfileNode(node) && isEditing) {
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
  if (isProfileNode(node)) {
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
