import { AddWordForm } from '../components/AddWordForm'

export function AddWord() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-white">Th?m t? v?ng m?i</h2>
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <AddWordForm />
      </div>
    </div>
  )
}
