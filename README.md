# Prabhakar J — Portfolio (cinematic redesign in progress, Phase 3 complete in code)

React + Vite + React Three Fiber. Black (#050505) and metallic gold (#B8902A / #D4AF37 / #F5D76E).
See `CLAUDE_HANDOFF_README.md` for status, decisions and the next task.

```bash
npm install
npm run dev
npm run build
```
Originals in `public/` (resume, certificates, portrait) must never be altered.

Phase 3 (AURA case study): see `src/components/aura/`, `src/data/aura.js` (all case-study copy) and `src/three/stations/Aura*Station.jsx`.

Routing (Phase 3b): React Router DOM. `/` = main portfolio, `/aura` = separate AURA case study (`src/pages/`). Run `npm install` after pulling (new dependency `react-router-dom`). For production, every path must fall back to `index.html` (`vercel.json` / `netlify.toml` included). The journal publication card reads `auraPublication` in `src/data/aura.js`.
