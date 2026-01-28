import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Trash2, Loader2, Pencil, AlertTriangle, CheckCircle, Clock, Globe } from 'lucide-react'
import { api } from '../../api/client'
import EditIPModal from './EditIPModal'

/**
 * Blacklist providers checked against each IP
 * These are DNSBL (DNS-based Blackhole Lists) used to identify spam/malicious IPs
 *
 * - id: The DNSBL zone identifier (e.g., 'zen.spamhaus.org')
 * - name: The display name used in the backend (must match backend provider_name exactly)
 * - shortName: Abbreviated name for table headers
 */
const BLACKLIST_PROVIDERS = [
  { id: 'zen.spamhaus.org', name: 'Spamhaus ZEN', shortName: 'SH' },
  { id: 'dnsbl-1.uceprotect.net', name: 'UCEProtect L1', shortName: 'UC1' },
  { id: 'dnsbl-2.uceprotect.net', name: 'UCEProtect L2', shortName: 'UC2' },
  { id: 'dnsbl-3.uceprotect.net', name: 'UCEProtect L3', shortName: 'UC3' },
  { id: 'dyna.spamrats.com', name: 'SpamRATS Dyna', shortName: 'DYN' },
  { id: 'noptr.spamrats.com', name: 'SpamRATS NoPtr', shortName: 'NPT' },
  { id: 'spam.spamrats.com', name: 'SpamRATS Spam', shortName: 'SPM' },
  { id: 'b.barracudacentral.org', name: 'Barracuda', shortName: 'BAR' },
  { id: 'bl.spamcop.net', name: 'SpamCop', shortName: 'SC' },
  { id: 'dnsbl.sorbs.net', name: 'SORBS DNSBL', shortName: 'SRB' },
  { id: 'psbl.surriel.com', name: 'PSBL', shortName: 'PSB' },
  { id: 'cbl.abuseat.org', name: 'CBL', shortName: 'CBL' },
  { id: 'bl.blocklist.de', name: 'Blocklist.de', shortName: 'BLD' },
  { id: 'dnsbl.dronebl.org', name: 'DroneBL', shortName: 'DRN' },
]

function IPGridRow({ ip, onDelete, onEdit }) {
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
  // Backend stores: { provider: "Spamhaus ZEN", details: { zone: "zen.spamhaus.org" }, ... }
  // We need to match against both provider name and zone ID
  const blacklistSources = ip.blacklist_sources || []

  // Create sets for both provider names and zone IDs for efficient lookup
  const blacklistedByName = new Set(
    blacklistSources.map(s => s.provider).filter(Boolean)
  )
  const blacklistedByZone = new Set(
    blacklistSources.map(s => s.details?.zone || s.zone).filter(Boolean)
  )

  const blacklistCount = blacklistSources.length
  const isBlacklisted = ip.status === 'blacklisted' || blacklistCount > 0
  const isPending = ip.status === 'pending'

  const getProviderStatus = (provider) => {
    if (isPending) return 'pending'
    // Check if this provider is in blacklist by name OR by zone ID
    if (blacklistedByName.has(provider.name) || blacklistedByZone.has(provider.id)) {
      return 'blacklisted'
    }
    return 'clean'
  }

  const getCellClass = (status) => {
    switch (status) {
      case 'clean': return 'bg-green-500'
      case 'blacklisted': return 'bg-red-600 animate-pulse'
      default: return 'bg-gray-300'
    }
  }

  // Row background based on status
  const getRowClass = () => {
    if (isBlacklisted) return 'bg-red-50 border-l-4 border-l-red-500'
    if (isPending) return 'bg-yellow-50 border-l-4 border-l-yellow-400'
    return 'bg-white border-l-4 border-l-green-500'
  }

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50/50 transition-colors ${getRowClass()}`}>
      {/* Status & IP Address Column */}
      <td className="sticky left-0 px-3 py-3 border-r border-gray-200 z-10" style={{ backgroundColor: 'inherit' }}>
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {isBlacklisted ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            ) : isPending ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>

          {/* IP Address & Status Text */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-gray-900">{ip.ip_address}</span>
              {isChecking && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
            </div>
            <div className="text-xs mt-0.5">
              {isBlacklisted ? (
                <span className="text-red-600 font-medium">
                  Listed on {blacklistCount} blacklist{blacklistCount !== 1 ? 's' : ''}
                </span>
              ) : isPending ? (
                <span className="text-yellow-600">Not checked yet</span>
              ) : (
                <span className="text-green-600">Clean - No listings</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Provider Status Cells */}
      {BLACKLIST_PROVIDERS.map((provider) => {
        const status = getProviderStatus(provider)
        const isListed = status === 'blacklisted'
        return (
          <td key={provider.id} className="px-0.5 py-1">
            <div
              className={`
                h-7 w-full rounded-sm flex items-center justify-center
                ${getCellClass(status)}
                ${isListed ? 'ring-2 ring-red-700 ring-inset shadow-inner' : ''}
              `}
              title={`${provider.name}: ${status === 'blacklisted' ? 'LISTED!' : status === 'clean' ? 'Clean' : 'Pending'}`}
            >
              {isListed && (
                <span className="text-[9px] font-bold text-white drop-shadow">!</span>
              )}
            </div>
          </td>
        )
      })}

      {/* Actions Column */}
      <td className="sticky right-0 px-2 py-2 border-l border-gray-200 z-10" style={{ backgroundColor: 'inherit' }}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => checkMutation.mutate()}
            disabled={isChecking}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
            title="Check Now"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onEdit(ip)}
            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(ip)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
  const [editingIP, setEditingIP] = useState(null)

  // Fetch global stats for ALL IPs (not just current page)
  const { data: globalStats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 60000,
  })

  const handleCheckAll = async () => {
    setCheckingAll(true)
    try {
      const toCheck = ips.slice(0, 25)
      const ids = toCheck.map(ip => ip.id)
      await api.bulkCheckIPs(ids)
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    } catch (err) {
      console.error('Bulk check failed:', err)
    } finally {
      setCheckingAll(false)
    }
  }

  // Global stats for ALL IPs from the stats endpoint
  const totalIPs = globalStats?.active || globalStats?.total || 0
  const globalBlacklisted = globalStats?.by_status?.blacklisted || 0
  const globalClean = globalStats?.by_status?.clean || 0
  const globalPending = globalStats?.by_status?.pending || 0

  // Current page stats (for context)
  const pageBlacklistedCount = ips.filter(ip => ip.status === 'blacklisted').length
  const pageCleanCount = ips.filter(ip => ip.status === 'clean').length
  const pagePendingCount = ips.filter(ip => ip.status === 'pending').length

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
      {/* Global Overview - Stats for ALL IPs */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Global Overview - All IPs</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {/* Total IPs */}
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="text-3xl font-bold">{totalIPs}</div>
            <div className="text-sm text-gray-400 mt-1">Total Monitored</div>
          </div>
          {/* Blacklisted */}
          <div className={`rounded-lg p-4 ${globalBlacklisted > 0 ? 'bg-red-500/20 ring-1 ring-red-500/50' : 'bg-white/10'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${globalBlacklisted > 0 ? 'text-red-400' : 'text-gray-500'}`} />
              <span className={`text-3xl font-bold ${globalBlacklisted > 0 ? 'text-red-400' : ''}`}>{globalBlacklisted}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">Blacklisted</div>
          </div>
          {/* Clean */}
          <div className="bg-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-3xl font-bold text-green-400">{globalClean}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">Clean</div>
          </div>
          {/* Pending */}
          <div className="bg-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-3xl font-bold text-yellow-400">{globalPending}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">Pending</div>
          </div>
        </div>
      </div>

      {/* Blacklist Alert Banner - Shows if ANY IPs are blacklisted globally */}
      {globalBlacklisted > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">
              {globalBlacklisted} IP{globalBlacklisted !== 1 ? 's are' : ' is'} currently blacklisted
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Blacklisted IPs may have email delivery issues or be blocked by firewalls. Review and take action.
            </p>
          </div>
        </div>
      )}

      {/* Current Page Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {/* Current Page Summary */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">This Page:</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="font-medium text-red-600">{pageBlacklistedCount}</span>
              <span className="text-gray-500">blacklisted</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-medium text-green-600">{pageCleanCount}</span>
              <span className="text-gray-500">clean</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span className="font-medium text-yellow-600">{pagePendingCount}</span>
              <span className="text-gray-500">pending</span>
            </span>
          </div>
        </div>

        {/* Legend & Check All Button */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500 border-r border-gray-300 pr-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-500"></span> Clean
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-600"></span> Listed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-gray-300"></span> Pending
            </span>
          </div>
          <button
            onClick={handleCheckAll}
            disabled={checkingAll}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${checkingAll ? 'animate-spin' : ''}`} />
            {checkingAll ? 'Checking...' : 'Check All IPs'}
          </button>
        </div>
      </div>

      {/* Provider Grid Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                {/* IP Header */}
                <th className="sticky left-0 bg-gray-100 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 z-20 min-w-[200px]">
                  IP Address & Status
                </th>

                {/* Provider Headers */}
                {BLACKLIST_PROVIDERS.map((provider) => (
                  <th
                    key={provider.id}
                    className="px-1 py-2 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-tight min-w-[45px]"
                    title={`${provider.name} (${provider.id})`}
                  >
                    <div className="truncate">{provider.shortName}</div>
                  </th>
                ))}

                {/* Actions Header */}
                <th className="sticky right-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase border-l border-gray-200 z-20 w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ips.map((ip) => (
                <IPGridRow key={ip.id} ip={ip} onDelete={onDelete} onEdit={setEditingIP} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing {ips.length} IPs across {BLACKLIST_PROVIDERS.length} blacklist providers</span>
        <span className="text-xs">Tip: Hover over cells to see provider details</span>
      </div>

      {/* Edit Modal */}
      <EditIPModal
        isOpen={!!editingIP}
        onClose={() => setEditingIP(null)}
        ip={editingIP}
      />
    </div>
  )
}

export default IPGrid
