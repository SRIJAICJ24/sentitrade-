import { create } from 'zustand';

interface DataState {
    marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
    lastUpdated: string | null;
    setMarketStatus: (status: DataState['marketStatus']) => void;
    setLastUpdated: (date: string) => void;
}

export const useDataStore = create<DataState>((set) => ({
    marketStatus: 'open',
    lastUpdated: null,
    setMarketStatus: (status) => set({ marketStatus: status }),
    setLastUpdated: (date) => set({ lastUpdated: date }),
}));
