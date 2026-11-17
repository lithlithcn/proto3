// One-shot: makes the split files load like the original single script. In one script every function exists from the start and the other
// top-level statements run in text order. Split files load one by one, so: top-level statements that execute code (calls, wrappers,
// assignments, reads of other names) are queued with DEFER(...) and run in the original order by core/boot.js, once every file is loaded.
// Pure declarations (literals only) stay as they are. Declarations that need code become `let X;DEFER(()=>{X=...})`.
const fs=require('fs'),path=require('path'),acorn=require('acorn'),walk=require('acorn-walk');
const OUT=process.argv[2],html=fs.readFileSync(path.join(OUT,'index.html'),'utf8');
const list=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(f=>!f.includes('vendor/')&&!f.includes('data/sfx'));
const BUILTIN=new Set(['Math','Object','Array','JSON','Number','String','Infinity','NaN','undefined','Symbol','Set','Map','Boolean','Date','RegExp','Error','window','globalThis']);
let nDef=0,nKeep=0;
for(const f of list){const p=path.join(OUT,f);let src=fs.readFileSync(p,'utf8');
  const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:false});
  const edits=[];// [start,end,text]
  for(const st of ast.body){
    if(st.type==='FunctionDeclaration'||(st.type==='ExpressionStatement'&&st.directive)||st.type==='EmptyStatement')continue;
    let impure=false;
    const check=n=>walk.recursive(n,null,{Function(){},ArrowFunctionExpression(){},FunctionExpression(){},Class(){impure=true},
      CallExpression(){impure=true},NewExpression(){impure=true},TaggedTemplateExpression(){impure=true},AssignmentExpression(){impure=true},UpdateExpression(){impure=true},
      Identifier(x){if(!BUILTIN.has(x.name))impure=true},MemberExpression(x,s,c){c(x.object,s);if(x.computed)c(x.property,s)},
      Property(x,s,c){if(x.computed)c(x.key,s);c(x.value,s)}});
    if(st.type==='VariableDeclaration'){for(const d of st.declarations){if(d.id.type!=='Identifier')impure=true;if(d.init)check(d.init)}
      if(!impure){nKeep++;continue}
      const names=[],asg=[];for(const d of st.declarations){walk.simple(d.id,{Identifier(x){names.push(x.name)}},{...walk.base,Property(x,s,c){c(x.value,s)},AssignmentPattern(x,s,c){c(x.left,s)}});
        if(d.init){const t=src.slice(d.id.start,d.id.end)+'='+src.slice(d.init.start,d.init.end);asg.push(d.id.type==='Identifier'?t:'('+t+')')}}
      edits.push([st.start,st.end,`let ${names.join(',')};DEFER(()=>{${asg.join(';')}});`]);nDef++;continue}
    if(st.type==='ClassDeclaration'){edits.push([st.start,st.end,`let ${st.id.name};DEFER(()=>{${st.id.name}=${src.slice(st.start,st.end)}});`]);nDef++;continue}
    edits.push([st.start,st.end,`DEFER(()=>{${src.slice(st.start,st.end)}});`]);nDef++}
  for(const [a,b,t] of edits.sort((x,y)=>y[0]-x[0]))src=src.slice(0,a)+t+src.slice(b);
  fs.writeFileSync(p,src)}
// queue + runner
const head=path.join(OUT,'src/core/head.js');fs.writeFileSync(head,fs.readFileSync(head,'utf8').replace("'use strict';\n","'use strict';\n/** Load-time statements of every file, run in the original order by core/boot.js once all files are loaded (see docs/ARCHITECTURE.md). */\nconst DEFQ=[];function DEFER(f){DEFQ.push(f)}\n"));
fs.writeFileSync(path.join(OUT,'src/core/boot.js'),"'use strict';\n/** Runs the queued load-time statements (DEFER) in load order: the game starts here. */\nfor(const f of DEFQ)f();DEFQ.length=0;\n");
fs.writeFileSync(path.join(OUT,'index.html'),html.replace(/(<script src="src\/[^"]+"><\/script>)(?![\s\S]*<script src="src\/(?!vendor))/,'$1\n<script src="src/core/boot.js"></script>'));
console.log('deferred',nDef,'kept',nKeep);
