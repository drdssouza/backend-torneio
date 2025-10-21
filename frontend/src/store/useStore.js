import { create } from 'zustand';

export const useStore = create((set) => ({
  isAuthenticated: false,
  username: null,
  category: 'E',
  gender: 'MASCULINO',
  groups: [],
  matches: [],
  elimination: [],
  activeTab: 'grupos',

  login: (username) => set({ isAuthenticated: true, username }),
  logout: () => set({ isAuthenticated: false, username: null }),
  setCategory: (category) => set({ category }),
  setGender: (gender) => set({ gender }),
  setGroups: (groups) => set({ groups }),
  setMatches: (matches) => set({ matches }),
  setElimination: (elimination) => set({ elimination }),
  setActiveTab: (activeTab) => set({ activeTab })
}));