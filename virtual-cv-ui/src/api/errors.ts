/**
 * Typed error classes for API error handling
 */

// Base API error with status code and structured info
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// 400 Bad Request - validation errors
export class ValidationError extends ApiError {
  fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// 404 Not Found
export class NotFoundError extends ApiError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// 409 Conflict
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// Network failures (no connection, timeout, etc.)
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error - please check your connection') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// Helper to extract user-friendly message from any error
export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError && error.fields) {
    const fieldErrors = Object.values(error.fields);
    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ');
    }
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
