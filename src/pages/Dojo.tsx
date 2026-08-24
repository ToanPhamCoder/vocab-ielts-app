import { useSettings } from '../db/hooks'
import { ACHIEVEMENTS } from '../game/achievements'
import { SAIYAN_FORMS, formForXp } from '../game/saiyan'

export function Dojo() {
  const settings = useSettings()
  if (!settings) return <div className="text-slate-400">Đang tải...</div>
  const current = formForXp(settings.xp ?? 0)
  const unlocked = new Set(settings.unlockedAchievements ?? [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Dojo Saiyan</h2>
        <p className="mt-1 text-sm text-slate-400">Form gallery + thành tựu. FSRS vẫn quyết định lịch ôn.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SAIYAN_FORMS.map((form) => {
          const owned = current.level >= form.level
          return (
            <div
              key={form.id}
              className={`overflow-hidden rounded-xl border ${owned ? 'border-amber-400/40' : 'border-slate-700 opacity-50'}`}
            >
              <img src={form.image} alt={form.name} className="h-40 w-full object-cover object-top" />
              <div className="p-2">
                <p className="text-xs text-slate-400">Lv.{form.level}</p>
                <p className="text-sm font-semibold text-white">{form.name}</p>
                <p className="text-xs text-slate-500">{form.xpRequired.toLocaleString()} XP</p>
              </div>
            </div>
          )
        })}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Achievements</h3>
        <div className="space-y-2">
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.has(a.id)
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${on ? 'border-green-500/40 bg-green-950/20' : 'border-slate-700 bg-slate-800/30'}`}
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className={`font-medium ${on ? 'text-green-300' : 'text-slate-200'}`}>{a.name}</p>
                  <p className="text-xs text-slate-400">{a.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
