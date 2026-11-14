/* Headless legacy game runner = the parity oracle (DESIGN §14). Loads legacy/shmup-fighter.html's script in a VM with stubbed browser APIs,
 * starts a match with chosen characters, and steps it with injected inputs. Randomness that affects sim comes from the game's own seeded rng().
 * Usage (from tests): const { createLegacy } = require('../tools/parity/legacy.cjs'); const g = createLegacy({ chars:['reimu','marisa'], seed:1 });
 *   g.step([{x:1,y:0,b:{shot:true}}, {x:0,y:0,b:{}}]); g.get('P[0].x'); g.eval('...'); */
const fs = require('fs'), vm = require('vm'), path = require('path');

let cached = null;
function script() {
  if (cached) return cached;
  const html = fs.readFileSync(path.join(__dirname, '../../legacy/shmup-fighter.html'), 'utf8');
  const parts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.includes('function start'));
  if (!parts.length) throw new Error('legacy script not found');
  return (cached = parts[0]);
}

function createLegacy(opts = {}) {
  const { chars = ['reimu', 'marisa'], seed = 1, map = 0, humans, cpuLevel = 5, items = false, tempo = 10 } = opts;
  let VT = 0;
  const ctxP = new Proxy({}, { get: (t, k) => k === 'measureText' ? s => ({ width: (s || '').length * 8 }) : k === 'getTransform' ? () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }) : k === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : typeof k === 'string' && k.startsWith('create') ? () => ({ addColorStop() {} }) : (t[k] !== undefined ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true } });
  const stub = () => ({ getContext: () => ctxP, style: {}, appendChild() {}, addEventListener() {}, setAttribute() {}, classList: { add() {}, remove() {} } });
  const g = { console: { log() {}, warn() {}, error() {} }, Math: Object.create(Math), document: { getElementById: stub, createElement: stub, head: null, body: null, addEventListener() {} }, innerWidth: 1280, innerHeight: 720, navigator: { getGamepads: () => [], userAgent: 'node' }, addEventListener() {}, localStorage: { getItem: () => null, setItem() {} }, requestAnimationFrame() {}, performance: { now: () => VT }, Date: Object.assign(class extends Date {}, { now: () => 1700000000000 }), setTimeout() {}, setInterval() {}, clearInterval() {}, clearTimeout() {}, Worker: undefined, URL: Object.assign(function () {}, { createObjectURL: () => '' }), Blob: function () {}, AudioContext: undefined, Image: function () {}, Path2D: function () {} };
  g.window = g; vm.createContext(g); vm.runInContext(script(), g);
  const R = c => vm.runInContext(c, g);
  const idx = chars.map(c => R(`CHR.findIndex(c=>c.k===${JSON.stringify(c)})`));
  if (idx.some(i => i < 0)) throw new Error('unknown character in ' + chars);
  R(`nP=${chars.length};nH=${humans ?? chars.length};cpuLv=${cpuLevel};itemsOn=${!!items};NERV=${tempo};mapI=${map};AUDIO_LOCK=true;`);
  R(`start('game')`);
  R(`seed=${seed | 0};P.forEach((p,i)=>{p.shotT=CH0+${JSON.stringify(idx)}[i];const c=chOf(p);p.spI=c.spI;c.init&&c.init(p)});CARDS.length=0;`);
  // injected inputs: readHuman reads this table; undefined players = neutral
  g.__in = [];
  R(`readHuman=i=>{const v=__in[i]||{};return{x:v.x||0,y:v.y||0,b:Object.assign({},v.b)}}`);
  return {
    g, eval: R,
    /** Advance one frame with inputs per player: {x,y,b:{shot,heavy,melee,dash,parry,burst,spell,focus,prev,next}} */
    step(inputs = []) { g.__in = inputs; R('step()'); },
    /** Read a JSON-able expression, e.g. get('P[0].x'). */
    get(expr) { return JSON.parse(R(`JSON.stringify(${expr})`)); },
    /** Snapshot of the observables used by parity tests. */
    obs() { return JSON.parse(R(`JSON.stringify({f:frame,P:P.map(p=>({x:p.x,y:p.y,vx:p.vx,vy:p.vy,hp:p.hp,state:p.state,t:p.t,boost:p.boost,spirit:p.spirit,power:p.power,graze:p.graze,inv:p.inv,run:p.run,slide:p.slide,shotCd:p.shotCd,aim:p.aim,stocks:p.stocks,kos:p.kos||0,sd:p.sd||0,pips:p.pips,spit:p.spit||0,mirror:p.mirror||0,elx:(p.fx&&p.fx.elx)||0,imm:(p.fx&&p.fx.imm)||0,giant:p.giant||0,rifle:p.rifle||0,cam:p.cam||0,clone:p.clone||0,cHP:p.cloneHP||0,spk:p.spk||0})),ts:TSTOP,E:ENT.filter(e=>['ryy','rbar','mpot','mpud','mtr','cray'].includes(e.k)).map(e=>e.k==='cray'?{k:10,t:e.t,x:e.x,y:e.y,vx:e.spin,vy:e.push||0,g:e.ev,a:e.a}:{k:{ryy:1,rbar:2,mpot:3,mpud:4,mtr:5}[e.k],t:e.t,x:e.x,y:e.y,vx:e.vx||0,vy:e.vy||0,g:+!!e.g,a:e.a||0}).concat(ORBS.map(e=>({k:100,t:e.t,x:e.x,y:e.y,vx:e.vx,vy:e.vy,g:0,a:0})),ZONES.map(e=>({k:101,t:e.t,x:e.x,y:e.y,vx:0,vy:0,g:0,a:0})),HOLES.map(e=>({k:102,t:e.t,x:e.x,y:e.y,vx:0,vy:0,g:0,a:0})),BUMPS.map(e=>({k:103,t:e.t,x:e.x,y:e.y,vx:0,vy:e.vy,g:0,a:0})),FAIRIES.map(e=>({k:104,t:e.t,x:e.x,y:e.y,vx:0,vy:0,g:e.o,a:0,w:e.hp,r:e.loot||0}))).sort((a,b)=>a.k-b.k),C:CARDS.map(c=>({x:c.x,y:c.y,on:+c.on,age:c.age,type:c.type,cp:c.cp})),K:KOB.map(k=>({o:k.o,x:k.x,y:k.y,a:k.a,t:k.t,dep:k.dep||0})),B:B.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.r,owner:b.owner,dmg:b.dmg,heavy:b.heavy,life:b.life,mult:b.mult,dist:b.dist,refl:b.refl||0,fz:b.fz||0}))})`)); },
  };
}
module.exports = { createLegacy };
