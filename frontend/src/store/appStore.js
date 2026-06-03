import { create } from 'zustand'
import { systemApi } from '../services/api'

export const useAppStore = create((set) => ({
  health: null,
  ragStatus: null,
  isLoadingStatus: false,
  statusError: null,

  loadSystemStatus: async () => {
    set({ isLoadingStatus: true, statusError: null })

    try {
      const [health, ragStatus] = await Promise.all([
        systemApi.getHealth(),
        systemApi.getRagStatus(),
      ])

      set({
        health,
        ragStatus,
        isLoadingStatus: false,
      })
    } catch (error) {
      set({
        statusError: error.message || 'Failed to connect to backend',
        isLoadingStatus: false,
      })
    }
  },
}))