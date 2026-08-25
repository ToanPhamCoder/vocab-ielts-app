import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function isActivePath(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

function IconHome({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} aria-hidden>
      <path strokeLinejoin="round" d="M4 10.5 12 3.5l8 7V20a1 1 0 0 1-1 1h-5.5v-6.5h-3V21H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  )
}

function IconBook({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} aria-hidden>
      <path strokeLinejoin="round" d="M5 4.5h9.5A2.5 2.5 0 0 1 17 7v13.5H7.5A2.5 2.5 0 0 0 5 23V4.5Z" />
      <path strokeLinejoin="round" d="M17 7h1.5A2.5 2.5 0 0 1 21 9.5V20.5H17" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconReview({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={filled ? 2.2 : 1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0 1 13.5-5.8M20 8V4h-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 0 1-13.5 5.8M4 16v4h4" />
    </svg>
  )
}

function IconMore({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={filled ? 'currentColor' : 'currentColor'} aria-hidden>
      <circle cx="5" cy="12" r={filled ? 2.1 : 1.7} />
      <circle cx="12" cy="12" r={filled ? 2.1 : 1.7} />
      <circle cx="19" cy="12" r={filled ? 2.1 : 1.7} />
    </svg>
  )
}

function IconQuest() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinejoin="round" d="M12 3 14.4 8.3 20 9.2 16 13.3 17 19 12 16.2 7 19 8 13.3 4 9.2 9.6 8.3 12 3Z" />
    </svg>
  )
}

function IconDojo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.2 7-10.2V5l-7-2-7 2v5.8C5 16.8 12 21 12 21Z" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinejoin="round" d="M19.4 13.5a7.6 7.6 0 0 0 .1-3l2-1.2-2-3.4-2.3.6a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.6 2.5a7.7 7.7 0 0 0-2.6 1.5l-2.3-.6-2 3.4 2 1.2a7.6 7.6 0 0 0 .1 3l-2 1.2 2 3.4 2.3-.6a7.7 7.7 0 0 0 2.6 1.5l.6 2.5h4l.6-2.5a7.7 7.7 0 0 0 2.6-1.5l2.3.6 2-3.4-2-1.2Z" />
    </svg>
  )
}

const moreItems = [
  { to: '/quests', label: 'Nhiệm vụ', hint: 'Bài tập cày XP', icon: <IconQuest /> },
  { to: '/dojo', label: 'Dojo', hint: 'Form Saiyan và thành tích', icon: <IconDojo /> },
  { to: '/settings', label: 'Cài đặt', hint: 'Tài khoản, thông báo, mục tiêu', icon: <IconSettings /> },
]

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = ['/quests', '/dojo', '/settings'].some((p) => isActivePath(location.pathname, p))

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  const tabs = [
    { to: '/', label: 'Home', icon: (on: boolean) => <IconHome filled={on} /> },
    { to: '/words', label: 'Từ', icon: (on: boolean) => <IconBook filled={on} /> },
  ] as const

  const rightTabs = [
    { to: '/review', label: 'Ôn', icon: (on: boolean) => <IconReview filled={on} /> },
  ] as const

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          <span className="text-blue-400">Vocab</span> IELTS
        </h1>
        <p className="mt-1 text-sm text-slate-400">FSRS spaced repetition · Saiyan training</p>
      </header>

      <main>{children}</main>

      {moreOpen && (
        <button
          type="button"
          className="fixed inset-x-0 top-0 z-40 bg-black/50"
          style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
          aria-label="Đóng menu"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div
          className="fixed inset-x-0 z-40 mx-auto max-w-5xl rounded-t-3xl border border-slate-700/80 bg-slate-900 px-4 pb-4 pt-3"
          style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-600" />
          <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-slate-500">Menu</p>
          <div className="space-y-1">
            {moreItems.map((item) => {
              const active = isActivePath(location.pathname, item.to)
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left ${
                    active ? 'bg-amber-500/15 text-amber-200' : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                    {item.icon}
                  </span>
                  <span>
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-xs text-slate-400">{item.hint}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/70 bg-slate-950/92 backdrop-blur-xl">
        <div className="mx-auto grid max-w-5xl grid-cols-5 items-end px-2 pt-1 pb-[max(0.45rem,env(safe-area-inset-bottom))]">
          {tabs.map((item) => {
            const active = isActivePath(location.pathname, item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl ${
                  active ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {item.icon(active)}
                <span className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            )
          })}

          <Link
            to="/add"
            className="flex min-h-14 flex-col items-center justify-end"
            aria-label="Thêm từ mới"
          >
            <span
              className={`-mt-5 flex h-14 w-14 items-center justify-center rounded-full text-slate-950 shadow-[0_8px_24px_rgba(251,191,36,0.35)] ${
                isActivePath(location.pathname, '/add')
                  ? 'bg-amber-300 ring-4 ring-amber-300/25'
                  : 'bg-amber-400'
              }`}
            >
              <IconPlus />
            </span>
            <span className={`mt-1 text-[11px] ${isActivePath(location.pathname, '/add') ? 'font-semibold text-amber-300' : 'font-medium text-slate-400'}`}>
              Thêm
            </span>
          </Link>

          {rightTabs.map((item) => {
            const active = isActivePath(location.pathname, item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl ${
                  active ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {item.icon(active)}
                <span className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl ${
              moreActive || moreOpen ? 'text-amber-300' : 'text-slate-400'
            }`}
          >
            <IconMore filled={moreActive || moreOpen} />
            <span className={`text-[11px] ${moreActive || moreOpen ? 'font-semibold' : 'font-medium'}`}>Khác</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
