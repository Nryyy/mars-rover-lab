import type { Finish, Paint } from '../types/vehicle'

export const PAINT_SWATCHES: readonly string[] = [
  '#e8e4da',
  '#ff7a3d',
  '#d6402b',
  '#f2c14e',
  '#2de2e6',
  '#3a7bd5',
  '#7b5cff',
  '#2b2f36',
]

export const FINISHES: Record<Finish, { label: string; metalness: number; roughness: number }> = {
  matte: { label: 'Матовий', metalness: 0.1, roughness: 0.85 },
  satin: { label: 'Сатин', metalness: 0.35, roughness: 0.45 },
  metal: { label: 'Метал', metalness: 0.9, roughness: 0.25 },
}

export const DEFAULT_PAINT: Paint = {
  body: '#e8e4da',
  accent: '#ff7a3d',
  finish: 'satin',
}
