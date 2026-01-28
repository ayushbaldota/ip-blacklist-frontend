import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '../common/Modal'
import Button from '../common/Button'
import TagInput from '../common/TagInput'
import { api } from '../../api/client'

const SUGGESTED_TAGS = ['production', 'staging', 'development', 'external', 'internal', 'mail', 'web', 'api', 'database']

function EditIPModal({ isOpen, onClose, ip }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (ip) {
      setName(ip.name || '')
      setDescription(ip.description || '')
      setTags(ip.tags || [])
    }
  }, [ip])

  const updateMutation = useMutation({
    mutationFn: (data) => api.updateIP(ip.ip_address, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['ip', ip.ip_address] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      handleClose()
    },
    onError: (err) => {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update IP')
    },
  })

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    updateMutation.mutate({
      name: name || null,
      description: description || null,
      tags: tags,
    })
  }

  if (!ip) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit IP Address">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={ip.ip_address}
              className="input bg-gray-50"
              disabled
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
              placeholder="Web server, Mail server, etc."
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
          <Button type="submit" loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditIPModal
