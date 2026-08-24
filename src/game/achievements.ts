export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-ki', name: 'First Ki', description: 'Ôn 1 từ đang due', icon: '⚡' },
  { id: 'warmup', name: 'Warm-up', description: 'Hoàn thành daily goal lần đầu', icon: '🌅' },
  { id: 'z-warrior', name: 'Z Warrior', description: 'Streak 7 ngày', icon: '🔥' },
  { id: 'super-saiyan', name: 'Super Saiyan', description: 'Đạt Level 5', icon: '🌟' },
  { id: 'gravity', name: 'Gravity Chamber', description: 'Ôn hết due 7 ngày liên tiếp', icon: '🏋️' },
  { id: 'honest', name: 'Honest Scout', description: '20 lần due liên tiếp không bấm Easy', icon: '🎯' },
  { id: 'namek', name: 'Namek Saga', description: 'Thuộc 50 từ trong app', icon: '🪐' },
  { id: 'cell', name: 'Cell Games', description: 'Streak 30 ngày', icon: '🏆' },
  { id: 'ultra', name: 'Ultra Instinct', description: 'Đạt Level 12', icon: '✨' },
]
