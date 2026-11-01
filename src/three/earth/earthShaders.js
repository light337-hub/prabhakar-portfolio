// GLSL for the Phase 6 Contact Earth. Plain strings only (no imports) so the same source runs inside three's ShaderMaterial
// (GLSL ES 3.00 via three's prefix) and inside tools/earth/harness (raw WebGL2) for compile + visual checks.
// All view-space: the sun direction `uSun` is a unit vector in VIEW space, so the lighting stays fixed on screen while the
// planet rotates underneath it.  Textures: day + lights + clouds baked by tools/earth/make_earth_textures.py.

const OUT = /* glsl */`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`

// ---------------------------------------------------------------- planet
export const planetVert = /* glsl */`
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`

export const planetFrag = /* glsl */`
uniform sampler2D uDay; uniform sampler2D uLights; uniform sampler2D uClouds;
uniform vec3 uSun; uniform float uTime; uniform float uReveal; uniform float uCloudShadow; uniform vec2 uCloudShift;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uSun);
  float nl = dot(N, L);
  vec3 day = texture2D(uDay, vUv, 0.9).rgb;                      // PHASE 7: mip bias softens the baked high-frequency land grain
  float lum = dot(day, vec3(0.299, 0.587, 0.114));
  float water = smoothstep(0.02, 0.16, day.b - max(day.r, day.g * 0.92)) * (1.0 - smoothstep(0.55, 0.8, lum));

  // PHASE 7 grade: calm over-saturated greens toward a warm olive-gold, ocean left untouched
  day = mix(day, mix(vec3(lum), day, 0.78) * vec3(1.05, 1.0, 0.93), 1.0 - water);

  // soft cloud shadow on the surface (the cloud sphere is drawn separately)
  float cs = texture2D(uClouds, vUv + uCloudShift, 0.6).r;
  float shadow = 1.0 - uCloudShadow * smoothstep(0.3, 0.9, cs);

  float lit = smoothstep(-0.10, 0.34, nl);                       // day / night with a soft terminator
  float diffuse = max(nl, 0.0);
  vec3 sunCol = vec3(1.0, 0.95, 0.84);
  vec3 col = day * sunCol * (0.07 + 1.55 * pow(diffuse, 0.82)) * lit * shadow;

  // twilight band: warm gold at the terminator
  float tw = exp(-pow((nl - 0.02) / 0.14, 2.0));
  col += day * vec3(1.0, 0.50, 0.14) * tw * 0.55 * smoothstep(-0.25, 0.1, nl);

  // faint blue "moonlight / skyglow" so the continents are not pure black at night
  float night = 1.0 - smoothstep(-0.12, 0.30, nl);
  col += day * vec3(0.10, 0.17, 0.34) * 0.19 * night * (0.5 + 0.5 * (1.0 - water));

  // ocean sun glint
  vec3 H = normalize(L + V);
  float glint = pow(max(dot(N, H), 0.0), 120.0) * 0.9 + pow(max(dot(N, H), 0.0), 18.0) * 0.12;
  col += vec3(1.0, 0.90, 0.68) * glint * water * smoothstep(0.0, 0.25, nl) * shadow;

  // golden city lights (sampled sharp + a blurred mip for the sodium glow), only on the dark side
  float lc = texture2D(uLights, vUv).r;
  float lg = textureLod(uLights, vUv, 3.2).r;
  float flick = 0.94 + 0.06 * sin(uTime * 1.7 + vUv.x * 500.0 + vUv.y * 310.0);
  float cityMask = (1.0 - smoothstep(-0.04, 0.26, nl)) * (1.0 - 0.75 * smoothstep(0.55, 0.95, cs));
  vec3 gold = vec3(1.0, 0.70, 0.27);
  col += (gold * lc * 1.1 + vec3(1.0, 0.52, 0.14) * lg * 0.6) * cityMask * flick * uReveal;

  // atmosphere seen through the limb: blue on the sunlit side, gold toward the terminator
  float nv = max(dot(N, V), 0.0);
  float fres = pow(1.0 - nv, 3.2);
  vec3 sky = mix(vec3(0.95, 0.62, 0.22), vec3(0.32, 0.58, 1.0), smoothstep(-0.05, 0.55, nl));
  col += sky * fres * (0.015 + 1.1 * smoothstep(-0.18, 0.5, nl));

  gl_FragColor = vec4(col * (0.35 + 0.65 * uReveal), 1.0);
${OUT}
}`

// ---------------------------------------------------------------- clouds (separate slightly larger sphere)
export const cloudVert = planetVert
export const cloudFrag = /* glsl */`
uniform sampler2D uClouds; uniform vec3 uSun; uniform float uReveal;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uSun);
  float c = texture2D(uClouds, vUv, 0.6).r;
  float a = smoothstep(0.26, 0.98, c) * 0.62;                     // PHASE 7: wider ramp + mip bias = soft cloud bodies, no speckle
  float nl = dot(N, L);
  float lit = smoothstep(-0.12, 0.36, nl);
  vec3 col = vec3(1.0, 0.98, 0.95) * (0.04 + 1.25 * max(nl, 0.0)) * lit;
  col += vec3(1.0, 0.55, 0.2) * exp(-pow((nl - 0.03) / 0.13, 2.0)) * 0.5 * smoothstep(-0.25, 0.1, nl);
  col += vec3(0.12, 0.18, 0.32) * 0.10 * (1.0 - lit);                   // night side: barely-there blue
  float limb = pow(1.0 - max(dot(N, V), 0.0), 2.0);
  a *= 1.0 - 0.45 * limb;
  gl_FragColor = vec4(col, a * uReveal);
${OUT}
}`

// ---------------------------------------------------------------- atmosphere glow (BackSide shell, additive)
export const atmoVert = /* glsl */`
varying vec3 vN;
void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
export const atmoFrag = /* glsl */`
uniform vec3 uSun; uniform float uReveal; uniform float uStrength;
varying vec3 vN;
void main(){
  float k = clamp(-vN.z / 0.55, 0.0, 1.0);
  k = pow(k, 2.3);
  // vN.xy is the radial direction of this rim point on screen; compare it with the sun's screen direction
  float sunSide = smoothstep(-0.45, 0.85, dot(normalize(vN.xy + 1e-5), normalize(uSun.xy + 1e-5)));
  vec3 warm = vec3(1.0, 0.66, 0.24), cool = vec3(0.30, 0.58, 1.0);
  vec3 col = mix(cool, warm, smoothstep(0.35, 1.0, sunSide)) * k;
  float a = k * (0.05 + 1.0 * sunSide) * uStrength * uReveal;
  gl_FragColor = vec4(col * a, a);
${OUT}
}`

// ---------------------------------------------------------------- orbit paths: thin line + a travelling comet arc
export const orbitVert = /* glsl */`
attribute float aAng; varying float vAng;
void main(){ vAng = aAng; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
export const orbitFrag = /* glsl */`
uniform float uHead; uniform float uDir; uniform float uReveal; uniform vec3 uColor; uniform float uBase;
varying float vAng;
void main(){
  float d = mod((uHead - vAng) * uDir + 6.2831853, 6.2831853);                    // angular distance behind the head
  float tail = exp(-d * 2.6) * step(d, 3.2);
  float a = (uBase + 0.85 * tail) * uReveal;
  gl_FragColor = vec4(uColor * a, a);
${OUT}
}`

// ---------------------------------------------------------------- deep-space stars (rect-locked, perspective-corrected)
export const starVert = /* glsl */`
attribute float aSeed; attribute float aSize;
uniform float uTime; uniform vec2 uHalf; uniform float uDist; uniform float uDpr; uniform float uReveal;
varying float vA; varying float vSeed;
void main(){
  float f = 1.0 - position.z / uDist;                                    // perspective compensation so stars cover the section rect
  vec3 p = vec3(position.xy * uHalf * f, position.z);
  p.x += sin(uTime * 0.05 + aSeed * 40.0) * 0.05;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uDpr * (300.0 / max(0.5, -mv.z));
  float edge = 1.0 - smoothstep(0.62, 1.0, abs(position.y));            // fade near the top / bottom of the section
  float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.9) + aSeed * 90.0);
  vA = edge * tw * uReveal; vSeed = aSeed;
}`
export const starFrag = /* glsl */`
varying float vA; varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d); a *= a;
  vec3 col = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.92, 0.74), step(0.82, vSeed));
  gl_FragColor = vec4(col, a * vA);
${OUT}
}`

// ---------------------------------------------------------------- nebula backdrop (existing cosmic asset, additive, masked)
export const nebulaVert = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
export const nebulaFrag = /* glsl */`
uniform sampler2D uTex; uniform float uReveal; uniform float uOpacity;
varying vec2 vUv;
void main(){
  vec3 t = texture2D(uTex, vUv).rgb;
  vec2 q = (vUv - vec2(0.56, 0.5)) / vec2(0.62, 0.62);
  float m = 1.0 - smoothstep(0.25, 1.0, length(q));
  float edgeY = smoothstep(0.0, 0.3, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
  float a = m * edgeY * uOpacity * uReveal;
  gl_FragColor = vec4(t * a, a);
${OUT}
}`
