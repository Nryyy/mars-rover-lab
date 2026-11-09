export type GravityPreset = 'mars' | 'moon' | 'earth'

export const GRAVITY_PRESETS: Record<GravityPreset, { label: string; value: number }> = {
  mars: { label: 'Марс · 3.71 м/с²', value: -3.71 },
  moon: { label: 'Місяць · 1.62 м/с²', value: -1.62 },
  earth: { label: 'Земля · 9.81 м/с²', value: -9.81 },
}
