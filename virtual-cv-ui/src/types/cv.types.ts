import type { CvNodeDto } from '../api/generated';
import { CvNodeDtoType } from '../api/generated';

// Re-export the API enum as the canonical node type
export type CVNodeType = CvNodeDtoType;
export { CvNodeDtoType };

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

// Decorator interface: narrows CvNodeDto fields that the API guarantees are non-null.
// Uses Omit for `attributes` because Orval generates a doubly-nested map type
// ({[key: string]: {[key: string]: unknown}}) for Jackson's Map<String,Object>,
// but the actual runtime data is a flat map.
export interface CVNode extends Omit<CvNodeDto, 'attributes'> {
  id: string;
  type: CvNodeDtoType;
  label: string;
  attributes?: Record<string, unknown>;
}

export interface CVData {
  nodes: CVNode[];
}

// ── Typed attribute accessors (decorator pattern) ──

function attrs(node: CVNode): Record<string, unknown> {
  return (node.attributes as Record<string, unknown> | undefined) ?? {};
}

export function profileAttrs(node: CVNode) {
  const a = attrs(node);
  return {
    name: (a.name as string) ?? node.label,
    title: (a.title as string) ?? '',
    subtitle: (a.subtitle as string) ?? '',
    experience: (a.experience as string) ?? '',
    email: (a.email as string) ?? '',
    location: (a.location as string) ?? '',
    photoUrl: (a.photoUrl as string) ?? '',
  };
}

export function categoryAttrs(node: CVNode) {
  const a = attrs(node);
  return {
    sectionId: (a.sectionId as CVSectionId) ?? (node.id as CVSectionId),
  };
}

export function itemAttrs(node: CVNode) {
  const a = attrs(node);
  return {
    company: a.company as string | undefined,
    dateRange: a.dateRange as string | undefined,
    location: a.location as string | undefined,
    highlights: a.highlights as string[] | undefined,
    technologies: a.technologies as string[] | undefined,
  };
}

export function skillAttrs(node: CVNode) {
  const a = attrs(node);
  return {
    proficiencyLevel: a.proficiencyLevel as string | undefined,
    yearsOfExperience: a.yearsOfExperience as number | undefined,
  };
}

export function isDraft(node: CVNode): boolean {
  return (attrs(node).isDraft as boolean) ?? false;
}
