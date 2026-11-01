import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage, outline, mod } from './common'

// AIS: a dark maritime radar table (tilted ocean disc, range rings, shader radar sweep), ship markers that light up when the
// sweep passes, a navigation route that draws on, and two floating interface frames. Decorative: all text is HTML.
const vert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
const frag = `uniform float uTime; varying vec2 vUv;
void main(){ vec2 p = vUv-0.5; float r = length(p)*2.0; if(r>1.0) discard;
  float a = atan(p.y,p.x); float d = mod(-uTime*1.1 - a, 6.28318); float s = exp(-d*1.7);
  gl_FragColor = vec4(0.12,0.9,0.85, s*0.55*(1.0-0.3*r)); }`
const SHIPS = [[-0.8, 0.35, 0.5, 0.2], [0.5, 0.6, -0.8, 0.3], [0.9, -0.3, 2.2, 0.22], [-0.3, -0.7, 1.1, 0.25], [0.1, 0.1, -2.1, 0.18], [-1.05, -0.35, 0.3, 0.2]]
const ROUTE = [[-1.35, -0.55], [-0.7, -0.12], [-0.05, 0.22], [0.6, 0.1], [1.15, 0.62]]

export default function AisStation({ mobile }) {
  const { outer, inner, step } = useStage('stage-ais')
  const ships = useRef([]), p1 = useRef(), p2 = useRef()
  const rig = useMemo(() => {
    const sweep = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: { uTime: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
    const curve = new THREE.CatmullRomCurve3(ROUTE.map(([x, y]) => new THREE.Vector3(x, y, 0.012)))
    const pts = curve.getPoints(64)
    const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#7ff5e8', transparent: true, opacity: 0.85 }))
    return { sweep, route, count: pts.length, f1: outline(THREE, 0.95, 0.52, '#2FD6D2'), f2: outline(THREE, 0.8, 0.46, '#4aa8ff') }
  }, [])
  const rings = [0.45, 0.9, 1.35, 1.7]
  useFrame(({ clock }, dt) => {
    const v = step(dt); if (v === null) return
    const t = clock.elapsedTime
    rig.sweep.uniforms.uTime.value = t
    rig.route.geometry.setDrawRange(0, Math.max(2, Math.floor(rig.count * v)))
    const sw = -t * 1.1
    SHIPS.forEach(([x, y, h, sp], i) => {
      const m = ships.current[i]; if (!m) return
      const k = Math.sin(t * sp + i * 1.7) * 0.22
      m.position.set(x + Math.cos(h + Math.PI / 2) * k, y + Math.sin(h + Math.PI / 2) * k, 0.03)
      m.rotation.z = h
      const g = Math.exp(-mod(sw - Math.atan2(m.position.y, m.position.x), 6.28318) * 1.7)
      m.material.opacity = (0.28 + 0.72 * g) * v
    })
    if (p1.current) p1.current.position.y = 0.78 + Math.sin(t * 0.9) * 0.05
    if (p2.current) p2.current.position.y = 0.42 + Math.sin(t * 0.8 + 2) * 0.05
  })
  return (
    <group ref={outer}>
      <group ref={inner}>
        <group rotation={[-0.95, 0, 0]} position={[0, -0.12, 0]}>
          <mesh><circleGeometry args={[1.7, mobile ? 48 : 96]} /><meshBasicMaterial color="#04202c" transparent opacity={0.82} /></mesh>
          {rings.map(r => <mesh key={r} position={[0, 0, 0.004]}><ringGeometry args={[r - 0.008, r, 96]} /><meshBasicMaterial color="#2FD6D2" transparent opacity={0.34} /></mesh>)}
          <mesh position={[0, 0, 0.005]}><planeGeometry args={[3.4, 0.006]} /><meshBasicMaterial color="#2FD6D2" transparent opacity={0.25} /></mesh>
          <mesh position={[0, 0, 0.005]}><planeGeometry args={[0.006, 3.4]} /><meshBasicMaterial color="#2FD6D2" transparent opacity={0.25} /></mesh>
          <mesh position={[0, 0, 0.008]} material={rig.sweep}><circleGeometry args={[1.7, 64]} /></mesh>
          <primitive object={rig.route} />
          {SHIPS.map((s, i) => (
            <mesh key={i} ref={el => (ships.current[i] = el)}>
              <coneGeometry args={[0.055, 0.17, 3]} /><meshBasicMaterial color={i % 3 === 0 ? '#FFE6A0' : '#9ffcf2'} transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
        <group ref={p1} position={[-1.5, 0.78, 0.5]} rotation={[0, 0.4, 0]}>
          <mesh><planeGeometry args={[0.95, 0.52]} /><meshBasicMaterial color="#062a38" transparent opacity={0.4} /></mesh>
          <primitive object={rig.f1} />
        </group>
        <group ref={p2} position={[1.5, 0.42, 0.7]} rotation={[0, -0.4, 0]}>
          <mesh><planeGeometry args={[0.8, 0.46]} /><meshBasicMaterial color="#061c33" transparent opacity={0.4} /></mesh>
          <primitive object={rig.f2} />
        </group>
      </group>
    </group>
  )
}
