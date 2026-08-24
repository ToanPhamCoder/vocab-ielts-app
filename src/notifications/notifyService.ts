import { countDueWords, getSettings } from '../db/hooks'

let intervalId: ReturnType<typeof setInterval> | null = null
let lastNotifiedAt = 0

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

export async function showReviewNotification(count: number): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const title = count === 1 ? '1 từ cần ôn tập' : `${count} từ cần ôn tập`
  const body = 'Mở app để bắt đầu phiên ôn tập FSRS'

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, {
      body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: 'vocab-review',
      data: { url: '/review' },
    })
  } else {
    new Notification(title, { body, icon: '/icons/icon.svg' })
  }

  lastNotifiedAt = Date.now()
}

export async function checkAndNotify(): Promise<number> {
  const count = await countDueWords()
  if (count > 0 && Notification.permission === 'granted') {
    const settings = await getSettings()
    const minGap = settings.notifyIntervalMinutes * 60 * 1000
    if (Date.now() - lastNotifiedAt >= minGap) {
      await showReviewNotification(count)
    }
  }
  return count
}

export function startNotificationPolling(): void {
  stopNotificationPolling()

  void checkAndNotify()

  getSettings().then((settings) => {
    const ms = settings.notifyIntervalMinutes * 60 * 1000
    intervalId = setInterval(() => {
      void checkAndNotify()
    }, ms)
  })
}

export function stopNotificationPolling(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export function registerNotificationClickHandler(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        window.location.href = event.data.url ?? '/review'
      }
    })
  }
}

export async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    } catch {
      // vite-plugin-pwa handles registration via virtual module
    }
  }
}
