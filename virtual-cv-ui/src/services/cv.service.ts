import type { CVData, CVNode, CVNodeType } from '../types';
import {
  getAllNodes,
  search,
  updateNode as apiUpdateNode,
  deleteNode as apiDeleteNode,
  createCategory as apiCreateCategory,
  createItem as apiCreateItem,
  createSkillGroup as apiCreateSkillGroup,
  createSkill as apiCreateSkill,
  createProfile as apiCreateProfile,
  CvNodeDtoType,
} from '../api/generated';
import type {
  CreateCategoryCommand,
  CreateItemCommand,
  CreateSkillGroupCommand,
  CreateSkillCommand,
  CreateProfileCommand,
  UpdateNodeCommand,
} from '../api/generated';

// Union type for create commands
export type CreateNodeCommand =
  | CreateCategoryCommand
  | CreateItemCommand
  | CreateSkillGroupCommand
  | CreateSkillCommand
  | CreateProfileCommand;

// Service interface
export interface CVService {
  getCVData(): Promise<CVData>;
  getNode(id: string): Promise<CVNode | undefined>;
  getChildren(parentId: string): Promise<CVNode[]>;
  searchNodes(query: string): Promise<CVNode[]>;
  updateNode(id: string, updates: UpdateNodeCommand): Promise<CVNode>;
  deleteNode(id: string): Promise<void>;
  createNode(type: CVNodeType, data: CreateNodeCommand): Promise<CVNode>;
  clearCache(): void;
}

// Re-export UpdateNodeCommand for consumers
export type { UpdateNodeCommand };

// Real API implementation
class ApiCVService implements CVService {
  private cachedData: CVData | null = null;

  async getCVData(): Promise<CVData> {
    if (this.cachedData) {
      return this.cachedData;
    }

    const response = await getAllNodes();
    const nodes = (response.data.nodes ?? []) as CVNode[];
    this.cachedData = { nodes };
    return this.cachedData;
  }

  async getNode(id: string): Promise<CVNode | undefined> {
    const data = await this.getCVData();
    return data.nodes.find((n) => n.id === id);
  }

  async getChildren(parentId: string): Promise<CVNode[]> {
    const data = await this.getCVData();
    return data.nodes.filter((n) => n.parentId === parentId);
  }

  async searchNodes(query: string): Promise<CVNode[]> {
    const response = await search({ q: query });
    return (response.data ?? []) as CVNode[];
  }

  async updateNode(id: string, updates: UpdateNodeCommand): Promise<CVNode> {
    const response = await apiUpdateNode(id, { ...updates, id });
    this.clearCache();
    return response.data as CVNode;
  }

  async deleteNode(id: string): Promise<void> {
    await apiDeleteNode(id);
    this.clearCache();
  }

  async createNode(type: CVNodeType, data: CreateNodeCommand): Promise<CVNode> {
    let response;
    switch (type) {
      case CvNodeDtoType.CATEGORY:
        response = await apiCreateCategory(data as CreateCategoryCommand);
        break;
      case CvNodeDtoType.ITEM:
        response = await apiCreateItem(data as CreateItemCommand);
        break;
      case CvNodeDtoType.SKILL_GROUP:
        response = await apiCreateSkillGroup(data as CreateSkillGroupCommand);
        break;
      case CvNodeDtoType.SKILL:
        response = await apiCreateSkill(data as CreateSkillCommand);
        break;
      case CvNodeDtoType.PROFILE:
        response = await apiCreateProfile(data as CreateProfileCommand);
        break;
    }
    this.clearCache();
    return response.data as CVNode;
  }

  clearCache(): void {
    this.cachedData = null;
  }
}

// Export singleton instance
export const cvService: CVService = new ApiCVService();

// Factory for testing
export function createCVService(): CVService {
  return new ApiCVService();
}
