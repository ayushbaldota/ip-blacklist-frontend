import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

function HistoryChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No history data available
      </div>
    )
  }

  // Transform history data for chart
  const chartData = history.slice().reverse().map((item) => ({
    date: new Date(item.checked_at || item.created_at).toLocaleDateString(),
    listings: item.blacklist_count || item.blacklists?.length || 0,
    status: item.status,
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value) => [`${value} listings`, 'Blacklists']}
        />
        <ReferenceLine y={0} stroke="#22c55e" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="listings"
          name="Blacklist Listings"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default HistoryChart
