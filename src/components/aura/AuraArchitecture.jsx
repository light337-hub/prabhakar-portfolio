import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FlowMap, { FlowDetail, TourToggle, neighbourTitles } from './FlowMap'
import useCycle from '../../hooks/useCycle'
import useInView from '../../hooks/useInView'
import useReducedMotion from '../../hooks/useReducedMotion'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import { ARCH_VB, archNodes, archEdges, archTour } from '../../data/aura'

const ease = [0.22, 1, 0.36, 1]

export default function AuraArchitecture() {
  const reduced = useReducedMotion()
  const [viewRef, inView] = useInView('0px')
  const anchorRef = useSceneAnchor('aura-arch')
  const [playing, setPlaying] = useState(true)
  const [picked, setPicked] = useState(null)
  const [step] = useCycle(archTour.length, 3400, playing && inView && !reduced && !picked)
  const activeId = picked || archTour[step]
  const node = archNodes.find(n => n.id === activeId)
  const select = id => { setPicked(id); setPlaying(false) }
  const toggle = () => { if (playing) { setPlaying(false) } else { setPicked(null); setPlaying(true) } }
  const enter = reduced ? {} : { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 1, ease } }

  return (
    <div className="aura-inner section-wrap" ref={viewRef}>
      <motion.header className="aura-head" {...enter}>
        <p className="eyebrow">AURA — SYSTEM ARCHITECTURE</p>
        <h3 className="aura-h">How AURA <em>fits together.</em></h3>
        <p className="aura-lead">Seven layers, from the interface people use to the dashboards that support management decisions. Select a layer, or let the guided tour walk through them.</p>
      </motion.header>

      <motion.div {...enter}>
        <FlowMap
          vb={ARCH_VB} nodes={archNodes} edges={archEdges} activeId={activeId} onSelect={select}
          animated={inView} ariaLabel="AURA system architecture: seven layers and their connections" detailId="arch-detail" anchorRef={anchorRef} tone="arch"
        />
      </motion.div>

      <div className="fm-foot">
        <FlowDetail id="arch-detail" node={node} neighbours={neighbourTitles(activeId, archNodes, archEdges)} />
        <div className="fm-side">
          <TourToggle playing={playing} onToggle={toggle} hidden={reduced} />
          <ul className="fm-legend" aria-label="Legend">
            <li><i className="lg lg-a" aria-hidden="true" /> Chronos-2 path: attendance forecasting</li>
            <li><i className="lg lg-b" aria-hidden="true" /> TabPFN path: employee risk prediction</li>
          </ul>
        </div>
      </div>

      <ul className="sr-only" aria-label="Architecture connections">
        {archEdges.map(e => {
          const a = archNodes.find(n => n.id === e.from), b = archNodes.find(n => n.id === e.to)
          return <li key={`${e.from}-${e.to}`}>{a.title} connects to {b.title}</li>
        })}
      </ul>
      <p className="aura-note">Conceptual map of the verified technology layers. The direction of data flow follows the project workflow; it is not a deployment or infrastructure diagram, and no APIs, microservices or cloud services are implied.</p>
    </div>
  )
}
