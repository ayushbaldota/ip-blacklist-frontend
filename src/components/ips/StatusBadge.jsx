import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const statusConfig = {
  clean: {
    label: 'Clean',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800',
  },
  blacklisted: {
    label: 'Blacklisted',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800',
  },
  unknown: {
    label: 'Unknown',
    icon: Clock,
    className: 'bg-gray-100 text-gray-800',
  },
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.unknown
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  )
}

export default StatusBadge
