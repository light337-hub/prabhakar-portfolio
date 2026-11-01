// Tiny shared state read by the 3D scene each frame (no React re-renders).
export const scrollState = { progress: 0, y: 0, section: 'home', space: 0 } // space: 0..1 = how far the Contact section has entered the view
export const pointerState = { x: 0, y: 0 } // -1..1, fine pointers only (mouse / pen)
let started = false
let sectionObserver = null

// Global listeners: started once for the whole app (scroll progress, pointer, document-height changes after route swaps).
export function startScrollTracking() {
  if (started || typeof window === 'undefined') return
  started = true
  let ticking = false
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    scrollState.y = window.scrollY
    scrollState.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    const c = document.getElementById('contact')
    if (c) { const r = c.getBoundingClientRect(); const k = (window.innerHeight - r.top) / (window.innerHeight * 0.85); scrollState.space = Math.min(1, Math.max(0, k)) } else scrollState.space = 0
    ticking = false
  }
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', update)
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return
    pointerState.x = (e.clientX / window.innerWidth) * 2 - 1
    pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }, { passive: true })
  // Page height changes when the route changes (or lazy blocks mount) without any scroll event.
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(schedule).observe(document.body)
  update()
}

// Routing: each page tells the scene which section ids exist on it. Returns a cleanup function.
export function trackSections(ids) {
  if (typeof window === 'undefined') return () => {}
  if (sectionObserver) sectionObserver.disconnect()
  scrollState.section = ids[0] || 'home'
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) scrollState.section = e.target.id }), { rootMargin: '-45% 0px -45% 0px' })
  sectionObserver = io
  ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
  return () => { io.disconnect(); if (sectionObserver === io) sectionObserver = null }
}
