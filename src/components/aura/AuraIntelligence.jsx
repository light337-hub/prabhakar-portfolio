import React, { useId, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useCycle from '../../hooks/useCycle'
import useInView from '../../hooks/useInView'
import useReducedMotion from '../../hooks/useReducedMotion'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import { intelligence } from '../../data/aura'

const ease = [0.22, 1, 0.36, 1]

/* ---------- ILLUSTRATIVE visual 1: forecast shape (no values, no axes with numbers) ---------- */
const HIST = 22, MAXH = 14, VW = 640, VH = 270, X0 = 34, STEP = (VW - X0 - 24) / (HIST + MAXH - 1)
const yAt = i => 128 + 30 * Math.sin(i * 0.5) + 13 * Math.sin(i * 1.27 + 1)
const xAt = i => X0 + i * STEP

function ForecastChart({ horizon, reduced }) {
  const geo = useMemo(() => {
    const hist = Array.from({ length: HIST }, (_, i) => [xAt(i), yAt(i)])
    const fc = [hist[HIST - 1]]
    for (let k = 1; k <= horizon; k++) fc.push([xAt(HIST - 1 + k), yAt(HIST - 1 + k) * 0.55 + yAt(HIST - 1) * 0.45])
    const spread = k => 6 + k * 3.4
    const up = fc.map(([x, y], k) => [x, y - spread(k)]), lo = fc.map(([x, y], k) => [x, y + spread(k)]).reverse()
    const pts = a => a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    return { hist: pts(hist), fc: pts(fc), band: pts([...up, ...lo]), nowX: xAt(HIST - 1) }
  }, [horizon])
  const mark = w => xAt(HIST - 1 + w)
  return (
    <svg className="fc-svg" viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Illustrative forecast chart, not real AURA data: a line of attendance history followed by a dashed forecast with a widening band over ${horizon} weeks.`}>
      <defs>
        <linearGradient id="fcBand" x1="0" x2="1"><stop offset="0" stopColor="#D4AF37" stopOpacity=".28" /><stop offset="1" stopColor="#D4AF37" stopOpacity=".05" /></linearGradient>
      </defs>
      {[60, 120, 180, 240].map(y => <line key={y} x1={X0} x2={VW - 16} y1={y} y2={y} className="fc-grid" />)}
      {[7, 14].map(w => <g key={w}><line x1={mark(w)} x2={mark(w)} y1="20" y2="244" className={`fc-mark${w === horizon ? ' is-on' : ''}`} /><text x={mark(w)} y="260" textAnchor="middle" className="fc-label">+{w} WEEKS</text></g>)}
      <line x1={geo.nowX} x2={geo.nowX} y1="20" y2="244" className="fc-now" />
      <text x={geo.nowX} y="14" textAnchor="middle" className="fc-label">NOW</text>
      <text x={X0} y="14" className="fc-label">HISTORY</text>
      <g key={horizon} className={reduced ? '' : 'fc-enter'}>
        <polygon points={geo.band} fill="url(#fcBand)" />
        <polyline points={geo.fc} className="fc-line" />
      </g>
      <polyline points={geo.hist} className={`fc-hist${reduced ? '' : ' fc-draw'}`} pathLength="1" />
      <circle cx={geo.nowX} cy={yAt(HIST - 1)} r="4.5" className="fc-dot" />
    </svg>
  )
}

/* ---------- ILLUSTRATIVE visual 2: tabular rows -> risk indicator (bar lengths carry no meaning) ---------- */
const ROWS = [[0.5, 0.8, 0.3, 0.6, 0.35], [0.7, 0.4, 0.9, 0.5, 0.72], [0.3, 0.6, 0.5, 0.85, 0.45], [0.8, 0.35, 0.65, 0.4, 0.88], [0.45, 0.7, 0.2, 0.75, 0.2]]
function RiskTable({ scan, reduced }) {
  return (
    <div className="rt" role="img" aria-label="Illustrative table, not real AURA data: employee rows with attribute columns on the left and a risk indicator on the right.">
      <div className="rt-head" aria-hidden="true"><span>EMPLOYEE</span><span>ATTR 1</span><span>ATTR 2</span><span>ATTR 3</span><span>ATTR 4</span><span className="rt-r">RISK →</span></div>
      {ROWS.map((r, i) => (
        <div key={i} className={`rt-row${!reduced && scan === i ? ' is-scan' : ''}`} aria-hidden="true">
          <span className="rt-name">Employee {String.fromCharCode(65 + i)}</span>
          {r.slice(0, 4).map((v, j) => <span key={j} className="rt-cell"><i style={{ width: `${v * 100}%` }} /></span>)}
          <span className="rt-risk"><i style={{ '--v': r[4], animationDelay: `${i * 0.18}s` }} /></span>
        </div>
      ))}
    </div>
  )
}

function FlowStrip({ flow }) {
  return (
    <ol className="fstrip" aria-label="Model workflow">
      {flow.map(([t, s], i) => <li key={t} className={i === 1 ? 'is-model' : ''}><b>{t}</b><small>{s}</small></li>)}
    </ol>
  )
}

// Accessible tab list (arrow keys, roving tabindex) for the interactive explanation panel.
function Explainer({ model }) {
  const uid = useId()
  const [tab, setTab] = useState(model.tabs[0].id)
  const refs = useRef({})
  const onKey = e => {
    const i = model.tabs.findIndex(t => t.id === tab)
    let n = -1
    if (e.key === 'ArrowRight') n = (i + 1) % model.tabs.length
    else if (e.key === 'ArrowLeft') n = (i - 1 + model.tabs.length) % model.tabs.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = model.tabs.length - 1
    if (n < 0) return
    e.preventDefault()
    const t = model.tabs[n]; setTab(t.id); refs.current[t.id]?.focus()
  }
  const cur = model.tabs.find(t => t.id === tab)
  return (
    <div className="ex">
      <div className="ex-tabs" role="tablist" aria-label={`${model.model} explanation`} onKeyDown={onKey}>
        {model.tabs.map(t => <button key={t.id} ref={el => { refs.current[t.id] = el }} role="tab" type="button" id={`${uid}-t-${t.id}`} aria-selected={tab === t.id} aria-controls={`${uid}-p`} tabIndex={tab === t.id ? 0 : -1} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      <div className="ex-panel" role="tabpanel" id={`${uid}-p`} aria-labelledby={`${uid}-t-${tab}`}><p>{cur.body}</p></div>
    </div>
  )
}

function ChronosPanel({ reduced }) {
  const m = intelligence.chronos
  const [ref, inView] = useInView('0px')
  const anchorRef = useSceneAnchor('aura-chronos-visual')
  const [touched, setTouched] = useState(false)
  const [i, setI] = useCycle(2, 5200, inView && !touched && !reduced)
  const horizon = m.horizons[i]
  const pick = k => { setTouched(true); setI(k) }
  return (
    <article className="intel intel-a" ref={ref} aria-labelledby="chronos-h">
      <div className="intel-copy">
        <p className="intel-kicker">MODEL A · ATTENDANCE FORECASTING</p>
        <h4 id="chronos-h">{m.model}</h4>
        <p className="intel-sum">{m.summary}</p>
        <Explainer model={m} />
        <p className="intel-boundary"><span aria-hidden="true">◆</span> {m.boundary}</p>
      </div>
      <div className="intel-visual">
        <div className="intel-card" ref={anchorRef}>
          <div className="intel-card-top">
            <span className="il-chip">ILLUSTRATIVE VISUALIZATION</span>
            <div className="hz" role="group" aria-label="Forecast horizon">
              {m.horizons.map((h, k) => <button key={h} type="button" aria-pressed={horizon === h} onClick={() => pick(k)}>{h}-week</button>)}
            </div>
          </div>
          <ForecastChart horizon={horizon} reduced={reduced} />
          <p className="il-cap">Shape of a forecast only: no values, accuracy or dataset are implied. Choose a horizon to see how far ahead Chronos-2 looks.</p>
        </div>
        <FlowStrip flow={m.flow} />
      </div>
    </article>
  )
}

function TabpfnPanel({ reduced }) {
  const m = intelligence.tabpfn
  const [ref, inView] = useInView('0px')
  const anchorRef = useSceneAnchor('aura-tabpfn-visual')
  const [scan] = useCycle(ROWS.length, 1500, inView && !reduced)
  return (
    <article className="intel intel-b" ref={ref} aria-labelledby="tabpfn-h">
      <div className="intel-visual">
        <div className="intel-card" ref={anchorRef}>
          <div className="intel-card-top"><span className="il-chip">ILLUSTRATIVE VISUALIZATION</span></div>
          <RiskTable scan={scan} reduced={reduced} />
          <p className="il-cap">Structure only: rows are employees, columns are attributes, and the last column stands for a risk assessment. Bar lengths carry no meaning and no real data is shown.</p>
        </div>
        <FlowStrip flow={m.flow} />
      </div>
      <div className="intel-copy">
        <p className="intel-kicker">MODEL B · EMPLOYEE RISK PREDICTION</p>
        <h4 id="tabpfn-h">{m.model}</h4>
        <p className="intel-sum">{m.summary}</p>
        <Explainer model={m} />
        <p className="intel-boundary"><span aria-hidden="true">◆</span> {m.boundary}</p>
      </div>
    </article>
  )
}

export default function AuraIntelligence() {
  const reduced = useReducedMotion()
  const enter = reduced ? {} : { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 1, ease } }
  return (
    <div className="aura-inner section-wrap">
      <motion.header className="aura-head" {...enter}>
        <p className="eyebrow">AURA — AI / ML INTELLIGENCE</p>
        <h3 className="aura-h">Two models, <em>two separate jobs.</em></h3>
        <p className="aura-lead">AURA uses two different models for two different questions. They read different information, produce different outputs, and are shown separately here.</p>
      </motion.header>
      <motion.ul className="jobs" {...enter} aria-label="Model responsibilities">
        <li className="jobs-a"><b>Chronos-2</b><span>Attendance forecasting</span><small>7-week or 14-week horizon</small></li>
        <li className="jobs-b"><b>TabPFN</b><span>Employee risk prediction</span><small>Tabular employee data</small></li>
      </motion.ul>
      <motion.div {...enter}><ChronosPanel reduced={reduced} /></motion.div>
      <motion.div {...enter}><TabpfnPanel reduced={reduced} /></motion.div>
      <p className="aura-note">Both visualizations are illustrations of structure. They are not outputs of AURA, and no accuracy, F1, precision, recall, dataset size, employee count or business impact is claimed. Model descriptions are general descriptions of each model plus its role in AURA.</p>
    </div>
  )
}
