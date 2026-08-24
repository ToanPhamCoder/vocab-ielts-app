import { formForXp } from '../game/saiyan'

export function LevelUpModal({ xp, onClose }: { xp: number; onClose: () => void }) {
  const form = formForXp(xp)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-amber-400/40 bg-slate-950 shadow-2xl">
        <img src={form.image} alt={form.name} className="h-72 w-full object-cover object-top" />
        <div className="p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">POWER UP</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Lv.{form.level} {form.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{form.subtitle}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-lg bg-amber-500 py-3 font-semibold text-slate-950 hover:bg-amber-400"
          >
            Tiếp tục luyện
          </button>
        </div>
      </div>
    </div>
  )
}
