import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "@/i18n";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("UI ErrorBoundary caught:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6 text-center">
          <div className="space-y-3">
            <p className="text-lg font-semibold">{i18n.t("common.error")}</p>
            <p className="text-sm text-muted-foreground">{this.state.message}</p>
            <button
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              {i18n.t("common.reload")}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
