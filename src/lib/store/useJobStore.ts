import { create } from 'zustand';
import { JopData, JosData } from '@/features/job/jobTypes';

interface JobFilters {
  status: string[];
  tipe: string;
  buyer: string;
  pic: string;
  dateRange: { start: string; end: string } | null;
}

interface JobState {
  // Data
  jobs: JopData[];
  josJobs: JosData[];
  
  // UI / Logic State
  filters: JobFilters;
  page: number;
  pageSize: number;
  lastFetch: number;
  isLoading: boolean;
  
  // Actions
  setJobs: (jobs: JopData[]) => void;
  setJosJobs: (jobs: JosData[]) => void;
  setLoading: (loading: boolean) => void;
  applyFilter: (key: keyof JobFilters, value: any) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  clearStore: () => void;
}

const initialFilters: JobFilters = {
  status: [],
  tipe: 'ALL',
  buyer: '',
  pic: '',
  dateRange: null,
};

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  josJobs: [],
  
  filters: initialFilters,
  page: 1,
  pageSize: 30,
  lastFetch: 0,
  isLoading: false,

  setJobs: (jobs) => set({ jobs, lastFetch: Date.now() }),
  setJosJobs: (josJobs) => set({ josJobs, lastFetch: Date.now() }),
  setLoading: (isLoading) => set({ isLoading }),
  
  applyFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
    page: 1 // Reset to first page on filter change
  })),
  
  resetFilters: () => set({ filters: initialFilters, page: 1 }),
  
  setPage: (page) => set({ page }),
  nextPage: () => set((state) => ({ page: state.page + 1 })),
  prevPage: () => set((state) => ({ page: Math.max(1, state.page - 1) })),
  
  clearStore: () => set({
    jobs: [],
    josJobs: [],
    filters: initialFilters,
    page: 1,
    lastFetch: 0
  }),
}));
