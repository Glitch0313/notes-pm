'use client'

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'عام',
  TECHNOLOGY: 'تقنية',
  SCIENCE: 'علوم',
  LITERATURE: 'أدب',
  PHILOSOPHY: 'فلسفة',
  HISTORY: 'تاريخ',
  ART: 'فن',
  BUSINESS: 'أعمال',
}

interface Props {
  data: { category: string; count: number }[]
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

export default function BarChart({ data }: Props) {
  const mapped = data.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    count: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReBarChart data={mapped} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" tick={chartTick} axisLine={axisLine} tickLine={axisLine} />
        <YAxis allowDecimals={false} tick={chartTick} axisLine={axisLine} tickLine={axisLine} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#cbd5e1' }}
          itemStyle={{ color: '#e2e8f0' }}
          formatter={(v: number) => [v, 'مذكرة']}
        />
        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}
