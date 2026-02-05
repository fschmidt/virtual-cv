// Node types in the CV graph
export type CVNodeType = 'profile' | 'category' | 'item' | 'skill-group' | 'skill';

// Section IDs for standard CV view
export type CVSectionId = 'work' | 'skills' | 'education' | 'languages';

// Section configuration for standard CV view
export interface CVSection {
  id: CVSectionId;
  label: string;
  icon: string;
  order: number;
}

// Predefined sections with icons
export const CV_SECTIONS: CVSection[] = [
  { id: 'work', label: 'Work Experience', icon: 'briefcase', order: 1 },
  { id: 'skills', label: 'Technical Skills', icon: 'code', order: 2 },
  { id: 'education', label: 'Education', icon: 'graduation-cap', order: 3 },
  { id: 'languages', label: 'Languages', icon: 'globe', order: 4 },
];

// Base interface for all CV nodes
export interface CVNodeBase {
  id: string;
  type: CVNodeType;
  parentId: string | null;
  label: string;
  description?: string;
  tags?: string[];
  isDraft?: boolean;
}

// Profile node - the central business card
export interface CVProfileNode extends CVNodeBase {
  type: 'profile';
  name: string;
  title: string;
  subtitle: string;
  experience: string;
  email: string;
  location: string;
  photoUrl: string;
}

// Category nodes - top-level groupings
export interface CVCategoryNode extends CVNodeBase {
  type: 'category';
  sectionId: CVSectionId;
}

// Work/Education items
export interface CVItemNode extends CVNodeBase {
  type: 'item';
  company?: string;
  dateRange?: string;
  location?: string;
  highlights?: string[];
  technologies?: string[];
}

// Skill groups
export interface CVSkillGroupNode extends CVNodeBase {
  type: 'skill-group';
  proficiencyLevel?: 'expert' | 'advanced' | 'intermediate' | 'beginner';
}

// Individual skills
export interface CVSkillNode extends CVNodeBase {
  type: 'skill';
  proficiencyLevel?: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  yearsOfExperience?: number;
}

// Union type for all CV nodes
export type CVNode = CVProfileNode | CVCategoryNode | CVItemNode | CVSkillGroupNode | CVSkillNode;

// Position data (separate from content)
export interface NodePosition {
  nodeId: string;
  x: number;
  y: number;
}

// Complete CV data structure
export interface CVData {
  nodes: CVNode[];
  positions: NodePosition[];
}
