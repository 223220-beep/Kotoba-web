"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types";

// ================================================
// Auth Store
// ================================================

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser:     (user: User, token: string) => void;
  logout:      () => void;
  updateUser:  (partial: Partial<User>) => void;
  fetchMe:     () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,

      setUser: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("kotoba_token", token);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("kotoba_token");
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      fetchMe: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("kotoba_token") : null;
        if (!token) {
          set({ isLoading: false });
          return;
        }
        set({ isLoading: true });
        try {
          const { default: api } = await import("@/lib/api");
          const user = await api.auth.me();
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem("kotoba_token");
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name:    "kotoba-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ================================================
// UI Store
// ================================================

interface UIStore {
  sidebarCollapsed: boolean;
  readingFontSize:  number;

  toggleSidebar:   () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setReadingFontSize: (size: number) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      readingFontSize:  18,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      setReadingFontSize: (size) => set({ readingFontSize: size }),
    }),
    {
      name: "kotoba-ui",
    }
  )
);
