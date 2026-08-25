import { useCallback, useEffect, useMemo, useState } from 'react'
import type { VocabWord } from '../db/schema'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

interface TopicFlashcardsProps {
  words: VocabWord[]
  title: string
  onClose: () => void
}

export function TopicFlashcards({ words, title, onClose }: TopicFlashcardsProps) {
  const [deck, setDeck] = useState<VocabWord[]>(() => shuffle(words))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [viFirst, setViFirst] = useState(false)
  const [done, setDone] = useState(false)

  const current = deck[index]
  const total = deck.length

  const front = useMemo(() => {
    if (!current) return { label: '', main: '', sub: '' }
    if (viFirst) {
      return { label: 'Nghĩa', main: current.meaning, sub: current.example ?? '' }
    }
    return { label: 'Từ vựng', main: current.word, sub: current.phonetic ?? '' }
  }, [current, viFirst])

  const back = useMemo(() => {
    if (!current) return { label: '', main: '', sub: '', extra: '' }
    if (viFirst) {
      return {
        label: 'Từ vựng',
        main: current.word,
        sub: current.phonetic ?? '',
        extra: current.example ?? '',
      }
    }
    return {
      label: 'Nghĩa',
      main: current.meaning,
      sub: current.example ?? '',
      extra: current.partOfSpeech ?? '',
    }
  }, [current, viFirst])

  function restart(nextWords = words) {
    setDeck(shuffle(nextWords))
    setIndex(0)
    setFlipped(false)
    setDone(false)
  }

  const go = useCallback(
    (delta: number) => {
      const next = index + delta
      if (next < 0) return
      if (next >= total) {
        setDone(true)
        return
      }
      setIndex(next)
      setFlipped(false)
    },
    [index, total],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (done) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, go, onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 px-4 pb-8 pt-4">
      <div className="mx-auto flex w-full max-w-lg items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-300">Flashcard</p>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          Đóng
        </button>
      </div>

      {done || !current ? (
        <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-green-700/40 bg-green-950/30 p-8 text-center">
          <p className="text-2xl font-bold text-green-300">Xong bộ flashcard</p>
          <p className="mt-2 text-slate-300">Đã xem {total} từ của chủ đề này.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => restart()}
              className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400"
            >
              Học lại
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800"
            >
              Về danh sách
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-6 w-full max-w-lg space-y-5">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
            <span>
              {index + 1} / {total}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setViFirst((v) => !v)
                setFlipped(false)
              }}
              className="shrink-0 rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-300"
            >
              {viFirst ? 'VI → EN' : 'EN → VI'}
            </button>
          </div>

          <button
            type="button"
            className="card-flip w-full"
            onClick={() => setFlipped((f) => !f)}
          >
            <div className={`card-inner relative min-h-[300px] ${flipped ? 'flipped' : ''}`}>
              <div className="card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-600 bg-slate-800 p-8">
                <p className="text-sm uppercase tracking-widest text-slate-400">{front.label}</p>
                <p className="mt-4 text-center text-4xl font-bold text-white">{front.main}</p>
                {front.sub && <p className="mt-3 text-center text-slate-400">{front.sub}</p>}
                <p className="mt-8 text-sm text-slate-500">Nhấn để lật thẻ</p>
              </div>
              <div className="card-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-amber-500/40 bg-slate-800 p-8">
                <p className="text-sm uppercase tracking-widest text-amber-300">{back.label}</p>
                <p className="mt-4 text-center text-3xl font-bold text-white">{back.main}</p>
                {back.sub && <p className="mt-3 text-center italic text-slate-400">{back.sub}</p>}
                {back.extra && back.extra !== back.sub && (
                  <p className="mt-2 text-sm text-slate-500">{back.extra}</p>
                )}
              </div>
            </div>
          </button>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="rounded-lg border border-slate-600 py-3 text-sm font-medium text-slate-200 disabled:opacity-30"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="rounded-lg bg-slate-700 py-3 text-sm font-medium text-white"
            >
              Lật
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="rounded-lg bg-amber-500 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              {index + 1 >= total ? 'Xong' : 'Tiếp'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
