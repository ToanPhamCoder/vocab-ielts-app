import { useMemo, useState } from 'react'
import { useSettings, useWords, getSettings } from '../db/hooks'
import { answersMatch, buildQuests, type VocabQuest } from '../game/quests'
import { applyQuestXp } from '../game/progress'
import { LevelUpModal } from '../components/LevelUpModal'

export function Quests() {
  const words = useWords()
  const settings = useSettings()
  const [active, setActive] = useState<VocabQuest | null>(null)
  const [picked, setPicked] = useState('')
  const [typed, setTyped] = useState('')
  const [feedback, setFeedback] = useState('')
  const [levelUpXp, setLevelUpXp] = useState<number | null>(null)
  const [lastXp, setLastXp] = useState(0)

  const quests = useMemo(() => {
    if (!words || !settings) return []
    return buildQuests(words, settings.completedQuestIds ?? [])
  }, [words, settings])

  if (!words || !settings) {
    return <div className="text-slate-400">Đang tải...</div>
  }

  function resetPlay() {
    setPicked('')
    setTyped('')
    setFeedback('')
  }

  async function complete(quest: VocabQuest) {
    const game = await applyQuestXp(quest.id, quest.xp)
    if (!game) {
      setFeedback('Nhiệm vụ này đã làm rồi.')
      return
    }
    setLastXp(game.xpGained)
    if (game.leveledUp) {
      const s = await getSettings()
      setLevelUpXp(s.xp)
    }
    setActive(null)
    resetPlay()
  }

  async function submitMcq(quest: VocabQuest, option: string) {
    setPicked(option)
    if (answersMatch(quest.answer, option)) {
      setFeedback('Chính xác!')
      await complete(quest)
    } else {
      setFeedback('Sai rồi, thử lại.')
    }
  }

  async function submitTyped(quest: VocabQuest) {
    if (answersMatch(quest.answer, typed)) {
      setFeedback('Chính xác!')
      await complete(quest)
    } else {
      setFeedback('Sai chính tả, thử lại.')
    }
  }

  if (active) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        {levelUpXp !== null && <LevelUpModal xp={levelUpXp} onClose={() => setLevelUpXp(null)} />}
        <button type="button" onClick={() => { setActive(null); resetPlay() }} className="text-sm text-slate-400 hover:text-white">
          ← Quay lại danh sách
        </button>
        <p className="text-xs uppercase tracking-widest text-amber-300">{active.title} · +{active.xp} XP</p>
        <h2 className="text-2xl font-bold text-white">{active.prompt}</h2>
        {active.hint && <p className="text-sm text-slate-500">{active.hint}</p>}

        {active.options ? (
          <div className="space-y-2">
            {active.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => void submitMcq(active, opt)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-slate-100 hover:bg-slate-800 ${
                  picked === opt ? 'border-amber-400' : 'border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submitTyped(active)
            }}
            className="space-y-3"
          >
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Nhập từ tiếng Anh"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <button type="submit" className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-slate-950">
              Kiểm tra
            </button>
          </form>
        )}
        {feedback && <p className="text-sm text-amber-300">{feedback}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {levelUpXp !== null && <LevelUpModal xp={levelUpXp} onClose={() => setLevelUpXp(null)} />}
      <div>
        <h2 className="text-xl font-semibold text-white">Nhiệm vụ</h2>
        <p className="mt-1 text-sm text-slate-400">
          Bài tập từ các từ đã lưu. Làm đúng 1 lần là biến mất, không làm lại được.
        </p>
        {lastXp > 0 && <p className="mt-2 text-sm text-green-400">+{lastXp} XP</p>}
      </div>

      {words.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
          Thêm từ vựng trước, rồi quay lại đây để cày XP.
        </p>
      ) : quests.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
          Hết nhiệm vụ cho các từ hiện có. Thêm từ mới để mở quest mới.
        </p>
      ) : (
        <ul className="space-y-2">
          {quests.map((q) => (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => {
                  resetPlay()
                  setActive(q)
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-left hover:border-amber-400/40"
              >
                <div>
                  <p className="text-sm font-medium text-white">{q.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{q.prompt}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-amber-300">+{q.xp}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
