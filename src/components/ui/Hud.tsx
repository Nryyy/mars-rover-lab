import { GRAVITY_PRESETS, type GravityPreset } from '../../data/environment'
import { CONTROL_HINTS } from '../../config/controls'
import { SLOT_LABELS, SLOT_ORDER } from '../../data/parts'
import { useHotkey } from '../../lib/useHotkey'
import { useResolvedBuild } from '../../store/buildStore'
import { useLabStore, type LabMode } from '../../store/labStore'
import { PaintPanel } from './PaintPanel'

const MODES: { id: LabMode; label: string }[] = [
  { id: 'garage', label: 'Гараж' },
  { id: 'testlab', label: 'Полігон' },
]

/** 2D overlay for global controls; part-level UI lives in the 3D scene. */
export function Hud() {
  const mode = useLabStore((state) => state.mode)
  const setMode = useLabStore((state) => state.setMode)

  return (
    <div className="hud">
      <header className="topbar panel">
        <div className="brand">
          <span className="brand__mark" aria-hidden />
          ROVER<span>·</span>LAB
        </div>
        <nav className="segmented" aria-label="Режим">
          {MODES.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      {mode === 'garage' ? <GarageHud /> : <TestLabHud />}
    </div>
  )
}

function GarageHud() {
  const build = useResolvedBuild()
  const exploded = useLabStore((state) => state.exploded)
  const autoRotate = useLabStore((state) => state.autoRotate)
  const activeSlot = useLabStore((state) => state.activeSlot)
  const toggleExploded = useLabStore((state) => state.toggleExploded)
  const toggleAutoRotate = useLabStore((state) => state.toggleAutoRotate)
  const setActiveSlot = useLabStore((state) => state.setActiveSlot)
  const setMode = useLabStore((state) => state.setMode)

  useHotkey('KeyE', toggleExploded)
  useHotkey('Escape', () => setActiveSlot(null))

  return (
    <aside className="sidebar panel" aria-label="Конфігуратор">
      <section>
        <h2 className="section-title">Збірка</h2>
        <ul className="slot-list">
          {SLOT_ORDER.map((slot, index) => (
            <li key={slot}>
              <button
                type="button"
                className={`slot-row${activeSlot === slot ? ' is-active' : ''}`}
                onClick={() => setActiveSlot(activeSlot === slot ? null : slot)}
              >
                <span className="slot-row__index">{index + 1}</span>
                <span className="slot-row__label">{SLOT_LABELS[slot]}</span>
                <span className="slot-row__value">{build[slot].name}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="hint">Натисніть на маркер на моделі, щоб замінити деталь.</p>
      </section>

      <section className="button-row">
        <button type="button" className="button" aria-pressed={exploded} onClick={toggleExploded}>
          {exploded ? 'Зібрати' : 'Розібрати'} <kbd>E</kbd>
        </button>
        <button type="button" className="button button--ghost" aria-pressed={autoRotate} onClick={toggleAutoRotate}>
          Обертання
        </button>
      </section>

      <PaintPanel />

      <button type="button" className="button button--primary button--wide" onClick={() => setMode('testlab')}>
        Випробувати на полігоні →
      </button>
    </aside>
  )
}

function TestLabHud() {
  const gravity = useLabStore((state) => state.gravity)
  const setGravity = useLabStore((state) => state.setGravity)
  const requestReset = useLabStore((state) => state.requestReset)
  const setMode = useLabStore((state) => state.setMode)

  return (
    <aside className="sidebar panel sidebar--compact" aria-label="Полігон">
      <section>
        <h2 className="section-title">Гравітація</h2>
        <div className="segmented segmented--stacked" role="group" aria-label="Гравітація">
          {(Object.keys(GRAVITY_PRESETS) as GravityPreset[]).map((preset) => (
            <button key={preset} type="button" aria-pressed={gravity === preset} onClick={() => setGravity(preset)}>
              {GRAVITY_PRESETS[preset].label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Керування</h2>
        <dl className="controls-list">
          {CONTROL_HINTS.map(({ keys, action }) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="button-row">
        <button type="button" className="button" onClick={requestReset}>
          Респавн
        </button>
        <button type="button" className="button button--ghost" onClick={() => setMode('garage')}>
          ← До гаража
        </button>
      </section>
    </aside>
  )
}
