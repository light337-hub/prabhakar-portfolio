import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage } from './common'

// Drone: an ILLUSTRATIVE quadcopter built from primitives (graphite frame, silver motors, restrained gold accents), lit by the
// scene's environment map, slowly rotating above a gold ring. It is not a model of the user's actual prototype.
export default function DroneStation() {
  const { outer, inner, step } = useStage('stage-drone')
  const body = useRef(), props = useRef([])
  const m = useMemo(() => ({
    graphite: new THREE.MeshStandardMaterial({ color: '#2b2e35', metalness: 0.9, roughness: 0.34, envMapIntensity: 1.5 }),
    arm: new THREE.MeshStandardMaterial({ color: '#41454e', metalness: 0.85, roughness: 0.3, envMapIntensity: 1.5 }),
    silver: new THREE.MeshStandardMaterial({ color: '#c3c8d2', metalness: 1, roughness: 0.22, envMapIntensity: 1.8 }),
    gold: new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 1, roughness: 0.24, envMapIntensity: 1.8 }),
    blade: new THREE.MeshStandardMaterial({ color: '#15161a', metalness: 0.4, roughness: 0.5 })
  }), [])
  const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]]
  useFrame(({ clock }, dt) => {
    const v = step(dt); if (v === null) return
    const t = clock.elapsedTime
    if (body.current) { body.current.rotation.y = t * 0.28; body.current.position.y = 0.12 + Math.sin(t * 1.1) * 0.05 + (1 - v) * 0.8 }
    props.current.forEach((p, i) => { if (p) p.rotation.y = t * 38 * (i % 2 ? -1 : 1) })
  })
  return (
    <group ref={outer}>
      <group ref={inner}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}><ringGeometry args={[1.25, 1.265, 128]} /><meshBasicMaterial color="#D4AF37" transparent opacity={0.7} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}><ringGeometry args={[0.8, 0.806, 96]} /><meshBasicMaterial color="#c3c8d2" transparent opacity={0.3} /></mesh>
        <group ref={body} rotation={[0.38, 0, 0]} scale={1.15}>
          <mesh material={m.graphite}><boxGeometry args={[0.62, 0.12, 0.62]} /></mesh>
          <mesh position={[0, 0.075, 0]} material={m.gold}><boxGeometry args={[0.44, 0.025, 0.44]} /></mesh>
          <mesh rotation={[0, Math.PI / 4, 0]} material={m.arm}><boxGeometry args={[1.62, 0.045, 0.075]} /></mesh>
          <mesh rotation={[0, -Math.PI / 4, 0]} material={m.arm}><boxGeometry args={[1.62, 0.045, 0.075]} /></mesh>
          {corners.map(([x, z], i) => (
            <group key={i} position={[x * 0.57, 0.03, z * 0.57]}>
              <mesh material={m.silver}><cylinderGeometry args={[0.1, 0.1, 0.13, 24]} /></mesh>
              <mesh position={[0, 0.075, 0]} material={m.gold}><cylinderGeometry args={[0.045, 0.045, 0.03, 16]} /></mesh>
              <group ref={el => (props.current[i] = el)} position={[0, 0.11, 0]}>
                <mesh material={m.blade}><boxGeometry args={[0.66, 0.008, 0.05]} /></mesh>
                <mesh rotation={[0, Math.PI / 2, 0]} material={m.blade}><boxGeometry args={[0.66, 0.008, 0.05]} /></mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.33, 32]} /><meshBasicMaterial color="#c3c8d2" transparent opacity={0.07} depthWrite={false} /></mesh>
              </group>
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}
