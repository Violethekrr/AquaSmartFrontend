import { create } from 'zustand';

interface AlarmState {
  alarms: any[];
  unreadCount: number;
  setAlarms: (alarms: any[]) => void;
  acknowledge: (id: number) => void;
}

export const useAlarmStore = create<AlarmState>((set) => ({
  alarms: [],
  unreadCount: 0,
  setAlarms: (alarms) => set({ alarms, unreadCount: alarms.filter(a => !a.acknowledged).length }),
  acknowledge: (id) => set((state) => ({
    alarms: state.alarms.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    unreadCount: state.alarms.filter(a => !a.acknowledged).length - 1,
  })),
}));