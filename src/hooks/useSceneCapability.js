import useReducedMotion from './useReducedMotion'
// True only when the global 3D scene should run: WebGL available + motion allowed.
function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}
let cached
export default function useSceneCapability() {
  const reduced = useReducedMotion()
  if (cached === undefined && typeof document !== 'undefined') cached = hasWebGL()
  const lowPower = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 2
  return { enabled: !!cached && !reduced && !lowPower, reduced, webgl: !!cached }
}
