import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Download } from 'lucide-react'
import { api } from '../api/client'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899']

function Statistics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const exportCSV = () => {
    if (!stats) return

    const rows = [
      ['Metric', 'Value'],
      ['Total IPs', stats.total || 0],
      ['Clean', stats.clean || 0],
      ['Blacklisted', stats.blacklisted || 0],
      ['Pending', stats.pending || 0],
    ]

    if (stats.providers) {
      rows.push(['', ''])
      rows.push(['Provider', 'Listings'])
      stats.providers.forEach(p => {
        rows.push([p.name || p.provider, p.count || p.listings])
      })
    }

    const csv = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blacklist-stats-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <Loading text="Loading statistics..." />
  }

  // Prepare data for charts
  const statusData = [
    { name: 'Clean', value: stats?.clean || 0, color: '#22c55e' },
    { name: 'Blacklisted', value: stats?.blacklisted || 0, color: '#ef4444' },
    { name: 'Pending', value: stats?.pending || 0, color: '#eab308' },
  ].filter(d => d.value > 0)

  const providerData = (stats?.providers || []).map((p, idx) => ({
    name: p.name || p.provider,
    listings: p.count || p.listings || 0,
    color: COLORS[idx % COLORS.length],
  }))

  const historyData = stats?.history || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Statistics Overview</h2>
        <Button variant="secondary" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Distribution
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Provider Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Listings by Provider
          </h3>
          {providerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="listings" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No provider data available
            </div>
          )}
        </div>
      </div>

      {/* Historical Trend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historical Trend (30 Days)
        </h3>
        {historyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="clean" name="Clean" fill="#22c55e" stackId="a" />
              <Bar dataKey="blacklisted" name="Blacklisted" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No historical data available
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            <p className="text-sm text-gray-500">Total IPs Monitored</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats?.clean || 0}</p>
            <p className="text-sm text-gray-500">Clean IPs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats?.blacklisted || 0}</p>
            <p className="text-sm text-gray-500">Blacklisted IPs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {stats?.total > 0
                ? (((stats?.clean || 0) / stats.total) * 100).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-gray-500">Health Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
