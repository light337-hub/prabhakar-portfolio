import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Github, Linkedin, Mail, Menu, X, Download, Phone, MapPin, GraduationCap, BriefcaseBusiness, Code2, Sparkles } from 'lucide-react'
import Orb from './components/Orb'
import ProjectVisual from './components/ProjectVisual'
import { projects, skills, education, experience, certifications } from './data/content'

const reveal = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.22, 1, 0.36, 1] } } }

function Header() {
  const [open, setOpen] = useState(false)
  const links = [['About','#about'],['Projects','#projects'],['Experience','#journey'],['Skills','#skills'],['Contact','#contact']]
  return <header className="header">
    <a className="brand" href="#home">PJ<span>.</span></a>
    <nav className={open ? 'nav nav-open' : 'nav'}>
      {links.map(([label,href])=><a key={label} href={href} onClick={()=>setOpen(false)}>{label}</a>)}
    </nav>
    <a className="resume-link" href="/resume.pdf" target="_blank" rel="noreferrer"><Download size={14}/> Resume</a>
    <button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
  </header>
}

function Hero() {
  return <section className="hero section-wrap" id="home">
    <div className="hero-copy">
      <div className="availability"><span/> OPEN TO OPPORTUNITIES</div>
      <p className="eyebrow">HELLO, I'M</p>
      <h1>PRABHAKAR <em>J.</em></h1>
      <h2>Software Developer <span>&</span> AI Enthusiast</h2>
      <p className="hero-desc">Building intelligent applications, real-time systems and digital experiences that create real value.</p>
      <div className="hero-actions"><a className="btn btn-gold" href="#projects">Explore my work <ArrowRight size={16}/></a><a className="btn btn-outline" href="#contact">Get in touch <ArrowUpRight size={16}/></a></div>
      <div className="socials"><a href="https://www.linkedin.com/in/sk-prabhakar" aria-label="LinkedIn"><Linkedin/></a><a href="https://github.com/light337-hub" target="_blank" rel="noreferrer" aria-label="GitHub"><Github/></a><a href="mailto:sk.prabhakar003@gmail.com" aria-label="Email"><Mail/></a></div>
      <a className="scroll-cue" href="#projects"><span><ArrowDown size={14}/></span> SCROLL TO EXPLORE</a>
    </div>
    <div className="hero-art">
      <div className="hero-halo"/><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
      <div className="hero-image-frame"><img src="/images/prabhakar-portrait.jpg" alt="Prabhakar J wearing a navy suit"/></div>
      <div className="hero-stat stat-one"><b>04</b><small>PROJECTS</small></div>
      <div className="hero-stat stat-two"><b>01</b><small>INTERNSHIP</small></div>
      <div className="hero-stat stat-three"><b>∞</b><small>LEARNING</small></div>
      <div className="hero-art-caption">ENGINEERING / CREATIVITY / IMPACT</div>
    </div>
  </section>
}

function FeaturedProject() {
  const p = projects[0]
  return <section className="featured section-wrap" id="projects">
    <div className="section-heading"><div><p className="eyebrow">01 / SELECTED WORK</p><h2>Featured <em>project.</em></h2></div><span className="section-index">01 — 04</span></div>
    <div className="featured-card">
      <div className="featured-copy"><div className="featured-label"><Sparkles size={14}/> FEATURED CASE STUDY</div><h3>AURA<span>.</span></h3><h4>{p.subtitle}</h4><p>{p.description}</p><div className="tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div><a className="text-link" href="#contact">Explore case study <ArrowUpRight size={16}/></a><small className="case-note">CASE STUDY CONTENT TO BE COMPLETED WITH VERIFIED PROJECT SCREENSHOTS</small></div>
      <ProjectVisual type="aura"/>
    </div>
    <div className="other-heading"><div><p className="eyebrow">02 / MORE BUILDS</p><h3>Other projects</h3></div><span>Experiments, systems and things I've built.</span></div>
    <div className="project-grid">{projects.slice(1).map(p=><motion.article className="project-card" key={p.number} variants={reveal} initial="hidden" whileInView="show" viewport={{once:true, amount:.2}}><ProjectVisual type={p.visual}/><div className="project-meta"><span>{p.number} / PROJECT</span><span>↗</span></div><h4>{p.title}</h4><p>{p.description}</p><div className="tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div></motion.article>)}</div>
    <div className="github-project-link"><a className="btn btn-outline" href="https://github.com/light337-hub" target="_blank" rel="noreferrer"><Github size={16}/> View all repositories on GitHub <ArrowUpRight size={15}/></a></div>
  </section>
}

function About() {
  return <section className="about section-wrap" id="about">
    <div className="about-photo"><img src="/images/prabhakar-portrait.jpg" alt="Prabhakar J portrait"/><span className="photo-index">MADURAI, INDIA · 2026</span></div>
    <div className="about-copy"><p className="eyebrow">03 / A LITTLE ABOUT ME</p><h2>Curious by nature.<br/>Building <em>through technology.</em></h2><p>I'm Prabhakar J, a Computer Science and Engineering student specializing in IoT. I'm interested in software development, AI and building practical technology solutions that solve real problems.</p><p>I enjoy turning ideas into working applications, exploring new tools and learning through hands-on projects.</p><div className="about-quote">“Technology is a tool to solve real problems.”</div><a className="text-link" href="#journey">Explore my journey <ArrowRight size={16}/></a></div>
  </section>
}

function Skills() {
  return <section className="skills-section section-wrap" id="skills"><div className="section-heading"><div><p className="eyebrow">04 / TECHNICAL EXPERTISE</p><h2>Tools I work <em>with.</em></h2></div></div><div className="skills-grid">{skills.map((s,i)=><div className="skill-card" key={s.title}><div className="skill-number">0{i+1}</div><h3>{s.title}</h3><div className="skill-pills">{s.items.map(x=><span key={x}>{x}</span>)}</div></div>)}</div></section>
}

function Journey() {
  return <section className="journey section-wrap" id="journey"><div className="journey-column"><p className="eyebrow">05 / MY JOURNEY</p><h2>Education & <em>experience.</em></h2><div className="timeline">{[...education,...experience].map((e,i)=><div className="timeline-item" key={e.title}><span className="timeline-dot">{i===2?<BriefcaseBusiness size={14}/>:<GraduationCap size={14}/>}</span><div><small>{e.date}</small><h3>{e.title}</h3><p>{e.place}</p><span>{e.detail}</span></div></div>)}</div></div><div className="journey-column cert-column"><p className="eyebrow">06 / CONTINUOUS LEARNING</p><h2>Certifications & <em>learning.</em></h2><div className="cert-list">{certifications.map((c,i)=><div className="cert-item" key={c}><span>0{i+1}</span>{c}<ArrowUpRight size={14}/></div>)}</div><div className="learning-note"><Code2 size={18}/><span>Always learning. Always building.</span></div></div></section>
}

function Contact() {
  return <section className="contact section-wrap" id="contact"><div className="contact-copy"><p className="eyebrow">07 / LET'S CONNECT</p><h2>Have an idea?<br/>Let's build something <em>meaningful.</em></h2><p>I'm open to opportunities, collaborations and interesting projects.</p><div className="contact-actions"><a className="btn btn-gold" href="mailto:sk.prabhakar003@gmail.com">Send an email <ArrowUpRight size={16}/></a><a className="btn btn-outline" href="/resume.pdf" target="_blank" rel="noreferrer"><Download size={15}/> View resume</a></div><div className="contact-details"><a href="mailto:sk.prabhakar003@gmail.com"><Mail size={15}/> sk.prabhakar003@gmail.com</a><a href="tel:+918122450853"><Phone size={15}/> +91 81224 50853</a></div><div className="socials"><a href="https://www.linkedin.com/in/sk-prabhakar"><Linkedin/></a><a href="https://github.com/light337-hub" target="_blank" rel="noreferrer" aria-label="GitHub"><Github/></a><a href="mailto:sk.prabhakar003@gmail.com"><Mail/></a></div></div><div className="contact-orb"><Orb/><div className="orb-caption">TURNING IDEAS<br/>INTO IMPACT.</div></div></section>
}

export default function App() {
  return <><div className="grain"/><Header/><main><Hero/><FeaturedProject/><About/><Skills/><Journey/><Contact/></main><footer className="footer"><a className="brand" href="#home">PJ<span>.</span></a><span>Designed & built with curiosity.</span><span>© 2026 PRABHAKAR J</span></footer></>
}