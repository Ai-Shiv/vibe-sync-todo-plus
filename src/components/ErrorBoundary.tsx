
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleClearData = () => {
    if (confirm('This will clear all app data. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-slate-800 border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-950/50 p-4 rounded-lg border border-red-500/30">
                <h3 className="text-red-300 font-medium mb-2">Error Details:</h3>
                <p className="text-red-200 text-sm font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
                {this.state.error?.stack && (
                  <details className="mt-2">
                    <summary className="text-red-300 cursor-pointer text-sm">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-200 mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-slate-300 font-medium mb-2">Troubleshooting Steps:</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Check if the issue persists after clearing browser cache</li>
                  <li>• If the problem continues, try clearing app data (last resort)</li>
                  <li>• Report the issue if it keeps happening</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={this.handleReset}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleClearData}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>

              <div className="text-xs text-slate-500 mt-4">
                <p>Error ID: {Date.now()}</p>
                <p>Timestamp: {new Date().toISOString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
