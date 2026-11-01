import React from 'react'

// Abstract, decorative motifs for the module gallery. They are NOT application screenshots and carry no data.
const Grid = () => <path className="mm-grid" d="M0 25H160M0 50H160M0 75H160M40 0V100M80 0V100M120 0V100" />

export default function ModuleMotif({ type }) {
  let body = null
  if (type === 'people') {
    const pts = [0, 1, 2, 3, 4, 5].map(i => [80 + 34 * Math.cos((i * Math.PI) / 3), 50 + 34 * Math.sin((i * Math.PI) / 3)])
    body = <>
      <g className="mm-spin">
        {pts.map(([x, y], i) => <line key={`l${i}`} x1="80" y1="50" x2={x} y2={y} className="mm-line" />)}
        {pts.map(([x, y], i) => <circle key={`c${i}`} cx={x} cy={y} r="5" className="mm-node" style={{ animationDelay: `${i * 0.3}s` }} />)}
      </g>
      <circle cx="80" cy="50" r="10" className="mm-core" />
    </>
  } else if (type === 'calendar') {
    const cells = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      const fc = c >= 5
      cells.push(<rect key={`${r}-${c}`} x={14 + c * 17} y={12 + r * 21} width="12" height="14" rx="2.5" className={fc ? 'mm-cell mm-fc' : 'mm-cell'} style={fc ? { animationDelay: `${(c - 5) * 0.35 + r * 0.12}s` } : undefined} />)
    }
    body = <>{cells}<line x1="97" y1="6" x2="97" y2="94" className="mm-now" /></>
  } else if (type === 'timeline') {
    const bars = [[14, 56], [38, 70], [30, 52], [62, 66]]
    body = <>
      <Grid />
      {bars.map(([x, w], i) => <rect key={i} x={x} y={14 + i * 20} width={w} height="10" rx="5" className="mm-bar" style={{ animationDelay: `${i * 0.25}s` }} />)}
      <line x1="0" y1="6" x2="0" y2="94" className="mm-now mm-sweep" />
    </>
  } else if (type === 'board') {
    body = <>
      {[0, 1, 2].map(c => <rect key={c} x={12 + c * 50} y="10" width="42" height="80" rx="5" className="mm-col" />)}
      {[0, 1, 2].map(c => [0, 1].map(r => (c === 2 && r === 1) ? null : <rect key={`${c}${r}`} x={17 + c * 50} y={18 + r * 24} width="32" height="16" rx="3" className="mm-task" />))}
      <rect x="17" y="66" width="32" height="16" rx="3" className="mm-task mm-slide" />
    </>
  } else if (type === 'tree') {
    const kids = [[35, 55], [80, 55], [125, 55]], grand = [[20, 85, 0], [50, 85, 0], [110, 85, 2], [140, 85, 2]]
    body = <>
      {kids.map(([x, y], i) => <line key={`k${i}`} x1="80" y1="18" x2={x} y2={y} className="mm-line" />)}
      {grand.map(([x, y, p], i) => <line key={`g${i}`} x1={kids[p][0]} y1={kids[p][1]} x2={x} y2={y} className="mm-line" />)}
      <circle cx="80" cy="18" r="9" className="mm-core" />
      {kids.map(([x, y], i) => <circle key={`kn${i}`} cx={x} cy={y} r="7" className="mm-node" style={{ animationDelay: `${i * 0.35}s` }} />)}
      {grand.map(([x, y], i) => <circle key={`gn${i}`} cx={x} cy={y} r="4.5" className="mm-node" style={{ animationDelay: `${0.6 + i * 0.25}s` }} />)}
    </>
  } else {
    const hs = [30, 52, 40, 66, 48, 78, 60]
    body = <>
      <Grid />
      {hs.map((h, i) => <rect key={i} x={14 + i * 20} y={92 - h} width="12" height={h} rx="2" className="mm-grow" style={{ animationDelay: `${i * 0.12}s` }} />)}
      <polyline className="mm-trace" points={hs.map((h, i) => `${20 + i * 20},${86 - h - 8}`).join(' ')} />
    </>
  }
  return <svg className={`mm mm-${type}`} viewBox="0 0 160 100" aria-hidden="true" focusable="false">{body}</svg>
}
