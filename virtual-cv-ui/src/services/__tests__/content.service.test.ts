import { describe, it, expect } from 'vitest';
import { buildContentMap } from '../content.service';
import type { CVData } from '../../types';

describe('buildContentMap', () => {
  it('maps node markdownContent by ID', () => {
    const cvData: CVData = {
      nodes: [
        { id: 'profile', type: 'PROFILE', label: 'Me', markdownContent: '## About\nSome bio', attributes: { name: 'Me', title: '', subtitle: '', experience: '', email: '', location: '', photoUrl: '' } },
        { id: 'work', type: 'CATEGORY', parentId: 'profile', label: 'Work', markdownContent: 'Work experience', attributes: { sectionId: 'work' } },
      ],
    };

    const result = buildContentMap(cvData);
    expect(result).toEqual({
      profile: '## About\nSome bio',
      work: 'Work experience',
    });
  });

  it('skips nodes without markdownContent', () => {
    const cvData: CVData = {
      nodes: [
        { id: 'skills', type: 'CATEGORY', parentId: 'profile', label: 'Skills', attributes: { sectionId: 'skills' } },
      ],
    };

    const result = buildContentMap(cvData);
    expect(result).toEqual({});
  });

  it('returns empty map for empty nodes', () => {
    const result = buildContentMap({ nodes: [] });
    expect(result).toEqual({});
  });
});
