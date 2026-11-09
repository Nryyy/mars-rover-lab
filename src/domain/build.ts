import { SLOT_ORDER, getPart, isKnownPart } from '../data/parts'
import type { Build, ResolvedBuild } from '../types/vehicle'

export function resolveBuild(build: Build): ResolvedBuild {
  return {
    chassis: getPart('chassis', build.chassis),
    wheels: getPart('wheels', build.wheels),
    sensor: getPart('sensor', build.sensor),
    tool: getPart('tool', build.tool),
  }
}

/** Replaces unknown ids (e.g. from stale localStorage) with defaults. */
export function sanitizeBuild(candidate: Partial<Build> | undefined, fallback: Build): Build {
  const result = { ...fallback }
  for (const slot of SLOT_ORDER) {
    const id = candidate?.[slot]
    if (typeof id === 'string' && isKnownPart(slot, id)) result[slot] = id
  }
  return result
}

/** Stable key that changes whenever any part changes — used to remount physics bodies. */
export function buildKey(build: Build): string {
  return SLOT_ORDER.map((slot) => build[slot]).join('|')
}
