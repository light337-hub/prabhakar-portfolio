import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { anchorWorld } from './anchors'
const tmp = { x: 0, y: 0, w: 0, h: 0, near: false, progress: 0 }
// Mounts heavy children only when their anchor approaches the viewport (texture generation, lazy chunks).
export default function LazyWhenNear({ anchor, screens = 2, children }) {
  const [on, setOn] = useState(false)
  useFrame(() => {
    if (on) return
    const a = anchorWorld(anchor, tmp, screens)
    if (a && a.near) setOn(true)
  })
  return on ? children : null
}
