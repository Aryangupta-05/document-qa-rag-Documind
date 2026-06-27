import { FileText } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { Trash2 } from 'lucide-react'

function DocumentList() {
  const { documents, isLoadingDocuments, documentsError, deleteDocument ,selectedDocumentIds,
    toggleSelectedDocument,} = useAppStore()

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FileText size={18} className="text-slate-600" />
        <h3 className="text-base font-semibold text-slate-950">Documents</h3>
      </div>

      {isLoadingDocuments && (
        <p className="text-sm text-slate-500">Loading documents...</p>
      )}

      {documentsError && (
        <p className="text-sm text-red-600">{documentsError}</p>
      )}

      {!isLoadingDocuments && !documentsError && documents.length === 0 && (
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
      )}

      {documents.length > 0 && (
        <div className="overflow-hidden rounded-md border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Use</th>
                <th className="px-4 py-3 font-medium">Filename</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Chars</th>
                <th className="px-4 py-3 font-medium">Chunks</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedDocumentIds.includes(document.id)}
                      onChange={() => toggleSelectedDocument(document.id)}
                      disabled={document.status !== 'processed' || document.chunks_created === 0}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {document.filename}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {document.file_type}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {document.status}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {document.char_count}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {document.chunks_created}
                  </td>
                  <td className="px-4 py-3">
                    <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Delete "${document.filename}"? This will remove the document and its processed text.`
                          )

                          if (confirmed) {
                            deleteDocument(document.id)
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                      >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default DocumentList