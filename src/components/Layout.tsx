import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/add', label: 'Thêm từ', icon: '➕' },
  { to: '/words', label: 'Từ vựng', icon: '📚' },
  { to: '/review', label: 'Ôn tập', icon: '🔄' },
  { to: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          <span className="text-blue-400">Vocab</span> IELTS
        </h1>
        <p className="mt-1 text-sm text-slate-400">FSRS spaced repetition · IELTS 9.0 Reading</p>
      </header>

      <main>{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center rounded-lg px-3 py-2 text-xs transition ${
                  active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
