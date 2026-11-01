import { useFrame } from '@react-three/fiber'
import { measureAnchors } from './anchors'
// Runs first every frame so all stations read fresh DOM rectangles.
export default function AnchorSync() {
  useFrame(() => measureAnchors(), -10)
  return null
}
