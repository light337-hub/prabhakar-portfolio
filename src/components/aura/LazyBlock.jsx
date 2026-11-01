import React, { Suspense, useEffect, useRef, useState } from 'react'

// Case-study block that always renders its <section id> (so navigation, scroll tracking and anchors work),
// but only mounts its heavy content when it nears the viewport or when navigation targets it.
export default function LazyBlock({ id, label, minHeight = 760, className = '', children }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (on) return
    const open = () => setOn(true)
    window.addEventListener('aura:mount-all', open)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true) }, { rootMargin: '900px 0px' })
    if (ref.current) io.observe(ref.current)
    return () => { window.removeEventListener('aura:mount-all', open); io.disconnect() }
  }, [on])
  return (
    <section id={id} ref={ref} className={`aura-block ${className}`} aria-label={label} style={on ? undefined : { minHeight }}>
      {on
        ? <Suspense fallback={<div className="aura-loading" role="status">Loading {label}…</div>}>{children}</Suspense>
        : <div className="aura-loading" aria-hidden="true">{label}</div>}
    </section>
  )
}
