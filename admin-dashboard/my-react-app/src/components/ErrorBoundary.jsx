import React from 'react';
import { ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Queens Fashion Store Admin App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 font-sans text-white">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <ShieldAlert size={36} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-extrabold mb-3 text-white">Dashboard Error</h1>
            <p className="text-gray-400 font-medium mb-8">
              An unexpected error occurred in the dashboard. Try refreshing the page or checking your connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-red-600 text-white font-extrabold rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              Reload Dashboard
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-6 text-left text-xs text-red-400 bg-red-950/50 p-4 rounded-xl overflow-auto border border-red-900/30">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
