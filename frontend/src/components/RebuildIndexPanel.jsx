import { RefreshCw } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function RebuildIndexPanel() {
  const {
    rebuildIndex,
    isRebuildingIndex,
    rebuildIndexError,
    lastRebuildResult,
  } = useAppStore()

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Vector index</h3>
          <p className="mt-1 text-sm text-slate-500">
            Rebuild FAISS from processed documents if search results look stale.
          </p>
        </div>

        <button
          type="button"
          onClick={rebuildIndex}
          disabled={isRebuildingIndex}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRebuildingIndex ? 'animate-spin' : ''} />
          {isRebuildingIndex ? 'Rebuilding...' : 'Rebuild index'}
        </button>
      </div>

      {rebuildIndexError && (
        <p className="mt-3 text-sm text-red-600">{rebuildIndexError}</p>
      )}

      {lastRebuildResult && (
        <p className="mt-3 text-sm text-slate-600">
          Indexed {lastRebuildResult.chunks_indexed} chunks from{' '}
          {lastRebuildResult.documents_considered} processed document(s).
        </p>
      )}
    </section>
  )
}

export default RebuildIndexPanel