// Single source of truth for portfolio content. Only verified facts (see CLAUDE_HANDOFF_README.md).
export const links = {
  email: 'sk.prabhakar003@gmail.com',
  mailto: 'mailto:sk.prabhakar003@gmail.com',   // fallback only (not used by the primary actions: it does not reliably open a composer on Windows)
  gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=sk.prabhakar003@gmail.com',   // primary email action: Gmail web compose, new tab
  phone: '+91 81224 50853',
  tel: 'tel:+918122450853',
  linkedin: 'https://www.linkedin.com/in/sk-prabhakar/',
  github: 'https://github.com/light337-hub',
  resume: '/resume.pdf',
  portrait: '/images/prabhakar-portrait-clean.jpg'   // display portrait WITHOUT the white sparkle. The original master /images/prabhakar-portrait.jpg is kept unchanged.
}

export const projects = [
  {
    number: '01',
    title: 'AURA',
    fullName: 'Artificial Unified Resource Analytics',
    subtitle: 'AI-Powered Project Management & Business Intelligence System',
    description: 'An intelligent organizational management and decision-support platform bringing project operations, employee workflows, attendance-related operations and business-intelligence dashboards into one place.',
    mlRoles: [
      { model: 'Chronos-2', role: 'Attendance forecasting over 7-week or 14-week horizons' },
      { model: 'TabPFN', role: 'Employee-risk prediction' }
    ],
    tags: ['Python', 'Flask', 'SQLite', 'Chronos-2', 'TabPFN'],
    type: 'FEATURED CASE STUDY',
    visual: 'aura'
  },
  {
    number: '02',
    title: 'AIS Vessel Tracking',
    subtitle: 'Real-time maritime navigation',
    description: 'A vessel tracking application integrating AIS NMEA decoding, serial communication, WebSockets and an interactive map.',
    tags: ['Python', 'Leaflet', 'WebSocket', 'Electron'],
    visual: 'ais'
  },
  {
    number: '03',
    title: 'Drone Prototype',
    subtitle: 'Hardware & control systems',
    description: 'A functional drone prototype built using electronic components, with hands-on exploration of hardware integration and control mechanisms.',
    tags: ['Electronics', 'Embedded C', 'Hardware'],
    visual: 'drone'
  },
  {
    number: '04',
    title: 'Student Data Visualization',
    subtitle: 'Power BI analytics dashboard',
    description: 'An interactive dashboard exploring student course data and presenting insights through clear visual analytics.',
    tags: ['Power BI', 'Data Analytics'],
    visual: 'powerbi'
  }
]

// Live demos: URLs supplied/confirmed by Prabhakar. Descriptions limited to what was verified on each live page
// (title / visible screen / hosting). Do not add feature claims without confirmation.
export const liveDemos = [
  { id: 'starfighter', title: 'Gemini Starfighter', url: 'https://project-x-zeta-opal.vercel.app', host: 'Vercel',
    blurb: 'An interactive browser build published as “Gemini Starfighter”. Launch the live project to explore it.' },
  { id: 'netflixx', title: 'NetflixX', url: 'https://netfilxx-sk.netlify.app', host: 'Netlify',
    blurb: 'A web app that opens on a NetflixX sign-in screen. Open the live project to see it in the browser.' },
  { id: 'pooki', title: 'Pooki Flames', url: 'https://flames-beta-five.vercel.app', host: 'Vercel',
    blurb: 'Deployed on Vercel as a Google AI Studio app. Open it live to explore it.' }
]
// Personal LinkedIn profile (replaces the earlier shortened post link; do not restore the old URL).
export const linkedinShowcase = { url: 'https://www.linkedin.com/in/sk-prabhakar/', title: 'LinkedIn profile' }

// Hero statistics. 07 = 4 core projects + 3 live demos. The infinity symbol is a personal motto, not a measured figure.
export const heroStats = [
  { value: String(projects.length + liveDemos.length).padStart(2, '0'), label: 'PROJECTS', a11y: `${projects.length + liveDemos.length} projects: ${projects.length} core projects and ${liveDemos.length} live demos` },
  { value: '01', label: 'INTERNSHIP', a11y: 'One internship completed' },
  { value: '∞', label: 'LEARNING', a11y: 'Continuous learning, a personal motto' }
]

// AURA interface preview: the user-supplied image, served unchanged. Crop box = the picture area inside the file's white margins (px).
export const auraPreview = {
  src: '/images/aura-login-interface-preview.png',
  file: { w: 1080, h: 570 },
  crop: { x: 104, y: 73, w: 921, h: 485 },
  alt: 'AURA sign-in interface preview: the AURA logo over a night-time view of Earth with golden city lights, and a Sign in to AURA panel with email and password fields, a Sign in button and a Continue with Microsoft option.'
}

// ===== Phase 5 content. Only facts present in the source data, the three certificates and the project information. =====
export const aboutContent = {
  headline: ['Curious by nature.', 'Building through technology.'],
  paragraphs: [
    'I’m Prabhakar J, a Computer Science and Engineering (IoT) student at KLN College of Engineering, Madurai. I’m interested in software development, AI and building practical technology solutions.',
    'My projects range from AURA, an AI-powered project management and business-intelligence system, to a vessel tracking application built during my Python Developer internship at TPED, a drone prototype and a Power BI dashboard. I learn best by building.'
  ],
  quote: 'Technology is a tool to solve real problems.',
  facts: [
    { k: 'STUDYING', v: 'B.E. CSE (IoT) · KLN College of Engineering' },
    { k: 'BASED IN', v: 'Madurai, Tamil Nadu, India' },
    { k: 'INTERNSHIP', v: 'Python Developer Intern · TPED · Completed' }
  ]
}

// Tools I work with. No proficiency scores. `note` appears only where the project data confirms the context.
// accent = controlled colour for the group (gold stays the portfolio identity).
export const toolGroups = [
  { id: 'programming', title: 'Programming', accent: '#D4AF37', items: [{ name: 'Python', mark: 'Py', note: 'AURA · AIS tracking' }, { name: 'C', mark: 'C', note: 'Embedded C · drone prototype' }, { name: 'JavaScript', mark: 'JS' }] },
  { id: 'web', title: 'Web Development', accent: '#F08A4B', items: [{ name: 'HTML', mark: '</>' }, { name: 'CSS', mark: '{ }' }, { name: 'JavaScript', mark: 'JS' }] },
  { id: 'data', title: 'Data & Analytics', accent: '#F2C811', items: [{ name: 'Power BI', mark: 'BI', note: 'Student data visualization' }] },
  { id: 'ai', title: 'AI / ML', accent: '#4FC3F7', items: [{ name: 'Amazon Chronos-2', mark: 'C2', note: 'AURA · attendance forecasting' }, { name: 'TabPFN', mark: 'TP', note: 'AURA · employee-risk prediction' }] },
  { id: 'assist', title: 'AI-Assisted Development & Vibe Coding', accent: '#A78BFA', items: [{ name: 'Gemini AI Studio', mark: 'GA' }, { name: 'Claude', mark: 'Cl', note: 'Exploring' }, { name: 'Vibe Coding / AI-assisted workflows', mark: 'VC' }] },
  { id: 'devtools', title: 'Development Tools', accent: '#C9D1D9', items: [{ name: 'VS Code', mark: 'VS' }, { name: 'Git', mark: 'Git' }, { name: 'GitHub', mark: 'GH' }, { name: 'Electron', mark: 'El', note: 'AIS tracking app' }, { name: 'Leaflet', mark: 'Lf', note: 'AIS live map' }] },
  { id: 'deploy', title: 'Deployment', accent: '#3DDC97', items: [{ name: 'Vercel', mark: '▲', note: 'Hosts Starfighter & Pooki Flames' }, { name: 'Railway', mark: 'Rw' }] }
]
export const aiUse = {
  title: 'How I use AI tools',
  intro: 'I use AI tools as assistants alongside my own learning and building. I don’t claim expert-level proficiency in every tool.',
  points: ['Rapid prototyping', 'Code generation and assistance', 'Debugging', 'Improving existing applications', 'UI development', 'Learning and experimentation']
}

// One vertical timeline, in this order. CGPA and percentage are the values already in the portfolio source data.
export const timeline = [
  { id: 'edu-1', label: 'EDUCATION 01', kind: 'edu', date: '2023 — PRESENT', title: 'B.E. Computer Science and Engineering (IoT)', org: 'KLN College of Engineering, Madurai', facts: ['CGPA 8.0'] },
  { id: 'edu-2', label: 'EDUCATION 02', kind: 'edu', date: '2023', title: 'Higher Secondary (12th)', org: 'Madurai Meenakshi Matriculation Higher Secondary School', facts: ['85%'] },
  { id: 'exp-1', label: 'EXPERIENCE 01', kind: 'work', date: '29 MAY 2026 — 29 JUNE 2026', title: 'Python Developer Intern', org: 'Total Plant Engineering & Design Pvt. Ltd. (TPED)', status: 'Completed',
    project: 'AIS Transmitter & Receiver System',
    detail: 'Internship team-project experience on the AIS navigation application and real-time vessel tracking system. This was a team project, not built by me alone.',
    facts: ['Python', 'Serial communication', 'WebSocket', 'Leaflet', 'Electron'] }
]

// Genuine originals only. `file` is the untouched original; `preview` is a separate view-only image (the TPED preview IS the original JPG).
export const certificates = [
  { id: 'ape', title: 'Advanced Prompt Engineering', issuer: 'SkillUp', date: '15 December 2025', code: '9587211', file: '/certificates/advanced-prompt-engineering.pdf', filename: 'advanced-prompt-engineering.pdf', preview: '/certificates/previews/advanced-prompt-engineering.png', previewNote: 'View-only preview rendered from page 1 of the original PDF', w: 1287, h: 910, alt: 'Preview of the original certificate of completion: Advanced Prompt Engineering, awarded to Prabhakar J, dated 15 December 2025, certificate code 9587211.' },
  { id: 'ida', title: 'Introduction to Data Analytics', issuer: 'SkillUp', date: '11 December 2025', code: '9569208', file: '/certificates/introduction-to-data-analytics.pdf', filename: 'introduction-to-data-analytics.pdf', preview: '/certificates/previews/introduction-to-data-analytics.png', previewNote: 'View-only preview rendered from page 1 of the original PDF', w: 1287, h: 910, alt: 'Preview of the original certificate of completion: Introduction to Data Analytics, awarded to Prabhakar J, dated 11 December 2025, certificate code 9569208.' },
  { id: 'tped', title: 'TPED AIS Transmitter & Receiver Internship Completion', issuer: 'Total Plant Engineering & Design Pvt. Ltd.', date: 'Dated 29/06/2026 on the certificate', period: 'Internship: 29 May – 29 June 2026', file: '/certificates/tped-internship-completion-certificate.jpg', filename: 'tped-internship-completion-certificate.jpg', preview: '/certificates/tped-internship-completion-certificate.jpg', previewNote: 'Preview is the original JPG file, shown unchanged', w: 480, h: 675, alt: 'The original TPED internship completion certificate: a letter from Total Plant Engineering and Design Pvt. Ltd. confirming the internship on the TPED AIS transmitter and receiver project from 29 May 2026 to 29 June 2026.' }
]
