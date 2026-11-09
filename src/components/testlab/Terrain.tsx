import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useEffect, useMemo } from 'react'
import { createRegolithTexture } from '../../lib/textures'

const GROUND_SIZE = 240
const TEXTURE_REPEAT = 48

export function Terrain() {
  const texture = useMemo(() => {
    const map = createRegolithTexture()
    map.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT)
    return map
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <RigidBody type="fixed" colliders={false} friction={1}>
      <CuboidCollider args={[GROUND_SIZE / 2, 0.5, GROUND_SIZE / 2]} position={[0, -0.5, 0]} />
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
    </RigidBody>
  )
}
