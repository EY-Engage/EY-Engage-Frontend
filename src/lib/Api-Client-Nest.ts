// lib/api-client-nest.ts
const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_NEST_BACKEND_URL;
  if (!url) throw new Error("NEXT_PUBLIC_NEST_BACKEND_URL not configured");
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
    credentials: 'include',
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
  
  console.log(`🌐 API Call: ${fetchOptions.method || 'GET'} ${url}`);
  if (fetchOptions.body && typeof fetchOptions.body === 'string') {
    console.log('📤 Request body:', fetchOptions.body);
  }
  try {
    const response = await fetch(url, config);

    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    // Handle 401 - Redirect to login
    if (response.status === 401 && requireAuth) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      throw new Error('Unauthorized');
    }

    // Handle other errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response:`, errorText);
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    const result = await response.json();
    console.log(`✅ API Success:`, result);
    return result;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Specific methods for common operations
export const api = {
  get: <T>(url: string, options?: FetchOptions) => apiClient<T>(url, { method: 'GET', ...options }),
  
  post: <T>(url: string, data?: any, options?: FetchOptions) => 
    apiClient<T>(url, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    }),
  
  put: <T>(url: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(url, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    }),
  
  delete: <T>(url: string, options?: FetchOptions) => apiClient<T>(url, { method: 'DELETE', ...options }),
  
  patch: <T>(url: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    }),
};