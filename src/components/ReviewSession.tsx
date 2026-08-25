import { useCallback, useEffect, useState } from 'react'
import { buildReviewQueue, getSettings, submitReview } from '../db/hooks'
import type { ReviewRating, VocabWord } from '../db/schema'
import { ratingLabel } from '../srs/fsrsService'
import { LevelUpModal } from './LevelUpModal'

interface ReviewSessionProps {
  onComplete?: () => void
}

interface SessionSummary {
  total: number
  good: number
  again: number
  xp: number
}

export function ReviewSession({ onComplete }: ReviewSessionProps) {
  const [queue, setQueue] = useState<VocabWord[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [stats, setStats] = useState({ good: 0, again: 0, xp: 0 })
  const [levelUpXp, setLevelUpXp] = useState<number | null>(null)

  const loadQueue = useCallback(async () => {
    setLoading(true)
    const items = await buildReviewQueue()
    setQueue(items)
    setIndex(0)
    setFlipped(false)
    setStartTime(Date.now())
    setSummary(null)
    setStats({ good: 0, again: 0, xp: 0 })
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  const current = queue[index]

  async function handleRating(rating: ReviewRating) {
    if (!current) return
    const responseTimeMs = Date.now() - startTime
    const { game } = await submitReview(current, rating, responseTimeMs)
    if (game.leveledUp) setLevelUpXp((await getSettings()).xp)

    const nextStats = {
      good: stats.good + (rating >= 3 ? 1 : 0),
      again: stats.again + (rating === 1 ? 1 : 0),
      xp: stats.xp + game.xpGained,
    }
    setStats(nextStats)

    if (index + 1 >= queue.length) {
      setSummary({
        total: queue.length,
        good: nextStats.good,
        again: nextStats.again,
        xp: nextStats.xp,
      })
      return
    }

    setIndex((i) => i + 1)
    setFlipped(false)
    setStartTime(Date.now())
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Đang chuẩn bị phiên ôn...</div>
  }

  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-8 text-center">
        <p className="text-lg text-slate-200">Không có từ cần ôn tập!</p>
        <p className="mt-2 text-sm text-slate-400">Thêm từ mới hoặc quay lại sau.</p>
      </div>
    )
  }

  if (summary) {
    return (
      <div className="rounded-xl border border-green-700/50 bg-green-900/20 p-8 text-center">
        {levelUpXp !== null && (
          <LevelUpModal xp={levelUpXp} onClose={() => setLevelUpXp(null)} />
        )}
        <h2 className="text-2xl font-bold text-green-300">Hoàn thành!</h2>
        <p className="mt-4 text-slate-200">Đã ôn {summary.total} từ</p>
        <p className="mt-2 text-amber-300">+{summary.xp} XP</p>
        <p className="mt-2 text-green-400">{summary.good} từ trả lời tốt</p>
        <p className="mt-1 text-red-400">{summary.again} từ cần ôn lại</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => void loadQueue()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
          >
            Ôn tiếp
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg border border-slate-600 px-4 py-2 font-medium text-slate-200 hover:bg-slate-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {levelUpXp !== null && (
        <LevelUpModal xp={levelUpXp} onClose={() => setLevelUpXp(null)} />
      )}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {index + 1} / {queue.length}
        </span>
        <div className="h-2 flex-1 mx-4 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${((index + 1) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      <div
        className="card-flip cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => e.key === ' ' && setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
      >
        <div
          key={current.id}
          className={`card-inner relative min-h-[280px] ${flipped ? 'flipped' : ''}`}
        >
          <div className="card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-600 bg-slate-800/80 p-8 shadow-xl">
            <p className="text-sm uppercase tracking-widest text-slate-400">Từ vựng</p>
            <h2 className="mt-4 text-4xl font-bold text-white">{current.word}</h2>
            {current.phonetic && (
              <p className="mt-2 text-lg text-slate-400">{current.phonetic}</p>
            )}
            {current.partOfSpeech && (
              <span className="mt-3 rounded bg-slate-700 px-3 py-1 text-sm text-slate-300">
                {current.partOfSpeech}
              </span>
            )}
            <p className="mt-8 text-sm text-slate-500">Nhấn để xem nghĩa</p>
          </div>
          <div className="card-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-blue-600/50 bg-slate-800/80 p-8 shadow-xl">
            {flipped && (
              <>
                <p className="text-sm uppercase tracking-widest text-slate-400">Nghĩa</p>
                <p className="mt-4 text-center text-2xl text-white">{current.meaning}</p>
                {current.example && (
                  <p className="mt-4 text-center text-sm italic text-slate-400">{current.example}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([1, 2, 3, 4] as ReviewRating[]).map((rating) => {
            const colors: Record<ReviewRating, string> = {
              1: 'bg-red-600 hover:bg-red-500',
              2: 'bg-orange-600 hover:bg-orange-500',
              3: 'bg-green-600 hover:bg-green-500',
              4: 'bg-blue-600 hover:bg-blue-500',
            }
            return (
              <button
                key={rating}
                type="button"
                onClick={() => void handleRating(rating)}
                className={`rounded-lg px-3 py-3 text-sm font-semibold text-white ${colors[rating]}`}
              >
                {ratingLabel(rating)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
