import React from "react";
import { Link, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  onReset?: () => void;
};

type State = { hasError: boolean; error?: any };

class ErrorBoundaryInner extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("UI ErrorBoundary caught:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto my-10 max-w-lg rounded-2xl border bg-white p-6 text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-red-100 text-red-700 grid place-items-center text-lg">
          !
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-neutral-700 mb-4">
          An unexpected error occurred while rendering this page.
        </p>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={this.reset}
            className="rounded-xl bg-black text-white px-4 py-2"
          >
            Try again
          </button>
          <Link
            to="/"
            className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
          >
            Go home
          </Link>
        </div>

        {/* Show stack trace only in dev mode (Vite env) */}
        {import.meta.env.MODE !== "production" && this.state.error && (
          <pre className="mt-4 max-h-48 overflow-auto rounded bg-neutral-100 p-3 text-left text-xs">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        )}
      </div>
    );
  }
}

/** Resets the boundary whenever the route path changes */
export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const loc = useLocation();
  return (
    <ErrorBoundaryInner key={loc.pathname} onReset={() => {}}>
      {children}
    </ErrorBoundaryInner>
  );
};
