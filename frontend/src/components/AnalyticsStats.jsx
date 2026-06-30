import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Percent,
  XCircle,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

function AnalyticsStats() {
  const { analyticsStats, isLoadingAnalytics, analyticsError } = useAppStore()

  const totalDocuments = analyticsStats?.total_documents ?? 0
  const totalQueries = analyticsStats?.total_queries ?? 0
  const successfulQueries = analyticsStats?.successful_queries ?? 0
  const failedQueries = analyticsStats?.failed_queries ?? 0
  const averageResponseTime = analyticsStats?.average_response_time ?? 0

  const successRate =
    totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0

  const failureRate =
    totalQueries > 0 ? (failedQueries / totalQueries) * 100 : 0

  const cards = [
    {
      label: 'Documents',
      value: totalDocuments,
      icon: FileText,
      helper: 'Uploaded records',
    },
    {
      label: 'Queries',
      value: totalQueries,
      icon: Activity,
      helper: 'Questions asked',
    },
    {
      label: 'Successful',
      value: successfulQueries,
      icon: CheckCircle,
      helper: 'Answered queries',
    },
    {
      label: 'Failed',
      value: failedQueries,
      icon: XCircle,
      helper: 'Failed queries',
    },
    {
      label: 'Avg response',
      value: `${averageResponseTime.toFixed(2)}s`,
      icon: Clock,
      helper: 'LLM response time',
    },
    {
      label: 'Success rate',
      value: `${successRate.toFixed(1)}%`,
      icon: Percent,
      helper: 'Answer reliability',
    },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Analytics</h3>
          <p className="mt-1 text-sm text-slate-500">
            Usage, reliability, and response metrics from the RAG backend.
          </p>
        </div>

        <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white md:flex">
          <BarChart3 size={18} />
        </div>
      </div>

      {isLoadingAnalytics && (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      )}

      {analyticsError && (
        <p className="text-sm text-red-600">{analyticsError}</p>
      )}

      {!isLoadingAnalytics && !analyticsError && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon

              return (
                <div
                  key={card.label}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                      <Icon size={18} />
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      {card.helper}
                    </span>
                  </div>

                  <p className="text-2xl font-semibold text-slate-950">
                    {card.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{card.label}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  Query Outcome
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Successful vs failed RAG queries.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Successful</span>
                    <span className="font-medium text-slate-900">
                      {successfulQueries}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Failed</span>
                    <span className="font-medium text-slate-900">
                      {failedQueries}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${failureRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  RAG Health Summary
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Quick interpretation of current system usage.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Reliability</span>
                  <span className="font-medium text-slate-900">
                    {successRate.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Average response</span>
                  <span className="font-medium text-slate-900">
                    {averageResponseTime.toFixed(2)}s
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Documents indexed</span>
                  <span className="font-medium text-slate-900">
                    {totalDocuments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AnalyticsStats