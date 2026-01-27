import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Eye, MoreVertical } from 'lucide-react'
import StatusBadge from './StatusBadge'
import Table from '../common/Table'

function formatDate(dateString) {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

function IPRow({ ip, onDelete }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleViewDetails = () => {
    navigate(`/ips/${ip.id}`)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(ip)
  }

  return (
    <Table.Row onClick={handleViewDetails} className="group">
      <Table.Cell>
        <span className="font-mono font-medium">{ip.ip_address}</span>
      </Table.Cell>
      <Table.Cell>
        <StatusBadge status={ip.status} />
      </Table.Cell>
      <Table.Cell className="text-gray-500">
        {ip.description || '-'}
      </Table.Cell>
      <Table.Cell className="text-gray-500">
        {formatDate(ip.last_checked)}
      </Table.Cell>
      <Table.Cell className="text-gray-500">
        {ip.blacklist_count || 0}
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleViewDetails}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
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
