// lib/api-client.ts
const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) throw new Error("NEXT_PUBLIC_BACKEND_URL not configured");
  return url;
};

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;
  
  const config: RequestInit = {
    ...fetchOptions,
    credentials: 'include', // CRUCIAL: Include cookies with every request
    headers: {
      ...fetchOptions.headers,
    },
  };

  // Si c'est une requête JSON, ajouter le Content-Type
  if (fetchOptions.body && typeof fetchOptions.body === 'string') {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    };
  }

  const url = `${getBackendUrl()}${endpoint}`;
  
  try {
    const response = await fetch(url, config);

    // Handle 401 - Redirect to login
    if (response.status === 401 && requireAuth) {
      // Clear any stored auth state
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      throw new Error('Unauthorized');
    }

    // Handle other errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Specific methods for common operations
export const api = {
  get: <T>(url: string) => apiClient<T>(url, { method: 'GET' }),
  
  post: <T>(url: string, data?: any) => 
    apiClient<T>(url, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  
  put: <T>(url: string, data?: any, p0?: { headers: { 'Content-Type': string; }; }) =>
    apiClient<T>(url, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  
  delete: <T>(url: string) => apiClient<T>(url, { method: 'DELETE' }),
  
  patch: <T>(url: string, data?: any) =>
    apiClient<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};