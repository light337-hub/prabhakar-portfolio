import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react'
import Socials from './Socials'
import useReducedMotion from '../../hooks/useReducedMotion'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import { pointerState } from '../../three/scrollStore'
import { heroStats, links } from '../../data/content'

const ease = [0.22, 1, 0.36, 1]
const NAME = 'PRABHAKAR'
// depth drives parallax strength + CSS translateZ; x/y are placement on the right side of the arch
const CARD_DEPTH = [{ d: 1, z: 40 }, { d: 1.8, z: 90 }, { d: 1.3, z: 20 }]

// Fallback shown only when the WebGL scene is not running (no WebGL, reduced motion, low power or failure).
function StaticArt() {
  return (
    <svg className="static-art" viewBox="0 0 600 560" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F5D76E"/><stop offset=".5" stopColor="#B8902A"/><stop offset="1" stopColor="#F5D76E"/></linearGradient>
        <linearGradient id="sf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F5D76E"/><stop offset="1" stopColor="#8a6a1c"/></linearGradient>
      </defs>
      <path d="M-30 470 C 120 560, 330 560, 470 470 S 640 300, 560 150" fill="none" stroke="url(#sg)" strokeWidth="16" strokeLinecap="round" opacity=".9"/>
      <path d="M-30 462 C 120 552, 330 552, 470 462 S 632 300, 552 150" fill="none" stroke="#FFF1C9" strokeWidth="2" opacity=".5"/>
      <polygon points="300,10 360,60 340,120 270,115 245,55" fill="url(#sf)" opacity=".9"/>
      <polygon points="300,10 360,60 300,70" fill="#FFF1C9" opacity=".35"/>
      <polygon points="40,150 70,120 100,150 70,180" fill="url(#sf)" opacity=".85"/>
    </svg>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const anchorRef = useSceneAnchor('hero-portrait')
  const stageRef = useRef(null)

  // Gentle pointer parallax for the floating cards (CSS variables, no React re-render). Only while the hero is on screen.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || reduced || !window.matchMedia('(pointer: fine)').matches) return
    let raf = 0, inView = true, x = 0, y = 0
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting }, { threshold: 0 })
    io.observe(stage)
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!inView || document.hidden) return
      x += (pointerState.x - x) * 0.06; y += (pointerState.y - y) * 0.06
      stage.style.setProperty('--px', x.toFixed(4)); stage.style.setProperty('--py', y.toFixed(4))
    }
    loop()
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [reduced])

  const rise = d => reduced ? {} : { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d, ease } }

  return <section className="hero section-wrap" id="home">
    <div className="hero-copy">
      <motion.div className="availability" {...rise(0.25)}><span/> OPEN TO OPPORTUNITIES</motion.div>
      <motion.p className="eyebrow" {...rise(0.4)}>HELLO, I'M</motion.p>
      <h1 aria-label="Prabhakar J.">
        <span className="h1-name" aria-hidden="true">
          {[...NAME].map((ch, i) => <span className="ch-mask" key={i}>
            <motion.span className="ch" {...(reduced ? {} : { initial: { y: '115%' }, animate: { y: 0 }, transition: { duration: 0.95, delay: 0.55 + i * 0.05, ease } })}>{ch}</motion.span>
          </span>)}
        </span>
        <span className="h1-j" aria-hidden="true"><span className="ch-mask"><motion.span className="ch" {...(reduced ? {} : { initial: { y: '115%' }, animate: { y: 0 }, transition: { duration: 0.95, delay: 1.05, ease } })}>J.</motion.span></span></span>
      </h1>
      <motion.h2 {...rise(1.1)}>Software Developer <span>&</span> AI Enthusiast</motion.h2>
      <motion.p className="hero-desc" {...rise(1.25)}>Building intelligent applications, real-time systems and digital experiences that create real value.</motion.p>
      <motion.div className="hero-actions" {...rise(1.4)}><Link className="btn btn-gold" to={{ pathname: '/', hash: '#projects' }}>Explore my work <ArrowRight size={16}/></Link><Link className="btn btn-outline" to={{ pathname: '/', hash: '#contact' }}>Get in touch <ArrowUpRight size={16}/></Link></motion.div>
      <motion.div {...rise(1.55)}><Socials/></motion.div>
      <motion.a className="scroll-cue" href="/#projects" onClick={e => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); navigate({ pathname: '/', hash: '#projects' }) }} {...rise(1.7)}><span><ArrowDown size={14}/></span> SCROLL TO EXPLORE</motion.a>
    </div>

    <div className="hero-stage" ref={stageRef}>
      <StaticArt/>
      <div className="portrait-anchor" ref={anchorRef}>
        <motion.div className="portrait-arch" {...(reduced ? {} : { initial: { opacity: 0, y: 40, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 1.3, delay: 0.9, ease } })}>
          <div className="portrait-photo"><img src={links.portrait} alt="Prabhakar J wearing a navy suit" width="864" height="1084" fetchPriority="high"/></div>
        </motion.div>
      </div>
      <ul className="stat-cards" aria-label="Highlights">
        {heroStats.map((s, i) => <li key={s.label} className={`stat-li stat-${i + 1}`} style={{ '--depth': CARD_DEPTH[i].d, '--z': `${CARD_DEPTH[i].z}px` }}>
          <div className="stat-float" style={{ '--fd': `${6 + i * 1.3}s`, '--fl': `${-i * 1.7}s` }}>
            <motion.div className="stat-card" aria-label={s.a11y}
              {...(reduced ? {} : { initial: { opacity: 0, y: 30, rotateX: -35, scale: 0.9 }, animate: { opacity: 1, y: 0, rotateX: 0, scale: 1 }, transition: { duration: 1.1, delay: 2 + i * 0.22, ease } })}>
              <b aria-hidden="true">{s.value}</b><small aria-hidden="true">{s.label}</small>
            </motion.div>
            <span className="stat-shadow" aria-hidden="true"/>
          </div>
        </li>)}
      </ul>
      <p className="stage-caption">ENGINEERING / CREATIVITY / IMPACT</p>
    </div>
  </section>
}
