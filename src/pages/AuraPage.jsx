import React, { lazy, useEffect } from 'react'
import { trackSections } from '../three/scrollStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import AuraIntro from '../components/aura/AuraIntro'
import AuraProblem from '../components/aura/AuraProblem'
import AuraSubnav from '../components/aura/AuraSubnav'
import AuraPublication from '../components/aura/AuraPublication'
import LazyBlock from '../components/aura/LazyBlock'
import { loaders, resetAuraMount } from '../components/aura/lazyBlocks'
import { auraPageSectionIds } from '../data/aura'

// Route "/aura": the separate AURA case-study page. It reuses the Phase 3 components unchanged; only the page shell,
// the publication card and the routing are new. Intro + problem are light and load immediately; architecture, modules,
// AI/ML, workflow and stack are code-split and mount when they approach the viewport (or when navigation targets them).
const AuraArchitecture = lazy(loaders.architecture)
const AuraModules = lazy(loaders.modules)
const AuraIntelligence = lazy(loaders.intelligence)
const AuraWorkflow = lazy(loaders.workflow)
const AuraStack = lazy(loaders.stack)

export default function AuraPage() {
  useDocumentTitle('AURA — Case Study | Prabhakar J')
  useEffect(() => trackSections(auraPageSectionIds), [])
  // Leaving /aura unmounts the lazy blocks, so the next visit must mount them again before jumping to a section.
  useEffect(() => () => resetAuraMount(), [])
  return (
    <main className="page aura-page">
      <div className="aura-case">
        <AuraIntro variant="page" />
        <AuraSubnav />
        <AuraProblem />
        <LazyBlock id="aura-architecture" label="System architecture" minHeight={980} className="aura-arch-block"><AuraArchitecture /></LazyBlock>
        <LazyBlock id="aura-modules" label="Main modules" minHeight={900}><AuraModules /></LazyBlock>
        <LazyBlock id="aura-intelligence" label="AI and ML intelligence" minHeight={1500}><AuraIntelligence /></LazyBlock>
        <LazyBlock id="aura-workflow" label="Project workflow" minHeight={860} className="aura-wf-block"><AuraWorkflow /></LazyBlock>
        <LazyBlock id="aura-stack" label="Technology stack" minHeight={700}><AuraStack /></LazyBlock>
        <section id="aura-publication" className="aura-block aura-pub-block" aria-label="Journal publication"><AuraPublication /></section>
      </div>
    </main>
  )
}
