"use client";

import React, { Component, type ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error({ err: error, componentStack: errorInfo.componentStack }, "ErrorBoundary a capturé une erreur");
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-white">Un problème est survenu dans ce composant</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md">
            {this.state.error?.message || "Une erreur inattendue est survenue lors de l'affichage."}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-5 rounded-full bg-lime-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
