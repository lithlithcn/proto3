// One-shot (before defer.cjs): the character kits array `const CHR7=[{k:'marisa',...},...]` -> one file per character (CHR7.push(...)).
const fs=require('fs'),path=require('path'),acorn=require('acorn');const OUT=process.argv[2];
const rel='src/characters/outils-communs.js',P=path.join(OUT,rel),src=fs.readFileSync(P,'utf8');
const ast=acorn.parse(src,{ecmaVersion:'latest'});const st=ast.body.find(n=>n.type==='VariableDeclaration'&&n.declarations[0].id.name==='CHR7');
const arr=st.declarations[0].init;let prev=src.indexOf('[',arr.start)+1;const files=[];
for(const e of arr.elements){const k=e.properties.find(p=>p.key&&p.key.name==='k').value.value;let body=src.slice(prev,e.end);prev=e.end+1;
  const lead=body.match(/^\s*/)[0];body=body.slice(lead.length);
  const cm=body.match(/^(\/\/[^\n]*\n)*/)[0];// header comments stay on top
  fs.writeFileSync(path.join(OUT,'src/characters',k+'.js'),`'use strict';\n${cm}CHR7.push(${body.slice(cm.length)});\n`);files.push('characters/'+k+'.js')}
fs.writeFileSync(P,src.slice(0,st.start)+'const CHR7=[]; // the kits: one file per character (characters/<name>.js), pushed in this order'+src.slice(st.end));
const H=path.join(OUT,'index.html');let h=fs.readFileSync(H,'utf8');h=h.replace(`<script src="${rel}"></script>`,m=>m+'\n'+files.map(f=>`<script src="src/${f}"></script>`).join('\n'));fs.writeFileSync(H,h);
console.log(files.join(' '));
