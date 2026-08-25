import {
  db,
  isMastered,
  todayDateString,
  yesterdayDateString,
  type ReviewRating,
  type UserSettings,
} from '../db/schema'
import { CLEAR_DUE_BONUS, DAILY_GOAL_BONUS, XP_BY_RATING, formForXp } from './saiyan'

let gameLock: Promise<void> = Promise.resolve()

function withGameLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = gameLock.then(fn, fn)
  gameLock = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export async function countWordsAddedOn(date: string): Promise<number> {
  return db.words.where('addedDate').equals(date).count()
}

export interface GameTick {
  xpGained: number
  bonusXp: number
  leveledUp: boolean
  newLevel: number
  formName: string
  dailyComplete: boolean
  newAchievements: string[]
}

async function dueCountNow(): Promise<number> {
  const all = await db.words.toArray()
  return all.filter((w) => w.due <= new Date()).length
}

async function refundWrongNewWordPenalty(settings: UserSettings): Promise<UserSettings> {
  const today = todayDateString()
  if (settings.dailyGoalDate !== today) return settings
  if (!settings.lastPenaltyXp || settings.lastPenaltyDate !== today) return settings
  if (!settings.lastPenaltyReason?.includes('từ mới')) return settings

  const yesterday = yesterdayDateString()
  const added = await countWordsAddedOn(yesterday)
  const needed = Math.max(1, settings.dailyNewGoal || 15)
  if (added < needed) return settings

  const xp = settings.xp + settings.lastPenaltyXp
  const onlyNewWords = !settings.lastPenaltyReason.includes('due')
  if (!onlyNewWords) return settings

  return {
    ...settings,
    xp,
    lastLevel: formForXp(xp).level,
    lastPenaltyXp: 0,
    lastPenaltyReason: undefined,
    streak: settings.lastStreakDate === today ? settings.streak : Math.max(1, settings.streak),
    lastStreakDate: settings.lastStreakDate === today ? settings.lastStreakDate : yesterday,
  }
}

export async function ensureDaily(settings: UserSettings): Promise<UserSettings> {
  const today = todayDateString()
  if (settings.dailyGoalDate === today) return refundWrongNewWordPenalty(settings)

  const dueTarget = await dueCountNow()
  let next: UserSettings = { ...settings }

  if (settings.dailyGoalDate) {
    const added = await countWordsAddedOn(settings.dailyGoalDate)
    const { xpLost, reasons } = calcDailyPenalty({ ...settings, dailyNewAdded: added })
    if (xpLost > 0) {
      const xp = Math.max(0, settings.xp - xpLost)
      next = {
        ...next,
        xp,
        streak: 0,
        lastLevel: formForXp(xp).level,
        lastPenaltyXp: xpLost,
        lastPenaltyReason: reasons.join(' · '),
        lastPenaltyDate: today,
      }
    } else {
      next = {
        ...next,
        lastPenaltyXp: 0,
        lastPenaltyReason: undefined,
        lastPenaltyDate: today,
      }
    }
  }

  return {
    ...next,
    dailyGoalDate: today,
    dailyDueTarget: dueTarget,
    dailyDueReviewed: 0,
    dailyNewAdded: 0,
    dailyGoalComplete: false,
  }
}

export function calcDailyPenalty(settings: UserSettings): { xpLost: number; reasons: string[] } {
  const needed = Math.max(1, settings.dailyNewGoal || 15)
  const added = settings.dailyNewAdded ?? 0
  const dueTarget = settings.dailyDueTarget ?? 0
  const dueReviewed = settings.dailyDueReviewed ?? 0
  const xp = Math.max(0, settings.xp ?? 0)
  const reasons: string[] = []
  let penalty = 0

  if (added < needed) {
    const missing = needed - added
    penalty += Math.round(xp * 0.4) + missing * 80
    reasons.push(`Thiếu ${missing}/${needed} từ mới`)
  }
  if (dueTarget > 0 && dueReviewed < dueTarget) {
    const missingDue = dueTarget - dueReviewed
    penalty += Math.round(xp * 0.25) + missingDue * 40
    reasons.push(`Bỏ ${missingDue} từ due`)
  }

  if (penalty <= 0) return { xpLost: 0, reasons: [] }
  const xpLost = Math.min(penalty, Math.max(0, Math.round(xp * 0.75)))
  return { xpLost, reasons }
}

function unlock(settings: UserSettings, id: string, extra: string[]): UserSettings {
  if (settings.unlockedAchievements.includes(id)) return settings
  extra.push(id)
  return { ...settings, unlockedAchievements: [...settings.unlockedAchievements, id] }
}

export async function evaluateAchievements(settings: UserSettings, extra: string[]): Promise<UserSettings> {
  let next = settings
  const form = formForXp(next.xp)
  const words = await db.words.toArray()
  const mastered = words.filter(isMastered).length

  if (next.dailyDueReviewed >= 1) next = unlock(next, 'first-ki', extra)
  if (next.dailyGoalComplete) next = unlock(next, 'warmup', extra)
  if (next.streak >= 7) next = unlock(next, 'z-warrior', extra)
  if (form.level >= 5) next = unlock(next, 'super-saiyan', extra)
  if (next.clearDueStreak >= 7) next = unlock(next, 'gravity', extra)
  if (next.consecutiveNonEasy >= 20) next = unlock(next, 'honest', extra)
  if (mastered >= 50) next = unlock(next, 'namek', extra)
  if (next.streak >= 30) next = unlock(next, 'cell', extra)
  if (form.level >= 12) next = unlock(next, 'ultra', extra)
  return next
}

export function isDailyComplete(s: UserSettings): boolean {
  const dueOk = s.dailyDueTarget === 0 || s.dailyDueReviewed >= s.dailyDueTarget
  const newOk = s.dailyNewAdded >= s.dailyNewGoal
  return dueOk && newOk
}

export async function applyReviewXp(rating: ReviewRating, wasDue: boolean): Promise<GameTick> {
  return withGameLock(async () => {
  const { getSettings, saveSettings } = await import('../db/hooks')
  let settings = await ensureDaily(await getSettings())
  const beforeLevel = formForXp(settings.xp).level
  let xpGained = wasDue ? XP_BY_RATING[rating] : 0
  let bonusXp = 0
  const newAchievements: string[] = []

  if (wasDue) {
    settings = { ...settings, dailyDueReviewed: settings.dailyDueReviewed + 1 }
  }
  settings = {
    ...settings,
    consecutiveNonEasy: rating === 4 ? 0 : settings.consecutiveNonEasy + 1,
  }

  const remainingDue = await dueCountNow()
  if (remainingDue === 0 && wasDue) {
    const today = todayDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toLocaleDateString('en-CA')
    const clearStreak = settings.lastClearDueDate === yStr ? settings.clearDueStreak + 1 : 1
    settings = { ...settings, clearDueStreak: clearStreak, lastClearDueDate: today }
    bonusXp += CLEAR_DUE_BONUS
  }

  const alreadyComplete = settings.dailyGoalComplete
  settings = { ...settings, xp: settings.xp + xpGained + bonusXp }
  settings = { ...settings, dailyGoalComplete: isDailyComplete(settings) }

  if (!alreadyComplete && settings.dailyGoalComplete) {
    bonusXp += DAILY_GOAL_BONUS
    settings = { ...settings, xp: settings.xp + DAILY_GOAL_BONUS }
    const today = todayDateString()
    if (settings.lastStreakDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toLocaleDateString('en-CA')
      const streak = settings.lastStreakDate === yStr ? settings.streak + 1 : 1
      settings = { ...settings, streak, lastStreakDate: today, lastDailyReviewDate: today }
    }
  }

  settings = await evaluateAchievements(settings, newAchievements)
  const after = formForXp(settings.xp)
  const leveledUp = after.level > beforeLevel
  settings = { ...settings, lastLevel: after.level }
  await saveSettings(settings)

  return {
    xpGained: xpGained + bonusXp,
    bonusXp,
    leveledUp,
    newLevel: after.level,
    formName: after.name,
    dailyComplete: settings.dailyGoalComplete,
    newAchievements,
  }
  })
}

export async function applyNewWordXp(): Promise<void> {
  return withGameLock(async () => {
    const { getSettings, saveSettings } = await import('../db/hooks')
    let settings = await ensureDaily(await getSettings())
    const alreadyComplete = settings.dailyGoalComplete
    const added = await countWordsAddedOn(todayDateString())
    settings = { ...settings, dailyNewAdded: added }
    settings = { ...settings, dailyGoalComplete: isDailyComplete(settings) }
    if (!alreadyComplete && settings.dailyGoalComplete) {
      settings = { ...settings, xp: settings.xp + DAILY_GOAL_BONUS }
      const today = todayDateString()
      if (settings.lastStreakDate !== today) {
        const yStr = yesterdayDateString()
        const streak = settings.lastStreakDate === yStr ? settings.streak + 1 : 1
        settings = { ...settings, streak, lastStreakDate: today, lastDailyReviewDate: today }
      }
    }
    const extra: string[] = []
    settings = await evaluateAchievements(settings, extra)
    await saveSettings(settings)
  })
}

export async function applyQuestXp(questId: string, xp: number): Promise<GameTick | null> {
  return withGameLock(async () => {
  const { getSettings, saveSettings } = await import('../db/hooks')
  let settings = await ensureDaily(await getSettings())
  if (settings.completedQuestIds.includes(questId)) return null

  const beforeLevel = formForXp(settings.xp).level
  const newAchievements: string[] = []
  settings = {
    ...settings,
    xp: settings.xp + xp,
    completedQuestIds: [...settings.completedQuestIds, questId],
  }
  settings = await evaluateAchievements(settings, newAchievements)
  const after = formForXp(settings.xp)
  settings = { ...settings, lastLevel: after.level }
  await saveSettings(settings)

  return {
    xpGained: xp,
    bonusXp: 0,
    leveledUp: after.level > beforeLevel,
    newLevel: after.level,
    formName: after.name,
    dailyComplete: settings.dailyGoalComplete,
    newAchievements,
  }
  })
}

export async function persistDailyRollover(): Promise<void> {
  return withGameLock(async () => {
    const { getSettings, saveSettings } = await import('../db/hooks')
    const settings = await getSettings()
    const next = await ensureDaily(settings)
    if (
      next.dailyGoalDate !== settings.dailyGoalDate ||
      next.xp !== settings.xp ||
      next.lastPenaltyXp !== settings.lastPenaltyXp ||
      next.streak !== settings.streak ||
      next.lastPenaltyReason !== settings.lastPenaltyReason
    ) {
      await saveSettings(next)
    }
  })
}
