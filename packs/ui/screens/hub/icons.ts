import { TAU, UFI } from '../../core';

/** Hub card pictograms (legacy hubIcon, line ~3869). `now` = UI clock (the gear turns). */
export function hubIcon(c: CanvasRenderingContext2D, k: string, x: number, y: number, s: number, col: string, now: number): void {
  c.save(); c.translate(x, y); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(2, s * 0.09); c.lineCap = 'round';
  if (k === 'fight') { for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(-s * 0.45 * sg, -s * 0.45); c.lineTo(s * 0.4 * sg, s * 0.4); c.stroke(); c.beginPath(); c.moveTo(s * 0.22 * sg, s * 0.42); c.lineTo(s * 0.42 * sg, s * 0.22); c.stroke(); } }
  else if (k === 'online') { c.beginPath(); c.arc(0, 0, s * 0.42, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(0, 0, s * 0.18, s * 0.42, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-s * 0.42, 0); c.lineTo(s * 0.42, 0); c.stroke(); }
  else if (k === 'train') { for (const r of [0.42, 0.26, 0.1]) { c.beginPath(); c.arc(0, 0, s * r, 0, TAU); c.stroke(); } }
  else if (k === 'rules') { for (let i = 0; i < 3; i++) { const yy = (i - 1) * s * 0.3; c.beginPath(); c.moveTo(-s * 0.42, yy); c.lineTo(s * 0.42, yy); c.stroke(); c.beginPath(); c.arc([-0.2, 0.25, -0.05][i]! * s, yy, s * 0.09, 0, TAU); c.fill(); } }
  else if (k === 'items') { c.save(); c.rotate(-0.2); c.strokeRect(-s * 0.26, -s * 0.38, s * 0.52, s * 0.76); c.beginPath(); c.arc(0, 0, s * 0.13, 0, TAU); c.fill(); c.restore(); }
  else if (k === 'maps') { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) c.fillRect((i - 1.5) * s * 0.27, (j - 1.5) * s * 0.27, s * 0.25, s * 0.25); else c.strokeRect((i - 1.5) * s * 0.27, (j - 1.5) * s * 0.27, s * 0.25, s * 0.25); }
  else if (k === 'opt') { c.beginPath(); for (let i = 0; i < 16; i++) { const r = i % 2 ? s * 0.42 : s * 0.3, a = i * TAU / 16 + now * 0.4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); c.beginPath(); c.arc(0, 0, s * 0.12, 0, TAU); c.stroke(); }
  else if (k === 'help') { c.font = UFI(s * 0.9); c.textAlign = 'center'; c.fillText('?', 0, s * 0.32); }
  c.restore();
}
