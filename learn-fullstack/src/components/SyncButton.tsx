import type { SyncStatus } from '../types';

interface SyncButtonProps {
  onSync: () => void;
  status: SyncStatus;
  disabled: boolean;
}

const stepIcons: Record<SyncStatus['step'], string> = {
  idle: '⏸️',
  fetching: '📥',
  saving: '💾',
  querying: '🔍',
  done: '✅',
  error: '❌',
};

export function SyncButton({ onSync, status, disabled }: SyncButtonProps) {
  const isRunning = ['fetching', 'saving', 'querying'].includes(status.step);

  return (
    <div className="sync-panel">
      <div className="panel-header">
        <span className="panel-icon">🔄</span>
        <span className="panel-title">一键同步</span>
      </div>
      <div className="panel-body">
        <button
          className="sync-btn"
          onClick={onSync}
          disabled={disabled || isRunning}
        >
          {isRunning ? '⏳ 同步中...' : '🚀 一键同步'}
        </button>

        <div className="sync-status">
          <div className="status-steps">
            <StepIndicator
              step="fetching"
              currentStep={status.step}
              label="获取外部数据"
            />
            <span className="step-arrow">→</span>
            <StepIndicator
              step="saving"
              currentStep={status.step}
              label="保存到数据库"
            />
            <span className="step-arrow">→</span>
            <StepIndicator
              step="querying"
              currentStep={status.step}
              label="查询验证"
            />
          </div>
          {status.message && (
            <div className={`status-message ${status.step}`}>
              {stepIcons[status.step]} {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  step: SyncStatus['step'];
  currentStep: SyncStatus['step'];
  label: string;
}

function StepIndicator({ step, currentStep, label }: StepIndicatorProps) {
  const stepOrder = ['idle', 'fetching', 'saving', 'querying', 'done'];
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = stepOrder.indexOf(step);

  let state: 'pending' | 'active' | 'done' | 'error' = 'pending';
  if (currentStep === 'error') {
    state = stepIndex <= currentIndex ? 'error' : 'pending';
  } else if (stepIndex < currentIndex || currentStep === 'done') {
    state = 'done';
  } else if (stepIndex === currentIndex) {
    state = 'active';
  }

  return (
    <span className={`step-indicator ${state}`}>
      {state === 'done' && '✅'}
      {state === 'active' && '⏳'}
      {state === 'pending' && '⬜'}
      {state === 'error' && '❌'}
      <span className="step-label">{label}</span>
    </span>
  );
}
