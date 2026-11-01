import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import useReducedMotion from '../../hooks/useReducedMotion'
import { auraProblem as d } from '../../data/aura'

const ease = [0.22, 1, 0.36, 1]

export default function AuraProblem() {
  const reduced = useReducedMotion()
  const enter = (delay = 0, x = 0) => reduced ? {} : { initial: { opacity: 0, y: 46, x, rotateX: 10 }, whileInView: { opacity: 1, y: 0, x: 0, rotateX: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 1, delay, ease } }
  return (
    <section id="aura-problem" className="aura-block aura-problem" aria-labelledby="aura-problem-h">
      <div className="aura-inner section-wrap">
        <motion.header className="aura-head" {...enter()}>
          <p className="eyebrow">AURA — THE PROBLEM AND THE SOLUTION</p>
          <h3 className="aura-h" id="aura-problem-h">One connected view of <em>the organization.</em></h3>
        </motion.header>
        <div className="ps">
          <motion.div className="ps-panel ps-problem" {...enter(0, -40)}>
            <span className="ps-tag">THE PROBLEM</span>
            <p>{d.problem}</p>
          </motion.div>
          <span className="ps-arrow" aria-hidden="true"><ArrowDown size={18} /></span>
          <motion.div className="ps-panel ps-solution" {...enter(0.15, 40)}>
            <span className="ps-tag">AURA’S ANSWER</span>
            <p>{d.solution}</p>
          </motion.div>
        </div>
        <ul className="pillars">
          {d.pillars.map((p, i) => (
            <motion.li key={p.title} className="pillar" {...enter(0.1 * i)}>
              <span className="pillar-n">{String(i + 1).padStart(2, '0')}</span>
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
