import { RoundedBox } from '@react-three/drei'
import type { ReactNode } from 'react'
import type { ChassisPart } from '../../../types/vehicle'
import { ExplodablePart } from '../explode'
import { useRoverMaterials } from '../materials'

interface ChassisModelProps {
  part: ChassisPart
  /** Extra content (e.g. a UI hotspot) attached to the top shell so it follows it in exploded view. */
  shellAttachment?: ReactNode
}

const SIDES = [-1, 1] as const

/**
 * The body is split into frame, internals, shell and panels so the exploded view
 * reveals the inner layout: battery bank, flight computer and RTG generators.
 */
export function ChassisModel({ part, shellAttachment }: ChassisModelProps) {
  const m = useRoverMaterials()
  const [w, h, l] = part.size

  const frameH = h * 0.3
  const shellH = h * 0.45
  const bandBottom = -h / 2 + frameH
  const bandH = h / 2 - shellH - bandBottom
  const bandY = bandBottom + bandH / 2

  return (
    <group>
      <ExplodablePart replayKey={part.id} offset={[0, -0.25, 0]}>
        <mesh castShadow receiveShadow material={m.frame} position-y={-h / 2 + frameH / 2}>
          <boxGeometry args={[w, frameH, l]} />
        </mesh>
        <mesh material={m.accent} position={[0, -h / 2 + frameH * 0.5, -l / 2 - 0.03]}>
          <boxGeometry args={[w * 0.7, frameH * 0.6, 0.06]} />
        </mesh>
      </ExplodablePart>

      <ExplodablePart replayKey={part.id} offset={[0, 0.5, 0]}>
        <ChassisInternals part={part} baseY={bandBottom} bandH={bandH} />
      </ExplodablePart>

      <ExplodablePart replayKey={part.id} offset={[0, 1.8, 0]}>
        <RoundedBox
          args={[w * 0.98, shellH, l * 0.94]}
          radius={Math.min(0.08, shellH / 3)}
          smoothness={3}
          position-y={h / 2 - shellH / 2}
          material={m.body}
          castShadow
          receiveShadow
        />
        <mesh material={m.accent} position={[0, h / 2 + 0.004, 0]}>
          <boxGeometry args={[w * 0.18, 0.01, l * 0.9]} />
        </mesh>
        {shellAttachment}
      </ExplodablePart>

      {SIDES.map((side) => (
        <ExplodablePart key={side} replayKey={part.id} offset={[side * 1.1, 0.25, 0]}>
          <mesh castShadow material={m.body} position={[side * (w / 2 - 0.02), bandY, 0]}>
            <boxGeometry args={[0.04, bandH + 0.02, l * 0.9]} />
          </mesh>
          <mesh material={m.glowCyan} position={[side * (w / 2 + 0.002), bandY, l * 0.15]}>
            <boxGeometry args={[0.01, bandH * 0.25, l * 0.35]} />
          </mesh>
        </ExplodablePart>
      ))}

      <ExplodablePart replayKey={part.id} offset={[0, 0.2, -1.1]}>
        <mesh castShadow material={m.body} position={[0, bandY, -l / 2 + 0.02]}>
          <boxGeometry args={[w * 0.9, bandH + 0.02, 0.04]} />
        </mesh>
        {SIDES.map((side) => (
          <mesh key={side} material={m.glowCyan} position={[side * w * 0.3, bandY, -l / 2 - 0.005]}>
            <boxGeometry args={[w * 0.16, bandH * 0.5, 0.02]} />
          </mesh>
        ))}
      </ExplodablePart>

      <ExplodablePart replayKey={part.id} offset={[0, 0.2, 1.1]}>
        <mesh castShadow material={m.body} position={[0, bandY, l / 2 - 0.02]}>
          <boxGeometry args={[w * 0.9, bandH + 0.02, 0.04]} />
        </mesh>
        {SIDES.map((side) => (
          <mesh key={side} material={m.glowOrange} position={[side * w * 0.35, bandY, l / 2 + 0.005]}>
            <boxGeometry args={[w * 0.1, bandH * 0.4, 0.02]} />
          </mesh>
        ))}
      </ExplodablePart>

      {part.style === 'titan' ? (
        SIDES.map((side) => (
          <ExplodablePart key={side} replayKey={part.id} offset={[side * 1.7, 0.7, 0]}>
            <mesh castShadow material={m.accent} position={[side * (w / 2 + 0.04), h / 2 - shellH / 2, 0]} rotation-z={side * -0.3}>
              <boxGeometry args={[0.06, shellH * 1.1, l * 0.8]} />
            </mesh>
          </ExplodablePart>
        ))
      ) : (
        <ExplodablePart replayKey={part.id} offset={[0, 2.7, 0.4]}>
          <SolarDeck width={w * 0.9} length={l * 0.55} y={h / 2 + 0.07} z={l * 0.15} />
        </ExplodablePart>
      )}
    </group>
  )
}

function ChassisInternals({ part, baseY, bandH }: { part: ChassisPart; baseY: number; bandH: number }) {
  const m = useRoverMaterials()
  const [w, , l] = part.size
  const cellCount = part.style === 'scout' ? 3 : 4
  const cellH = bandH * 1.4
  const rtgH = bandH * 1.8
  const rtgX = part.style === 'titan' ? [-w * 0.22, w * 0.22] : part.style === 'pathfinder' ? [0] : []
  const cellSpacing = (w * 0.7) / cellCount

  return (
    <group>
      {Array.from({ length: cellCount }, (_, i) => {
        const x = -w * 0.35 + cellSpacing * (i + 0.5)
        return (
          <group key={i} position={[x, baseY + cellH / 2, -l * 0.08]}>
            <mesh castShadow material={m.frame}>
              <boxGeometry args={[cellSpacing * 0.8, cellH, l * 0.25]} />
            </mesh>
            <mesh material={m.glowCyan} position-y={cellH / 2 + 0.005}>
              <boxGeometry args={[cellSpacing * 0.5, 0.01, l * 0.2]} />
            </mesh>
          </group>
        )
      })}

      <group position={[0, baseY + bandH * 0.6, -l * 0.33]}>
        <mesh castShadow material={m.accent}>
          <boxGeometry args={[w * 0.35, bandH * 1.2, l * 0.14]} />
        </mesh>
        {[-1, 0, 1].map((i) => (
          <mesh key={i} material={m.glowCyan} position={[i * w * 0.08, bandH * 0.2, -l * 0.071]}>
            <boxGeometry args={[0.04, 0.04, 0.01]} />
          </mesh>
        ))}
      </group>

      {rtgX.map((x) => (
        <group key={x} position={[x, baseY + rtgH / 2, l * 0.3]}>
          <mesh castShadow material={m.metal}>
            <cylinderGeometry args={[bandH * 0.55, bandH * 0.55, rtgH, 20]} />
          </mesh>
          <mesh material={m.glowOrange} rotation-x={Math.PI / 2}>
            <torusGeometry args={[bandH * 0.58, 0.015, 8, 24]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} material={m.frame} rotation-y={(i * Math.PI) / 4}>
              <boxGeometry args={[bandH * 1.6, rtgH * 0.9, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function SolarDeck({ width, length, y, z }: { width: number; length: number; y: number; z: number }) {
  const m = useRoverMaterials()
  const cols = 4
  const cellW = width / cols
  return (
    <group position={[0, y, z]}>
      <mesh castShadow material={m.accent}>
        <boxGeometry args={[width + 0.04, 0.025, length + 0.04]} />
      </mesh>
      {Array.from({ length: cols }, (_, i) => (
        <mesh key={i} material={m.glass} position={[-width / 2 + cellW * (i + 0.5), 0.016, 0]}>
          <boxGeometry args={[cellW * 0.92, 0.01, length * 0.96]} />
        </mesh>
      ))}
      <mesh material={m.metal} position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
      </mesh>
    </group>
  )
}
