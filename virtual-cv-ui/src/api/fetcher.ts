import { ApiError, ValidationError, NotFoundError, ConflictError, NetworkError } from './errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9823';

export const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      cache: 'no-store', // Prevent browser caching of API responses
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    // Try to parse error body for detailed error info
    let errorBody: { message?: string; code?: string; fields?: Record<string, string> } = {};
    try {
      errorBody = await response.json();
    } catch {
      // No JSON body - use default message
    }

    const message = errorBody.message || `API error: ${response.status} ${response.statusText}`;

    switch (response.status) {
      case 400:
        throw new ValidationError(message, errorBody.fields);
      case 404:
        throw new NotFoundError('Resource', 'unknown');
      case 409:
        throw new ConflictError(message);
      default:
        throw new ApiError(message, response.status, errorBody.code);
    }
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return { data: undefined, status: 204, headers: response.headers } as T;
  }

  const data = await response.json();
  return { data, status: response.status, headers: response.headers } as T;
};

export default customFetch;
