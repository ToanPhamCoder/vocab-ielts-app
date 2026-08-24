import { useState } from 'react'
import { addWord } from '../db/hooks'

interface AddWordFormProps {
  onSuccess?: () => void
}

export function AddWordForm({ onSuccess }: AddWordFormProps) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!word.trim() || !meaning.trim()) return

    setLoading(true)
    setMessage('')
    try {
      await addWord({
        word,
        meaning,
        example: example || undefined,
        phonetic: phonetic || undefined,
        partOfSpeech: partOfSpeech || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })
      setWord('')
      setMeaning('')
      setExample('')
      setPhonetic('')
      setPartOfSpeech('')
      setTags('')
      setMessage('Đã thêm từ vựng!')
      onSuccess?.()
    } catch {
      setMessage('Không thể thêm từ. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Từ vựng *</label>
        <input
          className={inputClass}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="e.g. ubiquitous"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Nghĩa *</label>
        <input
          className={inputClass}
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="có mặt ở khắp nơi"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Phiên âm</label>
          <input
            className={inputClass}
            value={phonetic}
            onChange={(e) => setPhonetic(e.target.value)}
            placeholder="/juːˈbɪkwɪtəs/"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Loại từ</label>
          <input
            className={inputClass}
            value={partOfSpeech}
            onChange={(e) => setPartOfSpeech(e.target.value)}
            placeholder="adj"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Ví dụ</label>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="Smartphones are ubiquitous in modern life."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Tags</label>
        <input
          className={inputClass}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="AWL, academic (phân cách bằng dấu phẩy)"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.includes('Đã') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Đang lưu...' : 'Thêm từ vựng'}
      </button>
    </form>
  )
}
