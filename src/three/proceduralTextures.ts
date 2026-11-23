import * as THREE from 'three';

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
  bumpMap: THREE.CanvasTexture;
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

function createPBRSet(
  key: string,
  size: number,
  repeat: number,
  drawer: (
    albedo: CanvasRenderingContext2D,
    bump: CanvasRenderingContext2D,
    rough: CanvasRenderingContext2D,
    s: number
  ) => void
): PBRTextureSet {
  const mk = `${key}_map`;
  const bk = `${key}_bump`;
  const rk = `${key}_rough`;
  if (textureCache.has(mk) && textureCache.has(bk) && textureCache.has(rk)) {
    return {
      map: textureCache.get(mk)!,
      bumpMap: textureCache.get(bk)!,
      roughnessMap: textureCache.get(rk)!,
    };
  }

  const cMap = document.createElement('canvas');
  const cBump = document.createElement('canvas');
  const cRough = document.createElement('canvas');
  cMap.width = cBump.width = cRough.width = size;
  cMap.height = cBump.height = cRough.height = size;

  const ctxMap = cMap.getContext('2d')!;
  const ctxBump = cBump.getContext('2d')!;
  const ctxRough = cRough.getContext('2d')!;

  // Neutral defaults
  ctxBump.fillStyle = '#808080';
  ctxBump.fillRect(0, 0, size, size);
  ctxRough.fillStyle = '#cccccc';
  ctxRough.fillRect(0, 0, size, size);

  drawer(ctxMap, ctxBump, ctxRough, size);

  const map = finalizeTexture(cMap, repeat, true);
  const bumpMap = finalizeTexture(cBump, repeat, false);
  const roughnessMap = finalizeTexture(cRough, repeat, false);

  textureCache.set(mk, map);
  textureCache.set(bk, bumpMap);
  textureCache.set(rk, roughnessMap);

  return { map, bumpMap, roughnessMap };
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
  b.fillStyle = '#969696';
  b.fillRect(0, 0, s, s);
  r.fillStyle = aged ? '#c4c4c4' : '#a8a8a8';
  r.fillRect(0, 0, s, s);

  const planks = 6;
  const pw = s / planks;

  for (let p = 0; p < planks; p++) {
    const x = p * pw;
    // Slight plank tone variation
    a.fillStyle = p % 2 === 0 ? 'rgba(0,0,0,0.12)' : 'rgba(255,215,170,0.04)';
    a.fillRect(x, 0, pw, s);

    // Deep bevel groove between planks
    a.fillStyle = 'rgba(5,3,2,0.75)';
    a.fillRect(x, 0, 4, s);
    b.fillStyle = '#181818';
    b.fillRect(x, 0, 5, s);
    r.fillStyle = '#f5f5f5';
    r.fillRect(x, 0, 5, s);

    // Subtle horizontal board seam
    const seamY = ((p * 173) % (s - 80)) + 40;
    a.fillStyle = 'rgba(0,0,0,0.55)';
    a.fillRect(x, seamY, pw, 3);
    b.fillStyle = '#202020';
    b.fillRect(x, seamY, pw, 3);
  }

  // Flowing wood grain fibers + bump ridges
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * s;
    const ctrl1 = x + (Math.random() - 0.5) * 18;
    const ctrl2 = x + (Math.random() - 0.5) * 18;
    a.strokeStyle = grainRgba;
    a.lineWidth = 0.8 + Math.random() * 1.6;
    a.beginPath();
    a.moveTo(x, 0);
    a.bezierCurveTo(ctrl1, s * 0.33, ctrl2, s * 0.66, x, s);
    a.stroke();

    b.strokeStyle = i % 2 === 0 ? 'rgba(215,215,215,0.22)' : 'rgba(45,45,45,0.25)';
    b.lineWidth = 1.1;
    b.beginPath();
    b.moveTo(x, 0);
    b.bezierCurveTo(ctrl1, s * 0.33, ctrl2, s * 0.66, x, s);
    b.stroke();
  }

  // Wood knots
  for (let k = 0; k < 5; k++) {
    const kx = Math.random() * s;
    const ky = Math.random() * s;
    const kr = 6 + Math.random() * 10;
    a.strokeStyle = 'rgba(10,5,2,0.55)';
    a.lineWidth = 2;
    a.beginPath();
    a.ellipse(kx, ky, kr * 0.6, kr * 1.4, 0, 0, Math.PI * 2);
    a.stroke();
    b.fillStyle = '#383838';
    b.beginPath();
    b.ellipse(kx, ky, kr * 0.5, kr * 1.1, 0, 0, Math.PI * 2);
    b.fill();
  }

  // Damp glossy patches (lower roughness -> specular glint under flashlight!)
  for (let d = 0; d < 12; d++) {
    const dx = Math.random() * s;
    const dy = Math.random() * s;
    const dr = 28 + Math.random() * 65;
    const grad = r.createRadialGradient(dx, dy, 4, dx, dy, dr);
    grad.addColorStop(0, 'rgba(65,65,65,0.55)');
    grad.addColorStop(1, 'rgba(190,190,190,0)');
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
  a.fillStyle = '#5c5446';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#909090';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#dcdcdc';
  r.fillRect(0, 0, s, s);

  // Stucco micro-grain noise
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const sz = 1 + Math.random() * 3;
    const v = 110 + Math.floor(Math.random() * 55);
    b.fillStyle = `rgb(${v},${v},${v})`;
    b.fillRect(x, y, sz, sz);
  }

  // Vietnamese old limewall damp streaks & moss stains
  for (let i = 0; i < 48; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const rad = 24 + Math.random() * 95;
    const grad = a.createRadialGradient(x, y, 3, x, y, rad);
    const pick = i % 4;
    grad.addColorStop(
      0,
      pick === 0
        ? 'rgba(24, 34, 20, 0.42)' // dark green moss
        : pick === 1
        ? 'rgba(22, 16, 12, 0.36)' // soot/damp
        : 'rgba(128, 112, 82, 0.16)' // faded yellow lime
    );
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    a.fillStyle = grad;
    a.fillRect(0, 0, s, s);

    if (pick === 0 || pick === 1) {
      // Wet damp spots reflect flashlight slightly
      const rGrad = r.createRadialGradient(x, y, 4, x, y, rad * 0.8);
      rGrad.addColorStop(0, 'rgba(85,85,85,0.65)');
      rGrad.addColorStop(1, 'rgba(220,220,220,0)');
      r.fillStyle = rGrad;
      r.fillRect(0, 0, s, s);
    }
  }

  // Peeling plaster patches revealing recessed dark mortar
  for (let p = 0; p < 6; p++) {
    const px = Math.random() * s;
    const py = Math.random() * s;
    const rx = 18 + Math.random() * 38;
    const ry = 12 + Math.random() * 28;
    a.fillStyle = 'rgba(42, 32, 24, 0.72)';
    a.beginPath();
    a.ellipse(px, py, rx, ry, Math.random(), 0, Math.PI * 2);
    a.fill();
    b.fillStyle = '#303030';
    b.beginPath();
    b.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    b.fill();
  }

  // Deep spiderweb cracks
  for (let c = 0; c < 10; c++) {
    let cx = Math.random() * s;
    let cy = Math.random() * s;
    a.strokeStyle = 'rgba(14, 10, 8, 0.72)';
    a.lineWidth = 1.6;
    b.strokeStyle = '#101010';
    b.lineWidth = 2.6;
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
  // Recessed mortar background
  a.fillStyle = '#241c17';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#1c1c1c';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#ededed';
  r.fillRect(0, 0, s, s);

  const rows = isBrick ? 10 : 4;
  const cols = isBrick ? 5 : 4;
  const rh = s / rows;
  const cw = s / cols;
  const gap = isBrick ? 4 : 5;

  for (let row = 0; row < rows; row++) {
    const offset = isBrick && row % 2 === 1 ? cw * 0.5 : 0;
    for (let col = -1; col <= cols; col++) {
      const x = col * cw + offset + gap;
      const y = row * rh + gap;
      const w = cw - gap * 2;
      const h = rh - gap * 2;
      const shade = 0.76 + Math.random() * 0.34;

      a.fillStyle = isBrick
        ? `rgb(${Math.floor(86 * shade)}, ${Math.floor(46 * shade)}, ${Math.floor(34 * shade)})`
        : `rgb(${Math.floor(96 * shade)}, ${Math.floor(52 * shade)}, ${Math.floor(38 * shade)})`;
      a.fillRect(x, y, w, h);

      // Raised brick/tile height
      const bVal = Math.floor(175 + Math.random() * 45);
      b.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      b.fillRect(x, y, w, h);

      // Slight sheen on worn terracotta tiles
      const rVal = isBrick ? 185 + Math.random() * 35 : 115 + Math.random() * 65;
      r.fillStyle = `rgb(${Math.floor(rVal)},${Math.floor(rVal)},${Math.floor(rVal)})`;
      r.fillRect(x, y, w, h);
    }
  }

  // Mossy dampness & puddles on floor tiles
  for (let m = 0; m < 26; m++) {
    const mx = Math.random() * s;
    const my = Math.random() * s;
    const mr = 14 + Math.random() * 45;
    a.fillStyle = m % 2 === 0 ? 'rgba(20, 34, 18, 0.28)' : 'rgba(12, 10, 9, 0.24)';
    a.beginPath();
    a.arc(mx, my, mr, 0, Math.PI * 2);
    a.fill();
    if (!isBrick && m % 3 === 0) {
      // Wet specular puddle
      const g = r.createRadialGradient(mx, my, 2, mx, my, mr);
      g.addColorStop(0, 'rgba(35,35,35,0.85)');
      g.addColorStop(1, 'rgba(160,160,160,0)');
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
  a.fillStyle = '#3b3b37';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#7c7c7c';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#c8c8c8';
  r.fillRect(0, 0, s, s);

  // Irregular cut stone blocks
  const rows = 6;
  const rh = s / rows;
  for (let row = 0; row < rows; row++) {
    let x = -(row % 2) * 36;
    while (x < s) {
      const w = 68 + Math.random() * 75;
      const tone = 48 + Math.floor(Math.random() * 34);
      a.fillStyle = `rgb(${tone},${tone + 1},${tone - 3})`;
      a.fillRect(x + 3, row * rh + 3, w - 6, rh - 6);

      const bv = 160 + Math.floor(Math.random() * 60);
      b.fillStyle = `rgb(${bv},${bv},${bv})`;
      b.fillRect(x + 4, row * rh + 4, w - 8, rh - 8);
      x += w;
    }
  }

  // Moss & wet streaks
  for (let i = 0; i < 32; i++) {
    const mx = Math.random() * s;
    const my = Math.random() * s;
    const mr = 14 + Math.random() * 44;
    a.fillStyle = 'rgba(32, 56, 26, 0.34)';
    a.beginPath();
    a.arc(mx, my, mr, 0, Math.PI * 2);
    a.fill();
    r.fillStyle = 'rgba(70, 70, 70, 0.35)';
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
  a.fillStyle = '#211b13';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#808080';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#dedede';
  r.fillRect(0, 0, s, s);

  for (let i = 0; i < 650; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const rad = 2 + Math.random() * 14;
    const pick = Math.random();
    a.fillStyle =
      pick < 0.42
        ? 'rgba(46, 35, 23, 0.55)'
        : pick < 0.78
        ? 'rgba(24, 38, 17, 0.42)'
        : 'rgba(14, 11, 8, 0.6)';
    a.beginPath();
    a.arc(x, y, rad, 0, Math.PI * 2);
    a.fill();

    const bv = pick < 0.5 ? 190 : 50;
    b.fillStyle = `rgba(${bv},${bv},${bv},0.35)`;
    b.beginPath();
    b.arc(x, y, rad * 0.7, 0, Math.PI * 2);
    b.fill();
  }

  // Muddy wet puddles that catch moonlight
  for (let p = 0; p < 8; p++) {
    const px = Math.random() * s;
    const py = Math.random() * s;
    const pr = 25 + Math.random() * 55;
    const grad = r.createRadialGradient(px, py, 5, px, py, pr);
    grad.addColorStop(0, 'rgba(32,32,32,0.88)');
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
  // Deep Vietnamese vermilion lacquer (sơn son thếp vàng)
  a.fillStyle = '#521010';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#808080';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#747474'; // Lacquered wood has nice satin sheen!
  r.fillRect(0, 0, s, s);

  // Ornate carved gold borders
  a.strokeStyle = '#c89b3c';
  a.lineWidth = 10;
  a.strokeRect(18, 18, s - 36, s - 36);
  a.lineWidth = 4;
  a.strokeRect(36, 36, s - 72, s - 72);

  b.strokeStyle = '#ffffff';
  b.lineWidth = 10;
  b.strokeRect(18, 18, s - 36, s - 36);
  b.lineWidth = 4;
  b.strokeRect(36, 36, s - 72, s - 72);

  // Corner lotus fretwork motifs
  const corners = [
    [60, 60],
    [s - 60, 60],
    [60, s - 60],
    [s - 60, s - 60],
  ];
  corners.forEach(([cx, cy]) => {
    a.strokeStyle = '#b58932';
    a.lineWidth = 3;
    a.strokeRect(cx - 18, cy - 18, 36, 36);
    b.strokeStyle = '#e5e5e5';
    b.strokeRect(cx - 18, cy - 18, 36, 36);
  });

  // Aged incense soot patina
  for (let i = 0; i < 30; i++) {
    a.fillStyle = 'rgba(10, 4, 4, 0.24)';
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
  a.fillStyle = '#2d4023';
  a.fillRect(0, 0, s, s);
  b.fillStyle = '#858585';
  b.fillRect(0, 0, s, s);
  r.fillStyle = '#909090';
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

  switch (key) {
    case 'wood_dark': {
      const pbr = createPBRSet('wood_dark_v2', 512, 2, (a, b, r, s) =>
        drawWoodPBR(a, b, r, s, '#26170e', 'rgba(10,5,3,0.48)', false)
      );
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.035,
        roughness: 0.9,
        metalness: 0.06,
      });
      break;
    }
    case 'wood_old': {
      const pbr = createPBRSet('wood_old_v2', 512, 2, (a, b, r, s) =>
        drawWoodPBR(a, b, r, s, '#40291a', 'rgba(18,10,5,0.42)', true)
      );
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.04,
        roughness: 0.92,
        metalness: 0.04,
      });
      break;
    }
    case 'plaster': {
      const pbr = createPBRSet('plaster_v2', 512, 2, drawPlasterPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.055,
        roughness: 0.96,
        metalness: 0.02,
      });
      break;
    }
    case 'brick': {
      const pbr = createPBRSet('brick_v2', 512, 2, (a, b, r, s) => drawBrickOrTilePBR(a, b, r, s, true));
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.06,
        roughness: 0.92,
        metalness: 0.04,
      });
      break;
    }
    case 'tile_floor': {
      const pbr = createPBRSet('tile_floor_v2', 512, 5, (a, b, r, s) => drawBrickOrTilePBR(a, b, r, s, false));
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.04,
        roughness: 0.85,
        metalness: 0.08,
      });
      break;
    }
    case 'stone': {
      const pbr = createPBRSet('stone_v2', 512, 2, drawStonePBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.065,
        roughness: 0.92,
        metalness: 0.05,
      });
      break;
    }
    case 'dirt': {
      const pbr = createPBRSet('dirt_v2', 512, 6, drawDirtPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.05,
        roughness: 0.95,
        metalness: 0.02,
      });
      break;
    }
    case 'roof': {
      const pbr = createPBRSet('roof_v2', 512, 4, (a, b, r, s) => drawBrickOrTilePBR(a, b, r, s, true));
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        color: '#3b221c',
        bumpScale: 0.05,
        roughness: 0.92,
      });
      break;
    }
    case 'altar_red': {
      const pbr = createPBRSet('altar_red_v2', 512, 1, drawAltarRedPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.03,
        roughness: 0.65,
        metalness: 0.22,
      });
      break;
    }
    case 'bamboo': {
      const pbr = createPBRSet('bamboo_v2', 512, 1, drawBambooPBR);
      mat = new THREE.MeshStandardMaterial({
        ...pbr,
        bumpScale: 0.035,
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
        color: '#521212',
        roughness: 0.9,
        side: THREE.DoubleSide,
      });
      break;
    }
    case 'metal': {
      mat = new THREE.MeshStandardMaterial({ color: '#403b36', roughness: 0.42, metalness: 0.85 });
      break;
    }
    case 'gold': {
      mat = new THREE.MeshStandardMaterial({ color: '#be953e', roughness: 0.32, metalness: 0.82 });
      break;
    }
    case 'paper': {
      mat = new THREE.MeshStandardMaterial({ color: '#c4af84', roughness: 0.94 });
      break;
    }
  }

  materialCache.set(key, mat);
  return mat;
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

  // Ornate gilded double border
  ctx.strokeStyle = '#d4a644';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 464, 144);

  // Calligraphy title
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
