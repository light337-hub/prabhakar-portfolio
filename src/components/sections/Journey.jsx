import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, GraduationCap } from 'lucide-react'
import { timeline } from '../../data/content'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import useReveal from '../../hooks/useReveal'
import useReducedMotion from '../../hooks/useReducedMotion'

// Phase 5 / Education & Experience: ONE full-width vertical timeline (never side-by-side columns), in the order
// Education 01 -> Education 02 -> Experience 01. The gold line fills while scrolling; nodes light as it reaches them.
// 3D: `journey-rail` + `tl-node-N` anchors let JourneyStation draw glow, light beads and gems behind the HTML.
function Item({ e, i }) {
  const [ref, seen] = useReveal('0px 0px -14% 0px')
  const node = useSceneAnchor(`tl-node-${i}`)
  const work = e.kind === 'work'
  return <li className={`tl-item tl-${e.kind}${seen ? ' is-in' : ''}`} ref={ref} data-node>
    <div className="tl-date"><time>{e.date}</time></div>
    <div className="tl-node-wrap"><span className="tl-node" ref={node}><i className="tl-gem" aria-hidden="true"/>{work ? <BriefcaseBusiness size={16} aria-hidden="true"/> : <GraduationCap size={16} aria-hidden="true"/>}</span></div>
    <article className="tl-panel" aria-label={`${e.label}: ${e.title}`}>
      <p className="tl-kind">{e.label}{e.status && <span className="tl-status">Status: {e.status}</span>}</p>
      <h3>{e.title}</h3>
      <p className="tl-org">{e.org}</p>
      {e.project && <p className="tl-project"><small>PROJECT CONTEXT</small>{e.project}</p>}
      {e.detail && <p className="tl-detail">{e.detail}</p>}
      {e.facts && <ul className="tl-facts" aria-label={work ? 'Technologies in the project' : 'Result'}>{e.facts.map(f => <li key={f}>{f}</li>)}</ul>}
      {work && <p className="tl-links"><Link to={{ pathname: '/', hash: '#sc-ais' }}>See the AIS project</Link><Link to={{ pathname: '/', hash: '#certificates' }}>See the internship certificate</Link></p>}
    </article>
  </li>
}

export default function Journey() {
  const sec = useRef(null), list = useRef(null)
  const rail = useSceneAnchor('journey-rail')
  const reduced = useReducedMotion()
  useEffect(() => {
    const root = sec.current, ol = list.current
    if (!root || !ol) return
    const nodes = [...ol.querySelectorAll('.tl-node')]
    if (reduced) { root.style.setProperty('--fill', '1'); nodes.forEach(n => n.classList.add('reached')); return }
    let raf = 0, on = false
    const update = () => {
      raf = 0
      const r = ol.getBoundingClientRect(), mid = window.innerHeight * 0.58
      const f = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)))
      root.style.setProperty('--fill', f.toFixed(4))
      nodes.forEach(n => { const b = n.getBoundingClientRect(); n.classList.toggle('reached', b.top + b.height / 2 < mid) })
    }
    const schedule = () => { if (on && !raf) raf = requestAnimationFrame(update) }
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; schedule() }, { rootMargin: '10% 0px 10% 0px' })
    io.observe(root)
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule)
    update()
    return () => { io.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); if (raf) cancelAnimationFrame(raf) }
  }, [reduced])
  return <section className="journey5 section-wrap" id="journey" ref={sec}>
    <p className="eyebrow">06 / MY JOURNEY</p>
    <h2>Education & <em>experience.</em></h2>
    <div className="tl">
      <div className="tl-rail" ref={rail} aria-hidden="true"><span className="tl-rail-fill"/></div>
      <ol className="tl-list" ref={list}>{timeline.map((e, i) => <Item e={e} i={i} key={e.id} />)}</ol>
    </div>
  </section>
}
