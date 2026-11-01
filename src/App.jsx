import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import SceneBackdrop from './three/SceneBackdrop'
import { startScrollTracking } from './three/scrollStore'
import ScrollManager from './components/ScrollManager'
import Header from './components/sections/Header'
import Footer from './components/sections/Footer'
import HomePage from './pages/HomePage'
import AuraPage from './pages/AuraPage'
import NotFound from './pages/NotFound'

// The single global 3D canvas, header and footer stay mounted across routes; only <Routes> swaps the page.
//   /      main portfolio
//   /aura  AURA case study (separate page)
export default function App() {
  useEffect(() => { startScrollTracking() }, [])
  return <>
    <SceneBackdrop/>
    <div className="grain"/>
    <ScrollManager/>
    <Header/>
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/aura" element={<AuraPage/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
    <Footer/>
  </>
}
