import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { api } from '../../api/client'

function AddIPModal({ isOpen, onClose }) {
  const [ipAddress, setIpAddress] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: api.addIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      handleClose()
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'Failed to add IP address')
    },
  })

  const handleClose = () => {
    setIpAddress('')
    setDescription('')
    setError('')
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ipAddress)) {
      setError('Please enter a valid IPv4 address')
      return
    }

    addMutation.mutate({
      ip_address: ipAddress,
      description: description || undefined,
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
              placeholder="192.168.1.1"
              required
            />
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
              placeholder="Optional description"
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
