import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null, // Initial user state
  setUser: (userData) => set({ user: userData }), // Update user
}));
