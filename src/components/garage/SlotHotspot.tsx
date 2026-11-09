import { SceneHtml } from '../canvas/SceneHtml'
import { SLOT_LABELS, SLOT_ORDER } from '../../data/parts'
import { useLabStore } from '../../store/labStore'
import type { SlotId, Vec3 } from '../../types/vehicle'
import { PartPicker } from '../ui/PartPicker'

/** A clickable marker attached to a rover part; opens the part picker in 3D space. */
export function SlotHotspot({ slot, position }: { slot: SlotId; position: Vec3 }) {
  const isActive = useLabStore((state) => state.activeSlot === slot)
  const setActiveSlot = useLabStore((state) => state.setActiveSlot)

  return (
    <SceneHtml position={position} center zIndexRange={[40, 10]}>
      <div className={`hotspot${isActive ? ' is-active' : ''}`}>
        <button
          type="button"
          className="hotspot__dot"
          aria-expanded={isActive}
          aria-label={`Змінити: ${SLOT_LABELS[slot]}`}
          onClick={() => setActiveSlot(isActive ? null : slot)}
        >
          {SLOT_ORDER.indexOf(slot) + 1}
        </button>
        <span className="hotspot__label">{SLOT_LABELS[slot]}</span>
        {isActive && <PartPicker slot={slot} onClose={() => setActiveSlot(null)} />}
      </div>
    </SceneHtml>
  )
}
