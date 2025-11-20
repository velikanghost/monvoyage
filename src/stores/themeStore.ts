import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // Default to light mode
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: 'monvoyage-theme', // localStorage key
    },
  ),
)

// Theme colors configuration
export const themeColors = {
  light: {
    background: 0xf5f5f5, // Light gray background
    fog: 0xe0e0e0, // Light fog
    text: '#000000',
    navbarBg: '#ffffff',
    navbarText: '#000000',
    searchBg: '#f5f5f5',
    searchBorder: '#e0e0e0',
    searchText: '#000000',
    searchPlaceholder: '#666666',
  },
  dark: {
    background: 0x0b0a0f, // Dark background (existing)
    fog: 0x1a1a1f, // Dark fog
    text: '#ffffff',
    navbarBg: '#000000',
    navbarText: '#ffffff',
    searchBg: '#1a1a1f',
    searchBorder: '#333333',
    searchText: '#ffffff',
    searchPlaceholder: '#999999',
  },
}
