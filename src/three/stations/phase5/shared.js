import * as THREE from 'three'
// Shared helpers for the Phase 5 stations (About, Tools, Timeline, Certificates). All stations live in the ONE global canvas.
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
export const goldMat = () => new THREE.MeshStandardMaterial({ color: '#DDB43F', metalness: 1, roughness: 0.26, flatShading: true, envMapIntensity: 1.8 })
export const tintMat = (color, e = 0.18) => new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.3, flatShading: true, envMapIntensity: 1.6, emissive: color, emissiveIntensity: e })
export const GEOS = () => [new THREE.OctahedronGeometry(1, 0), new THREE.IcosahedronGeometry(1, 0), new THREE.TetrahedronGeometry(1.15, 0), new THREE.DodecahedronGeometry(0.95, 0)]
export const disposeAll = (...xs) => xs.flat(Infinity).forEach(x => x && x.dispose && x.dispose())
