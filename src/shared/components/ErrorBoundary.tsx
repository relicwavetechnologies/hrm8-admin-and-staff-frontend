import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReload = () => window.location.reload();

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="mb-6 max-w-md text-muted-foreground">
            An unexpected error occurred. Please reload the page or contact support if this keeps happening.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <div className="mb-6 rounded-lg bg-muted p-4 text-left font-mono text-sm text-muted-foreground max-w-xl w-full overflow-auto">
              {this.state.error.message}
            </div>
          )}
          <div className="flex gap-4">
            <button
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              onClick={this.handleReload}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
