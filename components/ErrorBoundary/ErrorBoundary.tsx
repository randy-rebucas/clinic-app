'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'section';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;

      // Different UI based on error boundary level
      switch (level) {
        case 'page':
          return this.renderPageError();
        case 'section':
          return this.renderSectionError();
        default:
          return this.renderComponentError();
      }
    }

    return this.props.children;
  }

  private renderPageError() {
    const { error } = this.state;
    const { showDetails = false } = this.props;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20">
        <div className="max-w-md w-full mx-4">
          <div className="card p-8 text-center">
            <div className="empty-state">
              <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="empty-state-title text-red-900 dark:text-red-100">
                Something went wrong
              </div>
              <div className="empty-state-description text-red-700 dark:text-red-300 mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </div>
              
              {showDetails && error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Error Details</span>
                  </div>
                  <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                    {error.message}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="btn-primary px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="btn-secondary px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="btn-outline px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderSectionError() {
    const { error } = this.state;
    const { showDetails = false } = this.props;

    return (
      <div className="card p-6 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Section Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              This section encountered an error and couldn&apos;t load properly.
            </p>
            
            {showDetails && error && (
              <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                <div className="font-medium text-red-800 dark:text-red-200 mb-1">Error:</div>
                <div className="text-red-700 dark:text-red-300 break-words">{error.message}</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.handleRetry}
                className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderComponentError() {
    const { error } = this.state;
    const { showDetails = false } = this.props;

    return (
      <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-800 dark:text-red-200">
            Component Error
          </span>
        </div>
        <p className="text-xs text-red-700 dark:text-red-300 mb-3">
          This component failed to load. Click retry to try again.
        </p>
        
        {showDetails && error && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
            <div className="text-red-700 dark:text-red-300 break-words">{error.message}</div>
          </div>
        )}

        <button
          onClick={this.handleRetry}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    );
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for functional components to report errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error reported by useErrorHandler:', error, errorInfo);
    // You can add additional error reporting logic here
  };
}
