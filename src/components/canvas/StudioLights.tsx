import { Environment, Lightformer } from '@react-three/drei'

/** Procedural studio lighting — no HDR download, so the lab works offline. */
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        castShadow
        position={[4, 8, 3]}
        intensity={2.2}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-4, 2, -3]} intensity={18} color="#2de2e6" distance={12} />
      <pointLight position={[4, 1.5, -4]} intensity={14} color="#ff7a3d" distance={12} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#2de2e6" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ff7a3d" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, 2, 6]} scale={3} />
      </Environment>
    </>
  )
}
