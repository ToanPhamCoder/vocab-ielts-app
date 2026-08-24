import { useState } from 'react'
import { saveSettings } from '../db/hooks'
import { DEFAULT_SETTINGS } from '../db/schema'
import { calculateMonthlyTarget, isAggressiveTarget } from '../stats/calculateStats'

interface OnboardingModalProps {
  onComplete: () => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [baseline, setBaseline] = useState(3000)
  const [examDate, setExamDate] = useState(DEFAULT_SETTINGS.examDate)

  async function handleStart() {
    await saveSettings({
      baselineVocabSize: baseline,
      examDate,
      onboardingComplete: true,
    })
    onComplete()
  }

  const settings = { ...DEFAULT_SETTINGS, baselineVocabSize: baseline, examDate }
  const monthlyTarget = calculateMonthlyTarget(settings)
  const dailyWords = Math.ceil(monthlyTarget / 30)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-blue-500/30 bg-slate-900 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Chào mừng đến Vocab IELTS</h1>
        <p className="mt-2 text-slate-300">
          Học từ vựng với thuật toán FSRS — spaced repetition hiệu quả nhất, hướng tới IELTS 9.0
          Reading.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Bạn ước tính đã biết bao nhiêu word families?
            </label>
            <input
              type="range"
              min={0}
              max={8000}
              step={500}
              value={baseline}
              onChange={(e) => setBaseline(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-center text-lg font-semibold text-blue-400">
              ~{baseline.toLocaleString()} từ
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Ngày thi IELTS dự kiến</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
            <p>
              Mục tiêu: <strong className="text-white">9,000 word families</strong> (98% lexical
              coverage cho IELTS Academic Reading)
            </p>
            <p className="mt-2">
              Cần học thêm:{' '}
              <strong className="text-amber-400">
                {Math.max(0, 9000 - baseline).toLocaleString()}
              </strong>{' '}
              từ → ~{monthlyTarget}/tháng (~{dailyWords}/ngày)
            </p>
            {isAggressiveTarget(dailyWords) && (
              <p className="mt-2 text-red-400">Mục tiêu khá tham vọng — hãy kiên trì!</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleStart()}
          className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500"
        >
          Bắt đầu học
        </button>
      </div>
    </div>
  )
}
