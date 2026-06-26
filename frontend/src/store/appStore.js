import { create } from 'zustand'
import { documentApi, systemApi } from '../services/api'

export const useAppStore = create((set) => ({
  health: null,
  ragStatus: null,
  isLoadingStatus: false,
  statusError: null,
  documents: [],
  isLoadingDocuments: false,
  documentsError: null,
  isUploadingDocument: false,
  uploadError: null,

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
  
  loadDocuments: async () => {
  set({ isLoadingDocuments: true, documentsError: null })

  try {
    const data = await documentApi.getDocuments()

    set({
      documents: data.documents || [],
      isLoadingDocuments: false,
    })
  } catch (error) {
    set({
      documentsError: error.message || 'Failed to load documents',
      isLoadingDocuments: false,
    })
  }
},

uploadDocument: async (file) => {
  set({ isUploadingDocument: true, uploadError: null })

  try {
    await documentApi.uploadDocument(file)
    const data = await documentApi.getDocuments()

    set({
      documents: data.documents || [],
      isUploadingDocument: false,
    })
  } catch (error) {
    set({
      uploadError: error.response?.data?.detail || error.message || 'Failed to upload document',
      isUploadingDocument: false,
    })
  }
},

}))