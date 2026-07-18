import * as THREE from 'three';

export const PALETTE = {
  ink: 0x111719,
  charcoal: 0x252b2d,
  slate: 0x34464a,
  jadeDeep: 0x174e51,
  jade: 0x287a78,
  jadeLight: 0x56c6bd,
  parchment: 0xd8ccb2,
  stone: 0xb7aa8c,
  stoneLight: 0xd6c9aa,
  stoneDark: 0x746b5c,
  brass: 0x9d6a2b,
  brassBright: 0xd3a04b,
  leather: 0x4a3426,
  cinnabar: 0xb24f35,
  amber: 0xf5a73e,
  water: 0x0d6d75,
  waterLight: 0x43c1bd,
  foliage: 0x657444,
  foliageDark: 0x334526,
  autumn: 0xaa6435,
  sky: 0xb8d3cf,
} as const;

class Random {
  private state: number;

  public constructor(seed = 0x2f6e2b1) {
    this.state = seed >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
}

function canvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, rng: Random, size: number) => void,
  repeat = new THREE.Vector2(4, 4),
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  draw(context, new Random(), size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.copy(repeat);
  texture.anisotropy = 8;
  return texture;
}

function shade(hex: number, amount: number): string {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount);
  return `#${c.getHexString()}`;
}

function makeStoneTexture(): THREE.CanvasTexture {
  return canvasTexture(
    512,
    (ctx, rng, size) => {
      ctx.fillStyle = `#${new THREE.Color(PALETTE.stoneLight).getHexString()}`;
      ctx.fillRect(0, 0, size, size);

      const tile = size / 4;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(77,67,54,0.34)';
      for (let row = 0; row <= 4; row += 1) {
        const y = row * tile + rng.range(-6, 6);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + rng.range(-5, 5));
        ctx.stroke();
      }
      for (let col = 0; col <= 4; col += 1) {
        const offset = col % 2 === 0 ? tile * 0.22 : -tile * 0.16;
        const x = col * tile + offset + rng.range(-5, 5);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + rng.range(-8, 8), size);
        ctx.stroke();
      }

      for (let i = 0; i < 1700; i += 1) {
        const alpha = rng.range(0.025, 0.13);
        const radius = rng.range(0.35, 2.6);
        ctx.fillStyle = rng.next() > 0.5
          ? `rgba(58,49,38,${alpha})`
          : `rgba(255,248,222,${alpha})`;
        ctx.beginPath();
        ctx.arc(rng.range(0, size), rng.range(0, size), radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(59,51,42,0.22)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 18; i += 1) {
        let x = rng.range(0, size);
        let y = rng.range(0, size);
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < rng.range(2, 6); s += 1) {
          x += rng.range(-18, 18);
          y += rng.range(7, 25);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
    new THREE.Vector2(2.6, 2.6),
  );
}

function makePlasterTexture(): THREE.CanvasTexture {
  return canvasTexture(
    512,
    (ctx, rng, size) => {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#ded3bc');
      gradient.addColorStop(0.5, '#cfc2a7');
      gradient.addColorStop(1, '#b9ad95');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      for (let i = 0; i < 2200; i += 1) {
        const alpha = rng.range(0.02, 0.11);
        const value = rng.next() > 0.55 ? 255 : 50;
        ctx.fillStyle = `rgba(${value},${value - 8},${value - 16},${alpha})`;
        ctx.fillRect(rng.range(0, size), rng.range(0, size), rng.range(1, 4), rng.range(1, 4));
      }

      ctx.strokeStyle = 'rgba(76,64,53,0.24)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i += 1) {
        let x = rng.range(0, size);
        let y = rng.range(0, size);
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < 5; s += 1) {
          x += rng.range(-10, 14);
          y += rng.range(8, 30);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
    new THREE.Vector2(1.8, 1.8),
  );
}

function makeWoodTexture(): THREE.CanvasTexture {
  return canvasTexture(
    512,
    (ctx, rng, size) => {
      ctx.fillStyle = '#61442d';
      ctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 64) {
        ctx.fillStyle = x % 128 === 0 ? '#684a31' : '#583b28';
        ctx.fillRect(x, 0, 62, size);
        ctx.strokeStyle = 'rgba(25,15,9,0.55)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, -2, 64, size + 4);
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < 170; i += 1) {
        const y = rng.range(0, size);
        ctx.strokeStyle = `rgba(28,17,10,${rng.range(0.08, 0.25)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(size * 0.3, y + rng.range(-7, 7), size * 0.7, y + rng.range(-7, 7), size, y);
        ctx.stroke();
      }
    },
    new THREE.Vector2(2, 3),
  );
}

function makePanelTexture(): THREE.CanvasTexture {
  return canvasTexture(
    512,
    (ctx, _rng, size) => {
      ctx.fillStyle = '#e1d5bb';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = '#76512c';
      ctx.lineWidth = 18;
      ctx.strokeRect(9, 9, size - 18, size - 18);
      ctx.strokeStyle = 'rgba(94,62,31,0.68)';
      ctx.lineWidth = 6;
      ctx.strokeRect(28, 28, size - 56, size - 56);

      const center = size / 2;
      ctx.translate(center, center);
      ctx.strokeStyle = 'rgba(87,63,40,0.78)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.19, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i += 1) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.23);
        ctx.bezierCurveTo(size * 0.08, -size * 0.13, size * 0.08, size * 0.13, 0, size * 0.23);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
      ctx.stroke();
    },
    new THREE.Vector2(1, 1),
  );
}

function makeClothTexture(color: number): THREE.CanvasTexture {
  return canvasTexture(
    256,
    (ctx, rng, size) => {
      ctx.fillStyle = `#${new THREE.Color(color).getHexString()}`;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(255,255,255,0.055)';
      ctx.lineWidth = 1;
      for (let i = -size; i < size * 2; i += 7) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - size, size);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      for (let i = 0; i < 700; i += 1) {
        ctx.fillStyle = `rgba(0,0,0,${rng.range(0.01, 0.055)})`;
        ctx.fillRect(rng.range(0, size), rng.range(0, size), 1, 1);
      }
    },
    new THREE.Vector2(3, 3),
  );
}

function makeReedTexture(): THREE.CanvasTexture {
  return canvasTexture(
    128,
    (ctx, _rng, size) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, 'rgba(210,204,156,0)');
      gradient.addColorStop(0.18, 'rgba(198,188,129,0.86)');
      gradient.addColorStop(1, 'rgba(74,94,48,0.98)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(size * 0.5, 0);
      ctx.quadraticCurveTo(size * 0.74, size * 0.52, size * 0.58, size);
      ctx.lineTo(size * 0.42, size);
      ctx.quadraticCurveTo(size * 0.26, size * 0.52, size * 0.5, 0);
      ctx.fill();
    },
    new THREE.Vector2(1, 1),
  );
}

export interface ArtMaterials {
  stone: THREE.MeshStandardMaterial;
  stoneSide: THREE.MeshStandardMaterial;
  stoneDark: THREE.MeshStandardMaterial;
  plaster: THREE.MeshStandardMaterial;
  teal: THREE.MeshStandardMaterial;
  tealDark: THREE.MeshStandardMaterial;
  bronze: THREE.MeshPhysicalMaterial;
  bronzeDark: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  woodDark: THREE.MeshStandardMaterial;
  panel: THREE.MeshStandardMaterial;
  creamCloth: THREE.MeshStandardMaterial;
  blackCloth: THREE.MeshStandardMaterial;
  jadeCloth: THREE.MeshStandardMaterial;
  leather: THREE.MeshStandardMaterial;
  bandage: THREE.MeshStandardMaterial;
  skin: THREE.MeshStandardMaterial;
  hair: THREE.MeshStandardMaterial;
  blade: THREE.MeshPhysicalMaterial;
  foliage: THREE.MeshStandardMaterial;
  foliageDark: THREE.MeshStandardMaterial;
  autumn: THREE.MeshStandardMaterial;
  reed: THREE.MeshStandardMaterial;
  glow: THREE.MeshStandardMaterial;
}

export function createArtMaterials(): ArtMaterials {
  const stoneMap = makeStoneTexture();
  const plasterMap = makePlasterTexture();
  const woodMap = makeWoodTexture();
  const panelMap = makePanelTexture();
  const jadeClothMap = makeClothTexture(PALETTE.jadeDeep);
  const blackClothMap = makeClothTexture(PALETTE.ink);
  const creamClothMap = makeClothTexture(PALETTE.parchment);
  const reedMap = makeReedTexture();

  return {
    stone: new THREE.MeshStandardMaterial({
      color: PALETTE.stoneLight,
      map: stoneMap,
      roughness: 0.94,
      metalness: 0.02,
    }),
    stoneSide: new THREE.MeshStandardMaterial({
      color: PALETTE.stone,
      map: stoneMap.clone(),
      roughness: 1,
      metalness: 0,
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      color: PALETTE.stoneDark,
      roughness: 1,
    }),
    plaster: new THREE.MeshStandardMaterial({
      color: PALETTE.parchment,
      map: plasterMap,
      roughness: 0.96,
    }),
    teal: new THREE.MeshStandardMaterial({
      color: PALETTE.jade,
      roughness: 0.62,
      metalness: 0.2,
    }),
    tealDark: new THREE.MeshStandardMaterial({
      color: PALETTE.jadeDeep,
      roughness: 0.72,
      metalness: 0.13,
    }),
    bronze: new THREE.MeshPhysicalMaterial({
      color: PALETTE.brass,
      roughness: 0.31,
      metalness: 0.88,
      clearcoat: 0.25,
      clearcoatRoughness: 0.45,
    }),
    bronzeDark: new THREE.MeshStandardMaterial({
      color: 0x513821,
      roughness: 0.5,
      metalness: 0.72,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x6f4b2e,
      map: woodMap,
      roughness: 0.84,
      metalness: 0,
    }),
    woodDark: new THREE.MeshStandardMaterial({
      color: 0x332318,
      roughness: 0.9,
    }),
    panel: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: panelMap,
      roughness: 0.78,
      side: THREE.DoubleSide,
    }),
    creamCloth: new THREE.MeshStandardMaterial({
      color: PALETTE.parchment,
      map: creamClothMap,
      roughness: 0.96,
      side: THREE.DoubleSide,
    }),
    blackCloth: new THREE.MeshStandardMaterial({
      color: PALETTE.ink,
      map: blackClothMap,
      roughness: 0.98,
    }),
    jadeCloth: new THREE.MeshStandardMaterial({
      color: PALETTE.jadeDeep,
      map: jadeClothMap,
      roughness: 0.9,
    }),
    leather: new THREE.MeshStandardMaterial({
      color: PALETTE.leather,
      roughness: 0.82,
      metalness: 0.03,
    }),
    bandage: new THREE.MeshStandardMaterial({
      color: 0xb6ab96,
      roughness: 1,
    }),
    skin: new THREE.MeshStandardMaterial({
      color: 0xc78e68,
      roughness: 0.7,
    }),
    hair: new THREE.MeshStandardMaterial({
      color: 0x171819,
      roughness: 0.76,
    }),
    blade: new THREE.MeshPhysicalMaterial({
      color: 0xcad3d1,
      roughness: 0.22,
      metalness: 0.95,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: PALETTE.foliage,
      roughness: 0.95,
      side: THREE.DoubleSide,
    }),
    foliageDark: new THREE.MeshStandardMaterial({
      color: PALETTE.foliageDark,
      roughness: 1,
      side: THREE.DoubleSide,
    }),
    autumn: new THREE.MeshStandardMaterial({
      color: PALETTE.autumn,
      roughness: 0.95,
    }),
    reed: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: reedMap,
      alphaTest: 0.25,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1,
    }),
    glow: new THREE.MeshStandardMaterial({
      color: PALETTE.amber,
      emissive: PALETTE.amber,
      emissiveIntensity: 5,
      roughness: 0.3,
    }),
  };
}

export function setShadows(root: THREE.Object3D, cast = true, receive = true): void {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = cast;
      object.receiveShadow = receive;
    }
  });
}

export function cloneMaterial<T extends THREE.Material>(material: T): T {
  return material.clone() as T;
}

export function withColor<T extends THREE.Material>(material: T, color: number): T {
  const copy = cloneMaterial(material);
  if ('color' in copy && copy.color instanceof THREE.Color) {
    copy.color.setHex(color);
  }
  return copy;
}

export function makeLabelSprite(text: string, color = '#e7d8b6'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '600 42px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(13,18,20,0.86)';
  ctx.fillRect(16, 20, canvas.width - 32, canvas.height - 40);
  ctx.strokeStyle = '#9d6a2b';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 22, canvas.width - 36, canvas.height - 44);
  ctx.fillStyle = color;
  ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(5.4, 1.35, 1);
  return sprite;
}

export function makeRadialTexture(): THREE.CanvasTexture {
  return canvasTexture(
    256,
    (ctx, _rng, size) => {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(255,255,255,0.98)');
      gradient.addColorStop(0.28, 'rgba(112,255,240,0.74)');
      gradient.addColorStop(1, 'rgba(40,122,120,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    },
    new THREE.Vector2(1, 1),
  );
}

export function createGradientSkyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x72999a) },
      horizonColor: { value: new THREE.Color(0xcbd8ca) },
      bottomColor: { value: new THREE.Color(0x6b7b70) },
      offset: { value: 30 },
      exponent: { value: 0.62 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
        float upper = pow(max(h, 0.0), exponent);
        float lower = pow(max(-h, 0.0), 0.45);
        vec3 color = mix(horizonColor, topColor, upper);
        color = mix(color, bottomColor, lower * 0.7);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}
