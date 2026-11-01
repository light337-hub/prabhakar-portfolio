import React from 'react'
import { motion } from 'framer-motion'
import ModuleMotif from './ModuleMotif'
import useReducedMotion from '../../hooks/useReducedMotion'
import { auraModules } from '../../data/aura'

const ease = [0.22, 1, 0.36, 1]

function ModuleCard({ m, i, reduced }) {
  // Pointer-driven depth (CSS variables, no re-render). Fine pointers only.
  const onMove = e => {
    if (reduced || e.pointerType === 'touch') return
    const el = e.currentTarget, r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 8).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
  }
  const reset = e => {
    const el = e.currentTarget
    el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg')
  }
  const enter = reduced ? {} : { initial: { opacity: 0, y: 60, rotateX: 14 }, whileInView: { opacity: 1, y: 0, rotateX: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.95, delay: (i % 3) * 0.12, ease } }
  return (
    <motion.li className="mod" {...enter}>
      <div className="mod-float" style={{ '--float': `${6.5 + (i % 3) * 0.9}s`, '--fd': `${-i * 1.1}s` }}>
      <article className="mod-tilt" onPointerMove={onMove} onPointerLeave={reset}>
        <div className="mod-visual"><ModuleMotif type={m.motif} /><span className="mod-glint" aria-hidden="true" /></div>
        <div className="mod-body">
          <span className="mod-idx">{String(i + 1).padStart(2, '0')}</span>
          <h4>{m.title}</h4>
          <p>{m.text}</p>
          <p className="mod-flow"><span>WORKFLOW</span> {m.flow}</p>
          <div className="tags">{m.tech.map(t => <span key={t}>{t}</span>)}</div>
        </div>
      </article>
      </div>
    </motion.li>
  )
}

export default function AuraModules() {
  const reduced = useReducedMotion()
  const enter = reduced ? {} : { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 1, ease } }
  return (
    <div className="aura-inner section-wrap">
      <motion.header className="aura-head" {...enter}>
        <p className="eyebrow">AURA — MAIN MODULES</p>
        <h3 className="aura-h">Six capabilities, <em>one platform.</em></h3>
        <p className="aura-lead">The verified modules of AURA. Each card shows an abstract motif for the module, a short description, and the technology or workflow it relates to.</p>
      </motion.header>
      <ul className="mod-grid">{auraModules.map((m, i) => <ModuleCard key={m.id} m={m} i={i} reduced={reduced} />)}</ul>
      <p className="aura-note">Module visuals are abstract motifs, not application screenshots. Descriptions are kept general to what the project confirms.</p>
    </div>
  )
}
