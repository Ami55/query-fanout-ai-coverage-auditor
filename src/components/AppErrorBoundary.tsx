import { Component, ErrorInfo, ReactNode } from 'react';

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class AppErrorBoundary extends Component<Props, State> {
  declare readonly props: Props;
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Results dashboard render error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <section className="max-w-xl w-full rounded-2xl border border-red-200 bg-white p-6 shadow-lg">
          <h1 className="text-lg font-bold text-slate-900">The results could not be displayed</h1>
          <p className="mt-2 text-sm text-slate-600">
            The audit returned incomplete or unexpected result data. Your browser has not been damaged and you can safely start again.
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-red-50 p-3 text-xs text-red-800 whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Reload application
          </button>
        </section>
      </main>
    );
  }
}
