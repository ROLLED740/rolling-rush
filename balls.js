// Procedural ball skins: every texture is drawn on a canvas at runtime,
// so there are zero image assets to download.

const TEX_W = 256, TEX_H = 128;

function canvasCtx() {
  const c = document.createElement('canvas');
  c.width = TEX_W; c.height = TEX_H;
  return [c, c.getContext('2d')];
}

function gradientBall(stops, stars = false) {
  return () => {
    const [c, g] = canvasCtx();
    const grad = g.createLinearGradient(0, 0, 0, TEX_H);
    stops.forEach((color, i) => grad.addColorStop(i / (stops.length - 1), color));
    g.fillStyle = grad;
    g.fillRect(0, 0, TEX_W, TEX_H);
    if (stars) {
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (let i = 0; i < 40; i++) {
        const r = Math.random() < 0.15 ? 1.8 : 0.9;
        g.beginPath();
        g.arc(Math.random() * TEX_W, Math.random() * TEX_H, r, 0, 7);
        g.fill();
      }
    }
    return c;
  };
}

function pentagon(g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const px = x + r * Math.cos(a), py = y + r * Math.sin(a);
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.closePath();
  g.fill();
}

function soccer() {
  const [c, g] = canvasCtx();
  g.fillStyle = '#f5f5f2';
  g.fillRect(0, 0, TEX_W, TEX_H);
  g.fillStyle = '#17171a';
  const spots = [[32, 30], [128, 30], [224, 30], [80, 98], [176, 98], [-16, 98], [272, 98]];
  for (const [x, y] of spots) pentagon(g, x, y, 17);
  return c;
}

function basketball() {
  const [c, g] = canvasCtx();
  g.fillStyle = '#e8702a';
  g.fillRect(0, 0, TEX_W, TEX_H);
  g.strokeStyle = '#38220f';
  g.lineWidth = 5;
  g.beginPath(); g.moveTo(0, 64); g.lineTo(TEX_W, 64); g.stroke();
  for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, TEX_H); g.stroke(); }
  for (const x of [0, TEX_W]) { g.beginPath(); g.arc(x, 64, 52, 0, Math.PI * 2); g.stroke(); }
  return c;
}

function tennis() {
  const [c, g] = canvasCtx();
  g.fillStyle = '#cbe63c';
  g.fillRect(0, 0, TEX_W, TEX_H);
  g.strokeStyle = '#f8f8f4';
  g.lineWidth = 7;
  for (const [base, phase] of [[34, 0], [94, Math.PI]]) {
    g.beginPath();
    for (let x = 0; x <= TEX_W; x += 4) {
      const y = base + 18 * Math.sin((x / TEX_W) * Math.PI * 2 + phase);
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }
  return c;
}

function bowling() {
  const [c, g] = canvasCtx();
  g.fillStyle = '#191036';
  g.fillRect(0, 0, TEX_W, TEX_H);
  g.strokeStyle = 'rgba(110,70,200,.45)';
  g.lineWidth = 10;
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.moveTo(Math.random() * TEX_W, Math.random() * TEX_H);
    g.bezierCurveTo(Math.random() * TEX_W, Math.random() * TEX_H,
      Math.random() * TEX_W, Math.random() * TEX_H,
      Math.random() * TEX_W, Math.random() * TEX_H);
    g.stroke();
  }
  g.fillStyle = '#000';
  for (const [x, y, r] of [[128, 46, 7], [112, 66, 7], [146, 66, 7]]) {
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  return c;
}

const POOL_COLORS = [null, '#fdd835', '#1565c0', '#e53935', '#6a2d9e',
  '#fb8c00', '#2e7d32', '#8d2b2b', '#141414'];

function numberSpot(g, x, y, n) {
  g.fillStyle = '#fafafa';
  g.beginPath(); g.arc(x, y, 21, 0, 7); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#111';
  g.font = 'bold 25px system-ui, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(n), x, y + 1);
}

function billiard(n) {
  return () => {
    const [c, g] = canvasCtx();
    if (n === 0) {                       // cue ball
      g.fillStyle = '#f8f7f2'; g.fillRect(0, 0, TEX_W, TEX_H);
      g.fillStyle = '#c0392b';
      for (const x of [64, 192]) { g.beginPath(); g.arc(x, 64, 7, 0, 7); g.fill(); }
      return c;
    }
    const color = POOL_COLORS[n > 8 ? n - 8 : n];
    if (n > 8) {                         // stripes
      g.fillStyle = '#f8f7f2'; g.fillRect(0, 0, TEX_W, TEX_H);
      g.fillStyle = color; g.fillRect(0, 30, TEX_W, 68);
    } else {                             // solids
      g.fillStyle = color; g.fillRect(0, 0, TEX_W, TEX_H);
    }
    for (const x of [64, 192]) numberSpot(g, x, 64, n);
    return c;
  };
}

function flame() {
  const [c, g] = canvasCtx();
  const grad = g.createLinearGradient(0, 0, 0, TEX_H);
  grad.addColorStop(0, '#fff176');
  grad.addColorStop(0.45, '#ff9800');
  grad.addColorStop(1, '#b71c1c');
  g.fillStyle = grad;
  g.fillRect(0, 0, TEX_W, TEX_H);
  for (let i = 0; i < 26; i++) {              // licking flames
    const x = Math.random() * TEX_W, h = 25 + Math.random() * 55;
    const f = g.createLinearGradient(0, TEX_H - h, 0, TEX_H);
    f.addColorStop(0, 'rgba(255,241,118,.85)');
    f.addColorStop(1, 'rgba(255,87,34,0)');
    g.fillStyle = f;
    g.beginPath();
    g.moveTo(x - 8, TEX_H);
    g.quadraticCurveTo(x, TEX_H - h * 1.4, x + 8, TEX_H);
    g.fill();
  }
  return c;
}

function angel() {
  const [c, g] = canvasCtx();
  g.fillStyle = '#bfe3ff';
  g.fillRect(0, 0, TEX_W, TEX_H);
  g.fillStyle = '#ffd23e';                    // halo band
  g.fillRect(0, 14, TEX_W, 9);
  g.fillStyle = '#ffffff';                    // wings at both seams
  for (const cx of [64, 192]) {
    for (const s of [-1, 1]) {
      for (let f = 0; f < 4; f++) {           // four feathers per wing
        g.beginPath();
        g.ellipse(cx + s * (14 + f * 11), 66 + f * 7, 16, 6 + f * 2, s * (0.35 + f * 0.18), 0, 7);
        g.fill();
      }
    }
  }
  return c;
}

// --- character skins: generic archetypes drawn as a face, twice around the
// ball so one always faces camera. Deliberately original — no real IP. ---
function faceBall(bg, draw) {
  return () => {
    const [c, g] = canvasCtx();
    if (typeof bg === 'function') bg(g);
    else { g.fillStyle = bg; g.fillRect(0, 0, TEX_W, TEX_H); }
    for (const cx of [64, 192]) { g.save(); g.translate(cx, 64); draw(g); g.restore(); }
    return c;
  };
}
const eye = (g, x, r = 9) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, -8, r, 0, 7); g.fill();
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(x, -8, r * 0.5, 0, 7); g.fill(); };

const robot = faceBall('#9fb2c9', (g) => {
  g.fillStyle = '#26323f'; g.fillRect(-26, -22, 52, 40);
  g.fillStyle = '#4dd0e1'; g.fillRect(-18, -14, 12, 10); g.fillRect(6, -14, 12, 10);
  g.fillStyle = '#ff5252'; g.fillRect(-12, 6, 24, 4);
  g.strokeStyle = '#ffd23e'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -22); g.lineTo(0, -32); g.stroke();
  g.fillStyle = '#ffd23e'; g.beginPath(); g.arc(0, -34, 4, 0, 7); g.fill();
});
const ninja = faceBall('#2f2f38', (g) => {
  g.fillStyle = '#e53935'; g.fillRect(-30, -14, 60, 14);      // headband
  g.fillStyle = '#f2c9a0'; g.fillRect(-26, 0, 52, 12);         // eye strip
  g.fillStyle = '#1a1a1a'; g.fillRect(-18, 3, 12, 5); g.fillRect(6, 3, 12, 5);
});
const alien = faceBall('#7cf29b', (g) => {
  g.fillStyle = '#0d3b1e';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 12, -6, 7, 12, s * 0.3, 0, 7); g.fill(); }
  g.strokeStyle = '#0d3b1e'; g.lineWidth = 2; g.beginPath(); g.arc(0, 14, 9, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
});
const smiley = faceBall('#ffd23e', (g) => {
  eye(g, -13, 8); eye(g, 13, 8);
  g.strokeStyle = '#8a5a00'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.arc(0, 6, 16, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke();
});
const pirate = faceBall('#e8ddc7', (g) => {
  g.fillStyle = '#1a1a1a'; g.fillRect(-30, -30, 60, 16);      // bandana
  g.fillStyle = '#c0392b'; for (let x = -30; x < 30; x += 10) g.fillRect(x, -30, 5, 16);
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-13, -6, 8, 0, 7); g.fill();  // eyepatch
  g.strokeStyle = '#1a1a1a'; g.lineWidth = 3; g.beginPath(); g.moveTo(-30, -12); g.lineTo(6, -8); g.stroke();
  eye(g, 13, 8);
  g.strokeStyle = '#7a4a2a'; g.lineWidth = 4; g.beginPath(); g.arc(2, 8, 12, 0.1 * Math.PI, 0.6 * Math.PI); g.stroke();
});
const skull = faceBall('#f3f3ef', (g) => {
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-13, -6, 9, 0, 7); g.fill(); g.beginPath(); g.arc(13, -6, 9, 0, 7); g.fill();
  g.beginPath(); g.moveTo(0, 4); g.lineTo(-5, 14); g.lineTo(5, 14); g.fill();  // nose
  for (let x = -12; x <= 12; x += 8) g.fillRect(x - 2, 20, 4, 8);              // teeth
});

// ---------------------------------------------------------------------------
// v18 power balls — a gradient body with a glyph repeated around the equator,
// so the power still reads at 46 px in the picker.
// ---------------------------------------------------------------------------
function powerBall(stops, drawGlyph, glyph = 'rgba(255,255,255,.93)') {
  return () => {
    const [c, g] = canvasCtx();
    const grad = g.createLinearGradient(0, 0, 0, TEX_H);
    stops.forEach((color, i) => grad.addColorStop(i / (stops.length - 1), color));
    g.fillStyle = grad;
    g.fillRect(0, 0, TEX_W, TEX_H);
    for (let i = 0; i < 4; i++) {
      g.save();
      g.translate(TEX_W * (0.125 + i * 0.25), TEX_H * 0.5);
      g.fillStyle = glyph; g.strokeStyle = glyph; g.lineWidth = 4; g.lineCap = 'round';
      drawGlyph(g);
      g.restore();
    }
    return c;
  };
}

const pbTimewarp = powerBall(['#8ecae6', '#219ebc', '#023047'], (g) => {
  g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 20, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -12); g.moveTo(0, 0); g.lineTo(9, 4); g.stroke();
  g.beginPath(); g.arc(0, 0, 27, -0.9, 0.5); g.stroke();          // rewind sweep
});
const pbMagnet = powerBall(['#ff7b7b', '#d32f2f', '#4a0e0e'], (g) => {
  g.lineWidth = 8; g.beginPath(); g.arc(0, 2, 15, Math.PI, 0); g.stroke();   // horseshoe
  g.lineWidth = 8; g.beginPath(); g.moveTo(-15, 2); g.lineTo(-15, 14);
  g.moveTo(15, 2); g.lineTo(15, 14); g.stroke();
});
const pbGhost = powerBall(['#e6e6fa', '#9a8cc7', '#3b2f5e'], (g) => {
  g.beginPath(); g.arc(0, -4, 14, Math.PI, 0); g.lineTo(14, 16);
  for (let x = 10; x >= -14; x -= 8) g.lineTo(x, x % 16 === 2 ? 9 : 16);
  g.closePath(); g.fill();
  g.fillStyle = '#3b2f5e'; g.beginPath(); g.arc(-5, -4, 3, 0, 7); g.arc(5, -4, 3, 0, 7); g.fill();
});
const pbDiamond = powerBall(['#b9f6ff', '#26c6da', '#00506b'], (g) => {
  g.beginPath(); g.moveTo(0, -20); g.lineTo(16, -4); g.lineTo(0, 20); g.lineTo(-16, -4);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,60,80,.55)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-16, -4); g.lineTo(16, -4); g.moveTo(0, -20); g.lineTo(0, 20); g.stroke();
});
const pbStorm = powerBall(['#fff59d', '#fbc02d', '#3e2723'], (g) => {
  g.beginPath(); g.moveTo(4, -22); g.lineTo(-12, 4); g.lineTo(-1, 4);
  g.lineTo(-5, 22); g.lineTo(13, -3); g.lineTo(2, -3); g.closePath(); g.fill();
});
const pbPortal = powerBall(['#ce93d8', '#7b1fa2', '#1a0033'], (g) => {
  g.lineWidth = 3.5;
  for (let r = 20; r > 4; r -= 6) { g.beginPath(); g.arc(0, 0, r, 0.4, 5.4); g.stroke(); }
});
const pbMidas = powerBall(['#ffe082', '#c9971a', '#5d3a00'], (g) => {
  g.beginPath(); g.arc(0, 0, 18, 0, 7); g.fill();
  g.fillStyle = '#5d3a00'; g.font = 'bold 24px sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 1);
});
const pbPrism = powerBall(['#ffffff', '#d7d7e8', '#5b5b7a'], (g) => {
  const bands = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
  g.lineWidth = 4;
  bands.forEach((color, i) => {
    g.strokeStyle = color;
    g.beginPath(); g.arc(0, 14, 8 + i * 4, Math.PI, 0); g.stroke();
  });
});
const pbVoid = powerBall(['#4a4a68', '#1b1b2b', '#000000'], (g) => {
  g.fillStyle = '#000'; g.beginPath(); g.arc(0, 0, 15, 0, 7); g.fill();
  g.strokeStyle = 'rgba(180,140,255,.85)'; g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, 21, 0, 7); g.stroke();
  g.strokeStyle = 'rgba(120,90,200,.5)';
  g.beginPath(); g.arc(0, 0, 26, 0, 7); g.stroke();
});

export const BALLS = [
  { id: 'sunset', name: 'Sunset', price: 0, make: gradientBall(['#ffd54f', '#ff7043', '#8e24aa']) },
  { id: 'ocean', name: 'Ocean', price: 30, make: gradientBall(['#4dd0e1', '#1976d2', '#0d2c6b']) },
  { id: 'candy', name: 'Candy', price: 30, make: gradientBall(['#ff8a80', '#ff4081', '#7c4dff']) },
  { id: 'lime', name: 'Lime', price: 30, make: gradientBall(['#f4ff81', '#aeea00', '#33691e']) },
  { id: 'galaxy', name: 'Galaxy', price: 120, make: gradientBall(['#b388ff', '#4527a0', '#0d0221'], true) },
  { id: 'soccer', name: 'Soccer', price: 80, make: soccer },
  { id: 'basketball', name: 'Basketball', price: 80, make: basketball },
  { id: 'tennis', name: 'Tennis', price: 60, make: tennis },
  { id: 'bowling', name: 'Bowling', price: 100, make: bowling, roughness: 0.15, metalness: 0.1 },
  { id: 'cue', name: 'Cue Ball', price: 60, make: billiard(0), roughness: 0.2 },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `pool${i + 1}`,
    name: `${i + 1} Ball`,
    price: i + 1 === 8 ? 150 : i + 1 > 8 ? 70 : 50,
    make: billiard(i + 1),
    roughness: 0.2,
  })),
  // Character skins (original archetypes — copyright-safe)
  { id: 'smiley', name: 'Smiley', price: 90, make: smiley },
  { id: 'robot', name: 'Robo', price: 110, make: robot, roughness: 0.3, metalness: 0.4 },
  { id: 'ninja', name: 'Ninja', price: 110, make: ninja },
  { id: 'alien', name: 'Alien', price: 120, make: alien },
  { id: 'pirate', name: 'Pirate', price: 130, make: pirate },
  { id: 'skull', name: 'Skull', price: 140, make: skull },
  // Premium perk balls
  { id: 'flame', name: 'Flame Ball — torches boulders (+5 coins each), every coin worth +1', price: 250, make: flame, perk: 'flame', roughness: 0.25 },
  { id: 'angel', name: 'Angel Ball — glides over holes', price: 400, make: angel, perk: 'wings', roughness: 0.3 },
  // --- v18 power balls: each changes how a run is played, not how it looks ---
  { id: 'pb-timewarp', name: '⏰ Timewarp Ball — rewinds 3 s after a fall, once per run', price: 600, make: pbTimewarp, perk: 'rewind', roughness: 0.2, metalness: 0.35 },
  { id: 'pb-magnet', name: '🧲 Magnet Ball — pulls coins in from the neighbouring lanes', price: 450, make: pbMagnet, perk: 'magnet', roughness: 0.3, metalness: 0.3 },
  { id: 'pb-ghost', name: '👻 Ghost Ball — phases through boulders for 5 s after a hit', price: 500, make: pbGhost, perk: 'ghost', roughness: 0.5 },
  { id: 'pb-diamond', name: '💎 Diamond Ball — indestructible for the first 200 m', price: 550, make: pbDiamond, perk: 'diamond', roughness: 0.05, metalness: 0.5 },
  { id: 'pb-storm', name: '⚡ Storm Ball — higher top speed and 1.5× coins', price: 700, make: pbStorm, perk: 'storm', roughness: 0.25, metalness: 0.4 },
  { id: 'pb-portal', name: '🌀 Portal Ball — teleports past holes and gaps instead of falling', price: 650, make: pbPortal, perk: 'portal', roughness: 0.3, metalness: 0.35 },
  { id: 'pb-midas', name: '🪙 Midas Ball — coins pay triple, but no shield can save you', price: 800, make: pbMidas, perk: 'midas', roughness: 0.15, metalness: 0.75 },
  { id: 'pb-prism', name: '🌈 Prism Ball — every world mechanic disabled (no ice, no slip)', price: 900, make: pbPrism, perk: 'prism', roughness: 0.1, metalness: 0.25 },
  { id: 'pb-void', name: '🕳️ Void Ball — holes close ahead of you; the track never gaps', price: 1200, make: pbVoid, perk: 'void', roughness: 0.4, metalness: 0.2 },
];

// Small round chip image for the ball-picker UI.
export function ballThumb(def, size = 46) {
  const src = def.make();
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.beginPath(); g.arc(size / 2, size / 2, size / 2 - 1, 0, 7); g.clip();
  g.drawImage(src, 64, 0, 128, 128, 0, 0, size, size);
  const sheen = g.createRadialGradient(size * 0.35, size * 0.3, 2, size / 2, size / 2, size * 0.7);
  sheen.addColorStop(0, 'rgba(255,255,255,.55)');
  sheen.addColorStop(0.35, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(0,0,0,.35)');
  g.fillStyle = sheen;
  g.fillRect(0, 0, size, size);
  return c;
}
