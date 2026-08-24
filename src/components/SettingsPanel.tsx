import { useEffect, useState } from 'react'
import { getSettings, saveSettings } from '../db/hooks'
import type { UserSettings } from '../db/schema'
import { requestNotificationPermission } from '../notifications/notifyService'
import { isAggressiveTarget, calculateMonthlyTarget } from '../stats/calculateStats'

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void getSettings().then(setSettings)
  }, [])

  if (!settings) return <div className="text-slate-400">Đang tải...</div>

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    await saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleEnableNotifications() {
    await requestNotificationPermission()
  }

  const monthlyTarget = calculateMonthlyTarget(settings)
  const dailyWords = Math.ceil(monthlyTarget / 30)
  const aggressive = isAggressiveTarget(dailyWords)

  const inputClass =
    'w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none'

  return (
    <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
      <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Mục tiêu IELTS</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Ngày thi IELTS</label>
            <input
              type="date"
              className={inputClass}
              value={settings.examDate}
              onChange={(e) => setSettings({ ...settings, examDate: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Số từ đã biết (baseline word families)
            </label>
            <input
              type="number"
              min={0}
              max={15000}
              className={inputClass}
              value={settings.baselineVocabSize}
              onChange={(e) =>
                setSettings({ ...settings, baselineVocabSize: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Mục tiêu tổng (word families)</label>
            <input
              type="number"
              min={1000}
              max={20000}
              className={inputClass}
              value={settings.targetVocabSize}
              onChange={(e) =>
                setSettings({ ...settings, targetVocabSize: Number(e.target.value) })
              }
            />
          </div>
          <div className="rounded-lg bg-slate-900/60 p-4 text-sm">
            <p className="text-slate-300">
              Mục tiêu tháng: <strong className="text-white">{monthlyTarget}</strong> từ (~
              {dailyWords}/ngày)
            </p>
            {aggressive && (
              <p className="mt-2 text-amber-400">
                Mục tiêu khá cao! Hãy tăng thời gian học hoặc kéo dài lịch thi.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Nhắc ôn tập</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Nhắc mỗi (phút) khi có từ due
            </label>
            <input
              type="number"
              min={5}
              max={240}
              className={inputClass}
              value={settings.notifyIntervalMinutes}
              onChange={(e) =>
                setSettings({ ...settings, notifyIntervalMinutes: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Giờ ôn đầu ngày</label>
            <input
              type="time"
              className={inputClass}
              value={settings.dailyReviewTime}
              onChange={(e) => setSettings({ ...settings, dailyReviewTime: e.target.value })}
            />
          </div>
          <button
            type="button"
            onClick={() => void handleEnableNotifications()}
            className="rounded-lg border border-blue-500/50 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/10"
          >
            Bật thông báo trình duyệt
          </button>
        </div>
      </section>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500"
      >
        {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
      </button>
    </form>
  )
}
