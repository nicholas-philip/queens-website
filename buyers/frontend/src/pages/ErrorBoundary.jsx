// =====================================================
// components/ErrorBoundary.jsx  —  NEW
//
// Wraps your entire app so a crash in one component
// doesn't blank the whole page. Add to main.jsx:
//
//   import ErrorBoundary from './components/ErrorBoundary';
//   <ErrorBoundary>
//     <App />
//   </ErrorBoundary>
// =====================================================

import React from 'react';
import { ShoppingBag } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to your error tracker (Sentry, LogRocket, etc.)
    console.error('Queens Fashion Store Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 font-sans">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={36} className="text-gray-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-500 font-medium mb-8">
              An unexpected error occurred. Your cart is safe — please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gray-900 text-white font-extrabold rounded-2xl hover:bg-black transition-colors shadow-lg"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-6 text-left text-xs text-red-500 bg-red-50 p-4 rounded-xl overflow-auto border border-red-100">
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
