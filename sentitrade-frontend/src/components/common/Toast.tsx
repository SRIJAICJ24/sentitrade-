import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { AnimatePresence, motion } from 'framer-motion';

export const Toast: React.FC = () => {
    const { toasts, removeToast } = useUIStore();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`
              min-w-[300px] p-4 rounded-lg shadow-lg border-l-4 text-white flex justify-between items-start
              ${toast.type === 'success' ? 'bg-slate-800 border-green-500' : ''}
              ${toast.type === 'error' ? 'bg-slate-800 border-red-500' : ''}
              ${toast.type === 'info' ? 'bg-slate-800 border-cyan-500' : ''}
              ${toast.type === 'warning' ? 'bg-slate-800 border-yellow-500' : ''}
            `}
                    >
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
