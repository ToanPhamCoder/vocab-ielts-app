import { useNavigate } from 'react-router-dom'
import { ReviewSession } from '../components/ReviewSession'

export function Review() {
  const navigate = useNavigate()

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-white">Ôn tập FSRS</h2>
      <ReviewSession onComplete={() => navigate('/')} />
    </div>
  )
}
