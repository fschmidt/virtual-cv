import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { ToastProvider } from '../../components/Toast';
import type { ReactNode } from 'react';

// Track setNodeContent calls to verify content propagation
const mockSetNodeContent = vi.fn();
const contentStore: Record<string, string> = {};

vi.mock('../../services', () => ({
  cvService: {
    getCVData: vi.fn().mockResolvedValue({ nodes: [], positions: [] }),
    updateNode: vi.fn().mockResolvedValue({}),
    deleteNode: vi.fn(),
    createNode: vi.fn(),
    clearCache: vi.fn(),
  },
  buildNodes: vi.fn().mockReturnValue([]),
  buildEdges: vi.fn().mockReturnValue([]),
  getAllContent: () => ({ ...contentStore }),
  setNodeContent: (...args: unknown[]) => {
    mockSetNodeContent(...args);
    const [id, content] = args as [string, string];
    if (content?.trim()) {
      contentStore[id] = content;
    } else {
      delete contentStore[id];
    }
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ReactFlowProvider>
        {children}
      </ReactFlowProvider>
    </ToastProvider>
  );
}

describe('useGraphState - onSaveNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear content store
    for (const key of Object.keys(contentStore)) {
      delete contentStore[key];
    }
  });

  it('propagates content to content map when saving', async () => {
    const { useGraphState } = await import('../useGraphState');

    const { result } = renderHook(
      () => useGraphState({ editMode: false, viewMode: 'graph', onAddChild: vi.fn() }),
      { wrapper },
    );

    await act(async () => {
      await result.current.onSaveNode('test-node', { label: 'Test' }, '## Updated content');
    });

    expect(mockSetNodeContent).toHaveBeenCalledWith('test-node', '## Updated content');
    // Content should be in the map BEFORE getAllContent is called (for React state)
    expect(contentStore['test-node']).toBe('## Updated content');
  });

  it('does not create content entry when saving without content', async () => {
    const { useGraphState } = await import('../useGraphState');

    const { result } = renderHook(
      () => useGraphState({ editMode: false, viewMode: 'graph', onAddChild: vi.fn() }),
      { wrapper },
    );

    await act(async () => {
      await result.current.onSaveNode('test-node', { label: 'Test' });
    });

    expect(mockSetNodeContent).not.toHaveBeenCalled();
    expect(contentStore['test-node']).toBeUndefined();
  });
});
