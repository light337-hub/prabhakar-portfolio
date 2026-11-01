import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { goToAura, mountAllAura } from './aura/lazyBlocks'

// One place that owns scroll position for the whole app:
//  - PUSH / REPLACE to a path   -> top of the new page (instant)
//  - PUSH / REPLACE with #hash  -> that element (smooth on the same page, instant when arriving from another page)
//  - /aura#aura-xxx             -> mounts the lazy AURA blocks first, then jumps
//  - POP (Back / Forward / reload) -> the exact scroll position the visitor had on that history entry
//  - state.noScroll             -> the URL changed only to record the hash after an in-page jump; do nothing
const KEY = k => `pj-scroll:${k}`
const readY = k => { try { const v = sessionStorage.getItem(KEY(k)); return v == null ? null : Number(v) } catch (e) { return null } }
const writeY = (k, y) => { try { sessionStorage.setItem(KEY(k), String(Math.round(y))) } catch (e) { /* storage unavailable */ } }
const jump = y => window.scrollTo({ top: y, left: 0, behavior: 'instant' })
const frame = () => new Promise(r => requestAnimationFrame(r))
async function until(test, ms) {
  const end = performance.now() + ms
  while (performance.now() < end) { if (test()) return true; await frame() }
  return test()
}
// On a fresh visit (typed URL / new link) never restore an old position; only for reload / back-forward document loads.
const initialNavType = () => { try { return performance.getEntriesByType('navigation')[0]?.type } catch (e) { return undefined } }

export default function ScrollManager() {
  const location = useLocation()
  const type = useNavigationType()
  const yRef = useRef(0)
  const keyRef = useRef(null)
  const pathRef = useRef(null)
  const tokenRef = useRef(0)
  const firstRef = useRef(true)

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    yRef.current = window.scrollY
    const onScroll = () => { yRef.current = window.scrollY }
    const persist = () => { if (keyRef.current) writeY(keyRef.current, yRef.current) }
    const onVis = () => { if (document.visibilityState === 'hidden') persist() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', persist)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', persist)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Layout effect: runs in the same commit as the route swap, before the browser can clamp the old scroll position,
  // so the position saved for the page we are leaving is still the real one.
  useLayoutEffect(() => {
    const prevKey = keyRef.current
    const prevPath = pathRef.current
    if (prevKey && prevKey !== location.key) writeY(prevKey, yRef.current)
    keyRef.current = location.key
    pathRef.current = location.pathname

    const first = firstRef.current
    firstRef.current = false
    const token = ++tokenRef.current
    const stale = () => token !== tokenRef.current
    if (location.state && location.state.noScroll && type !== 'POP') return

    const hash = (() => { try { return decodeURIComponent(location.hash.slice(1)) } catch (e) { return location.hash.slice(1) } })()
    const onAura = location.pathname === '/aura'
    const restorable = type === 'POP' && (!first || ['reload', 'back_forward'].includes(initialNavType()))
    const saved = restorable ? readY(location.key) : null

    ;(async () => {
      if (saved != null && saved > 4) {
        if (onAura) await mountAllAura()
        await until(() => document.documentElement.scrollHeight - window.innerHeight >= saved - 4, 1800)
        if (!stale()) jump(saved)
        return
      }
      if (hash) {
        if (onAura && hash.startsWith('aura-')) { await goToAura(hash, true); return }
        await until(() => !!document.getElementById(hash), 2500)
        const el = document.getElementById(hash)
        if (el && !stale()) el.scrollIntoView({ behavior: prevPath === location.pathname ? 'smooth' : 'instant', block: 'start' })
        return
      }
      if (!stale()) window.scrollTo({ top: 0, left: 0, behavior: prevPath === location.pathname ? 'smooth' : 'instant' })
    })()
  }, [location.key]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
