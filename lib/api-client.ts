import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    type: string;
    message: string;
    details?: any[];
  };
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<ApiResponse<T>> {
  const { token, headers = {}, ...rest } = options;

  let authToken = token;

  // If no explicit token passed, try to get from cookies
  if (!authToken) {
    if (typeof window !== 'undefined') {
      authToken = Cookies.get('accessToken');
    } else {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        authToken = cookieStore.get('accessToken')?.value;
      } catch (e) {
        // Fallback for environment where cookies() is not available
      }
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
      cache: rest.cache || 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = Array.isArray(data.message)
        ? data.message.join(', ')
        : (data.message || data.error?.message || `Request failed with status ${response.status}`);

      return {
        success: false,
        error: data.error || {
          type: 'HTTP_ERROR',
          message: errorMessage,
        },
      };
    }

    // Normalize response formats:
    // 1. { success: true, data: ... }
    if (typeof data.success === 'boolean') {
      return data;
    }

    // 2. Direct payload response e.g. { user, accessToken, refreshToken } or array/object
    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      meta: data.meta,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        message: error.message || 'Failed to connect to backend server. Make sure NestJS backend is running.',
      },
    };
  }
}
