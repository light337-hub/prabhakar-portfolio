import React from 'react'
import { Activity, BarChart3, Boxes, Ship, Sparkles } from 'lucide-react'

export default function ProjectVisual({ type }) {
  if (type === 'aura') return (
    <div className="visual aura-visual">
      <div className="mock-sidebar"><b>AURA.</b><span>Overview</span><span>Employees</span><span>Projects</span><span>AI Insights</span></div>
      <div className="mock-main">
        <div className="mock-top"><span>Executive Dashboard</span><span className="live-dot">● LIVE</span></div>
        <div className="mock-kpis"><div><small>Employees</small><b>121</b></div><div><small>Projects</small><b>18</b></div><div><small>Health score</small><b>75</b></div></div>
        <div className="mock-chart"><div className="bars">{[35,60,44,78,54,88,67,96,72,84].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div><div className="chart-note"><Activity size={14}/> Business performance</div></div>
      </div>
      <div className="visual-glow"/>
    </div>
  )
  const Icon = type === 'ais' ? Ship : type === 'drone' ? Boxes : BarChart3
  return <div className={`visual simple-visual ${type}`}><div className="visual-grid"/><div className="visual-icon"><Icon size={46} strokeWidth={1.1}/></div><div className="visual-label">{type === 'ais' ? 'VESSEL NETWORK' : type === 'drone' ? 'PROTOTYPE / 01' : 'DATA INSIGHTS'}</div><Sparkles className="visual-spark" size={17}/></div>
}