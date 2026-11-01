import React from 'react'
import { Download, ExternalLink } from 'lucide-react'
import { certificates } from '../../data/content'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import useReveal from '../../hooks/useReveal'

// Phase 5 / Certifications & Credentials: a separate section AFTER Education & Experience, one certificate per row.
// The three originals in /public/certificates are never modified. Previews are separate view-only images; the TPED preview
// is the original JPG itself. Actions are plain native anchors (no JavaScript handlers, no modals).
function Card({ c, i }) {
  const [ref, seen] = useReveal('0px 0px -14% 0px')
  const frame = useSceneAnchor(`cert-frame-${i}`)
  const portrait = c.h > c.w
  return <li className={`cg${portrait ? ' cg-portrait' : ''}${seen ? ' is-in' : ''}`} ref={ref}>
    <div className="cg-frame" ref={frame}>
      <div className="cg-tilt"><img src={c.preview} alt={c.alt} width={c.w} height={c.h} loading="lazy" decoding="async"/></div>
    </div>
    <div className="cg-info">
      <span className="cg-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <h3>{c.title}</h3>
      <dl className="cg-meta">
        <div><dt>Issued by</dt><dd>{c.issuer}</dd></div>
        <div><dt>Date</dt><dd>{c.date}</dd></div>
        {c.period && <div><dt>Period</dt><dd>{c.period.replace('Internship: ', '')}</dd></div>}
        {c.code && <div><dt>Certificate code</dt><dd>{c.code}</dd></div>}
      </dl>
      <p className="cg-note">{c.previewNote}. The original file is not altered.</p>
      <div className="cg-actions">
        <a className="btn btn-gold" href={c.file} target="_blank" rel="noopener noreferrer" aria-label={`View Original Certificate: ${c.title} (opens in a new tab)`}><ExternalLink size={14} aria-hidden="true"/> View Original Certificate</a>
        <a className="btn btn-outline" href={c.file} download={c.filename} aria-label={`Download Original Certificate: ${c.title}`}><Download size={14} aria-hidden="true"/> Download Original Certificate</a>
      </div>
    </div>
  </li>
}

export default function Certificates() {
  const stage = useSceneAnchor('cert-stage')
  return <section className="certs5 section-wrap" id="certificates">
    <p className="eyebrow">07 / CONTINUOUS LEARNING</p>
    <h2>Certifications & <em>credentials.</em></h2>
    <ol className="cg-list" ref={stage}>{certificates.map((c, i) => <Card c={c} i={i} key={c.id} />)}</ol>
  </section>
}
