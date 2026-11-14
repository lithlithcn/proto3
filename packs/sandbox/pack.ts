import { BTN, definePack, f64s, i32, i32s } from '@kernel';

/** Minimal demo pack proving the kernel contract: state slice, RNG stream, system, event, hook. Not game content; removed once real packs exist. */
export default definePack({
  id: 'sandbox',
  version: '0.1.0',
  events: ['sandbox:dash'],
  rng: ['wobble'],
  state: { x: f64s(32), y: f64s(32), angle: f64s(32), dashes: i32(), cd: i32s(32) },
  init(w) {
    const s = w.slice<{ x: Float64Array; y: Float64Array }>('sandbox');
    for (let p = 0; p < w.players; p++) { s.x[p] = 200 + p * 100; s.y[p] = 300; }
  },
  systems: [{
    id: 'move', phase: 'sim',
    run(w) {
      const s = w.slice<{ x: Float64Array; y: Float64Array; angle: Float64Array; cd: Int32Array }>('sandbox');
      const wob = w.rng('sandbox:wobble');
      for (let p = 0; p < w.players; p++) {
        const sp = w.held(p, BTN.focus) ? 2 : 4.4; // legacy T.FOCUS_SPEED / T.SPEED
        const ix = w.x(p) / 127, iy = w.y(p) / 127, len = w.math.hypot(ix, iy);
        if (len > 0) { const k = (len > 1 ? 1 : len) / len; s.x[p]! += ix * k * sp; s.y[p]! += iy * k * sp; s.angle[p] = w.math.atan2(iy, ix); }
        s.x[p]! += (wob.next() - 0.5) * 0.01;
        if (s.cd[p]! > 0) s.cd[p]!--;
        else if (w.pressed(p, BTN.dash)) { s.cd[p] = 30; w.emit('sandbox:dash', { player: p }); }
      }
    },
  }],
  hooks: [{
    id: 'count-dashes', event: 'sandbox:dash', phase: 'after',
    run(w) { const s = w.slice<{ dashes: number }>('sandbox'); s.dashes++; },
  }],
});
