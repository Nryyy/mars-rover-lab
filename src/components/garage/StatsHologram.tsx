import { useMemo } from 'react'
import { SceneHtml } from '../canvas/SceneHtml'
import { RATING_LABELS, computeStats, type RatingKey } from '../../domain/stats'
import { toKmh } from '../../lib/units'
import type { ResolvedBuild } from '../../types/vehicle'

const RATING_ORDER: RatingKey[] = ['speed', 'offroad', 'grip', 'sensors', 'armor', 'utility']

/** Holographic spec sheet rendered as DOM but placed (and perspective-transformed) in the 3D scene. */
export function StatsHologram({ build }: { build: ResolvedBuild }) {
  const stats = useMemo(() => computeStats(build), [build])

  return (
    <SceneHtml transform distanceFactor={4} position={[2.5, 2.1, -3.6]} rotation-y={0.25} zIndexRange={[5, 0]}>
      <section className="hologram" aria-label="Характеристики марсохода">
        <header className="hologram__header">
          <span className="hologram__eyebrow">Специфікація</span>
          <h2>{build.chassis.name}</h2>
        </header>
        <dl className="hologram__facts">
          <div>
            <dt>Маса</dt>
            <dd>{stats.totalMass.toFixed(1)} кг</dd>
          </div>
          <div>
            <dt>Потужність</dt>
            <dd>{stats.power} Н</dd>
          </div>
          <div>
            <dt>Макс. швидкість</dt>
            <dd>{toKmh(stats.topSpeed).toFixed(0)} км/год</dd>
          </div>
          <div>
            <dt>Колеса</dt>
            <dd>{stats.wheelCount}</dd>
          </div>
        </dl>
        <ul className="hologram__ratings">
          {RATING_ORDER.map((key) => (
            <li key={key}>
              <span>{RATING_LABELS[key]}</span>
              <span className="bar" role="meter" aria-valuenow={stats.ratings[key]} aria-valuemin={0} aria-valuemax={100}>
                <span className="bar__fill" style={{ width: `${stats.ratings[key]}%` }} />
              </span>
              <span className="hologram__value">{stats.ratings[key]}</span>
            </li>
          ))}
        </ul>
      </section>
    </SceneHtml>
  )
}
