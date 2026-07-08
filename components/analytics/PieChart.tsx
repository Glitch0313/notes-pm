'use client'

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const VISIBILITY_LABELS: Record<string, string> = {
  PRIVATE: 'خاصة',
  PUBLIC: 'عامة',
  FOR_SALE: 'للبيع',
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b']

interface Props {
  data: { visibility: string; count: number }[]
}

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: 10,
  color: '#e2e8f0',
  fontSize: 13,
}

export default function PieChart({ data }: Props) {
  const mapped = data.map((d) => ({
    name: VISIBILITY_LABELS[d.visibility] ?? d.visibility,
    value: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RePieChart>
        <Pie
          data={mapped}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {mapped.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: '#e2e8f0' }}
          formatter={(v: number) => [v, 'مذكرة']}
        />
        <Legend iconType="circle" iconSize={10} />
      </RePieChart>
    </ResponsiveContainer>
  )
}
