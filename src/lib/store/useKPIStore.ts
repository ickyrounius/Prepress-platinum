import { create } from 'zustand';
import { DailyKPI } from '@/features/job/jobTypes';

interface KPIState {
  kpiByUser: Record<string, DailyKPI[]>;
  kpiDate: string;          // YYYY-MM-DD currently viewed
  isLoading: boolean;

  setKPI: (uid: string, data: DailyKPI[]) => void;
  setKPIDate: (date: string) => void;
  setLoading: (loading: boolean) => void;
  clearKPI: () => void;
}

export const useKPIStore = create<KPIState>((set) => ({
  kpiByUser: {},
  kpiDate: new Date().toISOString().split('T')[0],
  isLoading: false,

  setKPI: (uid, data) => set((state) => ({
    kpiByUser: { ...state.kpiByUser, [uid]: data },
  })),
  setKPIDate: (kpiDate) => set({ kpiDate }),
  setLoading: (isLoading) => set({ isLoading }),
  clearKPI: () => set({ kpiByUser: {}, isLoading: false }),
}));
