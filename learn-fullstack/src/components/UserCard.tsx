import type { User } from '../types';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <span className="user-id">#{user.id}</span>
        <span className="user-name">{user.name}</span>
      </div>
      <div className="user-card-body">
        <div className="user-info-row">
          <span className="label">👤</span>
          <span className="value">@{user.username}</span>
        </div>
        <div className="user-info-row">
          <span className="label">📧</span>
          <span className="value">{user.email}</span>
        </div>
        {user.phone && (
          <div className="user-info-row">
            <span className="label">📱</span>
            <span className="value">{user.phone}</span>
          </div>
        )}
        {user.website && (
          <div className="user-info-row">
            <span className="label">🌐</span>
            <span className="value">{user.website}</span>
          </div>
        )}
        {user.city && (
          <div className="user-info-row">
            <span className="label">📍</span>
            <span className="value">{user.city}</span>
          </div>
        )}
        {user.company && (
          <div className="user-info-row">
            <span className="label">🏢</span>
            <span className="value">{user.company}</span>
          </div>
        )}
      </div>
    </div>
  );
}
