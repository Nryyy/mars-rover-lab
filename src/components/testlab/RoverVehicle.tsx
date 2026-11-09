import type { DynamicRayCastVehicleController } from '@dimforge/rapier3d-compat'
import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, useBeforePhysicsStep, useRapier, type RapierRigidBody } from '@react-three/rapier'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { Group } from 'three'
import type { DriveControl } from '../../config/controls'
import { SPAWN } from '../../data/testTrack'
import type { VehicleSpec, WheelSpec } from '../../domain/vehicleSpec'
import { computeDriveCommand } from '../../physics/drive'
import { applyChassisMassProperties, applyDriveCommand, configureVehicle, readForwardSpeed } from '../../physics/vehicle'
import { useLabStore } from '../../store/labStore'
import type { ResolvedBuild, WheelPart } from '../../types/vehicle'
import { RoverModel } from '../rover/RoverModel'
import { WheelModel } from '../rover/parts/WheelModel'
import { Telemetry } from './Telemetry'

const FALL_LIMIT = -15
const ZERO = { x: 0, y: 0, z: 0 }
const IDENTITY = { x: 0, y: 0, z: 0, w: 1 }

interface RoverVehicleProps {
  build: ResolvedBuild
  spec: VehicleSpec
  bodyRef: RefObject<RapierRigidBody | null>
}

/**
 * Physics-driven rover: a single rigid body with a box collider, plus Rapier's
 * ray-cast vehicle controller that simulates suspension, traction and steering per wheel.
 */
export function RoverVehicle({ build, spec, bodyRef }: RoverVehicleProps) {
  const { world } = useRapier()
  const controllerRef = useRef<DynamicRayCastVehicleController | null>(null)
  const [subscribeKeys, getKeys] = useKeyboardControls<DriveControl>()
  const resetToken = useLabStore((state) => state.resetToken)
  const spawnY = spec.rideHeight + 0.4

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    applyChassisMassProperties(body, spec)
    const controller = world.createVehicleController(body)
    configureVehicle(controller, spec)
    controllerRef.current = controller
    return () => {
      world.removeVehicleController(controller)
      controllerRef.current = null
    }
  }, [world, spec, bodyRef])

  const respawn = useCallback(() => {
    const body = bodyRef.current
    if (!body) return
    body.setTranslation({ x: SPAWN[0], y: spawnY, z: SPAWN[2] }, true)
    body.setRotation(IDENTITY, true)
    body.setLinvel(ZERO, true)
    body.setAngvel(ZERO, true)
  }, [bodyRef, spawnY])

  useEffect(() => subscribeKeys((state) => state.reset, (pressed) => pressed && respawn()), [subscribeKeys, respawn])

  // The HUD "respawn" button bumps a counter; skip the initial value.
  const handledToken = useRef(resetToken)
  useEffect(() => {
    if (resetToken === handledToken.current) return
    handledToken.current = resetToken
    respawn()
  }, [resetToken, respawn])

  useBeforePhysicsStep((physicsWorld) => {
    const controller = controllerRef.current
    if (!controller) return
    const command = computeDriveCommand(getKeys(), readForwardSpeed(controller), spec)
    applyDriveCommand(controller, spec, command)
    controller.updateVehicle(physicsWorld.timestep)
  })

  useFrame(() => {
    const body = bodyRef.current
    if (body && body.translation().y < FALL_LIMIT) respawn()
  })

  return (
    <RigidBody ref={bodyRef} colliders={false} position={[SPAWN[0], spawnY, SPAWN[2]]} canSleep={false} friction={0.4}>
      <CuboidCollider args={spec.halfExtents} density={0} />
      <RoverModel build={build} spec={spec} showWheels={false} />
      {spec.wheels.map((wheel, index) => (
        <WheelRig key={index} index={index} wheel={wheel} part={build.wheels} spec={spec} controllerRef={controllerRef} />
      ))}
      <Telemetry spec={spec} bodyRef={bodyRef} controllerRef={controllerRef} />
    </RigidBody>
  )
}

interface WheelRigProps {
  index: number
  wheel: WheelSpec
  part: WheelPart
  spec: VehicleSpec
  controllerRef: RefObject<DynamicRayCastVehicleController | null>
}

/** Mirrors one simulated wheel: suspension travel, steering angle and spin. */
function WheelRig({ index, wheel, part, spec, controllerRef }: WheelRigProps) {
  const root = useRef<Group>(null)
  const steer = useRef<Group>(null)
  const spin = useRef<Group>(null)
  const [x, y, z] = wheel.position

  useFrame(() => {
    const controller = controllerRef.current
    if (!controller || !root.current || !steer.current || !spin.current) return
    root.current.position.y = y - (controller.wheelSuspensionLength(index) ?? spec.suspension.restLength)
    steer.current.rotation.y = controller.wheelSteering(index) ?? 0
    spin.current.rotation.x = controller.wheelRotation(index) ?? 0
  })

  return (
    <group ref={root} position={[x, y - spec.suspension.restLength, z]}>
      <group ref={steer}>
        <group ref={spin}>
          <WheelModel part={part} side={wheel.side} />
        </group>
      </group>
    </group>
  )
}
