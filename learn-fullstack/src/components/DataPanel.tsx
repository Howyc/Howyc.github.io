import type { SaveResult } from '../types';

interface DataPanelProps {
  onFetchExternal: () => void;
  onSaveToBackend: () => void;
  onQueryDatabase: () => void;
  loading: boolean;
  saveResult: SaveResult | null;
  hasExternalData: boolean;
}

export function DataPanel({
  onFetchExternal,
  onSaveToBackend,
  onQueryDatabase,
  loading,
  saveResult,
  hasExternalData,
}: DataPanelProps) {
  return (
    <div className="data-panel">
      <div className="panel-header">
        <span className="panel-icon">📡</span>
        <span className="panel-title">数据操作</span>
      </div>
      <div className="panel-body">
        <div className="button-row">
          <button
            className="action-btn fetch-btn"
            onClick={onFetchExternal}
            disabled={loading}
          >
            📥 获取外部数据
          </button>
          <button
            className="action-btn save-btn"
            onClick={onSaveToBackend}
            disabled={loading || !hasExternalData}
            title={!hasExternalData ? '请先获取外部数据' : ''}
          >
            💾 保存到数据库
          </button>
          <button
            className="action-btn query-btn"
            onClick={onQueryDatabase}
            disabled={loading}
          >
            🔍 查询数据库
          </button>
        </div>

        {saveResult && (
          <div className={`save-result ${saveResult.success ? 'success' : 'error'}`}>
            <div className="result-header">
              {saveResult.success ? '✅' : '❌'} {saveResult.message}
            </div>
            <div className="result-stats">
              <span className="stat">
                <span className="stat-label">新增:</span>
                <span className="stat-value">{saveResult.savedCount}</span>
              </span>
              <span className="stat">
                <span className="stat-label">更新:</span>
                <span className="stat-value">{saveResult.updatedCount}</span>
              </span>
              <span className="stat">
                <span className="stat-label">失败:</span>
                <span className="stat-value">{saveResult.failedCount}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
