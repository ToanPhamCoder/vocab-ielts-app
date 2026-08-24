import {
  fsrs,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs'
import type { ReviewRating, VocabWord, WordState } from '../db/schema'

const scheduler = fsrs()

const stateMap: Record<WordState, State> = {
  New: State.New,
  Learning: State.Learning,
  Review: State.Review,
  Relearning: State.Relearning,
}

const reverseStateMap: Record<State, WordState> = {
  [State.New]: 'New',
  [State.Learning]: 'Learning',
  [State.Review]: 'Review',
  [State.Relearning]: 'Relearning',
}

export function wordToCard(word: VocabWord): Card {
  return {
    due: new Date(word.due),
    stability: word.stability,
    difficulty: word.difficulty,
    elapsed_days: word.elapsedDays,
    scheduled_days: word.scheduledDays,
    learning_steps: word.learningSteps,
    reps: word.reps,
    lapses: word.lapses,
    state: stateMap[word.state],
    last_review: word.lastReview ? new Date(word.lastReview) : undefined,
  }
}

export function cardToWordFields(card: Card): Pick<
  VocabWord,
  | 'due'
  | 'stability'
  | 'difficulty'
  | 'elapsedDays'
  | 'scheduledDays'
  | 'learningSteps'
  | 'reps'
  | 'lapses'
  | 'state'
  | 'lastReview'
> {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: reverseStateMap[card.state],
    lastReview: card.last_review ? new Date(card.last_review) : undefined,
  }
}

export function reviewWord(word: VocabWord, rating: ReviewRating, now = new Date()): VocabWord {
  const card = wordToCard(word)
  const grade = rating as Grade
  const result = scheduler.next(card, now, grade)
  const updated = cardToWordFields(result.card)

  return {
    ...word,
    ...updated,
  }
}

export function ratingLabel(rating: ReviewRating): string {
  const labels: Record<ReviewRating, string> = {
    1: 'Again',
    2: 'Hard',
    3: 'Good',
    4: 'Easy',
  }
  return labels[rating]
}
