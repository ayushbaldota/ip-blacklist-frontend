import { useQuery } from '@tanstack/react-query'
import { Activity, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../../api/client'

function Header({ title }) {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 30000,
  })

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">API Status:</span>
          {isLoading ? (
            <span className="text-gray-400">Checking...</span>
          ) : health?.status === 'healthy' ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Healthy
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" />
              Unhealthy
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
