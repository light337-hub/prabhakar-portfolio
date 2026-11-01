import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from './scrollStore'

const SPAN = 16
const Z_DEFAULT = [-8, 3]
const vert = /* glsl */`
attribute float aSeed; attribute float aSize;
uniform float uTime; uniform float uScroll; uniform float uDpr; uniform float uParallax;
varying float vTw; varying float vSeed;
void main(){
  vec3 p = position;
  p.y = mod(p.y + uTime*(0.025+aSeed*0.05) + uScroll*uParallax + ${(SPAN / 2).toFixed(1)}, ${SPAN.toFixed(1)}) - ${(SPAN / 2).toFixed(1)};
  p.x += sin(uTime*0.2 + aSeed*20.0)*0.22;
  vec4 mv = modelViewMatrix*vec4(p,1.0);
  gl_Position = projectionMatrix*mv;
  gl_PointSize = aSize*uDpr*(300.0/max(0.5,-mv.z));
  vTw = 0.55 + 0.45*sin(uTime*(0.7+aSeed*1.8) + aSeed*60.0);
  vSeed = aSeed;
}`
const frag = /* glsl */`
uniform float uOpacity; uniform float uSpace; varying float vTw; varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d); a *= a;
  vec3 col = mix(vec3(0.83,0.69,0.22), vec3(0.96,0.84,0.43), vSeed);
  col = mix(col, mix(vec3(0.70,0.80,1.0), vec3(1.0,0.93,0.75), step(0.7, vSeed)), uSpace * 0.7);   // cool starlight in the Contact scene
  gl_FragColor = vec4(col, a*vTw*uOpacity*(1.0 - 0.3*uSpace));
}`

// Fine gold atmosphere. Wraps vertically so scroll parallax never runs out of dust.
export default function Particles({ count = 600, size = 0.05, opacity = 0.8, parallax = 0.0008, zRange = Z_DEFAULT }) {
  const ref = useRef()
  const dpr = useThree(s => s.viewport.dpr)
  const { geo, uniforms } = useMemo(() => {
    const pos = new Float32Array(count * 3), seed = new Float32Array(count), sz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = Math.random() * SPAN - SPAN / 2
      pos[i * 3 + 2] = zRange[0] + Math.random() * (zRange[1] - zRange[0])
      seed[i] = Math.random(); sz[i] = size * (0.5 + Math.random())
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1))
    return { geo: g, uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uDpr: { value: 1 }, uParallax: { value: parallax }, uOpacity: { value: opacity }, uSpace: { value: 0 } } }
  }, [count, size, opacity, parallax, zRange])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uScroll.value = scrollState.y
    uniforms.uDpr.value = dpr
    uniforms.uSpace.value += (scrollState.space - uniforms.uSpace.value) * 0.05
  })
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
