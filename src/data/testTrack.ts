import type { Vec3 } from '../types/vehicle'

/** Static layout of the proving ground. The rover spawns at SPAWN facing -Z. */
export const SPAWN: Vec3 = [0, 0, 6]

export interface BoxObstacle {
  position: Vec3
  rotation: Vec3
  size: Vec3
}

export const RAMPS: BoxObstacle[] = [
  { position: [0, 0, -22], rotation: [0.22, 0, 0], size: [6, 0.4, 9] },
  { position: [-16, 0, -14], rotation: [0.16, 0.6, 0], size: [5, 0.4, 10] },
  { position: [14, 0, 8], rotation: [0.3, -2.2, 0], size: [4, 0.4, 6] },
]

/** Landing deck placed right after the second ramp (8 m further along its heading). */
export const PLATFORMS: BoxObstacle[] = [{ position: [-20.5, 0.55, -20.6], rotation: [0, 0.6, 0], size: [6, 1.1, 6] }]

export const HILLS: { position: Vec3; radius: number }[] = [
  { position: [24, -12.2, -22], radius: 14 },
  { position: [-28, -18.5, 18], radius: 20 },
]

export const CRATE_SIZE = 0.8
export const CRATE_ORIGIN: Vec3 = [8, 0, -6]
export const CRATE_ROWS = 4

export const CONES: Vec3[] = Array.from({ length: 7 }, (_, i) => [-8 + (i % 2 === 0 ? -1.2 : 1.2), 0, -2 - i * 5])

export const BUMP_ZONE = { x: [-5, 5] as [number, number], z: [-60, -40] as [number, number] }
