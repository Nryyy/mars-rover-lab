import { useMemo } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_PAINT, FINISHES } from '../data/paints'
import { DEFAULT_BUILD } from '../data/parts'
import { resolveBuild, sanitizeBuild } from '../domain/build'
import type { Build, Paint, ResolvedBuild, SlotId } from '../types/vehicle'

interface BuildState {
  build: Build
  paint: Paint
  setPart: (slot: SlotId, id: string) => void
  setPaint: (patch: Partial<Paint>) => void
  reset: () => void
}

type PersistedBuild = Pick<BuildState, 'build' | 'paint'>

const HEX_COLOR = /^#[0-9a-f]{6}$/i

function sanitizePaint(candidate: Partial<Paint> | undefined): Paint {
  return {
    body: candidate?.body && HEX_COLOR.test(candidate.body) ? candidate.body : DEFAULT_PAINT.body,
    accent: candidate?.accent && HEX_COLOR.test(candidate.accent) ? candidate.accent : DEFAULT_PAINT.accent,
    finish: candidate?.finish && candidate.finish in FINISHES ? candidate.finish : DEFAULT_PAINT.finish,
  }
}

export const useBuildStore = create<BuildState>()(
  persist(
    (set) => ({
      build: DEFAULT_BUILD,
      paint: DEFAULT_PAINT,
      setPart: (slot, id) => set((state) => ({ build: { ...state.build, [slot]: id } })),
      setPaint: (patch) => set((state) => ({ paint: { ...state.paint, ...patch } })),
      reset: () => set({ build: DEFAULT_BUILD, paint: DEFAULT_PAINT }),
    }),
    {
      name: 'rover-lab/build',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ build, paint }): PersistedBuild => ({ build, paint }),
      // Persisted data is untrusted: the catalog may have changed since it was saved.
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedBuild> | undefined
        return {
          ...current,
          build: sanitizeBuild(saved?.build, DEFAULT_BUILD),
          paint: sanitizePaint(saved?.paint),
        }
      },
    },
  ),
)

export function useResolvedBuild(): ResolvedBuild {
  const build = useBuildStore((state) => state.build)
  return useMemo(() => resolveBuild(build), [build])
}
