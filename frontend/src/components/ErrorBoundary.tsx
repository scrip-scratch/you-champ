import { AlertCircle } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Произошла ошибка</p>
                <p className="text-sm">
                  {this.state.error?.message || "Неизвестная ошибка"}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">
                      Детали ошибки
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-2 rounded">
                      {this.state.error?.stack}
                      {"\n\n"}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="mt-4"
                >
                  Попробовать снова
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
