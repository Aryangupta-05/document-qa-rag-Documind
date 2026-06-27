import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
})

export const systemApi = {
  getHealth: async () => {
    const response = await api.get('/system/health')
    return response.data
  },

  getRagStatus: async () => {
    const response = await api.get('/system/rag-status')
    return response.data
  },
}

export const documentApi = {
  getDocuments: async () => {
    const response = await api.get('/documents')
    return response.data
  },

  uploadDocument: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  },

  deleteDocument: async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`)
  return response.data
},
}

export const queryApi = {
  askQuestion: async ({ question, topK = 3,documentIds = [] }) => {
    const response = await api.post('/query/ask', {
      question,
      top_k: topK,
      document_ids: documentIds,
    })

    return response.data
  },
  getHistory: async () => {
    const response = await api.get('/query/history')
    return response.data
  },
}

export const analyticsApi = {
  getStats: async () => {
    const response = await api.get('/analytics/stats')
    return response.data
  },
}

