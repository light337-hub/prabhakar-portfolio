import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { anchorWorld } from '../../anchors'
import { glowTexture } from '../../glow'
import { GEOS, goldMat, disposeAll, smooth } from './shared'

// Certificate gallery: each certificate frame (`cert-frame-0..2`) gets layered gold-edged plates, a soft glow and two orbiting gems
// that fade in as the frame arrives (one after another as you scroll) and fade out as it leaves. Purely decorative: it never draws
// or re-creates any certificate content, the certificate images are plain HTML <img> elements.
const IDS = ['cert-frame-0', 'cert-frame-1', 'cert-frame-2']
const q = { x: 0, y: 0, w: 0, h: 0, near: false, progress: 0 }
export default function CertStation({ mobile }) {
  const groups = useRef([]), plates = useRef([]), glow = useRef([]), orb = useRef([])
  const rig = useMemo(() => {
    const edge = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1))
    const lines = IDS.flatMap(() => [0, 1].map(k => new THREE.LineBasicMaterial({ color: '#D4AF37', transparent: true, opacity: 0, depthWrite: false })))
    return { g: GEOS(), m: goldMat(), edge, lines, tex: glowTexture() }
  }, [])
  useEffect(() => () => disposeAll(rig.g, rig.m, rig.edge, rig.lines), [rig])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    IDS.forEach((id, i) => {
      const G = groups.current[i]; if (!G) return
      const a = anchorWorld(id, q, 0.6)
      const show = !!a && a.near
      if (G.visible !== show) G.visible = show
      if (!show) return
      const v = smooth(0.1, 0.34, a.progress) * (1 - smooth(0.9, 1, a.progress))
      G.position.set(a.x, a.y, 0)
      const p0 = plates.current[i * 2], p1 = plates.current[i * 2 + 1]
      p0.scale.set(a.w * 1.05, a.h * 1.07, 1); p0.position.z = -0.08
      p1.scale.set(a.w * (1.12 + 0.02 * Math.sin(t * 0.6 + i)), a.h * 1.16, 1); p1.position.z = -0.4
      rig.lines[i * 2].opacity = 0.55 * v; rig.lines[i * 2 + 1].opacity = 0.25 * v
      const gl = glow.current[i]; gl.scale.set(a.w * 1.7, a.h * 1.7, 1); gl.material.opacity = 0.28 * v
      orb.current.slice(i * 2, i * 2 + 2).forEach((m, k) => {
        if (!m) return
        const ang = t * (0.3 + k * 0.12) + i * 2 + k * 3.1
        m.position.set(Math.cos(ang) * a.w * 0.62, Math.sin(ang * 0.8) * a.h * 0.6, 0.3 + 0.3 * Math.sin(ang))
        m.rotation.x += dt * 0.5; m.rotation.y += dt * 0.4
        m.scale.setScalar(Math.max(0.0001, (0.07 + k * 0.03) * v))
      })
    })
  })
  const glowMats = useMemo(() => IDS.map(() => new THREE.SpriteMaterial({ map: rig.tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })), [rig])
  useEffect(() => () => disposeAll(glowMats), [glowMats])
  return <>{IDS.map((id, i) => <group key={id} ref={el => (groups.current[i] = el)} visible={false}>
    <sprite ref={el => (glow.current[i] = el)} material={glowMats[i]} position={[0, 0, -0.6]} />
    {[0, 1].map(k => <lineSegments key={k} ref={el => (plates.current[i * 2 + k] = el)} geometry={rig.edge} material={rig.lines[i * 2 + k]} />)}
    {(mobile ? [0] : [0, 1]).map(k => <mesh key={k} ref={el => (orb.current[i * 2 + k] = el)} geometry={rig.g[(i + k) % 4]} material={rig.m} />)}
  </group>)}</>
}
