import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FlowMap, { FlowDetail, TourToggle, neighbourTitles } from './FlowMap'
import useCycle from '../../hooks/useCycle'
import useInView from '../../hooks/useInView'
import useReducedMotion from '../../hooks/useReducedMotion'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import { WF_VB, wfNodes, wfEdges, wfTour } from '../../data/aura'

const ease = [0.22, 1, 0.36, 1]

export default function AuraWorkflow() {
  const reduced = useReducedMotion()
  const [viewRef, inView] = useInView('0px')
  const anchorRef = useSceneAnchor('aura-workflow-map')
  const [playing, setPlaying] = useState(true)
  const [picked, setPicked] = useState(null)
  const [step] = useCycle(wfTour.length, 2600, playing && inView && !reduced && !picked)
  const activeId = picked || wfTour[step]
  const node = wfNodes.find(n => n.id === activeId)
  const select = id => { setPicked(id); setPlaying(false) }
  const toggle = () => { if (playing) { setPlaying(false) } else { setPicked(null); setPlaying(true) } }
  const enter = reduced ? {} : { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 1, ease } }

  return (
    <div className="aura-inner section-wrap" ref={viewRef}>
      <motion.header className="aura-head" {...enter}>
        <p className="eyebrow">AURA — END-TO-END WORKFLOW</p>
        <h3 className="aura-h">From information to <em>decision.</em></h3>
        <p className="aura-lead">Organizational information moves through the application and the database, splits into two separate prediction paths, and comes back together as one view for management.</p>
      </motion.header>

      <motion.div {...enter}>
        <FlowMap
          vb={WF_VB} nodes={wfNodes} edges={wfEdges} activeId={activeId} onSelect={select}
          animated={inView} ariaLabel="AURA workflow: six stages with separate Chronos-2 and TabPFN paths" detailId="wf-detail" anchorRef={anchorRef} tone="wf"
        />
      </motion.div>

      <div className="fm-foot">
        <FlowDetail id="wf-detail" node={node} neighbours={neighbourTitles(activeId, wfNodes, wfEdges)} />
        <div className="fm-side">
          <TourToggle playing={playing} onToggle={toggle} hidden={reduced} />
          <ul className="fm-legend" aria-label="Legend">
            <li><i className="lg lg-a" aria-hidden="true" /> Path A: Chronos-2 attendance forecasting</li>
            <li><i className="lg lg-b" aria-hidden="true" /> Path B: TabPFN employee risk prediction</li>
          </ul>
        </div>
      </div>

      <ul className="sr-only" aria-label="Workflow connections">
        {wfEdges.map(e => {
          const a = wfNodes.find(n => n.id === e.from), b = wfNodes.find(n => n.id === e.to)
          return <li key={`${e.from}-${e.to}`}>{a.title} leads to {b.title}</li>
        })}
      </ul>
      <p className="aura-note">The two model paths have separate responsibilities: Chronos-2 forecasts attendance, TabPFN assesses employee risk. They share the same data foundation and meet again in the dashboards.</p>
    </div>
  )
}
