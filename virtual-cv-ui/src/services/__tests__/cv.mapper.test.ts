import { describe, it, expect } from 'vitest'
import { computeNodeState, buildNodes, buildEdges } from '../cv.mapper'
import type { CVNode, CVData } from '../../types'

// Minimal node fixtures using the new decorator model (CvNodeDtoType enum values)
const profileNode: CVNode = {
  id: 'profile',
  type: 'PROFILE',
  parentId: undefined,
  label: 'Profile',
  attributes: {
    name: 'Test User',
    title: 'Engineer',
    subtitle: 'Full Stack',
    experience: '5 years',
    email: 'test@example.com',
    location: 'Berlin',
    photoUrl: '/photo.jpg',
  },
  positionX: 0,
  positionY: 0,
}

const workCategory: CVNode = {
  id: 'work',
  type: 'CATEGORY',
  parentId: 'profile',
  label: 'Work Experience',
  attributes: { sectionId: 'work' },
  positionX: 200,
  positionY: -100,
}

const skillsCategory: CVNode = {
  id: 'skills',
  type: 'CATEGORY',
  parentId: 'profile',
  label: 'Technical Skills',
  attributes: { sectionId: 'skills' },
  positionX: 200,
  positionY: 100,
}

const jobItem: CVNode = {
  id: 'job-1',
  type: 'ITEM',
  parentId: 'work',
  label: 'Software Engineer',
  attributes: { company: 'Acme Corp', dateRange: '2020-2024' },
  positionX: 400,
  positionY: -100,
}

const draftItem: CVNode = {
  id: 'draft-1',
  type: 'ITEM',
  parentId: 'work',
  label: 'Draft Job',
  attributes: { isDraft: true },
  positionX: 400,
  positionY: 0,
}

const allNodes: CVNode[] = [profileNode, workCategory, skillsCategory, jobItem, draftItem]

const cvData: CVData = {
  nodes: allNodes,
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
    expect(workNode!.data.nodeType).toBe('CATEGORY')
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
