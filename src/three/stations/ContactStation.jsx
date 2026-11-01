import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAnchor from '../useAnchor'
import { makeGlobeTextures } from '../globeTexture'

const globeVert = /* glsl */`
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`
const globeFrag = /* glsl */`
uniform sampler2D uBase; uniform sampler2D uLights; uniform float uTime;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 N = normalize(vN), V = normalize(vV);
  vec3 L = normalize(vec3(-0.55, 0.42, 0.72));
  float nl = dot(N, L);
  float wrap = smoothstep(-0.25, 1.0, nl);
  vec3 base = texture2D(uBase, vUv).rgb;
  vec3 city = texture2D(uLights, vUv).rgb;
  vec3 col = base * (0.35 + 2.6*wrap);
  float lum = dot(base, vec3(0.333));
  vec3 H = normalize(L + V);
  col += vec3(1.0,0.80,0.42) * pow(max(dot(N,H),0.0), 48.0) * 0.30 * (1.0 - smoothstep(0.004, 0.03, lum));
  float night = 1.0 - smoothstep(-0.1, 0.6, nl);
  col += city * (0.75 + 1.5*night) * (0.93 + 0.07*sin(uTime*1.3 + vUv.x*220.0));
  float fres = pow(1.0 - max(dot(N,V),0.0), 2.6);
  col += vec3(0.96,0.78,0.30) * fres * (0.30 + 0.9*wrap);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
const atmoVert = /* glsl */`varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
const atmoFrag = /* glsl */`
varying vec3 vN;
void main(){ float k = clamp(-vN.z/0.5, 0.0, 1.0); k = pow(k, 2.4); gl_FragColor = vec4(vec3(0.96,0.72,0.25)*k, k*0.85); }`

function Ring({ radius, tube, rot, speed, bead }) {
  const g = useRef(), b = useRef()
  useFrame((_, dt) => { if (g.current) g.current.rotation.z += dt * speed; if (b.current) b.current.rotation.z += dt * speed * 1.8 })
  return (
    <group rotation={rot}>
      <group ref={g}>
        <mesh>
          <torusGeometry args={[radius, tube, 8, 160]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.28} emissive="#B8902A" emissiveIntensity={0.55} envMapIntensity={1.6} />
        </mesh>
      </group>
      {bead && (
        <group ref={b}>
          <mesh position={[radius, 0, 0]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color="#F5D76E" toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Station 3: the contact globe, locked to the HTML anchor "contact-globe" (design diameter = 2 units).
// Mounted lazily by LazyWhenNear; textures are generated once, on demand, offline.
export default function ContactStation({ mobile }) {
  const group = useRef(), globe = useRef()
  const rig = useMemo(() => {
    const tex = makeGlobeTextures(mobile ? 1024 : 2048)
    const globeMat = new THREE.ShaderMaterial({ vertexShader: globeVert, fragmentShader: globeFrag, uniforms: { uBase: { value: tex.base }, uLights: { value: tex.lights }, uTime: { value: 0 } } })
    const atmoMat = new THREE.ShaderMaterial({ vertexShader: atmoVert, fragmentShader: atmoFrag, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    return { tex, globeMat, atmoMat }
  }, [mobile])
  useEffect(() => () => { rig.tex.base.dispose(); rig.tex.lights.dispose(); rig.globeMat.dispose(); rig.atmoMat.dispose() }, [rig])
  useAnchor('contact-globe', group, { unit: 2, screens: 1 })
  const seg = mobile ? 48 : 96
  useFrame(({ clock }, dt) => {
    rig.globeMat.uniforms.uTime.value = clock.elapsedTime
    if (globe.current) globe.current.rotation.y += dt * 0.055
  })
  return (
    <group ref={group}>
      <group rotation={[0.32, 0, -0.38]}>
        <mesh ref={globe} rotation={[0, Math.PI / 2 - 2 * Math.PI * ((60 + 180) / 360), 0]} material={rig.globeMat}>
          <sphereGeometry args={[1, seg, seg]} />
        </mesh>
        <mesh scale={1.22} material={rig.atmoMat}>
          <sphereGeometry args={[1, 48, 48]} />
        </mesh>
        <Ring radius={1.32} tube={0.006} rot={[1.25, 0.15, 0.2]} speed={0.05} bead />
        <Ring radius={1.52} tube={0.004} rot={[0.95, -0.35, 0.8]} speed={-0.035} bead />
        {!mobile && <Ring radius={1.78} tube={0.003} rot={[1.5, 0.45, -0.25]} speed={0.025} />}
      </group>
    </group>
  )
}
