import { IconUsers, IconFileText, IconTerminal } from '../assets/icons';
import type { DataSource } from '../types';

interface SidebarProps {
  activeSource: DataSource | 'playground';
  onNavigate: (source: DataSource | 'playground') => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { id: 'users' as const,      label: '用户管理',  Icon: IconUsers },
  { id: 'posts' as const,      label: '帖子管理',  Icon: IconFileText },
  { id: 'playground' as const, label: 'API 练习场', Icon: IconTerminal },
];

export function Sidebar({ activeSource, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">Learn Fullstack</div>
          <div className="sidebar-brand-subtitle">全栈学习</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item${activeSource === id ? ' active' : ''}`}
              onClick={() => { onNavigate(id); onClose?.(); }}
              aria-current={activeSource === id ? 'page' : undefined}
            >
              <Icon size={20} />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            :8080 backend<br />
            :5173 frontend
          </div>
        </div>
      </aside>
    </>
  );
}
