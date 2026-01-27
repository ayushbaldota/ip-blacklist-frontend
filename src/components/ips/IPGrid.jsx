import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Trash2, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { api } from '../../api/client'

const BLACKLIST_PROVIDERS = [
  { id: 'zen.spamhaus.org', name: 'Spamhaus' },
  { id: 'dnsbl-1.uceprotect.net', name: 'UCE L1' },
  { id: 'dnsbl-2.uceprotect.net', name: 'UCE L2' },
  { id: 'dnsbl-3.uceprotect.net', name: 'UCE L3' },
  { id: 'dyna.spamrats.com', name: 'SpamRATS Dyna' },
  { id: 'noptr.spamrats.com', name: 'SpamRATS NoPtr' },
  { id: 'spam.spamrats.com', name: 'SpamRATS Spam' },
  { id: 'b.barracudacentral.org', name: 'Barracuda' },
  { id: 'bl.spamcop.net', name: 'SpamCop' },
  { id: 'dnsbl.sorbs.net', name: 'SORBS' },
  { id: 'psbl.surriel.com', name: 'PSBL' },
  { id: 'cbl.abuseat.org', name: 'CBL' },
  { id: 'bl.blocklist.de', name: 'Blocklist.de' },
  { id: 'dnsbl.dronebl.org', name: 'DroneBL' },
]

function IPCard({ ip, onDelete, onCheckComplete }) {
  const [isChecking, setIsChecking] = useState(false)
  const queryClient = useQueryClient()

  const checkMutation = useMutation({
    mutationFn: () => api.checkIP(ip.id),
    onMutate: () => setIsChecking(true),
    onSuccess: () => {
      // Poll for result after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ips'] })
        setIsChecking(false)
        if (onCheckComplete) onCheckComplete()
      }, 3000)
    },
    onError: () => setIsChecking(false),
  })

  // Get blacklisted providers from blacklist_sources
  const blacklistedProviders = new Set(
    (ip.blacklist_sources || []).map(s => s.provider || s.zone || s)
  )

  const getProviderStatus = (providerId) => {
    if (ip.status === 'pending') return 'pending'
    if (blacklistedProviders.has(providerId)) return 'blacklisted'
    return 'clean'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'clean': return 'bg-green-500'
      case 'blacklisted': return 'bg-red-500'
      case 'pending': return 'bg-gray-300'
      default: return 'bg-gray-300'
    }
  }

  const getOverallStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    switch (ip.status) {
      case 'clean': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'blacklisted': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getOverallStatusIcon()}
          <div>
            <span className="font-mono font-semibold text-gray-900">{ip.ip_address}</span>
            {ip.description && (
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{ip.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => checkMutation.mutate()}
            disabled={isChecking}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Check Now"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onDelete(ip)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Blacklist Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {BLACKLIST_PROVIDERS.map((provider) => {
            const status = getProviderStatus(provider.id)
            return (
              <div
                key={provider.id}
                className="group relative"
                title={`${provider.name}: ${status}`}
              >
                <div
                  className={`h-6 rounded ${getStatusColor(status)} ${
                    status === 'blacklisted' ? 'ring-2 ring-red-300' : ''
                  }`}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {provider.name}
                  <span className={`ml-1 ${status === 'blacklisted' ? 'text-red-400' : status === 'clean' ? 'text-green-400' : 'text-gray-400'}`}>
                    ({status})
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500"></span> Clean
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500"></span> Listed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-gray-300"></span> Pending
            </span>
          </div>
          {ip.last_checked && (
            <span>Checked: {new Date(ip.last_checked).toLocaleString()}</span>
          )}
        </div>

        {/* Blacklisted Sources Detail */}
        {ip.blacklist_sources && ip.blacklist_sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-red-600 mb-1">
              Listed on {ip.blacklist_sources.length} blacklist(s):
            </p>
            <div className="flex flex-wrap gap-1">
              {ip.blacklist_sources.map((source, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded"
                >
                  {source.provider || source.zone || source}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function IPGrid({ ips, isLoading, onDelete }) {
  const queryClient = useQueryClient()
  const [checkingAll, setCheckingAll] = useState(false)

  const handleCheckAll = async () => {
    setCheckingAll(true)
    try {
      // Check first 10 IPs (rate limited)
      const toCheck = ips.slice(0, 10)
      await Promise.all(toCheck.map(ip => api.checkIP(ip.id).catch(() => {})))
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ips'] })
        setCheckingAll(false)
      }, 5000)
    } catch {
      setCheckingAll(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-3 text-gray-500">Loading IPs...</span>
      </div>
    )
  }

  if (!ips || ips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No IP addresses found</p>
        <p className="text-sm text-gray-400 mt-1">Add some IPs to start monitoring</p>
      </div>
    )
  }

  return (
    <div>
      {/* Check All Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleCheckAll}
          disabled={checkingAll}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${checkingAll ? 'animate-spin' : ''}`} />
          {checkingAll ? 'Checking...' : 'Check All (First 10)'}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ips.map((ip) => (
          <IPCard key={ip.id} ip={ip} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

export default IPGrid
