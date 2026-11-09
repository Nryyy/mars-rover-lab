import { createContext, useContext, useEffect, useLayoutEffect, useMemo, type ReactNode } from 'react'
import { MeshStandardMaterial } from 'three'
import { FINISHES } from '../../data/paints'
import { useBuildStore } from '../../store/buildStore'
import type { Paint } from '../../types/vehicle'

export interface RoverMaterials {
  body: MeshStandardMaterial
  accent: MeshStandardMaterial
  frame: MeshStandardMaterial
  rubber: MeshStandardMaterial
  metal: MeshStandardMaterial
  glass: MeshStandardMaterial
  glowCyan: MeshStandardMaterial
  glowOrange: MeshStandardMaterial
  wire: MeshStandardMaterial
}

function createMaterials(): RoverMaterials {
  return {
    body: new MeshStandardMaterial(),
    accent: new MeshStandardMaterial(),
    frame: new MeshStandardMaterial({ color: '#2a2f38', metalness: 0.6, roughness: 0.5 }),
    rubber: new MeshStandardMaterial({ color: '#1b1c1f', metalness: 0, roughness: 0.95 }),
    metal: new MeshStandardMaterial({ color: '#9aa3ad', metalness: 0.95, roughness: 0.25 }),
    glass: new MeshStandardMaterial({ color: '#0c1a24', metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.85 }),
    glowCyan: new MeshStandardMaterial({ color: '#0b3b40', emissive: '#2de2e6', emissiveIntensity: 2.2, toneMapped: false }),
    glowOrange: new MeshStandardMaterial({ color: '#40200b', emissive: '#ff7a3d', emissiveIntensity: 2.4, toneMapped: false }),
    wire: new MeshStandardMaterial({ color: '#b8c2cc', metalness: 0.9, roughness: 0.3, wireframe: true }),
  }
}

function applyPaint({ body, accent }: RoverMaterials, paint: Paint): void {
  const finish = FINISHES[paint.finish]
  body.color.set(paint.body)
  body.metalness = finish.metalness
  body.roughness = finish.roughness
  accent.color.set(paint.accent)
  accent.metalness = Math.min(1, finish.metalness + 0.1)
  accent.roughness = finish.roughness
}

const RoverMaterialsContext = createContext<RoverMaterials | null>(null)

/**
 * Owns one shared set of materials for every rover mesh. Paint changes mutate
 * the existing materials instead of recreating them, so no shader recompiles happen.
 */
export function RoverMaterialsProvider({ children }: { children: ReactNode }) {
  const paint = useBuildStore((state) => state.paint)
  const materials = useMemo(() => createMaterials(), [])

  useLayoutEffect(() => applyPaint(materials, paint), [paint, materials])

  useEffect(
    () => () => {
      for (const material of Object.values(materials)) material.dispose()
    },
    [materials],
  )

  return <RoverMaterialsContext.Provider value={materials}>{children}</RoverMaterialsContext.Provider>
}

export function useRoverMaterials(): RoverMaterials {
  const materials = useContext(RoverMaterialsContext)
  if (!materials) throw new Error('useRoverMaterials must be used inside <RoverMaterialsProvider>')
  return materials
}
