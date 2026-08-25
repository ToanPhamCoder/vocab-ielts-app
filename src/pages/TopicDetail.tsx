import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TopicFlashcards } from '../components/TopicFlashcards'
import { deleteWord, useWords } from '../db/hooks'
import { getDisplayState } from '../db/schema'
import { formatTopicTitle } from '../stats/calculateStats'

const stateColors: Record<string, string> = {
  New: 'bg-purple-500/20 text-purple-300',
  Learning: 'bg-blue-500/20 text-blue-300',
  Review: 'bg-amber-500/20 text-amber-300',
  Relearning: 'bg-orange-500/20 text-orange-300',
  Mastered: 'bg-green-500/20 text-green-300',
  Overdue: 'bg-red-500/20 text-red-300',
}

export function TopicDetail() {
  const { date = '' } = useParams()
  const words = useWords()
  const [search, setSearch] = useState('')
  const [flash, setFlash] = useState(false)

  const items = useMemo(() => {
    if (!words) return []
    return words.filter((w) => w.addedDate === date)
  }, [words, date])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [items, search])

  if (!words) {
    return <div className="text-slate-400">Đang tải...</div>
  }

  const title = formatTopicTitle(date)

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <Link to="/words" className="text-sm text-slate-400 hover:text-white">
          ← Tất cả chủ đề
        </Link>
        <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
          Không có từ nào trong chủ đề này.
        </p>
      </div>
    )
  }

  return (
    <div className="relative space-y-4">
      {flash && (
        <TopicFlashcards words={items} title={title} onClose={() => setFlash(false)} />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to="/words" className="text-sm text-slate-400 hover:text-white">
            ← Tất cả chủ đề
          </Link>
          <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{items.length} từ thêm ngày {date}</p>
        </div>
        <button
          type="button"
          onClick={() => setFlash(true)}
          className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Học flashcard
        </button>
      </div>

      <input
        className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        placeholder="Lọc từ trong chủ đề này..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className="divide-y divide-slate-700/50 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/40">
        {visible.map((w) => {
          const displayState = getDisplayState(w)
          return (
            <li key={w.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{w.word}</span>
                  {w.phonetic && <span className="text-sm text-slate-400">{w.phonetic}</span>}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateColors[displayState] ?? stateColors.New}`}
                  >
                    {displayState}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{w.meaning}</p>
                {w.example && <p className="mt-1 text-xs italic text-slate-500">{w.example}</p>}
                {w.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {w.tags.map((t) => (
                      <span key={t} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void deleteWord(w.id)}
                className="shrink-0 text-sm text-red-400 hover:text-red-300"
              >
                Xóa
              </button>
            </li>
          )
        })}
      </ul>

      {visible.length === 0 && (
        <p className="text-center text-sm text-slate-500">Không khớp từ nào với bộ lọc.</p>
      )}
    </div>
  )
}
