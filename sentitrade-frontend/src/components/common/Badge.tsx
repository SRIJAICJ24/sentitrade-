import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variants = {
        success: 'bg-green-900/30 text-green-400 border-green-600',
        warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-600',
        error: 'bg-red-900/30 text-red-400 border-red-600',
        info: 'bg-cyan-900/30 text-cyan-400 border-cyan-600',
        default: 'bg-slate-700 text-gray-300 border-slate-600',
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
