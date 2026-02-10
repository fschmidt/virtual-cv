import { describe, it, expect } from 'vitest';
import { toUpdateNodeCommand } from '../../utils/form-utils';

describe('toUpdateNodeCommand', () => {
  it('maps content field to description for profile nodes', () => {
    const result = toUpdateNodeCommand({
      label: 'Frank Schmidt',
      content: '## About\nSenior developer with 12+ years experience',
      attributes: { name: 'Frank Schmidt' },
    });

    expect(result.description).toBe('## About\nSenior developer with 12+ years experience');
  });

  it('maps content field to description for item nodes', () => {
    const result = toUpdateNodeCommand({
      label: 'Senior Developer',
      description: 'Short desc',
      content: '**2020 - Present**\nWorked on various projects',
      attributes: { company: 'Acme' },
    });

    expect(result.description).toBe('**2020 - Present**\nWorked on various projects');
  });

  it('falls back to description when content is undefined', () => {
    const result = toUpdateNodeCommand({
      label: 'Skills',
      description: 'Technical skills overview',
    });

    expect(result.description).toBe('Technical skills overview');
  });

  it('includes label in the command', () => {
    const result = toUpdateNodeCommand({
      label: 'My Node',
      content: 'Some content',
    });

    expect(result.label).toBe('My Node');
  });

  it('includes attributes when present', () => {
    const result = toUpdateNodeCommand({
      label: 'Test',
      attributes: { company: 'Acme', location: 'Berlin' },
    });

    expect(result.attributes).toEqual({ company: 'Acme', location: 'Berlin' });
  });

  it('omits attributes when empty', () => {
    const result = toUpdateNodeCommand({
      label: 'Test',
      attributes: {},
    });

    expect(result.attributes).toBeUndefined();
  });
});
