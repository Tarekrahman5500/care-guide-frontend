'use server';

import { cookies } from 'next/headers';
import { fetchApi } from '@/lib/api-client';
import type { ApiResponse } from '@/lib/api-client';

interface SessionUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  interests?: string[];
}

const WEEK_SECONDS = 60 * 60 * 24 * 7;

async function getServerToken() {
  const store = await cookies();
  return store.get('accessToken')?.value;
}

async function authed(method: string, body?: unknown): Promise<RequestInit & { token?: string }> {
  const token = await getServerToken();
  return {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    token,
  };
}

function normalizeUser(user: SessionUser): SessionUser {
  return {
    ...user,
    _id: user._id || user.id || '',
    id: user.id || user._id || '',
  };
}

async function setSessionCookies(accessToken: string, refreshToken: string, user: SessionUser) {
  const store = await cookies();
  store.set('accessToken', accessToken, { path: '/', maxAge: WEEK_SECONDS });
  store.set('refreshToken', refreshToken, { path: '/', maxAge: WEEK_SECONDS });
  store.set('user', JSON.stringify(normalizeUser(user)), { path: '/', maxAge: WEEK_SECONDS });
  store.set('userRole', user.role, { path: '/', maxAge: WEEK_SECONDS });
}

// ===== Auth =====

export async function loginAction(email: string, password: string) {
  const res = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = res.data as
    | { user: SessionUser; accessToken: string; refreshToken: string }
    | undefined;
  if (!res.success || !data?.user || !data?.accessToken || !data?.refreshToken) {
    return {
      success: false,
      error: res.error || {
        type: 'AUTH_ERROR',
        message: 'Login failed. Please check your credentials.',
      },
    };
  }

  await setSessionCookies(data.accessToken, data.refreshToken, data.user);

  return { success: true, user: normalizeUser(data.user) };
}

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  interests: string[];
}) {
  const res = await fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'user' }),
  });

  if (!res.success || !res.data?.user || !res.data?.accessToken || !res.data?.refreshToken) {
    return {
      success: false,
      error: res.error || {
        type: 'AUTH_ERROR',
        message: 'Registration failed. Please try again.',
      },
    };
  }

  await setSessionCookies(res.data.accessToken, res.data.refreshToken, res.data.user);

  return { success: true, user: normalizeUser(res.data.user) };
}

// ===== Notes =====

export async function listNotes(page: number, limit: number): Promise<ApiResponse> {
  return fetchApi(`/notes?page=${page}&limit=${limit}`, await authed('GET'));
}

export async function createNote(title: string, content: string): Promise<ApiResponse> {
  return fetchApi('/notes', await authed('POST', { title, content }));
}

export async function updateNote(id: string, title: string, content: string): Promise<ApiResponse> {
  return fetchApi(`/notes/${id}`, await authed('PATCH', { title, content }));
}

export async function deleteNote(id: string): Promise<ApiResponse> {
  return fetchApi(`/notes/${id}`, await authed('DELETE'));
}

// ===== Posts =====

export async function listPosts(): Promise<ApiResponse> {
  return fetchApi('/posts', await authed('GET'));
}

export async function createPost(title: string, content: string): Promise<ApiResponse> {
  return fetchApi('/posts', await authed('POST', { title, content }));
}

export async function updatePost(id: string, title: string, content: string): Promise<ApiResponse> {
  return fetchApi(`/posts/${id}`, await authed('PATCH', { title, content }));
}

export async function deletePost(id: string): Promise<ApiResponse> {
  return fetchApi(`/posts/${id}`, await authed('DELETE'));
}

// ===== Profile =====

export async function getMe(): Promise<ApiResponse> {
  return fetchApi('/users/me', await authed('GET'));
}

export async function updateProfile(
  userId: string,
  data: { name: string; interests: string[] }
): Promise<ApiResponse> {
  return fetchApi(`/users/${userId}`, await authed('PATCH', data));
}

// ===== Admin: Users =====

export async function listUsers(): Promise<ApiResponse> {
  return fetchApi('/users', await authed('GET'));
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  interests: string[];
}): Promise<ApiResponse> {
  return fetchApi('/users', await authed('POST', data));
}

export async function updateUser(
  id: string,
  data: { name: string; role: 'user' | 'admin'; interests: string[] }
): Promise<ApiResponse> {
  return fetchApi(`/users/${id}`, await authed('PATCH', data));
}

export async function deleteUser(id: string): Promise<ApiResponse> {
  return fetchApi(`/users/${id}`, await authed('DELETE'));
}
