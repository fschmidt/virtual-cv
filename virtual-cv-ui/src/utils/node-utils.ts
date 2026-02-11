import { CvNodeDtoType } from '../api/generated';
import type { CVNode, CVNodeType, CVSection } from '../types';
import { categoryAttrs } from '../types';

/** Human-readable label for a node type */
export function getNodeTypeLabel(type: CVNodeType): string {
  switch (type) {
    case CvNodeDtoType.PROFILE:
      return 'Profile';
    case CvNodeDtoType.CATEGORY:
      return 'Category';
    case CvNodeDtoType.ITEM:
      return 'Item';
    case CvNodeDtoType.SKILL_GROUP:
      return 'Skill Group';
    case CvNodeDtoType.SKILL:
      return 'Skill';
  }
}

/** Get parent chain for breadcrumb navigation */
export function getParentChain(nodeId: string, nodes: CVNode[]): CVNode[] {
  const chain: CVNode[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (node) {
      chain.unshift(node);
      currentId = node.parentId ?? null;
    } else {
      break;
    }
  }

  return chain;
}

/** Get section icon for a node by walking up to its category ancestor */
export function getSectionIcon(node: CVNode, nodes: CVNode[], sections: CVSection[]): string | null {
  let current: CVNode | undefined = node;
  while (current && current.type !== CvNodeDtoType.CATEGORY) {
    current = nodes.find((n) => n.id === current?.parentId);
  }

  if (current?.type === CvNodeDtoType.CATEGORY) {
    const c = categoryAttrs(current);
    const section = sections.find((s) => s.id === c.sectionId);
    return section?.icon || null;
  }

  return null;
}
