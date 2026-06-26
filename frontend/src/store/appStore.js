import { create } from 'zustand'
import { documentApi, systemApi ,queryApi} from '../services/api'

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
  chatMessages: [],
  isAskingQuestion: false,
  questionError: null,
  queryHistory: [],
  isLoadingHistory: false,
  historyError: null,

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

askQuestion: async (question) => {
  const userMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: question,
  }

  set((state) => ({
    chatMessages: [...state.chatMessages, userMessage],
    isAskingQuestion: true,
    questionError: null,
  }))

  try {
    const result = await queryApi.askQuestion({
      question,
      topK: 3,
    })

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.answer,
      sources: result.sources || [],
      success: result.success,
      responseTime: result.response_time,
      model: result.model,
    }

    const historyData = await queryApi.getHistory()

    set((state) => ({
      chatMessages: [...state.chatMessages, assistantMessage],
      queryHistory: historyData.queries || state.queryHistory,
      isAskingQuestion: false,
    }))
  } catch (error) {
    set({
      questionError: error.response?.data?.detail || error.message || 'Failed to ask question',
      isAskingQuestion: false,
    })
  }
},

loadQueryHistory: async () => {
  set({ isLoadingHistory: true, historyError: null })

  try {
    const data = await queryApi.getHistory()

    set({
      queryHistory: data.queries || [],
      isLoadingHistory: false,
    })
  } catch (error) {
    set({
      historyError: error.message || 'Failed to load query history',
      isLoadingHistory: false,
    })
  }
},

}))