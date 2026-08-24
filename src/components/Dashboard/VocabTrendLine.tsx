import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface VocabTrendLineProps {
  data: { date: string; count: number }[]
}

export function VocabTrendLine({ data }: VocabTrendLineProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
        <YAxis stroke="#94a3b8" allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#a855f7"
          strokeWidth={2}
          dot={{ fill: '#a855f7', r: 3 }}
          name="Từ mới"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
