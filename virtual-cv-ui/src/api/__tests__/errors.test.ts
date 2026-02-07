import { describe, it, expect } from 'vitest'
import {
  ApiError,
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  getErrorMessage,
} from '../errors'

describe('API error classes', () => {
  it('ApiError has correct properties', () => {
    const err = new ApiError('Server error', 500, 'INTERNAL')
    expect(err.message).toBe('Server error')
    expect(err.status).toBe(500)
    expect(err.code).toBe('INTERNAL')
    expect(err.name).toBe('ApiError')
    expect(err).toBeInstanceOf(Error)
  })

  it('ValidationError defaults to 400', () => {
    const err = new ValidationError('Bad input', { email: 'Invalid email' })
    expect(err.status).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.fields).toEqual({ email: 'Invalid email' })
  })

  it('NotFoundError formats message with resource and id', () => {
    const err = new NotFoundError('Node', 'abc-123')
    expect(err.message).toBe('Node not found: abc-123')
    expect(err.status).toBe(404)
  })

  it('ConflictError has status 409', () => {
    const err = new ConflictError('Already exists')
    expect(err.status).toBe(409)
  })

  it('AuthenticationError defaults to 401', () => {
    const err = new AuthenticationError()
    expect(err.status).toBe(401)
    expect(err.message).toBe('Authentication required')
  })

  it('AuthorizationError defaults to 403', () => {
    const err = new AuthorizationError()
    expect(err.status).toBe(403)
  })

  it('NetworkError has status 0', () => {
    const err = new NetworkError()
    expect(err.status).toBe(0)
  })
})

describe('getErrorMessage', () => {
  it('returns friendly message for AuthenticationError', () => {
    expect(getErrorMessage(new AuthenticationError())).toBe('Please sign in to perform this action')
  })

  it('returns friendly message for AuthorizationError', () => {
    expect(getErrorMessage(new AuthorizationError())).toBe('You are not authorized to perform this action')
  })

  it('returns field errors for ValidationError', () => {
    const err = new ValidationError('Bad', { name: 'Required' })
    expect(getErrorMessage(err)).toBe('Required')
  })

  it('returns message for generic ApiError', () => {
    expect(getErrorMessage(new ApiError('Oops', 500))).toBe('Oops')
  })

  it('returns message for plain Error', () => {
    expect(getErrorMessage(new Error('Something broke'))).toBe('Something broke')
  })

  it('returns fallback for unknown types', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred')
    expect(getErrorMessage(null)).toBe('An unexpected error occurred')
  })
})
