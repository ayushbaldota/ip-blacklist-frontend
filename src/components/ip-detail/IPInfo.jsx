import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Globe, Calendar, AlertTriangle } from 'lucide-react'
import StatusBadge from '../ips/StatusBadge'
import Button from '../common/Button'
import { api } from '../../api/client'

function formatDate(dateString) {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

function IPInfo({ ip }) {
  const queryClient = useQueryClient()

  const checkMutation = useMutation({
    mutationFn: () => api.checkIP(ip.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ip', ip.id] })
      queryClient.invalidateQueries({ queryKey: ['ip-history', ip.id] })
    },
  })

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-full">
              <Globe className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-mono font-semibold">{ip.ip_address}</h2>
              <p className="text-gray-500">{ip.description || 'No description'}</p>
            </div>
          </div>
          <StatusBadge status={ip.status} />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Added</p>
            <p className="mt-1 font-medium">{formatDate(ip.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Checked</p>
            <p className="mt-1 font-medium">{formatDate(ip.last_checked)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Checks</p>
            <p className="mt-1 font-medium">{ip.check_count || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Listings</p>
            <p className="mt-1 font-medium">{ip.blacklist_count || 0}</p>
          </div>
        </div>

        {ip.status === 'blacklisted' && ip.blacklists && ip.blacklists.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertTriangle className="h-5 w-5" />
              Listed on {ip.blacklists.length} blacklist(s)
            </div>
            <ul className="space-y-1">
              {ip.blacklists.map((bl, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  {bl.provider || bl}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => checkMutation.mutate()}
            loading={checkMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Now
          </Button>
        </div>

        {checkMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Check initiated successfully. Results will update shortly.
          </div>
        )}

        {checkMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            Failed to initiate check. Please try again.
          </div>
        )}
      </div>
    </div>
  )
}

export default IPInfo
