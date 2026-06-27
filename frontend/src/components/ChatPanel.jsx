import { useState } from 'react'
import { Bot, Send, User } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function ChatPanel() {
  const [question, setQuestion] = useState('')
  const { chatMessages, askQuestion, isAskingQuestion, questionError ,selectedDocumentIds} = useAppStore()

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      return
    }

    setQuestion('')
    await askQuestion(trimmedQuestion)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        
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
                <p className="whitespace-pre-wrap">{message.content}</p>

                {!isUser && message.sources?.length > 0 && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sources
                    </p>

                    <div className="space-y-2">
                      {message.sources.slice(0, 3).map((source, index) => (
                        <div key={`${source.document_id}-${source.chunk_index}-${index}`} className="rounded-md bg-slate-50 p-2">
                          <p className="text-xs font-medium text-slate-700">
                            {source.filename} · chunk {source.chunk_index}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {source.text}
                          </p>
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

        {isAskingQuestion && (
          <p className="text-sm text-slate-500">Thinking...</p>
        )}
      </div>

      {questionError && (
        <p className="mb-3 text-sm text-red-600">{questionError}</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about your documents..."
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />

        <button
          type="submit"
          disabled={!question.trim() || isAskingQuestion}
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