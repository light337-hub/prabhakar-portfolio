import React, { lazy, Suspense, useEffect, useState } from 'react'
import useSceneCapability from '../hooks/useSceneCapability'
const SceneRoot = lazy(() => import('./SceneRoot'))

// Static gold-ribbon fallback: no WebGL, reduced motion, low-power devices, or a failed scene.
function StaticRibbon() {
  return (
    <div className="scene-root scene-static" aria-hidden="true">
      <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice">
        <defs><linearGradient id="gr" x1="0" x2="1"><stop offset="0" stopColor="#B8902A" stopOpacity="0"/><stop offset=".5" stopColor="#F5D76E"/><stop offset="1" stopColor="#B8902A" stopOpacity="0"/></linearGradient></defs>
        <path d="M-50 520 C 350 640, 650 430, 1000 380 S 1350 300, 1500 190" fill="none" stroke="url(#gr)" strokeWidth="3"/>
        <path d="M-50 560 C 380 690, 700 480, 1050 440 S 1380 380, 1500 270" fill="none" stroke="url(#gr)" strokeWidth="1.2" opacity=".5"/>
      </svg>
    </div>
  )
}

class SceneBoundary extends React.Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.warn('3D scene disabled, using static fallback:', err); this.props.onFail?.() }
  render() { return this.state.failed ? <StaticRibbon /> : this.props.children }
}

export default function SceneBackdrop() {
  const { enabled } = useSceneCapability()
  const [failed, setFailed] = useState(false)
  const live = enabled && !failed
  // Lets CSS swap in the static hero art / contact globe whenever the WebGL scene is not running.
  useEffect(() => { document.documentElement.dataset.scene = live ? 'webgl' : 'static' }, [live])
  if (!live) return <StaticRibbon />
  return <SceneBoundary onFail={() => setFailed(true)}><Suspense fallback={null}><SceneRoot /></Suspense></SceneBoundary>
}
