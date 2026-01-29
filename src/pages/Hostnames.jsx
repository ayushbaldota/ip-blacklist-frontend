import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Globe, Server, Wifi, Search, X, RefreshCw } from 'lucide-react'
import { api } from '../api/client'
import Loading from '../components/common/Loading'
import Pagination from '../components/common/Pagination'

/**
 * Hostnames Page
 *
 * Displays a clean, row-based list of all IP addresses with their ISP and hostname information.
 * Each row shows: IP Address | ISP | Hostname
 */
function Hostnames() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const perPage = 50

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ips', { page, search, limit: perPage }],
    queryFn: () => api.getIPs({ page, search: search || undefined, limit: perPage }),
    keepPreviousData: true,
  })

  const ips = data?.items || data?.ips || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / perPage)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const clearSearch = () => {
    setSearch('')
    setPage(1)
  }

  if (isLoading) {
    return <Loading text="Loading hostnames..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-7 w-7 text-primary-600" />
            Hostnames
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            IP addresses with their ISP and resolved hostname (PTR record)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search IPs..."
              value={search}
              onChange={handleSearch}
              className="input pl-10 w-64"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{ips.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{total}</span> IP addresses
            {search && <span className="text-gray-500"> (filtered)</span>}
          </span>
          <span className="text-xs text-gray-500">
            Hostnames are resolved via reverse DNS (PTR records)
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="card overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <div className="col-span-3 flex items-center gap-2">
              <Server className="h-4 w-4" />
              IP Address
            </div>
            <div className="col-span-4 flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              ISP
            </div>
            <div className="col-span-5 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Hostname
            </div>
          </div>
        </div>

        {/* Table Body */}
        {ips.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No IP addresses found</p>
            {search && (
              <button
                onClick={clearSearch}
                className="text-sm text-primary-600 hover:text-primary-700 mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ips.map((ip) => (
              <div
                key={ip.ip_address}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
              >
                {/* IP Address */}
                <div className="col-span-3">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {ip.ip_address}
                  </span>
                  {ip.name && (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {ip.name}
                    </span>
                  )}
                </div>

                {/* ISP */}
                <div className="col-span-4">
                  {ip.isp ? (
                    <div className="text-sm text-gray-700 truncate" title={`${ip.isp}${ip.org ? ` (${ip.org})` : ''}`}>
                      {ip.isp}
                      {ip.country_code && (
                        <span className="ml-1.5 text-xs text-gray-400">({ip.country_code})</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Unknown</span>
                  )}
                </div>

                {/* Hostname */}
                <div className="col-span-5">
                  {ip.hostname ? (
                    <span className="font-mono text-sm text-gray-700 truncate block" title={ip.hostname}>
                      {ip.hostname}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No PTR record</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={perPage}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default Hostnames
