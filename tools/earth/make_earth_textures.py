#!/usr/bin/env python3
"""Bake the Phase 6 stylised Earth textures into public/images/earth/.

Usage (from the project root):  python3 tools/earth/make_earth_textures.py [--preview]
Needs: numpy, scipy, opencv-python (cv2), Pillow.  Deterministic (fixed seed).

Outputs (equirectangular, lon -180..180 left to right, lat 90..-90 top to bottom):
  earth-day-2k.jpg / earth-day-1k.jpg        colour: ocean depth + stylised biomes + hill shading
  earth-lights-2k.jpg / earth-lights-1k.jpg  grey night-light intensity (the shader tints it gold)
  earth-clouds-2k.jpg / earth-clouds-1k.jpg  grey cloud density (the shader makes it white / lit)

HONESTY NOTE: the geography is hand-authored and stylised (see geo_data.py); it is not satellite imagery or survey data.
"""
import os, sys, math
import numpy as np
import cv2
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

sys.path.insert(0, os.path.dirname(__file__))
from geo_data import LAND, WATER, RANGES, BLOBS_HEIGHT, ARIDITY, LUSH, CITIES, URBAN_REGIONS

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'images', 'earth')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20261101)
W, H = 4096, 2048          # working resolution for land / terrain
w2, h2 = 2048, 1024        # delivered 2k size

def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def fnoise(shape, beta=2.2, ax=1.0, seed_rng=None):
    """Periodic 1/f^beta noise, normalised ~0..1 (ax>1 stretches features along longitude)."""
    r = seed_rng or rng
    h, w = shape
    fy = np.fft.fftfreq(h)[:, None] * h
    fx = np.fft.fftfreq(w)[None, :] * w
    k = np.sqrt((fx * ax) ** 2 + fy ** 2); k[0, 0] = 1.0   # PHASE 7 FIX: was fx / ax, which made features TALLER than wide (vertical stripes)
    spec = np.fft.fft2(r.standard_normal(shape).astype(np.float32)) * (k ** (-beta / 2.0))
    spec[0, 0] = 0
    n = np.fft.ifft2(spec).real.astype(np.float32)
    lo, hi = np.percentile(n, [1, 99]); return np.clip((n - lo) / (hi - lo), 0, 1)

def gx(lon, lat, lo, la, sl, sa):
    """Gaussian blob on the equirect grid (lon wrap aware)."""
    dl = (lon - lo + 180) % 360 - 180
    return np.exp(-0.5 * ((dl / sl) ** 2 + ((lat - la) / sa) ** 2))

lon_g = (np.arange(W, dtype=np.float32) + 0.5) / W * 360 - 180
lat_g = 90 - (np.arange(H, dtype=np.float32) + 0.5) / H * 180
LON, LAT = np.meshgrid(lon_g, lat_g)
X = lambda lo: (np.asarray(lo) + 180) / 360 * W
Y = lambda la: (90 - np.asarray(la)) / 180 * H

# ------------------------------------------------------------------ 1. land mask (hand polygons + fractal coast warp)
img = Image.new('L', (W, H), 0); d = ImageDraw.Draw(img)
for name, poly in LAND.items():
    d.polygon([(float(X(a)), float(Y(b))) for a, b in poly], fill=255)
for name, poly in WATER.items():
    d.polygon([(float(X(a)), float(Y(b))) for a, b in poly], fill=0)
mask = np.asarray(img, dtype=np.float32) / 255
big = fnoise((H, W), 2.0, 1.0); mid = fnoise((H, W), 1.55, 1.0); fine = fnoise((H, W), 1.1, 1.0)
dx = (big - .5) * 15 + (mid - .5) * 8 + (fine - .5) * 3.2
dy = (fnoise((H, W), 2.0, 1.0) - .5) * 15 + (fnoise((H, W), 1.55, 1.0) - .5) * 8 + (fine[::-1, ::-1] - .5) * 3.2
mx, my = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
warped = cv2.remap(mask, (mx + dx).astype(np.float32), (my + dy).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
warped = cv2.GaussianBlur(warped, (0, 0), 1.0)
land = smooth(0.38, 0.62, warped)
# keep the antarctic cap solid and the very top/bottom rows clean
land[Y(-84).astype(int):, :] = 1.0
print('land fraction', round(float(land.mean()), 3), '(Earth ~0.29)')

# ------------------------------------------------------------------ 2. terrain height, aridity, lushness
base_h = fnoise((H, W), 2.6)
ridge = 1 - np.abs(2 * fnoise((H, W), 2.0) - 1)
rangem = np.zeros((H, W), np.float32)
for pts, wid, amp in RANGES:
    for (a, b), (c, e) in zip(pts[:-1], pts[1:]):
        n = max(2, int(math.hypot(c - a, e - b) / (wid * 0.5)))
        for t in np.linspace(0, 1, n):
            rangem = np.maximum(rangem, amp * gx(LON, LAT, a + (c - a) * t, b + (e - b) * t, wid / math.cos(math.radians(b + (e - b) * t)) * 0.9, wid))
plate = np.zeros((H, W), np.float32)
for lo, la, sl, sa, amp in BLOBS_HEIGHT: plate = np.maximum(plate, amp * gx(LON, LAT, lo, la, sl, sa))
height = (0.12 + 0.22 * base_h) + plate * (0.45 + 0.4 * base_h) + rangem * (0.40 + 0.60 * ridge)
height = np.clip(height, 0, 1.2) * land

arid = np.zeros((H, W), np.float32)
for lo, la, sl, sa, s in ARIDITY: arid = np.maximum(arid, s * gx(LON, LAT, lo, la, sl, sa))
arid = np.clip(arid * (0.7 + 0.6 * fnoise((H, W), 2.2)), 0, 1)
lush = np.zeros((H, W), np.float32)
for lo, la, sl, sa, s in LUSH: lush = np.maximum(lush, s * gx(LON, LAT, lo, la, sl, sa))
lush = np.clip(lush * (0.75 + 0.5 * fnoise((H, W), 2.2)), 0, 1)
boreal = np.exp(-0.5 * ((LAT - 59) / 7.5) ** 2) * (LAT > 0) * (1 - arid)
tundra = smooth(62, 71, LAT) * (LAT > 0)

# ------------------------------------------------------------------ 3. day colour
def col(r, g, b): return np.array([r, g, b], np.float32).reshape(1, 1, 3)
SAV, TROP, DES, BOR, TUN, ROCK, SNOW = col(.30, .36, .15), col(.055, .24, .08), col(.66, .52, .31), col(.075, .18, .12), col(.36, .34, .28), col(.40, .35, .31), col(.94, .96, 1.0)
c = SAV + (TROP - SAV) * lush[..., None]
c = c + (DES - c) * (arid[..., None] ** 0.9)
c = c + (BOR - c) * np.clip(boreal * 1.3, 0, 1)[..., None]
c = c + (TUN - c) * tundra[..., None]
tone = 0.88 + 0.24 * fnoise((H, W), 1.5)
c = c * tone[..., None]
rock = smooth(0.42, 0.75, height)[..., None]; c = c + (ROCK - c) * rock * 0.8
snow = smooth(0.88, 1.08, height + 0.1 * (ridge - .5))[..., None]; c = c + (SNOW - c) * snow
ice = np.maximum(smooth(-68, -74, LAT) * 0 + smooth(-66, -72, LAT), smooth(77, 83, LAT))
green_ice = gx(LON, LAT, -40, 72, 9, 7) * smooth(0.5, 0.9, warped)   # Greenland ice sheet
ice = np.clip(np.maximum(ice, green_ice * 1.3), 0, 1)
c = c + (SNOW - c) * ice[..., None]
# hill shading (light from the north-west)
hs = ndi.gaussian_filter(height, 1.2)
gy, gxx = np.gradient(hs)
shade = np.clip(1.0 + (-gxx * 1 + gy * 1) * 70, 0.55, 1.45)
c = c * (0.75 + 0.25 * shade[..., None] * np.ones_like(c))
land_c = np.clip(c, 0, 1)

# ocean: distance to coast -> shelf; deep-ocean colour variation; sea ice
coast = ndi.distance_transform_edt(land < 0.5).astype(np.float32) / (W / 360)   # degrees from land
shelf = np.exp(-coast / 1.4) * 0.42 + np.exp(-coast / 7.0) * 0.07
deep, mid_c, sh_c = col(.012, .045, .12), col(.03, .12, .27), col(.05, .24, .36)
on = fnoise((H, W), 2.4, 2.0)
oc = deep + (mid_c - deep) * (0.25 + 0.75 * on[..., None])
oc = oc + (sh_c - oc) * np.clip(shelf, 0, 1)[..., None]
thr = np.where(LAT > 0, 76.0, 67.0)
seaice = smooth(0, 5, (np.abs(LAT) - thr) + 9 * (fnoise((H, W), 1.8) - .5)) * (1 - land)
oc = oc + (col(.82, .90, .96) - oc) * seaice[..., None] * 0.9
day = land_c * land[..., None] + oc * (1 - land[..., None])
day = np.clip(day, 0, 1)
# slight gold-warm grade to sit inside the black / gold portfolio palette (kept subtle so it still reads as natural)
day = np.clip(day * col(1.02, 1.0, 0.97), 0, 1)
day8 = (np.power(day, 1 / 2.2) * 255 * 0 + day * 255).astype(np.uint8)   # stored directly (the shader treats it as sRGB)

# ------------------------------------------------------------------ 4. night lights (generated at 2k)
lon2 = (np.arange(w2, dtype=np.float32) + 0.5) / w2 * 360 - 180
lat2 = 90 - (np.arange(h2, dtype=np.float32) + 0.5) / h2 * 180
LON2, LAT2 = np.meshgrid(lon2, lat2)
land2 = cv2.resize(land, (w2, h2), interpolation=cv2.INTER_AREA)
dens = np.zeros((h2, w2), np.float32); core = np.zeros((h2, w2), np.float32)
for la, lo, wt in CITIES:
    sg = 0.30 + 0.20 * math.sqrt(wt)
    dens += (wt ** 0.7) * gx(LON2, LAT2, lo, la, sg / max(0.25, math.cos(math.radians(la))), sg)
    core += (wt ** 0.5) * 0.9 * gx(LON2, LAT2, lo, la, 0.22 / max(0.25, math.cos(math.radians(la))), 0.22)
for lo, la, sl, sa, s in URBAN_REGIONS: dens += 2.2 * s * gx(LON2, LAT2, lo, la, sl, sa)
sprawl = ndi.gaussian_filter(dens, 3.0)
# population-like density: cities + wide haze, restricted to land, poles dark
pop = (dens * 0.35 + sprawl * 0.8) * land2 * smooth(72, 60, np.abs(LAT2))
pop *= 0.55 + 0.9 * fnoise((h2, w2), 1.8)
# network lines between near, big cities (only when the whole line is over land)
lines = Image.new('L', (w2, h2), 0); ld = ImageDraw.Draw(lines)
big_c = [c_ for c_ in CITIES if c_[2] >= 2.2]
def toxy(la, lo): return ((lo + 180) / 360 * w2, (90 - la) / 180 * h2)
for i, (la1, lo1, w1) in enumerate(big_c):
    ds = sorted(((la1 - b[0]) ** 2 + ((lo1 - b[1]) * math.cos(math.radians(la1))) ** 2, j) for j, b in enumerate(big_c) if j != i)[:3]
    for dd, j in ds:
        la2, lo2, w_2 = big_c[j]
        if dd > 12 ** 2 or abs(lo1 - lo2) > 40: continue
        t = np.linspace(0, 1, 40); xs = (lo1 + (lo2 - lo1) * t + 180) / 360 * w2; ys = (90 - (la1 + (la2 - la1) * t)) / 180 * h2
        if land2[np.clip(ys.astype(int), 0, h2 - 1), np.clip(xs.astype(int), 0, w2 - 1)].min() < 0.9: continue
        ld.line([toxy(la1, lo1), toxy(la2, lo2)], fill=int(70 + 60 * min(1, (w1 * w_2) ** 0.5 / 15)), width=1)
net = np.asarray(lines, np.float32) / 255 * land2
net = cv2.GaussianBlur(net, (0, 0), 0.55)
# individual lights (rejection-free sampling from the density field)
p = np.clip(pop, 0, None).ravel(); p = p / p.sum()
n_dots = int(190000 * (w2 / 2048))
idx = rng.choice(p.size, size=n_dots, p=p)
dots = np.zeros(h2 * w2, np.float32)
np.add.at(dots, idx, rng.uniform(0.25, 1.0, n_dots).astype(np.float32))
dots = dots.reshape(h2, w2)
dots = cv2.GaussianBlur(dots, (0, 0), 0.62) * 1.9
# faint rural speckle
sp = (rng.random((h2, w2)) < 0.0016 * (pop > 0.05) * 1.0).astype(np.float32) * rng.uniform(.2, .6, (h2, w2)).astype(np.float32) * land2
glow = cv2.GaussianBlur(np.clip(pop, 0, 4), (0, 0), 2.2) * 0.07
corel = cv2.GaussianBlur(np.clip(core, 0, 3), (0, 0), 0.5)
lights = np.clip(dots + sp + net * 0.45 + glow + corel * 0.55, 0, None)
lights = np.clip(1 - np.exp(-lights * 0.55), 0, 1) ** 1.25
lights *= smooth(0.2, 0.7, land2)       # nothing over the sea
lights8 = (lights * 255).astype(np.uint8)

# ------------------------------------------------------------------ 5. clouds (2k)
cl_a = fnoise((h2, w2), 2.9, 3.2); cl_b = fnoise((h2, w2), 2.1, 2.2); cl_c = fnoise((h2, w2), 1.5, 1.6)
raw = 0.52 * cl_a + 0.33 * cl_b + 0.15 * cl_c
alat = np.abs(LAT2)
band = 0.22 * np.exp(-0.5 * (LAT2 / 7) ** 2) - 0.26 * np.exp(-0.5 * ((alat - 24) / 7) ** 2) + 0.24 * np.exp(-0.5 * ((alat - 52) / 9) ** 2) + 0.10 * smooth(70, 88, alat)
# a few big cyclone-like swirls in the mid-latitudes for a more natural look
swirl = np.zeros((h2, w2), np.float32)
for _ in range(7):
    lo = rng.uniform(-180, 180); la = rng.choice([-1, 1]) * rng.uniform(32, 58)
    swirl += 0.2 * gx(LON2, LAT2, lo, la, 14, 8)
cloud = smooth(0.60, 0.86, raw + band * 0.8 + swirl)
cloud = np.clip(cloud * (0.85 + 0.3 * fnoise((h2, w2), 1.4, 1.5)), 0, 1)
cloud8 = (cloud * 255).astype(np.uint8)

# ------------------------------------------------------------------ 6. write files
def save_rgb(a, name, q):
    Image.fromarray(a).save(os.path.join(OUT, name), quality=q, optimize=True, progressive=True, subsampling=0 if 'lights' in name else 2)
def save_l(a, name, q):
    Image.fromarray(a, 'L').save(os.path.join(OUT, name), quality=q, optimize=True, progressive=True)
day2 = cv2.resize(day8, (w2, h2), interpolation=cv2.INTER_AREA)
save_rgb(day2, 'earth-day-2k.jpg', 86)
save_rgb(cv2.resize(day8, (1024, 512), interpolation=cv2.INTER_AREA), 'earth-day-1k.jpg', 85)
save_l(lights8, 'earth-lights-2k.jpg', 90)
l1 = np.clip(cv2.resize(lights, (1024, 512), interpolation=cv2.INTER_AREA) * 1.9, 0, 1)
save_l((l1 * 255).astype(np.uint8), 'earth-lights-1k.jpg', 90)
save_l(cloud8, 'earth-clouds-2k.jpg', 80)
save_l(cv2.resize(cloud8, (1024, 512), interpolation=cv2.INTER_AREA), 'earth-clouds-1k.jpg', 80)
for f in sorted(os.listdir(OUT)): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')

if '--preview' in sys.argv:
    sc = os.environ.get('PREVIEW_DIR', '/tmp')
    pv = np.concatenate([day2, np.stack([lights8] * 3, -1), np.stack([cloud8] * 3, -1)], 0)
    Image.fromarray(pv).resize((1536, 2304)).save(os.path.join(sc, 'earth_preview.jpg'), quality=88)
    print('preview ->', os.path.join(sc, 'earth_preview.jpg'))
