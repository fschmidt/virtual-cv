import { describe, it, expect } from 'vitest'
import { computeNodeState, buildNodes, buildEdges } from '../cv.mapper'
import type { CVNode, CVData } from '../../types'

// Minimal node fixtures
const profileNode: CVNode = {
  id: 'profile',
  type: 'profile',
  parentId: null,
  label: 'Profile',
  name: 'Test User',
  title: 'Engineer',
  subtitle: 'Full Stack',
  experience: '5 years',
  email: 'test@example.com',
  location: 'Berlin',
  photoUrl: '/photo.jpg',
}

const workCategory: CVNode = {
  id: 'work',
  type: 'category',
  parentId: 'profile',
  label: 'Work Experience',
  sectionId: 'work',
}

const skillsCategory: CVNode = {
  id: 'skills',
  type: 'category',
  parentId: 'profile',
  label: 'Technical Skills',
  sectionId: 'skills',
}

const jobItem: CVNode = {
  id: 'job-1',
  type: 'item',
  parentId: 'work',
  label: 'Software Engineer',
  company: 'Acme Corp',
  dateRange: '2020-2024',
}

const draftItem: CVNode = {
  id: 'draft-1',
  type: 'item',
  parentId: 'work',
  label: 'Draft Job',
  isDraft: true,
}

const allNodes: CVNode[] = [profileNode, workCategory, skillsCategory, jobItem, draftItem]

const cvData: CVData = {
  nodes: allNodes,
  positions: [
    { nodeId: 'profile', x: 0, y: 0 },
    { nodeId: 'work', x: 200, y: -100 },
    { nodeId: 'skills', x: 200, y: 100 },
    { nodeId: 'job-1', x: 400, y: -100 },
    { nodeId: 'draft-1', x: 400, y: 0 },
  ],
}

describe('computeNodeState', () => {
  it('returns detailed for profile when nothing selected', () => {
    expect(computeNodeState('profile', null, allNodes)).toBe('detailed')
  })

  it('returns quickview for profile when nothing selected in inspector mode', () => {
    expect(computeNodeState('profile', null, allNodes, true)).toBe('quickview')
  })

  it('returns quickview for direct children of profile when nothing selected', () => {
    expect(computeNodeState('work', null, allNodes)).toBe('quickview')
    expect(computeNodeState('skills', null, allNodes)).toBe('quickview')
  })

  it('returns dormant for grandchildren when nothing selected', () => {
    expect(computeNodeState('job-1', null, allNodes)).toBe('dormant')
  })

  it('returns detailed for the selected node', () => {
    expect(computeNodeState('work', 'work', allNodes)).toBe('detailed')
  })

  it('returns quickview for selected node in inspector mode', () => {
    expect(computeNodeState('work', 'work', allNodes, true)).toBe('quickview')
  })

  it('returns quickview for children of selected node', () => {
    expect(computeNodeState('job-1', 'work', allNodes)).toBe('quickview')
  })

  it('returns quickview for ancestors of selected node', () => {
    expect(computeNodeState('profile', 'work', allNodes)).toBe('quickview')
  })

  it('returns dormant for unrelated nodes', () => {
    expect(computeNodeState('skills', 'work', allNodes)).toBe('dormant')
  })
})

describe('buildNodes', () => {
  it('filters out draft nodes when edit mode is disabled', () => {
    const nodes = buildNodes(cvData, null)
    const ids = nodes.map((n) => n.id)
    expect(ids).not.toContain('draft-1')
    expect(ids).toContain('job-1')
  })

  it('includes draft nodes when edit mode is enabled', () => {
    const nodes = buildNodes(cvData, null, undefined, false, true)
    const ids = nodes.map((n) => n.id)
    expect(ids).toContain('draft-1')
  })

  it('creates React Flow nodes with correct structure', () => {
    const nodes = buildNodes(cvData, 'work')
    const workNode = nodes.find((n) => n.id === 'work')
    expect(workNode).toBeDefined()
    expect(workNode!.type).toBe('graphNode')
    expect(workNode!.data.label).toBe('Work Experience')
    expect(workNode!.data.nodeType).toBe('category')
    expect(workNode!.data.state).toBe('detailed')
  })

  it('uses saved positions from backend', () => {
    const nodes = buildNodes(cvData, null)
    const workNode = nodes.find((n) => n.id === 'work')
    expect(workNode!.position).toEqual({ x: 200, y: -100 })
  })

  it('makes nodes draggable only in edit mode', () => {
    const noEdit = buildNodes(cvData, null)
    const edit = buildNodes(cvData, null, undefined, false, true)
    expect(noEdit[0].draggable).toBe(false)
    expect(edit[0].draggable).toBe(true)
  })

  it('maps profile node data correctly', () => {
    const nodes = buildNodes(cvData, 'profile')
    const profile = nodes.find((n) => n.id === 'profile')
    expect(profile!.data.name).toBe('Test User')
    expect(profile!.data.email).toBe('test@example.com')
  })
})

describe('buildEdges', () => {
  it('creates edges for parent-child relationships', () => {
    const edges = buildEdges(cvData, null)
    expect(edges.some((e) => e.source === 'profile' && e.target === 'work')).toBe(true)
    expect(edges.some((e) => e.source === 'work' && e.target === 'job-1')).toBe(true)
  })

  it('excludes edges for draft nodes when edit mode is off', () => {
    const edges = buildEdges(cvData, null)
    expect(edges.some((e) => e.target === 'draft-1')).toBe(false)
  })

  it('includes edges for draft nodes when edit mode is on', () => {
    const edges = buildEdges(cvData, null, true)
    expect(edges.some((e) => e.target === 'draft-1')).toBe(true)
  })

  it('assigns correct edge classes based on node visibility', () => {
    const edges = buildEdges(cvData, 'work')
    const profileToWork = edges.find((e) => e.source === 'profile' && e.target === 'work')
    expect(profileToWork!.className).toBe('edge-active')

    const profileToSkills = edges.find((e) => e.source === 'profile' && e.target === 'skills')
    expect(profileToSkills!.className).toBe('edge-partial')
  })
})
