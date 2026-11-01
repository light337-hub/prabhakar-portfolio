import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const modified = e => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0

// Real link to the main portfolio (works with middle-click / copy link). When the visitor arrived from the portfolio's
// "Explore AURA" button it steps back through browser history instead, so the portfolio reopens at the same scroll position.
export default function BackToPortfolio({ className = 'btn btn-outline', label = 'Back to Portfolio', hash = '#projects', onClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <Link className={className} to={{ pathname: '/', hash }}
      onClick={e => {
        onClick?.(e)
        if (location.state && location.state.fromHome && !modified(e)) { e.preventDefault(); navigate(-1) }
      }}>
      <ArrowLeft size={15} aria-hidden="true" /> {label}
    </Link>
  )
}
