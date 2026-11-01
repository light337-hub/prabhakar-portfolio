import { useEffect, useRef, useState } from 'react'
import useReducedMotion from './useReducedMotion'
// Scroll-triggered entrance: returns [ref, seen]. `seen` flips to true once the element enters the viewport (and stays true).
// With reduced motion, or if IntersectionObserver is missing, content is simply shown.
export default function useReveal(margin = '0px 0px -12% 0px') {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced || typeof IntersectionObserver === 'undefined') { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, margin])
  return [ref, seen || reduced]
}
