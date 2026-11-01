import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import useReducedMotion from '../../hooks/useReducedMotion'
import { auraPublication as pub } from '../../data/aura'

const ease = [0.22, 1, 0.36, 1]

// Journal publication card. Every value comes from data/aura.js (the supplied URL + fields copied from the paper itself).
export default function AuraPublication() {
  const reduced = useReducedMotion()
  const enter = d => reduced ? {} : { initial: { opacity: 0, y: 46, rotateX: 14 }, whileInView: { opacity: 1, y: 0, rotateX: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.95, delay: d, ease } }
  const rows = [
    ['Journal', pub.journal],
    ['Article type', pub.articleType],
    ['Volume / Issue', `Volume ${pub.volume} · Issue ${pub.issue}`],
    ['Published', pub.published],
    ['ISSN', pub.issn]
  ]
  return (
    <div className="aura-inner section-wrap">
      <motion.header className="aura-head" {...enter(0)}>
        <p className="eyebrow">AURA — PUBLICATION</p>
        <h3 className="aura-h">Documented in a <em>journal paper.</em></h3>
        <p className="aura-lead">The AURA system design and implementation is described in a published journal article. Open it to read the paper itself.</p>
      </motion.header>
      <motion.article className="pub-card" aria-labelledby="pub-title" {...enter(0.12)}>
        <div className="pub-main">
          <span className="pub-badge"><BookOpen size={13} aria-hidden="true" /> JOURNAL PUBLICATION</span>
          <h4 id="pub-title">{pub.title}</h4>
          <p className="pub-authors"><span>Authors</span> {pub.authors}</p>
          <div className="pub-actions">
            <a className="btn btn-gold" href={pub.url} target="_blank" rel="noopener noreferrer" aria-describedby="pub-url">
              Open publication <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <span className="pub-url" id="pub-url">{pub.urlLabel}<small> · opens in a new tab</small></span>
          </div>
        </div>
        <dl className="pub-meta">
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </motion.article>
    </div>
  )
}
