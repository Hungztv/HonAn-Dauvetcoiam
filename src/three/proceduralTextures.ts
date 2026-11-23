import * as THREE from 'three';

type MaterialKey =
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

function createCanvasTexture(
  key: string,
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  repeat = 2
): THREE.CanvasTexture {
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

function drawWood(ctx: CanvasRenderingContext2D, s: number, base: string, grain: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  const planks = 6;
  const pw = s / planks;
  for (let p = 0; p < planks; p++) {
    ctx.fillStyle = p % 2 === 0 ? 'rgba(0,0,0,0.08)' : 'rgba(255,220,180,0.03)';
    ctx.fillRect(p * pw, 0, pw, s);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p * pw, 0);
    ctx.lineTo(p * pw, s);
    ctx.stroke();
  }
  ctx.strokeStyle = grain;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 65; i++) {
    const x = Math.random() * s;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + (Math.random() - 0.5) * 10, s * 0.33, x + (Math.random() - 0.5) * 10, s * 0.66, x, s);
    ctx.stroke();
  }
}

function drawPlaster(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#4e483e';
  ctx.fillRect(0, 0, s, s);
  // Damp mold & water stains
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const r = 18 + Math.random() * 65;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, i % 3 === 0 ? 'rgba(22, 26, 18, 0.35)' : 'rgba(18, 14, 11, 0.28)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
  }
  // Fine plaster cracks
  ctx.strokeStyle = 'rgba(15, 12, 10, 0.55)';
  ctx.lineWidth = 1.4;
  for (let c = 0; c < 6; c++) {
    let cx = Math.random() * s;
    let cy = Math.random() * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let step = 0; step < 6; step++) {
      cx += (Math.random() - 0.5) * 35;
      cy += Math.random() * 30;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
}

function drawBrickOrTile(ctx: CanvasRenderingContext2D, s: number, brick: boolean) {
  ctx.fillStyle = brick ? '#2c1f1a' : '#2f211c';
  ctx.fillRect(0, 0, s, s);
  const rows = brick ? 8 : 4;
  const cols = brick ? 4 : 4;
  const rh = s / rows;
  const cw = s / cols;
  for (let r = 0; r < rows; r++) {
    const offset = brick && r % 2 === 1 ? cw / 2 : 0;
    for (let c = -1; c <= cols; c++) {
      const shade = 0.85 + Math.random() * 0.25;
      ctx.fillStyle = brick
        ? `rgb(${Math.floor(72 * shade)}, ${Math.floor(42 * shade)}, ${Math.floor(33 * shade)})`
        : `rgb(${Math.floor(82 * shade)}, ${Math.floor(47 * shade)}, ${Math.floor(36 * shade)})`;
      ctx.fillRect(c * cw + offset + 2, r * rh + 2, cw - 4, rh - 4);
    }
  }
  // Mossy dark grime
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = 'rgba(18, 28, 16, 0.22)';
    ctx.beginPath();
    ctx.arc(Math.random() * s, Math.random() * s, 8 + Math.random() * 24, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStone(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#383836';
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 120; i++) {
    const v = 35 + Math.floor(Math.random() * 48);
    ctx.fillStyle = `rgba(${v},${v},${v - 2},0.35)`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 6 + Math.random() * 22, 6 + Math.random() * 22);
  }
  // Moss accents
  for (let m = 0; m < 18; m++) {
    ctx.fillStyle = 'rgba(32, 52, 26, 0.28)';
    ctx.beginPath();
    ctx.arc(Math.random() * s, Math.random() * s, 10 + Math.random() * 25, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDirt(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#231d15';
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 220; i++) {
    const pick = Math.random();
    ctx.fillStyle =
      pick < 0.45 ? 'rgba(42, 33, 22, 0.5)' : pick < 0.8 ? 'rgba(26, 36, 18, 0.35)' : 'rgba(15, 12, 9, 0.5)';
    ctx.beginPath();
    ctx.arc(Math.random() * s, Math.random() * s, 3 + Math.random() * 14, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAltarRed(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#481111';
  ctx.fillRect(0, 0, s, s);
  // Subtle ornate gold lacquer border
  ctx.strokeStyle = 'rgba(196, 152, 66, 0.55)';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, s - 20, s - 20);
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, s - 40, s - 40);
  // Aged dark vignette
  for (let i = 0; i < 25; i++) {
    ctx.fillStyle = 'rgba(12, 5, 5, 0.22)';
    ctx.beginPath();
    ctx.arc(Math.random() * s, Math.random() * s, 12 + Math.random() * 35, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBamboo(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#2a3a22';
  ctx.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 64) {
    ctx.fillStyle = 'rgba(16, 22, 12, 0.65)';
    ctx.fillRect(0, y, s, 6);
    ctx.fillStyle = 'rgba(140, 155, 95, 0.22)';
    ctx.fillRect(0, y + 6, s, 3);
  }
}

export function getWorldMaterial(key: MaterialKey): THREE.MeshStandardMaterial {
  const cached = materialCache.get(key);
  if (cached) return cached;

  let mat: THREE.MeshStandardMaterial;

  switch (key) {
    case 'wood_dark': {
      const tex = createCanvasTexture('wood_dark', 256, (c, s) => drawWood(c, s, '#25170e', 'rgba(12,7,4,0.45)'), 2);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.05 });
      break;
    }
    case 'wood_old': {
      const tex = createCanvasTexture('wood_old', 256, (c, s) => drawWood(c, s, '#3d281a', 'rgba(20,12,7,0.38)'), 2);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, metalness: 0.03 });
      break;
    }
    case 'plaster': {
      const tex = createCanvasTexture('plaster', 256, drawPlaster, 2);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.94, metalness: 0.02 });
      break;
    }
    case 'brick': {
      const tex = createCanvasTexture('brick', 256, (c, s) => drawBrickOrTile(c, s, true), 2);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.04 });
      break;
    }
    case 'tile_floor': {
      const tex = createCanvasTexture('tile_floor', 256, (c, s) => drawBrickOrTile(c, s, false), 4);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82, metalness: 0.05 });
      break;
    }
    case 'stone': {
      const tex = createCanvasTexture('stone', 256, drawStone, 2);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0.05 });
      break;
    }
    case 'dirt': {
      const tex = createCanvasTexture('dirt', 256, drawDirt, 6);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.98, metalness: 0.0 });
      break;
    }
    case 'roof': {
      const tex = createCanvasTexture('roof', 256, (c, s) => drawBrickOrTile(c, s, true), 3);
      mat = new THREE.MeshStandardMaterial({ map: tex, color: '#40261f', roughness: 0.92 });
      break;
    }
    case 'altar_red': {
      const tex = createCanvasTexture('altar_red', 256, drawAltarRed, 1);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, metalness: 0.14 });
      break;
    }
    case 'bamboo': {
      const tex = createCanvasTexture('bamboo', 256, drawBamboo, 1);
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.72, metalness: 0.04 });
      break;
    }
    case 'water': {
      mat = new THREE.MeshStandardMaterial({
        color: '#0b181b',
        roughness: 0.18,
        metalness: 0.55,
        transparent: true,
        opacity: 0.88,
      });
      break;
    }
    case 'curtain': {
      mat = new THREE.MeshStandardMaterial({
        color: '#4f1414',
        roughness: 0.92,
        side: THREE.DoubleSide,
      });
      break;
    }
    case 'metal': {
      mat = new THREE.MeshStandardMaterial({ color: '#3b3733', roughness: 0.52, metalness: 0.78 });
      break;
    }
    case 'gold': {
      mat = new THREE.MeshStandardMaterial({ color: '#a88438', roughness: 0.38, metalness: 0.75 });
      break;
    }
    case 'paper': {
      mat = new THREE.MeshStandardMaterial({ color: '#c4af84', roughness: 0.95 });
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

  // Aged paper stains
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = 'rgba(65, 40, 15, 0.08)';
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 512, 10 + Math.random() * 45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Border
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 228, 484);

  // Mystical talisman strokes
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

  // Vertical Vietnamese text
  ctx.fillStyle = inkColor;
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  const words = title.split(' ');
  words.forEach((w, i) => {
    ctx.fillText(w, 128, 185 + i * 44);
  });

  // Crimson seal stamp at bottom
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
