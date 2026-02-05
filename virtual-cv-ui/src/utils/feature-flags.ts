/**
 * Feature toggle system with localStorage persistence and URL param override.
 *
 * Usage:
 * - Check if enabled: isFeatureEnabled(Feature.EDIT_MODE)
 * - Toggle via popup: setFeatureEnabled(Feature.EDIT_MODE, true)
 * - URL override: ?features=editMode,otherFeature
 */

export const Feature = {
  EDIT_MODE: 'editMode',
  // Future features can be added here
} as const;

export type Feature = (typeof Feature)[keyof typeof Feature];

export interface FeatureConfig {
  label: string;
  description: string;
  icon?: 'edit' | 'debug' | 'experimental'; // Icon type for the feature
}

export const FEATURE_CONFIG: Record<Feature, FeatureConfig> = {
  [Feature.EDIT_MODE]: {
    label: 'Edit Mode',
    description: 'Enable inline editing of CV nodes',
    icon: 'edit',
  },
};

const STORAGE_KEY = 'virtual-cv-features';

/**
 * Check if a feature is enabled.
 * Priority: URL param > localStorage > default (false)
 */
export function isFeatureEnabled(feature: Feature): boolean {
  // URL param override for dev/testing (?features=editMode,otherFeature)
  const urlParams = new URLSearchParams(window.location.search);
  const urlFeatures = urlParams.get('features')?.split(',') || [];
  if (urlFeatures.includes(feature)) {
    return true;
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const features: string[] = JSON.parse(stored);
      return features.includes(feature);
    }
  } catch {
    // localStorage not available or parse error
  }

  return false;
}

/**
 * Enable or disable a feature (persists to localStorage).
 */
export function setFeatureEnabled(feature: Feature, enabled: boolean): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const features: string[] = stored ? JSON.parse(stored) : [];

    if (enabled && !features.includes(feature)) {
      features.push(feature);
    } else if (!enabled) {
      const index = features.indexOf(feature);
      if (index > -1) {
        features.splice(index, 1);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
  } catch {
    // localStorage not available
  }
}

/**
 * Get the current state of all features.
 */
export function getAllFeatureStates(): Record<Feature, boolean> {
  return Object.values(Feature).reduce(
    (acc, f) => {
      acc[f as Feature] = isFeatureEnabled(f as Feature);
      return acc;
    },
    {} as Record<Feature, boolean>
  );
}

/**
 * Get all available features with their config and current state.
 */
export function getAllFeatures(): Array<{
  feature: Feature;
  config: FeatureConfig;
  enabled: boolean;
}> {
  return Object.values(Feature).map((feature) => ({
    feature: feature as Feature,
    config: FEATURE_CONFIG[feature as Feature],
    enabled: isFeatureEnabled(feature as Feature),
  }));
}
