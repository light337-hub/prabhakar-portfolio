import { useFrame } from '@react-three/fiber'
import { anchorWorld } from './anchors'

const tmp = { x: 0, y: 0, w: 0, h: 0, near: false, progress: 0 }
// Locks a <group> to an HTML anchor: position = anchor centre, scale = anchor width / unit.
// `unit` is the design width (in local units) that should match the anchor's width.
// Returns nothing; the group is hidden while the anchor is far off-screen (saves GPU).
export default function useAnchor(id, ref, { unit = 3, depth = 0, screens = 1.5, onUpdate } = {}) {
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const a = anchorWorld(id, tmp, screens)
    const show = !!a && a.near
    if (g.visible !== show) g.visible = show
    if (!show) return
    g.position.set(a.x, a.y, depth)
    g.scale.setScalar(a.w / unit)
    if (onUpdate) onUpdate(a)
  })
}
