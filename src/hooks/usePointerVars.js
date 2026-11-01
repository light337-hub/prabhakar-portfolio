import { useEffect } from 'react'
import { pointerState } from '../three/scrollStore'
import useReducedMotion from './useReducedMotion'
// Writes smoothed pointer position into CSS variables (--px, --py) on an element while it is on screen.
// Fine pointers only; no React re-render. Pointer interaction is an enhancement, never required.
export default function usePointerVars(ref) {
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !window.matchMedia('(pointer: fine)').matches) return
    let raf = 0, inView = false, x = 0, y = 0
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting }, { threshold: 0 })
    io.observe(el)
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!inView || document.hidden) return
      x += (pointerState.x - x) * 0.06; y += (pointerState.y - y) * 0.06
      el.style.setProperty('--px', x.toFixed(4)); el.style.setProperty('--py', y.toFixed(4))
    }
    loop()
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [ref, reduced])
}
