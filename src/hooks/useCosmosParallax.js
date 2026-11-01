import { useEffect } from 'react'
import useReducedMotion from './useReducedMotion'

// Lightweight parallax for the cosmic backdrop layers (no WebGL, no extra canvas).
// Writes three CSS variables on the element: --cx / --cy (smoothed pointer, -1..1) and --cs (scroll through the element, -1..1).
// The rAF loop only runs while the element is on screen and the tab is visible; reduced motion = variables stay at 0.
export default function useCosmosParallax(ref) {
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return undefined
    const fine = window.matchMedia('(pointer: fine)').matches
    const s = { tx: 0, ty: 0, x: 0, y: 0, vis: false, raf: 0 }
    const onMove = e => { s.tx = (e.clientX / window.innerWidth) * 2 - 1; s.ty = (e.clientY / window.innerHeight) * 2 - 1 }
    const tick = () => {
      s.raf = 0
      if (!s.vis || document.hidden) return
      s.x += (s.tx - s.x) * 0.06; s.y += (s.ty - s.y) * 0.06
      const r = el.getBoundingClientRect()
      const cs = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / (window.innerHeight * 0.9 + r.height / 2)))
      el.style.setProperty('--cx', s.x.toFixed(4)); el.style.setProperty('--cy', s.y.toFixed(4)); el.style.setProperty('--cs', cs.toFixed(4))
      s.raf = requestAnimationFrame(tick)
    }
    const start = () => { if (!s.raf && s.vis) s.raf = requestAnimationFrame(tick) }
    const io = new IntersectionObserver(([en]) => {
      s.vis = en.isIntersecting
      el.classList.toggle('is-live', s.vis)   // CSS drift animations only run while visible
      if (s.vis) start()
    }, { rootMargin: '80px' })
    io.observe(el)
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', start)
    return () => { io.disconnect(); window.removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', start); cancelAnimationFrame(s.raf) }
  }, [ref, reduced])
}
