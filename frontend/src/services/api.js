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
}