import { describe, it, expect } from 'vitest';
import { toUpdateNodeCommand } from '../../utils/form-utils';

describe('toUpdateNodeCommand', () => {
  it('maps markdownContent field for profile nodes', () => {
    const result = toUpdateNodeCommand({
      label: 'Frank Schmidt',
      markdownContent: '## About\nSenior developer with 12+ years experience',
      attributes: { name: 'Frank Schmidt' },
    });

    expect(result.markdownContent).toBe('## About\nSenior developer with 12+ years experience');
  });

  it('maps markdownContent field for item nodes', () => {
    const result = toUpdateNodeCommand({
      label: 'Senior Developer',
      markdownContent: '**2020 - Present**\nWorked on various projects',
      attributes: { company: 'Acme' },
    });

    expect(result.markdownContent).toBe('**2020 - Present**\nWorked on various projects');
  });

  it('passes through undefined markdownContent', () => {
    const result = toUpdateNodeCommand({
      label: 'Skills',
    });

    expect(result.markdownContent).toBeUndefined();
  });

  it('includes label in the command', () => {
    const result = toUpdateNodeCommand({
      label: 'My Node',
      markdownContent: 'Some content',
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
