import { Suspense, lazy } from 'react'
import { useLabStore } from '../../store/labStore'
import { GarageScene } from '../garage/GarageScene'
import { RoverMaterialsProvider } from '../rover/materials'

// Rapier ships a ~2 MB WASM module, so the physics scene is a separate chunk loaded on demand.
const TestLabScene = lazy(() => import('../testlab/TestLabScene').then((module) => ({ default: module.TestLabScene })))

export function Experience() {
  const mode = useLabStore((state) => state.mode)

  return (
    <RoverMaterialsProvider>
      {mode === 'garage' ? (
        <GarageScene />
      ) : (
        <Suspense fallback={null}>
          <TestLabScene />
        </Suspense>
      )}
    </RoverMaterialsProvider>
  )
}
