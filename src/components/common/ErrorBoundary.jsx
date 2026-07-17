import { Component } from 'react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center premium-bg p-6">
          <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-panel dark:bg-white/10">
            <h1 className="text-2xl font-black">Something slipped.</h1>
            <p className="mt-3 text-sm text-steel">
              Refresh the page and try again. The app caught the error before it reached the floor.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
