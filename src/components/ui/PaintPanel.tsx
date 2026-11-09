import { FINISHES, PAINT_SWATCHES } from '../../data/paints'
import { useBuildStore } from '../../store/buildStore'
import type { Finish, Paint } from '../../types/vehicle'

type ColorChannel = 'body' | 'accent'

const CHANNEL_LABELS: Record<ColorChannel, string> = {
  body: 'Корпус',
  accent: 'Акцент',
}

export function PaintPanel() {
  const paint = useBuildStore((state) => state.paint)
  const setPaint = useBuildStore((state) => state.setPaint)
  const reset = useBuildStore((state) => state.reset)

  return (
    <section>
      <h2 className="section-title">Фарбування</h2>
      {(Object.keys(CHANNEL_LABELS) as ColorChannel[]).map((channel) => (
        <ColorRow key={channel} channel={channel} paint={paint} onChange={(color) => setPaint({ [channel]: color })} />
      ))}
      <div className="segmented" role="group" aria-label="Покриття">
        {(Object.keys(FINISHES) as Finish[]).map((finish) => (
          <button key={finish} type="button" aria-pressed={paint.finish === finish} onClick={() => setPaint({ finish })}>
            {FINISHES[finish].label}
          </button>
        ))}
      </div>
      <button type="button" className="link-button" onClick={reset}>
        Скинути збірку
      </button>
    </section>
  )
}

function ColorRow({ channel, paint, onChange }: { channel: ColorChannel; paint: Paint; onChange: (color: string) => void }) {
  const current = paint[channel]
  return (
    <div className="color-row">
      <span className="color-row__label">{CHANNEL_LABELS[channel]}</span>
      <div className="swatches" role="radiogroup" aria-label={CHANNEL_LABELS[channel]}>
        {PAINT_SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={current === color}
            aria-label={color}
            className="swatch"
            style={{ background: color }}
            onClick={() => onChange(color)}
          />
        ))}
        <label className="swatch swatch--custom" title="Свій колір">
          <input type="color" value={current} onChange={(event) => onChange(event.target.value)} aria-label="Свій колір" />
        </label>
      </div>
    </div>
  )
}
