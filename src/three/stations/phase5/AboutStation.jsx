import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage } from '../gallery/common'
import { GEOS, disposeAll, goldMat } from './shared'

// About Me: metallic gold geometry orbiting the portrait. Locked to the `about-portrait` anchor (design width = 4 units).
// Decorative only: the photo itself is plain HTML. Mobile gets fewer objects.
export default function AboutStation({ mobile }) {
  const { outer, inner, step } = useStage('about-portrait')
  const gems = useRef([]), ring = useRef(), cage = useRef()
  const rig = useMemo(() => {
    const g = GEOS(), m = goldMat()
    const cageGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1, 1))
    const cageMat = new THREE.LineBasicMaterial({ color: '#F5D76E', transparent: true, opacity: 0.5, depthWrite: false })
    const defs = [[-2.25, 2.1, 0.7, 0, 0.36], [2.3, 0.9, 0.9, 1, 0.3], [-2.15, -1.3, 0.8, 2, 0.26], [2.2, -2.3, 0.6, 3, 0.22], [0.2, 3.0, 0.4, 0, 0.16]]
    return { g, m, cageGeo, cageMat, defs: mobile ? defs.slice(0, 3) : defs }
  }, [mobile])
  useEffect(() => () => disposeAll(rig.g, rig.m, rig.cageGeo, rig.cageMat), [rig])
  useFrame(({ clock }, dt) => {
    const v = step(dt); if (v === null) return
    const t = clock.elapsedTime
    gems.current.forEach((m, i) => { if (!m) return; m.rotation.x += dt * (0.2 + i * 0.05); m.rotation.y += dt * (0.3 - i * 0.03); m.position.y = rig.defs[i][1] + Math.sin(t * 0.6 + i * 1.7) * 0.12 })
    if (ring.current) ring.current.rotation.z += dt * 0.05
    if (cage.current) { cage.current.rotation.y += dt * 0.14; cage.current.rotation.x += dt * 0.06 }
  })
  return <group ref={outer}><group ref={inner}>
    {rig.defs.map(([x, y, z, gi, s], i) => <mesh key={i} ref={el => (gems.current[i] = el)} geometry={rig.g[gi]} material={rig.m} position={[x, y, z]} scale={s} />)}
    <group rotation={[1.15, 0.2, 0.3]}><mesh ref={ring} position={[0, 0.2, -0.3]}><torusGeometry args={[mobile ? 2.45 : 2.7, 0.012, 8, 160]} /><meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.3} emissive="#B8902A" emissiveIntensity={0.5} /></mesh></group>
    {!mobile && <lineSegments ref={cage} geometry={rig.cageGeo} material={rig.cageMat} position={[2.15, 2.5, -0.2]} scale={0.34} />}
  </group></group>
}
