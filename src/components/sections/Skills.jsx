import React from 'react'
import { toolGroups, aiUse } from '../../data/content'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import useReveal from '../../hooks/useReveal'

// Phase 5 / Tools I Work With. Floating dimensional "constellations" per category (CSS 3D, automatic staggered motion),
// not a badge grid. No skill percentages. The 3D station "ToolsStation" locks to the `tools-stage` anchor.
function Group({ g, n }) {
  const [ref, seen] = useReveal('0px 0px -10% 0px')
  return <article className={`tg${seen ? ' is-in' : ''} ${n % 2 ? 'tg-r' : 'tg-l'}`} ref={ref} style={{ '--ac': g.accent }} aria-labelledby={`tg-${g.id}`}>
    <header><span className="tg-no">{String(n + 1).padStart(2, '0')}</span><h3 id={`tg-${g.id}`}>{g.title}</h3></header>
    <ul className="tg-items">
      {g.items.map((it, i) => <li className="tool" key={it.name} style={{ '--i': i, '--d': `${i * 0.11}s` }}>
        <span className="tool-float" style={{ '--fd': `${5 + ((i + n) % 4) * 1.1}s`, '--fl': `${-((i * 1.3 + n) % 5)}s` }}>
          <span className="tool-body">
            <b className="tool-mark" aria-hidden="true">{it.mark}</b>
            <span className="tool-txt"><strong>{it.name}</strong>{it.note && <small>{it.note}</small>}</span>
          </span>
        </span>
      </li>)}
    </ul>
  </article>
}

export default function Skills() {
  const anchor = useSceneAnchor('tools-stage')
  const [aiRef, aiSeen] = useReveal()
  return <section className="tools5 section-wrap" id="skills">
    <div className="section-heading"><div><p className="eyebrow">05 / TOOLS & TECHNOLOGIES</p><h2>Tools I work <em>with.</em></h2></div></div>
    <div className="tools-stage" ref={anchor}>
      {toolGroups.map((g, n) => <Group g={g} n={n} key={g.id} />)}
      <aside className={`ai-use${aiSeen ? ' is-in' : ''}`} ref={aiRef} aria-labelledby="ai-use-h">
        <h3 id="ai-use-h">{aiUse.title}</h3>
        <p>{aiUse.intro}</p>
        <ul>{aiUse.points.map((p, i) => <li key={p} style={{ '--d': `${0.1 + i * 0.09}s` }}><span aria-hidden="true"/>{p}</li>)}</ul>
      </aside>
    </div>
  </section>
}
