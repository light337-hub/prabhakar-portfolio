import * as THREE from 'three'

// Procedural, offline "night Earth": simplified continent outlines [lon, lat] rasterised to a canvas, then
// gold city-light clusters scattered over the land. Stylised on purpose (coarse outlines, not survey data).
const LAND = [
  // North America
  [[-168,66],[-162,70],[-156,71],[-141,70],[-125,70],[-110,71],[-95,71],[-82,68],[-88,64],[-94,61],[-92,57],[-80,55],[-78,62],[-72,62],[-65,60],[-60,55],[-56,50],[-60,46],[-66,44],[-71,41],[-76,35],[-80,31],[-81,25],[-83,29],[-90,29],[-97,27],[-97,22],[-90,21],[-88,16],[-83,10],[-80,8],[-86,12],[-92,14],[-97,16],[-106,23],[-112,29],[-117,33],[-124,40],[-124,48],[-130,54],[-140,60],[-152,60],[-158,58],[-165,62]],
  // Greenland
  [[-73,78],[-60,82],[-30,83],[-20,78],[-20,70],[-30,67],[-43,60],[-50,64],[-55,70],[-65,76]],
  // South America
  [[-77,8],[-72,12],[-62,11],[-52,5],[-50,0],[-44,-3],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-41],[-66,-47],[-69,-52],[-72,-54],[-75,-50],[-74,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,0],[-78,4]],
  // Eurasia
  [[-9,37],[-9,43],[-2,44],[-4,48],[2,51],[5,53],[8,55],[10,57],[8,58],[5,62],[14,68],[25,71],[35,69],[41,67],[45,68],[60,69],[70,73],[80,73],[100,77],[113,74],[130,71],[150,71],[165,69],[179,66],[170,60],[163,58],[160,53],[156,57],[150,59],[142,59],[138,54],[141,49],[135,43],[130,42],[129,35],[126,35],[125,39],[121,40],[122,37],[121,31],[122,28],[118,24],[111,21],[108,21],[106,18],[109,12],[105,9],[101,13],[100,8],[103,1],[100,5],[98,10],[98,17],[94,17],[91,22],[87,21],[80,15],[77,8],[73,16],[72,21],[67,25],[61,25],[57,26],[56,24],[51,25],[50,30],[48,30],[51,27],[56,26],[58,20],[52,16],[44,12],[43,15],[39,21],[35,28],[34,31],[36,36],[27,37],[26,40],[24,38],[21,37],[20,40],[14,45],[12,44],[18,40],[16,38],[12,42],[9,44],[3,43],[0,39],[-5,36]],
  // Africa
  [[-17,21],[-16,28],[-10,30],[-6,35],[10,37],[11,33],[20,31],[32,31],[35,28],[38,20],[43,12],[51,12],[48,5],[40,-3],[40,-10],[35,-20],[33,-26],[27,-34],[19,-35],[15,-27],[12,-17],[14,-10],[9,-1],[9,4],[4,6],[-8,4],[-13,8],[-17,14]],
  // Australia
  [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[135,-35],[130,-32],[115,-34],[114,-26]],
  // UK, Japan, Madagascar, Indonesia, New Guinea, New Zealand
  [[-5,50],[1,51],[2,53],[-2,57],[-5,58],[-6,55],[-3,54],[-5,51]],
  [[130,31],[135,34],[140,36],[142,40],[141,45],[145,44],[142,38],[140,35],[136,33],[131,33]],
  [[44,-25],[48,-25],[50,-15],[49,-12],[44,-17]],
  [[95,5],[98,3],[104,-2],[106,-6],[102,-4],[97,0]],
  [[109,2],[117,7],[119,1],[116,-4],[110,-3]],
  [[105,-6],[114,-8],[114,-9],[106,-7]],
  [[131,-1],[141,-3],[150,-10],[142,-9],[138,-8],[132,-4]],
  [[172,-34],[178,-38],[175,-41],[172,-41]],
  [[172,-41],[174,-42],[170,-46],[167,-46]]
]
// [lon, lat, weight] — dense urban regions (approximate)
const HOT = [
  [78,22,9],[115,32,10],[121,30,6],[139,36,7],[127,37,4],[8,49,8],[-1,52,5],[12,42,4],[30,50,4],[38,56,5],[-77,39,8],[-87,41,5],[-120,36,5],[-99,20,4],
  [-46,-23,6],[-58,-34,3],[4,7,4],[31,30,4],[50,30,4],[105,15,5],[110,-7,5],[120,14,3],[150,-33,3],[28,-26,3],[36,-1,2],[-70,-33,2],[-74,5,2],[67,30,3],[90,24,4],[100,14,3]
]

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const gauss = r => { let a = 0; for (let i = 0; i < 4; i++) a += r(); return (a - 2) * 1.7 }

export function makeGlobeTextures(w = 2048) {
  const h = w / 2, r = rng(1337)
  const X = lon => ((lon + 180) / 360) * w, Y = lat => ((90 - lat) / 180) * h
  const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
  const path = (ctx, poly) => { ctx.beginPath(); poly.forEach(([lo, la], i) => (i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la)))); ctx.closePath() }

  // hard land mask (for sampling)
  const mask = mk(), mx = mask.getContext('2d', { willReadFrequently: true })
  mx.fillStyle = '#000'; mx.fillRect(0, 0, w, h); mx.fillStyle = '#fff'
  LAND.forEach(p => { path(mx, p); mx.fill() })
  mx.fillRect(0, Y(-70), w, h - Y(-70))
  const md = mx.getImageData(0, 0, w, h).data
  const isLand = (lo, la) => { const x = Math.floor(X(lo)), y = Math.floor(Y(la)); return x >= 0 && x < w && y >= 0 && y < h && md[(y * w + x) * 4] > 128 }

  // base colour: near-black ocean, dark warm land with a faint gold coastline glow
  const base = mk(), bx = base.getContext('2d')
  bx.fillStyle = '#050505'; bx.fillRect(0, 0, w, h)
  bx.save(); bx.shadowColor = 'rgba(212,175,55,0.55)'; bx.shadowBlur = w / 220; bx.fillStyle = '#1d1608'
  LAND.forEach(p => { path(bx, p); bx.fill() })
  bx.fillRect(0, Y(-70), w, h - Y(-70)); bx.restore()
  bx.save(); bx.beginPath(); LAND.forEach(p => p.forEach(([lo, la], i) => (i ? bx.lineTo(X(lo), Y(la)) : bx.moveTo(X(lo), Y(la))))); bx.clip()
  for (let i = 0; i < 1400; i++) { bx.fillStyle = `rgba(184,144,42,${0.02 + r() * 0.05})`; bx.beginPath(); bx.arc(r() * w, r() * h, 6 + r() * 40, 0, 6.283); bx.fill() }
  bx.restore()
  bx.strokeStyle = 'rgba(212,175,55,0.5)'; bx.lineWidth = Math.max(1, w / 1400); bx.lineJoin = 'round'
  LAND.forEach(p => { path(bx, p); bx.stroke() })

  // city lights
  const lights = mk(), lx = lights.getContext('2d')
  lx.fillStyle = '#000'; lx.fillRect(0, 0, w, h)
  lx.globalCompositeOperation = 'lighter'
  const dot = (lo, la, big) => {
    const x = X(lo), y = Y(la), rad = (big ? 1.2 : 0.55) * (w / 2048) + r() * 0.6 * (w / 2048)
    lx.fillStyle = `rgba(255,${190 + Math.floor(r() * 45)},${70 + Math.floor(r() * 50)},${0.35 + r() * 0.65})`
    lx.beginPath(); lx.arc(x, y, rad, 0, 6.283); lx.fill()
  }
  HOT.forEach(([lo, la, wt]) => {
    const haze = lx.createRadialGradient(X(lo), Y(la), 0, X(lo), Y(la), (w / 2048) * (14 + wt * 2.4))
    haze.addColorStop(0, 'rgba(212,150,40,0.22)'); haze.addColorStop(1, 'rgba(212,150,40,0)')
    lx.fillStyle = haze; lx.fillRect(X(lo) - 80, Y(la) - 80, 160, 160)
    const n = Math.round(wt * (w / 2048) * 110), sig = 3.2 + wt * 0.45
    for (let i = 0; i < n; i++) { const a = lo + gauss(r) * sig, b = la + gauss(r) * sig * 0.7; if (isLand(a, b)) dot(a, b, i % 9 === 0) }
  })
  const scatter = Math.round(7000 * (w / 2048))
  for (let i = 0; i < scatter; i++) { const a = r() * 360 - 180, b = (r() - 0.5) * 140; if (Math.abs(b) < 62 && r() < Math.cos((b * Math.PI) / 180) && isLand(a, b)) dot(a, b, false) }

  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = THREE.RepeatWrapping; return t }
  return { base: tex(base), lights: tex(lights) }
}
