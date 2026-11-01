import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useAnchor from '../../useAnchor'
import { GEOS, tintMat, disposeAll } from './shared'

// Tools I Work With: floating faceted shapes drifting down both margins of the tall `tools-stage` anchor, tinted with the
// same controlled accent colours as the seven tool groups (gold, orange, yellow, cyan, violet, silver, green). Decorative.
const ACCENTS = ['#D4AF37', '#F08A4B', '#F2C811', '#4FC3F7', '#A78BFA', '#C9D1D9', '#3DDC97']
const UNIT = 4
export default function ToolsStation({ mobile }) {
  const outer = useRef(), size = useRef({ H: 8 }), meshes = useRef([])
  const N = mobile ? 7 : 14
  const rig = useMemo(() => ({ g: GEOS(), m: ACCENTS.map(c => tintMat(c, 0.22)) }), [])
  useEffect(() => () => disposeAll(rig.g, rig.m), [rig])
  useAnchor('tools-stage', outer, { unit: UNIT, screens: 1.2, onUpdate: a => { size.current.H = a.h / (a.w / UNIT) } })
  useFrame(({ clock }, dt) => {
    const o = outer.current; if (!o || !o.visible) return
    const t = clock.elapsedTime, H = size.current.H
    meshes.current.forEach((m, i) => {
      if (!m) return
      const side = i % 2 ? 1 : -1, k = i / Math.max(1, N - 1)
      m.position.set(side * (2.12 + 0.12 * Math.sin(i * 2.1)), (0.5 - k) * H * 0.94 + Math.sin(t * 0.5 + i * 1.3) * 0.18, 0.25 + 0.5 * Math.sin(i * 1.9))
      m.rotation.x += dt * (0.18 + (i % 3) * 0.06); m.rotation.y += dt * (0.26 - (i % 4) * 0.04)
    })
  })
  return <group ref={outer}>{Array.from({ length: N }, (_, i) => <mesh key={i} ref={el => (meshes.current[i] = el)} geometry={rig.g[i % 4]} material={rig.m[i % 7]} scale={0.1 + (i % 3) * 0.035} />)}</group>
}
