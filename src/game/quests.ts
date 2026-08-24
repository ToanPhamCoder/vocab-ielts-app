import type { VocabWord } from '../db/schema'

export type QuestKind = 'meaning' | 'recall' | 'type' | 'blank'

export interface VocabQuest {
  id: string
  kind: QuestKind
  wordId: string
  title: string
  prompt: string
  xp: number
  answer: string
  options?: string[]
  hint?: string
}

const FAKE_MEANINGS = [
  'bỏ qua',
  'không liên quan',
  'một ý tưởng khác',
  'không có trong bộ từ',
]

const FAKE_WORDS = ['elusive', 'pragmatic', 'coherent', 'ambiguous', 'resilient', 'obsolete']

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    const key = v.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(v)
  }
  return out
}

function pickOptions(correct: string, pool: string[], fakes: string[], count = 4): string[] {
  const others = unique(pool.filter((p) => p.trim().toLowerCase() !== correct.trim().toLowerCase()))
  const extras = unique([...others, ...fakes]).filter(
    (p) => p.trim().toLowerCase() !== correct.trim().toLowerCase(),
  )
  return shuffle([correct, ...extras.slice(0, Math.max(1, count - 1))]).slice(0, count)
}

function blankExample(word: VocabWord): string | null {
  if (!word.example) return null
  const raw = word.word.trim()
  const re = new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  if (!re.test(word.example)) return null
  return word.example.replace(re, '______')
}

export function buildQuests(words: VocabWord[], completedIds: string[]): VocabQuest[] {
  const done = new Set(completedIds)
  const quests: VocabQuest[] = []
  const meanings = words.map((w) => w.meaning)
  const terms = words.map((w) => w.word)

  for (const word of words) {
    const meaningId = `meaning:${word.id}`
    if (!done.has(meaningId)) {
      quests.push({
        id: meaningId,
        kind: 'meaning',
        wordId: word.id,
        title: 'Chọn nghĩa đúng',
        prompt: word.word,
        xp: 20,
        answer: word.meaning,
        options: pickOptions(word.meaning, meanings, FAKE_MEANINGS),
      })
    }

    const recallId = `recall:${word.id}`
    if (!done.has(recallId)) {
      quests.push({
        id: recallId,
        kind: 'recall',
        wordId: word.id,
        title: 'Chọn từ đúng',
        prompt: word.meaning,
        xp: 22,
        answer: word.word,
        options: pickOptions(word.word, terms, FAKE_WORDS),
      })
    }

    const typeId = `type:${word.id}`
    if (!done.has(typeId)) {
      quests.push({
        id: typeId,
        kind: 'type',
        wordId: word.id,
        title: 'Gõ từ tiếng Anh',
        prompt: word.meaning,
        xp: 28,
        answer: word.word,
        hint: word.phonetic,
      })
    }

    const blank = blankExample(word)
    const blankId = `blank:${word.id}`
    if (blank && !done.has(blankId)) {
      quests.push({
        id: blankId,
        kind: 'blank',
        wordId: word.id,
        title: 'Điền vào chỗ trống',
        prompt: blank,
        xp: 25,
        answer: word.word,
      })
    }
  }

  return quests.sort((a, b) => a.wordId.localeCompare(b.wordId) || a.kind.localeCompare(b.kind))
}

export function answersMatch(expected: string, given: string): boolean {
  return expected.trim().toLowerCase() === given.trim().toLowerCase()
}
