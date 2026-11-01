import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Boxes, Clapperboard, Cpu, Flame, Rocket, Ship, BarChart3 } from 'lucide-react'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import useReducedMotion from '../../hooks/useReducedMotion'

const ICONS = { ship: Ship, cpu: Cpu, chart: BarChart3, rocket: Rocket, film: Clapperboard, flame: Flame, boxes: Boxes }
const ease = [0.22, 1, 0.36, 1]

// One cinematic showcase: a transparent "stage" (the 3D station in the global canvas locks to its rectangle) beside real,
// accessible HTML copy. When WebGL is not running, a CSS fallback visual fills the stage. Nothing essential lives in the canvas.
export default function Showcase({ sectionId, stageId, accent, flip, num, icon, kicker, title, desc, purpose, tags, chips, pipeline, note, label, alt, actions }) {
  const stageRef = useSceneAnchor(stageId)
  const reduced = useReducedMotion()
  const Icon = ICONS[icon] || Boxes
  const rise = reduced ? {} : { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.9, ease } }
  const reveal = reduced ? {} : { initial: { y: '112%' }, whileInView: { y: 0 }, viewport: { once: true, amount: 0.8 }, transition: { duration: 0.95, ease } }
  return (
    <article className={`sc${flip ? ' sc-flip' : ''}`} id={sectionId} data-accent={accent} aria-labelledby={`${sectionId}-t`}>
      <div className="sc-stage" ref={stageRef}>
        <span className="sr-only">{alt}</span>
        <div className="sc-fallback" aria-hidden="true"><i/><i/><Icon size={54} strokeWidth={1}/></div>
        <span className="sc-num" aria-hidden="true">{num}</span>
        {chips && <ul className="sc-chips" aria-label="Verified project areas">{chips.map(c => <li key={c}>{c}</li>)}</ul>}
        <span className="sc-label">{label}</span>
      </div>
      <motion.div className="sc-copy" {...rise}>
        <p className="sc-kicker">{kicker}</p>
        <h3 id={`${sectionId}-t`} className="sc-title"><span className="sc-mask"><motion.span {...reveal}>{title}</motion.span></span></h3>
        <p className="sc-desc">{desc}</p>
        {pipeline && <ol className="sc-pipe" aria-label="Data flow">{pipeline.map((p, i) => <li key={p} style={{ '--i': i }}><b>{String(i + 1).padStart(2, '0')}</b><span>{p}</span></li>)}</ol>}
        {purpose && <p className="sc-purpose"><small>PURPOSE</small>{purpose}</p>}
        {tags && <div className="tags">{tags.map(t => <span key={t}>{t}</span>)}</div>}
        {note && <p className="sc-note">{note}</p>}
        {actions && <div className="sc-actions">{actions}</div>}
      </motion.div>
    </article>
  )
}
export const ExtLink = ({ href, children, className = 'btn btn-gold' }) => <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children} <ArrowUpRight size={15}/></a>
