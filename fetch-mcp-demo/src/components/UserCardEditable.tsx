import type { User } from '../types';
import { IconUser, IconMail, IconMapPin, IconBuilding, IconPencil, IconTrash } from '../assets/icons';

interface UserCardEditableProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export function UserCardEditable({ user, onEdit, onDelete }: UserCardEditableProps) {
  const initials = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">{initials}</div>
        <span className="user-name">{user.name}</span>
        <span className="user-id">#{user.id}</span>
        <div className="card-actions">
          <button
            className="btn-edit"
            onClick={() => onEdit(user)}
            aria-label="编辑用户"
          >
            <IconPencil size={16} />
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(user.id)}
            aria-label="删除用户"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
      <div className="user-card-body">
        <div className="user-info-row">
          <span className="label"><IconUser size={14} /></span>
          <span className="value">@{user.username}</span>
        </div>
        <div className="user-info-row">
          <span className="label"><IconMail size={14} /></span>
          <span className="value">{user.email}</span>
        </div>
        {user.city && (
          <div className="user-info-row">
            <span className="label"><IconMapPin size={14} /></span>
            <span className="value">{user.city}</span>
          </div>
        )}
        {user.company && (
          <div className="user-info-row">
            <span className="label"><IconBuilding size={14} /></span>
            <span className="value">{user.company}</span>
          </div>
        )}
      </div>
    </div>
  );
}
