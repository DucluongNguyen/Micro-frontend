import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
  /** Rendered in place of the crashed subtree. Defaults to an antd Result. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * A real render-time error boundary.
 *
 * The original portal-container only guarded against *import* failures
 * (via `lazySafe` catching a rejected dynamic import). A remote that loads
 * successfully but throws while rendering - a very common failure mode for
 * federated modules mismatched on shared dependency versions - was
 * completely unhandled and would crash the whole container app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught error rendering subtree:', error, info.componentStack);
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <Result
        status="500"
        title="Something went wrong"
        subTitle="This section failed to load. Please try again or contact support."
        extra={
          <Button type="primary" onClick={this.reset}>
            Retry
          </Button>
        }
      />
    );
  }
}
