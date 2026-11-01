import React from 'react'
import Showcase from '../gallery/Showcase'
import { coreShowcases } from '../../data/gallery'

// Phase 4: the core projects are cinematic showcases. Each stage anchor (stage-ais / stage-drone / stage-powerbi) is picked up
// by its 3D station in the single global canvas. No project has a public link supplied, so no "View Project" action is shown.
export default function Projects() {
  return <section className="more-projects section-wrap" id="more-projects">
    <div className="other-heading"><div><p className="eyebrow">03 / MORE BUILDS</p><h3>Other projects</h3></div><span>Experiments, systems and things I've built.</span></div>
    <div className="sc-list">
      {coreShowcases.map((p, i) => <Showcase key={p.id} sectionId={`sc-${p.id}`} stageId={`stage-${p.id}`} accent={p.id} flip={i % 2 === 1} {...p} />)}
    </div>
  </section>
}
