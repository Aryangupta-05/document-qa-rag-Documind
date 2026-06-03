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