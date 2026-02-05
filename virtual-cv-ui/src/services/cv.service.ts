import type {
  CVData,
  CVNode,
  CVProfileNode,
  CVCategoryNode,
  CVItemNode,
  CVSkillGroupNode,
  CVSkillNode,
  CVNodeType,
  CVSectionId,
  NodePosition,
} from '../types';
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
} from '../api/generated';
import type { CvNodeDto, UpdateNodeCommand } from '../api/generated';

// Map API node type to frontend node type
function mapNodeType(apiType: CvNodeDtoType): CVNodeType {
  const mapping: Record<CvNodeDtoType, CVNodeType> = {
    PROFILE: 'profile',
    CATEGORY: 'category',
    ITEM: 'item',
    SKILL_GROUP: 'skill-group',
    SKILL: 'skill',
  };
  return mapping[apiType];
}

// Extract attribute safely
function attr<T>(attributes: Record<string, unknown> | undefined, key: string): T | undefined {
  return attributes?.[key] as T | undefined;
}

// Map API node to frontend node based on type
function mapApiNodeToFrontend(dto: CvNodeDto): CVNode {
  const type = mapNodeType(dto.type!);
  const attributes = dto.attributes as Record<string, unknown> | undefined;

  const base = {
    id: dto.id!,
    parentId: dto.parentId ?? null,
    label: dto.label ?? '',
    description: dto.description,
  };

  switch (type) {
    case 'profile':
      return {
        ...base,
        type: 'profile',
        name: attr<string>(attributes, 'name') ?? dto.label ?? '',
        title: attr<string>(attributes, 'title') ?? '',
        subtitle: attr<string>(attributes, 'subtitle') ?? '',
        experience: attr<string>(attributes, 'experience') ?? '',
        email: attr<string>(attributes, 'email') ?? '',
        location: attr<string>(attributes, 'location') ?? '',
        photoUrl: attr<string>(attributes, 'photoUrl') ?? '',
      } as CVProfileNode;

    case 'category':
      return {
        ...base,
        type: 'category',
        sectionId: (attr<string>(attributes, 'sectionId') ?? dto.id) as CVSectionId,
      } as CVCategoryNode;

    case 'item':
      return {
        ...base,
        type: 'item',
        company: attr<string>(attributes, 'company'),
        dateRange: attr<string>(attributes, 'dateRange'),
        location: attr<string>(attributes, 'location'),
        highlights: attr<string[]>(attributes, 'highlights'),
        technologies: attr<string[]>(attributes, 'technologies'),
      } as CVItemNode;

    case 'skill-group':
      return {
        ...base,
        type: 'skill-group',
        proficiencyLevel: attr<CVSkillGroupNode['proficiencyLevel']>(attributes, 'proficiencyLevel'),
      } as CVSkillGroupNode;

    case 'skill':
      return {
        ...base,
        type: 'skill',
        proficiencyLevel: attr<CVSkillNode['proficiencyLevel']>(attributes, 'proficiencyLevel'),
        yearsOfExperience: attr<number>(attributes, 'yearsOfExperience'),
      } as CVSkillNode;
  }
}

// Map API response to CVData with positions
function mapApiResponse(nodes: CvNodeDto[]): CVData {
  const cvNodes: CVNode[] = nodes.map(mapApiNodeToFrontend);

  const positions: NodePosition[] = nodes
    .filter((n) => n.positionX != null && n.positionY != null)
    .map((n) => ({
      nodeId: n.id!,
      x: n.positionX!,
      y: n.positionY!,
    }));

  return { nodes: cvNodes, positions };
}

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
    const nodes = response.data.nodes ?? [];
    this.cachedData = mapApiResponse(nodes);
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
    return (response.data ?? []).map(mapApiNodeToFrontend);
  }

  async updateNode(id: string, updates: UpdateNodeCommand): Promise<CVNode> {
    // Backend requires id in request body to match path variable
    const response = await apiUpdateNode(id, { ...updates, id });
    this.clearCache(); // Invalidate cache after update
    return mapApiNodeToFrontend(response.data);
  }

  async deleteNode(id: string): Promise<void> {
    await apiDeleteNode(id);
    this.clearCache();
  }

  async createNode(type: CVNodeType, data: CreateNodeCommand): Promise<CVNode> {
    let response;
    switch (type) {
      case 'category':
        response = await apiCreateCategory(data as CreateCategoryCommand);
        break;
      case 'item':
        response = await apiCreateItem(data as CreateItemCommand);
        break;
      case 'skill-group':
        response = await apiCreateSkillGroup(data as CreateSkillGroupCommand);
        break;
      case 'skill':
        response = await apiCreateSkill(data as CreateSkillCommand);
        break;
      case 'profile':
        response = await apiCreateProfile(data as CreateProfileCommand);
        break;
    }
    this.clearCache();
    return mapApiNodeToFrontend(response.data);
  }

  // Clear cache to force reload
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
