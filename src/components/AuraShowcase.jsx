import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import useReducedMotion from '../hooks/useReducedMotion'
import useSceneAnchor from '../hooks/useSceneAnchor'
import { auraPreview as a } from '../data/content'

// Premium dimensional showcase for the supplied AURA interface image (served unchanged; only CSS positions it so the
// file's white margins are not shown). The aspect ratio / offsets below come from the crop box in content.js.
const pct = n => `${(n * 100).toFixed(4)}%`
const imgStyle = {
  width: pct(a.file.w / a.crop.w),
  left: pct(-a.crop.x / a.crop.w),
  top: pct(-a.crop.y / a.crop.h)
}
export default function AuraShowcase() {
  const reduced = useReducedMotion()
  const anchorRef = useSceneAnchor('aura-showcase')
  const [seen, setSeen] = useState(false)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 110, damping: 18 })
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 110, damping: 18 })
  const onMove = e => {
    if (reduced || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => { mx.set(0); my.set(0) }
  const crop = <div className="aura-crop" style={{ aspectRatio: `${a.crop.w} / ${a.crop.h}` }}><img src={a.src} alt="" style={imgStyle} loading="lazy" decoding="async" aria-hidden="true"/></div>
  return (
    <div className="aura-showcase" ref={anchorRef} onPointerMove={onMove} onPointerLeave={reset}>
      <div className="aura-float"><motion.figure className={`aura-enter${seen ? ' is-seen' : ''}`}
        {...(reduced ? {} : { initial: { opacity: 0, y: 70, rotateX: 16, scale: 0.94 }, whileInView: { opacity: 1, y: 0, rotateX: 0, scale: 1 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }, onViewportEnter: () => setSeen(true) })}>
        <motion.div className="aura-tilt" style={reduced ? undefined : { rotateX: rx, rotateY: ry }}>
          <span className="aura-back" aria-hidden="true"/>
          <div className="aura-frame">
            <div className="aura-crop" style={{ aspectRatio: `${a.crop.w} / ${a.crop.h}` }}>
              <img src={a.src} alt={a.alt} width={a.file.w} height={a.file.h} style={imgStyle} loading="lazy" decoding="async"/>
            </div>
            <span className="aura-sheen" aria-hidden="true"/>
            <span className="aura-chip">INTERFACE PREVIEW</span>
          </div>
          <div className="aura-reflect" aria-hidden="true">{crop}</div>
        </motion.div>
        <figcaption>AURA sign-in interface preview. Supplied as a design preview, not a confirmed screenshot of the running application.</figcaption>
      </motion.figure></div>
    </div>
  )
}
