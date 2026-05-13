import { create } from 'zustand';
import { UserData } from '../types';

interface UserState {
  user: UserData | null;
  isAuthenticated: boolean;
  
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
