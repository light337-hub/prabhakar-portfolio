import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage, outline } from './common'

// Power BI: three floating dashboard panels (animated bars, drawing line chart, rotating donut) with data points flowing
// between them. ILLUSTRATIVE composition using the Power BI-style palette; it is not a screenshot and shows no real data.
const BARS = 7
export default function PowerBiStation({ mobile }) {
  const { outer, inner, step } = useStage('stage-powerbi')
  const bars = useRef([]), donut = useRef(), pts = useRef()
  const N = mobile ? 20 : 40
  const rig = useMemo(() => {
    const lp = [0, 0.35, 0.18, 0.5, 0.3, 0.62, 0.45, 0.8, 0.6, 0.95, 0.85, 1.1].map((y, i) => new THREE.Vector3(-0.55 + i * 0.1, y * 0.5 - 0.2, 0.02))
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: '#01B8AA' }))
    const flow = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.2, -0.1, 0.3), new THREE.Vector3(-0.5, 0.75, -0.1), new THREE.Vector3(0.5, 0.8, -0.3), new THREE.Vector3(1.25, 0.1, 0.35)])
    const arr = new Float32Array(N * 3)
    return { line, flow, arr, lc: lp.length, fa: outline(THREE, 1.15, 1.0, '#F2C811', 0.55), fb: outline(THREE, 1.3, 0.8, '#01B8AA', 0.55), fc: outline(THREE, 0.95, 0.95, '#8aa0b0', 0.5) }
  }, [N])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }, dt) => {
    const v = step(dt); if (v === null) return
    const t = clock.elapsedTime
    bars.current.forEach((b, i) => { if (!b) return; const h = Math.max(0.02, (0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.8 + i * 0.9))) * v); b.scale.y = h; b.position.y = -0.4 + h / 2 })
    rig.line.geometry.setDrawRange(0, Math.max(2, Math.floor(rig.lc * (0.55 + 0.45 * Math.sin(t * 0.5)) * v)))
    if (donut.current) donut.current.rotation.z = t * 0.25
    const a = rig.arr
    for (let i = 0; i < N; i++) { rig.flow.getPoint((t * 0.1 + i / N) % 1, tmp); a[i * 3] = tmp.x; a[i * 3 + 1] = tmp.y; a[i * 3 + 2] = tmp.z }
    if (pts.current) pts.current.geometry.attributes.position.needsUpdate = true
  })
  const arcs = [[0.45, '#F2C811', 0], [0.3, '#01B8AA', 0.45], [0.25, '#5b6e76', 0.75]]
  return (
    <group ref={outer}>
      <group ref={inner}>
        <group position={[-1.2, -0.05, 0.2]} rotation={[0, 0.45, 0]}>
          <mesh position={[0, 0.1, -0.02]}><planeGeometry args={[1.15, 1.0]} /><meshBasicMaterial color="#0d1217" transparent opacity={0.8} /></mesh>
          <group position={[0, 0.1, 0]}><primitive object={rig.fa} /></group>
          {Array.from({ length: BARS }, (_, i) => (
            <mesh key={i} ref={el => (bars.current[i] = el)} position={[-0.42 + i * 0.14, -0.4, 0.02]}>
              <boxGeometry args={[0.09, 1, 0.09]} /><meshStandardMaterial color={i % 3 === 1 ? '#01B8AA' : '#F2C811'} emissive={i % 3 === 1 ? '#01B8AA' : '#F2C811'} emissiveIntensity={0.35} metalness={0.4} roughness={0.4} />
            </mesh>
          ))}
        </group>
        <group position={[0.1, 0.62, -0.5]} rotation={[0, -0.08, 0]}>
          <mesh position={[0, 0, -0.02]}><planeGeometry args={[1.3, 0.8]} /><meshBasicMaterial color="#0d1217" transparent opacity={0.8} /></mesh>
          <primitive object={rig.fb} />
          <primitive object={rig.line} />
        </group>
        <group position={[1.25, -0.12, 0.35]} rotation={[0, -0.4, 0]}>
          <mesh position={[0, 0, -0.02]}><planeGeometry args={[0.95, 0.95]} /><meshBasicMaterial color="#0d1217" transparent opacity={0.8} /></mesh>
          <primitive object={rig.fc} />
          <group ref={donut}>
            {arcs.map(([len, c, off]) => (
              <mesh key={c} rotation={[0, 0, off * Math.PI * 2]}><torusGeometry args={[0.3, 0.07, 10, 40, len * Math.PI * 2 - 0.08]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} metalness={0.3} roughness={0.45} /></mesh>
            ))}
          </group>
        </group>
        <points ref={pts}>
          <bufferGeometry><bufferAttribute attach="attributes-position" array={rig.arr} count={N} itemSize={3} /></bufferGeometry>
          <pointsMaterial color="#FFE6A0" size={0.035} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
    </group>
  )
}
