import { TriangleAlert } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Icon } from './Icon'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private readonly handleRetry = () => {
    this.setState({ error: null })
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="error-state" role="alert">
          <Icon icon={TriangleAlert} size={32} />
          <h2>Something went wrong</h2>
          <p>The page hit an unexpected error. Your photos and ingredients are still here.</p>
          <button type="button" className="button button--primary" onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
