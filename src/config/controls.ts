import type { KeyboardControlsEntry } from '@react-three/drei'

export type DriveControl = 'forward' | 'back' | 'left' | 'right' | 'brake' | 'reset'

export const DRIVE_CONTROLS: KeyboardControlsEntry<DriveControl>[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'brake', keys: ['Space'] },
  { name: 'reset', keys: ['KeyR'] },
]

export const CONTROL_HINTS: { keys: string; action: string }[] = [
  { keys: 'W / ↑', action: 'Газ' },
  { keys: 'S / ↓', action: 'Назад' },
  { keys: 'A D / ← →', action: 'Кермо' },
  { keys: 'Пробіл', action: 'Гальмо' },
  { keys: 'R', action: 'Респавн' },
]
