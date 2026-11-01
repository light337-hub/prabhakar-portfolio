import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useAnchor from '../useAnchor'
import { scrollState } from '../scrollStore'
import { glowTexture } from '../glow'
import * as S from '../earth/earthShaders'

// Phase 6 — Contact scene: a real, slowly rotating 3D Earth inside the ONE global canvas (no extra canvas).
//  * anchor "earth-stage"   (a square div in Contact.jsx): the planet's diameter = that element's width
//  * anchor "contact-cosmos" (the whole Contact section):  deep-space stars + the existing nebula image as a far backdrop
// Textures are baked by tools/earth/make_earth_textures.py from HAND-AUTHORED, STYLISED geography (not satellite imagery).
// Lazy: this whole file is a separate chunk, mounted by LazyWhenNear when the contact anchor nears the viewport.

const SUN = new THREE.Vector3(-0.86, 0.34, 0.2).normalize()   // view-space sun: low, from the upper left
const SPIN = 0.042                                              // rad / s  (~150 s per turn)
const START_LON = 72                                            // longitude facing the camera at load (India / Arabian Sea sits near the dusk line, lit Africa on the left)
const MADURAI = { lat: 9.93, lon: 78.12 }                       // location already shown on the portfolio; drawn as a tiny gold beacon
const TILT_X = 0.26, AXIAL_Z = -0.41
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function latLon(lat, lon, r) {                                  // same convention as THREE.SphereGeometry
  const ph = ((lon + 180) / 360) * Math.PI * 2, th = ((90 - lat) / 180) * Math.PI
  return new THREE.Vector3(-r * Math.cos(ph) * Math.sin(th), r * Math.cos(th), r * Math.sin(ph) * Math.sin(th))
}

// ---- textures (async, with a safe fallback so a missing file never takes the whole scene down)
function useEarthTextures(mobile) {
  const [tx, setTx] = useState(null)
  useEffect(() => {
    let dead = false
    const loader = new THREE.TextureLoader()
    const res = mobile ? '1k' : '2k'
    const load = url => new Promise(ok => loader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; ok(t) }, undefined, () => ok(null)))
    const solid = (r, g, b) => { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t }
    Promise.all([load(`/images/earth/earth-day-${res}.jpg`), load(`/images/earth/earth-lights-${res}.jpg`), load(`/images/earth/earth-clouds-${res}.jpg`), mobile ? null : load('/images/cosmos/nebula-cosmos.jpg')]).then(([day, lights, clouds, neb]) => {
      const set = { day: day || solid(6, 18, 44), lights: lights || solid(0, 0, 0), clouds: clouds || solid(0, 0, 0), neb, fallback: !day }
      if (dead) { Object.values(set).forEach(t => t && t.dispose && t.dispose()); return }
      setTx(set)
    })
    return () => { dead = true }
  }, [mobile])
  useEffect(() => () => { if (tx) Object.values(tx).forEach(t => t && t.dispose && t.dispose()) }, [tx])
  return tx
}

function Orbit({ radius, inc, rz, speed, phase, base, st, bead }) {
  const head = useRef(phase)
  const dot = useRef()
  const { geo, mat } = useMemo(() => {
    const n = 360, pos = new Float32Array(n * 3), ang = new Float32Array(n)
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pos.set([Math.cos(a) * radius, Math.sin(a) * radius, 0], i * 3); ang[i] = a }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aAng', new THREE.BufferAttribute(ang, 1))
    const m = new THREE.ShaderMaterial({ vertexShader: S.orbitVert, fragmentShader: S.orbitFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uHead: { value: 0 }, uDir: { value: speed >= 0 ? 1 : -1 }, uReveal: { value: 0 }, uColor: { value: new THREE.Color(1.0, 0.82, 0.42) }, uBase: { value: base } } })
    return { geo: g, mat: m }
  }, [radius, base])
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])
  useFrame((_, dt) => {
    head.current = (head.current + dt * speed + Math.PI * 2) % (Math.PI * 2)
    mat.uniforms.uHead.value = head.current
    mat.uniforms.uReveal.value = st.current.r * st.current.l
    if (dot.current) { const a = mat.uniforms.uHead.value; dot.current.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0); dot.current.material.opacity = 0.95 * st.current.r * st.current.l }
  })
  return (
    <group rotation-z={rz}>
      <group rotation-x={inc}>
        <lineLoop geometry={geo} material={mat} frustumCulled={false} renderOrder={3} />
        {bead && <sprite ref={dot} scale={[0.1, 0.1, 1]} renderOrder={4}><spriteMaterial map={glowTexture()} color="#FFE6A0" blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} /></sprite>}
      </group>
    </group>
  )
}

export default function EarthStation({ mobile }) {
  const tx = useEarthTextures(mobile)
  const dpr = useThree(s => s.viewport.dpr)
  const root = useRef(), spin = useRef(), clouds = useRef(), beacon = useRef(), pulse = useRef(), spaceRoot = useRef(), nebRoot = useRef()
  const st = useRef({ r: 0, l: 0, sp: 0 })                                // r = scroll reveal, l = load fade-in, sp = "space" amount for stars/nebula

  const mats = useMemo(() => {
    if (!tx) return null
    const sun = SUN.clone()
    const planet = new THREE.ShaderMaterial({ vertexShader: S.planetVert, fragmentShader: S.planetFrag, uniforms: {
      uDay: { value: tx.day }, uLights: { value: tx.lights }, uClouds: { value: tx.clouds }, uSun: { value: sun }, uTime: { value: 0 }, uReveal: { value: 0 }, uCloudShadow: { value: 0.3 }, uCloudShift: { value: new THREE.Vector2(0.004, -0.003) } } })
    const cloud = new THREE.ShaderMaterial({ vertexShader: S.cloudVert, fragmentShader: S.cloudFrag, transparent: true, depthWrite: false, uniforms: { uClouds: { value: tx.clouds }, uSun: { value: sun }, uReveal: { value: 0 } } })
    const atmo = new THREE.ShaderMaterial({ vertexShader: S.atmoVert, fragmentShader: S.atmoFrag, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { uSun: { value: sun }, uReveal: { value: 0 }, uStrength: { value: 1 } } })
    const N = mobile ? 360 : 950
    const pos = new Float32Array(N * 3), seed = new Float32Array(N), size = new Float32Array(N)
    for (let i = 0; i < N; i++) { pos.set([Math.random() * 2 - 1, Math.random() * 2 - 1, -2 - Math.random() * 10], i * 3); seed[i] = Math.random(); size[i] = 0.05 + Math.random() * 0.1 }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); starGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1)); starGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    const star = new THREE.ShaderMaterial({ vertexShader: S.starVert, fragmentShader: S.starFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uHalf: { value: new THREE.Vector2(6, 3) }, uDist: { value: 9 }, uDpr: { value: 1 }, uReveal: { value: 0 } } })
    const neb = tx.neb ? new THREE.ShaderMaterial({ vertexShader: S.nebulaVert, fragmentShader: S.nebulaFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTex: { value: tx.neb }, uReveal: { value: 0 }, uOpacity: { value: 0.26 } } }) : null
    return { planet, cloud, atmo, star, starGeo, neb }
  }, [tx, mobile])
  useEffect(() => () => { if (mats) { mats.planet.dispose(); mats.cloud.dispose(); mats.atmo.dispose(); mats.star.dispose(); mats.starGeo.dispose(); mats.neb && mats.neb.dispose() } }, [mats])

  // planet anchor: diameter == width of the .earth-anchor element. Reveal eases in as the section scrolls into view.
  useAnchor('earth-stage', root, { unit: 2, screens: 1.2, onUpdate: a => {
    const target = smooth(0.05, 0.34, a.progress)
    st.current.r += (target - st.current.r) * 0.07
    root.current.scale.multiplyScalar(0.9 + 0.1 * st.current.r)
  } })
  // far backdrop anchors (the whole Contact section): stars fill the rect, nebula sits far behind
  useAnchor('contact-cosmos', spaceRoot, { unit: 1, screens: 1, onUpdate: a => {
    spaceRoot.current.scale.setScalar(1)
    if (mats) mats.star.uniforms.uHalf.value.set(a.w / 2, a.h / 2)
  } })
  const NEB_Z = -9, NEB_F = (9 - NEB_Z) / 9
  useAnchor('contact-cosmos', nebRoot, { unit: 1, depth: NEB_Z, screens: 1, onUpdate: a => {
    const g = nebRoot.current
    g.position.x = a.x * NEB_F + a.w * NEB_F * 0.06; g.position.y = a.y * NEB_F
    g.scale.setScalar((a.w * NEB_F * 1.15) / 26)
  } })

  const beaconPos = useMemo(() => latLon(MADURAI.lat, MADURAI.lon, 1.012), [])
  const glow = useMemo(() => glowTexture(), [])
  const seg = mobile ? 56 : 112

  useFrame(({ clock }, dt) => {
    if (!mats || !root.current) return
    const vis = root.current.visible || (spaceRoot.current && spaceRoot.current.visible)
    if (!vis) return
    const s = st.current, t = clock.elapsedTime
    s.l = Math.min(1, s.l + dt / 1.5)
    const target = scrollState.space
    s.sp += (target - s.sp) * Math.min(1, dt * 2.2)
    const rv = s.r * s.l
    if (spin.current) spin.current.rotation.y += dt * SPIN
    if (clouds.current) clouds.current.rotation.y += dt * 0.0045            // clouds drift slightly faster than the ground
    mats.planet.uniforms.uTime.value = t; mats.planet.uniforms.uReveal.value = rv
    mats.cloud.uniforms.uReveal.value = rv; mats.atmo.uniforms.uReveal.value = rv
    mats.star.uniforms.uTime.value = t; mats.star.uniforms.uDpr.value = dpr; mats.star.uniforms.uReveal.value = s.sp * s.l
    if (mats.neb) mats.neb.uniforms.uReveal.value = s.sp * s.l
    // Madurai beacon: slow pulse
    if (pulse.current) { const k = (t * 0.45) % 1; pulse.current.scale.setScalar(0.05 + 0.2 * k); pulse.current.material.opacity = 0.55 * (1 - k) * rv }
    if (beacon.current) beacon.current.material.opacity = (0.8 + 0.2 * Math.sin(t * 2.1)) * rv
  })

  if (!mats) return null
  return (
    <>
      {/* deep space: stars + far nebula (anchor "contact-cosmos") */}
      <group ref={spaceRoot}><points frustumCulled={false} geometry={mats.starGeo} material={mats.star} renderOrder={-2} /></group>
      {mats.neb && <group ref={nebRoot}><mesh material={mats.neb} renderOrder={-3}><planeGeometry args={[26, 12.7]} /></mesh></group>}

      {/* the planet (anchor "earth-stage") */}
      <group ref={root}>
        <group rotation-x={TILT_X}>
          <group rotation-z={AXIAL_Z}>
            <group ref={spin} rotation-y={-Math.PI / 2 - (START_LON * Math.PI) / 180}>
              <mesh material={mats.planet} renderOrder={0}><sphereGeometry args={[1, seg, seg]} /></mesh>
              <mesh ref={clouds} material={mats.cloud} renderOrder={1}><sphereGeometry args={[1.012, Math.round(seg * 0.75), Math.round(seg * 0.75)]} /></mesh>
              <group position={beaconPos}>
                <sprite ref={pulse} scale={[0.1, 0.1, 1]}><spriteMaterial map={glow} color="#F5D76E" blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} opacity={0} /></sprite>
                <sprite ref={beacon} scale={[0.07, 0.07, 1]}><spriteMaterial map={glow} color="#FFE6A0" blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} opacity={0} /></sprite>
              </group>
            </group>
          </group>
        </group>
        <mesh material={mats.atmo} scale={1.17} renderOrder={2}><sphereGeometry args={[1, 64, 48]} /></mesh>
        {/* sun-rise bloom peeking over the limb on the sun side (half of it hides behind the planet) */}
        <sprite position={[SUN.x * 1.03, SUN.y * 1.03, -0.12]} scale={[1.5, 1.5, 1]} renderOrder={2}>
          <spriteMaterial map={glow} color="#FFC46B" blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} opacity={0.34} />
        </sprite>
        {/* restrained orbital paths: two thin lines with a travelling light arc + bead */}
        <group rotation-x={TILT_X}>
          <Orbit radius={1.36} inc={1.3} rz={-0.42} speed={0.33} phase={0.6} base={0.22} st={st} bead />
          {!mobile && <Orbit radius={1.62} inc={1.12} rz={0.5} speed={-0.21} phase={2.4} base={0.15} st={st} bead />}
        </group>
      </group>
    </>
  )
}
