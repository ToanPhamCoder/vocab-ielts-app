import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWords } from '../db/hooks'
import { getDisplayState, type VocabWord } from '../db/schema'
import { formatTopicTitle } from '../stats/calculateStats'

interface TopicGroup {
  date: string
  items: VocabWord[]
  mastered: number
  overdue: number
}

export function Words() {
  const words = useWords()
  const [search, setSearch] = useState('')

  const topics = useMemo(() => {
    if (!words) return []
    const q = search.trim().toLowerCase()
    const map = new Map<string, VocabWord[]>()
    for (const w of words) {
      const list = map.get(w.addedDate) ?? []
      list.push(w)
      map.set(w.addedDate, list)
    }

    const groups: TopicGroup[] = Array.from(map.entries()).map(([date, items]) => ({
      date,
      items,
      mastered: items.filter((w) => getDisplayState(w) === 'Mastered').length,
      overdue: items.filter((w) => getDisplayState(w) === 'Overdue').length,
    }))

    groups.sort((a, b) => b.date.localeCompare(a.date))

    if (!q) return groups
    return groups.filter(
      (g) =>
        formatTopicTitle(g.date).toLowerCase().includes(q) ||
        g.date.includes(q) ||
        g.items.some(
          (w) =>
            w.word.toLowerCase().includes(q) ||
            w.meaning.toLowerCase().includes(q) ||
            w.tags.some((t) => t.toLowerCase().includes(q)),
        ),
    )
  }, [words, search])

  if (!words) {
    return <div className="text-slate-400">Đang tải...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Chủ đề theo ngày thêm</h2>
        <p className="mt-1 text-sm text-slate-400">
          Mỗi ngày thêm từ là một chủ đề. Bấm vào để xem full list và học flashcard.
        </p>
      </div>

      <input
        className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        placeholder="Tìm ngày, từ, nghĩa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {topics.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
          Chưa có từ vựng nào. Hãy thêm từ mới!
        </p>
      ) : (
        <ul className="space-y-3">
          {topics.map((topic) => {
            const preview = topic.items
              .slice(0, 4)
              .map((w) => w.word)
              .join(' · ')
            return (
              <li key={topic.date}>
                <Link
                  to={`/words/${topic.date}`}
                  className="block rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 transition hover:border-amber-500/40 hover:bg-slate-800/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{formatTopicTitle(topic.date)}</p>
                      <p className="mt-1 truncate text-sm text-slate-400">{preview}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200">
                      {topic.items.length} từ
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {topic.mastered > 0 && (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-green-300">
                        {topic.mastered} thuộc
                      </span>
                    )}
                    {topic.overdue > 0 && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-300">
                        {topic.overdue} overdue
                      </span>
                    )}
                    <span className="text-slate-500">Xem full list →</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
