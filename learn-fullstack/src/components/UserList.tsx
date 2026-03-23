import type { User } from '../types';
import { UserCard } from './UserCard';

interface UserListProps {
  title: string;
  icon: string;
  users: User[];
  loading?: boolean;
  emptyMessage?: string;
}

export function UserList({ title, icon, users, loading, emptyMessage = '暂无数据' }: UserListProps) {
  return (
    <div className="user-list-panel">
      <div className="panel-header">
        <span className="panel-icon">{icon}</span>
        <span className="panel-title">{title}</span>
        <span className="panel-count">共 {users.length} 条</span>
      </div>
      <div className="panel-body">
        {loading ? (
          <div className="loading-state">
            <span className="spinner">⏳</span>
            <span>加载中...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">{emptyMessage}</div>
        ) : (
          <div className="user-grid">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
