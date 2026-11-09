import { Html } from '@react-three/drei'
import { createContext, useContext, type ComponentProps, type RefObject } from 'react'

/**
 * drei's <Html> picks its DOM container from the R3F event layer, which can change
 * after the first render; the overlay then ends up empty or fails to unmount.
 * Every scene label is therefore portalled into one stable overlay element instead.
 */
export const HtmlPortalContext = createContext<RefObject<HTMLDivElement | null> | null>(null)

export function SceneHtml(props: Omit<ComponentProps<typeof Html>, 'portal'>) {
  const portal = useContext(HtmlPortalContext)
  if (!portal) throw new Error('SceneHtml must be rendered inside HtmlPortalContext')
  return <Html {...props} portal={portal as RefObject<HTMLElement>} />
}
