import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import type { SensorPart } from '../../../types/vehicle'
import { useRoverMaterials } from '../materials'

/** Sensor package; origin sits on top of the chassis shell. */
export function SensorModel({ part }: { part: SensorPart }) {
  switch (part.style) {
    case 'mast':
      return <StereoMast />
    case 'dome':
      return <PanoramicDome />
    case 'lidar':
      return <LidarArray />
  }
}

function StereoMast() {
  const m = useRoverMaterials()
  const head = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (head.current) head.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.5
  })

  return (
    <group>
      <mesh castShadow material={m.frame} position-y={0.03}>
        <cylinderGeometry args={[0.13, 0.15, 0.06, 16]} />
      </mesh>
      <mesh castShadow material={m.metal} position-y={0.48}>
        <cylinderGeometry args={[0.035, 0.045, 0.85, 10]} />
      </mesh>
      <group ref={head} position-y={0.98}>
        <mesh castShadow material={m.body}>
          <boxGeometry args={[0.5, 0.2, 0.22]} />
        </mesh>
        <mesh material={m.accent} position-y={0.105}>
          <boxGeometry args={[0.52, 0.02, 0.24]} />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} material={m.glass} position={[x, 0, -0.12]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.055, 0.055, 0.05, 16]} />
          </mesh>
        ))}
        <mesh material={m.glowCyan} position={[0, -0.06, -0.112]}>
          <boxGeometry args={[0.12, 0.02, 0.01]} />
        </mesh>
      </group>
    </group>
  )
}

function PanoramicDome() {
  const m = useRoverMaterials()
  const core = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (core.current) core.current.position.y = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.02
  })

  return (
    <group>
      <mesh castShadow material={m.frame} position-y={0.05}>
        <cylinderGeometry args={[0.26, 0.28, 0.1, 24]} />
      </mesh>
      <mesh material={m.glowCyan} position-y={0.1} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.25, 0.012, 6, 32]} />
      </mesh>
      <mesh material={m.glass} position-y={0.1}>
        <sphereGeometry args={[0.23, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <group ref={core} position-y={0.2}>
        <mesh material={m.glowCyan}>
          <icosahedronGeometry args={[0.07, 1]} />
        </mesh>
      </group>
    </group>
  )
}

function LidarArray() {
  const m = useRoverMaterials()
  const spinner = useRef<Group>(null)

  useFrame((_, delta) => {
    if (spinner.current) spinner.current.rotation.y += delta * 4
  })

  return (
    <group>
      <mesh castShadow material={m.frame} position-y={0.13}>
        <cylinderGeometry args={[0.12, 0.16, 0.26, 16]} />
      </mesh>
      <group ref={spinner} position-y={0.36}>
        <mesh castShadow material={m.metal}>
          <cylinderGeometry args={[0.18, 0.18, 0.16, 24]} />
        </mesh>
        <mesh material={m.glowCyan}>
          <cylinderGeometry args={[0.183, 0.183, 0.03, 24, 1, true]} />
        </mesh>
        <mesh material={m.accent} position={[0, 0, -0.18]}>
          <boxGeometry args={[0.1, 0.1, 0.06]} />
        </mesh>
        <mesh material={m.body} position-y={0.1}>
          <cylinderGeometry args={[0.12, 0.18, 0.05, 24]} />
        </mesh>
      </group>
    </group>
  )
}
