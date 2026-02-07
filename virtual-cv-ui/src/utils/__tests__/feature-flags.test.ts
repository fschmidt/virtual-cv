import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  Feature,
  isFeatureEnabled,
  setFeatureEnabled,
  getAllFeatureStates,
  getAllFeatures,
  FEATURE_CONFIG,
} from '../feature-flags'

describe('feature-flags', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset URL to remove any query params
    vi.stubGlobal('location', { ...window.location, search: '' })
  })

  it('defaults to disabled when nothing stored', () => {
    expect(isFeatureEnabled(Feature.EDIT_MODE)).toBe(false)
  })

  it('enables a feature via setFeatureEnabled', () => {
    setFeatureEnabled(Feature.EDIT_MODE, true)
    expect(isFeatureEnabled(Feature.EDIT_MODE)).toBe(true)
  })

  it('disables a feature via setFeatureEnabled', () => {
    setFeatureEnabled(Feature.EDIT_MODE, true)
    setFeatureEnabled(Feature.EDIT_MODE, false)
    expect(isFeatureEnabled(Feature.EDIT_MODE)).toBe(false)
  })

  it('persists to localStorage', () => {
    setFeatureEnabled(Feature.EDIT_MODE, true)
    const stored = JSON.parse(localStorage.getItem('virtual-cv-features')!)
    expect(stored).toContain('editMode')
  })

  it('enables feature via URL param override', () => {
    vi.stubGlobal('location', { ...window.location, search: '?features=editMode' })
    expect(isFeatureEnabled(Feature.EDIT_MODE)).toBe(true)
  })

  it('does not duplicate when enabling an already-enabled feature', () => {
    setFeatureEnabled(Feature.EDIT_MODE, true)
    setFeatureEnabled(Feature.EDIT_MODE, true)
    const stored = JSON.parse(localStorage.getItem('virtual-cv-features')!)
    expect(stored.filter((f: string) => f === 'editMode')).toHaveLength(1)
  })

  it('getAllFeatureStates returns map of all features', () => {
    setFeatureEnabled(Feature.EDIT_MODE, true)
    const states = getAllFeatureStates()
    expect(states[Feature.EDIT_MODE]).toBe(true)
  })

  it('getAllFeatures returns config and state', () => {
    const features = getAllFeatures()
    expect(features.length).toBeGreaterThan(0)
    const editMode = features.find((f) => f.feature === Feature.EDIT_MODE)
    expect(editMode).toBeDefined()
    expect(editMode!.config).toBe(FEATURE_CONFIG[Feature.EDIT_MODE])
  })
})
