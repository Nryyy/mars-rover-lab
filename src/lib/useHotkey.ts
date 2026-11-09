import { useEffect, useRef } from 'react'

/** Calls `handler` on keydown of `code` (KeyboardEvent.code), ignoring typing in form fields. */
export function useHotkey(code: string, handler: () => void, enabled = true): void {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== code || event.repeat) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return
      handlerRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [code, enabled])
}
