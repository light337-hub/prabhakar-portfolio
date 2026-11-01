import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { REF, INTRO_SECONDS } from './constants'
import { scrollState, pointerState } from './scrollStore'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const easeOutQuart = k => 1 - Math.pow(1 - k, 4)
const look = new THREE.Vector3()
const cur = { x: 0, y: 0 }

// Phase 3: scroll-triggered camera "shots" for the AURA case study. Each sub-section nudges the camera (orbit x/y, dolly z,
// roll, field of view). The look-at target stays on the origin, so anchored 3D objects stay aligned with their HTML.
// Poses ease in with damping, so moving between sections reads as one continuous camera move.
const SHOTS = {
  aura:                { x: 0,     y: 0,     z: 0,     roll: 0,      fov: 0 },
  'aura-problem':      { x: -0.22, y: 0.08,  z: -0.25, roll: -0.008, fov: -1.5 },
  'aura-architecture': { x: 0.34,  y: -0.1,  z: 0.4,   roll: 0.012,  fov: 1.5 },
  'aura-modules':      { x: -0.3,  y: 0.1,   z: -0.15, roll: -0.01,  fov: -1 },
  'aura-intelligence': { x: 0.28,  y: -0.08, z: 0.3,   roll: 0.009,  fov: 1 },
  'aura-workflow':     { x: -0.34, y: 0.06,  z: 0.38,  roll: -0.012, fov: 1.5 },
  'aura-stack':        { x: 0,     y: 0.12,  z: -0.35, roll: 0,      fov: -1.5 },
  // Phase 4 gallery: gentle alternating orbit per showcase so the camera "hands over" from one scene to the next.
  'sc-ais':        { x: 0.3,  y: -0.06, z: 0.2,  roll: 0.008,  fov: 1 },
  'sc-drone':      { x: -0.3, y: 0.08,  z: 0,    roll: -0.008, fov: -1 },
  'sc-powerbi':    { x: 0.28, y: 0.04,  z: 0.25, roll: 0.006,  fov: 1 },
  'sc-starfighter':{ x: -0.34, y: -0.05, z: 0.3, roll: -0.01,  fov: 1.5 },
  'sc-netflixx':   { x: 0.3,  y: 0.06,  z: 0.1,  roll: 0.008,  fov: -0.5 },
  'sc-pooki':      { x: -0.26, y: 0.04, z: 0.2,  roll: -0.006, fov: 0.5 },
  // Phase 5: About -> Tools -> Timeline -> Certificates, alternating gentle orbits so the camera hands over scene to scene.
  about:        { x: 0.3,   y: -0.05, z: 0.25,  roll: 0.008,  fov: 1 },
  skills:       { x: -0.32, y: 0.08,  z: -0.1,  roll: -0.009, fov: -1 },
  journey:      { x: 0.26,  y: -0.06, z: 0.3,   roll: 0.007,  fov: 1.2 },
  certificates: { x: -0.3,  y: 0.05,  z: 0.2,   roll: -0.008, fov: 0.8 },
  // Phase 6: the final scene eases the camera slightly closer; a slow automatic orbit (below) adds life while the Earth is visible.
  contact:      { x: -0.12, y: 0.04,  z: 0,      roll: 0.004,  fov: 0 }   // PHASE 7: no dolly/zoom - it magnified the Earth ~5% past its anchor and clipped it at the viewport edge
}
const ZERO = { x: 0, y: 0, z: 0, roll: 0, fov: 0 }
const shot = { x: 0, y: 0, z: 0, roll: 0, fov: 0 }

// Cinematic camera: automatic intro dolly (no input needed) -> settles on the reference pose that matches the
// HTML layout, then idles with slow drift + pointer depth + scroll-aware orbit + AURA section shots.
export default function CameraRig() {
  useFrame(({ camera, clock }, dt) => {
    const t = clock.elapsedTime
    const intro = 1 - easeOutQuart(clamp(t / INTRO_SECONDS, 0, 1)) // 1 -> 0
    const damp = 1 - Math.exp(-dt * 3)
    cur.x += (pointerState.x - cur.x) * damp
    cur.y += (pointerState.y - cur.y) * damp
    const sp = scrollState.progress

    const target = SHOTS[scrollState.section] || ZERO
    const k = 1 - Math.exp(-dt * 1.7)
    shot.x += (target.x - shot.x) * k; shot.y += (target.y - shot.y) * k; shot.z += (target.z - shot.z) * k
    shot.roll += (target.roll - shot.roll) * k; shot.fov += (target.fov - shot.fov) * k

    const space = scrollState.space
    const x = cur.x * 0.36 + Math.sin(t * 0.17) * 0.16 + Math.sin(sp * Math.PI * 2) * 0.28 - intro * 5.4 + shot.x + Math.sin(t * 0.07) * 0.14 * space
    const y = cur.y * 0.22 + Math.cos(t * 0.13) * 0.09 + intro * 1.9 + shot.y + Math.cos(t * 0.055) * 0.06 * space
    const z = REF.dist + intro * 7.5 + Math.sin(sp * Math.PI) * 0.45 + shot.z
    camera.position.set(x, y, z)
    look.set(intro * 2.4, -intro * 0.5, 0)
    camera.lookAt(look)
    camera.rotateZ(intro * 0.13 + Math.sin(sp * Math.PI * 2) * 0.012 + shot.roll)

    const fov = REF.fov + intro * 14 + shot.fov
    if (Math.abs(camera.fov - fov) > 0.001) { camera.fov = fov; camera.updateProjectionMatrix() }
  })
  return null
}
