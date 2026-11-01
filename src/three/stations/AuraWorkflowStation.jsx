import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAnchor from '../useAnchor'
import { viewport } from '../anchors'
import { glowTexture } from '../glow'
import { WF_VB, wfNodes, wfEdges } from '../../data/aura'

// Workflow station: faint route lines and light beads that travel node to node behind the HTML workflow map.
// The Chronos-2 lane sits slightly in front and the TabPFN lane slightly behind, so the two paths read as separate layers.
// Locked to "aura-workflow-map" (design width = 4). Hidden below 1100 px, where the HTML map stacks vertically.
const W = 4, [VW, VH] = WF_VB, HH = (W * VH) / VW
const toWorld = n => new THREE.Vector3((n.x / VW - 0.5) * W, HH / 2 - (n.y / VH) * HH, 0)
const laneZ = p => (p === 'a' ? 0.12 : p === 'b' ? -0.12 : 0)

export default function AuraWorkflowStation({ mobile }) {
  const group = useRef(), beads = useRef()
  const rig = useMemo(() => {
    const byId = {}; wfNodes.forEach(n => { byId[n.id] = n })
    const segs = wfEdges.map(e => {
      const a = toWorld(byId[e.from]), b = toWorld(byId[e.to]); const z = laneZ(e.path)
      a.z = z; b.z = z
      return { a, b }
    })
    const lineGeo = new THREE.BufferGeometry().setFromPoints(segs.flatMap(s => [s.a, s.b]))
    const lineMat = new THREE.LineBasicMaterial({ color: '#D4AF37', transparent: true, opacity: 0.3, depthWrite: false })
    const per = mobile ? 1 : 2
    const beadGeo = new THREE.BufferGeometry()
    beadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs.length * per * 3), 3))
    const beadMat = new THREE.PointsMaterial({ map: glowTexture(), color: '#FFE9A8', size: 0.34, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending })
    return { segs, per, lineGeo, lineMat, beadGeo, beadMat }
  }, [mobile])
  useEffect(() => () => { rig.lineGeo.dispose(); rig.lineMat.dispose(); rig.beadGeo.dispose(); rig.beadMat.dispose() }, [rig])

  useAnchor('aura-workflow-map', group, {
    unit: W, screens: 1,
    onUpdate: a => {
      const g = group.current
      if (viewport.w < 1100) { g.visible = false; return }
      g.scale.set(a.w / W, a.h / HH, a.w / W)
    }
  })
  useFrame(({ clock }) => {
    const attr = rig.beadGeo.getAttribute('position'), t = clock.elapsedTime
    let k = 0
    rig.segs.forEach((s, i) => {
      for (let j = 0; j < rig.per; j++) {
        const u = (t * 0.22 + i * 0.13 + j * 0.5) % 1
        attr.setXYZ(k++, s.a.x + (s.b.x - s.a.x) * u, s.a.y + (s.b.y - s.a.y) * u, s.a.z + (s.b.z - s.a.z) * u)
      }
    })
    attr.needsUpdate = true
  })
  return (
    <group ref={group}>
      <lineSegments geometry={rig.lineGeo} material={rig.lineMat} />
      <points ref={beads} geometry={rig.beadGeo} material={rig.beadMat} frustumCulled={false} />
    </group>
  )
}
