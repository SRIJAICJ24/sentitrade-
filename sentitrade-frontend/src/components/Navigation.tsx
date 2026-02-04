import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Navigation: React.FC = () => {
    const { clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Settings', path: '/settings', icon: '⚙️' },
    ];

    return (
        <nav className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700 p-4 hidden lg:flex flex-col">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-white">
                    S
                </div>
                <span className="text-xl font-bold text-white tracking-tight">SentiTrade</span>
            </div>

            <div className="space-y-1 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition
              ${isActive
                                ? 'bg-slate-800 text-cyan-400 font-medium'
                                : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                            }
            `}
                    >
                        <span>{item.icon}</span>
                        {item.name}
                    </NavLink>
                ))}
            </div>

            <div className="mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800/50 transition"
                >
                    <span>🚪</span>
                    Logout
                </button>
            </div>
        </nav>
    );
};
