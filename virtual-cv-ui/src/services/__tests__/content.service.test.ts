import { describe, it, expect, beforeEach } from 'vitest'
import { getNodeContent, getAllContent, setNodeContent, mergeContent, resetContent } from '../content.service'

describe('content.service', () => {
  beforeEach(() => {
    resetContent()
  })

  it('getAllContent returns a content map', () => {
    const content = getAllContent()
    expect(typeof content).toBe('object')
  })

  it('getNodeContent returns undefined for non-existent node', () => {
    expect(getNodeContent('non-existent-id')).toBeUndefined()
  })

  it('setNodeContent adds content at runtime', () => {
    setNodeContent('test-node', 'Hello world')
    expect(getNodeContent('test-node')).toBe('Hello world')
  })

  it('setNodeContent removes content when given empty string', () => {
    setNodeContent('test-node', 'Some content')
    setNodeContent('test-node', '')
    expect(getNodeContent('test-node')).toBeUndefined()
  })

  it('mergeContent adds new entries without overwriting unrelated ones', () => {
    setNodeContent('existing', 'Keep me')
    mergeContent({ merged: 'New content' })
    expect(getNodeContent('existing')).toBe('Keep me')
    expect(getNodeContent('merged')).toBe('New content')
  })

  it('mergeContent overwrites existing entries', () => {
    setNodeContent('node-a', 'Old')
    mergeContent({ 'node-a': 'Updated' })
    expect(getNodeContent('node-a')).toBe('Updated')
  })

  it('resetContent restores original file content', () => {
    setNodeContent('runtime-only', 'Temp')
    resetContent()
    expect(getNodeContent('runtime-only')).toBeUndefined()
  })
})
