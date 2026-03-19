import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorStr?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorStr: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle size={48} className="text-destructive mb-6" />
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-3">Ops! Algo deu errado.</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Encontramos um erro inesperado na página. Se o problema persistir, entre em contato com o suporte.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={16} /> Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
