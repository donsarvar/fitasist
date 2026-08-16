import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary Caught Exception]:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-2xl mx-auto flex items-center justify-center border border-rose-500/20 text-3xl font-bold">
              ⚠️
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight">Kutilmagan xatolik yuz berdi</h2>
              <p className="text-sm text-slate-400">
                Ilova ishida kutilmagan to'xtalish yuz berdi. Tugmani bosish orqali qayta ishga tushirishingiz mumkin.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left overflow-x-auto">
                <code className="text-xs text-rose-400 font-mono break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25"
            >
              Qayta yuklash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
