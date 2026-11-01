import { useEffect, useRef, useState } from 'react'
// Reports whether an element is on screen (used to pause automatic tours and animations off screen).
export default function useInView(margin = '0px') {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, inView]
}
