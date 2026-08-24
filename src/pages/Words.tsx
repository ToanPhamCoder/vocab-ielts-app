import { WordListByDate } from '../components/WordListByDate'

export function Words() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-white">Danh sách từ vựng</h2>
      <WordListByDate />
    </div>
  )
}
