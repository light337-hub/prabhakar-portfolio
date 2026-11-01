// Phase 4 gallery copy. Only verified facts (see CLAUDE_HANDOFF_README.md, "Phase 4 session").
// Live-demo pages for Starfighter and Pooki Flames build their UI in the browser, so only their page titles could be read from
// outside; their copy is deliberately minimal and does not describe features. NetflixX's sign-in screen text was read directly.
export const coreShowcases = [
  {
    id: 'ais', num: '01', icon: 'ship', title: 'AIS Vessel Tracking',
    kicker: 'INTERNSHIP TEAM PROJECT · TPED',
    desc: 'A vessel tracking application that reads AIS NMEA messages over a COM port, decodes them and streams them through WebSockets to a live map.',
    purpose: 'Turning raw AIS messages into vessels that can be followed in real time on a map.',
    tags: ['Python', 'Flask', 'Electron', 'WebSocket', 'PyAIS', 'COM-port serial', 'Leaflet', 'OpenStreetMap'],
    pipeline: ['AIS NMEA messages', 'Serial communication (COM port)', 'AIS decoding (PyAIS)', 'WebSocket streaming', 'Live vessel map (Leaflet + OpenStreetMap)'],
    note: 'Built during my Python Developer internship at TPED (29 May – 29 June 2026) as a team project. I worked on the AIS navigation application and real-time vessel tracking system; it was not built by me alone.',
    label: 'ILLUSTRATIVE 3D · NOT A SCREENSHOT', alt: 'Illustrative 3D radar scene with floating ship markers and a route line.'
  },
  {
    id: 'drone', num: '02', icon: 'cpu', title: 'Drone Prototype',
    kicker: 'HARDWARE & CONTROL SYSTEMS',
    desc: 'A functional drone prototype built using electronic components, with hands-on exploration of hardware integration and control mechanisms.',
    purpose: 'Learning how electronics, hardware and control mechanisms come together in a working machine.',
    tags: ['Electronics', 'Embedded C', 'Hardware'],
    chips: ['Electronic components', 'Hardware integration', 'Control mechanisms'],
    note: 'The 3D drone is an illustrative model, not a photograph or CAD of my prototype. No model, range, battery, motor or sensor specifications are claimed.',
    label: 'ILLUSTRATIVE 3D MODEL', alt: 'Illustrative 3D drone slowly rotating above a gold ring.'
  },
  {
    id: 'powerbi', num: '03', icon: 'chart', title: 'Student Data Visualization',
    kicker: 'POWER BI ANALYTICS',
    desc: 'An interactive dashboard exploring student course data and presenting insights through clear visual analytics.',
    purpose: 'Making student course data easier to read through charts and visual analytics.',
    tags: ['Power BI', 'Data Visualization'],
    note: 'The floating charts are an illustrative 3D composition, not a screenshot of the dashboard. No dataset size, accuracy or outcomes are claimed.',
    label: 'ILLUSTRATIVE 3D · NOT A SCREENSHOT', alt: 'Illustrative 3D floating dashboard panels with animated bars, a line chart, a donut and flowing data points.'
  }
]

export const demoShowcases = {
  starfighter: {
    num: '01', icon: 'rocket', kicker: 'LIVE BUILD · VERCEL',
    desc: 'Published live as “Gemini Starfighter”. Open the build to explore it in the browser.',
    tags: ['Vercel', 'Web'],
    label: 'ILLUSTRATIVE 3D · NOT A SCREENSHOT', alt: 'Illustrative 3D spacecraft flying around a planet.'
  },
  netflixx: {
    num: '02', icon: 'film', kicker: 'LIVE BUILD · NETLIFY',
    desc: 'A web sign-in screen titled “NetflixX Login”, with Sign In, Remember me, Need help? and Sign up links. Created by Prabhakar_SK.',
    tags: ['Netlify', 'Web'],
    label: 'ILLUSTRATIVE 3D · NOT A SCREENSHOT', alt: 'Illustrative 3D layered screens and a sign-in panel inside a rotating film-frame ring.'
  },
  pooki: {
    num: '03', icon: 'flame', kicker: 'LIVE BUILD · VERCEL',
    desc: 'Deployed on Vercel as a Google AI Studio app. Open it live to explore it.',
    tags: ['Vercel', 'Google AI Studio'],
    label: 'ILLUSTRATIVE 3D · NOT A SCREENSHOT', alt: 'Illustrative animated 3D flame with floating sparks.'
  }
}
