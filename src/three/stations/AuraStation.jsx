import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAnchor from '../useAnchor'

// Station 2 (Phase 3): the AURA opening. Locked to the HTML anchor "aura-showcase" (design width = 3 units).
// Gold gems and an orbit ring (Phase 2) plus, in Phase 3: three layered, gold-edged "dashboard" plates stacked behind the
// interface preview and a slowly turning wireframe core, so the preview reads as the front panel of a deeper control centre.
export default function AuraStation({ mobile }) {
  const group = useRef(), a = useRef(), b = useRef(), ring = useRef(), core = useRef(), stack = useRef()
  const geoA = useMemo(() => new THREE.IcosahedronGeometry(1, 0), [])
  const geoB = useMemo(() => new THREE.OctahedronGeometry(1, 0), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#DDB43F', metalness: 1, roughness: 0.26, flatShading: true, envMapIntensity: 1.8 }), [])
  const plates = useMemo(() => {
    const geo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.1, 1.66))
    const list = [0, 1, 2].map(i => {
      const m = new THREE.LineBasicMaterial({ color: '#D4AF37', transparent: true, opacity: 0.34 - i * 0.08, depthWrite: false })
      const l = new THREE.LineSegments(geo, m)
      l.position.set(0.14 + i * 0.22, 0.1 + i * 0.12, -0.55 - i * 0.5); l.scale.setScalar(1 + i * 0.1)
      return l
    })
    return { geo, list }
  }, [])
  const coreGeo = useMemo(() => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1, 1)), [])
  const coreMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#F5D76E', transparent: true, opacity: 0.45, depthWrite: false }), [])
  useEffect(() => () => {
    geoA.dispose(); geoB.dispose(); mat.dispose(); plates.geo.dispose(); plates.list.forEach(l => l.material.dispose()); coreGeo.dispose(); coreMat.dispose()
  }, [geoA, geoB, mat, plates, coreGeo, coreMat])
  useAnchor('aura-showcase', group, { unit: 3, screens: 1 })
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (a.current) { a.current.rotation.x += dt * 0.2; a.current.rotation.y += dt * 0.3; a.current.position.y = 1.15 + Math.sin(t * 0.6) * 0.1 }
    if (b.current) { b.current.rotation.x -= dt * 0.25; b.current.rotation.z += dt * 0.2; b.current.position.y = -1.0 + Math.sin(t * 0.8 + 1) * 0.08 }
    if (ring.current) ring.current.rotation.z += dt * 0.04
    if (core.current) { core.current.rotation.y += dt * 0.12; core.current.rotation.x += dt * 0.05 }
    if (stack.current) stack.current.position.y = Math.sin(t * 0.45) * 0.04
  })
  return (
    <group ref={group}>
      <mesh ref={a} geometry={geoA} material={mat} position={[1.78, 1.15, 0.5]} scale={0.34} />
      <mesh ref={b} geometry={geoB} material={mat} position={[-1.85, -1.0, 0.8]} scale={0.24} />
      <group ref={stack}>{plates.list.map((l, i) => <primitive key={i} object={l} />)}</group>
      {!mobile && (
        <>
          <group rotation={[0.5, 0.15, 0]} scale={[1, 0.6, 1]}>
            <mesh ref={ring} position={[0, 0, -0.6]}>
              <torusGeometry args={[2.1, 0.008, 8, 200]} />
              <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.3} emissive="#B8902A" emissiveIntensity={0.5} />
            </mesh>
          </group>
          <lineSegments ref={core} geometry={coreGeo} material={coreMat} position={[-1.95, 1.05, -0.2]} scale={0.3} />
        </>
      )}
    </group>
  )
}
