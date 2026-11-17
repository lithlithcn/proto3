// One-shot: legacy/shmup-fighter.html -> Proto4 layout (code copied verbatim, one file per legacy section, grouped by theme).
const fs=require('fs'),path=require('path');
const SRC=process.argv[2],OUT=process.argv[3];
const h=fs.readFileSync(SRC,'utf8');
const F={core:[0,1,2,3,4,6,9,38,69,92,34],audio:[7,20,26,86,87,136],ui:[8,22,23,52,53,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,95,96,97,98,99,100,120,121,122,123,125,126,127,5],
 'ui/playlist':[128,129,130,131,132,133,134,135],combat:[10,12,13,24,28,32,33,35,41,47,48],items:[11,14,15,16,17,19,30,31,44,45,46,49,51,88,118],
 characters:[103,104,105,106,107,108,109,110,111,112,113,114,115,116,119],render:[40,43,50,70,93,94,124],online:[54,63,64,65,66,67,102,117],
 cpu:[21,25,37,42,68,89,90,91],editor:[27,55,56,57,58,59,60,61,62],tutorial:[29,39],training:[18,36,101]};
const dir={};for(const [d,l] of Object.entries(F))for(const i of l){if(dir[i])throw 'dup '+i;dir[i]=d}
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').split('-').slice(0,4).join('-')||'part';
const re=/<script>([\s\S]*?)<\/script>/g;let m,last=0,shell='';const files=[],used=new Set();
const RN={'characters/flandre.js':'characters/flandre-laevatein.js','characters/okina.js':'characters/okina-danseuses.js','characters/nazrin.js':'characters/nazrin-souris.js','characters/reimu.js':'characters/reimu-yinyang.js','characters/logique-et-dessin-des.js':'characters/entites-des-persos.js','characters/outils-communs-des-persos.js':'characters/outils-communs.js','cpu/cpu-8-9.js':'cpu/expert-prediction.js','cpu/cpu-8-9-2.js':'cpu/expert-parade.js','cpu/ia.js':'cpu/variete-adaptation.js','cpu/ia-2.js':'cpu/evite-dangers.js','cpu/ia-3.js':'cpu/style-rush.js','cpu/ia-4.js':'cpu/anticipe-barrage.js','ui/ecran-titre-2.js':'ui/ecran-titre-logo.js','ui/ecran-titre-3.js':'ui/ecran-titre-espace.js','online/en-ligne.js':'online/revanche.js','online/en-ligne-2.js':'online/ping-emotes.js','items/patch-items-v4-2.js':'items/patch-items-v4-lot-b.js','items/lot-4-2.js':'items/lot-4-suite.js','items/donation-box-2.js':'items/donation-box-suite.js','ui/game.js':'ui/game-ecran-fin.js','editor/rendu.js':'editor/rendu-calques.js'};
const put=(rel,body)=>{rel=RN[rel]||rel;let r=rel,k=2;while(used.has(r))r=rel.replace(/\.js$/,'-'+(k++)+'.js');used.add(r);const p=path.join(OUT,'src',r);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body.endsWith('\n')?body:body+'\n');files.push(r);return r};
fs.rmSync(OUT,{recursive:true,force:true});
while((m=re.exec(h))){shell+=h.slice(last,m.index);last=re.lastIndex;const p=m[1];let tags=[];
  if(!p.includes('function start')){tags.push(put(p.includes('SFX_B64')?'data/sfx.js':'vendor/peerjs.js',p))}
  else{const L=p.split('\n'),c=[],R=require('acorn').parse(p,{ecmaVersion:'latest'}).body.map(n=>[n.start,n.end]),off=[];let o=0;L.forEach(l=>{off.push(o);o+=l.length+1});
    const inside=i=>R.some(([a,b])=>a<off[i]&&off[i]<b);let skipped=0;L.forEach((l,i)=>{if(/^\/\/ (={5,}|-{4})/.test(l)){if(inside(i)){skipped++;c.push(-1)}else c.push(i)}});
    const cc=c.filter(x=>x>=0);const chunks=[[0,cc[0],'core/head.js']];c.forEach((a,k)=>{if(a<0)return;const nx=c.slice(k+1).find(x=>x>=0);const t=L[a].replace(/^\/\/ [=-]+\s*/,'').split(/[:(,·=]|\+ /)[0];chunks.push([a,nx??L.length,dir[k]+'/'+slug(t)+'.js'])});
    for(const [a,b,rel] of chunks){if(rel.startsWith('undefined'))throw 'unmapped '+rel;let seg=L.slice(a,b),buf=[];
      const flush=()=>{if(buf.length){tags.push(put(rel,"'use strict';\n"+buf.join('\n')));buf=[]}};
      for(const l of seg){if(l.length>20000&&!inside(seg.indexOf(l)+a)&&!inside(seg.indexOf(l)+a+1)){flush();const n=(/^const (\w+)/.exec(l)||[,'blob'])[1].toLowerCase();tags.push(put('data/'+n+'.js',"'use strict';\n"+l))}else buf.push(l)}flush()}}
  shell+=tags.map(t=>`<script src="src/${t}"></script>`).join('\n')}
shell+=h.slice(last);
fs.writeFileSync(path.join(OUT,'index.html'),shell);
console.log(files.length,'files');
