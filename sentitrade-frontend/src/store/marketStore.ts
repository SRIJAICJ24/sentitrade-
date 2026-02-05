import { create } from 'zustand';

interface MarketStore {
    activeAsset: string;
    activeAssetName: string;
    setActiveAsset: (symbol: string, name?: string) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
    activeAsset: 'RELIANCE.NS', // Default
    activeAssetName: 'Reliance Industries',
    setActiveAsset: (symbol, name) => set({
        activeAsset: symbol,
        activeAssetName: name || symbol
    }),
}));
