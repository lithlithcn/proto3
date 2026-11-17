/* Headless game runner (no rendering unless asked). Loads the game's main script (game/src, glued by build.cjs) in a VM with stubbed browser APIs,
 * starts a match with chosen characters, and steps it with injected inputs. Randomness that affects sim comes from the game's own seeded rng().
 * Usage: const { createGame } = require('./headless.cjs'); const g = createGame({ chars:['reimu','marisa'], seed:1, humans:0, items:true });
 *   g.step([{x:1,y:0,b:{shot:true}}, {x:0,y:0,b:{}}]); g.get('P[0].x'); g.eval('...'); */
const fs = require('fs'), vm = require('vm'), path = require('path');

const ROOT = path.join(__dirname, '..');
/** The game's script files in load order: the <script src> list of index.html (single source of truth for the order). */
function scripts() { return [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(f => !f.includes('vendor/') && !f.includes('data/sfx')); }

function createLegacy(opts = {}) {
  const { chars = ['reimu', 'marisa'], seed = 1, map = 0, humans, cpuLevel = 5, items = false, tempo = 10 } = opts;
  let VT = 0;
  const rec = require('./recorder.cjs').makeRecorder(), ctxP = rec.screenCtx;
  const stub = () => ({ getContext: () => ctxP, style: {}, appendChild() {}, addEventListener() {}, setAttribute() {}, classList: { add() {}, remove() {} } });
  const g = { console: { log() {}, warn() {}, error() {} }, Math: Object.create(Math), document: { getElementById: stub, createElement: tag => tag === 'canvas' ? rec.newCanvas() : stub(), head: null, body: null, addEventListener() {} }, innerWidth: 1280, innerHeight: 720, navigator: { getGamepads: () => [], userAgent: 'node' }, addEventListener() {}, localStorage: { getItem: () => null, setItem() {} }, requestAnimationFrame() {}, performance: { now: () => VT }, Date: Object.assign(class extends Date {}, { now: () => 1700000000000 }), setTimeout() {}, setInterval() {}, clearInterval() {}, clearTimeout() {}, Worker: undefined, URL: Object.assign(function () {}, { createObjectURL: () => '' }), Blob: function () {}, AudioContext: undefined, Image: function () {}, Path2D: function () {} };
  { let rs = (seed * 2654435761 + 12345) >>> 0; g.Math.random = () => (rs = (Math.imul(rs, 1664525) + 1013904223) >>> 0) / 4294967296; } // cosmetic randomness (particles, shake) must be reproducible so two renderers can be compared op by op
  g.window = g; vm.createContext(g); for (const f of scripts()) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), g, { filename: f });
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
    g, eval: R, rec,
    /** Sets the harness clock (performance.now() in ms; UI animations read it). */
    clock(ms) { VT = ms; },
    /** Draws one frame (the legacy `render()`, 2D path) and returns the recorded op stream. Draw functions are wrapped once so the stream carries who-drew-what markers. */
    render() { if (!g.__wrapped) { g.__wrapped = 1; g.__mk = (n, e) => rec.mark(n, e); R(`for(const k of Object.getOwnPropertyNames(globalThis)){const f=globalThis[k];if(typeof f==='function'&&/^(draw[A-Z]|tDraw$|shB$|uiBG$)/.test(k)&&!f.__w){const w=function(...a){__mk(k,1);try{return f.apply(this,a)}finally{__mk(k,0)}};w.__w=1;globalThis[k]=w}}`); } rec.take(); rec.reset(); R('render()'); return rec.take(); },
    /** Advance one frame with inputs per player: {x,y,b:{shot,heavy,melee,dash,parry,burst,spell,focus,prev,next}} */
    step(inputs = []) { g.__in = inputs; R('if(winner<0)step();else{stepFx();winT++}'); }, // the real loop: once a winner exists only the effects tick (results screen)
    /** Read a JSON-able expression, e.g. get('P[0].x'). */
    get(expr) { return JSON.parse(R(`JSON.stringify(${expr})`)); },
    /** Snapshot of the observables used by parity tests. */
    obs() { return JSON.parse(R(`JSON.stringify({f:frame,P:P.map(p=>({x:p.x,y:p.y,vx:p.vx,vy:p.vy,hp:p.hp,state:p.state,t:p.t,boost:p.boost,spirit:p.spirit,power:p.power,graze:p.graze,inv:p.inv,run:p.run,slide:p.slide,shotCd:p.shotCd,aim:p.aim,stocks:p.stocks,kos:p.kos||0,sd:p.sd||0,pips:p.pips,spit:p.spit||0,mirror:p.mirror||0,elx:(p.fx&&p.fx.elx)||0,imm:(p.fx&&p.fx.imm)||0,giant:p.giant||0,rifle:p.rifle||0,cam:p.cam||0,clone:p.clone||0,cHP:p.cloneHP||0,spk:p.spk||0})),ts:TSTOP,E:ENT.filter(e=>['ryy','rbar','mpot','mpud','mtr','fsb','flv','ffl','fcl','hpl','hst','hrg','ncl','nufo','nst','obd','odr','odn','nms','npd','npg','nrc','ncoin','atn','anw','awd','cray'].includes(e.k)&&!e.aya).map(e=>e.k==='cray'?{k:10,t:e.t,x:e.x,y:e.y,vx:e.spin,vy:e.push||0,g:e.ev,a:e.a}:{k:{ryy:1,rbar:2,mpot:3,mpud:4,mtr:5,fsb:6,flv:7,ffl:8,fcl:9,hpl:200,hst:201,hrg:202,ncl:203,nufo:204,nst:205,obd:206,odr:207,odn:208,nms:209,npd:210,npg:211,nrc:212,ncoin:213,atn:214,anw:215,awd:216}[e.k],t:e.t,x:e.x,y:e.y,vx:e.vx||0,vy:e.vy||0,g:+!!e.g,a:e.a||0}).concat(ORBS.map(e=>({k:100,t:e.t,x:e.x,y:e.y,vx:e.vx,vy:e.vy,g:0,a:0})),ZONES.map(e=>({k:101,t:e.t,x:e.x,y:e.y,vx:0,vy:0,g:0,a:0})),HOLES.map(e=>({k:102,t:e.t,x:e.x,y:e.y,vx:0,vy:0,g:0,a:0})),BUMPS.map(e=>({k:103,t:e.t,x:e.x,y:e.y,vx:0,vy:e.vy,g:0,a:0})),FAIRIES.map(e=>({k:104,t:e.t,x:e.x,y:e.y,vx:0,vy:0,g:e.o,a:0,w:e.hp,r:e.loot||0})),ENT.filter(e=>({efairy:300,decoy:301})[e.k]).map(e=>({k:({efairy:300,decoy:301})[e.k],t:e.t,x:e.x,y:e.y,vx:e.vx||0,vy:e.vy||0,g:e.ph||0,a:e.a||0,w:e.sx||0,h:e.sy||0}))).sort((a,b)=>a.k-b.k),C:CARDS.map(c=>({x:c.x,y:c.y,on:+c.on,age:c.age,type:c.type,cp:c.cp})),K:KOB.map(k=>({o:k.o,x:k.x,y:k.y,a:k.a,t:k.t,dep:k.dep||0})),B:B.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.r,owner:b.owner,dmg:b.dmg,heavy:b.heavy,life:b.life,mult:b.mult,dist:b.dist,refl:b.refl||0,fz:b.fz||0,gr:b.gr||0,home:b.home||0,wav:b.wav||0,ph:b.ph||0,fake:+!!b.fake}))})`)); },
  };
}
module.exports = { createGame: createLegacy, scripts };
