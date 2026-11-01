import { useRef } from 'react'
import useAnchor from '../../useAnchor'
import { pointerState } from '../../scrollStore'

// Shared helper for Phase 4 project stations. Each station locks one <group> to an HTML stage anchor (design width = UNIT).
// step(dt) runs the entrance (starts when the stage scrolls into view), the exit (when it leaves at the top) and the
// pointer parallax; it returns visibility 0..1, or null when the stage is far off-screen (so the station skips all work).
export const UNIT = 4
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
export const mod = (x, m) => ((x % m) + m) % m

export function useStage(id, { screens = 1.3 } = {}) {
  const outer = useRef(), inner = useRef()
  const st = useRef({ p: 0, enter: 0, trig: false, v: 0 })
  useAnchor(id, outer, { unit: UNIT, screens, onUpdate: a => { st.current.p = a.progress } })
  const step = dt => {
    const o = outer.current, g = inner.current, s = st.current
    if (!o || !g || !o.visible) return null
    if (!s.trig && s.p > 0.16) s.trig = true
    s.enter += ((s.trig ? 1 : 0) - s.enter) * (1 - Math.exp(-dt * 1.8))
    s.v = s.enter * (1 - smooth(0.86, 1, s.p))
    const e = 1 - s.enter
    const k = 1 - Math.exp(-dt * 3)
    g.rotation.y += (pointerState.x * 0.22 - e * 1.1 - g.rotation.y) * k
    g.rotation.x += (-pointerState.y * 0.12 + e * 0.3 - g.rotation.x) * k
    g.scale.setScalar(0.12 + 0.88 * s.v)
    return s.v
  }
  return { outer, inner, step }
}

// Thin outline for decorative floating panels (never carries text).
export function outline(THREE, w, h, color, opacity = 0.7) {
  const geo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h))
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
}
