import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useIP, useIPHistory } from '../hooks/useIPDetail'
import IPInfo from '../components/ip-detail/IPInfo'
import HistoryTimeline from '../components/ip-detail/HistoryTimeline'
import HistoryChart from '../components/ip-detail/HistoryChart'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'

function IPDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: ip, isLoading: ipLoading, error } = useIP(id)
  const { data: historyData, isLoading: historyLoading } = useIPHistory(id, { limit: 50 })

  if (ipLoading) {
    return <Loading text="Loading IP details..." />
  }

  if (error || !ip) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">IP address not found</p>
        <Button variant="secondary" onClick={() => navigate('/ips')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to IP List
        </Button>
      </div>
    )
  }

  const history = historyData?.items || historyData?.history || []

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/ips')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to IP List
      </button>

      {/* IP Info */}
      <IPInfo ip={ip} />

      {/* History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Listing History
          </h3>
          <HistoryChart history={history} />
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Check History
          </h3>
          {historyLoading ? (
            <Loading size="sm" text="Loading history..." />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <HistoryTimeline history={history} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IPDetail
