import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Faceted gold polyhedra (flat-shaded metal) with thin wire cages. Positions are hero design units.
const GEMS = [
  { k: 'ico', p: [0.9, 3.15, -0.7], s: 0.82, cage: 1.34, spin: [0.11, 0.19, 0.04], bob: 0.12, sp: 0.55, delay: 1.5 },
  { k: 'octa', p: [-3.5, 1.7, 0.8], s: 0.52, cage: 1.4, spin: [0.2, 0.15, 0.1], bob: 0.16, sp: 0.7, delay: 1.75 },
  { k: 'dodeca', p: [4.7, 2.3, 0.4], s: 0.42, cage: 0, spin: [0.14, 0.22, 0.07], bob: 0.14, sp: 0.62, delay: 2.0 },
  { k: 'tetra', p: [-2.9, -3.1, 1.7], s: 0.44, cage: 0, spin: [0.25, 0.12, 0.18], bob: 0.13, sp: 0.8, delay: 2.2 },
  { k: 'box', p: [3.9, -3.3, 1.0], s: 0.36, cage: 0, spin: [0.18, 0.26, 0.1], bob: 0.1, sp: 0.5, delay: 2.4 },
  { k: 'ico', p: [-4.8, -0.5, -1.0], s: 0.2, cage: 0, spin: [0.3, 0.2, 0.1], bob: 0.1, sp: 0.9, delay: 2.6 }
]
const makeGeo = k => k === 'ico' ? new THREE.IcosahedronGeometry(1, 0) : k === 'octa' ? new THREE.OctahedronGeometry(1, 0)
  : k === 'dodeca' ? new THREE.DodecahedronGeometry(1, 0) : k === 'tetra' ? new THREE.TetrahedronGeometry(1, 0) : new THREE.BoxGeometry(1.5, 1.5, 1.5)
const easeOutBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2) }

function Gem({ gem, index, material }) {
  const ref = useRef()
  const geo = useMemo(() => makeGeo(gem.k), [gem.k])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame(({ clock }, dt) => {
    const g = ref.current; if (!g) return
    const t = clock.elapsedTime
    g.position.y = Math.sin(t * gem.sp + index * 1.7) * gem.bob
    g.rotation.x += dt * gem.spin[0]; g.rotation.y += dt * gem.spin[1]; g.rotation.z += dt * gem.spin[2]
    const k = Math.min(1, Math.max(0, (t - gem.delay) / 1.3))
    g.scale.setScalar(Math.max(0.0001, gem.s * easeOutBack(k)))
  })
  return (
    <group position={[gem.p[0], gem.p[1], gem.p[2]]}>
      <group ref={ref}>
        <mesh geometry={geo} material={material} />
        {gem.cage > 0 && (
          <lineSegments scale={gem.cage}>
            <edgesGeometry args={[geo]} />
            <lineBasicMaterial color="#F5D76E" transparent opacity={0.55} toneMapped={false} />
          </lineSegments>
        )}
      </group>
    </group>
  )
}

export default function GoldGems({ mobile = false }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#DDB43F', metalness: 1, roughness: 0.26, flatShading: true, envMapIntensity: 1.8 }), [])
  useEffect(() => () => material.dispose(), [material])
  const list = mobile ? GEMS.slice(0, 4) : GEMS
  return <group>{list.map((g, i) => <Gem key={i} gem={g} index={i} material={material} />)}</group>
}
