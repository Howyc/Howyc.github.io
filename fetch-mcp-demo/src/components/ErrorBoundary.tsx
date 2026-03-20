import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--color-bg, #F8FAFC)',
            fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
          }}
        >
          <div
            style={{
              background: 'var(--color-surface, #FFFFFF)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--color-danger-border, #FCA5A5)',
              boxShadow: 'var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1))',
              padding: '2.5rem 2rem',
              maxWidth: 420,
              width: '90%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
              }}
              aria-hidden="true"
            >
              ⚠️
            </div>
            <h2
              style={{
                margin: '0 0 0.5rem',
                fontSize: 'var(--text-xl, 1.25rem)',
                fontWeight: 'var(--font-semibold, 600)',
                color: 'var(--color-text-primary, #0F172A)',
              }}
            >
              页面出现了问题
            </h2>
            <p
              style={{
                margin: '0 0 1.5rem',
                fontSize: 'var(--text-sm, 0.875rem)',
                color: 'var(--color-text-muted, #94A3B8)',
                lineHeight: 1.6,
                wordBreak: 'break-word',
              }}
            >
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.625rem 1.5rem',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                background: 'var(--color-primary, #2563EB)',
                color: 'var(--color-text-inverse, #FFFFFF)',
                fontSize: 'var(--text-sm, 0.875rem)',
                fontWeight: 'var(--font-medium, 500)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
