'use client'

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { date: string; count: number }[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const chartTick = { fontSize: 12, fill: '#94a3b8' }
const axisLine = { stroke: '#334155' }
const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 13,
}

export default function LineChart({ data }: Props) {
  const mapped = data.map((d) => ({ name: formatDate(d.date), count: d.count }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReLineChart data={mapped} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" tick={{ ...chartTick, fontSize: 11 }} axisLine={axisLine} tickLine={axisLine} />
        <YAxis allowDecimals={false} tick={chartTick} axisLine={axisLine} tickLine={axisLine} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#cbd5e1' }}
          itemStyle={{ color: '#e2e8f0' }}
          formatter={(v: number) => [v, 'مذكرة']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#6366f1' }}
          activeDot={{ r: 6 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  )
}
