const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return { data: undefined, status: 204, headers: response.headers } as T;
  }

  const data = await response.json();
  return { data, status: response.status, headers: response.headers } as T;
};

export default customFetch;
