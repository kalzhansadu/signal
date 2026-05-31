import { create } from 'zustand';
import type { Timeframe } from '../types/domain';

type Page = 'dashboard' | 'statistics' | 'settings';

interface UiState {
  page: Page;
  symbol: string;
  timeframe: Timeframe;
  overlays: {
    orderBlocks: boolean;
    fairValueGaps: boolean;
    liquidity: boolean;
    structure: boolean;
    equilibrium: boolean;
  };
  setPage: (page: Page) => void;
  setSymbol: (symbol: string) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  toggleOverlay: (key: keyof UiState['overlays']) => void;
}

export const useUiStore = create<UiState>((set) => ({
  page: 'dashboard',
  symbol: 'XAUUSD',
  timeframe: '1h',
  overlays: {
    orderBlocks: true,
    fairValueGaps: true,
    liquidity: true,
    structure: true,
    equilibrium: true,
  },
  setPage: (page) => set({ page }),
  setSymbol: (symbol) => set({ symbol }),
  setTimeframe: (timeframe) => set({ timeframe }),
  toggleOverlay: (key) => set((state) => ({ overlays: { ...state.overlays, [key]: !state.overlays[key] } })),
}));
