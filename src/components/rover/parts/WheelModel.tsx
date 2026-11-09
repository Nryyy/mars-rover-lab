import { Instance, Instances } from '@react-three/drei'
import { useMemo } from 'react'
import type { WheelPart } from '../../../types/vehicle'
import { useRoverMaterials } from '../materials'

interface WheelModelProps {
  part: WheelPart
  /** -1 for the left side, 1 for the right; the hub cap always faces outwards. */
  side: -1 | 1
}

interface RingItem {
  angle: number
  x: number
  z: number
}

function ringLayout(count: number, radius: number): RingItem[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    return { angle, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius }
  })
}

/** Wheel geometry with its axle along the local X axis. */
export function WheelModel({ part, side }: WheelModelProps) {
  const m = useRoverMaterials()
  const { radius: r, width } = part
  const blocks = useMemo(() => ringLayout(part.style === 'spike' ? 16 : 14, r * 0.97), [part.style, r])
  const spokes = useMemo(() => ringLayout(6, r * 0.45), [r])
  // The cylinder is rotated so its local +Y becomes world -X; flip to face the cap outwards.
  const outerY = -side * (width / 2)

  return (
    <group rotation-z={Math.PI / 2}>
      {part.style === 'mesh' ? (
        <>
          <mesh material={m.wire}>
            <cylinderGeometry args={[r, r, width, 24, 2, true]} />
          </mesh>
          {spokes.map(({ angle, x, z }) => (
            <mesh key={angle} material={m.metal} position={[x, 0, z]} rotation-y={-angle}>
              <boxGeometry args={[r * 0.9, width * 0.15, 0.03]} />
            </mesh>
          ))}
        </>
      ) : (
        <mesh castShadow material={m.rubber}>
          <cylinderGeometry args={[r * 0.92, r * 0.92, width, 32]} />
        </mesh>
      )}

      {part.style === 'tread' && (
        <Instances limit={blocks.length} material={m.rubber} castShadow>
          <boxGeometry args={[r * 0.14, width * 0.96, r * 0.2]} />
          {blocks.map(({ angle, x, z }) => (
            <Instance key={angle} position={[x, 0, z]} rotation-y={-angle} />
          ))}
        </Instances>
      )}

      {part.style === 'spike' && (
        <Instances limit={blocks.length} material={m.metal} castShadow>
          <coneGeometry args={[0.045, r * 0.22, 6]} />
          {blocks.map(({ angle, x, z }) => (
            // Cones point along +Y by default; tip them outwards along the radius.
            <Instance key={angle} position={[x, 0, z]} rotation={[0, -angle, -Math.PI / 2]} />
          ))}
        </Instances>
      )}

      <mesh material={m.accent}>
        <cylinderGeometry args={[r * 0.5, r * 0.5, width * 1.04, 20]} />
      </mesh>
      <mesh material={m.metal} position-y={outerY}>
        <cylinderGeometry args={[r * 0.2, r * 0.26, 0.06, 12]} />
      </mesh>
      <mesh material={m.glowCyan} position-y={outerY * 1.02} rotation-x={Math.PI / 2}>
        <torusGeometry args={[r * 0.36, 0.012, 6, 24]} />
      </mesh>
    </group>
  )
}
