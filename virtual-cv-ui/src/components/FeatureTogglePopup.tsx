import { memo, useEffect, useRef } from 'react';
import { Pencil, Bug, FlaskConical, X, LogOut } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import {
  Feature,
  getAllFeatures,
  setFeatureEnabled,
  type FeatureConfig,
} from '../utils/feature-flags';
import { authService, type AuthUser } from '../services/auth.service';

interface FeatureTogglePopupProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser | null;
  onSignOut: () => void;
}

// Icon component for feature items
function FeatureIcon({ icon }: { icon?: FeatureConfig['icon'] }) {
  if (!icon) return null;

  const iconProps = { size: 16, strokeWidth: 2, color: '#a78bfa' };

  switch (icon) {
    case 'edit':
      return <Pencil {...iconProps} />;
    case 'debug':
      return <Bug {...iconProps} />;
    case 'experimental':
      return <FlaskConical {...iconProps} />;
    default:
      return null;
  }
}

function FeatureTogglePopup({ isOpen, onClose, authUser, onSignOut }: FeatureTogglePopupProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const features = getAllFeatures();

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus dialog when opened
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggle = (feature: Feature, currentlyEnabled: boolean) => {
    setFeatureEnabled(feature, !currentlyEnabled);
    // Reload to apply changes
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="feature-toggle-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="feature-toggle-dialog"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="feature-toggle-header">
          <h2>Developer Features</h2>
          <button className="feature-toggle-close" onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="feature-toggle-list">
          {features.map(({ feature, config, enabled }) => (
            <label key={feature} className="feature-toggle-item">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handleToggle(feature, enabled)}
              />
              <div className="feature-toggle-content">
                <span className="feature-toggle-label">
                  {config.icon && <FeatureIcon icon={config.icon} />}
                  {config.label}
                </span>
                <span className="feature-toggle-description">{config.description}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="feature-toggle-divider" />

        <div className="feature-toggle-auth">
          <h3>Authentication</h3>
          {authUser ? (
            <div className="auth-user-info">
              <img src={authUser.picture} alt="" className="auth-avatar" referrerPolicy="no-referrer" />
              <div className="auth-details">
                <span className="auth-name">{authUser.name}</span>
                <span className="auth-email">{authUser.email}</span>
              </div>
              <button className="auth-signout-btn" onClick={onSignOut} title="Sign out">
                <LogOut size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="auth-signin">
              <p className="auth-hint">Sign in to enable editing</p>
              <GoogleLogin
                onSuccess={(response) => {
                  if (response.credential) {
                    authService.handleCredentialResponse(response.credential);
                  }
                }}
                theme="filled_black"
                size="large"
                shape="rectangular"
              />
            </div>
          )}
        </div>

        <div className="feature-toggle-footer">
          <span>Changes require page reload</span>
          <kbd>Ctrl+Shift+D</kbd>
        </div>
      </div>
    </div>
  );
}

export default memo(FeatureTogglePopup);
