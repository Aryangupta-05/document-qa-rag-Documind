import { FileText } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function DocumentList() {
  const { documents, isLoadingDocuments, documentsError } = useAppStore()

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
                <th className="px-4 py-3 font-medium">Filename</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Chars</th>
                <th className="px-4 py-3 font-medium">Chunks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {documents.map((document) => (
                <tr key={document.id}>
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