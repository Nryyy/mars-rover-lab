import { createRandom, randomRange } from '../lib/random'
import type { Vec3 } from '../types/vehicle'

export interface RockSpec {
  position: Vec3
  rotation: Vec3
  radius: number
}

interface RingScatterOptions {
  seed: number
  count: number
  innerRadius: number
  outerRadius: number
  minSize: number
  maxSize: number
}

/** Rocks scattered in a ring around the spawn so the start area stays clear. */
export function scatterRocksInRing(options: RingScatterOptions): RockSpec[] {
  const random = createRandom(options.seed)
  return Array.from({ length: options.count }, () => {
    // sqrt keeps the distribution uniform over the ring area instead of bunching at the centre.
    const distance = Math.sqrt(randomRange(random, options.innerRadius ** 2, options.outerRadius ** 2))
    const angle = random() * Math.PI * 2
    const radius = randomRange(random, options.minSize, options.maxSize)
    return {
      position: [Math.cos(angle) * distance, radius * 0.35, Math.sin(angle) * distance],
      rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI],
      radius,
    }
  })
}

interface AreaScatterOptions {
  seed: number
  count: number
  x: [number, number]
  z: [number, number]
  minSize: number
  maxSize: number
  /** 0 = sits on the ground, 1 = fully buried. */
  burial: number
}

/** Half-buried bumps inside a rectangular zone (the "washboard" section of the track). */
export function scatterInArea(options: AreaScatterOptions): RockSpec[] {
  const random = createRandom(options.seed)
  return Array.from({ length: options.count }, () => {
    const radius = randomRange(random, options.minSize, options.maxSize)
    return {
      position: [
        randomRange(random, ...options.x),
        radius * (1 - 2 * options.burial),
        randomRange(random, ...options.z),
      ],
      rotation: [0, random() * Math.PI, 0],
      radius,
    }
  })
}
