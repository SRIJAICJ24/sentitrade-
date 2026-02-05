import React from 'react';
import { Sidebar } from './layout/Sidebar';
import { Toast } from './common/Toast';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-black font-sans text-slate-200">
            {/* Sidebar (Fixed 20% width) */}
            <Sidebar />

            {/* Main Content (Scrollable 80% width) */}
            <main className="flex-1 ml-[20%] w-[80%] min-h-screen bg-black relative">
                {/* Optional: Add a subtle glowing orb effect in the background */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-lime-400/5 rounded-full blur-[128px] pointer-events-none" />

                <div className="p-8 relative z-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            <Toast />
        </div>
    );
};
