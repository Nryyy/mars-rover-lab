import { describe, expect, it } from 'vitest'
import { DEFAULT_BUILD, PART_CATALOG, getPart } from '../data/parts'
import { createRandom } from '../lib/random'
import { computeDriveCommand, IDLE_INPUT } from '../physics/drive'
import { buildKey, resolveBuild, sanitizeBuild } from './build'
import { computeStats } from './stats'
import { scatterRocksInRing } from './terrain'
import { buildVehicleSpec } from './vehicleSpec'

describe('catalog', () => {
  it('has unique ids per slot', () => {
    for (const parts of Object.values(PART_CATALOG)) {
      const ids = parts.map((part) => part.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('falls back to the first part for unknown ids', () => {
    expect(getPart('wheels', 'does-not-exist').id).toBe(PART_CATALOG.wheels[0]?.id)
  })
})

describe('build', () => {
  it('sanitizes stale or malformed persisted builds', () => {
    const result = sanitizeBuild({ chassis: 'titan', wheels: 'legacy-wheel' }, DEFAULT_BUILD)
    expect(result).toEqual({ ...DEFAULT_BUILD, chassis: 'titan' })
  })

  it('produces different keys for different builds', () => {
    expect(buildKey(DEFAULT_BUILD)).not.toBe(buildKey({ ...DEFAULT_BUILD, tool: 'laser' }))
  })
})

describe('stats', () => {
  it('sums mass of all parts with the wheel count of the chassis', () => {
    const build = resolveBuild({ chassis: 'scout', wheels: 'tread', sensor: 'dome', tool: 'none' })
    const stats = computeStats(build)
    expect(stats.wheelCount).toBe(4)
    expect(stats.totalMass).toBeCloseTo(6 + 4 * 0.5 + 0.4 + 0)
  })

  it('keeps ratings within 0..100', () => {
    for (const chassis of PART_CATALOG.chassis) {
      for (const tool of PART_CATALOG.tool) {
        const stats = computeStats(resolveBuild({ ...DEFAULT_BUILD, chassis: chassis.id, tool: tool.id }))
        for (const value of Object.values(stats.ratings)) {
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(100)
        }
      }
    }
  })

  it('makes heavier tools slow the rover down', () => {
    const light = computeStats(resolveBuild({ ...DEFAULT_BUILD, tool: 'none' }))
    const heavy = computeStats(resolveBuild({ ...DEFAULT_BUILD, tool: 'laser' }))
    expect(heavy.topSpeed).toBeLessThan(light.topSpeed)
  })
})

describe('vehicle spec', () => {
  it('creates a symmetric wheel layout matching the chassis', () => {
    const spec = buildVehicleSpec(resolveBuild({ ...DEFAULT_BUILD, chassis: 'titan' }))
    expect(spec.wheels).toHaveLength(6)
    const sumX = spec.wheels.reduce((sum, wheel) => sum + wheel.position[0], 0)
    expect(sumX).toBeCloseTo(0)
    expect(spec.wheels.filter((wheel) => wheel.steerFactor > 0)).toHaveLength(2)
  })

  it('places the wheels below the chassis', () => {
    const spec = buildVehicleSpec(resolveBuild(DEFAULT_BUILD))
    expect(spec.rideHeight).toBeGreaterThan(spec.halfExtents[1])
  })
})

describe('drive command', () => {
  const spec = buildVehicleSpec(resolveBuild(DEFAULT_BUILD))

  it('applies full throttle forward and light coast braking when idle', () => {
    expect(computeDriveCommand({ ...IDLE_INPUT, forward: true }, 0, spec).engineForce).toBe(spec.engineForcePerWheel)
    const idle = computeDriveCommand(IDLE_INPUT, 3, spec)
    expect(idle.engineForce).toBe(0)
    expect(idle.brake).toBeGreaterThan(0)
  })

  it('cuts the engine at top speed', () => {
    expect(computeDriveCommand({ ...IDLE_INPUT, forward: true }, spec.maxSpeed + 1, spec).engineForce).toBe(0)
  })

  it('steers left with positive angle and less at speed', () => {
    const slow = computeDriveCommand({ ...IDLE_INPUT, left: true }, 0, spec).steering
    const fast = computeDriveCommand({ ...IDLE_INPUT, left: true }, spec.maxSpeed, spec).steering
    expect(slow).toBeCloseTo(spec.maxSteer)
    expect(fast).toBeGreaterThan(0)
    expect(fast).toBeLessThan(slow)
  })
})

describe('terrain', () => {
  it('keeps the spawn area clear of rocks', () => {
    const rocks = scatterRocksInRing({ seed: 1, count: 200, innerRadius: 20, outerRadius: 50, minSize: 0.5, maxSize: 1 })
    for (const { position } of rocks) {
      const distance = Math.hypot(position[0], position[2])
      expect(distance).toBeGreaterThanOrEqual(20)
      expect(distance).toBeLessThanOrEqual(50)
    }
  })
})

describe('random', () => {
  it('is deterministic for a given seed', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})
