import type { UserSettings, VocabWord } from '../db/schema'
import { isMastered } from '../db/schema'
import type { ReviewLog } from '../db/schema'

export interface StatsInput {
  words: VocabWord[]
  logs: ReviewLog[]
  settings: UserSettings
}

export function calculateReadinessScore(
  masteredCount: number,
  baseline: number,
  target: number,
  retentionRate: number,
): number {
  const totalKnown = baseline + masteredCount
  return Math.min(100, Math.round((totalKnown / target) * 70 + retentionRate * 0.3))
}

export function calculateRetentionRate(logs: ReviewLog[]): number {
  if (logs.length === 0) return 0
  const goodEasy = logs.filter((l) => l.rating >= 3).length
  return (goodEasy / logs.length) * 100
}

export function calculateMonthlyTarget(settings: UserSettings, now = new Date()): number {
  const examDate = new Date(settings.examDate)
  const monthsRemaining = Math.max(
    1,
    (examDate.getFullYear() - now.getFullYear()) * 12 +
      (examDate.getMonth() - now.getMonth()) +
      (examDate.getDate() >= now.getDate() ? 0 : -1) +
      1,
  )
  const wordsNeeded = Math.max(0, settings.targetVocabSize - settings.baselineVocabSize)
  return Math.ceil(wordsNeeded / monthsRemaining)
}

export function isAggressiveTarget(dailyWords: number): boolean {
  return dailyWords > 50
}

export function countMastered(words: VocabWord[]): number {
  return words.filter(isMastered).length
}

export function formatDateLabel(dateStr: string): string {
  const today = new Date().toLocaleDateString('en-CA')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString('en-CA')

  if (dateStr === today) return 'H?m nay'
  if (dateStr === yesterdayStr) return 'H?m qua'

  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}
