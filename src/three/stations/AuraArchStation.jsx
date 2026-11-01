import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAnchor from '../useAnchor'
import { viewport } from '../anchors'
import { glowTexture } from '../glow'
import { ARCH_VB, archNodes } from '../../data/aura'

// AURA architecture station: stacked, gold-edged layer plates and glowing node lights behind the HTML map.
// Locked to the HTML anchor "aura-arch" (design width = 4 units; height follows the anchor's aspect ratio).
// Desktop layout only: below 1100 px the HTML map becomes a vertical stack, so this station hides itself.
const W = 4, [VW, VH] = ARCH_VB, HH = (W * VH) / VW
const ROWS = [58, 182, 318, 462, 606]

export default function AuraArchStation({ mobile }) {
  const group = useRef(), plates = useRef(), glows = useRef()
  const { edges, glowPos, glowMat } = useMemo(() => {
    const rows = mobile ? ROWS.filter((_, i) => i % 2 === 0) : ROWS
    const geo = new THREE.PlaneGeometry(W * 0.94, 0.5)
    const edgeGeo = new THREE.EdgesGeometry(geo)
    const mat = new THREE.LineBasicMaterial({ color: '#D4AF37', transparent: true, opacity: 0.38, depthWrite: false })
    const list = rows.map((y, i) => {
      const m = new THREE.LineSegments(edgeGeo, mat)
      m.position.set(0, HH / 2 - (y / VH) * HH, -0.35 - i * 0.16)
      return m
    })
    const pos = new Float32Array(archNodes.length * 3)
    archNodes.forEach((n, i) => { pos.set([(n.x / VW - 0.5) * W, HH / 2 - (n.y / VH) * HH, -0.2], i * 3) })
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const gm = new THREE.PointsMaterial({ map: glowTexture(), color: '#F5D76E', size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })
    return { edges: { list, geo, edgeGeo, mat }, glowPos: gg, glowMat: gm }
  }, [mobile])
  useEffect(() => () => { edges.geo.dispose(); edges.edgeGeo.dispose(); edges.mat.dispose(); glowPos.dispose(); glowMat.dispose() }, [edges, glowPos, glowMat])

  useAnchor('aura-arch', group, {
    unit: W, screens: 1,
    onUpdate: a => {
      const g = group.current
      if (viewport.w < 1100) { g.visible = false; return }
      g.scale.set(a.w / W, a.h / HH, a.w / W)
    }
  })
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (plates.current) plates.current.position.z = Math.sin(t * 0.35) * 0.05
    if (glows.current) glows.current.material.opacity = 0.45 + Math.sin(t * 1.1) * 0.12
  })
  return (
    <group ref={group}>
      <group ref={plates}>{edges.list.map((m, i) => <primitive key={i} object={m} />)}</group>
      <points ref={glows} geometry={glowPos} material={glowMat} />
    </group>
  )
}
