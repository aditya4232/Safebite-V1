import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/SafeBite-V1/';
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default error UI
      return (
        <div className="min-h-screen bg-[hsl(var(--safebite-dark-blue))] flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-[hsl(var(--safebite-teal))]/50 bg-[hsl(var(--safebite-card-bg))]">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--safebite-text))] text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-[hsl(var(--safebite-text-secondary))]">
                  We're sorry, but an error occurred while loading the application.
                </p>
                {this.state.error && (
                  <div className="bg-[hsl(var(--safebite-card-bg-alt))] p-3 rounded-md overflow-auto max-h-40">
                    <p className="text-red-400 text-sm font-mono">{this.state.error.toString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={this.handleGoHome}>
                Go to Home
              </Button>
              <Button onClick={this.handleReload}>
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
