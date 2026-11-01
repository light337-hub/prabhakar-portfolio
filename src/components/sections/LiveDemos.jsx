import React from 'react'
import { Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'
import Showcase, { ExtLink } from '../gallery/Showcase'
import { liveDemos, linkedinShowcase } from '../../data/content'
import { demoShowcases } from '../../data/gallery'

// Phase 4: three live demos as individual cinematic showcases (stage-starfighter / stage-netflixx / stage-pooki) plus a
// separate LinkedIn profile action that is NOT tied to any particular demo.
export default function LiveDemos() {
  return <section className="demos section-wrap" id="live-demos">
    <div className="section-heading"><div><p className="eyebrow">02 / LIVE BUILDS</p><h2>Interactive Builds & <em>Live Demos</em></h2></div><span className="section-index">{String(liveDemos.length).padStart(2, '0')} LIVE</span></div>
    <div className="sc-list sc-demos">
      {liveDemos.map((d, i) => {
        const c = demoShowcases[d.id]
        return <Showcase key={d.id} sectionId={`sc-${d.id}`} stageId={`stage-${d.id}`} accent={d.id} flip={i % 2 === 1} title={d.title} {...c}
          actions={<ExtLink href={d.url}>View Live Demo</ExtLink>} />
      })}
    </div>
    <motion.div className="sc-linkedin" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
      <span className="sc-li-icon" aria-hidden="true"><Linkedin size={26}/></span>
      <div><small>CONNECT WITH ME</small><h3>{linkedinShowcase.title}</h3><p>My projects, internship and experience, on my personal LinkedIn profile.</p></div>
      <ExtLink href={linkedinShowcase.url} className="btn btn-gold">View LinkedIn Profile</ExtLink>
    </motion.div>
  </section>
}
