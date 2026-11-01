import React, { lazy, Suspense } from 'react'
import HeroStation from './HeroStation'
import AuraStation from './AuraStation'
import LazyWhenNear from '../LazyWhenNear'

// Scene station registry. Each station is locked to an HTML anchor (see anchors.js), so later phases only add an entry here
// (e.g. project scenes, live demos, timeline, certificate gallery) without touching the canvas, camera or loop.
// Heavy stations are lazy chunks mounted by LazyWhenNear once their anchor nears the viewport. AURA's case-study anchors
// only exist after the matching lazy HTML block has mounted, so these stations load strictly on demand.
// Phase 6: EarthStation (real 3D Earth + stars) is the Contact scene. The old procedural ContactStation stays retired on disk.
const AisStation = lazy(() => import('./gallery/AisStation'))
const DroneStation = lazy(() => import('./gallery/DroneStation'))
const PowerBiStation = lazy(() => import('./gallery/PowerBiStation'))
const StarfighterStation = lazy(() => import('./gallery/StarfighterStation'))
const NetflixxStation = lazy(() => import('./gallery/NetflixxStation'))
const PookiStation = lazy(() => import('./gallery/PookiStation'))
const AboutStation = lazy(() => import('./phase5/AboutStation'))
const ToolsStation = lazy(() => import('./phase5/ToolsStation'))
const TimelineStation = lazy(() => import('./phase5/TimelineStation'))
const CertStation = lazy(() => import('./phase5/CertStation'))
const EarthStation = lazy(() => import('./EarthStation'))
const AuraArchStation = lazy(() => import('./AuraArchStation'))
const AuraIntelStation = lazy(() => import('./AuraIntelStation'))
const AuraWorkflowStation = lazy(() => import('./AuraWorkflowStation'))

export default function Stations({ mobile }) {
  return (
    <>
      <HeroStation mobile={mobile} />
      <AuraStation mobile={mobile} />
      <LazyWhenNear anchor="aura-arch" screens={1.5}>
        <Suspense fallback={null}><AuraArchStation mobile={mobile} /></Suspense>
      </LazyWhenNear>
      <LazyWhenNear anchor="aura-chronos-visual" screens={1.5}>
        <Suspense fallback={null}><AuraIntelStation mobile={mobile} /></Suspense>
      </LazyWhenNear>
      <LazyWhenNear anchor="aura-workflow-map" screens={1.5}>
        <Suspense fallback={null}><AuraWorkflowStation mobile={mobile} /></Suspense>
      </LazyWhenNear>
      {/* Phase 4 gallery: one station per showcase stage, mounted lazily when its HTML stage nears the viewport. */}
      {[['stage-ais', AisStation], ['stage-drone', DroneStation], ['stage-powerbi', PowerBiStation], ['stage-starfighter', StarfighterStation], ['stage-netflixx', NetflixxStation], ['stage-pooki', PookiStation]].map(([id, S]) => (
        <LazyWhenNear key={id} anchor={id} screens={1.5}><Suspense fallback={null}><S mobile={mobile} /></Suspense></LazyWhenNear>
      ))}
      {/* Phase 5: About -> Tools -> Timeline -> Certificates, each a lazy station locked to its HTML anchor. */}
      <LazyWhenNear anchor="about-portrait" screens={1.5}><Suspense fallback={null}><AboutStation mobile={mobile} /></Suspense></LazyWhenNear>
      <LazyWhenNear anchor="tools-stage" screens={1.5}><Suspense fallback={null}><ToolsStation mobile={mobile} /></Suspense></LazyWhenNear>
      <LazyWhenNear anchor="journey-rail" screens={1.5}><Suspense fallback={null}><TimelineStation mobile={mobile} /></Suspense></LazyWhenNear>
      <LazyWhenNear anchor="cert-stage" screens={1.5}><Suspense fallback={null}><CertStation mobile={mobile} /></Suspense></LazyWhenNear>
      {/* Phase 6: Contact Earth. Mounts (and starts loading its textures) one screen before the section arrives. */}
      <LazyWhenNear anchor="earth-stage" screens={1.2}><Suspense fallback={null}><EarthStation mobile={mobile} /></Suspense></LazyWhenNear>
    </>
  )
}
