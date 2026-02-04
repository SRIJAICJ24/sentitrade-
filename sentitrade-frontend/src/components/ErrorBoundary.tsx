import React, { Component } from 'react';

interface Props {
    children?: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-4 bg-red-900/20 text-red-400 border border-red-500 rounded">
                    <h2 className="font-bold">Something went wrong.</h2>
                    <p className="text-sm mt-2">{this.state.error?.toString()}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-600"
                    >
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
