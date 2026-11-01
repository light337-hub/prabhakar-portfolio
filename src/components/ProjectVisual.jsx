import React from 'react'
import { BarChart3, Boxes, Ship, Sparkles } from 'lucide-react'

export default function ProjectVisual({ type }) {
  const Icon = type === 'ais' ? Ship : type === 'drone' ? Boxes : BarChart3
  return <div className={`visual simple-visual ${type}`} aria-hidden="true"><div className="visual-grid"/><div className="visual-icon"><Icon size={46} strokeWidth={1.1}/></div><div className="visual-label">{type === 'ais' ? 'VESSEL NETWORK' : type === 'drone' ? 'PROTOTYPE / 01' : 'DATA INSIGHTS'}</div><Sparkles className="visual-spark" size={17}/></div>
}
