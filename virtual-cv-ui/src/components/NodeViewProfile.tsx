import Markdown from 'react-markdown';
import { Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import type { CVProfileNode } from '../types';

interface NodeViewProfileProps {
  node: CVProfileNode;
  content: string | undefined;
  editModeEnabled: boolean;
  canHaveChildren: boolean;
  showEdit: boolean;
  showPublish: boolean;
  showCreateChild: boolean;
  isPublishing: boolean;
  onStartEdit: () => void;
  onPublish: () => void;
  onCreateChild: () => void;
}

function NodeViewProfile({
  node,
  content,
  editModeEnabled,
  canHaveChildren,
  showEdit,
  showPublish,
  showCreateChild,
  isPublishing,
  onStartEdit,
  onPublish,
  onCreateChild,
}: NodeViewProfileProps) {
  return (
    <>
      {editModeEnabled && (showEdit || showPublish) && (
        <div className="inspector-action-buttons">
          {showEdit && (
            <button className="inspector-edit-btn" onClick={onStartEdit} title="Edit">
              <Pencil size={18} strokeWidth={2} color="#a78bfa" />
            </button>
          )}
          {showPublish && (
            <button
              className={`inspector-publish-btn ${node.isDraft ? 'draft' : 'published'}`}
              onClick={onPublish}
              title={node.isDraft ? 'Publish' : 'Unpublish'}
              disabled={isPublishing}
            >
              {node.isDraft ? <Eye size={18} strokeWidth={2} /> : <EyeOff size={18} strokeWidth={2} />}
            </button>
          )}
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

        {editModeEnabled && showCreateChild && canHaveChildren && (
          <button
            className="inspector-add-child-btn"
            onClick={onCreateChild}
          >
            <Plus size={18} strokeWidth={2} />
            Add Child Node
          </button>
        )}
      </div>
    </>
  );
}

export default NodeViewProfile;
