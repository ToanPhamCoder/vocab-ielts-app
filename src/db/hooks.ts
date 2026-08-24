import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuidv4 } from 'uuid'
import { createEmptyCard } from 'ts-fsrs'
import {
  db,
  DEFAULT_SETTINGS,
  isMastered,
  todayDateString,
  type ReviewLog,
  type ReviewRating,
  type UserSettings,
  type VocabWord,
} from './schema'
import { cardToWordFields, reviewWord } from '../srs/fsrsService'

export function useWords() {
  return useLiveQuery(() => db.words.orderBy('addedDate').reverse().toArray(), [])
}

export function useWord(id: string | undefined) {
  return useLiveQuery(() => (id ? db.words.get(id) : undefined), [id])
}

export function useSettings() {
  return useLiveQuery(async () => {
    const settings = await db.settings.get('settings')
    return settings ?? DEFAULT_SETTINGS
  }, [])
}

export function useReviewLogs(days = 30) {
  return useLiveQuery(async () => {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return db.reviewLogs.where('reviewedAt').above(since).toArray()
  }, [days])
}

export async function getSettings(): Promise<UserSettings> {
  const settings = await db.settings.get('settings')
  if (settings) return settings
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export async function saveSettings(partial: Partial<UserSettings>): Promise<void> {
  const current = await getSettings()
  await db.settings.put({ ...current, ...partial, id: 'settings' })
}

export async function addWord(data: {
  word: string
  meaning: string
  example?: string
  phonetic?: string
  partOfSpeech?: string
  tags?: string[]
}): Promise<VocabWord> {
  const card = createEmptyCard(new Date())
  const fields = cardToWordFields(card)

  const vocabWord: VocabWord = {
    id: uuidv4(),
    word: data.word.trim(),
    meaning: data.meaning.trim(),
    example: data.example?.trim() || undefined,
    phonetic: data.phonetic?.trim() || undefined,
    partOfSpeech: data.partOfSpeech?.trim() || undefined,
    tags: data.tags ?? [],
    addedDate: todayDateString(),
    ...fields,
    state: 'New',
  }

  await db.words.add(vocabWord)
  return vocabWord
}

export async function deleteWord(id: string): Promise<void> {
  await db.words.delete(id)
  await db.reviewLogs.where('wordId').equals(id).delete()
}

export async function submitReview(
  word: VocabWord,
  rating: ReviewRating,
  responseTimeMs: number,
): Promise<VocabWord> {
  const updated = reviewWord(word, rating)
  await db.words.put(updated)

  const log: ReviewLog = {
    id: uuidv4(),
    wordId: word.id,
    rating,
    reviewedAt: new Date(),
    responseTimeMs,
  }
  await db.reviewLogs.add(log)

  return updated
}

export async function getDueWords(now = new Date()): Promise<VocabWord[]> {
  const all = await db.words.toArray()
  return all.filter((w) => w.due <= now || w.state === 'New')
}

export async function buildReviewQueue(now = new Date()): Promise<VocabWord[]> {
  const all = await db.words.toArray()
  const today = todayDateString()

  const overdue: VocabWord[] = []
  const dueToday: VocabWord[] = []
  const learning: VocabWord[] = []
  const newWords: VocabWord[] = []

  for (const word of all) {
    if (word.state === 'New') {
      newWords.push(word)
      continue
    }
    if (word.due <= now) {
      if (word.due.toLocaleDateString('en-CA') < today) {
        overdue.push(word)
      } else {
        dueToday.push(word)
      }
      continue
    }
    if (word.state === 'Learning' || word.state === 'Relearning') {
      learning.push(word)
    }
  }

  const sortByDue = (a: VocabWord, b: VocabWord) => a.due.getTime() - b.due.getTime()

  return [
    ...overdue.sort(sortByDue),
    ...dueToday.sort(sortByDue),
    ...learning.sort(sortByDue),
    ...newWords.sort((a, b) => b.addedDate.localeCompare(a.addedDate)),
  ]
}

export async function countDueWords(now = new Date()): Promise<number> {
  const queue = await buildReviewQueue(now)
  return queue.length
}

export async function getWordsGroupedByDate(): Promise<Map<string, VocabWord[]>> {
  const words = await db.words.orderBy('addedDate').reverse().toArray()
  const groups = new Map<string, VocabWord[]>()

  for (const word of words) {
    const list = groups.get(word.addedDate) ?? []
    list.push(word)
    groups.set(word.addedDate, list)
  }

  return groups
}

export async function getAllWords(): Promise<VocabWord[]> {
  return db.words.toArray()
}

export async function updateStreak(): Promise<number> {
  const settings = await getSettings()
  const today = todayDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString('en-CA')

  let streak = settings.streak
  if (settings.lastStreakDate === today) {
    return streak
  }
  if (settings.lastStreakDate === yesterdayStr) {
    streak += 1
  } else {
    streak = 1
  }

  await saveSettings({ streak, lastStreakDate: today, lastDailyReviewDate: today })
  return streak
}

export function useStats() {
  const words = useWords()
  const logs = useReviewLogs(7)
  const settings = useSettings()

  if (!words || !logs || !settings) return null

  const now = new Date()
  const mastered = words.filter(isMastered)
  const learning = words.filter(
    (w) => !isMastered(w) && (w.state === 'Learning' || w.state === 'Relearning'),
  )
  const newWords = words.filter((w) => w.state === 'New')
  const overdue = words.filter((w) => !isMastered(w) && w.due <= now && w.state !== 'New')
  const review = words.filter((w) => w.state === 'Review' && !isMastered(w))

  const goodEasy = logs.filter((l) => l.rating >= 3).length
  const retentionRate = logs.length > 0 ? (goodEasy / logs.length) * 100 : 0

  const totalKnown = settings.baselineVocabSize + mastered.length
  const readinessScore = Math.min(
    100,
    Math.round((totalKnown / settings.targetVocabSize) * 70 + retentionRate * 0.3),
  )

  const examDate = new Date(settings.examDate)
  const monthsRemaining = Math.max(
    1,
    (examDate.getFullYear() - now.getFullYear()) * 12 +
      (examDate.getMonth() - now.getMonth()) +
      (examDate.getDate() >= now.getDate() ? 0 : -1) +
      1,
  )

  const wordsNeeded = Math.max(0, settings.targetVocabSize - settings.baselineVocabSize)
  const monthlyTarget = Math.ceil(wordsNeeded / monthsRemaining)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const masteredThisMonth = mastered.filter(
    (w) => w.lastReview && new Date(w.lastReview) >= monthStart,
  ).length

  const addedByDate = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    addedByDate.set(d.toLocaleDateString('en-CA'), 0)
  }
  for (const w of words) {
    if (addedByDate.has(w.addedDate)) {
      addedByDate.set(w.addedDate, (addedByDate.get(w.addedDate) ?? 0) + 1)
    }
  }

  return {
    total: words.length,
    mastered: mastered.length,
    learning: learning.length,
    newWords: newWords.length,
    overdue: overdue.length,
    review: review.length,
    retentionRate,
    readinessScore,
    totalKnown,
    wordsNeeded: Math.max(0, settings.targetVocabSize - totalKnown),
    monthlyTarget,
    masteredThisMonth,
    streak: settings.streak,
    targetVocabSize: settings.targetVocabSize,
    addedTrend: Array.from(addedByDate.entries()).map(([date, count]) => ({
      date: date.slice(5),
      count,
    })),
    statusDistribution: [
      { name: 'Đã thuộc', value: mastered.length, color: '#22c55e' },
      { name: 'Đang học', value: learning.length + review.length, color: '#3b82f6' },
      { name: 'Mới', value: newWords.length, color: '#a855f7' },
      { name: 'Quá hạn', value: overdue.length, color: '#ef4444' },
    ].filter((d) => d.value > 0),
  }
}
