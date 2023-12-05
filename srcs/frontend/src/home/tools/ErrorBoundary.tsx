import React, { Component, ErrorInfo, ReactNode } from 'react';

// Define the state interface for the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean;  // Indicates whether an error has occurred
  error: Error | null;  // Stores the error object if an error occurs
}

// Define the props interface for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;  // The child components to be wrapped by the ErrorBoundary
  fallback: ReactNode;  // The component to render when an error occurs
}

/**
 * ErrorBoundary is a React component that catches errors in its child components
 * and renders a fallback component when an error occurs.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Initialize the state with no error (hasError is false) and a null error object
    this.state = { hasError: false, error: null };
  }

  /**
   * getDerivedStateFromError is a static method that's called when an error is thrown
   * in the child components. It updates the component's state to indicate that an error
   * has occurred and stores the error object.
   * @param error - The error object thrown by the child component.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch is a lifecycle method that's called when an error is caught by
   * this ErrorBoundary component. It logs the error information to the console.
   * @param error - The error object thrown by the child component.
   * @param errorInfo - Additional information about the error.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    // If an error has occurred, render the fallback component
    if (this.state.hasError) {
      return this.props.fallback;
    }

    // If no error has occurred, render the child components wrapped by ErrorBoundary
    return this.props.children;
  }
}

export default ErrorBoundary;
