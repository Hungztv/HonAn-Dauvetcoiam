import * as THREE from 'three';
import { VISUAL_STANDARD } from './VisualStandard';

export type MaterialKey =
  | 'wood_dark'
  | 'wood_old'
  | 'plaster'
  | 'brick'
  | 'stone'
  | 'dirt'
  | 'tile_floor'
  | 'roof'
  | 'altar_red'
  | 'bamboo'
  | 'water'
  | 'curtain'
  | 'metal'
  | 'gold'
  | 'paper';

const textureCache = new Map<string, THREE.CanvasTexture>();
const materialCache = new Map<MaterialKey, THREE.MeshStandardMaterial>();

interface PBRTextureSet {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

function finalizeTexture(canvas: HTMLCanvasElement, repeat: number, isColor: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * Converts a grayscale height canvas into a true tangent-space RGB Normal Map using Sobel gradients.
 * Produces crisp directional lighting & realistic flashlight surface micro-relief.
 */
function heightCanvasToNormalCanvas(heightCanvas: HTMLCanvasElement, strength = 2.4): HTMLCanvasElement {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const hCtx = heightCanvas.getContext('2d')!;
  const src = hCtx.getImageData(0, 0, w, h).data;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext('2d')!;
  const dstImg = outCtx.createImageData(w, h);
  const dst = dstImg.data;

  const sample = (x: number, y: number): number => {
    const cx = (x + w) % w;
    const cy = (y + h) % h;
    return src[(cy * w + cx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tl = sample(x - 1, y - 1);
      const t = sample(x, y - 1);
      const tr = sample(x + 1, y - 1);
      const l = sample(x - 1, y);
      const r = sample(x + 1, y);
      const bl = sample(x - 1, y + 1);
      const b = sample(x, y + 1);
      const br = sample(x + 1, y + 1);

      const dX = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dY = (bl + 2 * b + br) - (tl + 2 * t + tr);

      let nx = -dX * strength;
      let ny = -dY * strength;
      let nz = 1.0;
      const invLen = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx *= invLen;
      ny *= invLen;
      nz *= invLen;

      const idx = (y * w + x) * 4;
      dst[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      dst[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      dst[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      dst[idx + 3] = 255;
    }
  }

  outCtx.putImageData(dstImg, 0, 0);
  return outCanvas;
}

function createPBRSet(
  key: string,
  size: number,
  repeat: number,
  normalStrength: number,
  drawer: (
    albedo: CanvasRenderingContext2D,
    height: CanvasRenderingContext2D,
    rough: CanvasRenderingContext2D,
    s: number
  ) => void
): PBRTextureSet {
  const mk = `${key}_map`;
  const nk = `${key}_normal`;
  const rk = `${key}_rough`;
  if (textureCache.has(mk) && textureCache.has(nk) && textureCache.has(rk)) {
    return {
      map: textureCache.get(mk)!,
      normalMap: textureCache.get(nk)!,
      roughnessMap: textureCache.get(rk)!,
    };
  }

  const cMap = document.createElement('canvas');
  const cHeight = document.createElement('canvas');
  const cRough = document.createElement('canvas');
  cMap.width = cHeight.width = cRough.width = size;
  cMap.height = cHeight.height = cRough.height = size;

  const ctxMap = cMap.getContext('2d')!;
  const ctxHeight = cHeight.getContext('2d')!;
  const ctxRough = cRough.getContext('2d')!;

  ctxHeight.fillStyle = '#808080';
  ctxHeight.fillRect(0, 0, size, size);
  ctxRough.fillStyle = '#cccccc';
  ctxRough.fillRect(0, 0, size, size);

  drawer(ctxMap, ctxHeight, ctxRough, size);

  const cNormal = heightCanvasToNormalCanvas(cHeight, normalStrength);

  const map = finalizeTexture(cMap, repeat, true);
  const normalMap = finalizeTexture(cNormal, repeat, false);
  const roughnessMap = finalizeTexture(cRough, repeat, false);

  textureCache.set(mk, map);
  textureCache.set(nk, normalMap);
  textureCache.set(rk, roughnessMap);

  return { map, normalMap, roughnessMap };
}

function drawWoodPBR(
  a: CanvasRenderingContext2D,
  b: CanvasRenderingContext2D,
  r: CanvasRenderingContext2D,
  s: number,
  baseHex: string,
  grainRgba: string,
  aged: boolean
) {
  a.fillStyle = baseHex;
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#9a9a9a';
  b.fillRect(0, 0, s, s);
  r.fillStyle = aged ? '#c4c4c4' : '#a8a8a8';
  r.fillRect(0, 0, s, s);

  const planks = 6;
  const pw = s / planks;

  for (let p = 0; p < planks; p++) {
    const x = p * pw;
    a.fillStyle = p % 2 === 0 ? 'rgba(0,0,0,0.14)' : 'rgba(255,215,170,0.035)';
    a.fillRect(x, 0, pw, s);

    // Deep bevel seam + natural ambient occlusion shadow
    a.fillStyle = 'rgba(5,3,2,0.8)';
    a.fillRect(x, 0, 4, s);
    b.fillStyle = '#141414';
    b.fillRect(x, 0, 6, s);
    r.fillStyle = '#f5f5f5';
    r.fillRect(x, 0, 6, s);

    const seamY = ((p * 173) % (s - 80)) + 40;
    a.fillStyle = 'rgba(0,0,0,0.6)';
    a.fillRect(x, seamY, pw, 3);
    b.fillStyle = '#1c1c1c';
    b.fillRect(x, seamY, pw, 4);
  }

  // Flowing ironwood grain fibers & cracks
  for (let i = 0; i < 185; i++) {
    const x = Math.random() * s;
    const ctrl1 = x + (Math.random() - 0.5) * 18;
    const ctrl2 = x + (Math.random() - 0.5) * 18;
    a.strokeStyle = grainRgba;
    a.lineWidth = 0.8 + Math.random() * 1.6;
    a.beginPath();
    a.moveTo(x, 0);
    a.bezierCurveTo(ctrl1, s * 0.33, ctrl2, s * 0.66, x, s);
    a.stroke();

    b.strokeStyle = i % 2 === 0 ? 'rgba(225,225,225,0.26)' : 'rgba(35,35,35,0.28)';
    b.lineWidth = 1.2;
    b.beginPath();
    b.moveTo(x, 0);
    b.bezierCurveTo(ctrl1, s * 0.33, ctrl2, s * 0.66, x, s);
    b.stroke();
  }

  // Aged wood knots & split fissures
  for (let k = 0; k < 6; k++) {
    const kx = Math.random() * s;
    const ky = Math.random() * s;
    const kr = 6 + Math.random() * 10;
    a.strokeStyle = 'rgba(8,4,2,0.62)';
    a.lineWidth = 2;
    a.beginPath();
    a.ellipse(kx, ky, kr * 0.6, kr * 1.4, 0, 0, Math.PI * 2);
    a.stroke();
    b.fillStyle = '#2e2e2e';
    b.beginPath();
    b.ellipse(kx, ky, kr * 0.5, kr * 1.1, 0, 0, Math.PI * 2);
    b.fill();
  }

  // Damp glossy moisture patches
  for (let d = 0; d < 14; d++) {
    const dx = Math.random() * s;
    const dy = Math.random() * s;
    const dr = 28 + Math.random() * 68;
    const grad = r.createRadialGradient(dx, dy, 4, dx, dy, dr);
    grad.addColorStop(0, 'rgba(58,58,58,0.62)');
    grad.addColorStop(1, 'rgba(195,195,195,0)');
    r.fillStyle = grad;
    r.fillRect(0, 0, s, s);
  }
}

function drawPlasterPBR(
  a: CanvasRenderingContext2D,
  b: CanvasRenderingContext2D,
  r: CanvasRenderingContext2D,
  s: number
) {
  a.fillStyle = '#5a5244';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#929292';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#dedede';
  r.fillRect(0, 0, s, s);

  // Fine stucco plaster texture
  for (let i = 0; i < 1900; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const sz = 1 + Math.random() * 3;
    const v = 105 + Math.floor(Math.random() * 60);
    b.fillStyle = `rgb(${v},${v},${v})`;
    b.fillRect(x, y, sz, sz);
  }

  // Rising damp AO darkening near bottom of wall + soot near top
  const dampGrad = a.createLinearGradient(0, s, 0, 0);
  dampGrad.addColorStop(0, 'rgba(14, 18, 12, 0.45)');
  dampGrad.addColorStop(0.28, 'rgba(16, 14, 10, 0.12)');
  dampGrad.addColorStop(0.85, 'rgba(0,0,0,0)');
  dampGrad.addColorStop(1, 'rgba(14, 10, 8, 0.25)');
  a.fillStyle = dampGrad;
  a.fillRect(0, 0, s, s);

  // Vietnamese old limewall water streaks & black mold
  for (let i = 0; i < 52; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const rad = 22 + Math.random() * 92;
    const grad = a.createRadialGradient(x, y, 3, x, y, rad);
    const pick = i % 4;
    grad.addColorStop(
      0,
      pick === 0
        ? 'rgba(20, 32, 18, 0.45)'
        : pick === 1
        ? 'rgba(18, 13, 10, 0.4)'
        : 'rgba(128, 112, 82, 0.16)'
    );
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    a.fillStyle = grad;
    a.fillRect(0, 0, s, s);

    if (pick === 0 || pick === 1) {
      const rGrad = r.createRadialGradient(x, y, 4, x, y, rad * 0.8);
      rGrad.addColorStop(0, 'rgba(72,72,72,0.7)');
      rGrad.addColorStop(1, 'rgba(220,220,220,0)');
      r.fillStyle = rGrad;
      r.fillRect(0, 0, s, s);
    }
  }

  // Peeling plaster patches exposing old mortar/brick beneath
  for (let p = 0; p < 7; p++) {
    const px = Math.random() * s;
    const py = Math.random() * s;
    const rx = 18 + Math.random() * 40;
    const ry = 12 + Math.random() * 30;
    a.fillStyle = 'rgba(46, 31, 22, 0.78)';
    a.beginPath();
    a.ellipse(px, py, rx, ry, Math.random(), 0, Math.PI * 2);
    a.fill();
    b.fillStyle = '#242424';
    b.beginPath();
    b.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    b.fill();
  }

  // Deep spiderweb cracks
  for (let c = 0; c < 12; c++) {
    let cx = Math.random() * s;
    let cy = Math.random() * s;
    a.strokeStyle = 'rgba(12, 9, 7, 0.78)';
    a.lineWidth = 1.6;
    b.strokeStyle = '#0c0c0c';
    b.lineWidth = 2.8;
    a.beginPath();
    b.beginPath();
    a.moveTo(cx, cy);
    b.moveTo(cx, cy);
    for (let st = 0; st < 8; st++) {
      cx += (Math.random() - 0.5) * 48;
      cy += Math.random() * 44;
      a.lineTo(cx, cy);
      b.lineTo(cx, cy);
    }
    a.stroke();
    b.stroke();
  }
}

function drawBrickOrTilePBR(
  a: CanvasRenderingContext2D,
  b: CanvasRenderingContext2D,
  r: CanvasRenderingContext2D,
  s: number,
  isBrick: boolean
) {
  a.fillStyle = '#1e1713';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#161616';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#f0f0f0';
  r.fillRect(0, 0, s, s);

  const rows = isBrick ? 10 : 4;
  const cols = isBrick ? 5 : 4;
  const rh = s / rows;
  const cw = s / cols;
  const gap = isBrick ? 4 : 6;

  for (let row = 0; row < rows; row++) {
    const offset = isBrick && row % 2 === 1 ? cw * 0.5 : 0;
    for (let col = -1; col <= cols; col++) {
      const x = col * cw + offset + gap;
      const y = row * rh + gap;
      const w = cw - gap * 2;
      const h = rh - gap * 2;
      const shade = 0.74 + Math.random() * 0.34;

      a.fillStyle = isBrick
        ? `rgb(${Math.floor(84 * shade)}, ${Math.floor(44 * shade)}, ${Math.floor(33 * shade)})`
        : `rgb(${Math.floor(94 * shade)}, ${Math.floor(49 * shade)}, ${Math.floor(36 * shade)})`;
      a.fillRect(x, y, w, h);

      // Subtle beveled tile edge darkening (baked AO)
      a.strokeStyle = 'rgba(10,6,4,0.45)';
      a.lineWidth = 2;
      a.strokeRect(x, y, w, h);

      const bVal = Math.floor(182 + Math.random() * 44);
      b.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      b.fillRect(x, y, w, h);

      // Non-uniform worn clay tile sheen
      const rVal = isBrick ? 188 + Math.random() * 34 : 108 + Math.random() * 72;
      r.fillStyle = `rgb(${Math.floor(rVal)},${Math.floor(rVal)},${Math.floor(rVal)})`;
      r.fillRect(x, y, w, h);
    }
  }

  for (let m = 0; m < 28; m++) {
    const mx = Math.random() * s;
    const my = Math.random() * s;
    const mr = 14 + Math.random() * 45;
    a.fillStyle = m % 2 === 0 ? 'rgba(18, 32, 16, 0.3)' : 'rgba(10, 8, 7, 0.28)';
    a.beginPath();
    a.arc(mx, my, mr, 0, Math.PI * 2);
    a.fill();
    if (!isBrick && m % 3 === 0) {
      const g = r.createRadialGradient(mx, my, 2, mx, my, mr);
      g.addColorStop(0, 'rgba(30,30,30,0.88)');
      g.addColorStop(1, 'rgba(165,165,165,0)');
      r.fillStyle = g;
      r.fillRect(0, 0, s, s);
    }
  }
}

function drawStonePBR(
  a: CanvasRenderingContext2D,
  b: CanvasRenderingContext2D,
  r: CanvasRenderingContext2D,
  s: number
) {
  a.fillStyle = '#343531';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#686868';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#cccccc';
  r.fillRect(0, 0, s, s);

  const rows = 6;
  const rh = s / rows;
  for (let row = 0; row < rows; row++) {
    let x = -(row % 2) * 36;
    while (x < s) {
      const w = 68 + Math.random() * 75;
      const tone = 46 + Math.floor(Math.random() * 34);
      a.fillStyle = `rgb(${tone},${tone + 2},${tone - 2})`;
      a.fillRect(x + 3, row * rh + 3, w - 6, rh - 6);

      const bv = 165 + Math.floor(Math.random() * 62);
      b.fillStyle = `rgb(${bv},${bv},${bv})`;
      b.fillRect(x + 4, row * rh + 4, w - 8, rh - 8);
      x += w;
    }
  }

  for (let i = 0; i < 36; i++) {
    const mx = Math.random() * s;
    const my = Math.random() * s;
    const mr = 14 + Math.random() * 44;
    a.fillStyle = 'rgba(28, 54, 24, 0.36)';
    a.beginPath();
    a.arc(mx, my, mr, 0, Math.PI * 2);
    a.fill();
    r.fillStyle = 'rgba(62, 62, 62, 0.42)';
    r.beginPath();
    r.arc(mx, my, mr * 0.7, 0, Math.PI * 2);
    r.fill();
  }
}

function drawDirtPBR(
  a: CanvasRenderingContext2D,
  b: CanvasRenderingContext2D,
  r: CanvasRenderingContext2D,
  s: number
) {
  a.fillStyle = '#1f1912';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#808080';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#e0e0e0';
  r.fillRect(0, 0, s, s);

  for (let i = 0; i < 700; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const rad = 2 + Math.random() * 14;
    const pick = Math.random();
    a.fillStyle =
      pick < 0.42
        ? 'rgba(46, 35, 23, 0.56)'
        : pick < 0.78
        ? 'rgba(22, 36, 16, 0.45)'
        : 'rgba(12, 9, 7, 0.62)';
    a.beginPath();
    a.arc(x, y, rad, 0, Math.PI * 2);
    a.fill();

    const bv = pick < 0.5 ? 195 : 45;
    b.fillStyle = `rgba(${bv},${bv},${bv},0.38)`;
    b.beginPath();
    b.arc(x, y, rad * 0.7, 0, Math.PI * 2);
    b.fill();
  }

  for (let p = 0; p < 10; p++) {
    const px = Math.random() * s;
    const py = Math.random() * s;
    const pr = 25 + Math.random() * 55;
    const grad = r.createRadialGradient(px, py, 5, px, py, pr);
    grad.addColorStop(0, 'rgba(28,28,28,0.9)');
    grad.addColorStop(1, 'rgba(210,210,210,0)');
    r.fillStyle = grad;
    r.fillRect(0, 0, s, s);
  }
}

function drawAltarRedPBR(
  a: CanvasRenderingContext2D,
  b: CanvasRenderingContext2D,
  r: CanvasRenderingContext2D,
  s: number
) {
  a.fillStyle = '#4e0f0f';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#808080';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#6c6c6c';
  r.fillRect(0, 0, s, s);

  a.strokeStyle = '#c29338';
  a.lineWidth = 10;
  a.strokeRect(18, 18, s - 36, s - 36);
  a.lineWidth = 4;
  a.strokeRect(36, 36, s - 72, s - 72);

  b.strokeStyle = '#ffffff';
  b.lineWidth = 10;
  b.strokeRect(18, 18, s - 36, s - 36);
  b.lineWidth = 4;
  b.strokeRect(36, 36, s - 72, s - 72);

  const corners = [
    [60, 60],
    [s - 60, 60],
    [60, s - 60],
    [s - 60, s - 60],
  ];
  corners.forEach(([cx, cy]) => {
    a.strokeStyle = '#ab802d';
    a.lineWidth = 3;
    a.strokeRect(cx - 18, cy - 18, 36, 36);
    b.strokeStyle = '#ececec';
    b.strokeRect(cx - 18, cy - 18, 36, 36);
  });

  // Aged incense smoke soot & worn gold patina
  for (let i = 0; i < 34; i++) {
    a.fillStyle = 'rgba(10, 4, 4, 0.28)';
    a.beginPath();
    a.arc(Math.random() * s, Math.random() * s, 18 + Math.random() * 55, 0, Math.PI * 2);
    a.fill();
  }
}

function drawBambooPBR(
  a: CanvasRenderingContext2D,
  b: CanvasRenderingContext2D,
  r: CanvasRenderingContext2D,
  s: number
) {
  a.fillStyle = '#2c3e22';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#858585';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#8c8c8c';
  r.fillRect(0, 0, s, s);

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * s;
    a.fillStyle = i % 2 === 0 ? 'rgba(18, 28, 12, 0.25)' : 'rgba(130, 155, 92, 0.14)';
    a.fillRect(x, 0, 3, s);
  }
  for (let y = 0; y < s; y += 96) {
    a.fillStyle = 'rgba(15, 20, 10, 0.78)';
    a.fillRect(0, y, s, 8);
    a.fillStyle = 'rgba(162, 178, 114, 0.36)';
    a.fillRect(0, y + 8, s, 4);
    b.fillStyle = '#ffffff';
    b.fillRect(0, y, s, 10);
  }
}

export function getWorldMaterial(key: MaterialKey): THREE.MeshStandardMaterial {
  const cached = materialCache.get(key);
  if (cached) return cached;

  let mat: THREE.MeshStandardMaterial;
  const ns = VISUAL_STANDARD.pbr;

  switch (key) {
    case 'wood_dark': {
      const pbr = createPBRSet('wood_dark_v45', 512, 2, 2.2, (a, b, r, s) =>
        drawWoodPBR(a, b, r, s, '#25160d', 'rgba(10,5,3,0.5)', false)
      );
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.woodDarkNormal, ns.woodDarkNormal),
        roughness: 0.9,
        metalness: 0.06,
      });
      break;
    }
    case 'wood_old': {
      const pbr = createPBRSet('wood_old_v45', 512, 2, 2.5, (a, b, r, s) =>
        drawWoodPBR(a, b, r, s, '#3d2718', 'rgba(18,10,5,0.44)', true)
      );
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.woodOldNormal, ns.woodOldNormal),
        roughness: 0.92,
        metalness: 0.04,
      });
      break;
    }
    case 'plaster': {
      const pbr = createPBRSet('plaster_v45', 512, 2, 2.8, drawPlasterPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.plasterNormal, ns.plasterNormal),
        roughness: 0.96,
        metalness: 0.02,
      });
      break;
    }
    case 'brick': {
      const pbr = createPBRSet('brick_v45', 512, 2, 3.0, (a, b, r, s) => drawBrickOrTilePBR(a, b, r, s, true));
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.brickNormal, ns.brickNormal),
        roughness: 0.92,
        metalness: 0.04,
      });
      break;
    }
    case 'tile_floor': {
      const pbr = createPBRSet('tile_floor_v45', 512, 5, 2.4, (a, b, r, s) => drawBrickOrTilePBR(a, b, r, s, false));
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.tileFloorNormal, ns.tileFloorNormal),
        roughness: 0.85,
        metalness: 0.08,
      });
      break;
    }
    case 'stone': {
      const pbr = createPBRSet('stone_v45', 512, 2, 3.2, drawStonePBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.stoneNormal, ns.stoneNormal),
        roughness: 0.92,
        metalness: 0.05,
      });
      break;
    }
    case 'dirt': {
      const pbr = createPBRSet('dirt_v45', 512, 6, 2.4, drawDirtPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.dirtNormal, ns.dirtNormal),
        roughness: 0.95,
        metalness: 0.02,
      });
      break;
    }
    case 'roof': {
      const pbr = createPBRSet('roof_v45', 512, 4, 2.8, (a, b, r, s) => drawBrickOrTilePBR(a, b, r, s, true));
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        color: '#38201a',
        normalScale: new THREE.Vector2(1.1, 1.1),
        roughness: 0.92,
      });
      break;
    }
    case 'altar_red': {
      const pbr = createPBRSet('altar_red_v45', 512, 1, 2.0, drawAltarRedPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(ns.altarLacquerNormal, ns.altarLacquerNormal),
        roughness: 0.62,
        metalness: 0.22,
      });
      break;
    }
    case 'bamboo': {
      const pbr = createPBRSet('bamboo_v45', 512, 1, 2.2, drawBambooPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.72,
        metalness: 0.05,
      });
      break;
    }
    case 'water': {
      mat = new THREE.MeshStandardMaterial({
        color: '#081418',
        roughness: 0.12,
        metalness: 0.72,
        transparent: true,
        opacity: 0.9,
      });
      break;
    }
    case 'curtain': {
      mat = new THREE.MeshStandardMaterial({
        color: '#4c1010',
        roughness: 0.92,
        side: THREE.DoubleSide,
      });
      break;
    }
    case 'metal': {
      mat = new THREE.MeshStandardMaterial({ color: '#3b3631', roughness: 0.44, metalness: 0.84 });
      break;
    }
    case 'gold': {
      mat = new THREE.MeshStandardMaterial({ color: '#b58d38', roughness: 0.34, metalness: 0.82 });
      break;
    }
    case 'paper': {
      mat = new THREE.MeshStandardMaterial({ color: '#c2ad82', roughness: 0.95 });
      break;
    }
  }

  materialCache.set(key, mat);
  return mat;
}

/** Realistic vintage metal flashlight reflector beam cookie (spotLight.map) */
export function createFlashlightCookieTexture(): THREE.CanvasTexture {
  const key = 'flashlight_cookie_v45';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Soft outer spill
  const outer = ctx.createRadialGradient(cx, cy, 10, cx, cy, size * 0.48);
  outer.addColorStop(0, 'rgba(255, 250, 238, 1.0)');
  outer.addColorStop(0.28, 'rgba(255, 244, 224, 0.88)');
  outer.addColorStop(0.52, 'rgba(235, 220, 198, 0.42)');
  outer.addColorStop(0.72, 'rgba(248, 238, 220, 0.50)'); // authentic parabolic lens ring!
  outer.addColorStop(0.84, 'rgba(180, 165, 145, 0.16)');
  outer.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, size, size);

  // Subtle dusty glass imperfections on torch lens
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.arc(cx + (Math.random() - 0.5) * 140, cy + (Math.random() - 0.5) * 140, 3 + Math.random() * 11, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

/** Delicate dusty cobweb decal texture for upper corners of old Vietnamese wooden houses */
export function createCobwebTexture(): THREE.CanvasTexture {
  const key = 'cobweb_v45';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, s, s);

  ctx.strokeStyle = 'rgba(215, 210, 198, 0.42)';
  ctx.lineWidth = 1.4;
  // Radial strands from top-left corner
  for (let i = 0; i <= 7; i++) {
    const angle = (i / 7) * (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * s * 0.95, Math.sin(angle) * s * 0.95);
    ctx.stroke();
  }
  // Concentric drooping arcs
  for (let r = 34; r < s * 0.92; r += 34) {
    ctx.beginPath();
    for (let i = 0; i <= 7; i++) {
      const a = (i / 7) * (Math.PI / 2);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

/** Creates a parchment/talisman canvas texture with eerie Vietnamese red ink calligraphy */
export function createCalligraphyTexture(
  title: string,
  bgColor = '#d2b878',
  inkColor = '#7d1111'
): THREE.CanvasTexture {
  const key = `callig_${title}_${bgColor}_${inkColor}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 512);

  for (let i = 0; i < 34; i++) {
    ctx.fillStyle = 'rgba(65, 40, 15, 0.09)';
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 512, 10 + Math.random() * 45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 228, 484);

  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(128, 48);
  ctx.lineTo(128, 120);
  ctx.moveTo(88, 72);
  ctx.lineTo(168, 72);
  ctx.moveTo(74, 106);
  ctx.bezierCurveTo(100, 136, 156, 86, 182, 120);
  ctx.stroke();

  ctx.fillStyle = inkColor;
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  const words = title.split(' ');
  words.forEach((w, i) => {
    ctx.fillText(w, 128, 185 + i * 44);
  });

  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 4;
  ctx.strokeRect(96, 412, 64, 64);
  ctx.font = 'bold 20px serif';
  ctx.fillStyle = '#991b1b';
  ctx.fillText('ẤN', 128, 452);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

/** Creates a traditional Vietnamese horizontal lacquer plaque (Hoành Phi) texture */
export function createHoanhPhiTexture(text = 'ĐỨC LƯU QUANG'): THREE.CanvasTexture {
  const key = `hoanhphi_${text}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#470d0d';
  ctx.fillRect(0, 0, 512, 192);

  ctx.strokeStyle = '#d4a644';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 464, 144);

  ctx.fillStyle = '#e6bd5c';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 98);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getTextureCacheStats() {
  return {
    textures: textureCache.size,
    materials: materialCache.size,
  };
}
