// Code-split loaders for the heavier AURA sections + navigation helpers that make sure they are mounted before scrolling.
export const loaders = {
  architecture: () => import('./AuraArchitecture'),
  modules: () => import('./AuraModules'),
  intelligence: () => import('./AuraIntelligence'),
  workflow: () => import('./AuraWorkflow'),
  stack: () => import('./AuraStack')
}
export const preloadAll = () => Promise.all(Object.values(loaders).map(load => load()))

let allMounted = false
let mounting = null
let gen = 0
const wait = ms => new Promise(r => setTimeout(r, ms))

// Routing: the AURA page unmounts when the visitor leaves /aura, so its lazy blocks unmount too. Reset the flag so the
// next visit mounts everything again before any jump.
export function resetAuraMount() { gen += 1; allMounted = false; mounting = null }

// Mount every lazy block (idempotent). Resolves once layout is final.
export function mountAllAura() {
  if (allMounted) return Promise.resolve()
  if (!mounting) {
    const g = gen
    mounting = (async () => {
      window.dispatchEvent(new Event('aura:mount-all'))
      try { await Promise.race([preloadAll(), wait(3000)]) } catch (e) { /* ignore: blocks still mount on approach */ }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await wait(160)
      if (g === gen) allMounted = true
    })()
  }
  return mounting
}

// Navigate to an AURA sub-section (only while the visitor is on /aura). The first jump mounts every lazy block and
// scrolls instantly; later jumps scroll smoothly. `syncUrl(id)` lets the router update the #hash without a new history entry.
export async function goToAura(id, instant = false, syncUrl) {
  if (typeof window === 'undefined') return
  const first = !allMounted
  await mountAllAura()
  if (window.location.pathname !== '/aura') return
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: first || instant ? 'instant' : 'smooth', block: 'start' })
  if (syncUrl) { try { syncUrl(id) } catch (e) { /* ignore */ } }
}
