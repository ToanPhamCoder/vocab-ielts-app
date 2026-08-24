interface ReadinessScoreProps {
  score: number
  totalKnown: number
  target: number
  wordsNeeded: number
  retentionRate: number
}

export function ReadinessScore({
  score,
  totalKnown,
  target,
  wordsNeeded,
  retentionRate,
}: ReadinessScoreProps) {
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white">IELTS Reading Readiness</h3>
      <p className="mt-1 text-center text-sm text-slate-400">
        {totalKnown.toLocaleString()} / {target.toLocaleString()} word families
      </p>
      <p className="mt-1 text-center text-sm text-amber-400">
        Cần thêm ~{wordsNeeded.toLocaleString()} từ
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Retention rate (7 ngày): {retentionRate.toFixed(0)}%
      </p>
    </div>
  )
}
