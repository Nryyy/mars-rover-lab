import type { DynamicRayCastVehicleController, RigidBody } from '@dimforge/rapier3d-compat'
import type { VehicleSpec } from '../domain/vehicleSpec'
import type { DriveCommand } from './drive'

const UP_AXIS = 1
/** Rapier measures speed along chassis +Z, while the rover's nose points to -Z. */
const FORWARD_AXIS = 2
const FORWARD_SIGN = -1

const SUSPENSION_DIRECTION = { x: 0, y: -1, z: 0 }
/** With up = +Y this axle makes positive engine force push the rover towards -Z. */
const WHEEL_AXLE = { x: 1, y: 0, z: 0 }

/**
 * Colliders are created with zero density, so the chassis mass, a lowered centre
 * of mass and a box inertia tensor are supplied explicitly from the spec.
 */
export function applyChassisMassProperties(body: RigidBody, spec: VehicleSpec): void {
  const [cx, cy, cz] = spec.centerOfMass
  const [ix, iy, iz] = spec.principalInertia
  body.setAdditionalMassProperties(spec.mass, { x: cx, y: cy, z: cz }, { x: ix, y: iy, z: iz }, { x: 0, y: 0, z: 0, w: 1 }, true)
}

export function configureVehicle(controller: DynamicRayCastVehicleController, spec: VehicleSpec): void {
  controller.indexUpAxis = UP_AXIS
  controller.setIndexForwardAxis = FORWARD_AXIS

  const { suspension } = spec
  spec.wheels.forEach((wheel, index) => {
    const [x, y, z] = wheel.position
    controller.addWheel({ x, y, z }, SUSPENSION_DIRECTION, WHEEL_AXLE, suspension.restLength, wheel.radius)
    controller.setWheelSuspensionStiffness(index, suspension.stiffness)
    controller.setWheelSuspensionCompression(index, suspension.compression)
    controller.setWheelSuspensionRelaxation(index, suspension.relaxation)
    controller.setWheelMaxSuspensionTravel(index, suspension.maxTravel)
    controller.setWheelMaxSuspensionForce(index, suspension.maxForce)
    controller.setWheelFrictionSlip(index, spec.frictionSlip)
    controller.setWheelSideFrictionStiffness(index, spec.sideFrictionStiffness)
  })
}

export function applyDriveCommand(controller: DynamicRayCastVehicleController, spec: VehicleSpec, command: DriveCommand): void {
  spec.wheels.forEach((wheel, index) => {
    controller.setWheelEngineForce(index, command.engineForce)
    controller.setWheelSteering(index, command.steering * wheel.steerFactor)
    controller.setWheelBrake(index, command.brake)
  })
}

/** Signed speed along the rover's nose, m/s. */
export function readForwardSpeed(controller: DynamicRayCastVehicleController): number {
  return controller.currentVehicleSpeed() * FORWARD_SIGN
}

export function countGroundedWheels(controller: DynamicRayCastVehicleController): number {
  let grounded = 0
  for (let i = 0; i < controller.numWheels(); i++) {
    if (controller.wheelIsInContact(i)) grounded++
  }
  return grounded
}
