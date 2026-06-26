import { Activity, BarChart3, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function AnalyticsStats() {
  const { analyticsStats, isLoadingAnalytics, analyticsError } = useAppStore()

  const cards = [
    {
      label: 'Documents',
      value: analyticsStats?.total_documents ?? 0,
      icon: BarChart3,
    },
    {
      label: 'Queries',
      value: analyticsStats?.total_queries ?? 0,
      icon: Activity,
    },
    {
      label: 'Successful',
      value: analyticsStats?.successful_queries ?? 0,
      icon: CheckCircle,
    },
    {
      label: 'Failed',
      value: analyticsStats?.failed_queries ?? 0,
      icon: XCircle,
    },
    {
      label: 'Avg response',
      value: `${(analyticsStats?.average_response_time ?? 0).toFixed(2)}s`,
      icon: Clock,
    },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950">Analytics</h3>
        <p className="mt-1 text-sm text-slate-500">
          Usage and response metrics from the backend.
        </p>
      </div>

      {isLoadingAnalytics && (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      )}

      {analyticsError && (
        <p className="text-sm text-red-600">{analyticsError}</p>
      )}

      {!isLoadingAnalytics && !analyticsError && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              <div key={card.label} className="rounded-md border border-slate-200 p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon size={18} />
                </div>

                <p className="text-2xl font-semibold text-slate-950">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {card.label}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AnalyticsStats