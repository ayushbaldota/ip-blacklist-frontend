import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { api } from '../../api/client'

const BLACKLIST_PROVIDERS = [
  { id: 'zen.spamhaus.org', name: 'Spamhaus' },
  { id: 'dnsbl-1.uceprotect.net', name: 'UCE L1' },
  { id: 'dnsbl-2.uceprotect.net', name: 'UCE L2' },
  { id: 'dnsbl-3.uceprotect.net', name: 'UCE L3' },
  { id: 'dyna.spamrats.com', name: 'Dyna' },
  { id: 'noptr.spamrats.com', name: 'NoPtr' },
  { id: 'spam.spamrats.com', name: 'Spam' },
  { id: 'b.barracudacentral.org', name: 'Barracuda' },
  { id: 'bl.spamcop.net', name: 'SpamCop' },
  { id: 'dnsbl.sorbs.net', name: 'SORBS' },
  { id: 'psbl.surriel.com', name: 'PSBL' },
  { id: 'cbl.abuseat.org', name: 'CBL' },
  { id: 'bl.blocklist.de', name: 'Blocklist' },
  { id: 'dnsbl.dronebl.org', name: 'DroneBL' },
]

function IPGridRow({ ip, onDelete }) {
  const [isChecking, setIsChecking] = useState(false)
  const queryClient = useQueryClient()

  const checkMutation = useMutation({
    mutationFn: () => api.checkIP(ip.id),
    onMutate: () => setIsChecking(true),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ips'] })
        setIsChecking(false)
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

  const getCellClass = (status) => {
    switch (status) {
      case 'clean': return 'bg-green-500'
      case 'blacklisted': return 'bg-red-500'
      default: return 'bg-gray-200'
    }
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* IP Address Column */}
      <td className="sticky left-0 bg-white px-3 py-2 font-mono text-sm font-medium text-gray-900 border-r border-gray-200 z-10">
        <div className="flex items-center gap-2">
          <span>{ip.ip_address}</span>
          {isChecking && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
        </div>
      </td>

      {/* Provider Status Cells */}
      {BLACKLIST_PROVIDERS.map((provider) => {
        const status = getProviderStatus(provider.id)
        return (
          <td key={provider.id} className="px-0 py-0">
            <div
              className={`h-8 w-full ${getCellClass(status)} ${status === 'blacklisted' ? 'ring-1 ring-inset ring-red-700' : ''}`}
              title={`${provider.name}: ${status}`}
            />
          </td>
        )
      })}

      {/* Actions Column */}
      <td className="sticky right-0 bg-white px-2 py-2 border-l border-gray-200 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => checkMutation.mutate()}
            disabled={isChecking}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
            title="Check Now"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onDelete(ip)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function IPGrid({ ips, isLoading, onDelete }) {
  const queryClient = useQueryClient()
  const [checkingAll, setCheckingAll] = useState(false)

  const handleCheckAll = async () => {
    setCheckingAll(true)
    try {
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
    <div className="space-y-4">
      {/* Header with Check All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-green-500"></span> Clean
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-red-500"></span> Blacklisted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gray-200"></span> Pending
          </span>
        </div>
        <button
          onClick={handleCheckAll}
          disabled={checkingAll}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${checkingAll ? 'animate-spin' : ''}`} />
          {checkingAll ? 'Checking...' : 'Check All'}
        </button>
      </div>

      {/* Spreadsheet Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {/* IP Header */}
                <th className="sticky left-0 bg-gray-100 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-b border-gray-200 z-20 min-w-[140px]">
                  IP Address
                </th>

                {/* Provider Headers */}
                {BLACKLIST_PROVIDERS.map((provider) => (
                  <th
                    key={provider.id}
                    className="px-1 py-2 text-center text-[10px] font-semibold text-gray-600 uppercase border-b border-gray-200 min-w-[60px]"
                    title={provider.id}
                  >
                    <div className="truncate">{provider.name}</div>
                  </th>
                ))}

                {/* Actions Header */}
                <th className="sticky right-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase border-l border-b border-gray-200 z-20 w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ips.map((ip) => (
                <IPGridRow key={ip.id} ip={ip} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500">
        Showing {ips.length} IPs × {BLACKLIST_PROVIDERS.length} providers
      </div>
    </div>
  )
}

export default IPGrid
