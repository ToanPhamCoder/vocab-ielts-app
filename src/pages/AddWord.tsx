import { AddWordForm } from '../components/AddWordForm'

export function AddWord() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-white">Thêm từ vựng mới</h2>
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <AddWordForm />
      </div>
    </div>
  )
}
