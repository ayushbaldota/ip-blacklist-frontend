import { useQuery } from '@tanstack/react-query'
import { Clock, AlertTriangle, CheckCircle, Plus, Trash2, RefreshCw, Edit } from 'lucide-react'
import { api } from '../../api/client'
import Loading from '../common/Loading'

const activityIcons = {
  check_clean: CheckCircle,
  check_blacklisted: AlertTriangle,
  ip_added: Plus,
  ip_deleted: Trash2,
  ip_updated: Edit,
  manual_check: RefreshCw,
  status_change: AlertTriangle,
}

const activityColors = {
  check_clean: 'text-green-600 bg-green-50',
  check_blacklisted: 'text-red-600 bg-red-50',
  ip_added: 'text-blue-600 bg-blue-50',
  ip_deleted: 'text-gray-600 bg-gray-50',
  ip_updated: 'text-purple-600 bg-purple-50',
  manual_check: 'text-orange-600 bg-orange-50',
  status_change: 'text-yellow-600 bg-yellow-50',
}

function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function getActivityMessage(activity) {
  const type = activity.type || activity.activity_type
  const ip = activity.ip || activity.ip_address

  switch (type) {
    case 'check_clean':
      return `${ip} checked - Clean`
    case 'check_blacklisted':
      return `${ip} is blacklisted`
    case 'ip_added':
      return `${ip} added to monitoring`
    case 'ip_deleted':
      return `${ip} removed from monitoring`
    case 'ip_updated':
      return `${ip} updated`
    case 'manual_check':
      return `Manual check triggered for ${ip}`
    case 'status_change':
      return `${ip} status changed: ${activity.old_status} → ${activity.new_status}`
    default:
      return activity.message || activity.description || `Activity for ${ip}`
  }
}

function RecentActivity() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.getActivity({ limit: 10 }),
    refetchInterval: 30000,
  })

  if (isLoading) return <Loading size="sm" />

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        Unable to load activity
      </div>
    )
  }

  const activities = data?.items || data || []

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activity
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const type = activity.type || activity.activity_type || 'check_clean'
          const Icon = activityIcons[type] || Clock
          const colorClass = activityColors[type] || 'text-gray-600 bg-gray-50'
          const timestamp = activity.created_at || activity.timestamp

          return (
            <li key={activity.id || idx}>
              <div className="relative pb-8">
                {idx !== activities.length - 1 && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        {getActivityMessage(activity)}
                      </p>
                      {activity.triggered_by && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          by {activity.triggered_by}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-gray-500">
                      {formatTimeAgo(timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RecentActivity
