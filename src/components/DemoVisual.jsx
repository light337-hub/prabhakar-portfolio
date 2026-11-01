import React from 'react'

// Custom, clearly illustrative previews (CSS/SVG). They are NOT screenshots of the live apps.
export default function DemoVisual({ id }) {
  if (id === 'starfighter') return (
    <div className="dv dv-star" aria-hidden="true">
      <div className="dv-stars l-far"/><div className="dv-stars l-near"/>
      <svg className="dv-layer l-mid" viewBox="0 0 200 200"><defs><linearGradient id="sf" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#F5D76E"/><stop offset="1" stopColor="#B8902A"/></linearGradient></defs>
        <circle cx="100" cy="100" r="78" fill="none" stroke="#D4AF37" strokeOpacity=".35" strokeDasharray="3 7"/>
        <path d="M100 28 L128 120 L100 104 L72 120 Z" fill="url(#sf)"/><path d="M72 120 L40 150 L84 136 Z M128 120 L160 150 L116 136 Z" fill="#B8902A"/><path d="M100 104 L100 150" stroke="#050505" strokeOpacity=".5"/></svg>
      <i className="dv-corner tl"/><i className="dv-corner br"/>
    </div>)
  if (id === 'netflixx') return (
    <div className="dv dv-nx" aria-hidden="true">
      <div className="dv-glow"/>
      <div className="nx-card l-mid"><b>NETFLIXX</b><span>Sign In</span><i/><i/><em>Sign In</em></div>
      <div className="nx-ghost l-far"/>
    </div>)
  return (
    <div className="dv dv-fl" aria-hidden="true">
      <div className="dv-glow"/>
      <svg className="dv-layer l-far" viewBox="0 0 200 200"><path d="M100 18 C130 62 160 80 150 132 C144 166 120 184 100 184 C70 184 48 160 52 126 C56 94 84 84 100 18Z" fill="#B8902A" opacity=".5"/></svg>
      <svg className="dv-layer l-mid" viewBox="0 0 200 200"><defs><linearGradient id="fl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#F5D76E"/><stop offset="1" stopColor="#B8902A"/></linearGradient></defs>
        <path d="M100 46 C122 80 144 96 138 134 C134 160 116 172 100 172 C80 172 64 156 66 132 C68 108 90 98 100 46Z" fill="url(#fl)"/></svg>
      <svg className="dv-layer l-near" viewBox="0 0 200 200"><path d="M100 98 C112 118 124 126 120 146 C118 158 108 164 100 164 C90 164 82 156 83 146 C85 132 96 126 100 98Z" fill="#050505" opacity=".55"/></svg>
    </div>)
}
