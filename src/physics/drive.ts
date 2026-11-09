import { clamp } from '../lib/math'
import type { VehicleSpec } from '../domain/vehicleSpec'

export interface DriveInput {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  brake: boolean
}

export interface DriveCommand {
  engineForce: number
  /** Radians, positive turns left. */
  steering: number
  brake: number
}

export const IDLE_INPUT: DriveInput = { forward: false, back: false, left: false, right: false, brake: false }

const REVERSE_POWER = 0.6
const COAST_BRAKE = 0.12

/**
 * Pure mapping from player input + current speed to wheel commands.
 * Kept free of Rapier so it can be unit-tested and reused by any controller.
 */
export function computeDriveCommand(input: DriveInput, forwardSpeed: number, spec: VehicleSpec): DriveCommand {
  const throttle = Number(input.forward) - Number(input.back)
  const speedRatio = clamp(Math.abs(forwardSpeed) / spec.maxSpeed, 0, 1)

  let engineForce = throttle * spec.engineForcePerWheel * (throttle < 0 ? REVERSE_POWER : 1)
  const pushingSameWay = Math.sign(throttle) === Math.sign(forwardSpeed)
  if (pushingSameWay && speedRatio >= 1) engineForce = 0

  // Steering gets less aggressive at speed to avoid rollovers.
  const steer = Number(input.left) - Number(input.right)
  const steering = steer * spec.maxSteer * (1 - speedRatio * 0.5)

  let brake = 0
  if (input.brake) brake = spec.brakeForce
  else if (throttle === 0) brake = spec.brakeForce * COAST_BRAKE
  else if (!pushingSameWay && Math.abs(forwardSpeed) > 0.5) brake = spec.brakeForce * 0.5

  return { engineForce: input.brake ? 0 : engineForce, steering, brake }
}
