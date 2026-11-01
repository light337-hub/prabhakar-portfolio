import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage, outline } from './common'

// Gemini Starfighter: an ILLUSTRATIVE spacecraft flying a banked path around a planet in a star field, with two floating
// interface frames. It does not depict the real game/app (its contents could not be read from outside).
export default function StarfighterStation({ mobile }) {
  const { outer, inner, step } = useStage('stage-starfighter')
  const ship = useRef(), planet = useRef(), glow = useRef()
  const rig = useMemo(() => {
    const n = mobile ? 70 : 150, a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = Math.abs(Math.sin(i * 78.233) * 12543.1) % 1, r3 = Math.abs(Math.sin(i * 39.346) * 9871.7) % 1; a[i * 3] = (r1 - 0.5) * 4.6; a[i * 3 + 1] = (r2 - 0.5) * 3; a[i * 3 + 2] = -0.6 - r3 * 1.8 }
    return { stars: a, n, f1: outline(THREE, 0.8, 0.45, '#6aa8ff'), f2: outline(THREE, 0.7, 0.4, '#9fc4ff', 0.5), a: new THREE.Vector3(), b: new THREE.Vector3() }
  }, [mobile])
  const path = (t, out) => out.set(Math.cos(t) * 1.35, Math.sin(t * 2) * 0.22, Math.sin(t) * 0.8 + 0.25)
  useFrame(({ clock }, dt) => {
    const v = step(dt); if (v === null) return
    const t = clock.elapsedTime, s = ship.current
    if (planet.current) planet.current.rotation.y = t * 0.08
    if (glow.current) glow.current.scale.setScalar(1 + Math.sin(t * 12) * 0.12)
    if (s) { path(t * 0.45, rig.a); path(t * 0.45 + 0.05, rig.b); s.position.copy(rig.a); s.lookAt(rig.b); s.rotateZ(Math.sin(t * 0.9) * 0.4) }
  })
  return (
    <group ref={outer}>
      <group ref={inner}>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" array={rig.stars} count={rig.n} itemSize={3} /></bufferGeometry>
          <pointsMaterial color="#dfe9ff" size={0.022} transparent opacity={0.85} depthWrite={false} />
        </points>
        <group position={[0.95, -0.1, -0.8]}>
          <mesh ref={planet}><sphereGeometry args={[0.85, 48, 32]} /><meshStandardMaterial color="#101a38" emissive="#0a1a4a" emissiveIntensity={0.7} roughness={0.9} /></mesh>
          <mesh scale={1.012}><sphereGeometry args={[0.85, 18, 12]} /><meshBasicMaterial color="#6aa8ff" wireframe transparent opacity={0.09} /></mesh>
          <mesh scale={1.1}><sphereGeometry args={[0.85, 32, 24]} /><meshBasicMaterial color="#4f86ff" transparent opacity={0.22} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        </group>
        <group ref={ship} scale={0.9}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.1, 0.95, 8]} /><meshStandardMaterial color="#2b2f3a" metalness={0.9} roughness={0.3} envMapIntensity={1.5} /></mesh>
          {[-1, 1].map(s => (
            <group key={s}>
              <mesh position={[s * 0.3, 0, -0.12]} rotation={[0, s * -0.5, 0]}><boxGeometry args={[0.62, 0.016, 0.28]} /><meshStandardMaterial color="#3a3f4d" metalness={0.9} roughness={0.3} envMapIntensity={1.5} /></mesh>
              <mesh position={[s * 0.58, 0, -0.2]}><boxGeometry args={[0.02, 0.02, 0.3]} /><meshBasicMaterial color="#8fb8ff" /></mesh>
            </group>
          ))}
          <mesh position={[0, 0.05, 0.02]}><boxGeometry args={[0.04, 0.025, 0.25]} /><meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.25} envMapIntensity={1.6} /></mesh>
          <mesh ref={glow} position={[0, 0, -0.5]}><sphereGeometry args={[0.06, 12, 12]} /><meshBasicMaterial color="#8fe9ff" toneMapped={false} /></mesh>
          <mesh position={[0, 0, -0.78]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[0.05, 0.5, 10]} /><meshBasicMaterial color="#4fc8ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        </group>
        <group position={[-1.55, 0.85, 0.4]} rotation={[0, 0.45, 0]}><mesh><planeGeometry args={[0.8, 0.45]} /><meshBasicMaterial color="#071229" transparent opacity={0.4} /></mesh><primitive object={rig.f1} /></group>
        <group position={[1.6, -0.75, 0.6]} rotation={[0, -0.45, 0]}><mesh><planeGeometry args={[0.7, 0.4]} /><meshBasicMaterial color="#071229" transparent opacity={0.4} /></mesh><primitive object={rig.f2} /></group>
      </group>
    </group>
  )
}
