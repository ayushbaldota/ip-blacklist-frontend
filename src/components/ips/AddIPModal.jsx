import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '../common/Modal'
import Button from '../common/Button'
import TagInput from '../common/TagInput'
import { api } from '../../api/client'

const SUGGESTED_TAGS = ['production', 'staging', 'development', 'external', 'internal', 'mail', 'web', 'api', 'database']

function AddIPModal({ isOpen, onClose }) {
  const [ipAddress, setIpAddress] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: api.addIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      handleClose()
    },
    onError: (err) => {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to add IP address')
    },
  })

  const handleClose = () => {
    setIpAddress('')
    setName('')
    setDescription('')
    setTags([])
    setError('')
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Basic IP validation (IPv4 and IPv6)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$/

    if (!ipv4Regex.test(ipAddress) && !ipv6Regex.test(ipAddress)) {
      setError('Please enter a valid IP address')
      return
    }

    addMutation.mutate({
      ip_address: ipAddress,
      name: name || undefined,
      description: description || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add IP Address">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="ip" className="block text-sm font-medium text-gray-700 mb-1">
              IP Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="ip"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="input"
              placeholder="192.168.1.1 or 2001:db8::1"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Production Web Server"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">A friendly name to identify this IP</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Handles HTTP traffic for main website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <TagInput
              value={tags}
              onChange={setTags}
              suggestions={SUGGESTED_TAGS}
              placeholder="Add tags for organization..."
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
          <Button type="submit" loading={addMutation.isPending}>
            Add IP
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddIPModal
