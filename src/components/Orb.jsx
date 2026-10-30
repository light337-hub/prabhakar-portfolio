import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'

function GoldOrb() {
  return (
    <Float speed={1.15} rotationIntensity={0.35} floatIntensity={0.55}>
      <mesh scale={1.45}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial color="#c9a66b" metalness={0.88} roughness={0.2} distort={0.28} speed={1.4} />
      </mesh>
      <mesh rotation={[1.1, 0.3, 0.2]} scale={1.9}>
        <torusGeometry args={[1, 0.012, 12, 160]} />
        <meshStandardMaterial color="#e6c78f" metalness={0.9} roughness={0.25} />
      </mesh>
    </Float>
  )
}

export default function Orb({ className = '' }) {
  return (
    <div className={`orb-canvas ${className}`} aria-label="Decorative animated gold 3D orb">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 38 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 3, 4]} intensity={18} color="#f4d7a1" />
        <pointLight position={[-3, -2, 2]} intensity={7} color="#8b7048" />
        <Suspense fallback={null}>
          <GoldOrb />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}