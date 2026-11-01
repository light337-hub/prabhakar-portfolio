import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { REF } from './constants'
import CameraRig from './CameraRig'
import AnchorSync from './AnchorSync'
import Particles from './Particles'
import Stations from './stations'

// ONE global, fixed, non-interactive canvas behind all HTML content.
// Perf rules: DPR capped, frame loop paused while the tab is hidden, fewer particles / lighter meshes on small screens,
// static environment map (baked once), heavy stations mounted lazily.
export default function SceneRoot() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const [ready, setReady] = useState(false)
  const mobile = typeof window !== 'undefined' && window.innerWidth < 760
  useEffect(() => {
    const f = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [])
  return (
    <div className={`scene-root${ready ? ' is-ready' : ''}`} aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, mobile ? 1.25 : 1.5]}
        camera={{ position: [0, 0, REF.dist], fov: REF.fov, near: 0.1, far: 60 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping
          gl.toneMappingExposure = 1.1
          setReady(true)
        }}
      >
        <Suspense fallback={null}>
          <AnchorSync />
          <ambientLight intensity={0.12} />
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={3.2} color="#FFF1C9" position={[-5, 4, 5]} scale={[7, 2.2, 1]} />
            <Lightformer form="rect" intensity={2.2} color="#F5D76E" position={[-7, 0, 0]} scale={[1.4, 8, 1]} />
            <Lightformer form="rect" intensity={2.0} color="#D4AF37" position={[7, -1, 2]} scale={[1.6, 7, 1]} />
            <Lightformer form="rect" intensity={2.6} color="#FFE6A0" position={[0, 6, -3]} scale={[10, 1.2, 1]} />
            <Lightformer form="rect" intensity={0.8} color="#B8902A" position={[0, -6, 2]} scale={[10, 1.5, 1]} />
            <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[0, 0, -6]} scale={6} />
          </Environment>
          <Particles count={mobile ? 220 : 620} size={0.045} opacity={0.75} parallax={0.0006} />
          {!mobile && <Particles count={90} size={0.11} opacity={0.5} parallax={0.0016} zRange={NEAR_Z} />}
          <CameraRig />
          <Stations mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
const NEAR_Z = [1, 5]
