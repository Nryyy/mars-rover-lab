import { useFrame } from '@react-three/fiber'
import { Physics, type RapierRigidBody } from '@react-three/rapier'
import { useMemo, useRef, type RefObject } from 'react'
import type { DirectionalLight } from 'three'
import { GRAVITY_PRESETS } from '../../data/environment'
import { buildKey } from '../../domain/build'
import { buildVehicleSpec } from '../../domain/vehicleSpec'
import { useBuildStore, useResolvedBuild } from '../../store/buildStore'
import { useLabStore } from '../../store/labStore'
import { ChaseCamera } from './ChaseCamera'
import { Obstacles } from './Obstacles'
import { RoverVehicle } from './RoverVehicle'
import { Terrain } from './Terrain'

const SKY = '#d19a72'

export function TestLabScene() {
  const rawBuild = useBuildStore((state) => state.build)
  const build = useResolvedBuild()
  const spec = useMemo(() => buildVehicleSpec(build), [build])
  const gravity = GRAVITY_PRESETS[useLabStore((state) => state.gravity)].value
  const roverBody = useRef<RapierRigidBody>(null)

  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 35, 150]} />
      <hemisphereLight args={['#f6d2b0', '#5a2412', 0.9]} />
      <FollowSun target={roverBody} />

      <Physics gravity={[0, gravity, 0]}>
        <Terrain />
        <Obstacles />
        <RoverVehicle key={buildKey(rawBuild)} build={build} spec={spec} bodyRef={roverBody} />
      </Physics>

      <ChaseCamera target={roverBody} />
    </>
  )
}

const SUN_OFFSET = [12, 20, 8] as const

/** Shadow-casting sun whose small shadow frustum follows the rover for crisp shadows. */
function FollowSun({ target }: { target: RefObject<RapierRigidBody | null> }) {
  const light = useRef<DirectionalLight>(null)

  useFrame(() => {
    const sun = light.current
    const body = target.current
    if (!sun || !body) return
    const { x, y, z } = body.translation()
    sun.position.set(x + SUN_OFFSET[0], y + SUN_OFFSET[1], z + SUN_OFFSET[2])
    sun.target.position.set(x, y, z)
    sun.target.updateMatrixWorld()
  })

  return (
    <directionalLight
      ref={light}
      castShadow
      intensity={2.4}
      color="#ffe2c4"
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-camera-far={60}
      shadow-bias={-0.0004}
    />
  )
}
