/**
 * API client for communicating with the NestJS backend
 */

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Default headers for API requests
const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

// HTTP methods type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Generic API request function
export async function ApiRequest<T = any>(
  endpoint: string, 
  method: HttpMethod = 'GET', 
  data?: any, 
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...customHeaders,
  };

  // Add authorization token if available
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
    mode: 'cors',
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`[API] ${method} ${url}`);
    const response = await fetch(url, options);
    
    // If we get a new token in response headers, update the stored token
    const newToken = response.headers.get('X-Auth-Token');
    if (newToken && typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', newToken);
    }
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      let json;
      
      try {
        json = await response.json();
      } catch (jsonError) {
        console.error('[API] Error parsing JSON response:', jsonError);
        throw new ApiError(
          response.status, 
          `Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`
        );
      }
      
      // Check if json is undefined or null
      if (json === undefined || json === null) {
        console.error('[API] Received undefined or null JSON response');
        throw new ApiError(response.status, 'Received empty response from server');
      }
      
      if (!response.ok) {
        const errorMessage = json.message || json.error || 'An error occurred';
        console.error(`[API] Error response (${response.status}):`, errorMessage);
        throw new ApiError(response.status, errorMessage, json);
      }
      
      return json as T;
    } else {
      if (!response.ok) {
        let text;
        try {
          text = await response.text();
        } catch (textError) {
          text = 'Failed to read error response';
        }
        console.error(`[API] Non-JSON error response (${response.status}):`, text);
        throw new ApiError(response.status, text || 'An error occurred');
      }
      
      const textResponse = await response.text();
      return textResponse as unknown as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('[API] Request error:', error);
    throw new ApiError(500, error instanceof Error ? error.message : 'Network error');
  }
}

// Custom API error class
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    
    // Log API errors for easier debugging
    console.error(`[API Error] ${status}: ${message}`);
  }
}

// Convenience methods for different HTTP verbs
export const Api = {
  get: <T = any>(endpoint: string, customHeaders?: Record<string, string>) => 
    ApiRequest<T>(endpoint, 'GET', undefined, customHeaders),
    
  post: <T = any>(endpoint: string, data?: any, customHeaders?: Record<string, string>) => 
    ApiRequest<T>(endpoint, 'POST', data, customHeaders),
    
  put: <T = any>(endpoint: string, data?: any, customHeaders?: Record<string, string>) => 
    ApiRequest<T>(endpoint, 'PUT', data, customHeaders),
    
  patch: <T = any>(endpoint: string, data?: any, customHeaders?: Record<string, string>) => 
    ApiRequest<T>(endpoint, 'PATCH', data, customHeaders),
    
  delete: <T = any>(endpoint: string, customHeaders?: Record<string, string>) => 
    ApiRequest<T>(endpoint, 'DELETE', undefined, customHeaders),
};

export default Api; 