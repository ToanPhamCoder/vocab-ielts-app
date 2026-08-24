import { xpProgress } from '../game/saiyan'

export function SaiyanHero({
  xp,
  streak,
  dueReviewed,
  dueTarget,
  newAdded,
  newGoal,
  dailyComplete,
}: {
  xp: number
  streak: number
  dueReviewed: number
  dueTarget: number
  newAdded: number
  newGoal: number
  dailyComplete: boolean
}) {
  const { current, next, into, need, pct } = xpProgress(xp)
  const duePct = dueTarget === 0 ? 100 : Math.min(100, Math.round((dueReviewed / dueTarget) * 100))
  const newPct = newGoal === 0 ? 100 : Math.min(100, Math.round((newAdded / newGoal) * 100))

  return (
    <div
      className="overflow-hidden rounded-2xl border bg-slate-900/70 shadow-xl"
      style={{ borderColor: current.accent + '66' }}
    >
      <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
        <div className="relative min-h-[220px] overflow-hidden bg-slate-950">
          <div
            className="saiyan-aura pointer-events-none absolute -inset-6 blur-2xl"
            style={{ background: `radial-gradient(circle at 50% 70%, ${current.accent} 0%, transparent 62%)` }}
          />
          <img
            src={current.image}
            alt={current.name}
            className="saiyan-portrait relative z-10 h-full w-full object-cover object-top"
          />
          <div
            className="saiyan-spark pointer-events-none absolute left-[18%] top-[22%] z-20 h-2 w-2 rounded-full"
            style={{ background: current.accent, boxShadow: `0 0 10px ${current.accent}` }}
          />
          <div
            className="saiyan-spark saiyan-spark-delay pointer-events-none absolute right-[20%] top-[38%] z-20 h-1.5 w-1.5 rounded-full"
            style={{ background: '#fff', boxShadow: `0 0 8px ${current.accent}` }}
          />
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
            <div
              className="saiyan-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Lv.{current.level}</p>
              <h2 className="text-2xl font-bold text-white" style={{ color: current.accent }}>
                {current.name}
              </h2>
              <p className="text-sm text-slate-400">{current.subtitle}</p>
            </div>
            <div className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-300">
              Streak {streak}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>{xp.toLocaleString()} XP</span>
              <span>{next ? `${into}/${need} tới ${next.name}` : 'Max form'}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: current.accent }} />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <GoalBar label="Ôn due" value={`${dueReviewed}/${dueTarget || 0}`} pct={duePct} color="#3b82f6" />
            <GoalBar label="Từ mới" value={`${newAdded}/${newGoal}`} pct={newPct} color="#a855f7" />
          </div>
          {dailyComplete && (
            <p className="mt-3 text-sm font-medium text-green-400">Daily goal hoàn thành!</p>
          )}
        </div>
      </div>
    </div>
  )
}

function GoalBar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
