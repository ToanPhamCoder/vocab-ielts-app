import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { Layout } from './components/Layout'
import { DailyReviewModal } from './components/DailyReviewModal'
import { OnboardingModal } from './components/OnboardingModal'
import { Home } from './pages/Home'
import { AddWord } from './pages/AddWord'
import { Words } from './pages/Words'
import { Review } from './pages/Review'
import { Settings } from './pages/Settings'
import { Dojo } from './pages/Dojo'
import { Quests } from './pages/Quests'
import { getSettings } from './db/hooks'
import {
  registerNotificationClickHandler,
  requestNotificationPermission,
  startNotificationPolling,
  stopNotificationPolling,
} from './notifications/notifyService'
import { registerSW } from 'virtual:pwa-register'

function AppInner() {
  const { user, loading, syncing, configured } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    registerSW({ immediate: true })
    registerNotificationClickHandler()
  }, [])

  useEffect(() => {
    if (loading || syncing) return
    if (configured && !user) {
      setReady(true)
      return
    }

    void getSettings().then((s) => {
      setShowOnboarding(!s.onboardingComplete)
      setReady(true)
    })

    void requestNotificationPermission()
    startNotificationPolling()
    return () => stopNotificationPolling()
  }, [user, loading, syncing, configured])

  if (loading || (user && syncing && !ready)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        {syncing ? 'Đang đồng bộ dữ liệu...' : 'Đang khởi động...'}
      </div>
    )
  }

  if (configured && !user) {
    return <AuthScreen />
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Đang tải...
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
          <Route path="/dojo" element={<Dojo />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App
