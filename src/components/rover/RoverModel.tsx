import type { ReactNode } from 'react'
import type { VehicleSpec } from '../../domain/vehicleSpec'
import type { ResolvedBuild, SlotId, Vec3 } from '../../types/vehicle'
import { ExplodablePart, ExplodeProvider } from './explode'
import { EXPLODE_OFFSETS, SENSOR_HEIGHT, getMounts, toolHotspot } from './layout'
import { ChassisModel } from './parts/ChassisModel'
import { SensorModel } from './parts/SensorModel'
import { ToolModel } from './parts/ToolModel'
import { WheelModel } from './parts/WheelModel'

export type HotspotRenderer = (slot: SlotId, position: Vec3) => ReactNode

interface RoverModelProps {
  build: ResolvedBuild
  spec: VehicleSpec
  exploded?: boolean
  /** Static wheels for the garage; the test lab renders physics-driven wheels itself. */
  showWheels?: boolean
  /** Optional UI anchored to each slot — keeps the model independent from the garage UI. */
  renderHotspot?: HotspotRenderer
}

/** Visual assembly of the rover in chassis space (origin = chassis centre, nose = -Z). */
export function RoverModel({ build, spec, exploded = false, showWheels = true, renderHotspot }: RoverModelProps) {
  const { chassis, wheels, sensor, tool } = build
  const mounts = getMounts(chassis)
  const [, height] = chassis.size

  return (
    <ExplodeProvider exploded={exploded}>
      {/* Models are keyed by part id; hotspots are not, so an open picker survives a part swap. */}
      <ChassisModel part={chassis} shellAttachment={renderHotspot?.('chassis', [0, height / 2 + 0.15, 0.2])} />

      {showWheels &&
        spec.wheels.map((wheel, index) => {
          const [x, y, z] = wheel.position
          return (
            <ExplodablePart
              key={index}
              replayKey={`${wheels.id}-${chassis.id}`}
              position={[x, y - spec.suspension.restLength, z]}
              offset={EXPLODE_OFFSETS.wheel(wheel.side)}
            >
              <WheelModel key={wheels.id} part={wheels} side={wheel.side} />
              {index === 0 && renderHotspot?.('wheels', [wheel.side * (wheel.width / 2 + 0.1), wheel.radius * 0.6, 0])}
            </ExplodablePart>
          )
        })}

      <ExplodablePart replayKey={`${sensor.id}-${chassis.id}`} position={mounts.sensor} offset={EXPLODE_OFFSETS.sensor}>
        <SensorModel key={sensor.id} part={sensor} />
        {renderHotspot?.('sensor', [0, SENSOR_HEIGHT[sensor.style] + 0.1, 0])}
      </ExplodablePart>

      <ExplodablePart replayKey={`${tool.id}-${chassis.id}`} position={mounts.tool} offset={EXPLODE_OFFSETS.tool}>
        <ToolModel key={tool.id} part={tool} roofHeight={mounts.toolRoofHeight} />
        {renderHotspot?.('tool', toolHotspot(tool.style, mounts.toolRoofHeight))}
      </ExplodablePart>
    </ExplodeProvider>
  )
}
