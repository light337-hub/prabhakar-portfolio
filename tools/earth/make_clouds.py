#!/usr/bin/env python3
"""Phase 7: regenerate ONLY the cloud maps (earth-clouds-2k/1k.jpg) with the stripe fix.
Self-contained so the ~3 min land/lights bake does not have to run again.
Root cause of the old vertical stripes: fnoise() divided fx by `ax` (more power at high
horizontal frequency -> features narrow in x, long in y). Correct: multiply, so ax>1
stretches features ALONG longitude (east-west), like real cloud bands."""
import os, numpy as np, cv2
from PIL import Image
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'images', 'earth')
rng = np.random.default_rng(20261101)
w2, h2 = 2048, 1024
smooth = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a) / (b - a), 0, 1))

def fnoise(shape, beta, ax=1.0):
    h, w = shape
    fy = np.fft.fftfreq(h)[:, None] * h; fx = np.fft.fftfreq(w)[None, :] * w
    k = np.sqrt((fx * ax) ** 2 + fy ** 2); k[0, 0] = 1.0
    spec = np.fft.fft2(rng.standard_normal(shape).astype(np.float32)) * (k ** (-beta / 2.0)); spec[0, 0] = 0
    n = np.fft.ifft2(spec).real.astype(np.float32)
    lo, hi = np.percentile(n, [1, 99]); return np.clip((n - lo) / (hi - lo), 0, 1)

def gx(lon, lat, lo, la, sl, sa):
    dl = (lon - lo + 180) % 360 - 180
    return np.exp(-0.5 * ((dl / sl) ** 2 + ((lat - la) / sa) ** 2))

lon = (np.arange(w2) + .5) / w2 * 360 - 180; lat = 90 - (np.arange(h2) + .5) / h2 * 180
LON, LAT = np.meshgrid(lon.astype(np.float32), lat.astype(np.float32)); alat = np.abs(LAT)

# domain-warp so bands meander instead of running dead straight
wx = (fnoise((h2, w2), 2.8, 1.4) - .5) * 70; wy = (fnoise((h2, w2), 2.8, 1.4) - .5) * 40
mx, my = np.meshgrid(np.arange(w2, dtype=np.float32), np.arange(h2, dtype=np.float32))
def warp(a): return cv2.remap(a, (mx + wx).astype(np.float32), (my + wy).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)

a = warp(fnoise((h2, w2), 2.9, 1.0)); b = warp(fnoise((h2, w2), 2.1, 1.0)); c = fnoise((h2, w2), 1.5, 1.0)
# equirect pixels are narrower on the sphere toward the poles: widen features with 1/cos(lat) by blending a
# stretched layer in at high latitude so there is no pinching near the poles
pa = fnoise((h2, w2), 2.6, 0.45); t = smooth(35, 80, alat)
a = a * (1 - t) + pa * t
raw = 0.50 * a + 0.34 * b + 0.16 * c
band = (0.22 * np.exp(-0.5 * (LAT / 7) ** 2) - 0.24 * np.exp(-0.5 * ((alat - 24) / 7) ** 2)
        + 0.24 * np.exp(-0.5 * ((alat - 52) / 9) ** 2) + 0.10 * smooth(70, 88, alat))
swirl = np.zeros((h2, w2), np.float32)
for _ in range(7):
    lo = rng.uniform(-180, 180); la = rng.choice([-1, 1]) * rng.uniform(32, 58)
    swirl += 0.2 * gx(LON, LAT, lo, la, 14, 8)
dens = raw + band * 0.8 + swirl
cloud = smooth(0.52, 1.02, dens)                       # wider ramp: soft cloud bodies, not hard speckle
cloud = cloud ** 0.9 * (0.88 + 0.24 * fnoise((h2, w2), 1.4, 1.0))
cloud = np.clip(cloud, 0, 1)
cloud8 = (cloud * 255).astype(np.uint8)
def save(a, name): Image.fromarray(a, 'L').save(os.path.join(OUT, name), quality=82, optimize=True, progressive=True)
save(cloud8, 'earth-clouds-2k.jpg'); save(cv2.resize(cloud8, (1024, 512), interpolation=cv2.INTER_AREA), 'earth-clouds-1k.jpg')
# stripe metric: ratio of vertical to horizontal high-frequency energy (should be ~<=1; old file was >1)
f = cloud8.astype(np.float32)
gxe = np.abs(np.diff(f, axis=1)).mean(); gye = np.abs(np.diff(f, axis=0)).mean()
print('mean |d/dx|=%.3f  mean |d/dy|=%.3f  (stripe ratio dx/dy=%.2f)  coverage=%.3f' % (gxe, gye, gxe / gye, (cloud > .3).mean()))
