import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
            <AlertTriangle size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-white">Something interrupted the page</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            The interface hit an unexpected error. Reloading usually resolves it without affecting your account or data.
          </p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => window.location.reload()}>
            Reload BuildBridge
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
