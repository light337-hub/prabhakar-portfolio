import React, { useRef } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion'

// Shared interactive diagram used by the architecture map and the workflow map.
// Desktop: HTML <button> nodes are positioned over an SVG of animated connection lines (same coordinate space).
// Small screens: the SVG is hidden and the nodes stack as a vertical flow (see "AURA case study" block in styles.css).
// All text and controls are real HTML; the SVG is decorative (aria-hidden).
const pathOf = n => n.path || (n.kind === 'ml-a' ? 'a' : n.kind === 'ml-b' ? 'b' : '')

export default function FlowMap({ vb, nodes, edges, activeId, onSelect, animated, ariaLabel, detailId, anchorRef, tone = 'arch' }) {
  const [W, H] = vb
  const reduced = useReducedMotion()
  const tiltRef = useRef(null)
  const byId = {}
  nodes.forEach(n => { byId[n.id] = n })
  const linked = new Set([activeId])
  edges.forEach(e => { if (e.from === activeId) linked.add(e.to); if (e.to === activeId) linked.add(e.from) })

  const onMove = e => {
    const el = tiltRef.current
    if (!el || reduced || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 5).toFixed(2))
    el.style.setProperty('--rx', ((-((e.clientY - r.top) / r.height - 0.5)) * 4).toFixed(2))
  }
  const reset = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.setProperty('--ry', '0'); el.style.setProperty('--rx', '0')
  }

  return (
    <div className={`flowmap-wrap fm-${tone}`} ref={anchorRef} onPointerMove={onMove} onPointerLeave={reset}>
      <div className="flowmap" ref={tiltRef} style={{ '--ar': `${W} / ${H}` }} role="group" aria-label={ariaLabel}>
        <svg className="fm-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {edges.map((e, i) => {
            const a = byId[e.from], b = byId[e.to]
            const d = e.d || `M ${a.x} ${a.y} L ${b.x} ${b.y}`
            const on = e.from === activeId || e.to === activeId
            const p = e.path || ''
            return (
              <g key={`${e.from}-${e.to}`} className={`fm-edge${p ? ` path-${p}` : ''}${on ? ' is-on' : ''}`}>
                <path className="fm-edge-base" d={d} />
                <path className="fm-edge-flow" d={d} />
                {animated && !reduced && (
                  <circle r="4.5" className="fm-dot">
                    <animateMotion dur={`${3.2 + (i % 3) * 0.5}s`} begin={`${(i * 0.55).toFixed(2)}s`} repeatCount="indefinite" path={d} />
                  </circle>
                )}
              </g>
            )
          })}
        </svg>
        {nodes.map(n => {
          const p = pathOf(n)
          return (
            <button
              key={n.id}
              type="button"
              className={`fm-node${n.kind ? ` kind-${n.kind}` : ''}${p ? ` path-${p}` : ''}${activeId === n.id ? ' is-active' : ''}${linked.has(n.id) ? '' : ' is-dim'}`}
              style={{ '--x': `${(n.x / W) * 100}%`, '--y': `${(n.y / H) * 100}%`, '--w': `${(n.w / W) * 100}%` }}
              aria-pressed={activeId === n.id}
              aria-controls={detailId}
              onClick={() => onSelect(n.id)}
              onFocus={() => onSelect(n.id)}
              onPointerEnter={e => { if (e.pointerType === 'mouse') onSelect(n.id) }}
            >
              <span className="fm-num">{n.n}</span>
              {n.tag && <span className="fm-tag">{n.tag}</span>}
              <b>{n.title}</b>
              <small>{n.line}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Detail panel for the selected node (announced politely to assistive tech).
export function FlowDetail({ id, node, neighbours }) {
  if (!node) return null
  return (
    <div className="fm-detail" id={id} aria-live="polite">
      <span className="fm-detail-n" aria-hidden="true">{node.n}</span>
      <div>
        <h4>{node.title}</h4>
        <p>{node.detail}</p>
        {neighbours.length > 0 && <p className="fm-conn"><span>CONNECTED TO</span> {neighbours.join(' · ')}</p>}
      </div>
    </div>
  )
}

export function neighbourTitles(id, nodes, edges) {
  const set = []
  edges.forEach(e => {
    const other = e.from === id ? e.to : e.to === id ? e.from : null
    if (other) { const n = nodes.find(x => x.id === other); if (n && !set.includes(n.title)) set.push(n.title) }
  })
  return set
}

// Play / pause control for automatic tours (WCAG 2.2.2).
export function TourToggle({ playing, onToggle, hidden }) {
  if (hidden) return null
  return <button type="button" className="tour-toggle" onClick={onToggle} aria-pressed={playing}>
    <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span> {playing ? 'Pause guided tour' : 'Play guided tour'}
  </button>
}
