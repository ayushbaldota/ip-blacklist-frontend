import { useNavigate } from 'react-router-dom'
import { Trash2, Eye, Pencil } from 'lucide-react'
import StatusBadge from './StatusBadge'
import Table from '../common/Table'
import { TagList } from '../common/TagInput'

function formatDate(dateString) {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

function IPRow({ ip, onDelete, onEdit }) {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/ips/${encodeURIComponent(ip.ip_address)}`)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(ip)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(ip)
  }

  return (
    <Table.Row onClick={handleViewDetails} className="group">
      <Table.Cell>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium">{ip.ip_address}</span>
            {ip.name && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {ip.name}
              </span>
            )}
          </div>
          {ip.tags && ip.tags.length > 0 && (
            <div className="mt-1">
              <TagList tags={ip.tags.slice(0, 3)} size="sm" />
              {ip.tags.length > 3 && (
                <span className="text-xs text-gray-400 ml-1">+{ip.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Table.Cell>
      <Table.Cell>
        <StatusBadge status={ip.status} />
      </Table.Cell>
      <Table.Cell className="text-gray-500 max-w-[200px] truncate">
        {ip.description || '-'}
      </Table.Cell>
      <Table.Cell className="text-gray-500">
        {formatDate(ip.last_checked)}
      </Table.Cell>
      <Table.Cell className="text-gray-500">
        {ip.blacklist_count || ip.listings || 0}
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleViewDetails}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default IPRow
