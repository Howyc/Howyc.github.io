import { IconMenu } from '../assets/icons';

interface TopBarProps {
  title: string;
  loading: boolean;
  error?: string | null;
  onMenuToggle?: () => void;
}

export function TopBar({ title, loading, error, onMenuToggle }: TopBarProps) {
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
        {loading && <div className="topbar-spinner" aria-label="加载中" />}
        {error && <span className="topbar-error-badge">错误</span>}
      </div>
    </header>
  );
}
