import type { ChassisPart, SensorPart, ToolPart, Vec3 } from '../../types/vehicle'

/** Attachment points on the chassis, in chassis-local space (nose points to -Z). */
export function getMounts(chassis: ChassisPart): { sensor: Vec3; tool: Vec3; toolRoofHeight: number } {
  const [, height, length] = chassis.size
  const toolY = -height * 0.05
  return {
    sensor: [0, height / 2, -length * 0.22],
    tool: [0, toolY, -length / 2],
    toolRoofHeight: height / 2 - toolY,
  }
}

export const SENSOR_HEIGHT: Record<SensorPart['style'], number> = {
  mast: 1.15,
  dome: 0.45,
  lidar: 0.55,
}

export function toolHotspot(style: ToolPart['style'], roofHeight: number): Vec3 {
  switch (style) {
    case 'none':
      return [0, 0.1, -0.15]
    case 'arm':
      return [0.25, 0.35, -0.9]
    case 'drill':
      return [0, 0.3, -0.3]
    case 'laser':
      return [0, roofHeight + 0.35, -0.6]
  }
}

/** Exploded-view displacement for each slot. */
export const EXPLODE_OFFSETS = {
  sensor: [0, 1.4, -0.2] as Vec3,
  tool: [0, 0.35, -1.5] as Vec3,
  wheel: (side: -1 | 1): Vec3 => [side * 1.2, -0.25, 0],
}
