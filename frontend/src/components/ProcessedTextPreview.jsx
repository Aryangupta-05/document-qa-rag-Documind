import { X } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function ProcessedTextPreview() {
  const {
    processedTextPreview,
    isLoadingProcessedText,
    processedTextError,
    closeProcessedTextPreview,
  } = useAppStore()

  if (!processedTextPreview && !isLoadingProcessedText && !processedTextError) {
    return null
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Processed text preview</h3>
          {processedTextPreview && (
            <p className="mt-1 text-sm text-slate-500">
              {processedTextPreview.filename} · {processedTextPreview.char_count} characters
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={closeProcessedTextPreview}
          className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
        >
          <X size={16} />
        </button>
      </div>

      {isLoadingProcessedText && (
        <p className="text-sm text-slate-500">Loading processed text...</p>
      )}

      {processedTextError && (
        <p className="text-sm text-red-600">{processedTextError}</p>
      )}

      {processedTextPreview && (
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          {processedTextPreview.text}
        </pre>
      )}
    </section>
  )
}

export default ProcessedTextPreview