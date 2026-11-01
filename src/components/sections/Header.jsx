import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Download, Menu, X } from 'lucide-react'
import BackToPortfolio from '../BackToPortfolio'
import { links } from '../../data/content'

// Portfolio sections are real links to "/#section" so they work from any page (including /aura); AURA is its own page.
const nav = [['About', { pathname: '/', hash: '#about' }], ['AURA', { pathname: '/aura' }], ['Projects', { pathname: '/', hash: '#more-projects' }], ['Live Demos', { pathname: '/', hash: '#live-demos' }], ['Experience', { pathname: '/', hash: '#journey' }], ['Skills', { pathname: '/', hash: '#skills' }], ['Certificates', { pathname: '/', hash: '#certificates' }], ['Contact', { pathname: '/', hash: '#contact' }]]
export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const onAura = pathname === '/aura'
  const close = () => setOpen(false)
  return <header className="header">
    <Link className="brand" to="/" onClick={close}>PJ<span>.</span></Link>
    <nav className={open ? 'nav nav-open' : 'nav'} aria-label="Primary">
      {onAura && <BackToPortfolio className="nav-back" label="Back to Portfolio" onClick={close} />}
      {nav.map(([label, to]) => <Link key={label} to={to} aria-current={to.pathname === '/aura' && onAura ? 'page' : undefined} onClick={close}>{label}</Link>)}
    </nav>
    <a className="resume-link" href={links.resume} target="_blank" rel="noopener noreferrer"><Download size={14}/> Resume</a>
    <button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open?<X/>:<Menu/>}</button>
  </header>
}
