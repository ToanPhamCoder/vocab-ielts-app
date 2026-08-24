export interface SaiyanForm {
  level: number
  id: string
  name: string
  subtitle: string
  image: string
  accent: string
  xpRequired: number
}

export const SAIYAN_FORMS: SaiyanForm[] = [
  { level: 1, id: 'earthling', name: 'Earthling', subtitle: 'Chưa khai ki', image: '/forms/01-earthling.png', accent: '#94a3b8', xpRequired: 0 },
  { level: 2, id: 'ape', name: 'Great Ape Night', subtitle: 'Sức mạnh hoang dã', image: '/forms/02-ape.png', accent: '#7c3aed', xpRequired: 200 },
  { level: 3, id: 'base', name: 'Saiyan Base', subtitle: 'Chiến binh thực thụ', image: '/forms/03-base.png', accent: '#f59e0b', xpRequired: 500 },
  { level: 4, id: 'kaioken', name: 'Kaioken', subtitle: 'Gấp đôi sức mạnh', image: '/forms/04-kaioken.png', accent: '#ef4444', xpRequired: 1000 },
  { level: 5, id: 'ssj', name: 'Super Saiyan', subtitle: 'Tóc vàng bùng cháy', image: '/forms/05-ssj.png', accent: '#fbbf24', xpRequired: 2000 },
  { level: 6, id: 'grade', name: 'SSJ Grade 2', subtitle: 'Cơ bắp + aura', image: '/forms/06-grade.png', accent: '#f59e0b', xpRequired: 3500 },
  { level: 7, id: 'ssj2', name: 'Super Saiyan 2', subtitle: 'Tia điện', image: '/forms/07-ssj2.png', accent: '#fde047', xpRequired: 5500 },
  { level: 8, id: 'ssj3', name: 'Super Saiyan 3', subtitle: 'Tóc dài, trời tối', image: '/forms/08-ssj3.png', accent: '#facc15', xpRequired: 8000 },
  { level: 9, id: 'god', name: 'Super Saiyan God', subtitle: 'Thần ki đỏ', image: '/forms/09-god.png', accent: '#f43f5e', xpRequired: 12000 },
  { level: 10, id: 'blue', name: 'Super Saiyan Blue', subtitle: 'Thần ki xanh', image: '/forms/10-blue.png', accent: '#22d3ee', xpRequired: 18000 },
  { level: 11, id: 'ui', name: 'Ultra Instinct Omen', subtitle: 'Instinct lóe sáng', image: '/forms/11-ui.png', accent: '#cbd5e1', xpRequired: 25000 },
  { level: 12, id: 'mui', name: 'Mastered Ultra Instinct', subtitle: 'Toàn giác bạc', image: '/forms/12-mui.png', accent: '#e2e8f0', xpRequired: 35000 },
]

export const XP_BY_RATING: Record<1 | 2 | 3 | 4, number> = {
  1: 2,
  2: 8,
  3: 12,
  4: 6,
}

export const DAILY_GOAL_BONUS = 50
export const CLEAR_DUE_BONUS = 30

export function formForXp(xp: number): SaiyanForm {
  let current = SAIYAN_FORMS[0]
  for (const form of SAIYAN_FORMS) {
    if (xp >= form.xpRequired) current = form
  }
  return current
}

export function nextForm(xp: number): SaiyanForm | null {
  const current = formForXp(xp)
  return SAIYAN_FORMS.find((f) => f.level === current.level + 1) ?? null
}

export function xpProgress(xp: number) {
  const current = formForXp(xp)
  const nxt = nextForm(xp)
  if (!nxt) {
    return { current, next: null, into: 1, need: 1, pct: 100 }
  }
  const into = xp - current.xpRequired
  const need = nxt.xpRequired - current.xpRequired
  return { current, next: nxt, into, need, pct: Math.min(100, Math.round((into / need) * 100)) }
}
