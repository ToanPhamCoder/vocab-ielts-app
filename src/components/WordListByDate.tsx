import { useMemo, useState } from 'react'
import { useWords, deleteWord } from '../db/hooks'
import { getDisplayState } from '../db/schema'
import { formatDateLabel } from '../stats/calculateStats'

const stateColors: Record<string, string> = {
  New: 'bg-purple-500/20 text-purple-300',
  Learning: 'bg-blue-500/20 text-blue-300',
  Review: 'bg-amber-500/20 text-amber-300',
  Relearning: 'bg-orange-500/20 text-orange-300',
  Mastered: 'bg-green-500/20 text-green-300',
  Overdue: 'bg-red-500/20 text-red-300',
}

export function WordListByDate() {
  const words = useWords()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const grouped = useMemo(() => {
    if (!words) return []
    const filtered = words.filter((w) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
      const displayState = getDisplayState(w)
      const matchStatus = statusFilter === 'all' || displayState === statusFilter
      return matchSearch && matchStatus
    })

    const map = new Map<string, typeof filtered>()
    for (const w of filtered) {
      const list = map.get(w.addedDate) ?? []
      list.push(w)
      map.set(w.addedDate, list)
    }
    return Array.from(map.entries())
  }, [words, search, statusFilter])

  function toggleGroup(date: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  if (!words) {
    return <div className="text-slate-400">Đang tải...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          placeholder="Tìm từ, nghĩa, tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="New">New</option>
          <option value="Learning">Learning</option>
          <option value="Review">Review</option>
          <option value="Mastered">Mastered</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
          Chưa có từ vựng nào. Hãy thêm từ mới!
        </p>
      ) : (
        grouped.map(([date, items]) => (
          <div key={date} className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/40">
            <button
              type="button"
              onClick={() => toggleGroup(date)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-700/30"
            >
              <span className="font-semibold text-slate-100">
                {formatDateLabel(date)} ({items.length} từ)
              </span>
              <span className="text-slate-400">{collapsed.has(date) ? '▶' : '▼'}</span>
            </button>
            {!collapsed.has(date) && (
              <ul className="divide-y divide-slate-700/50">
                {items.map((w) => {
                  const displayState = getDisplayState(w)
                  return (
                    <li key={w.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">{w.word}</span>
                          {w.phonetic && (
                            <span className="text-sm text-slate-400">{w.phonetic}</span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateColors[displayState] ?? stateColors.New}`}
                          >
                            {displayState}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{w.meaning}</p>
                        {w.example && (
                          <p className="mt-1 text-xs italic text-slate-500">{w.example}</p>
                        )}
                        {w.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {w.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                              >
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
            )}
          </div>
        ))
      )}
    </div>
  )
}
