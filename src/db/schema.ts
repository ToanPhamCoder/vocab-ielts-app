import Dexie, { type EntityTable } from 'dexie'

export type WordState = 'New' | 'Learning' | 'Review' | 'Relearning'
export type ReviewRating = 1 | 2 | 3 | 4

export interface VocabWord {
  id: string
  word: string
  meaning: string
  example?: string
  phonetic?: string
  partOfSpeech?: string
  tags: string[]
  addedDate: string
  due: Date
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  reps: number
  lapses: number
  state: WordState
  lastReview?: Date
}

export interface ReviewLog {
  id: string
  wordId: string
  rating: ReviewRating
  reviewedAt: Date
  responseTimeMs: number
}

export interface UserSettings {
  id: 'settings'
  examDate: string
  targetVocabSize: number
  baselineVocabSize: number
  notifyIntervalMinutes: number
  dailyReviewTime: string
  lastDailyReviewDate?: string
  onboardingComplete: boolean
  streak: number
  lastStreakDate?: string
  xp: number
  dailyNewGoal: number
  dailyGoalDate?: string
  dailyDueTarget: number
  dailyDueReviewed: number
  dailyNewAdded: number
  dailyGoalComplete: boolean
  clearDueStreak: number
  lastClearDueDate?: string
  consecutiveNonEasy: number
  unlockedAchievements: string[]
  completedQuestIds: string[]
  lastLevel: number
  lastPenaltyXp: number
  lastPenaltyReason?: string
  lastPenaltyDate?: string
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'settings',
  examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  targetVocabSize: 9000,
  baselineVocabSize: 0,
  notifyIntervalMinutes: 30,
  dailyReviewTime: '08:00',
  onboardingComplete: false,
  streak: 0,
  xp: 0,
  dailyNewGoal: 15,
  dailyDueTarget: 0,
  dailyDueReviewed: 0,
  dailyNewAdded: 0,
  dailyGoalComplete: false,
  clearDueStreak: 0,
  consecutiveNonEasy: 0,
  unlockedAchievements: [],
  completedQuestIds: [],
  lastLevel: 1,
  lastPenaltyXp: 0,
}

export class VocabDatabase extends Dexie {
  words!: EntityTable<VocabWord, 'id'>
  reviewLogs!: EntityTable<ReviewLog, 'id'>
  settings!: EntityTable<UserSettings, 'id'>

  constructor() {
    super('VocabIELTS')
    this.version(1).stores({
      words: 'id, word, addedDate, due, state, *tags',
      reviewLogs: 'id, wordId, reviewedAt',
      settings: 'id',
    })
  }
}

export const db = new VocabDatabase()

export function todayDateString(): string {
  return new Date().toLocaleDateString('en-CA')
}

export function yesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA')
}

export function isMastered(word: VocabWord): boolean {
  return word.state === 'Review' && word.scheduledDays >= 21 && word.stability >= 5
}

export function getDisplayState(word: VocabWord, now = new Date()): string {
  if (isMastered(word)) return 'Mastered'
  if (word.due < now && word.state !== 'New') return 'Overdue'
  return word.state
}
