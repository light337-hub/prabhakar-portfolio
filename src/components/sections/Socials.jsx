import React from 'react'
import { Github, Linkedin, Mail } from 'lucide-react'
import { links } from '../../data/content'
export default function Socials() {
  return <div className="socials">
    <a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin/></a>
    <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github/></a>
    <a href={links.gmail} target="_blank" rel="noopener noreferrer" aria-label="Email (opens Gmail compose in a new tab)"><Mail/></a>
  </div>
}
