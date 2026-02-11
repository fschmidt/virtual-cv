import type { CVData } from '../types';

export type ContentMap = Record<string, string>;

/**
 * Build a content map from CV node markdown content.
 * Maps node ID → markdownContent for all nodes that have content.
 */
export function buildContentMap(cvData: CVData): ContentMap {
  const contentMap: ContentMap = {};
  for (const node of cvData.nodes) {
    if (node.markdownContent) {
      contentMap[node.id] = node.markdownContent;
    }
  }
  return contentMap;
}
