import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage, outline } from './common'

// NetflixX: layered floating screens, a sign-in panel mirroring the verified live page (NetflixX title, Sign In heading, two
// fields, a Sign In button) and a slowly rotating ring of film frames. Black, red and white. ILLUSTRATIVE: not a screenshot.
const BACK = [[-1.25, 0.45, -0.9, 0.5, -1], [1.3, 0.35, -0.7, -0.5, 1], [-0.2, 0.95, -1.3, 0.1, -1], [0.35, -0.8, -1.1, -0.15, 1]]
export default function NetflixxStation({ mobile }) {
  const { outer, inner, step } = useStage('stage-netflixx')
  const backs = useRef([]), ring = useRef(), frames = useRef()
  const F = mobile ? 18 : 28
  const rig = useMemo(() => ({ edge: BACK.map(() => outline(THREE, 1.5, 0.85, '#E50914', 0.55)), card: outline(THREE, 0.95, 1.15, '#E50914', 0.9) }), [])
  useEffect(() => {
    const m = frames.current; if (!m) return
    const o = new THREE.Object3D()
    for (let i = 0; i < F; i++) { const a = (i / F) * Math.PI * 2; o.position.set(Math.cos(a) * 1.65, 0, Math.sin(a) * 1.65); o.rotation.set(0, -a + Math.PI / 2, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix) }
    m.instanceMatrix.needsUpdate = true
  }, [F])
  useFrame(({ clock }, dt) => {
    const v = step(dt); if (v === null) return
    const t = clock.elapsedTime
    BACK.forEach(([x, y, z, ry, dir], i) => { const b = backs.current[i]; if (!b) return; b.position.set(x + (1 - v) * dir * 1.6, y + Math.sin(t * 0.7 + i) * 0.05, z); b.rotation.y = ry })
    if (ring.current) ring.current.rotation.y = t * 0.18
  })
  return (
    <group ref={outer}>
      <group ref={inner}>
        {BACK.map((_, i) => (
          <group key={i} ref={el => (backs.current[i] = el)}>
            <mesh><planeGeometry args={[1.5, 0.85]} /><meshBasicMaterial color={i % 2 ? '#1a0507' : '#0e0e10'} transparent opacity={0.9} /></mesh>
            <primitive object={rig.edge[i]} />
            <mesh position={[-0.35, 0.1, 0.005]}><planeGeometry args={[0.5, 0.05]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.18} /></mesh>
          </group>
        ))}
        <group ref={ring} rotation={[0.55, 0, 0]} position={[0, 0.05, 0]}>
          <instancedMesh ref={frames} args={[undefined, undefined, F]}>
            <planeGeometry args={[0.2, 0.14]} /><meshBasicMaterial color="#f2f2f2" transparent opacity={0.22} side={THREE.DoubleSide} />
          </instancedMesh>
        </group>
        <group position={[0, 0, 0.6]}>
          <mesh><planeGeometry args={[0.95, 1.15]} /><meshBasicMaterial color="#0a0a0a" transparent opacity={0.94} /></mesh>
          <primitive object={rig.card} />
          <mesh position={[0, 0.42, 0.01]}><planeGeometry args={[0.5, 0.09]} /><meshBasicMaterial color="#E50914" /></mesh>
          <mesh position={[-0.12, 0.2, 0.01]}><planeGeometry args={[0.3, 0.05]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8} /></mesh>
          <mesh position={[0, 0.02, 0.01]}><planeGeometry args={[0.7, 0.1]} /><meshBasicMaterial color="#2a2a2a" /></mesh>
          <mesh position={[0, -0.16, 0.01]}><planeGeometry args={[0.7, 0.1]} /><meshBasicMaterial color="#2a2a2a" /></mesh>
          <mesh position={[0, -0.38, 0.01]}><planeGeometry args={[0.7, 0.11]} /><meshBasicMaterial color="#E50914" /></mesh>
        </group>
      </group>
    </group>
  )
}
