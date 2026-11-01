import { useEffect, useRef } from 'react'
import { registerAnchor } from '../three/anchors'
// Attach the returned ref to a stable (non-transformed) element so a 3D station can lock to it.
export default function useSceneAnchor(id) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) return registerAnchor(id, ref.current) }, [id])
  return ref
}
