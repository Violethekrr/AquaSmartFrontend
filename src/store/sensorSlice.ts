import { create } from 'zustand';

interface SensorState {
  latest: Record<string, number>;
  history: any[];
  setLatest: (data: Record<string, number>) => void;
  setHistory: (history: any[]) => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  latest: {},
  history: [],
  setLatest: (data) => set({ latest: data }),
  setHistory: (history) => set({ history }),
}));