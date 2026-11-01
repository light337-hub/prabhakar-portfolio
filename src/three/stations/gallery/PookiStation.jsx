import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage } from './common'

// Pooki Flames: a true 3D flame (three nested lathe teardrops, additive, flickering and swaying), an ember glow on a dark
// floor and rising sparks. ILLUSTRATIVE: the live app's contents could not be read from outside, so nothing about it is depicted.
function teardrop() {
  const p = []
  for (let i = 0; i <= 28; i++) { const t = i / 28; const r = 0.55 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.65))), 0.9) * (1 - 0.55 * t); p.push(new THREE.Vector2(Math.max(r, 0.001), t * 1.8)) }
  return new THREE.LatheGeometry(p, 28)
}
const LAYERS = [['#ff4d00', 1, 0.34], ['#ff8a00', 0.72, 0.5], ['#ffd36b', 0.46, 0.8]]
export default function PookiStation({ mobile }) {
  const { outer, inner, step } = useStage('stage-pooki')
  const flames = useRef([]), sparks = useRef(), glow = useRef()
  const N = mobile ? 36 : 70
  const rig = useMemo(() => {
    const seed = Array.from({ length: N }, (_, i) => [Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, Math.abs(Math.sin(i * 78.233) * 12543.1) % 1, Math.abs(Math.sin(i * 39.346) * 9871.7) % 1])
    return { geo: teardrop(), seed, arr: new Float32Array(N * 3) }
  }, [N])
  useFrame(({ clock }, dt) => {
    const v = step(dt); if (v === null) return
    const t = clock.elapsedTime
    flames.current.forEach((f, i) => {
      if (!f) return
      const s = LAYERS[i][1]
      f.scale.set(s * (1 + 0.07 * Math.sin(t * 9 + i * 2)) * v, s * (1 + 0.09 * Math.sin(t * 7 + i) + 0.05 * Math.sin(t * 13)) * v, s * (1 + 0.07 * Math.cos(t * 8 + i)) * v)
      f.rotation.z = Math.sin(t * 2.1 + i) * 0.05; f.rotation.y = t * (0.6 + i * 0.3)
    })
    if (glow.current) glow.current.material.opacity = (0.16 + 0.05 * Math.sin(t * 6)) * v
    const a = rig.arr
    rig.seed.forEach(([sx, sy, sz], i) => { const u = (t * (0.12 + sy * 0.14) + sz) % 1; a[i * 3] = (sx - 0.5) * 0.9 * (0.3 + u) + Math.sin(t * 1.4 + sz * 9) * 0.1 * u; a[i * 3 + 1] = -0.7 + u * 2.3; a[i * 3 + 2] = (sz - 0.5) * 0.5 })
    if (sparks.current) { sparks.current.geometry.attributes.position.needsUpdate = true; sparks.current.material.opacity = 0.9 * v }
  })
  return (
    <group ref={outer}>
      <group ref={inner}>
        <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.74, 0]}><circleGeometry args={[1.2, 48]} /><meshBasicMaterial color="#ff6a00" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <group position={[0, -0.72, 0]}>
          {LAYERS.map(([c, , o], i) => (
            <mesh key={c} ref={el => (flames.current[i] = el)} geometry={rig.geo}>
              <meshBasicMaterial color={c} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
        <points ref={sparks}>
          <bufferGeometry><bufferAttribute attach="attributes-position" array={rig.arr} count={N} itemSize={3} /></bufferGeometry>
          <pointsMaterial color="#ffb347" size={0.035} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
    </group>
  )
}
