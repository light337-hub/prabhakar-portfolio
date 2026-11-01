import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { aboutContent, links } from '../../data/content'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import useReveal from '../../hooks/useReveal'
import usePointerVars from '../../hooks/usePointerVars'

// Phase 5 / About Me. The original portrait is shown untouched (no filter) inside a dimensional frame.
// The 3D station "AboutStation" locks to the `about-portrait` anchor; the CSS gems are the fallback when WebGL is off.
export default function About() {
  const [ref, seen] = useReveal('0px 0px -15% 0px')
  const anchor = useSceneAnchor('about-portrait')
  const stage = useRef(null)
  usePointerVars(stage)
  const [l1, l2] = aboutContent.headline
  return <section className={`about5 section-wrap${seen ? ' is-in' : ''}`} id="about" ref={ref}>
    <div className="ab-stage" ref={stage}>
      <div className="ab-portrait" ref={anchor}>
        <div className="ab-frame">
          <span className="ab-corner c1" aria-hidden="true"/><span className="ab-corner c2" aria-hidden="true"/>
          <div className="ab-photo"><img src={links.portrait} alt="Prabhakar J wearing a navy suit" width="864" height="1084" loading="lazy"/></div>
        </div>
        <span className="ab-tag">MADURAI, INDIA</span>
        <i className="ab-gem g1" aria-hidden="true"/><i className="ab-gem g2" aria-hidden="true"/><i className="ab-gem g3" aria-hidden="true"/>
      </div>
    </div>
    <div className="ab-copy">
      <p className="eyebrow">04 / ABOUT ME</p>
      <h2><span className="ab-line">{l1}</span><span className="ab-line"><em>{l2}</em></span></h2>
      {aboutContent.paragraphs.map((p, i) => <p className="ab-p" key={i} style={{ '--d': `${0.15 + i * 0.12}s` }}>{p}</p>)}
      <blockquote className="ab-quote">“{aboutContent.quote}”</blockquote>
      <dl className="ab-facts">{aboutContent.facts.map((f, i) => <div key={f.k} style={{ '--d': `${0.4 + i * 0.1}s` }}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
      <Link className="text-link ab-link" to={{ pathname: '/', hash: '#skills' }}>See the tools I work with <ArrowRight size={16}/></Link>
    </div>
  </section>
}
