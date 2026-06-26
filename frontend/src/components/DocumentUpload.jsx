import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null)
  const { uploadDocument, isUploadingDocument, uploadError } = useAppStore()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      return
    }

    await uploadDocument(selectedFile)
    setSelectedFile(null)
    event.target.reset()
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Upload size={18} className="text-slate-600" />
        <h3 className="text-base font-semibold text-slate-950">Upload document</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".pdf,.docx,.txt,.html,.md"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
        />

        {selectedFile && (
          <p className="text-sm text-slate-500">
            Selected: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}

        {uploadError && (
          <p className="text-sm text-red-600">{uploadError}</p>
        )}

        <button
          type="submit"
          disabled={!selectedFile || isUploadingDocument}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploadingDocument ? 'Uploading...' : 'Upload and process'}
        </button>
      </form>
    </section>
  )
}

export default DocumentUpload