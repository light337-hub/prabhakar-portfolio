import React, { useRef } from 'react'
import { ArrowUpRight, Download, Mail, MapPin, Phone } from 'lucide-react'
import Socials from './Socials'
import useCosmosParallax from '../../hooks/useCosmosParallax'
import useSceneAnchor from '../../hooks/useSceneAnchor'
import useReveal from '../../hooks/useReveal'
import { links } from '../../data/content'

// Phase 6 — final scene. Copy on the left, a real 3D Earth on the right.
//  * WebGL mode  (data-scene="webgl"): the Earth, stars, orbits and nebula are drawn by the ONE global canvas (stations/EarthStation.jsx),
//    locked to two anchors: `.cosmos` (whole section = "contact-cosmos") and `.earth-anchor` (square = "earth-stage").
//    The 2D photo layers below are hidden by CSS in this mode.
//  * Static mode (no WebGL / reduced motion / low power): the previous layered 2D cosmos (nebula + Earth photo + orbit lines) is shown.
// Contact details (email, phone, resume, LinkedIn, GitHub) are unchanged real HTML links.
export default function Contact() {
  const ref = useRef(null)
  useCosmosParallax(ref)
  const cosmosRef = useSceneAnchor('contact-cosmos')
  const earthRef = useSceneAnchor('earth-stage')
  const [copyRef, seen] = useReveal('0px 0px -8% 0px')
  return <section className="contact section-wrap" id="contact" ref={ref}>
    <div className="cosmos" aria-hidden="true" ref={cosmosRef}>
      <div className="cosmos-layer cosmos-nebula"><img src="/images/cosmos/nebula-cosmos.jpg" alt="" width="1836" height="900" loading="lazy" decoding="async"/></div>
      <div className="cosmos-layer cosmos-stars"/>
      <div className="cosmos-layer cosmos-earth">
        <div className="earth-drift"><img src="/images/cosmos/earth-horizon-night.jpg" alt="" width="736" height="1308" loading="lazy" decoding="async"/></div>
        <span className="earth-rim"/>
      </div>
      <svg className="cosmos-layer cosmos-orbit" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
        <defs><linearGradient id="orb-g" x1="0" x2="1"><stop offset="0" stopColor="#F5D76E" stopOpacity="0"/><stop offset=".55" stopColor="#F5D76E" stopOpacity=".55"/><stop offset="1" stopColor="#D4AF37" stopOpacity="0"/></linearGradient></defs>
        <ellipse className="orbit-a" cx="470" cy="470" rx="470" ry="150" fill="none" stroke="url(#orb-g)" strokeWidth="1.1" transform="rotate(-24 470 470)"/>
        <ellipse className="orbit-b" cx="470" cy="470" rx="560" ry="200" fill="none" stroke="url(#orb-g)" strokeWidth=".7" opacity=".6" transform="rotate(-24 470 470)"/>
      </svg>
      <div className="cosmos-veil"/>
      <div className="cosmos-fade"/>
    </div>
    <div className="contact-bridge" aria-hidden="true"/>
    <div className={`contact-copy${seen ? ' is-in' : ''}`} ref={copyRef}>
      <p className="eyebrow cc-1">08 / LET'S CONNECT</p>
      <h2 className="cc-2">Have an idea?<br/>Let's build something <em>meaningful.</em></h2>
      <p className="cc-3">I'm open to opportunities, collaborations and interesting projects.</p>
      <div className="contact-actions cc-4"><a className="btn btn-gold" href={links.gmail} target="_blank" rel="noopener noreferrer">Send an Email <ArrowUpRight size={16}/></a><a className="btn btn-outline" href={links.resume} target="_blank" rel="noopener noreferrer"><Download size={15}/> View Resume</a></div>
      <div className="contact-details cc-5"><a href={links.gmail} target="_blank" rel="noopener noreferrer"><Mail size={15}/> {links.email}</a><a href={links.tel}><Phone size={15}/> {links.phone}</a></div>
      <p className="contact-location cc-5"><MapPin size={15} aria-hidden="true"/><span>MADURAI, INDIA</span></p>
      <div className="cc-6"><Socials/></div>
    </div>
    <div className="contact-stage" aria-hidden="true">
      <div className="earth-anchor" ref={earthRef}/>
      <p className="contact-tagline">TURNING IDEAS INTO IMPACT.</p>
    </div>
    <p className="sr-only">Decorative animated view of the Earth at night, slowly rotating, with golden city lights and two thin orbital paths. The contact details are in the text on the left.</p>
  </section>
}
