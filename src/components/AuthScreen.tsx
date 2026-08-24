import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export function AuthScreen() {
  const { configured, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 text-slate-200">
          <h1 className="text-xl font-bold text-white">Chưa cấu hình Supabase</h1>
          <p className="mt-3 text-sm text-slate-300">
            Tạo file <code className="text-amber-300">.env</code> với{' '}
            <code className="text-amber-300">VITE_SUPABASE_URL</code> và{' '}
            <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code>, chạy SQL trong{' '}
            <code className="text-amber-300">supabase/schema.sql</code>, rồi bật Email + Google Auth.
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setInfo('')
    const err =
      mode === 'login'
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password)
    if (err) setError(err)
    else if (mode === 'signup') setInfo('Đăng ký thành công! Kiểm tra email xác nhận (nếu bật).')
    setBusy(false)
  }

  async function handleGoogle() {
    setBusy(true)
    setError('')
    const err = await signInWithGoogle()
    if (err) setError(err)
    setBusy(false)
  }

  const inputClass =
    'w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none'

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-500/30 bg-slate-900 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-blue-400">Vocab</span> IELTS
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Đăng nhập để đồng bộ từ vựng giữa máy tính và điện thoại.
        </p>

        <div className="mt-6 flex rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            onClick={() => setMode('login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            onClick={() => setMode('signup')}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-green-400">{info}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {busy ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-700" />
          hoặc
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleGoogle()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 py-3 font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-50"
        >
          <GoogleIcon />
          Tiếp tục với Google
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.1-5.2C29.2 35.5 26.7 36.5 24 36.5c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l.1.1 6.1 5.2C39.2 36.3 44 32 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  )
}
