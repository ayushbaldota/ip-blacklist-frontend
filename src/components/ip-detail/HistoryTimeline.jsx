import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

const statusIcons = {
  clean: CheckCircle,
  blacklisted: AlertTriangle,
  pending: Clock,
}

const statusColors = {
  clean: 'text-green-600 bg-green-50',
  blacklisted: 'text-red-600 bg-red-50',
  pending: 'text-yellow-600 bg-yellow-50',
}

function HistoryTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No check history available
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => {
          const Icon = statusIcons[item.status] || Clock
          const colorClass = statusColors[item.status] || 'text-gray-600 bg-gray-50'

          return (
            <li key={item.id || idx}>
              <div className="relative pb-8">
                {idx !== history.length - 1 && (
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
                      <p className="text-sm font-medium text-gray-900">
                        {item.status === 'clean' && 'Clean - No listings found'}
                        {item.status === 'blacklisted' && `Blacklisted on ${item.blacklist_count || item.blacklists?.length || 0} list(s)`}
                        {item.status === 'pending' && 'Check in progress'}
                      </p>
                      {item.blacklists && item.blacklists.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.blacklists.map(b => b.provider || b).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {formatDate(item.checked_at || item.created_at)}
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

export default HistoryTimeline
