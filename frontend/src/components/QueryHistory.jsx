import { Clock } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function QueryHistory() {
  const { queryHistory, isLoadingHistory, historyError } = useAppStore()

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Clock size={18} className="text-slate-600" />
        <h3 className="text-base font-semibold text-slate-950">Query history</h3>
      </div>

      {isLoadingHistory && (
        <p className="text-sm text-slate-500">Loading query history...</p>
      )}

      {historyError && (
        <p className="text-sm text-red-600">{historyError}</p>
      )}

      {!isLoadingHistory && !historyError && queryHistory.length === 0 && (
        <p className="text-sm text-slate-500">No questions asked yet.</p>
      )}

      {queryHistory.length > 0 && (
        <div className="space-y-3">
          {queryHistory.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">
                  {item.question}
                </p>

                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                    item.success
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {item.success ? 'success' : 'failed'}
                </span>
              </div>

              <p className="line-clamp-2 text-sm text-slate-600">
                {item.answer || 'No answer saved.'}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {item.model || 'no model'} · {item.sources_count} sources · {item.response_time.toFixed(2)}s
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default QueryHistory