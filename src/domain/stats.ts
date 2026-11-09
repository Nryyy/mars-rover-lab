import { clamp } from '../lib/math'
import type { ResolvedBuild } from '../types/vehicle'

export type RatingKey = 'speed' | 'offroad' | 'grip' | 'sensors' | 'armor' | 'utility'

export interface VehicleStats {
  totalMass: number
  wheelCount: number
  power: number
  powerToWeight: number
  /** Metres per second. */
  topSpeed: number
  /** 0–100 normalised scores used by the UI bars. */
  ratings: Record<RatingKey, number>
}

export const RATING_LABELS: Record<RatingKey, string> = {
  speed: 'Швидкість',
  offroad: 'Прохідність',
  grip: 'Зчеплення',
  sensors: 'Сенсори',
  armor: 'Броня',
  utility: 'Корисність',
}

const MAX_TOP_SPEED = 16
const MAX_FRICTION_SLIP = 4.5

export function computeStats(build: ResolvedBuild): VehicleStats {
  const { chassis, wheels, sensor, tool } = build
  const wheelCount = chassis.wheelPairs * 2
  const totalMass = chassis.mass + wheels.mass * wheelCount + sensor.mass + tool.mass
  const powerToWeight = chassis.enginePower / totalMass
  // Bigger wheels cover more ground per revolution.
  const topSpeed = clamp((5 + powerToWeight * 1.1) * (wheels.radius / 0.4), 5, MAX_TOP_SPEED)

  const offroad =
    (wheels.suspensionTravel / 0.35) * 50 +
    (wheels.radius / 0.44) * 30 +
    (chassis.wheelPairs === 3 ? 20 : 0)

  return {
    totalMass,
    wheelCount,
    power: chassis.enginePower,
    powerToWeight,
    topSpeed,
    ratings: {
      speed: score((topSpeed / MAX_TOP_SPEED) * 100),
      offroad: score(offroad),
      grip: score((wheels.frictionSlip / MAX_FRICTION_SLIP) * 100),
      sensors: score(sensor.scanRange),
      armor: score(chassis.armor),
      utility: score(tool.utility),
    },
  }
}

function score(value: number): number {
  return Math.round(clamp(value, 0, 100))
}
