import { Link } from 'react-router-dom'
import { useStats, countDueWords } from '../db/hooks'
import { StatusDonut } from '../components/Dashboard/StatusDonut'
import { MonthlyProgressBar } from '../components/Dashboard/MonthlyProgressBar'
import { ReadinessScore } from '../components/Dashboard/ReadinessScore'
import { VocabTrendLine } from '../components/Dashboard/VocabTrendLine'
import { useEffect, useState } from 'react'

export function Home() {
  const stats = useStats()
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    void countDueWords().then(setDueCount)
  }, [stats])

  if (!stats) {
    return <div className="text-slate-400">Đang tải thống kê...</div>
  }

  return (
    <div className="space-y-6">
      {dueCount > 0 && (
        <Link
          to="/review"
          className="block rounded-xl border border-blue-500/40 bg-blue-900/30 p-4 transition hover:bg-blue-900/50"
        >
          <p className="font-semibold text-blue-300">
            {dueCount} từ cần ôn tập ngay →
          </p>
        </Link>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
          <ReadinessScore
            score={stats.readinessScore}
            totalKnown={stats.totalKnown}
            baseline={stats.baselineVocabSize}
            masteredInApp={stats.mastered}
            target={stats.targetVocabSize}
            wordsNeeded={stats.wordsNeeded}
            retentionRate={stats.retentionRate}
          />
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
          <h2 className="mb-2 text-lg font-semibold text-white">Trạng thái từ vựng</h2>
          <StatusDonut data={stats.statusDistribution} />
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
            {stats.statusDistribution.map((d) => (
              <span key={d.name} className="flex items-center gap-1 text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tổng từ" value={stats.total} color="text-white" />
        <StatCard label="Đã thuộc" value={stats.mastered} color="text-green-400" />
        <StatCard label="Streak" value={`${stats.streak} ngày`} color="text-amber-400" />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Tiến độ tháng</h2>
        <MonthlyProgressBar mastered={stats.masteredThisMonth} target={stats.monthlyTarget} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Từ mới (30 ngày)</h2>
        <VocabTrendLine data={stats.addedTrend} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
