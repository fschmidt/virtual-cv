import Markdown from 'react-markdown';
import { Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import type { CVNode } from '../types';
import { profileAttrs, isDraft } from '../types';

interface NodeViewProfileProps {
  node: CVNode;
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
  const p = profileAttrs(node);
  const draft = isDraft(node);

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
              className={`inspector-publish-btn ${draft ? 'draft' : 'published'}`}
              onClick={onPublish}
              title={draft ? 'Publish' : 'Unpublish'}
              disabled={isPublishing}
            >
              {draft ? <Eye size={18} strokeWidth={2} /> : <EyeOff size={18} strokeWidth={2} />}
            </button>
          )}
        </div>
      )}
      <div className="inspector-profile">
        <div className="inspector-profile-photo">
          <img src={p.photoUrl} alt={p.name} />
        </div>
        <h1 className="inspector-profile-name">{p.name}</h1>
        <h2 className="inspector-profile-title">{p.title}</h2>
        <p className="inspector-profile-subtitle">{p.subtitle}</p>
        <div className="inspector-profile-details">
          <span className="inspector-experience">{p.experience}</span>
          <span className="inspector-location">{p.location}</span>
          <span className="inspector-email">{p.email}</span>
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
