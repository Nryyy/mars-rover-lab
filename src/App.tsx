import { KeyboardControls, Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { Experience } from './components/canvas/Experience'
import { HtmlPortalContext } from './components/canvas/SceneHtml'
import { Hud } from './components/ui/Hud'
import { DRIVE_CONTROLS } from './config/controls'

export function App() {
  const sceneOverlay = useRef<HTMLDivElement>(null)

  return (
    <KeyboardControls map={DRIVE_CONTROLS}>
      <HtmlPortalContext.Provider value={sceneOverlay}>
        <div className="app">
          <Canvas shadows dpr={[1, 2]} camera={{ position: [5.5, 3.2, 6.5], fov: 42, near: 0.1, far: 400 }}>
            <Experience />
          </Canvas>
          {/* Container for 3D-anchored DOM (drei <Html>), layered between the canvas and the HUD. */}
          <div ref={sceneOverlay} className="scene-overlay" />
          <Hud />
          <Loader />
        </div>
      </HtmlPortalContext.Provider>
    </KeyboardControls>
  )
}
