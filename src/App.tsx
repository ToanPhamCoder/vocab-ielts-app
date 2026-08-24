import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DailyReviewModal } from './components/DailyReviewModal'
import { OnboardingModal } from './components/OnboardingModal'
import { Home } from './pages/Home'
import { AddWord } from './pages/AddWord'
import { Words } from './pages/Words'
import { Review } from './pages/Review'
import { Settings } from './pages/Settings'
import { getSettings } from './db/hooks'
import {
  registerNotificationClickHandler,
  requestNotificationPermission,
  startNotificationPolling,
  stopNotificationPolling,
} from './notifications/notifyService'
import { registerSW } from 'virtual:pwa-register'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    registerSW({ immediate: true })
    registerNotificationClickHandler()

    void getSettings().then((s) => {
      setShowOnboarding(!s.onboardingComplete)
      setReady(true)
    })

    void requestNotificationPermission()
    startNotificationPolling()

    return () => stopNotificationPolling()
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Đang khởi động...
      </div>
    )
  }

  return (
    <BrowserRouter>
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
      {!showOnboarding && <DailyReviewModal onDismiss={() => {}} />}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddWord />} />
          <Route path="/words" element={<Words />} />
          <Route path="/review" element={<Review />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
