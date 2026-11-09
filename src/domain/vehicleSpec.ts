import type { ResolvedBuild, Vec3 } from '../types/vehicle'
import { computeStats } from './stats'

export interface WheelSpec {
  /** Suspension hard-point in chassis space. */
  position: Vec3
  radius: number
  width: number
  side: -1 | 1
  /** Multiplier applied to the steering angle: 1 front, -1 rear (crab steering), 0 fixed. */
  steerFactor: number
}

export interface SuspensionSpec {
  restLength: number
  maxTravel: number
  stiffness: number
  compression: number
  relaxation: number
  maxForce: number
}

/** Everything the physics layer needs, derived from the selected parts. */
export interface VehicleSpec {
  mass: number
  halfExtents: Vec3
  centerOfMass: Vec3
  principalInertia: Vec3
  wheels: WheelSpec[]
  suspension: SuspensionSpec
  frictionSlip: number
  sideFrictionStiffness: number
  engineForcePerWheel: number
  brakeForce: number
  maxSteer: number
  /** Metres per second. */
  maxSpeed: number
  /** Distance from chassis centre to the ground when the suspension is at rest length. */
  rideHeight: number
}

const SUSPENSION_REST_LENGTH = 0.3
const WHEEL_GAP = 0.08

export function buildVehicleSpec(build: ResolvedBuild): VehicleSpec {
  const { chassis, wheels } = build
  const stats = computeStats(build)
  const [width, height, length] = chassis.size

  const mountY = -height * 0.35
  const mountX = width / 2 + wheels.width / 2 + WHEEL_GAP
  const axleZ = chassis.wheelPairs === 3 ? [-length * 0.4, 0, length * 0.4] : [-length * 0.36, length * 0.36]
  const lastAxle = axleZ.length - 1

  const wheelSpecs: WheelSpec[] = axleZ.flatMap((z, axle) => {
    // Front axle steers, the rear axle of a six-wheeler counter-steers for a tighter turn.
    const steerFactor = axle === 0 ? 1 : axle === lastAxle && chassis.wheelPairs === 3 ? -0.6 : 0
    return ([-1, 1] as const).map((side) => ({
      position: [side * mountX, mountY, z] as Vec3,
      radius: wheels.radius,
      width: wheels.width,
      side,
      steerFactor,
    }))
  })

  const mass = stats.totalMass
  const stiffness = wheels.suspensionStiffness
  const criticalDamping = 2 * Math.sqrt(stiffness)

  return {
    mass,
    halfExtents: [width / 2, height / 2, length / 2],
    // A low centre of mass keeps the rover from rolling over in tight turns.
    centerOfMass: [0, -height * 0.6, 0],
    principalInertia: [
      (mass / 12) * (height ** 2 + length ** 2),
      (mass / 12) * (width ** 2 + length ** 2),
      (mass / 12) * (width ** 2 + height ** 2),
    ],
    wheels: wheelSpecs,
    suspension: {
      restLength: SUSPENSION_REST_LENGTH,
      maxTravel: wheels.suspensionTravel,
      stiffness,
      compression: criticalDamping * 0.3,
      relaxation: criticalDamping * 0.45,
      maxForce: mass * 400,
    },
    frictionSlip: wheels.frictionSlip,
    sideFrictionStiffness: 1,
    engineForcePerWheel: chassis.enginePower / wheelSpecs.length,
    brakeForce: mass * 0.03,
    maxSteer: 0.5,
    maxSpeed: stats.topSpeed,
    rideHeight: -(mountY - SUSPENSION_REST_LENGTH - wheels.radius),
  }
}
