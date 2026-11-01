import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from './scrollStore'

// ONE continuous flowing ribbon, built as a thin elliptical tube swept along an animated Catmull-Rom curve.
// Positions + analytic normals are rebuilt on the CPU every frame (~3.4k vertices): smooth, seam-free reflections.
// Coordinates are in "hero design units": the portrait arch is ~3 wide x 4 tall, centred on the origin.
const CTRL = [
  [-10.5, -3.4, -1.8], [-6.5, -2.2, 0.6], [-3.2, -3.0, 1.8], [0.8, -3.4, 1.2], [3.9, -2.0, -0.4],
  [4.5, 0.9, -1.8], [2.6, 3.1, -2.6], [-1.6, 3.4, -1.8], [-4.3, 1.3, 0.5], [-2.2, -0.6, 1.4],
  [2.4, -0.6, 2.2], [5.6, -4.6, 0.6], [3.4, -8.8, -0.8], [4.8, -12.5, -1.4]
]
const R = 12 // radial segments of the tube cross-section
const GLOW_OFFSETS = [-1.45, -1, 0, 1, 1.45]
const GLOW_ALPHA = [0, 0.55, 0, 0.55, 0]
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k) }
const easeOutCubic = k => 1 - Math.pow(1 - k, 3)

const T = new THREE.Vector3(), B0 = new THREE.Vector3(), N0 = new THREE.Vector3(), Bv = new THREE.Vector3(), Nv = new THREE.Vector3()
const Z = new THREE.Vector3(0, 0, 1)

export default function GoldRibbon({ segments = 260, physical = true }) {
  const rig = useMemo(() => {
    const N = segments
    const ctrl = CTRL.map(p => new THREE.Vector3(...p))
    const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal')
    const pts = Array.from({ length: N + 1 }, () => new THREE.Vector3())
    // tube
    const V = (N + 1) * (R + 1)
    const pos = new Float32Array(V * 3), nor = new Float32Array(V * 3)
    const idx = new Uint32Array(N * R * 6)
    let k = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < R; j++) {
      const a = i * (R + 1) + j, b = a + R + 1
      idx[k++] = a; idx[k++] = b; idx[k++] = a + 1; idx[k++] = b; idx[k++] = b + 1; idx[k++] = a + 1
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage))
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage))
    geo.setIndex(new THREE.BufferAttribute(idx, 1))
    // edge glow strips
    const C = GLOW_OFFSETS.length
    const gpos = new Float32Array((N + 1) * C * 3), gcol = new Float32Array((N + 1) * C * 4)
    const gidx = new Uint32Array(N * (C - 1) * 6)
    for (let i = 0; i <= N; i++) for (let c = 0; c < C; c++) {
      const o = (i * C + c) * 4
      gcol[o] = 1; gcol[o + 1] = 1; gcol[o + 2] = 1; gcol[o + 3] = GLOW_ALPHA[c]
    }
    k = 0
    for (let i = 0; i < N; i++) for (let c = 0; c < C - 1; c++) {
      const a = i * C + c, b = a + C
      gidx[k++] = a; gidx[k++] = b; gidx[k++] = a + 1; gidx[k++] = b; gidx[k++] = b + 1; gidx[k++] = a + 1
    }
    const glow = new THREE.BufferGeometry()
    glow.setAttribute('position', new THREE.BufferAttribute(gpos, 3).setUsage(THREE.DynamicDrawUsage))
    glow.setAttribute('color', new THREE.BufferAttribute(gcol, 4))
    glow.setIndex(new THREE.BufferAttribute(gidx, 1))
    // per-control flow parameters (deterministic)
    const flow = ctrl.map((p, i) => ({ base: p.clone(), fx: 0.55 + 0.17 * Math.sin(i * 1.7), fy: 0.5 + 0.2 * Math.cos(i * 2.3), fz: 0.45 + 0.15 * Math.sin(i * 3.1), ph: i * 1.31 }))
    return { N, ctrl, curve, pts, geo, glow, pos, nor, gpos, flow, idx, gidx, C }
  }, [segments])

  useEffect(() => () => { rig.geo.dispose(); rig.glow.dispose() }, [rig])

  useFrame(({ clock }) => {
    const { N, ctrl, curve, pts, pos, nor, gpos, flow, C } = rig
    const t = clock.elapsedTime
    const f = t * 0.5 + scrollState.y * 0.0011
    for (let i = 0; i < ctrl.length; i++) {
      const q = flow[i], a = i === 0 || i === ctrl.length - 1 ? 1.2 : 1
      ctrl[i].set(q.base.x + Math.sin(f * q.fx + q.ph) * 0.55 * a, q.base.y + Math.cos(f * q.fy + q.ph * 1.3) * 0.5 * a, q.base.z + Math.sin(f * q.fz + q.ph * 0.7) * 0.6)
    }
    for (let i = 0; i <= N; i++) curve.getPoint(i / N, pts[i])

    const reveal = easeOutCubic(clamp((t - 0.4) / 3.4, 0, 1))
    let v = 0, g = 0
    for (let i = 0; i <= N; i++) {
      const u = i / N
      T.subVectors(pts[Math.min(i + 1, N)], pts[Math.max(i - 1, 0)]).normalize()
      B0.crossVectors(T, Z)
      if (B0.lengthSq() < 1e-6) B0.set(1, 0, 0)
      B0.normalize()
      N0.crossVectors(T, B0)
      const th = 1.1 * Math.sin(u * 5.5 - f * 0.9) + u * 2.2
      const c = Math.cos(th), s = Math.sin(th)
      Bv.copy(B0).multiplyScalar(c).addScaledVector(N0, s)
      Nv.copy(N0).multiplyScalar(c).addScaledVector(B0, -s)
      let env = smooth(0, 0.035, u) * smooth(1, 0.965, u)
      if (reveal < 1) env *= smooth(reveal, reveal - 0.05, u)
      const w0 = 0.46 * (0.82 + 0.18 * Math.sin(u * 11 + f * 1.4)), h0 = 0.05
      const w = w0 * env, h = h0 * env
      const p = pts[i]
      for (let j = 0; j <= R; j++, v++) {
        const a = (j / R) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a)
        pos[v * 3] = p.x + Bv.x * w * ca + Nv.x * h * sa
        pos[v * 3 + 1] = p.y + Bv.y * w * ca + Nv.y * h * sa
        pos[v * 3 + 2] = p.z + Bv.z * w * ca + Nv.z * h * sa
        // analytic normal of an elliptical cross-section: (ca/w, sa/h) -> scaled by w0*h0 to stay finite at the tapered ends
        let nx = Bv.x * ca * h0 + Nv.x * sa * w0, ny = Bv.y * ca * h0 + Nv.y * sa * w0, nz = Bv.z * ca * h0 + Nv.z * sa * w0
        const l = Math.hypot(nx, ny, nz) || 1
        nor[v * 3] = nx / l; nor[v * 3 + 1] = ny / l; nor[v * 3 + 2] = nz / l
      }
      for (let cc = 0; cc < C; cc++, g++) {
        const off = GLOW_OFFSETS[cc] * w
        gpos[g * 3] = p.x + Bv.x * off; gpos[g * 3 + 1] = p.y + Bv.y * off; gpos[g * 3 + 2] = p.z + Bv.z * off
      }
    }
    rig.geo.attributes.position.needsUpdate = true
    rig.geo.attributes.normal.needsUpdate = true
    rig.glow.attributes.position.needsUpdate = true
    const n = Math.max(0, Math.floor(N * reveal))
    rig.geo.setDrawRange(0, n * R * 6)
    rig.glow.setDrawRange(0, n * (C - 1) * 6)
  })

  return (
    <group>
      <mesh geometry={rig.geo} frustumCulled={false}>
        {physical
          ? <meshPhysicalMaterial color="#D4AF37" metalness={1} roughness={0.2} clearcoat={0.5} clearcoatRoughness={0.2} envMapIntensity={1.9} side={THREE.DoubleSide} />
          : <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.22} envMapIntensity={1.9} side={THREE.DoubleSide} />}
      </mesh>
      <mesh geometry={rig.glow} frustumCulled={false} renderOrder={2}>
        <meshBasicMaterial color="#F5D76E" vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}
