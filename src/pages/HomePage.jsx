import React, { useEffect } from 'react'
import { trackSections } from '../three/scrollStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import Hero from '../components/sections/Hero'
import Aura from '../components/sections/Aura'
import Projects from '../components/sections/Projects'
import LiveDemos from '../components/sections/LiveDemos'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Journey from '../components/sections/Journey'
import Certificates from '../components/sections/Certificates'
import Contact from '../components/sections/Contact'

const IDS = ['home', 'aura', 'more-projects', 'sc-ais', 'sc-drone', 'sc-powerbi', 'live-demos', 'sc-starfighter', 'sc-netflixx', 'sc-pooki', 'about', 'skills', 'journey', 'certificates', 'contact']

// Route "/": the main portfolio.
export default function HomePage() {
  useDocumentTitle('Prabhakar J — Software Developer & AI Enthusiast')
  useEffect(() => trackSections(IDS), [])
  return <main className="page"><Hero /><Aura /><Projects /><LiveDemos /><About /><Skills /><Journey /><Certificates /><Contact /></main>
}
