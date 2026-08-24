import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildReviewQueue, getSettings } from '../db/hooks'
import { todayDateString } from '../db/schema'
import { db } from '../db/schema'

interface DailyReviewModalProps {
  onDismiss: () => void
}

export function DailyReviewModal({ onDismiss }: DailyReviewModalProps) {
  const [dueCount, setDueCount] = useState(0)
  const [yesterdayNew, setYesterdayNew] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    async function check() {
      const settings = await getSettings()
      const today = todayDateString()
      if (settings.lastDailyReviewDate === today) return

      const queue = await buildReviewQueue()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toLocaleDateString('en-CA')
      const newFromYesterday = await db.words.where('addedDate').equals(yesterdayStr).count()

      if (queue.length > 0 || newFromYesterday > 0) {
        setDueCount(queue.length)
        setYesterdayNew(newFromYesterday)
        setVisible(true)
      }
    }
    void check()
  }, [])

  if (!visible) return null

  function handleDismiss() {
    setVisible(false)
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-500/30 bg-slate-900 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Bu?i ?n ??u ng?y</h2>
        <p className="mt-2 text-slate-300">Ch?o bu?i s?ng! ??y l? t? v?ng c?n ?n h?m nay.</p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4">
            <span className="text-slate-300">T? c?n ?n</span>
            <span className="text-2xl font-bold text-blue-400">{dueCount}</span>
          </div>
          {yesterdayNew > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4">
              <span className="text-slate-300">T? m?i th?m h?m qua</span>
              <span className="text-2xl font-bold text-purple-400">{yesterdayNew}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            to="/review"
            onClick={handleDismiss}
            className="flex-1 rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-500"
          >
            B?t ??u ?n t?p
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg border border-slate-600 px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            ?? sau
          </button>
        </div>
      </div>
    </div>
  )
}
