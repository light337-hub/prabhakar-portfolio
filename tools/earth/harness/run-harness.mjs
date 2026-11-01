// Usage: node tools/earth/harness/run-harness.mjs <outDir>   (needs a global `playwright` + the pre-installed Chromium)
// Serves the project folder, loads harness.html in headless Chromium (software WebGL2) and saves screenshots + a shader log.
import { createRequire } from 'node:module'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..')
const out = process.argv[2] || '/tmp'
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' }
const srv = http.createServer((req, res) => { const f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end() } res.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res) }).listen(0)
const port = srv.address().port
const shots = [
  ['india_sun_left', 'lon=78&t=3'], ['americas', 'lon=-80&t=3'], ['europe_africa', 'lon=15&t=3'], ['pacific', 'lon=165&t=3'],
  ['mobile_1k', 'lon=78&w=390&h=520&cx=0.5&scale=1.9&res=1k&t=5'], ['no_rings_sun_high', 'lon=100&sun=-0.5,0.7,0.5&rings=0&t=8']
]
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
let failed = false
for (const [name, qs] of shots) {
  const pg = await b.newPage({ viewport: { width: 1200, height: 900 } })
  pg.on('console', m => { if (m.type() === 'error') console.log('console.error:', m.text()) })
  await pg.goto(`http://127.0.0.1:${port}/tools/earth/harness/harness.html?${qs}`)
  await pg.waitForFunction('window.__done === true', null, { timeout: 120000 })
  const log = await pg.evaluate('window.__log')
  if (name === shots[0][0]) console.log(log.join('\n'))
  if (log.some(l => /ERROR|FAIL|EXCEPTION|NO WEBGL2/.test(l))) { failed = true; console.log(name, log.filter(l => /ERROR|FAIL|EXCEPTION|NO WEBGL2/.test(l)).join('\n')) }
  await pg.locator('canvas').screenshot({ path: path.join(out, `earth_${name}.png`) })
  await pg.close()
}
await b.close(); srv.close()
console.log(failed ? 'HARNESS: FAILED' : 'HARNESS: all shaders compiled, linked and rendered')
process.exit(failed ? 1 : 0)
