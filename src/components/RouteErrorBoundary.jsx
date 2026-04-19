import { Component } from 'react';

// Route-level error boundary. Keeps a slide-renderer crash from taking down
// the whole app — the user can still navigate away and keep editing other
// case studies.
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[RouteErrorBoundary]', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    const message = this.state.error?.message || String(this.state.error);
    return (
      <div
        role="alert"
        style={{
          maxWidth: 640,
          margin: '4rem auto',
          padding: '2rem',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 12,
          fontFamily: 'system-ui, sans-serif',
          color: 'inherit',
          background: 'rgba(239, 68, 68, 0.08)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Something went wrong in this view</h2>
        <p style={{ opacity: 0.8 }}>
          The rest of the site is still available — navigate away or try again below.
        </p>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontSize: 12,
            opacity: 0.7,
            maxHeight: 200,
            overflow: 'auto',
            background: 'rgba(0,0,0,0.15)',
            padding: 12,
            borderRadius: 6,
          }}
        >
          {message}
        </pre>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="button" onClick={this.handleReset} style={{ padding: '0.5rem 1rem' }}>
            Try again
          </button>
          <a href="/" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
            Go home
          </a>
        </div>
      </div>
    );
  }
}
