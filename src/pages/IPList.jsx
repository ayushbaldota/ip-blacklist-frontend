import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload, Search, X, Tag, LayoutGrid, List } from 'lucide-react'
import { useIPs } from '../hooks/useIPs'
import { api } from '../api/client'
import IPTable from '../components/ips/IPTable'
import IPGrid from '../components/ips/IPGrid'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Pagination from '../components/common/Pagination'
import AddIPModal from '../components/ips/AddIPModal'
import BulkImportModal from '../components/ips/BulkImportModal'
import EditIPModal from '../components/ips/EditIPModal'

const COMMON_TAGS = ['production', 'staging', 'development', 'external', 'internal', 'mail', 'web', 'api']

function IPList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useIPs({
    page,
    search: search || undefined,
    status: statusFilter || undefined,
    tag: tagFilter || undefined,
    limit: 20,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteIP(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      setDeleteTarget(null)
    },
  })

  const handleDelete = (ip) => {
    setDeleteTarget(ip)
  }

  const handleEdit = (ip) => {
    setEditTarget(ip)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.ip_address)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setTagFilter('')
    setPage(1)
  }

  const hasFilters = search || statusFilter || tagFilter

  const ips = data?.items || data?.ips || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search IPs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="input pl-10 w-56"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="input w-36"
            >
              <option value="">All Status</option>
              <option value="clean">Clean</option>
              <option value="blacklisted">Blacklisted</option>
              <option value="pending">Pending</option>
            </select>

            {/* Tag Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value)
                  setPage(1)
                }}
                className="input pl-10 w-40"
              >
                <option value="">All Tags</option>
                {COMMON_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add IP
            </Button>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-gray-500">
            {total} IP address{total !== 1 ? 'es' : ''} found
            {hasFilters && ' (filtered)'}
          </p>
        )}
      </div>

      {/* IP List - Grid or Table View */}
      {viewMode === 'grid' ? (
        <div>
          <IPGrid
            ips={ips}
            isLoading={isLoading}
            onDelete={handleDelete}
          />
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={20}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <IPTable
            ips={ips}
            isLoading={isLoading}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={20}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* Add IP Modal */}
      <AddIPModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />

      {/* Edit IP Modal */}
      <EditIPModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        ip={editTarget}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete IP Address"
        size="sm"
      >
        <div>
          <p className="text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-mono font-medium">{deleteTarget?.ip_address}</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone. All history for this IP will be lost.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default IPList
