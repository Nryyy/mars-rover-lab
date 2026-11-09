import { SLOT_LABELS, listParts } from '../../data/parts'
import { useBuildStore } from '../../store/buildStore'
import type { Part, SlotId } from '../../types/vehicle'

interface PartPickerProps {
  slot: SlotId
  onClose: () => void
}

function partHighlight(part: Part): string {
  switch (part.slot) {
    case 'chassis':
      return `${part.wheelPairs * 2} колеса · ${part.enginePower} Н`
    case 'wheels':
      return `зчеплення ${part.frictionSlip.toFixed(1)} · хід ${part.suspensionTravel.toFixed(2)} м`
    case 'sensor':
      return `дальність ${part.scanRange} м`
    case 'tool':
      return `корисність ${part.utility}`
  }
}

export function PartPicker({ slot, onClose }: PartPickerProps) {
  const selectedId = useBuildStore((state) => state.build[slot])
  const setPart = useBuildStore((state) => state.setPart)
  const parts = listParts(slot)

  return (
    <div className="picker" role="dialog" aria-label={`Вибір: ${SLOT_LABELS[slot]}`}>
      <header className="picker__header">
        <h3>{SLOT_LABELS[slot]}</h3>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Закрити">
          ×
        </button>
      </header>
      <ul className="picker__list">
        {parts.map((part) => (
          <li key={part.id}>
            <button
              type="button"
              className={`picker__option${part.id === selectedId ? ' is-selected' : ''}`}
              aria-pressed={part.id === selectedId}
              onClick={() => setPart(slot, part.id)}
            >
              <span className="picker__name">{part.name}</span>
              <span className="picker__desc">{part.description}</span>
              <span className="picker__meta">
                {part.mass.toFixed(1)} кг · {partHighlight(part)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
