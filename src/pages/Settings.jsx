import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, Copy, Check, Send } from 'lucide-react'
import { api } from '../api/client'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'

function Settings() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('api_key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
  })

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const webhookMutation = useMutation({
    mutationFn: api.testWebhook,
  })

  const handleSaveApiKey = () => {
    localStorage.setItem('api_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskApiKey = (key) => {
    if (!key) return ''
    if (key.length <= 8) return '****'
    return key.slice(0, 4) + '****' + key.slice(-4)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* API Key Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input pr-20"
                  placeholder="Enter your API key"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    title={showApiKey ? 'Hide' : 'Show'}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleCopyApiKey}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                    title="Copy"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button onClick={handleSaveApiKey}>
                {saved ? 'Saved!' : 'Save'}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Your API key is stored locally in your browser
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Endpoint
            </label>
            <input
              type="text"
              value={import.meta.env.VITE_API_URL || 'https://blacklistapi.atoztester.com/api/v1'}
              className="input bg-gray-50"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook</h3>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Test your webhook configuration to ensure notifications are working correctly.
          </p>

          <Button
            variant="secondary"
            onClick={() => webhookMutation.mutate()}
            loading={webhookMutation.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Test Webhook
          </Button>

          {webhookMutation.isSuccess && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              Test webhook sent successfully!
            </div>
          )}

          {webhookMutation.isError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              Failed to send test webhook. Please check your configuration.
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">API Status</span>
            <span className={health?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
              {health?.status || 'Unknown'}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Check Interval</span>
            <span className="text-gray-900">{stats?.check_interval || 'N/A'}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Active Providers</span>
            <span className="text-gray-900">{stats?.active_providers || 0}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total IPs Monitored</span>
            <span className="text-gray-900">{stats?.total || 0}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-600">Frontend Version</span>
            <span className="text-gray-900">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
