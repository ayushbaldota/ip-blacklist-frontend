import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { api } from '../../api/client'

function BulkImportModal({ isOpen, onClose }) {
  const [inputMode, setInputMode] = useState('textarea')
  const [textInput, setTextInput] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const bulkMutation = useMutation({
    mutationFn: api.addBulkIPs,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setResult(data)
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'Failed to import IPs')
    },
  })

  const handleClose = () => {
    setTextInput('')
    setResult(null)
    setError('')
    onClose()
  }

  const parseIPs = (text) => {
    const lines = text.split(/[\n,;]+/)
    const ips = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Handle CSV format: ip,description or just ip
      const parts = trimmed.split(',')
      const ip = parts[0].trim()
      const description = parts[1]?.trim()

      // Basic IP validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (ipRegex.test(ip)) {
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

    bulkMutation.mutate({ ips })
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import IPs" size="lg">
      {result ? (
        <div>
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
            <p className="font-medium">Import Complete</p>
            <ul className="mt-2 text-sm">
              <li>Added: {result.added || 0}</li>
              <li>Skipped (duplicates): {result.skipped || 0}</li>
              <li>Failed: {result.failed || 0}</li>
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
                  className="input min-h-[200px] font-mono text-sm"
                  placeholder="Enter IPs (one per line or comma-separated):&#10;192.168.1.1&#10;10.0.0.1, Web Server&#10;172.16.0.1"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      CSV or TXT file
                    </span>
                  </label>
                </div>
                {textInput && (
                  <p className="mt-2 text-sm text-green-600">
                    File loaded: {parseIPs(textInput).length} valid IPs found
                  </p>
                )}
              </div>
            )}

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
              disabled={!textInput.trim()}
            >
              Import IPs
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default BulkImportModal
