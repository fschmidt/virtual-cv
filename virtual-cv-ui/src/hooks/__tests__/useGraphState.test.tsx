import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { ToastProvider } from '../../components/Toast';
import type { ReactNode } from 'react';
import type { CVData } from '../../types';

const mockUpdateNode = vi.fn().mockResolvedValue({});
const mockGetCVData = vi.fn<() => Promise<CVData>>();

vi.mock('../../services', () => ({
  cvService: {
    getCVData: (...args: unknown[]) => mockGetCVData(...(args as [])),
    updateNode: (...args: unknown[]) => mockUpdateNode(...(args as [])),
    deleteNode: vi.fn(),
    createNode: vi.fn(),
    clearCache: vi.fn(),
  },
  buildNodes: vi.fn().mockReturnValue([]),
  buildEdges: vi.fn().mockReturnValue([]),
  buildContentMap: (data: CVData) => {
    const map: Record<string, string> = {};
    for (const node of data.nodes) {
      if (node.markdownContent) map[node.id] = node.markdownContent;
    }
    return map;
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

const emptyData: CVData = { nodes: [] };

describe('useGraphState - onSaveNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCVData.mockResolvedValue(emptyData);
  });

  it('reloads data from backend after saving', async () => {
    const { useGraphState } = await import('../useGraphState');

    const { result } = renderHook(
      () => useGraphState({ editMode: false, viewMode: 'graph', onAddChild: vi.fn() }),
      { wrapper },
    );

    await act(async () => {
      await result.current.onSaveNode('test-node', { label: 'Test', markdownContent: '## Updated' });
    });

    expect(mockUpdateNode).toHaveBeenCalledWith('test-node', { label: 'Test', markdownContent: '## Updated' });
    // getCVData called on mount + after save
    expect(mockGetCVData).toHaveBeenCalledTimes(2);
  });

  it('derives contentMap from backend data after save', async () => {
    const updatedData: CVData = {
      nodes: [
        { id: 'test-node', type: 'CATEGORY', parentId: undefined, label: 'Test', markdownContent: '## Updated content', attributes: { sectionId: 'work' } },
      ],
    };
    // First call (mount): empty, second call (after save): updated
    mockGetCVData.mockResolvedValueOnce(emptyData).mockResolvedValueOnce(updatedData);

    const { useGraphState } = await import('../useGraphState');

    const { result } = renderHook(
      () => useGraphState({ editMode: false, viewMode: 'graph', onAddChild: vi.fn() }),
      { wrapper },
    );

    await act(async () => {
      await result.current.onSaveNode('test-node', { label: 'Test', markdownContent: '## Updated content' });
    });

    await waitFor(() => {
      expect(result.current.contentMap).toEqual({ 'test-node': '## Updated content' });
    });
  });
});
