import { X } from 'lucide-react'
import { useAppStore } from '../store/appStore'

function NotificationBanner() {
  const { notification, clearNotification } = useAppStore()

  if (!notification) {
    return null
  }

  const isSuccess = notification.type === 'success'

  return (
    <div
      className={`mb-4 flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm ${
        isSuccess
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <p>{notification.message}</p>

      <button
        type="button"
        onClick={clearNotification}
        className="rounded-md p-1 hover:bg-white/60"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default NotificationBanner