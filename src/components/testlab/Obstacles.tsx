import { Instance, Instances } from '@react-three/drei'
import { BallCollider, CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'
import {
  BUMP_ZONE,
  CONES,
  CRATE_ORIGIN,
  CRATE_ROWS,
  CRATE_SIZE,
  HILLS,
  PLATFORMS,
  RAMPS,
  type BoxObstacle,
} from '../../data/testTrack'
import { scatterInArea, scatterRocksInRing, type RockSpec } from '../../domain/terrain'
import type { Vec3 } from '../../types/vehicle'

const ROCK_COLOR = '#7a3a22'

export function Obstacles() {
  return (
    <>
      <BoxObstacles items={RAMPS} color="#6d7480" stripe />
      <BoxObstacles items={PLATFORMS} color="#565d68" />
      <Hills />
      <RockField />
      <CratePyramid />
      <Cones />
    </>
  )
}

function BoxObstacles({ items, color, stripe = false }: { items: BoxObstacle[]; color: string; stripe?: boolean }) {
  return (
    <>
      {items.map(({ position, rotation, size }) => (
        <RigidBody key={position.join(',')} type="fixed" colliders="cuboid" position={position} rotation={rotation} friction={1}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} metalness={0.15} roughness={0.7} />
          </mesh>
          {stripe && (
            <mesh position={[0, size[1] / 2 + 0.005, 0]}>
              <boxGeometry args={[size[0] * 0.08, 0.01, size[2] * 0.95]} />
              <meshBasicMaterial color="#f2c14e" toneMapped={false} />
            </mesh>
          )}
        </RigidBody>
      ))}
    </>
  )
}

function Hills() {
  return (
    <>
      {HILLS.map(({ position, radius }) => (
        <RigidBody key={position.join(',')} type="fixed" colliders="ball" position={position} friction={1}>
          <mesh receiveShadow castShadow>
            <sphereGeometry args={[radius, 64, 32]} />
            <meshStandardMaterial color="#a64f2a" roughness={1} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

/** All rocks share one fixed body; visuals are instanced to keep draw calls low. */
function RockField() {
  const rocks = useMemo<RockSpec[]>(
    () => [
      ...scatterRocksInRing({ seed: 11, count: 70, innerRadius: 28, outerRadius: 100, minSize: 0.4, maxSize: 1.8 }),
      ...scatterInArea({ seed: 23, count: 46, ...BUMP_ZONE, minSize: 0.25, maxSize: 0.6, burial: 0.35 }),
    ],
    [],
  )

  return (
    <RigidBody type="fixed" colliders={false} friction={1}>
      {rocks.map((rock, index) => (
        <BallCollider key={index} args={[rock.radius]} position={rock.position} />
      ))}
      <Instances limit={rocks.length} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={ROCK_COLOR} roughness={1} flatShading />
        {rocks.map((rock, index) => (
          <Instance key={index} position={rock.position} rotation={rock.rotation} scale={rock.radius} />
        ))}
      </Instances>
    </RigidBody>
  )
}

function CratePyramid() {
  const crates = useMemo<Vec3[]>(() => {
    const result: Vec3[] = []
    for (let row = 0; row < CRATE_ROWS; row++) {
      const count = CRATE_ROWS - row
      for (let i = 0; i < count; i++) {
        result.push([
          CRATE_ORIGIN[0] + (i - (count - 1) / 2) * (CRATE_SIZE + 0.02),
          CRATE_ORIGIN[1] + CRATE_SIZE / 2 + row * CRATE_SIZE,
          CRATE_ORIGIN[2],
        ])
      }
    }
    return result
  }, [])

  const half = CRATE_SIZE / 2
  return (
    <>
      {crates.map((position) => (
        <RigidBody key={position.join(',')} colliders={false} position={position}>
          <CuboidCollider args={[half, half, half]} mass={0.6} />
          <mesh castShadow receiveShadow>
            <boxGeometry args={[CRATE_SIZE, CRATE_SIZE, CRATE_SIZE]} />
            <meshStandardMaterial color="#d9d2c3" metalness={0.2} roughness={0.6} />
          </mesh>
          <mesh>
            <boxGeometry args={[CRATE_SIZE * 1.01, CRATE_SIZE * 0.15, CRATE_SIZE * 1.01]} />
            <meshStandardMaterial color="#ff7a3d" />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

function Cones() {
  const height = 0.8
  return (
    <>
      {CONES.map((position) => (
        <RigidBody key={position.join(',')} colliders={false} position={[position[0], height / 2, position[2]]}>
          <CylinderCollider args={[height / 2, 0.22]} mass={0.15} />
          <mesh castShadow>
            <coneGeometry args={[0.25, height, 16]} />
            <meshStandardMaterial color="#ff7a3d" emissive="#ff4d00" emissiveIntensity={0.3} />
          </mesh>
          <mesh position-y={0.05}>
            <cylinderGeometry args={[0.15, 0.18, 0.1, 16]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}
