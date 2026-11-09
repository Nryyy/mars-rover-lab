import { ContactShadows, Grid, OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { buildVehicleSpec } from '../../domain/vehicleSpec'
import { useResolvedBuild } from '../../store/buildStore'
import { useLabStore } from '../../store/labStore'
import { StudioLights } from '../canvas/StudioLights'
import { RoverModel, type HotspotRenderer } from '../rover/RoverModel'
import { SlotHotspot } from './SlotHotspot'
import { StatsHologram } from './StatsHologram'

const CAMERA_POSITION = [5.5, 3.2, 6.5] as const
const CAMERA_TARGET = [0, 0.9, 0] as const
const BACKGROUND = '#070b12'

const renderHotspot: HotspotRenderer = (slot, position) => <SlotHotspot slot={slot} position={position} />

export function GarageScene() {
  const build = useResolvedBuild()
  const spec = useMemo(() => buildVehicleSpec(build), [build])
  const exploded = useLabStore((state) => state.exploded)
  const autoRotate = useLabStore((state) => state.autoRotate)
  const activeSlot = useLabStore((state) => state.activeSlot)
  const camera = useThree((state) => state.camera)

  // The test lab drives the camera itself; restore the showroom framing on return.
  useEffect(() => {
    camera.position.set(...CAMERA_POSITION)
    camera.lookAt(...CAMERA_TARGET)
  }, [camera])

  return (
    <>
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 14, 34]} />
      <StudioLights />
      <OrbitControls
        makeDefault
        target={[...CAMERA_TARGET]}
        enablePan={false}
        minDistance={4}
        maxDistance={13}
        maxPolarAngle={Math.PI * 0.48}
      />

      <Turntable spinning={autoRotate && activeSlot === null}>
        <group position-y={spec.rideHeight}>
          <RoverModel build={build} spec={spec} exploded={exploded} renderHotspot={renderHotspot} />
        </group>
      </Turntable>

      <Platform />
      <ContactShadows position-y={0.011} opacity={0.65} scale={9} blur={2.2} far={3} />
      <StatsHologram build={build} />
    </>
  )
}

function Turntable({ spinning, children }: { spinning: boolean; children: ReactNode }) {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    if (spinning && group.current) group.current.rotation.y += delta * 0.18
  })
  return <group ref={group}>{children}</group>
}

function Platform() {
  return (
    <group>
      <mesh receiveShadow position-y={-0.1}>
        <cylinderGeometry args={[3.6, 3.8, 0.2, 64]} />
        <meshStandardMaterial color="#141a24" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.005}>
        <ringGeometry args={[3.35, 3.45, 96]} />
        <meshBasicMaterial color="#2de2e6" toneMapped={false} />
      </mesh>
      <Grid
        position-y={-0.199}
        args={[60, 60]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1d2a3a"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#24506a"
        fadeDistance={30}
        fadeStrength={1.5}
        infiniteGrid
      />
    </group>
  )
}
