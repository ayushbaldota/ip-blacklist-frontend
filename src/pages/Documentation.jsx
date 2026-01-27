import { useState } from 'react'
import {
  BookOpen,
  Server,
  Key,
  Plus,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'

const apiEndpoints = [
  {
    method: 'GET',
    path: '/health',
    description: 'Check API health status',
    auth: false,
    response: `{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: 'GET',
    path: '/ips',
    description: 'List all monitored IP addresses',
    auth: true,
    params: [
      { name: 'page', type: 'number', description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', description: 'Items per page (default: 20)' },
      { name: 'status', type: 'string', description: 'Filter by status: clean, blacklisted, pending' },
      { name: 'search', type: 'string', description: 'Search by IP address' }
    ],
    response: `{
  "data": [
    {
      "id": "123",
      "ip": "192.168.1.1",
      "status": "clean",
      "listings": 0,
      "last_checked": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}`
  },
  {
    method: 'POST',
    path: '/ips',
    description: 'Add a single IP address to monitor',
    auth: true,
    body: `{
  "ip": "192.168.1.1"
}`,
    response: `{
  "id": "123",
  "ip": "192.168.1.1",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: 'POST',
    path: '/ips/bulk',
    description: 'Add multiple IP addresses at once',
    auth: true,
    body: `{
  "ips": ["192.168.1.1", "192.168.1.2", "10.0.0.1"]
}`,
    response: `{
  "added": 3,
  "duplicates": 0,
  "invalid": 0
}`
  },
  {
    method: 'GET',
    path: '/ips/:id',
    description: 'Get details for a specific IP',
    auth: true,
    response: `{
  "id": "123",
  "ip": "192.168.1.1",
  "status": "blacklisted",
  "listings": 2,
  "blacklists": [
    { "provider": "Spamhaus", "listed": true },
    { "provider": "Barracuda", "listed": true }
  ],
  "last_checked": "2024-01-15T10:00:00Z",
  "check_count": 48,
  "created_at": "2024-01-01T00:00:00Z"
}`
  },
  {
    method: 'POST',
    path: '/ips/:id/check',
    description: 'Trigger an immediate check for an IP',
    auth: true,
    response: `{
  "id": "123",
  "ip": "192.168.1.1",
  "status": "clean",
  "listings": 0,
  "checked_at": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: 'GET',
    path: '/ips/:id/history',
    description: 'Get check history for an IP',
    auth: true,
    params: [
      { name: 'limit', type: 'number', description: 'Number of records (default: 50)' }
    ],
    response: `{
  "data": [
    {
      "checked_at": "2024-01-15T10:00:00Z",
      "status": "clean",
      "listings": 0,
      "providers_checked": 12
    }
  ]
}`
  },
  {
    method: 'DELETE',
    path: '/ips/:id',
    description: 'Remove an IP from monitoring',
    auth: true,
    response: `{
  "success": true,
  "message": "IP removed successfully"
}`
  },
  {
    method: 'GET',
    path: '/stats',
    description: 'Get monitoring statistics',
    auth: true,
    response: `{
  "total": 150,
  "clean": 140,
  "blacklisted": 8,
  "pending": 2,
  "health_rate": 93.3,
  "active_providers": 12,
  "check_interval": "1 hour",
  "last_check": "2024-01-15T10:00:00Z",
  "next_check": "2024-01-15T11:00:00Z"
}`
  },
  {
    method: 'GET',
    path: '/activity',
    description: 'Get recent activity log',
    auth: true,
    params: [
      { name: 'limit', type: 'number', description: 'Number of records (default: 20)' }
    ],
    response: `{
  "data": [
    {
      "type": "check_clean",
      "ip": "192.168.1.1",
      "message": "IP checked - Clean",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}`
  },
  {
    method: 'POST',
    path: '/webhook/test',
    description: 'Send a test webhook notification',
    auth: true,
    response: `{
  "success": true,
  "message": "Test webhook sent"
}`
  }
]

function CodeBlock({ code, language = 'json' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-300" />
        )}
      </button>
    </div>
  )
}

function MethodBadge({ method }) {
  const colors = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    PATCH: 'bg-orange-100 text-orange-700',
    DELETE: 'bg-red-100 text-red-700'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${colors[method]}`}>
      {method}
    </span>
  )
}

function EndpointCard({ endpoint }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
        <MethodBadge method={endpoint.method} />
        <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
        <span className="text-sm text-gray-500 ml-auto">{endpoint.description}</span>
        {endpoint.auth && (
          <Key className="h-4 w-4 text-yellow-500 flex-shrink-0" title="Requires authentication" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {endpoint.auth && (
            <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
              <Key className="h-4 w-4" />
              Requires API key authentication
            </div>
          )}

          {endpoint.params && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Query Parameters</h5>
              <div className="space-y-1">
                {endpoint.params.map((param) => (
                  <div key={param.name} className="flex items-start gap-2 text-sm">
                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{param.name}</code>
                    <span className="text-gray-400">({param.type})</span>
                    <span className="text-gray-600">- {param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.body && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Request Body</h5>
              <CodeBlock code={endpoint.body} />
            </div>
          )}

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Response</h5>
            <CodeBlock code={endpoint.response} />
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Documentation() {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://blacklistapi.atoztester.com/api/v1'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
            <p className="text-gray-500">Learn how to use the IP Blacklist Monitor</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Contents</h3>
          <div className="grid grid-cols-2 gap-2">
            <a href="#getting-started" className="text-sm text-primary-600 hover:underline">Getting Started</a>
            <a href="#api-auth" className="text-sm text-primary-600 hover:underline">API Authentication</a>
            <a href="#managing-ips" className="text-sm text-primary-600 hover:underline">Managing IPs</a>
            <a href="#api-endpoints" className="text-sm text-primary-600 hover:underline">API Endpoints</a>
            <a href="#understanding-status" className="text-sm text-primary-600 hover:underline">Understanding Status</a>
            <a href="#webhooks" className="text-sm text-primary-600 hover:underline">Webhooks</a>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <Section id="getting-started" icon={BookOpen} title="Getting Started">
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>
            The IP Blacklist Monitor helps you track whether your IP addresses appear on email blacklists.
            This is crucial for maintaining email deliverability and server reputation.
          </p>

          <h4 className="text-gray-900 font-medium mt-4">Quick Start</h4>
          <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>Configure your API key in <a href="/settings" className="text-primary-600 hover:underline">Settings</a></li>
            <li>Add IP addresses to monitor via the <a href="/ips" className="text-primary-600 hover:underline">IP Addresses</a> page</li>
            <li>View your monitoring dashboard at <a href="/" className="text-primary-600 hover:underline">Dashboard</a></li>
            <li>Check detailed statistics at <a href="/statistics" className="text-primary-600 hover:underline">Statistics</a></li>
          </ol>
        </div>
      </Section>

      {/* API Authentication */}
      <Section id="api-auth" icon={Key} title="API Authentication">
        <div className="space-y-4">
          <p className="text-gray-600">
            All API requests (except health check) require authentication using an API key.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Setting up your API Key</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to <a href="/settings" className="text-primary-600 hover:underline">Settings</a></li>
              <li>Enter your API key in the API Configuration section</li>
              <li>Click Save to store it locally</li>
            </ol>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Using the API Key</h4>
            <p className="text-sm text-gray-600 mb-2">
              Include the API key in the <code className="bg-gray-100 px-1.5 py-0.5 rounded">X-API-Key</code> header:
            </p>
            <CodeBlock code={`curl -H "X-API-Key: your-api-key" ${baseUrl}/ips`} />
          </div>
        </div>
      </Section>

      {/* Managing IPs */}
      <Section id="managing-ips" icon={Server} title="Managing IP Addresses">
        <div className="space-y-6">
          {/* Add Single IP */}
          <div className="flex gap-4">
            <div className="p-2 bg-green-100 rounded-lg h-fit">
              <Plus className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Add Single IP</h4>
              <p className="text-sm text-gray-600 mt-1">
                Click the "Add IP" button on the IP Addresses page. Enter a valid IPv4 address
                (e.g., 192.168.1.1) and click Add. The IP will be queued for checking.
              </p>
            </div>
          </div>

          {/* Bulk Import */}
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Upload className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Bulk Import</h4>
              <p className="text-sm text-gray-600 mt-1">
                Import multiple IPs at once using the "Bulk Import" button. You can either:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Paste IPs directly (one per line, or comma/semicolon separated)</li>
                <li>Upload a CSV or text file containing IP addresses</li>
              </ul>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="p-2 bg-purple-100 rounded-lg h-fit">
              <Search className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Search & Filter</h4>
              <p className="text-sm text-gray-600 mt-1">
                Use the search box to find specific IPs. Filter by status using the dropdown
                to show only Clean, Blacklisted, or Pending IPs.
              </p>
            </div>
          </div>

          {/* Manual Check */}
          <div className="flex gap-4">
            <div className="p-2 bg-orange-100 rounded-lg h-fit">
              <RefreshCw className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Manual Check</h4>
              <p className="text-sm text-gray-600 mt-1">
                Click on any IP to view its details, then use the "Check Now" button to
                trigger an immediate blacklist check outside the regular schedule.
              </p>
            </div>
          </div>

          {/* Delete IP */}
          <div className="flex gap-4">
            <div className="p-2 bg-red-100 rounded-lg h-fit">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Remove IP</h4>
              <p className="text-sm text-gray-600 mt-1">
                To stop monitoring an IP, click the trash icon next to it and confirm
                the deletion. This will remove all history for that IP.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Understanding Status */}
      <Section id="understanding-status" icon={Server} title="Understanding Status">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">Clean</span>
              <span className="text-sm text-gray-600">
                The IP is not listed on any monitored blacklists. Good reputation.
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">Blacklisted</span>
              <span className="text-sm text-gray-600">
                The IP appears on one or more blacklists. Action may be required.
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">Pending</span>
              <span className="text-sm text-gray-600">
                The IP is queued for checking. Status will update after the next check cycle.
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* Webhooks */}
      <Section id="webhooks" icon={ExternalLink} title="Webhooks">
        <div className="space-y-4">
          <p className="text-gray-600">
            Configure webhooks to receive real-time notifications when an IP's status changes.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Webhook Payload Example</h4>
            <CodeBlock code={`{
  "event": "ip_status_changed",
  "ip": "192.168.1.1",
  "old_status": "clean",
  "new_status": "blacklisted",
  "listings": [
    { "provider": "Spamhaus", "listed": true }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}`} />
          </div>

          <p className="text-sm text-gray-600">
            Test your webhook configuration in <a href="/settings" className="text-primary-600 hover:underline">Settings</a> to
            ensure notifications are working correctly.
          </p>
        </div>
      </Section>

      {/* API Endpoints */}
      <Section id="api-endpoints" icon={Server} title="API Endpoints">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Base URL:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{baseUrl}</code>
          </div>

          {apiEndpoints.map((endpoint, index) => (
            <EndpointCard key={index} endpoint={endpoint} />
          ))}
        </div>
      </Section>
    </div>
  )
}

export default Documentation
