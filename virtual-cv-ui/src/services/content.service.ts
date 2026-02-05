import cvContentRaw from '../content/cv-content.md?raw';

export type ContentMap = Record<string, string>;

/**
 * Parse markdown content file into sections by node ID.
 * Sections are delimited by h1 headers (# node-id).
 */
function parseMarkdownSections(markdown: string): ContentMap {
  const contentMap: ContentMap = {};

  // Split by h1 headers, keeping the header text
  const sections = markdown.split(/^# /m);

  for (const section of sections) {
    if (!section.trim()) continue;

    // First line is the node ID, rest is content
    const lines = section.split('\n');
    const nodeId = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    if (nodeId && content) {
      contentMap[nodeId] = content;
    }
  }

  return contentMap;
}

// Parse content on module load (mutable for runtime updates)
let contentMap = parseMarkdownSections(cvContentRaw);

/**
 * Get markdown content for a specific node ID.
 */
export function getNodeContent(nodeId: string): string | undefined {
  return contentMap[nodeId];
}

/**
 * Get all parsed content as a map.
 */
export function getAllContent(): ContentMap {
  return { ...contentMap };
}

/**
 * Update content for a specific node ID (runtime only, not persisted to file).
 */
export function setNodeContent(nodeId: string, content: string): void {
  if (content.trim()) {
    contentMap[nodeId] = content;
  } else {
    delete contentMap[nodeId];
  }
}

/**
 * Merge new content into the content map (used after API updates).
 */
export function mergeContent(updates: ContentMap): void {
  contentMap = { ...contentMap, ...updates };
}

/**
 * Reset content map to initial state from file.
 */
export function resetContent(): void {
  contentMap = parseMarkdownSections(cvContentRaw);
}
