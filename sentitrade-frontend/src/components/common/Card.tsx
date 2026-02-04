import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg ${className}`}>
            {title && <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>}
            {children}
        </div>
    );
};
