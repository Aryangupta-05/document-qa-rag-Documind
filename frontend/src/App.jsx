import { useEffect } from 'react'
import {BarChart3,Brain,Database,FileText,History,LayoutDashboard,MessageSquare,RefreshCw,
} from 'lucide-react'

import { useAppStore } from './store/appStore'
import DocumentList from './components/DocumentList'
import DocumentUpload from './components/DocumentUpload'
import ChatPanel from './components/ChatPanel'
import QueryHistory from './components/QueryHistory'
import AnalyticsStats from './components/AnalyticsStats'
import RebuildIndexPanel from './components/RebuildIndexPanel'
import ProcessedTextPreview from './components/ProcessedTextPreview'
import NotificationBanner from './components/NotificationBanner'

function App() {
  const {
    health,
    ragStatus,
    isLoadingStatus,
    statusError,
    loadSystemStatus,
    loadDocuments,
    loadQueryHistory,
    loadAnalyticsStats,
    activeTab,
    setActiveTab,
  } = useAppStore()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const activeNavItem = navItems.find((item) => item.id === activeTab)

  useEffect(() => {
    loadSystemStatus()
    loadDocuments()
    loadQueryHistory()
    loadAnalyticsStats()
  }, [loadSystemStatus,loadDocuments,loadQueryHistory,loadAnalyticsStats,])

  const renderActiveTab = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                API Status
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {health?.status || 'Unknown'}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Database: {health?.database || 'unknown'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                LLM
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-950">
                {ragStatus?.llm_model || 'Unknown'}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Configured:{' '}
                {ragStatus?.llm_configured ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Database size={16} />
                Vector Store
              </div>

              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {ragStatus?.vector_store?.total_chunks ?? 0}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Indexed Chunks
              </p>
            </div>
          </section>

          <RebuildIndexPanel />
        </div>
      )
    }

    if (activeTab === 'documents') {
      return (
        <div className="space-y-6">
          <DocumentUpload />
          <DocumentList />
          <ProcessedTextPreview />
        </div>
      )
    }

    if (activeTab === 'chat') {
      return <ChatPanel />
    }

    if (activeTab === 'history') {
      return <QueryHistory />
    }

    if (activeTab === 'analytics') {
      return <AnalyticsStats />
    }

    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white px-5 py-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Brain size={22} />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-950">
              DocuMind AI
            </h1>

            <p className="text-xs text-slate-500">
              Document Assistant
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="ml-64 min-h-screen px-8 py-6">
        <header className="mb-6 flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              {activeNavItem?.label || 'Dashboard'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage documents, ask questions, and inspect RAG system activity.
            </p>

          </div>

          <button
            onClick={loadSystemStatus}
            disabled={isLoadingStatus}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isLoadingStatus ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </header>

        {statusError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {statusError}
          </div>
        )}
        <NotificationBanner />
        {renderActiveTab()}
      </main>
    </div>
  )
}

export default App