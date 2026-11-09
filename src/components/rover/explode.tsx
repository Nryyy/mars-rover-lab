import { useFrame } from '@react-three/fiber'
import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react'
import type { Group } from 'three'
import { damp } from '../../lib/math'
import type { Vec3 } from '../../types/vehicle'

const EXPLODE_SPEED = 4
const APPEAR_DURATION = 0.45
const APPEAR_DROP = 0.8

/** 0 = assembled, 1 = fully exploded. A ref (not state) so animation never re-renders React. */
const ExplodeContext = createContext<RefObject<number>>({ current: 0 })

export function ExplodeProvider({ exploded, children }: { exploded: boolean; children: ReactNode }) {
  const progress = useRef(0)

  useFrame((_, delta) => {
    progress.current = damp(progress.current, exploded ? 1 : 0, EXPLODE_SPEED, delta)
  })

  return <ExplodeContext.Provider value={progress}>{children}</ExplodeContext.Provider>
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

interface ExplodablePartProps {
  /** Assembled position relative to the parent. */
  position?: Vec3
  /** Displacement applied at full explosion. */
  offset: Vec3
  /**
   * Changing this value replays the drop-in animation. Used instead of a React `key`
   * so attached UI (hotspots with open pickers) is not remounted on a part swap.
   */
  replayKey?: string
  children: ReactNode
}

/** A rover part that flies apart along `offset` in exploded view and drops in when it appears. */
export function ExplodablePart({ position = [0, 0, 0], offset, replayKey, children }: ExplodablePartProps) {
  const group = useRef<Group>(null)
  const progress = useContext(ExplodeContext)
  const appear = useRef(0)
  const playedKey = useRef(replayKey)

  useFrame((_, delta) => {
    const node = group.current
    if (!node) return
    if (playedKey.current !== replayKey) {
      playedKey.current = replayKey
      appear.current = 0
    }
    appear.current = Math.min(1, appear.current + delta / APPEAR_DURATION)

    const p = progress.current
    const drop = (1 - appear.current) * APPEAR_DROP
    node.position.set(position[0] + offset[0] * p, position[1] + offset[1] * p + drop, position[2] + offset[2] * p)
    node.scale.setScalar(Math.max(0.001, easeOutBack(appear.current)))
  })

  return (
    <group ref={group} position={position} scale={0.001}>
      {children}
    </group>
  )
}
