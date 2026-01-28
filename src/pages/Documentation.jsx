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

/**
 * API Endpoints Documentation
 * Base URL: https://blacklistapi.atoztester.com/api/v1
 */
const apiEndpoints = [
  // Health & Status
  {
    category: 'Health & Status',
    method: 'GET',
    path: '/health',
    description: 'Check API health status and component status',
    auth: false,
    rateLimit: null,
    response: `{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": { "status": "healthy", "latency_ms": 5 },
    "scheduler": { "status": "healthy", "next_run": "2024-01-15T13:00:00Z" },
    "slack": { "status": "healthy" }
  }
}`
  },
  {
    category: 'Health & Status',
    method: 'GET',
    path: '/stats',
    description: 'Get comprehensive monitoring statistics',
    auth: true,
    rateLimit: null,
    response: `{
  "data": {
    "total": 150,
    "active": 148,
    "clean": 140,
    "blacklisted": 6,
    "pending": 2,
    "last_check_run": "2024-01-15T10:00:00Z",
    "next_check_run": "2024-01-15T13:00:00Z",
    "check_interval": "3 hours",
    "active_providers": 14,
    "checks_today": 296,
    "status_changes_today": 2,
    "by_status": {
      "clean": 140,
      "blacklisted": 6,
      "pending": 2
    },
    "providers": [
      { "name": "Spamhaus ZEN", "listed_count": 3 },
      { "name": "Barracuda", "listed_count": 2 }
    ],
    "history": [
      { "date": "2024-01-15", "clean": 140, "blacklisted": 6 }
    ]
  }
}`
  },
  {
    category: 'Health & Status',
    method: 'GET',
    path: '/activity',
    description: 'Get recent activity log (status changes, additions, deletions)',
    auth: true,
    rateLimit: null,
    params: [
      { name: 'limit', type: 'number', description: 'Number of records to return (default: 10, max: 100)' }
    ],
    response: `{
  "data": {
    "items": [
      {
        "id": 1234,
        "type": "status_change",
        "activity_type": "status_change",
        "ip": "192.168.1.1",
        "ip_address": "192.168.1.1",
        "old_status": "clean",
        "new_status": "blacklisted",
        "details": { "blacklist_count": 2 },
        "triggered_by": "scheduler",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}`
  },

  // IP Management
  {
    category: 'IP Management',
    method: 'GET',
    path: '/ips',
    description: 'List all monitored IP addresses with pagination and filtering',
    auth: true,
    rateLimit: '1200/minute',
    params: [
      { name: 'page', type: 'number', description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', description: 'Items per page (default: 20, max: 100)' },
      { name: 'status', type: 'string', description: 'Filter by status: clean, blacklisted, pending' },
      { name: 'search', type: 'string', description: 'Search by IP address or description (max 100 chars)' },
      { name: 'tag', type: 'string', description: 'Filter by tag' },
      { name: 'sort_by', type: 'string', description: 'Sort field: created_at, updated_at, ip_address, status, last_checked' },
      { name: 'sort_order', type: 'string', description: 'Sort order: asc, desc (default: desc)' }
    ],
    response: `{
  "data": {
    "items": [
      {
        "ip_address": "192.168.1.1",
        "ip_version": 4,
        "name": "Production Mail Server",
        "description": "Main mail server",
        "tags": ["production", "mail"],
        "status": "clean",
        "blacklist_sources": [],
        "last_checked": "2024-01-15T10:00:00Z",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 150,
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 150,
      "total_pages": 8
    }
  }
}`
  },
  {
    category: 'IP Management',
    method: 'POST',
    path: '/ips',
    description: 'Add a new IP address to monitor',
    auth: true,
    rateLimit: '1200/minute',
    body: `{
  "ip_address": "192.168.1.1",
  "name": "Production Mail Server",
  "description": "Main mail server handling all outbound emails",
  "tags": ["production", "mail"]
}`,
    response: `{
  "data": {
    "ip_address": "192.168.1.1",
    "ip_version": 4,
    "name": "Production Mail Server",
    "description": "Main mail server handling all outbound emails",
    "tags": ["production", "mail"],
    "status": "pending",
    "blacklist_sources": [],
    "last_checked": null,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "IP address added successfully"
}`
  },
  {
    category: 'IP Management',
    method: 'POST',
    path: '/ips/bulk',
    description: 'Add multiple IP addresses at once (max 100)',
    auth: true,
    rateLimit: '1200/minute',
    body: `{
  "ips": [
    { "ip_address": "192.168.1.1", "name": "Web Server 1", "description": "Primary web server", "tags": ["prod"] },
    { "ip_address": "192.168.1.2", "name": "Web Server 2", "description": "Backup web server" },
    { "ip_address": "10.0.0.1" }
  ],
  "tags": ["web"]
}`,
    response: `{
  "data": {
    "added": 2,
    "skipped": 1,
    "results": [
      { "ip_address": "192.168.1.1", "status": "added" },
      { "ip_address": "192.168.1.2", "status": "added" },
      { "ip_address": "10.0.0.1", "status": "skipped", "reason": "already_exists" }
    ]
  },
  "message": "Bulk operation completed"
}`
  },
  {
    category: 'IP Management',
    method: 'GET',
    path: '/ips/{ip_address}',
    description: 'Get details for a specific IP address',
    auth: true,
    rateLimit: '1200/minute',
    response: `{
  "data": {
    "ip_address": "192.168.1.1",
    "ip_version": 4,
    "name": "Production Mail Server",
    "description": "Main mail server",
    "tags": ["production", "mail"],
    "status": "blacklisted",
    "blacklist_sources": [
      {
        "provider": "Spamhaus ZEN",
        "is_listed": true,
        "category": "SBL (Spamhaus Block List)",
        "details": { "zone": "zen.spamhaus.org", "return_code": "127.0.0.2" },
        "checked_at": "2024-01-15T10:00:00Z"
      },
      {
        "provider": "Barracuda",
        "is_listed": true,
        "category": "Listed",
        "details": { "zone": "b.barracudacentral.org" },
        "checked_at": "2024-01-15T10:00:00Z"
      }
    ],
    "last_checked": "2024-01-15T10:00:00Z",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}`
  },
  {
    category: 'IP Management',
    method: 'PATCH',
    path: '/ips/{ip_address}',
    description: 'Update IP address details (name, description, tags, active status)',
    auth: true,
    rateLimit: '1200/minute',
    body: `{
  "name": "Updated Server Name",
  "description": "Updated description",
  "tags": ["production", "mail", "primary"],
  "is_active": true
}`,
    response: `{
  "data": {
    "ip_address": "192.168.1.1",
    "name": "Updated Server Name",
    "description": "Updated description",
    "tags": ["production", "mail", "primary"],
    "status": "clean",
    "is_active": true,
    "updated_at": "2024-01-15T10:35:00Z"
  },
  "message": "IP updated successfully"
}`
  },
  {
    category: 'IP Management',
    method: 'DELETE',
    path: '/ips/{ip_address}',
    description: 'Remove an IP from monitoring (deletes all history)',
    auth: true,
    rateLimit: '1200/minute',
    response: `{
  "data": {
    "ip_address": "192.168.1.1",
    "deleted_at": "2024-01-15T10:35:00Z"
  },
  "message": "IP address removed successfully"
}`
  },

  // IP Checking
  {
    category: 'IP Checking',
    method: 'POST',
    path: '/ips/{ip_address}/check',
    description: 'Trigger an immediate blacklist check for a specific IP',
    auth: true,
    rateLimit: '1200/minute',
    response: `{
  "data": {
    "ip_address": "192.168.1.1",
    "check_id": "chk_abc123def456",
    "status": "completed",
    "result": {
      "is_blacklisted": false,
      "blacklist_sources": [],
      "providers_checked": 14,
      "check_duration_ms": 2340
    },
    "new_status": "clean"
  },
  "message": "Blacklist check completed"
}`
  },
  {
    category: 'IP Checking',
    method: 'POST',
    path: '/ips/bulk-check',
    description: 'Trigger immediate checks for multiple IPs (max 50)',
    auth: true,
    rateLimit: '1200/minute',
    params: [
      { name: 'ip_addresses', type: 'array', description: 'Array of IP addresses to check (e.g., ip_addresses=192.168.1.1&ip_addresses=192.168.1.2)' }
    ],
    response: `{
  "data": {
    "total": 2,
    "completed": 2,
    "errors": 0,
    "results": [
      {
        "ip_address": "192.168.1.1",
        "status": "completed",
        "new_status": "clean",
        "is_blacklisted": false,
        "check_duration_ms": 2340
      },
      {
        "ip_address": "192.168.1.2",
        "status": "completed",
        "new_status": "blacklisted",
        "is_blacklisted": true,
        "check_duration_ms": 2100
      }
    ]
  },
  "message": "Checked 2 IPs"
}`
  },
  {
    category: 'IP Checking',
    method: 'GET',
    path: '/ips/{ip_address}/history',
    description: 'Get check history for an IP address',
    auth: true,
    rateLimit: '1200/minute',
    params: [
      { name: 'page', type: 'number', description: 'Page number (default: 1)' },
      { name: 'per_page', type: 'number', description: 'Items per page (default: 50, max: 200)' },
      { name: 'from_date', type: 'datetime', description: 'Filter history from this date' },
      { name: 'to_date', type: 'datetime', description: 'Filter history until this date' }
    ],
    response: `{
  "data": {
    "ip_address": "192.168.1.1",
    "current_status": "clean",
    "history": [
      {
        "id": 5678,
        "status": "clean",
        "blacklist_sources": [],
        "check_duration_ms": 2100,
        "checked_at": "2024-01-15T10:00:00Z"
      },
      {
        "id": 5677,
        "status": "blacklisted",
        "blacklist_sources": [
          { "provider": "Spamhaus ZEN", "category": "SBL" }
        ],
        "check_duration_ms": 2340,
        "checked_at": "2024-01-15T07:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total_items": 48,
      "total_pages": 1
    },
    "summary": {
      "total_checks": 48,
      "times_blacklisted": 5,
      "times_clean": 43,
      "first_check": "2024-01-01T00:00:00Z",
      "blacklist_rate_percent": 10.4
    }
  }
}`
  },

  // Webhooks
  {
    category: 'Webhooks',
    method: 'POST',
    path: '/webhook/test',
    description: 'Send a test notification to verify Slack webhook configuration',
    auth: true,
    rateLimit: '1200/minute',
    response: `{
  "data": {
    "success": true,
    "message": "Test notification sent successfully",
    "webhook_configured": true
  }
}`
  }
]

// Group endpoints by category
const endpointCategories = [
  { name: 'Health & Status', description: 'System health, statistics, and activity monitoring' },
  { name: 'IP Management', description: 'Add, update, delete, and list IP addresses' },
  { name: 'IP Checking', description: 'Trigger checks and view check history' },
  { name: 'Webhooks', description: 'Webhook configuration and testing' }
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

function CurlCommand({ endpoint, baseUrl }) {
  const [copied, setCopied] = useState(false)

  // Generate curl command based on endpoint
  const generateCurl = () => {
    const url = baseUrl + endpoint.path.replace('{ip_address}', '192.168.1.1')
    let curl = `curl -X ${endpoint.method}`

    // Add headers
    if (endpoint.auth) {
      curl += ` \\\n  -H "X-API-Key: YOUR_API_KEY"`
    }

    // Add content-type for POST/PATCH/PUT
    if (['POST', 'PATCH', 'PUT'].includes(endpoint.method)) {
      curl += ` \\\n  -H "Content-Type: application/json"`
    }

    // Add request body if present
    if (endpoint.body) {
      // Minify the JSON for curl
      const minifiedBody = endpoint.body.replace(/\s+/g, ' ').trim()
      curl += ` \\\n  -d '${minifiedBody}'`
    }

    // Add query params example for certain endpoints
    if (endpoint.params && endpoint.method === 'GET') {
      const exampleParams = endpoint.params.slice(0, 2).map(p => {
        if (p.name === 'page') return 'page=1'
        if (p.name === 'limit' || p.name === 'per_page') return 'per_page=20'
        if (p.name === 'status') return 'status=clean'
        if (p.name === 'ip_addresses') return 'ip_addresses=192.168.1.1&ip_addresses=192.168.1.2'
        return `${p.name}=value`
      }).join('&')
      curl += ` \\\n  "${url}?${exampleParams}"`
    } else if (endpoint.params && endpoint.method === 'POST' && endpoint.path.includes('bulk-check')) {
      curl += ` \\\n  "${url}?ip_ids=1&ip_ids=2&ip_ids=3"`
    } else {
      curl += ` \\\n  "${url}"`
    }

    return curl
  }

  const curlCommand = generateCurl()

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium text-gray-700">cURL Example</h5>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy cURL
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code className="text-green-400">{curlCommand}</code>
      </pre>
    </div>
  )
}

function EndpointCard({ endpoint, baseUrl }) {
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
        <code className="text-sm font-mono text-gray-700 flex-shrink-0">{endpoint.path}</code>
        <span className="text-sm text-gray-500 flex-grow truncate">{endpoint.description}</span>
        {endpoint.rateLimit && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0" title="Rate limit">
            {endpoint.rateLimit}
          </span>
        )}
        {endpoint.auth && (
          <Key className="h-4 w-4 text-yellow-500 flex-shrink-0" title="Requires authentication" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {/* cURL Command - First for easy access */}
          <CurlCommand endpoint={endpoint} baseUrl={baseUrl} />

          {/* Auth & Rate Limit Info */}
          <div className="flex flex-wrap gap-2">
            {endpoint.auth ? (
              <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded">
                <Key className="h-4 w-4" />
                Requires API key (X-API-Key header)
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded">
                <Check className="h-4 w-4" />
                Public endpoint (no auth required)
              </div>
            )}
            {endpoint.rateLimit && (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded">
                Rate limit: {endpoint.rateLimit}
              </div>
            )}
          </div>

          {endpoint.params && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Query Parameters</h5>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Parameter</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {endpoint.params.map((param) => (
                      <tr key={param.name}>
                        <td className="px-3 py-2">
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{param.name}</code>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{param.type}</td>
                        <td className="px-3 py-2 text-gray-600">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        <div className="space-y-6">
          {/* Base URL */}
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-sm">Base URL</span>
                <div className="font-mono text-lg mt-1">{baseUrl}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(baseUrl)
                }}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Copy base URL"
              >
                <Copy className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Authentication Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Authentication Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Most endpoints require an API key. Include it in the request header:
                </p>
                <code className="block bg-yellow-100 px-3 py-2 rounded mt-2 text-sm text-yellow-800">
                  X-API-Key: your-api-key-here
                </code>
              </div>
            </div>
          </div>

          {/* Endpoints by Category */}
          {endpointCategories.map((category) => (
            <div key={category.name} className="space-y-3">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              {apiEndpoints
                .filter((endpoint) => endpoint.category === category.name)
                .map((endpoint, index) => (
                  <EndpointCard key={index} endpoint={endpoint} baseUrl={baseUrl} />
                ))}
            </div>
          ))}

          {/* Rate Limiting Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Rate Limiting</h4>
            <p className="text-sm text-blue-700">
              API requests are rate-limited to prevent abuse. Limits vary by endpoint and are shown
              in each endpoint's documentation. When you exceed the rate limit, you'll receive a
              <code className="bg-blue-100 px-1.5 py-0.5 rounded mx-1">429 Too Many Requests</code>
              response. Wait and retry after the limit resets.
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}

export default Documentation
