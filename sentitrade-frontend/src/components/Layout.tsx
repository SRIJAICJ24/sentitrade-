import React from 'react';
import { Navigation } from './Navigation';
import { Toast } from './common/Toast';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <Navigation />

            {/* Mobile Header (visible only on small screens) */}
            <header className="lg:hidden h-16 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-white">
                        S
                    </div>
                    <span className="font-bold">SentiTrade</span>
                </div>
                {/* Mobile menu toggle would go here */}
            </header>

            <main className="lg:ml-64 min-h-screen">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>

            <Toast />
        </div>
    );
};
