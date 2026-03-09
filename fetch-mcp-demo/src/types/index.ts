/**
 * 用户数据类型 - 数据库存储格式
 */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  city?: string;
  company?: string;
}

/**
 * JSONPlaceholder 原始用户数据类型
 */
export interface RawUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

/**
 * 帖子数据类型
 */
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * 批量保存结果类型
 */
export interface SaveResult {
  success: boolean;
  savedCount: number;
  updatedCount: number;
  failedCount: number;
  message: string;
}

/**
 * 同步状态类型
 */
export type SyncStep = 'idle' | 'fetching' | 'saving' | 'querying' | 'done' | 'error';

export interface SyncStatus {
  step: SyncStep;
  message: string;
}

/**
 * 数据库统计信息类型
 */
export interface DatabaseStats {
  totalUsers: number;
  cities: string[];
  companies: string[];
}

/**
 * 数据源类型
 */
export type DataSource = 'users' | 'posts';
