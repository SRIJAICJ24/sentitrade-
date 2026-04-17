import { create } from 'zustand';

interface MarketStore {
    activeAsset: string | null;
    activeAssetName: string | null;
    setActiveAsset: (symbol: string | null, name?: string) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
    activeAsset: null, // Default to Observer State
    activeAssetName: null,
    setActiveAsset: (symbol, name) => set({
        activeAsset: symbol,
        activeAssetName: name || symbol
    }),
}));
