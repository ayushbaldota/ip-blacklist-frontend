import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import TagInput from '../common/TagInput'
import { api } from '../../api/client'

const SUGGESTED_TAGS = ['production', 'staging', 'development', 'external', 'internal', 'mail', 'web', 'api', 'database']

function BulkImportModal({ isOpen, onClose }) {
  const [inputMode, setInputMode] = useState('textarea')
  const [textInput, setTextInput] = useState('')
  const [tags, setTags] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const bulkMutation = useMutation({
    mutationFn: api.addBulkIPs,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      setResult(data)
    },
    onError: (err) => {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to import IPs')
    },
  })

  const handleClose = () => {
    setTextInput('')
    setTags([])
    setResult(null)
    setError('')
    onClose()
  }

  const parseIPs = (text) => {
    const lines = text.split(/[\n;]+/)
    const ips = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Handle CSV format: ip,description or just ip
      const parts = trimmed.split(',')
      const ip = parts[0].trim()
      const description = parts.slice(1).join(',').trim() || undefined

      // Basic IP validation (IPv4)
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      // Basic IPv6 validation (simplified)
      const ipv6Regex = /^[0-9a-fA-F:]+$/

      if (ipv4Regex.test(ip) || (ip.includes(':') && ipv6Regex.test(ip))) {
        ips.push({ ip_address: ip, description })
      }
    }

    return ips
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    const ips = parseIPs(textInput)

    if (ips.length === 0) {
      setError('No valid IP addresses found')
      return
    }

    bulkMutation.mutate({
      ips,
      tags: tags.length > 0 ? tags : undefined,
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setTextInput(event.target?.result || '')
    }
    reader.readAsText(file)
  }

  const validIPs = textInput ? parseIPs(textInput) : []

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import IPs" size="lg">
      {result ? (
        <div>
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
            <p className="font-medium">Import Complete</p>
            <ul className="mt-2 text-sm space-y-1">
              <li>Added: <span className="font-medium">{result.added || result.created || 0}</span></li>
              <li>Skipped (duplicates): <span className="font-medium">{result.skipped || result.duplicates || 0}</span></li>
              <li>Failed (invalid): <span className="font-medium">{result.failed || result.invalid || 0}</span></li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setInputMode('textarea')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                  inputMode === 'textarea'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                Paste IPs
              </button>
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                  inputMode === 'file'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload CSV
              </button>
            </div>

            {inputMode === 'textarea' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Addresses
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="input min-h-[160px] font-mono text-sm"
                  placeholder="Enter IPs (one per line or semicolon-separated):&#10;192.168.1.1&#10;10.0.0.1, Web Server&#10;172.16.0.1, Database Server"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: IP address per line, optionally followed by comma and description
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      CSV or TXT file
                    </span>
                  </label>
                </div>
              </div>
            )}

            {validIPs.length > 0 && (
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                {validIPs.length} valid IP address{validIPs.length !== 1 ? 'es' : ''} found
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (apply to all imported IPs)
              </label>
              <TagInput
                value={tags}
                onChange={setTags}
                suggestions={SUGGESTED_TAGS}
                placeholder="Add tags..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={bulkMutation.isPending}
              disabled={validIPs.length === 0}
            >
              Import {validIPs.length > 0 ? `${validIPs.length} IPs` : 'IPs'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default BulkImportModal
