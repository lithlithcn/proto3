// audit de l'ancien jeu : charge le script dans une VM et extrait les données
const fs=require('fs'),vm=require('vm');const src=fs.readFileSync(process.argv[2],'utf8');
let VT=0;const ctxP=new Proxy({},{get:(t,k)=>k==='measureText'?(s)=>({width:(s||'').length*8}):k==='getTransform'?()=>({a:1,b:0,c:0,d:1,e:0,f:0}):k==='getImageData'?()=>({data:new Uint8ClampedArray(4)}):typeof k==='string'&&k.startsWith('create')?()=>({addColorStop(){}}):(t[k]!==undefined?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
const g={console:{log(){},warn(){},error(){}},Math:Object.create(Math),document:{getElementById:()=>({getContext:()=>ctxP,style:{}}),createElement:()=>({getContext:()=>ctxP,style:{}})},innerWidth:1280,innerHeight:720,navigator:{getGamepads:()=>[]},addEventListener(){},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame(){},performance:{now:()=>VT},Date:Object.assign(class extends Date{},{now:()=>1700000000000}),setTimeout(){},setInterval(){},clearInterval(){}};
g.window=g;vm.createContext(g);vm.runInContext(src,g);const R=c=>vm.runInContext(c,g);
const out={};
const tryR=(k,c)=>{try{out[k]=JSON.parse(R(`JSON.stringify(${c})`))}catch(e){out[k]='ERR '+e.message}};
tryR('T','T');
tryR('chars','CHR.map((c,i)=>({i,name:c.name,role:c.role,d:c.d,col:c.col,spI:c.spI,keys:Object.keys(c),heavy:c.heavy&&Object.keys(c.heavy),melee:c.melee&&Object.keys(c.melee)}))');
tryR('items','ITEMS.map((it,i)=>Object.assign({i},Object.fromEntries(Object.entries(it).filter(([k,v])=>typeof v!=="function"))))');
tryR('itemFnKeys','[...new Set(ITEMS.flatMap(it=>Object.keys(it).filter(k=>typeof it[k]==="function")))]');
tryR('moves','Object.fromEntries(Object.entries(MOVES).map(([k,v])=>[k,v]))');
tryR('hub','HUB.map(h=>({k:h.k,l:h.l,d:h.d}))');
tryR('maps','typeof MAPS!=="undefined"?MAPS.map(m=>({n:m.n||m.name,keys:Object.keys(m)})):null');
tryR('EST','Object.keys(EST)');tryR('EDR','Object.keys(EDR)');
tryR('SNAPG','typeof SNAPG!=="undefined"?SNAPG:null');
tryR('CHL','CHL');tryR('CH0','CH0');
tryR('COLS','COLS.length');
fs.writeFileSync(__dirname+'/../../build/dump.json',JSON.stringify(out,null,1));
for(const k in out)console.log(k,typeof out[k]==='string'?out[k]:Array.isArray(out[k])?out[k].length:Object.keys(out[k]||{}).length);
// menus
const M2={};for(const n of['HELPL','MAPM','OPTL','PROFM','RECL','RULESM','RULESL','SOUNDM','TEAMM','MENU','PZ']){try{M2[n]=JSON.parse(R(`JSON.stringify((typeof ${n}==='function'?${n}():${n}).map(r=>{try{return typeof r.t==='function'?r.t():String(r.t||r.l||r)}catch(e){return 'ERR '+e.message}}))`))}catch(e){M2[n]='ERR '+e.message}}
fs.writeFileSync(__dirname+'/../../build/menus.json',JSON.stringify(M2,null,1));for(const k in M2)console.log(k,Array.isArray(M2[k])?M2[k].length:M2[k]);
