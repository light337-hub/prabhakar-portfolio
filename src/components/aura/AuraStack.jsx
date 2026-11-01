import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import BackToPortfolio from '../BackToPortfolio'
import useReducedMotion from '../../hooks/useReducedMotion'
import { auraStack, auraScope } from '../../data/aura'

const ease = [0.22, 1, 0.36, 1]

export default function AuraStack() {
  const reduced = useReducedMotion()
  const enter = d => reduced ? {} : { initial: { opacity: 0, y: 50, rotateX: 18 }, whileInView: { opacity: 1, y: 0, rotateX: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.95, delay: d, ease } }
  return (
    <div className="aura-inner section-wrap">
      <motion.header className="aura-head" {...enter(0)}>
        <p className="eyebrow">AURA — TECHNOLOGY STACK</p>
        <h3 className="aura-h">Built with <em>five technologies.</em></h3>
        <p className="aura-lead">The technologies AURA is actually built with, and nothing added for show.</p>
      </motion.header>
      <ul className="stack-row">
        {auraStack.map((t, i) => (
          <motion.li key={t.id} className="stack-item" {...enter(i * 0.09)}>
            <div className="stack-tile" style={{ '--fd': `${-i * 1.3}s` }}>
              <span className="stack-idx">{String(i + 1).padStart(2, '0')}</span>
              <b>{t.name}</b>
              <small>{t.role}</small>
            </div>
          </motion.li>
        ))}
      </ul>
      <motion.aside className="scope" {...enter(0.1)} aria-labelledby="scope-h">
        <h4 id="scope-h">About this case study</h4>
        <ul>{auraScope.map(s => <li key={s}>{s}</li>)}</ul>
        <div className="scope-actions">
          <Link className="btn btn-gold" to={{ pathname: '/', hash: '#more-projects' }}>More projects <ArrowRight size={16} /></Link>
          <Link className="btn btn-outline" to={{ pathname: '/', hash: '#contact' }}>Get in touch <ArrowUpRight size={16} /></Link>
          <BackToPortfolio />
        </div>
      </motion.aside>
    </div>
  )
}
