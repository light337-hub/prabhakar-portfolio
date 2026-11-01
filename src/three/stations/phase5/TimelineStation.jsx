import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { anchorWorld, viewport } from '../../anchors'
import { glowTexture } from '../../glow'
import { GEOS, goldMat, disposeAll, smooth } from './shared'

// Career timeline: a metallic gold rod with soft glow and travelling light beads behind the HTML line (`journey-rail`),
// plus a faceted gold gem behind each milestone node (`tl-node-0..2`). World units are read straight from the DOM anchors,
// so everything scrolls with the page. Gems brighten as the reading line (58% of the viewport) passes their node.
const NODES = ['tl-node-0', 'tl-node-1', 'tl-node-2']
const r = { x: 0, y: 0, w: 0, h: 0, near: false, progress: 0 }, n = { x: 0, y: 0, w: 0, h: 0, near: false, progress: 0 }
export default function TimelineStation({ mobile }) {
  const root = useRef(), rod = useRef(), halo = useRef(), beads = useRef([]), gems = useRef([]), side = useRef([])
  const rig = useMemo(() => {
    const g = GEOS()
    return { g, m: goldMat(), gem: new THREE.MeshStandardMaterial({ color: '#F5D76E', metalness: 1, roughness: 0.22, flatShading: true, envMapIntensity: 2, emissive: '#B8902A', emissiveIntensity: 0.1 }), cyl: new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), tex: glowTexture() }
  }, [])
  useEffect(() => () => { disposeAll(rig.g, rig.m, rig.gem, rig.cyl) }, [rig])
  const BEADS = mobile ? 2 : 3
  useFrame(({ clock }, dt) => {
    const R = root.current; if (!R) return
    const a = anchorWorld('journey-rail', r, 1.2)
    const show = !!a && a.near
    if (R.visible !== show) R.visible = show
    if (!show) return
    const t = clock.elapsedTime
    const rad = Math.max(0.012, a.w * 0.5)
    rod.current.position.set(a.x, a.y, 0.05); rod.current.scale.set(rad, a.h, rad)
    halo.current.position.set(a.x, a.y, 0.02); halo.current.scale.set(rad * 7, a.h, rad * 7)
    beads.current.forEach((b, i) => { if (!b) return; const k = (t * 0.07 + i / BEADS) % 1; b.position.set(a.x, a.y + a.h / 2 - k * a.h, 0.12); b.scale.setScalar(0.5 + 0.12 * Math.sin(t * 2 + i)) })
    const mid = -(viewport.h * 0.58 - viewport.h / 2) * viewport.wpp
    NODES.forEach((id, i) => {
      const g = gems.current[i]; const q = anchorWorld(id, n, 1.2); if (!g) return
      if (!q) { g.visible = false; return }
      g.visible = true
      const reached = smooth(-0.25, 0.25, q.y - mid)
      g.position.set(q.x, q.y, 0.2); g.scale.setScalar(q.w * (0.34 + 0.1 * reached))
      g.rotation.y += dt * (0.5 + reached * 0.5); g.rotation.x += dt * 0.2
      g.material.emissiveIntensity = 0.1 + reached * 0.9
    })
    side.current.forEach((m, i) => { if (!m) return; m.rotation.x += dt * 0.3; m.rotation.y += dt * 0.22; m.position.set(a.x + (i % 2 ? 1 : -1) * (0.55 + 0.15 * i), a.y + a.h * (0.3 - i * 0.3) + Math.sin(t * 0.6 + i) * 0.12, -0.2) })
  })
  const nodeMats = useMemo(() => NODES.map(() => rig.gem.clone()), [rig])
  useEffect(() => () => disposeAll(nodeMats), [nodeMats])
  return <group ref={root} visible={false}>
    <mesh ref={rod} geometry={rig.cyl} material={rig.m} />
    <mesh ref={halo} geometry={rig.cyl}><meshBasicMaterial color="#D4AF37" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
    {Array.from({ length: BEADS }, (_, i) => <sprite key={i} ref={el => (beads.current[i] = el)}><spriteMaterial map={rig.tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.95} /></sprite>)}
    {NODES.map((id, i) => <mesh key={id} ref={el => (gems.current[i] = el)} geometry={rig.g[0]} material={nodeMats[i]} />)}
    {!mobile && [0, 1, 2].map(i => <mesh key={i} ref={el => (side.current[i] = el)} geometry={rig.g[(i + 1) % 4]} material={rig.m} scale={0.1 - i * 0.015} />)}
  </group>
}
