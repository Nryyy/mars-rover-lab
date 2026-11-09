import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { createRandom } from './random'

/** Procedural regolith texture: dusty base with darker pebbles, generated once on a canvas. */
export function createRegolithTexture(size = 512, seed = 7): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas context is not available')

  const random = createRandom(seed)
  context.fillStyle = '#b5592f'
  context.fillRect(0, 0, size, size)

  for (let i = 0; i < 2600; i++) {
    const shade = Math.floor(random() * 60)
    context.fillStyle = `rgba(${90 + shade}, ${40 + shade / 2}, ${20 + shade / 3}, ${0.15 + random() * 0.35})`
    const radius = random() * 3 + 0.5
    context.beginPath()
    context.arc(random() * size, random() * size, radius, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
