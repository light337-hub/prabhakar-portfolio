// DOM -> world anchors: the foundation for connected scenes.
// Any HTML element can register as an anchor. Scene "stations" read its on-screen rectangle every frame
// and convert it to world units on the z=0 plane of the reference camera (see constants.js), so 3D objects
// stay locked to the page layout while the live camera adds intro, parallax and scroll movement.
import { REF } from './constants'

const registry = new Map()
export const viewport = { w: 1280, h: 800, wpp: 0.008 }

function updateViewport() {
  if (typeof window === 'undefined') return
  viewport.w = window.innerWidth
  viewport.h = window.innerHeight
  viewport.wpp = (2 * Math.tan((REF.fov * Math.PI) / 360) * REF.dist) / viewport.h
}
updateViewport()

function measureOne(e) {
  const r = e.el.getBoundingClientRect()
  e.cx = r.left + r.width / 2; e.cy = r.top + r.height / 2
  e.w = r.width; e.h = r.height; e.top = r.top; e.bottom = r.bottom
}

export function registerAnchor(id, el) {
  const entry = { el, cx: 0, cy: 0, w: 0, h: 0, top: 0, bottom: 0 }
  registry.set(id, entry)
  updateViewport(); measureOne(entry)
  return () => { if (registry.get(id) === entry) registry.delete(id) }
}

export function measureAnchors() {
  updateViewport()
  registry.forEach(measureOne)
}

const scratch = { x: 0, y: 0, w: 0, h: 0, near: false, progress: 0 }
// Returns world-space centre/size of an anchor (or null). `near` is true while within `screens` viewports of the screen.
export function anchorWorld(id, out = scratch, screens = 1.5) {
  const e = registry.get(id)
  if (!e || e.w === 0) return null
  const { wpp, w, h } = viewport
  out.x = (e.cx - w / 2) * wpp
  out.y = -(e.cy - h / 2) * wpp
  out.w = e.w * wpp
  out.h = e.h * wpp
  out.near = e.bottom > -h * screens && e.top < h * (1 + screens)
  out.progress = (h - e.top) / (h + e.h) // 0 = just entering from below, 1 = just left above
  return out
}
