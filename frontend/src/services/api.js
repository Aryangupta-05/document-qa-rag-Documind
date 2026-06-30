import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

export const api = axios.create({
  baseURL: API_BASE_URL,
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

  rebuildIndex: async () => {
  const response = await api.post('/documents/rebuild-index')
  return response.data
},
  getProcessedText: async (documentId) => {
  const response = await api.get(`/documents/${documentId}/processed-text`)
  return response.data
},
}

export const queryApi = {
  askQuestion: async ({ question, topK = 3, documentIds = [] }) => {
    const response = await api.post('/query/ask', {
      question,
      top_k: topK,
      document_ids: documentIds,
    })

    return response.data
  },

  askQuestionStream: async ({
    question,
    topK = 3,
    documentIds = [],
    onSources,
    onToken,
    onDone,
    onError,
  }) => {
    const response = await fetch(`${API_BASE_URL}/query/ask-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        top_k: topK,
        document_ids: documentIds,
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error('Streaming request failed')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const event of events) {
        if (!event.startsWith('data: ')) {
          continue
        }

        const jsonText = event.replace('data: ', '').trim()

        if (!jsonText) {
          continue
        }

        const payload = JSON.parse(jsonText)

        if (payload.type === 'sources') {
          onSources?.(payload.sources)
        }

        if (payload.type === 'token') {
          onToken?.(payload.content)
        }

        if (payload.type === 'done') {
          onDone?.(payload)
        }

        if (payload.type === 'error') {
          onError?.(payload.message)
        }
      }
    }
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

