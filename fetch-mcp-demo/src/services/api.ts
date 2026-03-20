import type { User, RawUser, Post, SaveResult } from '../types';

const TOKEN_KEY = 'jwt_token'
const AUTH_LOGOUT_EVENT = 'auth:logout'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';
const JSONPLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com';

// ========== 后端统一响应结构 ==========
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// 解包后端响应，提取 data 字段
async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    throw new Error('认证已过期，请重新登录')
  }
  if (!response.ok) {
    const err: ApiResponse<null> = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  const body: ApiResponse<T> = await response.json();
  return body.data;
}

export const TIMEOUT_MS = 15_000;

function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const token = localStorage.getItem(TOKEN_KEY)
  const isAuthRoute = url.includes('/auth/')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token && !isAuthRoute) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(url, { ...options, signal: controller.signal, headers })
    .catch(err => {
      if (err.name === 'AbortError') throw new Error('请求超时，请检查网络连接');
      throw err;
    })
    .finally(() => clearTimeout(timeoutId));
}

// ========== 数据转换 ==========
export function transformRawUser(raw: RawUser): User {
  return {
    id: raw.id,
    name: raw.name,
    username: raw.username,
    email: raw.email,
    phone: raw.phone,
    website: raw.website,
    city: raw.address?.city,
    company: raw.company?.name,
  };
}

// ========== 用户 API ==========
export async function fetchExternalUsers(): Promise<User[]> {
  const res = await fetch(`${JSONPLACEHOLDER_URL}/users`);
  if (!res.ok) throw new Error('获取外部用户数据失败');
  const rawUsers: RawUser[] = await res.json();
  return rawUsers.map(transformRawUser);
}

export async function saveUsersToBackend(users: User[]): Promise<SaveResult> {
  return unwrap<SaveResult>(await authFetch(`${API_BASE}/users/batch`, {
    method: 'POST', body: JSON.stringify(users),
  }));
}

export async function fetchDatabaseUsers(): Promise<User[]> {
  return unwrap<User[]>(await authFetch(`${API_BASE}/db/users`));
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  return unwrap<User>(await authFetch(`${API_BASE}/db/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user),
  }));
}

export async function updateUser(id: number, user: Partial<User>): Promise<User> {
  return unwrap<User>(await authFetch(`${API_BASE}/db/users/update?id=${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user),
  }));
}

export async function deleteUser(id: number): Promise<void> {
  await unwrap<void>(await authFetch(`${API_BASE}/db/users/delete?id=${id}`, { method: 'DELETE' }));
}

export async function getUserById(id: number): Promise<User> {
  return unwrap<User>(await authFetch(`${API_BASE}/db/users/detail?id=${id}`));
}

export async function getUsersByCity(city: string): Promise<User[]> {
  return unwrap<User[]>(await authFetch(`${API_BASE}/db/users/by-city?city=${encodeURIComponent(city)}`));
}

export async function searchUsersByEmail(email: string): Promise<User[]> {
  return unwrap<User[]>(await authFetch(`${API_BASE}/db/users/search?email=${encodeURIComponent(email)}`));
}

export async function getUserStats(): Promise<{ count: number }> {
  const count = await unwrap<number>(await authFetch(`${API_BASE}/db/count`));
  return { count: count as unknown as number };
}

export async function getAllCities(): Promise<string[]> {
  return unwrap<string[]>(await authFetch(`${API_BASE}/db/cities`));
}

// ========== 帖子 API ==========
export async function fetchExternalPosts(): Promise<Post[]> {
  const res = await fetch(`${JSONPLACEHOLDER_URL}/posts`);
  if (!res.ok) throw new Error('获取外部帖子数据失败');
  return res.json();
}

export async function savePostsToBackend(posts: Post[]): Promise<SaveResult> {
  return unwrap<SaveResult>(await authFetch(`${API_BASE}/posts/batch`, {
    method: 'POST', body: JSON.stringify(posts),
  }));
}

export async function fetchDatabasePosts(): Promise<Post[]> {
  return unwrap<Post[]>(await authFetch(`${API_BASE}/db/posts`));
}

export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  return unwrap<Post>(await authFetch(`${API_BASE}/db/posts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(post),
  }));
}

export async function updatePost(id: number, post: Partial<Post>): Promise<Post> {
  return unwrap<Post>(await authFetch(`${API_BASE}/db/posts/update?id=${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(post),
  }));
}

export async function deletePost(id: number): Promise<void> {
  await unwrap<void>(await authFetch(`${API_BASE}/db/posts/delete?id=${id}`, { method: 'DELETE' }));
}

export async function getPostById(id: number): Promise<Post> {
  return unwrap<Post>(await authFetch(`${API_BASE}/db/posts/detail?id=${id}`));
}

export async function getPostsByUserId(userId: number): Promise<Post[]> {
  return unwrap<Post[]>(await authFetch(`${API_BASE}/db/posts/by-user?userId=${userId}`));
}

export async function searchPostsByTitle(title: string): Promise<Post[]> {
  return unwrap<Post[]>(await authFetch(`${API_BASE}/db/posts/search?title=${encodeURIComponent(title)}`));
}
