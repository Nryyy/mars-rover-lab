export type Vec3 = [number, number, number]

export type SlotId = 'chassis' | 'wheels' | 'sensor' | 'tool'

interface BasePart {
  id: string
  name: string
  description: string
  /** Mass contribution in kilograms (simulation units). */
  mass: number
}

export interface ChassisPart extends BasePart {
  slot: 'chassis'
  style: 'scout' | 'pathfinder' | 'titan'
  /** Body dimensions: width (x), height (y), length (z). */
  size: Vec3
  wheelPairs: 2 | 3
  /** Total engine force distributed between all wheels. */
  enginePower: number
  armor: number
}

export interface WheelPart extends BasePart {
  slot: 'wheels'
  style: 'tread' | 'mesh' | 'spike'
  radius: number
  width: number
  frictionSlip: number
  suspensionStiffness: number
  suspensionTravel: number
}

export interface SensorPart extends BasePart {
  slot: 'sensor'
  style: 'mast' | 'dome' | 'lidar'
  scanRange: number
}

export interface ToolPart extends BasePart {
  slot: 'tool'
  style: 'none' | 'arm' | 'drill' | 'laser'
  utility: number
}

export interface PartBySlot {
  chassis: ChassisPart
  wheels: WheelPart
  sensor: SensorPart
  tool: ToolPart
}

export type Part = PartBySlot[SlotId]

/** A build stores only part ids, so it is serialisable and stable across catalog edits. */
export type Build = Record<SlotId, string>

/** A build with every id resolved into its catalog entry. */
export type ResolvedBuild = { [K in SlotId]: PartBySlot[K] }

export type Finish = 'matte' | 'satin' | 'metal'

export interface Paint {
  body: string
  accent: string
  finish: Finish
}
