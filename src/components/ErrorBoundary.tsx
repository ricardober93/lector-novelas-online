"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log the error to an analytics service here
    console.error("ErrorBoundary caught an error", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message ?? "Algo salió mal";
      return (
        <div
          role="alert"
          style={{ padding: "1rem", border: "1px solid #f87171", background: "#fff5f5", color: "#991b1b" }}
        >
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Error en la aplicación</h2>
          <p style={{ marginTop: 6 }}>{message}</p>
          <button
            onClick={this.reset}
            style={{ marginTop: 8, padding: "0.5rem 1rem", borderRadius: 4, border: "none", background: "#f87171", color: "white", cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  // Convenience wrapper if you prefer <ErrorBoundaryWrapper> in code
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
