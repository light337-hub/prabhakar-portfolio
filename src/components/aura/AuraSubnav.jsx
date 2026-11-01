import React, { useEffect, useState } from 'react'
import useAuraNav from './useAuraNav'
import { auraSections } from '../../data/aura'

// Sticky in-page navigation for the case study. Every item is a real anchor; JS only makes sure lazy blocks are mounted first.
export default function AuraSubnav() {
  const goAura = useAuraNav()
  const [active, setActive] = useState('aura')
  useEffect(() => {
    const els = auraSections.map(s => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
    }, { rootMargin: '-40% 0px -55% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <nav className="aura-subnav" aria-label="AURA case study">
      <div className="aura-subnav-in">
        <span className="aura-subnav-brand" aria-hidden="true">AURA<i>.</i></span>
        <ul>
          {auraSections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined} onClick={e => { e.preventDefault(); goAura(s.id) }}>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span> {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
