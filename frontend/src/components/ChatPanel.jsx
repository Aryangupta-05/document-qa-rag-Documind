import { useState } from 'react'
import { Bot, Send, User } from 'lucide-react'
import { queryApi } from '../services/api'
import { useAppStore } from '../store/appStore'

function ChatPanel() {
  const [question, setQuestion] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState('')

  const {
    chatMessages,
    setChatMessages,
    selectedDocumentIds,
    clearChat,
  } = useAppStore()

  const updateLastAssistantMessage = (updater) => {
    setChatMessages((currentMessages) => {
      const updatedMessages = [...currentMessages]
      const lastMessage = updatedMessages[updatedMessages.length - 1]

      updatedMessages[updatedMessages.length - 1] = updater(lastMessage)

      return updatedMessages
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isStreaming) {
      return
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
      sources: [],
    }

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      sources: [],
      isStreaming: true,
    }

    setQuestion('')
    setStreamError('')
    setIsStreaming(true)

    setChatMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ])

    try {
      await queryApi.askQuestionStream({
        question: trimmedQuestion,
        topK: 3,
        documentIds: selectedDocumentIds,

        onSources: (sources) => {
          updateLastAssistantMessage((lastMessage) => ({
            ...lastMessage,
            sources,
          }))
        },

        onToken: (token) => {
          updateLastAssistantMessage((lastMessage) => ({
            ...lastMessage,
            content: lastMessage.content + token,
          }))
        },

        onDone: () => {
          updateLastAssistantMessage((lastMessage) => ({
            ...lastMessage,
            isStreaming: false,
          }))
        },

        onError: (message) => {
          setStreamError(message)

          updateLastAssistantMessage((lastMessage) => ({
            ...lastMessage,
            content: message,
            isStreaming: false,
          }))
        },
      })
    } catch (error) {
      const message = error.message || 'Streaming request failed.'

      setStreamError(message)

      updateLastAssistantMessage((lastMessage) => ({
        ...lastMessage,
        content: message,
        isStreaming: false,
      }))
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Ask your documents</h3>
          <p className="mt-1 text-sm text-slate-500">
            Ask a question and DocuMind AI will answer using indexed document chunks.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {selectedDocumentIds.length > 0
              ? `Searching ${selectedDocumentIds.length} selected document(s).`
              : 'Searching all indexed documents.'}
          </p>
        </div>

        <button
          type="button"
          onClick={clearChat}
          disabled={chatMessages.length === 0 || isStreaming}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear chat
        </button>
      </div>

      <div className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-4">
        {chatMessages.length === 0 && (
          <p className="text-sm text-slate-500">
            No questions yet. Try asking about one of your uploaded documents.
          </p>
        )}

        {chatMessages.map((message) => {
          const isUser = message.role === 'user'
          const Icon = isUser ? User : Bot

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                  <Icon size={16} />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-lg px-4 py-3 text-sm ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {message.content}
                  {message.isStreaming && (
                    <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-slate-500 align-middle" />
                  )}
                </p>

                {!isUser && message.sources?.length > 0 && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sources
                    </p>

                    <div className="space-y-2">
                      {message.sources.slice(0, 3).map((source, index) => (
                        <div
                          key={`${source.document_id}-${source.chunk_index}-${index}`}
                          className="rounded-md bg-slate-50 p-2"
                        >
                          <p className="text-xs font-medium text-slate-700">
                            {source.filename} · chunk {source.chunk_index}
                          </p>
                          {source.text && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {source.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-200 text-slate-700">
                  <Icon size={16} />
                </div>
              )}
            </div>
          )
        })}

        {isStreaming && (
          <p className="text-sm text-slate-500">Streaming answer...</p>
        )}
      </div>

      {streamError && (
        <p className="mb-3 text-sm text-red-600">{streamError}</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about your documents..."
          disabled={isStreaming}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        <button
          type="submit"
          disabled={!question.trim() || isStreaming}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} />
          Ask
        </button>
      </form>
    </section>
  )
}

export default ChatPanel