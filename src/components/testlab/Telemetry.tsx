import type { DynamicRayCastVehicleController } from '@dimforge/rapier3d-compat'
import { useFrame } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { useRef, type RefObject } from 'react'
import { SceneHtml } from '../canvas/SceneHtml'
import { GRAVITY_PRESETS } from '../../data/environment'
import type { VehicleSpec } from '../../domain/vehicleSpec'
import { toKmh } from '../../lib/units'
import { countGroundedWheels, readForwardSpeed } from '../../physics/vehicle'
import { useLabStore } from '../../store/labStore'

const UPDATE_INTERVAL = 0.1
const TIPPED_THRESHOLD = 0.35

interface TelemetryProps {
  spec: VehicleSpec
  bodyRef: RefObject<RapierRigidBody | null>
  controllerRef: RefObject<DynamicRayCastVehicleController | null>
}

/**
 * Floating telemetry panel that rides above the rover. Values are written straight
 * into the DOM on a throttled timer, so the 60 fps loop never triggers React renders.
 */
export function Telemetry({ spec, bodyRef, controllerRef }: TelemetryProps) {
  const gravity = useLabStore((state) => state.gravity)
  const speedRef = useRef<HTMLSpanElement>(null)
  const contactRef = useRef<HTMLSpanElement>(null)
  const warningRef = useRef<HTMLDivElement>(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta
    if (elapsed.current < UPDATE_INTERVAL) return
    elapsed.current = 0

    const controller = controllerRef.current
    const body = bodyRef.current
    if (!controller || !body) return

    if (speedRef.current) speedRef.current.textContent = Math.abs(toKmh(readForwardSpeed(controller))).toFixed(0)
    if (contactRef.current) contactRef.current.textContent = `${countGroundedWheels(controller)}/${spec.wheels.length}`

    const q = body.rotation()
    const upY = 1 - 2 * (q.x ** 2 + q.z ** 2)
    if (warningRef.current) warningRef.current.hidden = upY > TIPPED_THRESHOLD
  })

  return (
    <SceneHtml position={[0, spec.halfExtents[1] + 1.8, 0]} center zIndexRange={[30, 10]}>
      <div className="telemetry" aria-live="off">
        <div className="telemetry__speed">
          <span ref={speedRef}>0</span>
          <small>км/год</small>
        </div>
        <dl className="telemetry__facts">
          <div>
            <dt>Колеса</dt>
            <dd ref={contactRef}>–</dd>
          </div>
          <div>
            <dt>Маса</dt>
            <dd>{spec.mass.toFixed(1)} кг</dd>
          </div>
          <div>
            <dt>g</dt>
            <dd>{Math.abs(GRAVITY_PRESETS[gravity].value)}</dd>
          </div>
        </dl>
        <div ref={warningRef} className="telemetry__warning" hidden>
          Перекинувся! Натисніть R
        </div>
      </div>
    </SceneHtml>
  )
}
