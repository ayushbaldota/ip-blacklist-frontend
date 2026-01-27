import { useQuery } from '@tanstack/react-query'
import { Server, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { api } from '../api/client'
import StatCard from '../components/dashboard/StatCard'
import RecentActivity from '../components/dashboard/RecentActivity'
import StatusChart from '../components/dashboard/StatusChart'
import Loading from '../components/common/Loading'

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <Loading text="Loading dashboard..." />
  }

  const chartData = stats?.history || []

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total IPs"
          value={stats?.total || 0}
          icon={Server}
          color="primary"
        />
        <StatCard
          title="Clean"
          value={stats?.clean || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Blacklisted"
          value={stats?.blacklisted || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Pending"
          value={stats?.pending || 0}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status History (7 Days)
          </h2>
          <StatusChart data={chartData} />
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <RecentActivity />
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Last Check Run</p>
            <p className="mt-1 font-medium">
              {stats?.last_check_run
                ? new Date(stats.last_check_run).toLocaleString()
                : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Scheduled Check</p>
            <p className="mt-1 font-medium">
              {stats?.next_check_run
                ? new Date(stats.next_check_run).toLocaleString()
                : 'Not scheduled'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Check Interval</p>
            <p className="mt-1 font-medium">
              {stats?.check_interval || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Providers</p>
            <p className="mt-1 font-medium">
              {stats?.active_providers || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
