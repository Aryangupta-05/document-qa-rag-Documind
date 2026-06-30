import { create } from 'zustand'
import { documentApi, systemApi ,queryApi,analyticsApi} from '../services/api'

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
  analyticsStats: null,
  isLoadingAnalytics: false,
  analyticsError: null,
  selectedDocumentIds: [],
  isRebuildingIndex: false,
  rebuildIndexError: null,
  lastRebuildResult: null,
  activeTab: 'dashboard',

  processedTextPreview: null,
  isLoadingProcessedText: false,
  processedTextError: null,

  notification: null,

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
      notification: {
      type: 'success',
      message: 'Document uploaded and processed.',
      },
    })
  } catch (error) {
    set({
      uploadError: error.response?.data?.detail || error.message || 'Failed to upload document',
      isUploadingDocument: false,
      notification: {
      type: 'error',
      message: error.response?.data?.detail || error.message || 'Failed to upload document',
      },
    })
  }
},

askQuestion: async (question) => {

  const selectedDocumentIds = useAppStore.getState().selectedDocumentIds

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
      documentIds: selectedDocumentIds,
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
    const analyticsData = await analyticsApi.getStats()

    set((state) => ({
      chatMessages: [...state.chatMessages, assistantMessage],
      queryHistory: historyData.queries || state.queryHistory,
      analyticsStats: analyticsData,
      isAskingQuestion: false,

      notification: {
      type: 'success',
      message: 'Answer generated.',
        },
    }))
  } catch (error) {
    set({
      questionError: error.response?.data?.detail || error.message || 'Failed to ask question',
      isAskingQuestion: false,
      notification: {
      type: 'error',
      message: error.response?.data?.detail || error.message || 'Failed to ask question',
      },
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

loadAnalyticsStats: async () => {
  set({ isLoadingAnalytics: true, analyticsError: null })

  try {
    const stats = await analyticsApi.getStats()

    set({
      analyticsStats: stats,
      isLoadingAnalytics: false,
    })
  } catch (error) {
    set({
      analyticsError: error.message || 'Failed to load analytics',
      isLoadingAnalytics: false,
    })
  }
},

deleteDocument: async (documentId) => {
  try {
    await documentApi.deleteDocument(documentId)
    const data = await documentApi.getDocuments()

    set({
      documents: data.documents || [],
      notification: {
      type: 'success',
      message: 'Document deleted.',
      },
    })
  } catch (error) {
    set({
      documentsError: error.response?.data?.detail || error.message || 'Failed to delete document',
      notification: {
      type: 'error',
      message: error.response?.data?.detail || error.message || 'Failed to delete document',
      },
    })
  }
},

toggleSelectedDocument: (documentId) => {
  set((state) => {
    const isSelected = state.selectedDocumentIds.includes(documentId)

    return {
      selectedDocumentIds: isSelected
        ? state.selectedDocumentIds.filter((id) => id !== documentId)
        : [...state.selectedDocumentIds, documentId],
    }
  })
},
setChatMessages: (updater) => {
  set((state) => ({
    chatMessages:
      typeof updater === 'function'
        ? updater(state.chatMessages)
        : updater,
  }))
},

clearChat: () => {
  set({
    chatMessages: [],
    questionError: null,
  })
},

rebuildIndex: async () => {
  set({
    isRebuildingIndex: true,
    rebuildIndexError: null,
  })

  try {
    const result = await documentApi.rebuildIndex()
    const ragStatus = await systemApi.getRagStatus()

    set({
      lastRebuildResult: result,
      ragStatus,
      isRebuildingIndex: false,
      notification: {
      type: 'success',
      message: 'Vector index rebuilt.',
      },
    })
  } catch (error) {
    set({
      rebuildIndexError: error.response?.data?.detail || error.message || 'Failed to rebuild index',
      isRebuildingIndex: false,
      notification: {
      type: 'error',
      message: error.response?.data?.detail || error.message || 'Failed to rebuild index',
      },
    })
  }
},

setActiveTab: (tab) => {
  set({ activeTab: tab })
},

loadProcessedText: async (documentId) => {
  set({
    isLoadingProcessedText: true,
    processedTextError: null,
  })

  try {
    const data = await documentApi.getProcessedText(documentId)

    set({
      processedTextPreview: data,
      isLoadingProcessedText: false,
    })
  } catch (error) {
    set({
      processedTextError: error.response?.data?.detail || error.message || 'Failed to load processed text',
      isLoadingProcessedText: false,
    })
  }
},

closeProcessedTextPreview: () => {
  set({
    processedTextPreview: null,
    processedTextError: null,
  })
},

setNotification: (notification) => {
  set({ notification })
},

clearNotification: () => {
  set({ notification: null })
},

}))