'use client';

import Cookies from 'js-cookie';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  interests?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  USER_ROLE: 'userRole',
};

export function setAuthSession(data: { user: User; accessToken: string; refreshToken: string }) {
  const { user, accessToken, refreshToken } = data;
  const normalizedUser: User = {
    ...user,
    _id: user._id || user.id || '',
    id: user.id || user._id || '',
  };

  // Set cookies for 7 days
  Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, { expires: 7, path: '/' });
  Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, { expires: 7, path: '/' });
  Cookies.set(COOKIE_KEYS.USER, JSON.stringify(normalizedUser), { expires: 7, path: '/' });
  Cookies.set(COOKIE_KEYS.USER_ROLE, normalizedUser.role, { expires: 7, path: '/' });
}

export function clearAuthSession() {
  Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
  Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN, { path: '/' });
  Cookies.remove(COOKIE_KEYS.USER, { path: '/' });
  Cookies.remove(COOKIE_KEYS.USER_ROLE, { path: '/' });
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = Cookies.get(COOKIE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN) || null;
}
