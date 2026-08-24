import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface StatusDonutProps {
  data: { name: string; value: number; color: string }[]
}

export function StatusDonut({ data }: StatusDonutProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400">
        Ch?a c? d? li?u
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
          labelStyle={{ color: '#f1f5f9' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
