'use strict';
// ================= État =================
let mode='menu',P=[],B=[],FX=[],TX=[],RINGS=[],LOG=[],KOFX=[],WAVES=[],LINES=[],invF=0,hitstop=0,shake=0,slow=0,zk=0,flashS=0,SCv=1,frame=0,item=null,itemT=0,debug=false,paused=false,winner=-1,winT=0;
let cams;DEFER(()=>{cams=Array.from({length:32},()=>({x:0,y:0}))});
const pname=p=>{if(typeof NET!=='undefined'&&NET&&NETNAMES&&NETNAMES[p.id])return NETNAMES[p.id];const f=!p.cpu&&profOf(p.id);return f?f.n:(p.cpu?'CPU ':'P')+(p.id+1)}; // nom du profil si assigné
function tgt(p){ // cible = adversaire vivant le plus proche (on garde l'ancienne si elle reste proche)
 let best=null,bd=1e9;for(const q of P)if(q!==p&&q.stocks>0&&q.state!=='dead'&&!ally(p,q)){const d=Math.hypot(q.x-p.x,q.y-p.y);if(q.fx.invis>0&&d>100)continue;if(d<bd){bd=d;best=q}}
 const c=p.tgt;if(c&&c!==best&&c.stocks>0&&c.state!=='dead'&&Math.hypot(c.x-p.x,c.y-p.y)<bd*1.25)best=c;
 return p.tgt=best||P.find(q=>q!==p&&q.stocks>0&&!ally(p,q))||P[(p.id+1)%P.length]}
const log=s=>{LOG.push(frame+': '+s);if(LOG.length>8)LOG.shift();if(debug)console.log('[SF]',s)};
let mapI,ultT,TSTOP,TSO,FRZ,HOLES,BUMPS,PHOTO,sMir,GFX,ENT,SLASH,JUDG,CLOUDS,ECHO,THR,fateLock,VIEW,CX,stI,itemsOn,COMP,fxLow,fxOff,perfLow,lowT,itemSel,infoP,WARP,loadSrc,KOB,ORBS,FAIRIES,ZONES,fixedMap,kx,ky,menuSel,hot,sDmg,sGraze,sKira,sBrk,chroma,bright,focusL,borderF,bgF,flashCol,CRACK,GZ,cssF,zblur,BIG;DEFER(()=>{mapI=0;ultT=0;TSTOP=0;TSO=-1;FRZ=null;HOLES=[];BUMPS=[];PHOTO=[];sMir=-99;GFX=[];ENT=[];SLASH=[];JUDG=[];CLOUDS=[];ECHO=[];THR=[];fateLock=0;VIEW=0;CX={};stI=2;itemsOn=true;COMP=(()=>{try{return localStorage.getItem('sf_comp')==='1'}catch(e){return false}})();fxLow=false;fxOff=(()=>{try{return localStorage.getItem('sf_fxoff')==='1'}catch(e){return false}})();perfLow=false;lowT=0;itemSel=0;infoP=0;WARP=0;loadSrc=null;KOB=[];ORBS=[];FAIRIES=[];ZONES=[];fixedMap=false;kx=0;ky=0;menuSel=0;hot=[];sDmg=-99;sGraze=-99;sKira=-99;sBrk=-99;chroma=0;bright=0;focusL=0;borderF={t:0};bgF={t:0};flashCol='#fff';CRACK=[];GZ=[];cssF='';zblur=0;BIG=[]}); // effets écran
function big(s,c,z=48,key){if(!key){const d=BIG.find(b=>b.s===s&&b.t>30);if(d)return}const o=key&&BIG.find(b=>b.key===key);if(o)Object.assign(o,{s,c,z,t:45});else{BIG.push({s,c,z,t:45,key});if(BIG.length>3)BIG.shift()}}
