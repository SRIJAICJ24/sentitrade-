import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

// In a real app this would use the persistent websocket connection
// For now, we mock valid styles
export default function GuardianStatus() {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'alert'>('idle');
    const [lastScan, setLastScan] = useState<Date>(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus('scanning');
            setTimeout(() => {
                setStatus('idle');
                setLastScan(new Date());
            }, 2000);
        }, 15000); // Fake scan pulse every 15s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        🛡️ Portfolio Guardian
                    </h3>
                    <p className="text-xs text-gray-400">
                        AI Status: <span className={status === 'scanning' ? 'text-yellow-400' : 'text-green-400'}>
                            {status === 'scanning' ? 'ANALYZING NEWS...' : 'ACTIVE & MONITORING'}
                        </span>
                    </p>
                </div>

                <div className={`w-3 h-3 rounded-full ${status === 'scanning' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            </div>

            <div className="mt-3 text-xs text-gray-500 border-t border-slate-800 pt-2">
                Last scan: {lastScan.toLocaleTimeString()} &bull; 0 Critical Threats Found
            </div>
        </div>
    );
}
