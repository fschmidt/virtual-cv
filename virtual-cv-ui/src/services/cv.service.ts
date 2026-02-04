import type { CVData, CVNode } from '../types';
import { cvData } from '../data/cv-content';

// Service interface (matches future real API)
export interface CVService {
  getCVData(): Promise<CVData>;
  getNode(id: string): Promise<CVNode | undefined>;
  getChildren(parentId: string): Promise<CVNode[]>;
  searchNodes(query: string): Promise<CVNode[]>;
}

// Mock implementation using local data
class MockCVService implements CVService {
  private data: CVData;

  constructor(data: CVData) {
    this.data = data;
  }

  async getCVData(): Promise<CVData> {
    // Simulate network delay (useful for testing loading states)
    // await new Promise(resolve => setTimeout(resolve, 100));
    return this.data;
  }

  async getNode(id: string): Promise<CVNode | undefined> {
    return this.data.nodes.find((n) => n.id === id);
  }

  async getChildren(parentId: string): Promise<CVNode[]> {
    return this.data.nodes.filter((n) => n.parentId === parentId);
  }

  async searchNodes(query: string): Promise<CVNode[]> {
    const lowerQuery = query.toLowerCase();
    return this.data.nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(lowerQuery) ||
        n.description?.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton instance
export const cvService: CVService = new MockCVService(cvData);

// Factory for testing or switching implementations
export function createCVService(data?: CVData): CVService {
  return new MockCVService(data ?? cvData);
}
