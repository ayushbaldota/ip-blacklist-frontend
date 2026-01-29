import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, Loader2 } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import TagInput from '../common/TagInput'
import { api } from '../../api/client'

const SUGGESTED_TAGS = ['production', 'staging', 'development', 'external', 'internal', 'mail', 'web', 'api', 'database']
const BATCH_SIZE = 100

function BulkImportModal({ isOpen, onClose }) {
  const [inputMode, setInputMode] = useState('textarea')
  const [textInput, setTextInput] = useState('')
  const [tags, setTags] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, added: 0, skipped: 0, errors: 0 })
  const abortRef = useRef(false)
  const queryClient = useQueryClient()

  const handleClose = () => {
    if (isImporting) {
      abortRef.current = true
    }
    setTextInput('')
    setTags([])
    setResult(null)
    setError('')
    setIsImporting(false)
    setProgress({ current: 0, total: 0, added: 0, skipped: 0, errors: 0 })
    onClose()
  }

  const parseIPs = (text) => {
    const lines = text.split(/[\n;]+/)
    const ips = []
    const seen = new Set() // Deduplicate

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Handle CSV format: ip,name,description or just ip
      const parts = trimmed.split(',')
      const ip = parts[0].trim()

      // Skip duplicates
      if (seen.has(ip)) continue
      seen.add(ip)

      const name = parts[1]?.trim() || undefined
      const description = parts.slice(2).join(',').trim() || undefined

      // Basic IP validation (IPv4)
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      // Basic IPv6 validation (simplified)
      const ipv6Regex = /^[0-9a-fA-F:]+$/

      if (ipv4Regex.test(ip) || (ip.includes(':') && ipv6Regex.test(ip))) {
        ips.push({ ip_address: ip, name, description })
      }
    }

    return ips
  }

  const importBatch = async (batch, batchTags) => {
    try {
      const result = await api.addBulkIPs({
        ips: batch,
        tags: batchTags,
      })
      return {
        added: result.added || 0,
        skipped: result.skipped || 0,
        errors: 0,
      }
    } catch (err) {
      console.error('Batch import error:', err)
      return {
        added: 0,
        skipped: 0,
        errors: batch.length,
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    abortRef.current = false

    const ips = parseIPs(textInput)

    if (ips.length === 0) {
      setError('No valid IP addresses found')
      return
    }

    setIsImporting(true)
    setProgress({ current: 0, total: ips.length, added: 0, skipped: 0, errors: 0 })

    const batchTags = tags.length > 0 ? tags : undefined
    let totalAdded = 0
    let totalSkipped = 0
    let totalErrors = 0

    // Process in batches
    for (let i = 0; i < ips.length; i += BATCH_SIZE) {
      if (abortRef.current) break

      const batch = ips.slice(i, i + BATCH_SIZE)
      const batchResult = await importBatch(batch, batchTags)

      totalAdded += batchResult.added
      totalSkipped += batchResult.skipped
      totalErrors += batchResult.errors

      setProgress({
        current: Math.min(i + BATCH_SIZE, ips.length),
        total: ips.length,
        added: totalAdded,
        skipped: totalSkipped,
        errors: totalErrors,
      })

      // Small delay between batches to avoid overwhelming the server
      if (i + BATCH_SIZE < ips.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    setIsImporting(false)
    setResult({
      added: totalAdded,
      skipped: totalSkipped,
      errors: totalErrors,
      total: ips.length,
    })

    // Refresh data
    queryClient.invalidateQueries({ queryKey: ['ips'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })
    queryClient.invalidateQueries({ queryKey: ['activity'] })
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
  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import IPs" size="lg">
      {result ? (
        <div>
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
            <p className="font-medium">Import Complete</p>
            <ul className="mt-2 text-sm space-y-1">
              <li>Total processed: <span className="font-medium">{result.total}</span></li>
              <li>Added: <span className="font-medium text-green-600">{result.added}</span></li>
              <li>Skipped (duplicates): <span className="font-medium text-yellow-600">{result.skipped}</span></li>
              {result.errors > 0 && (
                <li>Errors: <span className="font-medium text-red-600">{result.errors}</span></li>
              )}
            </ul>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      ) : isImporting ? (
        <div className="py-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Importing IPs...
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Processing {progress.current} of {progress.total} IPs ({progressPercent}%)
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-md bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Live stats */}
            <div className="flex gap-6 text-sm">
              <span className="text-green-600">Added: {progress.added}</span>
              <span className="text-yellow-600">Skipped: {progress.skipped}</span>
              {progress.errors > 0 && (
                <span className="text-red-600">Errors: {progress.errors}</span>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => { abortRef.current = true }}
              className="mt-6"
            >
              Cancel Import
            </Button>
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
                  placeholder="Enter IPs (one per line or semicolon-separated):&#10;192.168.1.1&#10;10.0.0.1,Web Server&#10;172.16.0.1,DB Server,Main database"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: IP address per line. Optional: IP,name,description
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
                {validIPs.length > BATCH_SIZE && (
                  <span className="block text-xs mt-1 text-blue-600">
                    Will be imported in {Math.ceil(validIPs.length / BATCH_SIZE)} batches
                  </span>
                )}
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
