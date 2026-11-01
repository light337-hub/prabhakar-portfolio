import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import GoldRibbon from '../GoldRibbon'
import GoldGems from '../GoldGems'
import useAnchor from '../useAnchor'
import { pointerState } from '../scrollStore'

// Station 1: hero. Locked to the portrait arch (anchor "hero-portrait", design width = 3 units).
export default function HeroStation({ mobile }) {
  const group = useRef(), inner = useRef()
  useAnchor('hero-portrait', group, { unit: 3, screens: 1.2 })
  useFrame((_, dt) => {
    const g = inner.current; if (!g) return
    const k = 1 - Math.exp(-dt * 2.5)
    g.rotation.y += (pointerState.x * 0.14 - g.rotation.y) * k
    g.rotation.x += (-pointerState.y * 0.08 - g.rotation.x) * k
  })
  return (
    <group ref={group}>
      <group ref={inner}>
        <GoldRibbon segments={mobile ? 150 : 260} physical={!mobile} />
        <GoldGems mobile={mobile} />
      </group>
    </group>
  )
}
