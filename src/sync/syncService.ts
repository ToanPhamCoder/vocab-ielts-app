import { supabase } from '../lib/supabase'
import {
  db,
  DEFAULT_SETTINGS,
  type ReviewLog,
  type UserSettings,
  type VocabWord,
  type WordState,
} from '../db/schema'

function requireClient() {
  if (!supabase) throw new Error('Supabase chưa được cấu hình')
  return supabase
}

async function requireUserId(): Promise<string> {
  const client = requireClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('Chưa đăng nhập')
  return data.user.id
}

function wordToRow(userId: string, w: VocabWord) {
  return {
    id: w.id,
    user_id: userId,
    word: w.word,
    meaning: w.meaning,
    example: w.example ?? null,
    phonetic: w.phonetic ?? null,
    part_of_speech: w.partOfSpeech ?? null,
    tags: w.tags,
    added_date: w.addedDate,
    due: new Date(w.due).toISOString(),
    stability: w.stability,
    difficulty: w.difficulty,
    elapsed_days: w.elapsedDays,
    scheduled_days: w.scheduledDays,
    learning_steps: w.learningSteps,
    reps: w.reps,
    lapses: w.lapses,
    state: w.state,
    last_review: w.lastReview ? new Date(w.lastReview).toISOString() : null,
    updated_at: new Date().toISOString(),
  }
}

function rowToWord(row: Record<string, unknown>): VocabWord {
  return {
    id: row.id as string,
    word: row.word as string,
    meaning: row.meaning as string,
    example: (row.example as string | null) ?? undefined,
    phonetic: (row.phonetic as string | null) ?? undefined,
    partOfSpeech: (row.part_of_speech as string | null) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    addedDate: row.added_date as string,
    due: new Date(row.due as string),
    stability: Number(row.stability),
    difficulty: Number(row.difficulty),
    elapsedDays: Number(row.elapsed_days),
    scheduledDays: Number(row.scheduled_days),
    learningSteps: Number(row.learning_steps ?? 0),
    reps: Number(row.reps),
    lapses: Number(row.lapses),
    state: row.state as WordState,
    lastReview: row.last_review ? new Date(row.last_review as string) : undefined,
  }
}

function settingsToRow(userId: string, s: UserSettings) {
  return {
    user_id: userId,
    exam_date: s.examDate,
    target_vocab_size: s.targetVocabSize,
    baseline_vocab_size: s.baselineVocabSize,
    notify_interval_minutes: s.notifyIntervalMinutes,
    daily_review_time: s.dailyReviewTime,
    last_daily_review_date: s.lastDailyReviewDate ?? null,
    onboarding_complete: s.onboardingComplete,
    streak: s.streak,
    last_streak_date: s.lastStreakDate ?? null,
    game_state: {
      xp: s.xp,
      dailyNewGoal: s.dailyNewGoal,
      dailyGoalDate: s.dailyGoalDate ?? null,
      dailyDueTarget: s.dailyDueTarget,
      dailyDueReviewed: s.dailyDueReviewed,
      dailyNewAdded: s.dailyNewAdded,
      dailyGoalComplete: s.dailyGoalComplete,
      clearDueStreak: s.clearDueStreak,
      lastClearDueDate: s.lastClearDueDate ?? null,
      consecutiveNonEasy: s.consecutiveNonEasy,
      unlockedAchievements: s.unlockedAchievements,
      completedQuestIds: s.completedQuestIds,
      lastLevel: s.lastLevel,
      lastPenaltyXp: s.lastPenaltyXp,
      lastPenaltyReason: s.lastPenaltyReason ?? null,
      lastPenaltyDate: s.lastPenaltyDate ?? null,
    },
    updated_at: new Date().toISOString(),
  }
}

function rowToSettings(row: Record<string, unknown>): UserSettings {
  const game = (row.game_state as Record<string, unknown> | null) ?? {}
  return {
    id: 'settings',
    examDate: row.exam_date as string,
    targetVocabSize: Number(row.target_vocab_size),
    baselineVocabSize: Number(row.baseline_vocab_size),
    notifyIntervalMinutes: Number(row.notify_interval_minutes),
    dailyReviewTime: row.daily_review_time as string,
    lastDailyReviewDate: (row.last_daily_review_date as string | null) ?? undefined,
    onboardingComplete: Boolean(row.onboarding_complete),
    streak: Number(row.streak),
    lastStreakDate: (row.last_streak_date as string | null) ?? undefined,
    xp: Number(game.xp ?? 0),
    dailyNewGoal: Number(game.dailyNewGoal ?? 15),
    dailyGoalDate: (game.dailyGoalDate as string | null) ?? undefined,
    dailyDueTarget: Number(game.dailyDueTarget ?? 0),
    dailyDueReviewed: Number(game.dailyDueReviewed ?? 0),
    dailyNewAdded: Number(game.dailyNewAdded ?? 0),
    dailyGoalComplete: Boolean(game.dailyGoalComplete),
    clearDueStreak: Number(game.clearDueStreak ?? 0),
    lastClearDueDate: (game.lastClearDueDate as string | null) ?? undefined,
    consecutiveNonEasy: Number(game.consecutiveNonEasy ?? 0),
    unlockedAchievements: Array.isArray(game.unlockedAchievements)
      ? (game.unlockedAchievements as string[])
      : [],
    completedQuestIds: Array.isArray(game.completedQuestIds)
      ? (game.completedQuestIds as string[])
      : [],
    lastLevel: Number(game.lastLevel ?? 1),
    lastPenaltyXp: Number(game.lastPenaltyXp ?? 0),
    lastPenaltyReason: (game.lastPenaltyReason as string | null) ?? undefined,
    lastPenaltyDate: (game.lastPenaltyDate as string | null) ?? undefined,
  }
}

export async function clearLocalData(): Promise<void> {
  await db.transaction('rw', db.words, db.reviewLogs, db.settings, async () => {
    await db.words.clear()
    await db.reviewLogs.clear()
    await db.settings.clear()
  })
}

export async function pullFromCloud(): Promise<void> {
  const client = requireClient()
  const userId = await requireUserId()

  const [settingsRes, wordsRes, logsRes] = await Promise.all([
    client.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
    client.from('words').select('*').eq('user_id', userId),
    client.from('review_logs').select('*').eq('user_id', userId),
  ])

  if (settingsRes.error) throw settingsRes.error
  if (wordsRes.error) throw wordsRes.error
  if (logsRes.error) throw logsRes.error

  const settings = settingsRes.data
    ? rowToSettings(settingsRes.data as Record<string, unknown>)
    : { ...DEFAULT_SETTINGS }

  const words = (wordsRes.data ?? []).map((r) => rowToWord(r as Record<string, unknown>))
  const logs: ReviewLog[] = (logsRes.data ?? []).map((r) => ({
    id: r.id as string,
    wordId: r.word_id as string,
    rating: r.rating as 1 | 2 | 3 | 4,
    reviewedAt: new Date(r.reviewed_at as string),
    responseTimeMs: Number(r.response_time_ms ?? 0),
  }))

  await db.transaction('rw', db.words, db.reviewLogs, db.settings, async () => {
    await db.words.clear()
    await db.reviewLogs.clear()
    await db.settings.clear()
    await db.settings.put(settings)
    if (words.length) await db.words.bulkPut(words)
    if (logs.length) await db.reviewLogs.bulkPut(logs)
  })
}

export async function pushAllToCloud(): Promise<void> {
  const client = requireClient()
  const userId = await requireUserId()

  const [settings, words, logs] = await Promise.all([
    db.settings.get('settings'),
    db.words.toArray(),
    db.reviewLogs.toArray(),
  ])

  const s = settings ?? DEFAULT_SETTINGS
  const { error: settingsError } = await client
    .from('user_settings')
    .upsert(settingsToRow(userId, s))
  if (settingsError) throw settingsError

  if (words.length) {
    const { error } = await client.from('words').upsert(words.map((w) => wordToRow(userId, w)))
    if (error) throw error
  }

  if (logs.length) {
    const { error } = await client.from('review_logs').upsert(
      logs.map((l) => ({
        id: l.id,
        user_id: userId,
        word_id: l.wordId,
        rating: l.rating,
        reviewed_at: new Date(l.reviewedAt).toISOString(),
        response_time_ms: l.responseTimeMs,
      })),
    )
    if (error) throw error
  }
}

export async function syncWord(word: VocabWord): Promise<void> {
  if (!supabase) return
  try {
    const userId = await requireUserId()
    const { error } = await supabase.from('words').upsert(wordToRow(userId, word))
    if (error) console.error('syncWord', error)
  } catch (e) {
    console.error('syncWord', e)
  }
}

export async function syncDeleteWord(wordId: string): Promise<void> {
  if (!supabase) return
  try {
    const userId = await requireUserId()
    await supabase.from('words').delete().eq('user_id', userId).eq('id', wordId)
    await supabase.from('review_logs').delete().eq('user_id', userId).eq('word_id', wordId)
  } catch (e) {
    console.error('syncDeleteWord', e)
  }
}

export async function syncSettings(settings: UserSettings): Promise<void> {
  if (!supabase) return
  try {
    const userId = await requireUserId()
    const { error } = await supabase.from('user_settings').upsert(settingsToRow(userId, settings))
    if (error) {
      const { game_state: _game, ...rest } = settingsToRow(userId, settings)
      void _game
      const retry = await supabase.from('user_settings').upsert(rest)
      if (retry.error) console.error('syncSettings', retry.error)
    }
  } catch (e) {
    console.error('syncSettings', e)
  }
}

export async function syncReviewLog(log: ReviewLog): Promise<void> {
  if (!supabase) return
  try {
    const userId = await requireUserId()
    const { error } = await supabase.from('review_logs').upsert({
      id: log.id,
      user_id: userId,
      word_id: log.wordId,
      rating: log.rating,
      reviewed_at: new Date(log.reviewedAt).toISOString(),
      response_time_ms: log.responseTimeMs,
    })
    if (error) console.error('syncReviewLog', error)
  } catch (e) {
    console.error('syncReviewLog', e)
  }
}

/** First login: if cloud empty but local has data, upload; else download. */
export async function syncOnLogin(): Promise<void> {
  if (!supabase) return
  const client = requireClient()
  const userId = await requireUserId()

  const { count, error } = await client
    .from('words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw error

  const localCount = await db.words.count()

  if ((count ?? 0) === 0 && localCount > 0) {
    await pushAllToCloud()
  } else {
    await pullFromCloud()
  }
}
