import { Globe, Server, Wifi } from 'lucide-react'

/**
 * Hostnames Section Component
 *
 * Displays a clean, row-based list of IP addresses with their ISP and hostname information.
 * Each row shows: IP Address | ISP | Hostname
 */
function HostnamesSection({ ips, isLoading }) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Hostnames</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!ips || ips.length === 0) {
    return null
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Hostnames</h2>
          <span className="text-sm text-gray-500 ml-2">({ips.length} IPs)</span>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
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
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {ips.map((ip) => (
          <div
            key={ip.ip_address}
            className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors items-center"
          >
            {/* IP Address */}
            <div className="col-span-3">
              <span className="font-mono text-sm font-medium text-gray-900">
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
                    <span className="ml-1 text-xs text-gray-400">({ip.country_code})</span>
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

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
        <p className="text-xs text-gray-500">
          Hostnames are resolved via reverse DNS (PTR records) when IPs are added.
        </p>
      </div>
    </div>
  )
}

export default HostnamesSection
