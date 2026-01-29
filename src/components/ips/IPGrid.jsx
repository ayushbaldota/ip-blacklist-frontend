import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Trash2, Loader2, Pencil, AlertTriangle, CheckCircle, Clock, Globe, Bell, BellOff, X, Square } from 'lucide-react'
import { api } from '../../api/client'
import EditIPModal from './EditIPModal'

/**
 * Blacklist providers checked against each IP
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
  { id: 'spamsources.fabel.dk', name: 'Fabel Spamsources', shortName: 'FAB' },
]

function IPGridRow({ ip, onDelete, onEdit }) {
  const [isChecking, setIsChecking] = useState(false)
  const queryClient = useQueryClient()

  const checkMutation = useMutation({
    mutationFn: () => api.checkIP(ip.ip_address),
    onMutate: () => setIsChecking(true),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ips'] })
        setIsChecking(false)
      }, 3000)
    },
    onError: () => setIsChecking(false),
  })

  const muteMutation = useMutation({
    mutationFn: () => ip.notifications_muted ? api.unmuteIP(ip.ip_address) : api.muteIP(ip.ip_address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
    },
  })

  const blacklistSources = ip.blacklist_sources || []
  const errorSources = ip.error_sources || []
  const blacklistedByName = new Set(blacklistSources.map(s => s.provider).filter(Boolean))
  const blacklistedByZone = new Set(blacklistSources.map(s => s.details?.zone || s.zone).filter(Boolean))
  const errorByName = new Set(errorSources.map(s => s.provider).filter(Boolean))
  const errorByZone = new Set(errorSources.map(s => s.details?.zone).filter(Boolean))
  const blacklistCount = blacklistSources.length
  const isBlacklisted = ip.status === 'blacklisted' || blacklistCount > 0
  const isPending = ip.status === 'pending'

  const getProviderStatus = (provider) => {
    if (isPending) return 'pending'
    // Check if blacklisted
    if (blacklistedByName.has(provider.name) || blacklistedByZone.has(provider.id)) {
      return 'blacklisted'
    }
    // Check if there was an error (timeout, etc.) - show as pending/unknown
    if (errorByName.has(provider.name) || errorByZone.has(provider.id)) {
      return 'error'
    }
    return 'clean'
  }

  const getCellClass = (status) => {
    switch (status) {
      case 'clean': return 'bg-green-500'
      case 'blacklisted': return 'bg-red-600 animate-pulse'
      case 'error': return 'bg-yellow-500'  // Timeout/error - show as yellow
      default: return 'bg-gray-300'  // pending
    }
  }

  const getRowClass = () => {
    if (isBlacklisted) return 'bg-red-50 border-l-4 border-l-red-500'
    if (isPending) return 'bg-yellow-50 border-l-4 border-l-yellow-400'
    return 'bg-white border-l-4 border-l-green-500'
  }

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50/50 transition-colors ${getRowClass()}`}>
      <td className="sticky left-0 px-3 py-3 border-r border-gray-200 z-10" style={{ backgroundColor: 'inherit' }}>
        <div className="flex items-center gap-3">
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
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-gray-900">{ip.ip_address}</span>
              {ip.name && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {ip.name}
                </span>
              )}
              {ip.notifications_muted && (
                <span className="text-xs text-orange-500" title="Notifications muted">
                  <BellOff className="h-3 w-3" />
                </span>
              )}
              {isChecking && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
            </div>
            {ip.isp && (
              <div className="text-[11px] text-gray-400 truncate max-w-[220px]" title={`${ip.isp}${ip.country ? ` - ${ip.country}` : ''}`}>
                {ip.isp} {ip.country_code && <span className="text-gray-300">({ip.country_code})</span>}
              </div>
            )}
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

      {BLACKLIST_PROVIDERS.map((provider) => {
        const status = getProviderStatus(provider)
        const isListed = status === 'blacklisted'
        return (
          <td key={provider.id} className="px-0.5 py-1">
            <div
              className={`h-7 w-full rounded-sm flex items-center justify-center ${getCellClass(status)} ${isListed ? 'ring-2 ring-red-700 ring-inset shadow-inner' : ''}`}
              title={`${provider.name}: ${status === 'blacklisted' ? 'LISTED!' : status === 'clean' ? 'Clean' : status === 'error' ? 'Timeout/Error' : 'Pending'}`}
            >
              {isListed && <span className="text-[9px] font-bold text-white drop-shadow">!</span>}
            </div>
          </td>
        )
      })}

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
            onClick={() => muteMutation.mutate()}
            disabled={muteMutation.isPending}
            className={`p-1.5 rounded transition-colors disabled:opacity-50 ${ip.notifications_muted ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`}
            title={ip.notifications_muted ? 'Unmute Notifications' : 'Mute Notifications'}
          >
            {ip.notifications_muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
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

/**
 * Progress Modal for Check-All Job
 */
function CheckAllProgressModal({ isOpen, onClose, jobId, onComplete }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const pollIntervalRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !jobId) return

    const pollStatus = async () => {
      try {
        const data = await api.getCheckAllStatus(jobId)
        setStatus(data)
        setError(null)

        if (data.status === 'completed' || data.status === 'cancelled' || data.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          queryClient.invalidateQueries({ queryKey: ['ips'] })
          queryClient.invalidateQueries({ queryKey: ['stats'] })
          queryClient.invalidateQueries({ queryKey: ['activity'] })
          if (onComplete) onComplete(data)
        }
      } catch (err) {
        console.error('Failed to poll job status:', err)
        setError('Failed to get job status: ' + (err.response?.data?.error?.message || err.message))
      }
    }

    pollStatus()
    pollIntervalRef.current = setInterval(pollStatus, 500)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [isOpen, jobId, queryClient, onComplete])

  const handleCancel = async () => {
    if (!jobId) return
    try {
      await api.cancelCheckAll(jobId)
    } catch (err) {
      console.error('Failed to cancel job:', err)
      setError('Failed to cancel job: ' + (err.response?.data?.error?.message || err.message))
    }
  }

  if (!isOpen) return null

  const isRunning = status?.status === 'running' || status?.status === 'pending'
  const isComplete = status?.status === 'completed'
  const isCancelled = status?.status === 'cancelled'
  const isFailed = status?.status === 'failed'
  const progress = status?.progress || 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRunning && <Loader2 className="h-5 w-5 text-white animate-spin" />}
            {isComplete && <CheckCircle className="h-5 w-5 text-green-300" />}
            {isCancelled && <Square className="h-5 w-5 text-yellow-300" />}
            {isFailed && <AlertTriangle className="h-5 w-5 text-red-300" />}
            <h3 className="text-lg font-semibold text-white">
              {isRunning && 'Checking All IPs...'}
              {isComplete && 'Check Complete'}
              {isCancelled && 'Check Cancelled'}
              {isFailed && 'Check Failed'}
              {!status && 'Starting...'}
            </h3>
          </div>
          {!isRunning && status && (
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : isCancelled ? 'bg-yellow-500' : isFailed ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {status?.checked ?? 0} / {status?.total ?? 0}
              </div>
              <div className="text-sm text-gray-500">IPs Checked</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{status?.remaining ?? status?.total ?? 0}</div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xl font-bold text-green-700">{status?.clean ?? 0}</span>
              </div>
              <div className="text-xs text-green-600 mt-1">Clean</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-xl font-bold text-red-700">{status?.blacklisted ?? 0}</span>
              </div>
              <div className="text-xs text-red-600 mt-1">Blacklisted</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-xl font-bold text-yellow-700">{status?.errors ?? 0}</span>
              </div>
              <div className="text-xs text-yellow-600 mt-1">Errors</div>
            </div>
          </div>

          {status?.duration_seconds != null && (
            <div className="text-center text-sm text-gray-500">
              Duration: {Math.floor(status.duration_seconds / 60)}m {Math.floor(status.duration_seconds % 60)}s
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          {isRunning ? (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="h-4 w-4" />
              Cancel Check
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Inline progress bar shown when a job is running
 */
function CheckAllProgressBar({ jobStatus, onCancel, onViewDetails }) {
  if (!jobStatus || jobStatus.status !== 'running') return null

  const progress = jobStatus.progress || 0

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-blue-800">
            Checking all IPs... ({jobStatus.checked} / {jobStatus.total})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            View Details
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-blue-600">
        <span>Clean: {jobStatus.clean} | Blacklisted: {jobStatus.blacklisted} | Errors: {jobStatus.errors}</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function IPGrid({ ips, isLoading, onDelete }) {
  const queryClient = useQueryClient()
  const [checkingAll, setCheckingAll] = useState(false)
  const [checkJobId, setCheckJobId] = useState(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [currentJobStatus, setCurrentJobStatus] = useState(null)
  const [editingIP, setEditingIP] = useState(null)
  const pollCurrentJobRef = useRef(null)

  // Check for existing running job on mount
  useEffect(() => {
    const checkCurrentJob = async () => {
      try {
        const current = await api.getCurrentCheckJob()
        if (current && current.status === 'running') {
          setCheckJobId(current.job_id)
          setCurrentJobStatus(current)
        }
      } catch (err) {
        console.error('Failed to check current job:', err)
      }
    }
    checkCurrentJob()
  }, [])

  // Poll current job status if we have a job running
  useEffect(() => {
    if (!checkJobId) return

    const pollJob = async () => {
      try {
        const status = await api.getCheckAllStatus(checkJobId)
        setCurrentJobStatus(status)

        if (status.status === 'completed' || status.status === 'cancelled' || status.status === 'failed') {
          setCheckJobId(null)
          setCurrentJobStatus(null)
          queryClient.invalidateQueries({ queryKey: ['ips'] })
          queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
      } catch (err) {
        console.error('Failed to poll job:', err)
        // If job not found, clear it
        if (err.response?.status === 404) {
          setCheckJobId(null)
          setCurrentJobStatus(null)
        }
      }
    }

    // Only poll if modal is not open (modal has its own polling)
    if (!showProgressModal) {
      pollJob()
      pollCurrentJobRef.current = setInterval(pollJob, 1000)
    }

    return () => {
      if (pollCurrentJobRef.current) {
        clearInterval(pollCurrentJobRef.current)
        pollCurrentJobRef.current = null
      }
    }
  }, [checkJobId, showProgressModal, queryClient])

  const { data: globalStats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 60000,
  })

  const handleCheckAll = async () => {
    setCheckingAll(true)
    try {
      const result = await api.startCheckAll()
      setCheckJobId(result.job_id)
      setShowProgressModal(true)
      // Immediately refresh IPs to show them as pending
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    } catch (err) {
      console.error('Failed to start check-all job:', err)
      const errorMsg = err.response?.data?.error?.message || err.message
      alert(`Failed to start check: ${errorMsg}`)
    } finally {
      setCheckingAll(false)
    }
  }

  const handleCancelJob = async () => {
    if (!checkJobId) return
    try {
      await api.cancelCheckAll(checkJobId)
      setCheckJobId(null)
      setCurrentJobStatus(null)
      queryClient.invalidateQueries({ queryKey: ['ips'] })
    } catch (err) {
      console.error('Failed to cancel job:', err)
    }
  }

  const handleProgressModalClose = () => {
    setShowProgressModal(false)
    queryClient.invalidateQueries({ queryKey: ['ips'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })
  }

  const handleCheckComplete = useCallback((status) => {
    console.log('Check-all completed:', status)
    setCheckJobId(null)
    setCurrentJobStatus(null)
  }, [])

  const totalIPs = globalStats?.active || globalStats?.total || 0
  const globalBlacklisted = globalStats?.blacklisted ?? globalStats?.by_status?.blacklisted ?? 0
  const globalClean = globalStats?.clean ?? globalStats?.by_status?.clean ?? 0
  const globalPending = globalStats?.pending ?? globalStats?.by_status?.pending ?? 0

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
      {/* Inline Progress Bar for Running Job */}
      <CheckAllProgressBar
        jobStatus={currentJobStatus}
        onCancel={handleCancelJob}
        onViewDetails={() => setShowProgressModal(true)}
      />

      {/* Global Overview */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Global Overview - All IPs</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="text-3xl font-bold">{totalIPs}</div>
            <div className="text-sm text-gray-400 mt-1">Total Monitored</div>
          </div>
          <div className={`rounded-lg p-4 ${globalBlacklisted > 0 ? 'bg-red-500/20 ring-1 ring-red-500/50' : 'bg-white/10'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${globalBlacklisted > 0 ? 'text-red-400' : 'text-gray-500'}`} />
              <span className={`text-3xl font-bold ${globalBlacklisted > 0 ? 'text-red-400' : ''}`}>{globalBlacklisted}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">Blacklisted</div>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-3xl font-bold text-green-400">{globalClean}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">Clean</div>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-3xl font-bold text-yellow-400">{globalPending}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">Pending</div>
          </div>
        </div>
      </div>

      {/* Blacklist Alert Banner */}
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
              Blacklisted IPs may have email delivery issues or be blocked by firewalls.
            </p>
          </div>
        </div>
      )}

      {/* Current Page Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
            disabled={checkingAll || currentJobStatus?.status === 'running'}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${checkingAll ? 'animate-spin' : ''}`} />
            {currentJobStatus?.status === 'running' ? 'Check Running...' : checkingAll ? 'Starting...' : 'Check All IPs'}
          </button>
        </div>
      </div>

      {/* Provider Grid Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-100 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 z-20 min-w-[200px]">
                  IP Address & Status
                </th>
                {BLACKLIST_PROVIDERS.map((provider) => (
                  <th
                    key={provider.id}
                    className="px-1 py-2 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-tight min-w-[45px]"
                    title={`${provider.name} (${provider.id})`}
                  >
                    <div className="truncate">{provider.shortName}</div>
                  </th>
                ))}
                <th className="sticky right-0 bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase border-l border-gray-200 z-20 w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ips.map((ip) => (
                <IPGridRow key={ip.ip_address} ip={ip} onDelete={onDelete} onEdit={setEditingIP} />
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
      <EditIPModal isOpen={!!editingIP} onClose={() => setEditingIP(null)} ip={editingIP} />

      {/* Check All Progress Modal */}
      <CheckAllProgressModal
        isOpen={showProgressModal}
        onClose={handleProgressModalClose}
        jobId={checkJobId}
        onComplete={handleCheckComplete}
      />
    </div>
  )
}

export default IPGrid
