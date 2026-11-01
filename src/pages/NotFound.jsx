import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'

// Any unknown URL (for example a mistyped /auras) lands here instead of a blank page.
export default function NotFound() {
  useDocumentTitle('Page not found | Prabhakar J')
  return (
    <main className="page notfound section-wrap">
      <p className="eyebrow">404</p>
      <h1>This page <em>doesn’t exist.</em></h1>
      <p>The link may be mistyped or out of date.</p>
      <div className="notfound-actions">
        <Link className="btn btn-gold" to="/"><ArrowLeft size={16} aria-hidden="true" /> Back to Portfolio</Link>
        <Link className="btn btn-outline" to="/aura">View the AURA case study</Link>
      </div>
    </main>
  )
}
