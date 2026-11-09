import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import type { ToolPart } from '../../../types/vehicle'
import { useRoverMaterials } from '../materials'

interface ToolModelProps {
  part: ToolPart
  /** Height of the chassis top above the tool mount, for roof-mounted tools. */
  roofHeight: number
}

/** Front-mounted tool; origin sits on the chassis nose, -Z points forward. */
export function ToolModel({ part, roofHeight }: ToolModelProps) {
  switch (part.style) {
    case 'none':
      return <MountPlate />
    case 'arm':
      return <RoboticArm />
    case 'drill':
      return <CoreDrill />
    case 'laser':
      return <PlasmaCutter roofHeight={roofHeight} />
  }
}

function MountPlate() {
  const m = useRoverMaterials()
  return (
    <mesh material={m.frame} position-z={-0.03}>
      <boxGeometry args={[0.3, 0.16, 0.06]} />
    </mesh>
  )
}

function RoboticArm() {
  const m = useRoverMaterials()
  const shoulder = useRef<Group>(null)
  const elbow = useRef<Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (shoulder.current) shoulder.current.rotation.x = 0.35 + Math.sin(t * 0.8) * 0.12
    if (elbow.current) elbow.current.rotation.x = -0.9 + Math.sin(t * 0.8 + 1) * 0.15
  })

  return (
    <group position={[0.25, 0.05, -0.05]}>
      <MountPlate />
      <mesh castShadow material={m.accent} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.09, 0.09, 0.16, 16]} />
      </mesh>
      <group ref={shoulder}>
        <mesh castShadow material={m.body} position-z={-0.25}>
          <boxGeometry args={[0.08, 0.08, 0.5]} />
        </mesh>
        <group ref={elbow} position-z={-0.5}>
          <mesh material={m.metal}>
            <sphereGeometry args={[0.065, 16, 12]} />
          </mesh>
          <mesh castShadow material={m.body} position-z={-0.2}>
            <boxGeometry args={[0.065, 0.065, 0.4]} />
          </mesh>
          <group position-z={-0.42}>
            <mesh material={m.glowCyan}>
              <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} material={m.metal} position={[side * 0.04, 0, -0.07]} rotation-y={side * 0.25}>
                <boxGeometry args={[0.02, 0.05, 0.14]} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}

function CoreDrill() {
  const m = useRoverMaterials()
  const bit = useRef<Group>(null)

  useFrame((_, delta) => {
    if (bit.current) bit.current.rotation.y += delta * 8
  })

  return (
    <group>
      <mesh castShadow material={m.frame} position-z={-0.1}>
        <boxGeometry args={[0.32, 0.1, 0.2]} />
      </mesh>
      <group position={[0, 0.05, -0.28]}>
        <mesh castShadow material={m.accent}>
          <cylinderGeometry args={[0.1, 0.1, 0.34, 16]} />
        </mesh>
        <mesh material={m.glowOrange} position-y={0.1} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.105, 0.012, 6, 24]} />
        </mesh>
        <group ref={bit} position-y={-0.3}>
          <mesh castShadow material={m.metal} rotation-x={Math.PI}>
            <coneGeometry args={[0.06, 0.32, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function PlasmaCutter({ roofHeight }: { roofHeight: number }) {
  const m = useRoverMaterials()
  const turret = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (turret.current) turret.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.35
  })

  return (
    <group position={[0, roofHeight, 0.2]}>
      <mesh castShadow material={m.frame} position-y={0.05}>
        <cylinderGeometry args={[0.17, 0.2, 0.1, 20]} />
      </mesh>
      <group ref={turret} position-y={0.16}>
        <mesh castShadow material={m.accent}>
          <boxGeometry args={[0.28, 0.14, 0.3]} />
        </mesh>
        <mesh castShadow material={m.metal} position-z={-0.45} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.045, 0.06, 0.65, 12]} />
        </mesh>
        {[0.25, 0.4, 0.55].map((z) => (
          <mesh key={z} material={m.glowCyan} position-z={-z}>
            <torusGeometry args={[0.07, 0.012, 6, 16]} />
          </mesh>
        ))}
        <mesh material={m.glowOrange} position-z={-0.8}>
          <sphereGeometry args={[0.05, 12, 8]} />
        </mesh>
      </group>
    </group>
  )
}
