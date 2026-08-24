import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: 'H' },
  { to: '/add', label: 'Thêm', icon: '+' },
  { to: '/words', label: 'Từ', icon: 'W' },
  { to: '/review', label: 'Ôn', icon: 'R' },
  { to: '/dojo', label: 'Dojo', icon: 'D' },
  { to: '/settings', label: 'Set', icon: 'S' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          <span className="text-blue-400">Vocab</span> IELTS
        </h1>
        <p className="mt-1 text-sm text-slate-400">FSRS spaced repetition · Saiyan training</p>
      </header>

      <main>{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl justify-around px-1 py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-w-0 flex-col items-center rounded-lg px-2 py-2 text-[11px] transition ${
                  active ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm font-bold">{item.icon}</span>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
