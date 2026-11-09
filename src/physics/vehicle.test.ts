import RAPIER from '@dimforge/rapier3d-compat'
import { beforeAll, describe, expect, it } from 'vitest'
import { DEFAULT_BUILD, PART_CATALOG } from '../data/parts'
import { resolveBuild } from '../domain/build'
import { buildVehicleSpec, type VehicleSpec } from '../domain/vehicleSpec'
import { computeDriveCommand, IDLE_INPUT, type DriveInput } from './drive'
import { applyChassisMassProperties, applyDriveCommand, configureVehicle, countGroundedWheels, readForwardSpeed } from './vehicle'

const MARS_GRAVITY = -3.71

beforeAll(async () => {
  await RAPIER.init()
})

/** Headless simulation with the exact same setup code the React component uses. */
function simulate(spec: VehicleSpec, input: DriveInput, seconds: number) {
  const world = new RAPIER.World({ x: 0, y: MARS_GRAVITY, z: 0 })
  world.createCollider(RAPIER.ColliderDesc.cuboid(200, 0.5, 200).setTranslation(0, -0.5, 0))

  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, spec.rideHeight + 0.2, 0))
  const [hx, hy, hz] = spec.halfExtents
  world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setDensity(0), body)
  applyChassisMassProperties(body, spec)

  const controller = world.createVehicleController(body)
  configureVehicle(controller, spec)

  const settleSteps = 60
  const totalSteps = settleSteps + Math.round(seconds * 60)
  for (let step = 0; step < totalSteps; step++) {
    const activeInput = step < settleSteps ? IDLE_INPUT : input
    applyDriveCommand(controller, spec, computeDriveCommand(activeInput, readForwardSpeed(controller), spec))
    controller.updateVehicle(world.timestep)
    world.step()
  }

  const rotation = body.rotation()
  // Y component of the chassis up vector after rotation by the quaternion.
  const upY = 1 - 2 * (rotation.x ** 2 + rotation.z ** 2)
  const result = {
    position: body.translation(),
    forwardSpeed: readForwardSpeed(controller),
    grounded: countGroundedWheels(controller),
    upY,
  }
  world.free()
  return result
}

describe('rover vehicle physics', () => {
  const allBuilds = PART_CATALOG.chassis.flatMap((chassis) =>
    PART_CATALOG.wheels.map((wheels) => ({ ...DEFAULT_BUILD, chassis: chassis.id, wheels: wheels.id })),
  )

  it.each(allBuilds)('settles on its wheels: $chassis + $wheels', (build) => {
    const spec = buildVehicleSpec(resolveBuild(build))
    const result = simulate(spec, IDLE_INPUT, 1)
    expect(result.grounded).toBe(spec.wheels.length)
    expect(result.upY).toBeGreaterThan(0.99)
    expect(Math.abs(result.position.z)).toBeLessThan(0.2)
  })

  it('drives forward towards -Z when throttle is applied', () => {
    const spec = buildVehicleSpec(resolveBuild(DEFAULT_BUILD))
    const result = simulate(spec, { ...IDLE_INPUT, forward: true }, 3)
    expect(result.position.z).toBeLessThan(-5)
    expect(result.forwardSpeed).toBeGreaterThan(2)
    expect(result.forwardSpeed).toBeLessThanOrEqual(spec.maxSpeed * 1.1)
    expect(result.upY).toBeGreaterThan(0.95)
  })

  it('reverses towards +Z', () => {
    const spec = buildVehicleSpec(resolveBuild(DEFAULT_BUILD))
    const result = simulate(spec, { ...IDLE_INPUT, back: true }, 2)
    expect(result.position.z).toBeGreaterThan(1)
    expect(result.forwardSpeed).toBeLessThan(0)
  })

  it('turns left (towards -X) while steering left', () => {
    const spec = buildVehicleSpec(resolveBuild(DEFAULT_BUILD))
    const result = simulate(spec, { ...IDLE_INPUT, forward: true, left: true }, 2)
    expect(result.position.x).toBeLessThan(-0.5)
    expect(result.upY).toBeGreaterThan(0.9)
  })

  it.each(PART_CATALOG.chassis.map((chassis) => chassis.id))('does not roll over in a long full-throttle turn: %s', (chassis) => {
    const spec = buildVehicleSpec(resolveBuild({ ...DEFAULT_BUILD, chassis, wheels: 'spike' }))
    const result = simulate(spec, { ...IDLE_INPUT, forward: true, right: true }, 8)
    expect(result.upY).toBeGreaterThan(0.8)
    expect(result.grounded).toBeGreaterThan(0)
  })
})
