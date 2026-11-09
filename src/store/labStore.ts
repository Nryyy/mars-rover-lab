import { create } from 'zustand'
import type { GravityPreset } from '../data/environment'
import type { SlotId } from '../types/vehicle'

export type LabMode = 'garage' | 'testlab'

interface LabState {
  mode: LabMode
  exploded: boolean
  autoRotate: boolean
  activeSlot: SlotId | null
  gravity: GravityPreset
  /** Incremented to ask the vehicle to respawn; a counter avoids stale boolean flags. */
  resetToken: number
  setMode: (mode: LabMode) => void
  toggleExploded: () => void
  toggleAutoRotate: () => void
  setActiveSlot: (slot: SlotId | null) => void
  setGravity: (gravity: GravityPreset) => void
  requestReset: () => void
}

export const useLabStore = create<LabState>()((set) => ({
  mode: 'garage',
  exploded: false,
  autoRotate: true,
  activeSlot: null,
  gravity: 'mars',
  resetToken: 0,
  setMode: (mode) => set({ mode, activeSlot: null, exploded: false }),
  toggleExploded: () => set((state) => ({ exploded: !state.exploded })),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  setActiveSlot: (activeSlot) => set({ activeSlot }),
  setGravity: (gravity) => set({ gravity }),
  requestReset: () => set((state) => ({ resetToken: state.resetToken + 1 })),
}))
