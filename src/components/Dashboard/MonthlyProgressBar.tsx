import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface MonthlyProgressBarProps {
  mastered: number
  target: number
}

export function MonthlyProgressBar({ mastered, target }: MonthlyProgressBarProps) {
  const data = [
    { name: '?? thu?c', value: mastered, fill: '#22c55e' },
    { name: 'M?c ti?u', value: Math.max(0, target - mastered), fill: '#334155' },
  ]

  const pct = target > 0 ? Math.min(100, Math.round((mastered / target) * 100)) : 0

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-400">Ti?n ?? th?ng n?y</span>
        <span className="font-medium text-slate-200">
          {mastered} / {target} t? ({pct}%)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
