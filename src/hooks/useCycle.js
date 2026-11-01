import { useEffect, useState } from 'react'
// Steps through 0..n-1 every `ms` while `enabled`. Used for automatic guided tours (never required for access to content).
export default function useCycle(n, ms, enabled) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!enabled || n < 2) return
    const id = setInterval(() => setI(v => (v + 1) % n), ms)
    return () => clearInterval(id)
  }, [n, ms, enabled])
  return [i, setI]
}
