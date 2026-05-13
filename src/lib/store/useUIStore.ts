import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  activePanel: string;
  tableView: 'compact' | 'full';

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: string) => void;
  setTableView: (view: 'compact' | 'full') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activePanel: 'dashboard',
      tableView: 'compact',

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setActivePanel: (activePanel) => set({ activePanel }),
      setTableView: (tableView) => set({ tableView }),
    }),
    {
      name: 'pp-ui-prefs',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        tableView: state.tableView,
      }),
    }
  )
);
