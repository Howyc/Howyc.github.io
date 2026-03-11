import { IconMenu } from '../assets/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Menu, Tag, Spin } from '@arco-design/web-react';
import { IconUser, IconPoweroff } from '@arco-design/web-react/icon';

interface TopBarProps {
  title: string;
  loading: boolean;
  error?: string | null;
  onMenuToggle?: () => void;
}

export function TopBar({ title, loading, error, onMenuToggle }: TopBarProps) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropdownMenu = (
    <Menu onClickMenuItem={(key) => { if (key === 'logout') handleLogout() }}>
      <Menu.Item key="info" disabled style={{ cursor: 'default' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 0' }}>
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{username}</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>已登录</span>
        </div>
      </Menu.Item>
      <Menu.Item key="logout">
        <IconPoweroff style={{ marginRight: 6 }} />
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          className="hamburger-btn"
          onClick={onMenuToggle}
          aria-label="打开导航菜单"
        >
          <IconMenu size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {loading && <Spin size={16} style={{ marginRight: 8 }} />}
        {error && <Tag color="red" size="small">错误</Tag>}

        {username && (
          <Dropdown droplist={dropdownMenu} position="br" trigger="click">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Avatar
                size={28}
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', fontSize: 12, flexShrink: 0 }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <span style={{ fontSize: 13, color: '#94a3b8', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {username}
              </span>
              <IconUser style={{ color: '#64748b', fontSize: 12 }} />
            </div>
          </Dropdown>
        )}
      </div>
    </header>
  );
}
