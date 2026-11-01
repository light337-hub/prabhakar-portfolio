import * as THREE from 'three'
// One shared soft round glow sprite texture (gold), created lazily and reused by every AURA station.
let tex
export function glowTexture() {
  if (tex) return tex
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,241,201,1)'); grad.addColorStop(0.25, 'rgba(245,215,110,.55)')
  grad.addColorStop(0.6, 'rgba(212,175,55,.12)'); grad.addColorStop(1, 'rgba(212,175,55,0)')
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128)
  tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
