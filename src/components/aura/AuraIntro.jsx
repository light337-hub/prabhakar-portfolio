import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Layers, Sparkles } from 'lucide-react'
import AuraShowcase from '../AuraShowcase'
import BackToPortfolio from '../BackToPortfolio'
import useReducedMotion from '../../hooks/useReducedMotion'
import useAuraNav from './useAuraNav'
import { auraIntro, auraSections } from '../../data/aura'
import { projects } from '../../data/content'

const ease = [0.22, 1, 0.36, 1]
const fromHome = { fromHome: true }

// Cinematic opening, reused in two places:
//  variant="teaser" - the AURA feature on the main portfolio (/). "Explore AURA" opens the separate /aura page.
//  variant="page"   - the opening of the /aura case study. Buttons scroll inside the page; "Back to Portfolio" returns.
export default function AuraIntro({ variant = 'teaser' }) {
  const page = variant === 'page'
  const reduced = useReducedMotion()
  const goAura = useAuraNav()
  const p = projects[0]
  const rise = d => reduced ? {} : { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.9, delay: d, ease } }
  const letter = i => reduced ? {} : { initial: { y: '112%' }, whileInView: { y: 0 }, viewport: { once: true, amount: 0.6 }, transition: { duration: 1.05, delay: 0.1 + i * 0.12, ease } }
  const go = id => e => { e.preventDefault(); goAura(id) }
  const Title = page ? 'h1' : 'h3'
  const jump = auraSections.slice(1)
  return (
    <section id="aura" className={`aura-intro featured section-wrap${page ? ' aura-intro-page' : ''}`} aria-labelledby="aura-title">
      {page
        ? <div className="aura-page-top"><BackToPortfolio /><span className="section-index">CASE STUDY</span></div>
        : <div className="section-heading"><div><p className="eyebrow">01 / SELECTED WORK</p><h2>Featured <em>project.</em></h2></div><span className="section-index">CASE STUDY</span></div>}
      <div className="featured-card aura-stage">
        <div className="featured-copy aura-copy">
          <motion.div className="featured-label" {...rise(0)}><Sparkles size={14} /> FLAGSHIP CASE STUDY</motion.div>
          <Title className="aura-title" id="aura-title" aria-label="AURA.">
            <span aria-hidden="true" className="aura-letters">
              {[...auraIntro.name].map((c, i) => <span className="ch-mask" key={i}><motion.span className="ch" {...letter(i)}>{c}</motion.span></span>)}
              <span className="aura-dot">.</span>
            </span>
          </Title>
          <motion.h4 {...rise(0.5)}>{auraIntro.fullName}</motion.h4>
          <motion.p className="aura-sub" {...rise(0.6)}>{auraIntro.positioning}</motion.p>
          <motion.p {...rise(0.7)}>{auraIntro.purpose}</motion.p>
          <motion.ul className="ml-roles" {...rise(0.8)}>{p.mlRoles.map(r => <li key={r.model}><b>{r.model}</b> — {r.role}</li>)}</motion.ul>
          <motion.div className="tags" {...rise(0.9)}>{p.tags.map(t => <span key={t}>{t}</span>)}</motion.div>
          <motion.div className="aura-cta" {...rise(1)}>
            {page ? (
              <>
                <a className="btn btn-gold" href="#aura-problem" onClick={go('aura-problem')}>Start the case study <ArrowRight size={16} /></a>
                <a className="btn btn-outline" href="#aura-architecture" onClick={go('aura-architecture')}><Layers size={15} /> System architecture</a>
                <a className="btn btn-outline" href="#aura-publication" onClick={go('aura-publication')}><BookOpen size={15} /> Journal publication</a>
              </>
            ) : (
              <>
                <Link className="btn btn-gold" to="/aura" state={fromHome}>Explore AURA <ArrowRight size={16} /></Link>
                <Link className="btn btn-outline" to={{ pathname: '/aura', hash: '#aura-architecture' }} state={fromHome}><Layers size={15} /> System architecture</Link>
              </>
            )}
          </motion.div>
        </div>
        <AuraShowcase />
      </div>
      <p className="aura-jump" aria-hidden="false">
        <span>INSIDE THE CASE STUDY</span>
        {jump.map(s => page
          ? <a key={s.id} href={`#${s.id}`} onClick={go(s.id)}>{s.label}</a>
          : <Link key={s.id} to={{ pathname: '/aura', hash: `#${s.id}` }} state={fromHome}>{s.label}</Link>)}
      </p>
    </section>
  )
}
