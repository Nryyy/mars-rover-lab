import { useFrame, useThree } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, type RefObject } from 'react'
import { Quaternion, Vector3 } from 'three'

const FOLLOW_DISTANCE = 7.5
const FOLLOW_HEIGHT = 3.2
const LOOK_AHEAD = 2.5
const POSITION_LAMBDA = 3.5
const TARGET_LAMBDA = 6

/** Third-person camera that trails the rover's heading, smoothed frame-rate independently. */
export function ChaseCamera({ target }: { target: RefObject<RapierRigidBody | null> }) {
  const camera = useThree((state) => state.camera)
  const scratch = useMemo(
    () => ({
      position: new Vector3(),
      rotation: new Quaternion(),
      forward: new Vector3(),
      desired: new Vector3(),
      lookAt: new Vector3(),
      smoothedLookAt: new Vector3(),
    }),
    [],
  )

  useEffect(() => {
    camera.position.set(0, 4, 16)
    scratch.smoothedLookAt.set(0, 0.5, 0)
  }, [camera, scratch])

  useFrame((_, delta) => {
    const body = target.current
    if (!body) return
    const { position, rotation, forward, desired, lookAt, smoothedLookAt } = scratch

    const t = body.translation()
    const r = body.rotation()
    position.set(t.x, t.y, t.z)
    rotation.set(r.x, r.y, r.z, r.w)

    // Heading projected onto the ground so the camera does not flip when the rover tumbles.
    forward.set(0, 0, -1).applyQuaternion(rotation)
    forward.setY(0)
    if (forward.lengthSq() < 1e-4) forward.set(0, 0, -1)
    forward.normalize()

    desired.copy(position).addScaledVector(forward, -FOLLOW_DISTANCE)
    desired.setY(desired.y + FOLLOW_HEIGHT)
    lookAt.copy(position).addScaledVector(forward, LOOK_AHEAD)
    lookAt.setY(lookAt.y + 0.6)

    camera.position.lerp(desired, 1 - Math.exp(-POSITION_LAMBDA * delta))
    smoothedLookAt.lerp(lookAt, 1 - Math.exp(-TARGET_LAMBDA * delta))
    camera.lookAt(smoothedLookAt)
  })

  return null
}
