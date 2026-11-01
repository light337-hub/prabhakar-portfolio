import React from 'react'
import AuraIntro from '../aura/AuraIntro'

// Main portfolio (/): the AURA feature only. #projects stays the anchor used by the hero and the nav.
// The full case study (problem, architecture, modules, AI/ML, workflow, stack, publication) lives on its own page: /aura.
export default function Aura() {
  return (
    <div id="projects" className="aura-case">
      <AuraIntro variant="teaser" />
    </div>
  )
}
