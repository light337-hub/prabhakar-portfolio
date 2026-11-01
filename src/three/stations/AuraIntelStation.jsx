import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useAnchor from '../useAnchor'

// Two small stations behind the two model visuals. They stay separate on purpose:
//   Chronos-2  -> flowing time-series style wave lines (attendance forecasting)
//   TabPFN     -> a lattice of data points with pulsing "rows" (tabular employee data)
// Decorative only; no data is shown.
const waveVert = /* glsl */`
attribute float aT; uniform float uTime; uniform float uPhase; uniform float uAmp; varying float vA;
void main(){
  vec3 p = position;
  p.y += sin(p.x*1.7 + uTime*0.5 + uPhase)*uAmp + sin(p.x*3.3 - uTime*0.33 + uPhase*1.7)*uAmp*0.38;
  p.z += uPhase*0.04;
  vA = smoothstep(0.0,0.16,aT)*(1.0-smoothstep(0.72,1.0,aT));
  gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`
const waveFrag = /* glsl */`uniform float uOpacity; varying float vA; void main(){ gl_FragColor = vec4(vec3(0.96,0.80,0.36), vA*uOpacity); }`

export function ChronosWaves({ mobile }) {
  const group = useRef()
  const rig = useMemo(() => {
    const N = 140, pos = new Float32Array(N * 3), t = new Float32Array(N)
    for (let i = 0; i < N; i++) { const k = i / (N - 1); pos.set([(k - 0.5) * 4.6, 0, 0], i * 3); t[i] = k }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aT', new THREE.BufferAttribute(t, 1))
    const count = mobile ? 4 : 7
    const mats = Array.from({ length: count }, (_, i) => new THREE.ShaderMaterial({
      vertexShader: waveVert, fragmentShader: waveFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPhase: { value: i * 0.7 }, uAmp: { value: 0.16 + i * 0.025 }, uOpacity: { value: 0.5 - i * 0.04 } }
    }))
    const lines = mats.map((m, i) => { const l = new THREE.Line(geo, m); l.position.set(0, (i - (count - 1) / 2) * 0.17, -0.5 - i * 0.05); l.frustumCulled = false; return l })
    return { geo, mats, lines }
  }, [mobile])
  useEffect(() => () => { rig.geo.dispose(); rig.mats.forEach(m => m.dispose()) }, [rig])
  useAnchor('aura-chronos-visual', group, { unit: 4, screens: 1 })
  useFrame(({ clock }) => { rig.mats.forEach(m => { m.uniforms.uTime.value = clock.elapsedTime }) })
  return <group ref={group}>{rig.lines.map((l, i) => <primitive key={i} object={l} />)}</group>
}

const latVert = /* glsl */`
attribute float aPh; uniform float uTime; uniform float uDpr; varying float vP;
void main(){
  vec4 mv = modelViewMatrix*vec4(position,1.0);
  float pulse = pow(0.5+0.5*sin(uTime*1.15 + aPh*6.2831), 6.0);
  vP = pulse;
  gl_PointSize = (3.2 + pulse*7.0)*uDpr*(8.0/max(0.5,-mv.z));
  gl_Position = projectionMatrix*mv;
}`
const latFrag = /* glsl */`varying float vP; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; float a = smoothstep(0.5,0.0,d); gl_FragColor = vec4(mix(vec3(0.72,0.56,0.16), vec3(1.0,0.93,0.62), vP), a*(0.28+0.72*vP)); }`

export function TabLattice({ mobile }) {
  const group = useRef()
  const dpr = useThree(s => s.viewport.dpr)
  const rig = useMemo(() => {
    const cols = mobile ? 6 : 9, rows = mobile ? 4 : 5, layers = mobile ? 2 : 3, n = cols * rows * layers
    const pos = new Float32Array(n * 3), ph = new Float32Array(n)
    let k = 0
    for (let z = 0; z < layers; z++) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      pos.set([(c / (cols - 1) - 0.5) * 4.2, (0.5 - r / (rows - 1)) * 2.4, -0.4 - z * 0.45], k * 3)
      ph[k] = (r * 0.21 + c * 0.07 + z * 0.33) % 1; k++
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aPh', new THREE.BufferAttribute(ph, 1))
    const mat = new THREE.ShaderMaterial({ vertexShader: latVert, fragmentShader: latFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } } })
    return { geo, mat }
  }, [mobile])
  useEffect(() => () => { rig.geo.dispose(); rig.mat.dispose() }, [rig])
  useAnchor('aura-tabpfn-visual', group, { unit: 4, screens: 1 })
  useFrame(({ clock }) => { rig.mat.uniforms.uTime.value = clock.elapsedTime; rig.mat.uniforms.uDpr.value = dpr })
  return <group ref={group}><points geometry={rig.geo} material={rig.mat} frustumCulled={false} /></group>
}

export default function AuraIntelStation({ mobile }) {
  return <><ChronosWaves mobile={mobile} /><TabLattice mobile={mobile} /></>
}
