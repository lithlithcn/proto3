'use strict';
// ---- lecteur de playlist YouTube (colonne gauche, DOM par-dessus le canvas ; la musique interne continue en silence)
var YTSB=0,YTBG=0;
DEFER(()=>{if(document.head&&document.body){const WKS=['https://sort-maker.arietbatiment5.workers.dev','https://sort-maker.lithlithcn.workers.dev'],WK=WKS[0],DEFL='PL31qxkG14rW2Kq0y1DgIap6eIa2YNQFQa';
const Y={on:1,list:DEFL,vid:'',shuf:0,rep:0,mini:0,v:[],c:0,view:0,ord:[],P:null,ready:0,st:-1,cv:0,op:35,bl:4,bgv:1,vm:100,share:0,res:null,busy:0,tip:0,act:0,bad:0,nodes:new Map,vol:-1,tsP:0,gest:0,lt:0,lid:''};
try{Object.assign(Y,JSON.parse(localStorage.getItem('sf_yt')||'{}'))}catch(e){}
if(Y.gone)Y.on=Y.won===0?0:1;Y.gone=0;Y.v=[];Y.nodes=new Map;Y.ord=[];Y.res=null;
const ySave=()=>{try{localStorage.setItem('sf_yt',JSON.stringify({miniS:Y.miniS,op:Y.op,bl:Y.bl,bgv:Y.bgv,vm:Y.vm,share:Y.share,gone:Y.gone,won:Y.won,on:Y.on,list:Y.list,vid:Y.vid,shuf:Y.shuf,rep:Y.rep,mini:Y.mini}))}catch(e){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const thumb=id=>'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg';
const fmt=s=>{s=Math.max(0,s|0);const h=s/3600|0,m=(s%3600)/60|0,x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
const ico={
 mag:'<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
 x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 up:'<svg viewBox="0 0 64 56"><path d="M32 4L60 34H44V52H20V34H4Z"/></svg>',
 prev:'<svg viewBox="0 0 24 24"><path d="M7 5v14M19 5L9 12l10 7z"/></svg>',
 next:'<svg viewBox="0 0 24 24"><path d="M17 5v14M5 5l10 7-10 7z"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg>',
 pause:'<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
 shuf:'<svg viewBox="0 0 24 24"><path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/></svg>',
 rep:'<svg viewBox="0 0 24 24"><path d="M4 12V9a3 3 0 013-3h12l-3-3M20 12v3a3 3 0 01-3 3H5l3 3"/><text x="12" y="14.5">1</text></svg>',
 pow:'<svg viewBox="0 0 24 24"><path d="M12 3v8M7 6a7 7 0 1010 0"/></svg>',
 ej:'<svg viewBox="0 0 24 24"><path d="M5 15h14L12 6zM5 19h14"/></svg>',
 vol:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
 mute:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
 gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
 tab:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
 note:k=>'<svg viewBox="0 0 24 24"><defs><linearGradient id="ytg'+k+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4f9a"/><stop offset=".35" stop-color="#ffd23a"/><stop offset=".65" stop-color="#3affb0"/><stop offset="1" stop-color="#29d4ff"/></linearGradient></defs><path fill="url(#ytg'+k+')" d="M9 18.5a3 3 0 11-2-2.83V5l12-2v12.5a3 3 0 11-2-2.83V7.2L9 8.6z"/></svg>'};
const st=document.createElement('style');st.textContent=`
#yt{--sbw:300px;position:fixed;left:0;top:0;bottom:0;width:var(--sbw);z-index:6;font:600 13px 'Segoe UI',system-ui,sans-serif;color:#fff;transform:translateX(0);transition:transform .65s cubic-bezier(.2,.95,.25,1),visibility 0s;user-select:none;-webkit-user-select:none}
#yt.hide{transform:translateX(calc(-100% - 30px));visibility:hidden;transition:transform .5s cubic-bezier(.6,0,.8,.4),visibility 0s .5s}
#yt.mini{transform:translateX(-100%)}
#yt .gl{position:absolute;inset:0;overflow:hidden;backdrop-filter:blur(18px) saturate(1.5) brightness(.72);-webkit-backdrop-filter:blur(18px) saturate(1.5) brightness(.72);background:linear-gradient(170deg,color-mix(in srgb,var(--c1) 55%,rgba(10,6,24,.7)),color-mix(in srgb,var(--c2) 40%,rgba(10,6,24,.75)) 55%,rgba(8,6,20,.8));border-right:1px solid rgba(255,255,255,.14);box-shadow:inset -40px 0 70px -50px var(--c1),12px 0 40px rgba(0,0,0,.45)}
#yt .gl:before,#yt .gl:after{content:'';position:absolute;width:140%;height:45%;left:-20%;border-radius:50%;filter:blur(40px);opacity:.45;animation:ytb 14s ease-in-out infinite alternate}
#yt .gl:before{top:-10%;background:radial-gradient(var(--c1),transparent 70%)}
#yt .gl:after{bottom:-12%;background:radial-gradient(var(--c2),transparent 70%);animation-duration:18s;animation-direction:alternate-reverse}
@keyframes ytb{0%{transform:translate(-12%,0) scale(1)}100%{transform:translate(12%,18%) scale(1.25)}}
#yt .sr{position:absolute;left:12px;right:58px;top:14px;height:40px;border-radius:22px;background:rgba(6,8,22,.82);border:1.5px solid rgba(140,150,255,.3);display:flex;align-items:center;gap:6px;padding:0 10px;box-sizing:border-box;transition:border-color .3s,box-shadow .3s}
#yt .sr:focus-within{border-color:var(--c1);box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 30%,transparent),0 0 22px var(--c1)}
#yt svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex:none}
#yt input{flex:1;min-width:0;background:none;border:0;outline:0;color:#fff;font:600 14px 'Segoe UI',system-ui,sans-serif}
#yt input::placeholder{color:rgba(255,255,255,.45)}
#yt button{background:none;border:0;padding:0;color:#fff;cursor:pointer;display:grid;place-items:center;transition:transform .2s cubic-bezier(.3,1.6,.5,1),background .2s,opacity .2s}
#yt button:hover{transform:scale(1.15)}#yt button:active{transform:scale(.9)}
#yt .go{position:absolute;right:12px;top:14px;width:40px;height:40px;border-radius:50%;background:rgba(6,8,22,.82);border:1.5px solid rgba(140,150,255,.3)}
#yt .ls{position:absolute;left:0;right:0;top:64px;bottom:84px;overflow:visible;clip-path:inset(-4px -200vw -4px -40px)}
#yt .c{position:absolute;left:0;top:0;border-radius:10px;overflow:hidden;background:#15121f center/cover;box-shadow:0 6px 18px rgba(0,0,0,.55);cursor:pointer;transition:transform .6s cubic-bezier(.2,1.25,.35,1),width .6s cubic-bezier(.2,1.25,.35,1),height .6s cubic-bezier(.2,1.25,.35,1),opacity .4s,filter .3s,box-shadow .4s;will-change:transform}
#yt .c img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .5s,transform .6s}
#yt .c img.ok{opacity:1}#yt .c.cur img{transform:scale(var(--zm,1))}
#yt .c:not(.cur):hover{filter:brightness(1.25)}#yt .c:not(.cur):hover img{transform:scale(1.06)}
#yt .c.far{filter:brightness(.6) saturate(.7)}
#yt .c.bad{filter:grayscale(1) brightness(.45)}
#yt .c:before{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.12) 50%,transparent 70%) -100% 0/200% 100%;animation:yts 1.2s linear infinite}
#yt .c.ld:before{display:none}
@keyframes yts{to{background-position:100% 0}}
#yt .c .d{position:absolute;right:6px;bottom:6px;padding:2px 7px;border-radius:7px;background:rgba(0,0,0,.72);font:800 12px 'Segoe UI',system-ui,sans-serif;letter-spacing:.3px;z-index:2}
#yt .c.cur{border-radius:12px;box-shadow:0 0 0 3px var(--c1),0 0 0 5px rgba(255,255,255,.35),0 0 34px 4px var(--c1);z-index:3;cursor:default;animation:ytp 2.4s ease-in-out infinite}
#yt .c.cur .d{font-size:15px;padding:3px 9px;right:9px;bottom:9px}
@keyframes ytp{50%{box-shadow:0 0 0 3px color-mix(in srgb,var(--c1) 70%,#fff),0 0 0 6px rgba(255,255,255,.5),0 0 50px 10px var(--c1)}}
#ytvw{position:fixed;left:-400px;top:0;width:320px;height:180px;overflow:hidden;pointer-events:none;opacity:0;z-index:7;border-radius:12px;transition:opacity 1.2s,filter .5s}
#ytvw.on{opacity:1}#ytvw.bg{z-index:-1;border-radius:0}#ytvw.off{opacity:0!important}
#ytvw.mv{transition:opacity 1.2s,filter .5s,left .85s cubic-bezier(.65,0,.25,1),top .85s cubic-bezier(.65,0,.25,1),width .85s cubic-bezier(.65,0,.25,1),height .85s cubic-bezier(.65,0,.25,1),border-radius .85s}
#ytvw iframe{width:100%;height:100%;border:0;transform:scale(var(--zm,1));transition:transform .8s}#ytvw.bg iframe{transform:scale(calc(var(--zm,1)*1.08))}
#yt.mini .gl{box-shadow:none}#yt.mini .gl:before,#yt.mini .gl:after{display:none}#yt.mini .ls,#yt.mini .cb,#yt.mini .sr,#yt.mini .go,#yt.mini .pop{opacity:0;pointer-events:none}
#yt .ls,#yt .cb,#yt .sr,#yt .go{transition:opacity .4s}
#yt .ar{position:absolute;left:0;top:0;width:var(--as,84px);height:calc(var(--as,84px)*.88);z-index:5;filter:drop-shadow(0 3px 0 rgba(0,0,0,.55)) drop-shadow(0 0 10px rgba(0,0,0,.6));transition:transform .6s cubic-bezier(.2,1.25,.35,1),opacity .3s}
#yt .ar svg{width:100%;height:100%;fill:#fff;stroke:none}
#yt .ar:hover{transform:var(--t) scale(1.15)!important}
#yt .ar.dn svg{transform:rotate(180deg)}
#yt .ar.up{animation:yta 1.6s ease-in-out infinite}#yt .ar.dn{animation:yta 1.6s ease-in-out infinite reverse}
@keyframes yta{50%{margin-top:-5px}}
#yt .tip{position:absolute;left:0;top:0;z-index:2;pointer-events:none;border-radius:14px;padding:16px 26px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:6px;background:linear-gradient(100deg,rgba(26,14,48,.9),rgba(22,16,44,.8));box-shadow:0 10px 40px rgba(0,0,0,.5);opacity:0;transform-origin:0 50%;transition:opacity .45s,transform .6s cubic-bezier(.2,1.2,.3,1),clip-path .6s cubic-bezier(.2,.9,.3,1);clip-path:inset(0 100% 0 0 round 14px)}
#yt .tip.on{opacity:1;clip-path:inset(0 0 0 0 round 14px)}
#yt .tip:before{content:'';position:absolute;inset:0;border-radius:14px;padding:2px;background:conic-gradient(from var(--ya),#ff4f9a,#ffd23a,#3affb0,#29d4ff,#9b6bff,#ff4f9a);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:ytr 4s linear infinite}
@property --ya{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes ytr{to{--ya:360deg}}
#yt .tip .t{font:600 clamp(16px,1.65vw,30px)/1.2 'Segoe UI','Yu Gothic UI','Meiryo',system-ui,sans-serif;text-shadow:0 2px 8px rgba(0,0,0,.6);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#yt .tip .a{font:500 clamp(13px,1.2vw,22px) 'Segoe UI',system-ui,sans-serif;opacity:.78}
#yt .tip .m{font:500 clamp(12px,1.05vw,19px) 'Segoe UI',system-ui,sans-serif;opacity:.62}
#yt .tip .t,#yt .tip .a,#yt .tip .m{transition:transform .5s cubic-bezier(.2,1.2,.3,1),opacity .4s}
#yt .tip.sw .t,#yt .tip.sw .a,#yt .tip.sw .m{transform:translateX(-24px);opacity:0;transition:none}
#yt .cb{position:absolute;left:10px;right:10px;bottom:10px;height:66px;border-radius:16px;background:rgba(6,8,22,.7);border:1px solid rgba(255,255,255,.1);box-sizing:border-box;padding:8px 12px 0}
#yt .pr{display:flex;align-items:center;gap:8px;font:700 11px 'Segoe UI',system-ui,sans-serif;opacity:.85}
#yt .bar{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.18);position:relative;cursor:pointer}
#yt .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:linear-gradient(90deg,var(--c1),var(--c2));box-shadow:0 0 8px var(--c1)}
#yt .bar i:after{content:'';position:absolute;right:-5px;top:-4px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 0 8px #ff4f9a}
#yt .bt{display:flex;justify-content:space-between;align-items:center;margin-top:6px;padding:0 2px}
#yt .bt button{width:30px;height:30px;border-radius:50%;opacity:.8}#yt .bt button:hover{opacity:1;background:rgba(255,255,255,.08)}
#yt .bt .pp{width:36px;height:36px;background:linear-gradient(135deg,var(--c1),var(--c2));opacity:1;box-shadow:0 0 16px var(--c1)}
#yt .bt .pp svg{fill:#fff}
#yt .bt .on{opacity:1;color:#ff8fc4}#yt .bt .on svg{stroke:#ff8fc4}#yt .bt .rp text{font:800 7px sans-serif;fill:currentColor;stroke:none;text-anchor:middle}
#yt .bt .pw.off svg{stroke:#ff5566}
#yt .tb{position:absolute;left:100%;top:14px;width:26px;height:44px;border-radius:0 12px 12px 0;background:rgba(14,8,30,.8);border:1px solid rgba(255,255,255,.14);border-left:0;backdrop-filter:blur(10px)}
#yt.mini .tb{width:40px;height:52px}#yt.mini .tb svg{transform:rotate(180deg)}
#yt .tb .n{display:none}#yt.mini .tb .n{display:block;position:absolute;width:15px;height:15px;left:3px;bottom:3px}
#yt .tst{position:absolute;left:12px;right:12px;top:62px;z-index:9;padding:7px 11px;border-radius:10px;background:rgba(255,79,154,.18);border:1px solid rgba(255,79,154,.5);font:600 12px 'Segoe UI',system-ui,sans-serif;opacity:0;transform:translateY(-8px);transition:.35s;pointer-events:none}
#yt .tst.on{opacity:1;transform:none}
#yt .rs{position:absolute;left:0;right:0;top:64px;bottom:84px;overflow-y:auto;padding:4px 12px 20px;box-sizing:border-box;display:none;scrollbar-width:thin;scrollbar-color:#ff4f9a55 transparent}
#yt.res .rs{display:block}#yt.res .ls{display:none}
#yt .rh{display:flex;justify-content:space-between;align-items:center;margin:4px 2px 10px;font:800 12px 'Segoe UI',system-ui,sans-serif;opacity:.8;letter-spacing:.5px;text-transform:uppercase}
#yt .ri{position:relative;border-radius:10px;overflow:hidden;margin-bottom:12px;aspect-ratio:16/9;cursor:pointer;background:#15121f;box-shadow:0 6px 16px rgba(0,0,0,.5);animation:yti .5s cubic-bezier(.2,1.2,.3,1) both;transition:transform .3s cubic-bezier(.3,1.5,.5,1),box-shadow .3s}
#yt .ri:hover{transform:scale(1.03);box-shadow:0 0 0 2px #ff4f9a,0 0 24px rgba(255,79,154,.6)}
#yt .ri img{width:100%;height:100%;object-fit:cover}
#yt .ri div{position:absolute;left:0;right:0;bottom:0;padding:22px 10px 8px;background:linear-gradient(transparent,rgba(0,0,0,.85));font:700 13px/1.25 'Segoe UI',system-ui,sans-serif}
#yt .ri small{display:block;font-weight:500;opacity:.7;margin-top:2px}
@keyframes yti{from{opacity:0;transform:translateX(-30px)}}
#ytnow{position:fixed;left:14px;bottom:10px;z-index:6;display:flex;align-items:center;gap:8px;max-width:46vw;padding:4px 12px 4px 6px;border-radius:14px;font:600 13px 'Segoe UI','Yu Gothic UI',system-ui,sans-serif;color:#fff;text-shadow:0 1px 4px #000;pointer-events:none;transition:opacity .6s,transform .6s cubic-bezier(.2,1.2,.3,1),left .65s cubic-bezier(.2,.95,.25,1),bottom .4s}
#ytnow.off{opacity:0;transform:translateY(14px)}
#ytnow.dim{opacity:.5}
#ytnow svg{width:18px;height:18px;flex:none;animation:yth 3s linear infinite}
@keyframes yth{to{filter:hue-rotate(360deg)}}
#ytnow .eq{display:flex;align-items:flex-end;gap:2px;height:13px;flex:none}
#ytnow .eq i{width:3px;height:30%;border-radius:1px;background:linear-gradient(#ffd23a,#ff4f9a)}
#ytnow.pl .eq i{animation:yte .9s ease-in-out infinite alternate}#ytnow .eq i:nth-child(2){animation-delay:-.3s!important}#ytnow .eq i:nth-child(3){animation-delay:-.6s!important}
@keyframes yte{0%{height:20%}100%{height:100%}}
#ytnow .tx{overflow:hidden;white-space:nowrap;mask-image:linear-gradient(90deg,#000 88%,transparent);-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent)}
#ytnow .tx span{display:inline-block}
#ytnow .tx.mq span{animation:ytm var(--md,12s) linear infinite}
@keyframes ytm{0%,12%{transform:translateX(0)}88%,100%{transform:translateX(var(--mx))}}
#ytnow.sw .tx span{animation:ytn .6s cubic-bezier(.2,1.2,.3,1)}
@keyframes ytn{from{opacity:0;transform:translateY(12px);filter:blur(6px)}}
#yt .rv{margin-bottom:14px;cursor:pointer;animation:yti .5s cubic-bezier(.2,1.2,.3,1) both;border-radius:12px;padding:4px;transition:background .25s}
#yt .rv:hover{background:rgba(255,255,255,.07)}
#yt .rv .th{position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#15121f;box-shadow:0 6px 16px rgba(0,0,0,.5);margin-bottom:7px;transition:box-shadow .3s}
#yt .rv:hover .th{box-shadow:0 0 0 2px var(--c1),0 0 22px var(--c1)}
#yt .rv .th img{width:100%;height:100%;object-fit:cover;transition:transform .5s}#yt .rv:hover .th img{transform:scale(1.06)}
#yt .rv .d{position:absolute;right:6px;bottom:6px;padding:1px 6px;border-radius:5px;background:rgba(0,0,0,.8);font:800 11px 'Segoe UI',system-ui,sans-serif}#yt .rv .d.lv{background:#e22}
#yt .rv .qn{position:absolute;right:6px;top:6px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.7);font:700 17px sans-serif;opacity:0}#yt .rv:hover .qn{opacity:1}
#yt .rv b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 13px/1.3 'Segoe UI','Yu Gothic UI',system-ui,sans-serif;padding:0 2px}
#yt .rv small,#yt .rc small{display:block;font:500 11.5px 'Segoe UI',system-ui,sans-serif;opacity:.62;padding:1px 2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#yt .rc{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding:10px;border-radius:14px;cursor:pointer;background:rgba(255,255,255,.05);animation:yti .5s cubic-bezier(.2,1.2,.3,1) both;transition:background .25s,box-shadow .25s}
#yt .rc:hover{background:rgba(255,255,255,.1);box-shadow:0 0 0 1px var(--c1)}
#yt .rc img,#yt .rc i{width:64px;height:64px;border-radius:50%;object-fit:cover;flex:none;background:#333;box-shadow:0 0 0 2px rgba(255,255,255,.2)}
#yt .rc div{min-width:0}#yt .rc b{font:700 14px 'Segoe UI',system-ui,sans-serif}#yt .rc .hl{opacity:1;color:var(--c1);font-weight:700;margin-top:3px}
#yt .ri .pl{position:absolute;right:0;top:0;bottom:0;width:38%;display:grid;place-items:center;background:rgba(0,0,0,.7);font:800 11px 'Segoe UI',system-ui,sans-serif;letter-spacing:.5px}
#yt .mo{width:100%;padding:10px;border-radius:20px;background:rgba(255,255,255,.08)!important;font:700 13px 'Segoe UI',system-ui,sans-serif;margin:4px 0 10px}
#yt .sk{height:150px;border-radius:12px;margin-bottom:14px;background:linear-gradient(100deg,rgba(255,255,255,.04) 30%,rgba(255,255,255,.12) 50%,rgba(255,255,255,.04) 70%) -100% 0/200% 100%;animation:yts 1.2s linear infinite}
@property --c1{syntax:'<color>';initial-value:#ff2d7a;inherits:true}@property --c2{syntax:'<color>';initial-value:#7b3dff;inherits:true}
#yt{transition:transform .65s cubic-bezier(.2,.95,.25,1),visibility 0s,--c1 1.4s,--c2 1.4s}
#yt.hide{transition:transform .5s cubic-bezier(.6,0,.8,.4),visibility 0s .5s,--c1 1.4s,--c2 1.4s}
#ytnow svg{filter:drop-shadow(0 0 6px var(--c1,#ff4f9a))}
#yt .pop{position:absolute;left:10px;right:10px;bottom:84px;z-index:8;border-radius:16px;padding:12px 14px;background:rgba(10,8,26,.9);border:1px solid color-mix(in srgb,var(--c1) 50%,transparent);box-shadow:0 12px 40px rgba(0,0,0,.6),0 0 24px color-mix(in srgb,var(--c1) 35%,transparent);opacity:0;transform:translateY(12px) scale(.96);transform-origin:50% 100%;pointer-events:none;transition:opacity .3s,transform .4s cubic-bezier(.2,1.3,.3,1)}
#yt .pop.on{opacity:1;transform:none;pointer-events:auto}#yt .pop>div{display:none}#yt .pop.v1 .pv1,#yt .pop.v2 .pv2{display:block}
#yt .ph{display:flex;justify-content:space-between;font:800 11px 'Segoe UI',system-ui,sans-serif;letter-spacing:.8px;opacity:.75;margin-bottom:6px}#yt .ph.s{margin-top:12px}#yt .ph span{color:var(--c1);opacity:1}
#yt input[type=range]{width:100%;accent-color:var(--c1);height:18px;cursor:pointer}
#yt .tg{display:flex;align-items:center;gap:10px;margin:4px 0 2px;font:600 12.5px 'Segoe UI',system-ui,sans-serif;cursor:pointer}#yt .tg input{display:none}
#yt .tg i{width:34px;height:19px;border-radius:10px;background:rgba(255,255,255,.18);position:relative;flex:none;transition:background .3s}#yt .tg i:after{content:'';position:absolute;left:2px;top:2px;width:15px;height:15px;border-radius:50%;background:#fff;transition:transform .3s cubic-bezier(.3,1.5,.5,1)}
#yt .tg input:checked+i{background:linear-gradient(90deg,var(--c1),var(--c2))}#yt .tg input:checked+i:after{transform:translateX(15px)}#yt .sh2{margin-top:14px;display:none}#yt.host .sh2{display:flex}
#ytan{position:fixed;left:50%;bottom:calc(7vh + 22px);z-index:9;display:flex;align-items:center;gap:14px;max-width:min(640px,88vw);padding:10px 22px 10px 10px;border-radius:18px;color:#fff;pointer-events:none;overflow:hidden;
 background:linear-gradient(110deg,color-mix(in srgb,var(--c1,#ff4f9a) 40%,rgba(10,8,24,.9)),rgba(10,8,24,.92) 55%,color-mix(in srgb,var(--c2,#7b3dff) 35%,rgba(10,8,24,.9)));box-shadow:0 14px 44px rgba(0,0,0,.6),0 0 0 1.5px color-mix(in srgb,var(--c1,#ff4f9a) 75%,transparent),0 0 36px color-mix(in srgb,var(--c1,#ff4f9a) 45%,transparent);
 opacity:0;transform:translate(-50%,40px) scale(.88);filter:blur(8px);transition:opacity .45s,transform .7s cubic-bezier(.2,1.35,.3,1),filter .5s}
#ytan.on{opacity:1;transform:translate(-50%,0) scale(1);filter:none}#ytan.gm{bottom:auto;top:110px;transform-origin:50% 0}
#ytan .th{width:150px;aspect-ratio:16/9;border-radius:11px;overflow:hidden;flex:none;box-shadow:0 6px 18px rgba(0,0,0,.6);position:relative}
#ytan .th img{width:100%;height:100%;object-fit:cover}#ytan.on .th img{animation:ytk 4s ease-out both}@keyframes ytk{from{transform:scale(1.35)}to{transform:scale(var(--zm,1))}}
#ytan .th:after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%) -120% 0/250% 100% no-repeat}#ytan.on .th:after{animation:ytw 1.1s .35s ease-out both}@keyframes ytw{to{background-position:120% 0}}
#ytan .tx{min-width:0;display:flex;flex-direction:column;gap:3px}
#ytan small{font:800 11px 'Segoe UI',system-ui,sans-serif;letter-spacing:2.5px;color:color-mix(in srgb,var(--c1,#ff4f9a) 55%,#fff)}
#ytan b{font:700 19px/1.2 'Segoe UI','Yu Gothic UI',system-ui,sans-serif;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 2px 8px rgba(0,0,0,.5)}
#ytan span{font:500 13.5px 'Segoe UI',system-ui,sans-serif;opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ytan.on small,#ytan.on b,#ytan.on span{animation:ytn .6s cubic-bezier(.2,1.2,.3,1) both}#ytan.on b{animation-delay:.08s}#ytan.on span{animation-delay:.16s}
#ytan .pb{position:absolute;left:0;bottom:0;height:3px;width:100%;background:linear-gradient(90deg,var(--c1,#ff4f9a),var(--c2,#7b3dff));transform-origin:0 50%;transform:scaleX(0)}#ytan.on .pb{animation:ytq 3.4s linear both}@keyframes ytq{from{transform:scaleX(1)}to{transform:scaleX(0)}}
#yt.sm .sr{height:32px;top:8px}#yt.sm .go{width:32px;height:32px;top:8px}#yt.sm input{font-size:16px}#yt.sm .ls,#yt.sm .rs{top:48px;bottom:70px}#yt.sm .cb{height:56px;padding-top:5px;bottom:6px}#yt.sm .bt{margin-top:2px}#yt.sm .bt button{width:24px;height:24px}#yt.sm .bt .pp{width:30px;height:30px}#yt.sm .bt svg{width:16px;height:16px}#yt.sm .pop{bottom:68px}
#yt.sm .tip{display:none}#yt.sm .tb{top:8px}#ytan.sm{transform-origin:50% 0}@media (max-height:520px){#ytan{bottom:auto;top:10px;padding:6px 14px 6px 6px;gap:10px}#ytan .th{width:96px}#ytan b{font-size:14px}#ytan span{font-size:11px}#ytnow{font-size:11px}}
#ytsk{position:fixed;left:50%;top:14%;z-index:9;transform:translate(-50%,-6px);padding:8px 16px;border-radius:14px;background:rgba(10,8,24,.78);color:#fff;font:800 18px 'Segoe UI',system-ui,sans-serif;text-align:center;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;box-shadow:0 0 0 1.5px color-mix(in srgb,var(--c1,#ff4f9a) 70%,transparent)}#ytsk.on{opacity:1;transform:translate(-50%,0)}#ytsk small{display:block;font:600 12px 'Segoe UI',system-ui,sans-serif;opacity:.75}
@media (prefers-reduced-motion:reduce){#yt *,#ytnow *{animation:none!important}}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='yt';R.className='hide';
R.innerHTML=`<div class="gl"></div><div class="sr">${ico.mag}<input placeholder="Playlist name or link" spellcheck="false"><button class="cl" title="Clear">${ico.x}</button></div><button class="go" title="Search">${ico.mag}</button>
<div class="ls"><button class="ar up" title="Previous track">${ico.up}</button><button class="ar dn" title="Next track">${ico.up}</button><div class="tip"><div class="t"></div><div class="a"></div><div class="m"></div></div></div>
<div class="rs"></div><div class="tst"></div>
<div class="cb"><div class="pr"><span class="t0">0:00</span><div class="bar"><i></i></div><span class="t1">0:00</span></div><div class="bt"><button class="pw" title="YouTube music on / off (off = game music)">${ico.pow}</button><button class="sh" title="Shuffle">${ico.shuf}</button><button class="pv" title="Previous">${ico.prev}</button><button class="pp" title="Play / pause">${ico.pause}</button><button class="nx" title="Next">${ico.next}</button><button class="rp" title="Repeat one">${ico.rep}</button><button class="vl" title="Video volume">${ico.vol}</button><button class="og" title="Video options">${ico.gear}</button></div></div>
<div class="pop"><div class="pv1"><div class="ph">VIDEO VOLUME<span class="vv"></span></div><input type="range" class="vr" min="0" max="100"></div>
<div class="pv2"><div class="ph">VIDEO OPTIONS</div><label class="tg"><input type="checkbox" class="bgc"><i></i>Video in the menu background</label><div class="ph s">OPACITY<span class="ov"></span></div><input type="range" class="orr" min="0" max="100"><div class="ph s">BLUR<span class="bv"></span></div><input type="range" class="brr" min="0" max="24"><label class="tg sh2"><input type="checkbox" class="shc"><i></i>Play my music for everyone (online host)</label></div></div>
<button class="tb" title="Show / hide the playlist">${ico.tab}<span class="n">${ico.note('a')}</span></button>`;
const N=document.createElement('div');N.id='ytnow';N.className='off';N.innerHTML=ico.note('b')+'<div class="eq"><i></i><i></i><i></i></div><div class="tx"><span></span></div>';
const VW=document.createElement('div');VW.id='ytvw';VW.innerHTML='<div id="ytpl"></div>';const AN=document.createElement('div');AN.id='ytan';AN.innerHTML='<div class="th"><img alt=""></div><div class="tx"><small></small><b></b><span></span></div><i class="pb"></i>';
document.body.style.background='transparent';document.body.appendChild(VW);document.body.appendChild(R);document.body.appendChild(N);document.body.appendChild(AN);
const $=s=>R.querySelector(s),LS=$('.ls'),TIP=$('.tip'),UP=$('.ar.up'),DN=$('.ar.dn'),INP=$('input'),RS=$('.rs'),TST=$('.tst'),BAR=$('.bar i'),T0=$('.t0'),T1=$('.t1'),NT=N.querySelector('.tx'),NS=NT.querySelector('span');
// le DOM du lecteur ne doit pas déclencher les clics / touches du jeu
const gest=()=>{try{unlock()}catch(e){}if(MAUD&&MAUD.pend&&MCUR){MAUD.pend=0;MAUD.play().catch(()=>{})}if(!Y.gest){Y.gest=1;if(Y.on&&Y.ready&&Y.st!==1)yPlay(Y.c)}};
for(const ev of['mousedown','mouseup','pointerdown','pointerup','click','dblclick','touchstart','touchend','touchmove','mousemove','contextmenu'])R.addEventListener(ev,e=>e.stopPropagation());
R.addEventListener('wheel',e=>{e.stopPropagation();if(Y.res||!Y.v.length)return;e.preventDefault();const n=Y.v.length,lo=Y.cv-Y.c;Y.view=Math.round(Y.view+(e.deltaY>0?1:-1));if(n<6)Y.view=clamp(Y.view,lo,lo+n-1);Y.act=performance.now();yLay()},{passive:false});
addEventListener('pointerdown',e=>{gest();if(!R.contains(e.target)){const ae=document.activeElement;if(ae&&R.contains(ae))ae.blur();R.querySelector('.pop').classList.remove('on')}},true);addEventListener('keydown',gest,true);
const kStop=e=>{const ae=document.activeElement;if(!ae||!R.contains(ae)||ae.tagName!=='INPUT')return;if(ae!==INP){if(e.type==='keydown'&&e.key==='Escape')ae.blur();e.stopImmediatePropagation();return}e.stopImmediatePropagation();if(e.type==='keydown'){if(e.key==='Enter'){e.preventDefault();ySubmit()}else if(e.key==='Escape'){e.preventDefault();INP.blur()}}};
addEventListener('keydown',kStop,true);addEventListener('keyup',kStop,true);
const toast=(s,ms)=>{TST.textContent=s;TST.classList.toggle('on',!!s);clearTimeout(Y.tt);if(s&&ms)Y.tt=setTimeout(()=>TST.classList.remove('on'),ms)};
// ---- données
async function wkGet(path){let err;for(const w of WKS){const c=new AbortController,t=setTimeout(()=>c.abort(),15000);try{const r=await fetch(w+path,{signal:c.signal});const j=await r.json().catch(()=>null);if(!j)throw new Error('http '+r.status);if(j.error==='not_found'&&w!==WKS[WKS.length-1])throw new Error('not_found');return j}catch(e){err=e;console.warn('[YT] worker',w,e.message)}finally{clearTimeout(t)}}throw err}
const cacheK=l=>'sf_ytc_'+l;
function setList(L,keep){if(keep&&L.length===Y.v.length&&L.every((v,i)=>v.id===Y.v[i].id)){L.forEach((v,i)=>{Object.assign(Y.v[i],v);const n=[...Y.nodes].find(([p])=>md(p)===i),d=n&&n[1].querySelector('.d');if(d&&v.duration){d.textContent='♪ '+v.duration;d.style.display=''}});yInfo();return}const prev=Y.v[Y.c];Y.v=L;let i=keep&&prev?L.findIndex(v=>v.id===prev.id):-1;if(i<0&&Y.vid)i=L.findIndex(v=>v.id===Y.vid);Y.c=Math.max(0,i);Y.cv=Y.c;Y.view=Y.c;mkOrd();for(const[k,n]of Y.nodes){n.remove()}Y.nodes.clear();yLay();yInfo()}
function mkOrd(){const n=Y.v.length;Y.ord=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.random()*(i+1)|0;[Y.ord[i],Y.ord[j]]=[Y.ord[j],Y.ord[i]]}}
async function yLoad(list,auto){if(!list)return;const same=list===Y.list&&Y.v.length;Y.list=list;ySave();let C=null;try{C=JSON.parse(localStorage.getItem(cacheK(list))||'null')}catch(e){}
 if(C&&C.length&&!same){setList(C);if(Y.ready&&auto!==0)yPlay(Y.c,1)}
 Y.busy=1;toast('Loading playlist…');const out=[],seen=new Set;let cont=null,vd=null;
 try{for(let pg=0;pg<60;pg++){const q=new URLSearchParams({id:list});if(cont)q.set('continuation',cont);if(vd)q.set('visitorData',vd);const d=await wkGet('/playlist?'+q);
   if(d.error&&!(d.videos||[]).length){if(out.length)break;throw new Error(d.error)}let add=0;for(const v of d.videos||[])if(v&&v.id&&!seen.has(v.id)){seen.add(v.id);const o=C&&C.find(x=>x.id===v.id);out.push(Object.assign({},o||{},v));add++}
   toast('Loading playlist… '+out.length+' tracks');if(!C&&pg===0&&out.length){setList(out.slice());if(Y.ready&&auto!==0)yPlay(Y.c,1)}vd=d.visitorData||vd;if(d.complete||!d.continuation||(!add&&d.continuation===cont))break;cont=d.continuation}
  if(!out.length)throw new Error('empty playlist');setList(out,1);try{localStorage.setItem(cacheK(list),JSON.stringify(out.map(v=>({id:v.id,title:v.title,author:v.author,duration:v.duration,views:v.views,age:v.age}))))}catch(e){}
  toast(out.length+' tracks',1800);if(Y.ready&&auto!==0&&Y.lid!==(Y.v[Y.c]||{}).id)yPlay(Y.c,1)}
 catch(e){toast(Y.v.length?'Could not refresh the playlist ('+e.message+')':'Could not load the playlist: '+e.message,5000);console.warn('[YT] playlist',e)}Y.busy=0}
const parseL=s=>{s=s.trim();let m=s.match(/[?&]list=([A-Za-z0-9_-]{10,64})/);if(m)return{list:m[1]};m=s.match(/^(PL|OL|RD|UU|LL|FL)[A-Za-z0-9_-]{8,62}$/);if(m)return{list:s};m=s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);if(m)return{vid:m[1]};return null};
async function ySubmit(more){const s=more?Y.q:INP.value.trim();if(!s)return;const p=more?null:parseL(s);INP.blur();
 if(p&&p.list){INP.value='';showRes(null);Y.vid='';yLoad(p.list);return}
 if(p&&p.vid){INP.value='';showRes(null);yInsert({id:p.vid,title:''},1);return}
 if(!more){Y.q=s;Y.sc=null;showRes([]);RS.innerHTML='<div class="rh"><span>Searching “'+esc(s)+'”…</span></div>'+'<div class="sk"></div>'.repeat(4)}else{const b=RS.querySelector('.mo');if(b)b.textContent='Loading…'}
 try{const d=await wkGet('/search?'+(more&&Y.sc?'continuation='+encodeURIComponent(Y.sc)+'&q='+encodeURIComponent(s):'q='+encodeURIComponent(s)));if(d.error==='not_found')throw new Error('the worker must be updated for search — paste a link instead');if(d.error&&!(d.items||d.playlists||[]).length)throw new Error(d.error);
  const it=d.items||(d.playlists||[]).map(x=>Object.assign({type:'playlist'},x));Y.sc=d.continuation||null;showRes((more?Y.res||[]:[]).concat(it.filter(x=>!(more&&(Y.res||[]).some(y=>y.id===x.id)))),s)}
 catch(e){RS.innerHTML='<div class="rh"><span>Search failed</span><button class="bk" title="Back">'+ico.x+'</button></div><div style="opacity:.75;font-weight:500;line-height:1.4">'+esc(e.message)+'</div>';console.warn('[YT] search',e)}}
const vMeta=v=>[v.author,[v.views&&vViews(v.views)+' views',vAge(v.age)].filter(Boolean).join(' · ')];
function showRes(L,q){Y.res=L;R.classList.toggle('res',!!L);if(!L||!L.length&&q===undefined)return;const st0=RS.querySelector('.ri')?RS.scrollTop:0,old=RS.querySelectorAll('.ri,.rv,.rc').length;
 RS.innerHTML='<div class="rh"><span>'+(L.length?'Results · '+esc(q):'Nothing found')+'</span><button class="bk" title="Back">'+ico.x+'</button></div>'+L.map((p,i)=>{const dl=' style="animation-delay:'+(Math.max(0,i-old)*.035)+'s"';
  if(p.type==='video'){const m=vMeta(p);return'<div class="rv" data-i="'+i+'"'+dl+'><div class="th"><img loading="lazy" src="'+thumb(p.id)+'">'+(p.duration?'<span class="d">'+esc(p.duration)+'</span>':p.live?'<span class="d lv">LIVE</span>':'')+'<button class="qn" title="Play next">＋</button></div><b>'+esc(p.title||'')+'</b><small>'+esc(m[0]||'')+'</small><small>'+esc(m[1])+'</small></div>'}
  if(p.type==='channel')return'<div class="rc" data-i="'+i+'"'+dl+'>'+(p.thumb?'<img loading="lazy" src="'+esc(p.thumb)+'">':'<i></i>')+'<div><b>'+esc(p.title||'')+'</b><small>'+esc([p.author,p.count].filter(Boolean).join(' · '))+'</small><small class="hl">▶ Play all videos</small></div></div>';
  return'<div class="ri" data-i="'+i+'"'+dl+'>'+(p.thumb?'<img loading="lazy" src="'+esc(p.thumb)+'">':'')+'<span class="pl">≡ PLAYLIST</span><div>'+esc(p.title||p.id)+'<small>'+esc([p.author,p.count&&(/\D/.test(p.count)?p.count:p.count+' videos')].filter(Boolean).join(' · '))+'</small></div></div>'}).join('')+(Y.sc?'<button class="mo">Show more</button>':'');RS.scrollTop=st0}
function yInsert(v,play){const n=Y.v.length;if(!n){setList([v]);yPlay(0);return}const at=Y.c+1;Y.v.splice(at,0,Object.assign({},v));mkOrd();for(const[,nd]of Y.nodes)nd.remove();Y.nodes.clear();if(play)yPlay(at,0,Y.cv+1);else{yLay();toast('Added after the current track',1600)}}
RS.addEventListener('click',e=>{if(e.target.closest('.bk')){showRes(null);return}if(e.target.closest('.mo')){ySubmit(1);return}const it=e.target.closest('.ri,.rv,.rc');if(!it||!Y.res)return;const p=Y.res[+it.dataset.i];
 if(p.type==='video'){const v={id:p.id,title:p.title,author:p.author,duration:p.duration,views:p.views,age:p.age};if(e.target.closest('.qn')){yInsert(v,0);e.target.closest('.qn').textContent='✓';return}if(lockd()){toast('🔒 The host controls the music',1800);return}showRes(null);yInsert(v,1);return}
 if(lockd()){toast('🔒 The host controls the music',1800);return}const l=p.type==='channel'?p.uploads:p.id;if(!l){toast('No videos for this channel',2000);return}showRes(null);INP.value='';Y.vid='';Y.v=[];yLoad(l)});
// ---- lecture
const md=i=>{const n=Y.v.length;return((i%n)+n)%n};
function yPlay(i,auto,vp){const n=Y.v.length;if(!n)return;i=md(i);if(vp===undefined){let d=md(i-Y.c);if(d>n/2)d-=n;vp=Y.cv+d}Y.c=i;Y.cv=vp;Y.view=vp;const v=Y.v[Y.c];Y.vid=v.id;R.style.setProperty('--zm',1);VW.style.setProperty('--zm',1);yColor(v.id);ySave();yLay();yInfo(1);
 if(!Y.ready||!Y.on)return;Y.lid=v.id;try{if(auto&&!Y.gest)Y.P.cueVideoById(v.id);else{Y.P.loadVideoById({videoId:v.id,startSeconds:v.st0||0});delete v.st0}}catch(e){console.warn('[YT] play',e)}}
function yStep(d,user,ann){const n=Y.v.length;if(!n)return;if(Y.rep&&!user){yPlay(Y.c);return}
 if(Y.shuf){let k=Y.ord.indexOf(Y.c);yPlay(Y.ord[(k+d+n)%n])}else yPlay(Y.c+d);if(ann||!user&&!(mode==='menu'&&!R.className.includes('mini')))yAnn()}
function yAnn(lab){const v=Y.v[Y.c];if(!v||!Y.on)return;AN.querySelector('img').src=thumb(v.id);AN.querySelector('small').textContent=lab||'♪  NOW PLAYING';AN.querySelector('b').textContent=v.title||'…';AN.querySelector('span').textContent=[v.author,v.duration].filter(Boolean).join('  ·  ');
 AN.classList.toggle('gm',mode==='game');AN.classList.remove('on');void AN.offsetWidth;AN.classList.add('on');clearTimeout(Y.at);Y.at=setTimeout(()=>AN.classList.remove('on'),3400)}
const vAge=s=>s?s.replace(/^Streamed\s+/i,''):'',vViews=s=>s?s.replace(/\s*views?$/i,''):'';
function yInfo(sw){const v=Y.v[Y.c];if(!v)return;let dd=null;try{dd=Y.ready&&Y.P.getVideoData&&Y.P.getVideoData()}catch(e){}if(dd&&dd.video_id===v.id){if(!v.title&&dd.title)v.title=dd.title;if(!v.author&&dd.author)v.author=dd.author}
 const t=v.title||'…';TIP.querySelector('.t').textContent=t;TIP.querySelector('.a').textContent=v.author||'';TIP.querySelector('.m').textContent=[v.views&&'▷ '+vViews(v.views),vAge(v.age)].filter(Boolean).join('   ·   ');
 if(sw){TIP.classList.add('sw');N.classList.add('sw');void TIP.offsetWidth;TIP.classList.remove('sw');setTimeout(()=>N.classList.remove('sw'),650);Y.tip=performance.now();Y.nowT=performance.now()}
 if(NS.textContent!==t){NS.textContent=t;requestAnimationFrame(()=>{const ov=NS.offsetWidth-NT.clientWidth;NT.classList.toggle('mq',ov>4);NT.style.setProperty('--mx',-(ov+20)+'px');NT.style.setProperty('--md',(6+ov/40)+'s')})}
 const n=Y.nodes.get(Y.cv);const db=n&&n.querySelector('.d');if(db&&v.duration){db.textContent='♪ '+v.duration;db.style.display=''}}
// ---- couleur dominante de la miniature -> dégradé de la colonne ; détection des bandes noires
const CC={};function yColor(id){if(CC[id]){applyC(CC[id]);return}const go=(src,fb)=>{const im=new Image;im.crossOrigin='anonymous';im.onload=()=>{try{CC[id]=anaC(im);if(Y.vid===id)applyC(CC[id])}catch(e){if(fb)fb()}};im.onerror=()=>fb&&fb();im.src=src};go(thumb(id),()=>go(WK+'/thumb?id='+id))}
function anaC(im){const w=48,h=27,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,w,h);const D=x.getImageData(0,0,w,h).data;
 const col=c=>{let s=0;for(let y=0;y<h;y++){const k=(y*w+c)*4;s+=D[k]+D[k+1]+D[k+2]}return s/h/3};let l=0;while(l<w/3&&col(l)<22)l++;let r=0;while(r<w/3&&col(w-1-r)<22)r++;const bar=Math.min(l,r)/w;
 const B=new Map;for(let k=0;k<D.length;k+=4){const R0=D[k],G0=D[k+1],B0=D[k+2],mx=Math.max(R0,G0,B0),mn=Math.min(R0,G0,B0),sat=mx?(mx-mn)/mx:0,lum=(mx+mn)/2;if(lum<28||lum>238)continue;
  let hh=0;if(mx!==mn){const dd=mx-mn;hh=mx===R0?((G0-B0)/dd+6)%6:mx===G0?(B0-R0)/dd+2:(R0-G0)/dd+4}const key=sat<.18?-1:Math.round(hh*4)%24,wgt=.25+sat*sat*3,e=B.get(key)||{n:0,r:0,g:0,b:0};e.n+=wgt;e.r+=R0*wgt;e.g+=G0*wgt;e.b+=B0*wgt;B.set(key,e)}
 const S=[...B].sort((a,b)=>b[1].n-a[1].n).map(([k,e])=>({k,c:[e.r/e.n,e.g/e.n,e.b/e.n]}));
 const boost=c=>{const m=Math.max(...c,1),f=Math.min(1.6,235/m);return'rgb('+c.map(v=>Math.round(Math.min(255,v*f))).join(',')+')'};
 const a=S[0]||{k:0,c:[255,45,122]},b=S.find(s=>s!==a&&Math.min(Math.abs(s.k-a.k),24-Math.abs(s.k-a.k))>=3)||S[1]||{c:a.c.map(v=>v*.55)};
 return{c1:boost(a.c),c2:boost(b.c),zm:bar>.06?+(1/(1-2*bar)).toFixed(3):1}}
function applyC(o){for(const e of[R,N,AN])e.style.setProperty('--c1',o.c1),e.style.setProperty('--c2',o.c2);R.style.setProperty('--zm',o.zm);VW.style.setProperty('--zm',o.zm);AN.style.setProperty('--zm',o.zm)}
// ---- carrousel
function mkNode(p){const i=md(p),v=Y.v[i],n=document.createElement('div');n.className='c';n.innerHTML='<img alt=""><span class="d"'+(v.duration?'':' style="display:none"')+'>♪ '+esc(v.duration||'')+'</span>';const im=n.firstChild;im.onload=()=>{im.classList.add('ok');n.classList.add('ld')};im.onerror=()=>n.classList.add('ld');im.src=thumb(v.id);
 n.onclick=()=>{if(p!==Y.cv)LK(()=>yPlay(i,0,p))()};n.onmouseenter=()=>{if(p===Y.cv)Y.tip=performance.now()};n.style.opacity=0;LS.appendChild(n);return n}
function yLay(){const sbw=R.offsetWidth||300,lh=LS.clientHeight||400,cy=lh*.5,cw=Math.round(sbw*.66),ch=Math.round(cw*9/16),bw=sbw-14,bh=Math.round(bw*9/16),step=ch+16,foc=Math.abs(Y.view-Y.cv)<.01,ex=foc?(bh-ch)/2+6:0,n=Y.v.length,vi=Math.round(Y.view),keep=new Set,lo=n<6?Y.cv-Y.c:-1e9,hi=n<6?lo+n-1:1e9;Y.foc=foc;
 for(let i=Math.max(lo,vi-7);i<=Math.min(hi,vi+7);i++){keep.add(i);const k=i-Y.view,cur=i===Y.cv,big=cur&&foc,w=big?bw:cw,h=big?bh:ch,y=cy+k*step+Math.sign(k)*ex-h/2,x=big?7:14;let nd=Y.nodes.get(i);const nw=!nd;if(nw){nd=mkNode(i);Y.nodes.set(i,nd);nd.style.transition='none';nd.style.transform='translate('+(x-40)+'px,'+y+'px)'}
  const far=Math.abs(k)>2.5;nd.classList.toggle('cur',cur);nd.classList.toggle('far',far&&!cur);nd.classList.toggle('bad',!!Y.v[md(i)].bad);
  const ap=()=>{nd.style.transition='';nd.style.width=w+'px';nd.style.height=h+'px';nd.style.transform='translate('+x+'px,'+y+'px)';nd.style.opacity=Math.abs(k)>5.5?0:1};if(nw){nd.style.width=w+'px';nd.style.height=h+'px';requestAnimationFrame(()=>requestAnimationFrame(ap))}else ap();
  if(cur){Y.curN=nd;const ty=cy-bh/2;TIP.style.transform='translate('+(x+w-4)+'px,'+ty+'px)'+(foc?'':' scale(.96)');TIP.style.height=bh+'px';TIP.style.width='min(54vw,'+Math.max(320,innerWidth-sbw-60)+'px)'}}
 for(const[i,nd]of Y.nodes)if(!keep.has(i)){Y.nodes.delete(i);nd.style.opacity=0;setTimeout(()=>nd.remove(),400)}
 const as=Math.round(clamp(cw*.38,40,84)),ax=14+cw/2-as/2;R.style.setProperty("--as",as+"px");const sh=foc&&n>1;UP.style.setProperty('--t','translate('+ax+'px,'+(cy-bh/2-as*.93)+'px)');DN.style.setProperty('--t','translate('+ax+'px,'+(cy+bh/2+4)+'px)');UP.style.transform=UP.style.getPropertyValue('--t');DN.style.transform=DN.style.getPropertyValue('--t');UP.style.opacity=DN.style.opacity=sh?1:0;UP.style.pointerEvents=DN.style.pointerEvents=sh?'':'none'}
const lockd=()=>Y.hc&&performance.now()-Y.hc<9000&&!(typeof ONL!=='undefined'&&ONL&&ONL.id===0),LK=f=>(...a)=>{if(lockd()){toast('🔒 The host controls the music',1800);return}return f(...a)};
UP.onclick=LK(()=>yStep(-1,1));DN.onclick=LK(()=>yStep(1,1));
$('.pv').onclick=LK(()=>yStep(-1,1));$('.nx').onclick=LK(()=>yStep(1,1));
$('.pp').onclick=()=>{if(lockd()){toast('🔒 The host controls the music',1800);return}if(!Y.ready)return;if(!Y.on){setOn(1);return}if(Y.st===1)Y.P.pauseVideo();else if(Y.st===5||Y.st===-1)yPlay(Y.c);else Y.P.playVideo()};
$('.sh').onclick=()=>{Y.shuf^=1;if(Y.shuf)mkOrd();ySave();btns()};$('.rp').onclick=()=>{Y.rep^=1;ySave();btns()};
$('.pw').onclick=()=>setOn(Y.on?0:1);
function yGone(g){Y.gone=g;ySave();if(g){Y.won=Y.on;setOn(0);toast('')}else setOn(Y.won===0?0:1)}
$('.tb').onclick=()=>{if(mode==='menu'){if(Y.sm)Y.miniS=Y.miniS===0?1:0;else Y.mini^=1;ySave()}else Y.pin=!Y.pin};
const POP=$('.pop'),VR=$('.vr'),ORR=$('.orr'),BRR=$('.brr');
function popSync(){VR.value=Y.vm;$('.vv').textContent=Y.vm+'%';ORR.value=Y.op;$('.ov').textContent=Y.op+'%';BRR.value=Y.bl;$('.bv').textContent=Y.bl+' px';$('.bgc').checked=!!Y.bgv;$('.shc').checked=!!Y.share;$('.vl').innerHTML=Y.vm?ico.vol:ico.mute}
const popT=k=>{const o=POP.classList.contains('on')&&POP.classList.contains(k);POP.className='pop'+(o?'':' on '+k);popSync()};$('.vl').onclick=()=>popT('v1');$('.og').onclick=()=>popT('v2');
$('.vl').addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();Y.vm=clamp(Y.vm+(e.deltaY<0?5:-5),0,100);Y.vol=-1;ySave();popSync()},{passive:false});
VR.oninput=()=>{Y.vm=+VR.value;Y.vol=-1;ySave();popSync()};ORR.oninput=()=>{if(lockd()){toast('🔒 The host sets the video',1800);popSync();return}Y.op=+ORR.value;ySave();popSync();Y.lb=0};BRR.oninput=()=>{if(lockd()){toast('🔒 The host sets the video',1800);popSync();return}Y.bl=+BRR.value;ySave();popSync();Y.lb=0};
$('.bgc').onchange=e=>{Y.bgv=e.target.checked?1:0;ySave()};$('.shc').onchange=e=>{Y.share=e.target.checked?1:0;ySave();Y.lb=0;if(!Y.share&&typeof ONL!=='undefined'&&ONL&&ONL.id===0)try{onlBcast({t:'ym',off:1})}catch(x){}};popSync();
$('.go').onclick=()=>ySubmit();$('.cl').onclick=()=>{INP.value='';showRes(null);INP.focus()};
$('.bar').onclick=e=>{if(!Y.ready)return;const r=e.currentTarget.getBoundingClientRect(),d=Y.P.getDuration&&Y.P.getDuration();if(d)Y.P.seekTo(clamp((e.clientX-r.left)/r.width,0,1)*d,true)};
function setOn(o){Y.on=o;ySave();btns();if(!Y.ready)return;if(o)yPlay(Y.c);else{try{Y.P.pauseVideo()}catch(e){}}if(MAUD)MAUD.volume=0}
function btns(){$('.sh').classList.toggle('on',!!Y.shuf);$('.rp').classList.toggle('on',!!Y.rep);$('.pw').classList.toggle('off',!Y.on);$('.pp').innerHTML=Y.st===1&&Y.on?ico.pause:ico.play;N.classList.toggle('pl',Y.st===1&&Y.on);VW.classList.toggle('on',Y.st===1&&Y.on)}
btns();
// ---- API YouTube
window.YTAPIq=()=>{Y.P=new YT.Player('ytpl',{width:'100%',height:'100%',playerVars:{autoplay:0,controls:0,disablekb:1,fs:0,iv_load_policy:3,modestbranding:1,playsinline:1,rel:0,origin:location.origin},events:{
 onReady:()=>{Y.ready=1;Y.vol=-1;if(Y.v.length&&Y.on)yPlay(Y.c,1)},
 onStateChange:e=>{Y.st=e.data;if(e.data===1){Y.bad=0;const v=Y.v[Y.c];if(v){v.bad=0;const d=Y.P.getDuration();if(d&&!v.duration)v.duration=fmt(d)}yInfo()}if(e.data===0&&!(Y.hc&&performance.now()-Y.hc<9000))yStep(1);if(e.data===1||e.data===2)Y.lb=0;btns()},
 onError:e=>{console.warn('[YT] error',e.data,Y.v[Y.c]&&Y.v[Y.c].id);const v=Y.v[Y.c];if(v)v.bad=1;if(++Y.bad<Math.min(15,Y.v.length))setTimeout(()=>yStep(1),400);else toast('These videos cannot be played here',4000)}}})};
{const o=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(o)try{o()}catch(e){}window.YTAPIq()}}
const sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';sc.onerror=()=>toast('YouTube is unreachable',5000);document.head.appendChild(sc);
// ---- volume : même courbe que la musique interne, qui reste muette tant que YouTube joue
{const M0=musTick;musTick=()=>{M0();if(!Y.on||!Y.ready||!Y.v.length||Y.bad>=Math.min(15,Y.v.length))return;
 // musiques spéciales du jeu (résultats, dernière vie) : elles coupent la vidéo, puis la vidéo reprend
 const spc=(MSCR==='results'||MSCR==='last')&&MCUR&&MAUD&&!MAUD.paused;if(spc){if(Y.st===1||Y.st===3){Y.spP=1;try{Y.P.pauseVideo()}catch(e){}}return}else if(Y.spP){Y.spP=0;try{Y.P.playVideo()}catch(e){}}if(MAUD)MAUD.volume=0;const kd=(performance.now()-KOMT)/1000,ke=kd<0?0:kd<.12?kd/.12:kd<1.1?1:kd<2.1?1-(kd-1.1):0;const v=Math.round(clamp(VOLS.music*VOLS.master*ENDK*(1-.45*ke)*(1-.75*MDUCK),0,1)*Y.vm);
 if(v!==Y.vol){Y.vol=v;try{Y.P.setVolume(v)}catch(e){}}const pr=ke>.35?.75:1;if(pr!==Y.pr){Y.pr=pr;try{Y.P.setPlaybackRate(pr)}catch(e){}}
 if(mode==='game'&&TSTOP>0){if(Y.st===1){Y.tsP=1;try{Y.P.pauseVideo()}catch(e){}}}else if(Y.tsP){Y.tsP=0;try{Y.P.playVideo()}catch(e){}}}}
// ---- placement selon l'écran
let lw=0;const loop=()=>{requestAnimationFrame(loop);const m=mode,hub=m==='menu'&&!Y.gone,vis=!Y.gone&&(hub||m==='sub'||m==='items'||m==='info'||m==='online'||m==='css'||m==='csel'||m==='binds'||m==='game'&&winner>=0&&winT>=100),sm=innerHeight<520||innerWidth<760,sbw=Math.round(sm?clamp(innerWidth*.3,170,240):clamp(innerWidth*.205,210,370));if(sm!==Y.sm){Y.sm=sm;R.classList.toggle('sm',sm);}
 if(sbw!==lw){lw=sbw;R.style.setProperty('--sbw',sbw+'px');requestAnimationFrame(yLay)}
 if(m!==Y.lm){Y.lm=m;Y.pin=0}const cls=!vis?'hide':(hub?(Y.sm?Y.miniS!==0:Y.mini):!Y.pin)?'mini':'',want=cls+(Y.res?' res':'');if(R.className!==want){const op=!cls&&R.className.split(' ')[0]!=='';R.className=want;if(op)requestAnimationFrame(yLay)}
 YTSB+=((hub&&!cls?sbw:0)-YTSB)*.18;if(Math.abs(YTSB)<.5)YTSB=0;
 const now=performance.now();if(!cls&&!Y.res&&Y.view!==Y.cv&&now-Y.act>4000){Y.view=Y.cv;yLay()}
 TIP.classList.toggle('on',!cls&&hub&&!Y.res&&Y.foc&&!!Y.v.length&&now-Y.tip<7000);
 const show=!Y.gone&&Y.on&&Y.v.length&&m!=='maker'&&(Y.st===1||Y.st===3||Y.st===2),ing=m==='game';N.classList.toggle('off',!show);N.classList.toggle('dim',ing&&now-(Y.nowT||0)>6000);
 const top=!hub&&!ing&&m!=='title',pos=top?'auto|14px|8px|auto':(hub&&!cls?sbw+16:14)+'px|auto|auto|'+(hub?Math.round(innerHeight*.07)+8:10)+'px';if(N._p!==pos){const q=pos.split('|');N._p=pos;N.style.left=q[0];N.style.right=q[1];N.style.top=q[2];N.style.bottom=q[3]}
 const hostN=typeof ONL!=='undefined'&&ONL&&ONL.id===0;R.classList.toggle('host',!!hostN);
 const mv=m==='title'||m==='maker'||!Y.on||Y.gone?'off':Y.bgv?'bg':!cls&&hub&&Y.curN?'card':'off';if(mv!==Y.vmo){if(Y.vmo&&mv!=='off'&&Y.vmo!=='off'){VW.classList.add('mv');clearTimeout(Y.mvt);Y.mvt=setTimeout(()=>VW.classList.remove('mv'),900)}Y.vmo=mv;VW.classList.toggle('bg',mv==='bg');VW.classList.toggle('off',mv==='off')}
 const LO=lockd()&&Y.hop!=null,eop=LO?Y.hop:Y.op,ebl=LO?Y.hbl:Y.bl;if((m!=='game'||winner>=0)&&m!=='css'&&typeof pads==='function'&&Y.ready&&Y.on){const g=pads()[0],ax=g?g.axes[2]||0:0,d=ax>.5?1:ax<-.5?-1:0;
  // second stick = flèches de YouTube : 5 s par appui ; maintenu 1 s -> répète toutes les 100 ms
  if(d!==Y.skd){Y.skd=d;if(d){Y.skT=now+1000;ySeek(d)}}else if(d&&now>=Y.skT){Y.skT=now+100;ySeek(d)}}
 let rc='';if(mv==='bg'){const iw=innerWidth,ih=innerHeight,w=Math.max(iw,ih*16/9),h=w*9/16;rc=((iw-w)/2|0)+'|'+((ih-h)/2|0)+'|'+(w|0)+'|'+(h|0)}else if(mv==='card'){const b=Y.curN.getBoundingClientRect();rc=(b.left|0)+'|'+(b.top|0)+'|'+(b.width|0)+'|'+(b.height|0)}
 if(rc&&rc!==Y.rc){Y.rc=rc;const q=rc.split('|');VW.style.left=q[0]+'px';VW.style.top=q[1]+'px';VW.style.width=q[2]+'px';VW.style.height=q[3]+'px'}const inv=m==='game'&&(typeof TSTOP!=='undefined'&&TSTOP>0||CVINV>0),fl=[mv==='bg'&&ebl?'blur('+ebl+'px)':'',m==='game'&&typeof cssF!=='undefined'&&cssF?cssF.replace(/invert\(1\)/,''):'',inv?'invert(1)':''].join(' ').replace(/\s+/g,' ').trim()||'none';if(VW.style.filter!==fl)VW.style.filter=fl;
 YTBG+=((mv==='bg'&&(Y.st===1||Y.st===2||Y.st===3)?eop/100:0)-YTBG)*.06;if(YTBG<.003)YTBG=0;
 if(hostN&&Y.share&&Y.ready&&Y.on&&Y.v.length&&(now-(Y.lb||0)>3000)){Y.lb=now;const v=Y.v[Y.c];try{onlBcast({t:'ym',op:Y.op,bl:Y.bl,v:v.id,s:Y.P.getCurrentTime()||0,p:Y.st===1?1:0,ti:v.title||'',au:v.author||'',du:v.duration||''})}catch(e){}}
 if(now-Y.lt<250)return;Y.lt=now;if(Y.ready&&Y.P.getCurrentTime&&!cls){const d=Y.P.getDuration()||0,t=Y.P.getCurrentTime()||0;T0.textContent=fmt(t);T1.textContent=fmt(d);BAR.style.width=(d?t/d*100:0)+'%'}};
requestAnimationFrame(loop);
addEventListener('resize',()=>requestAnimationFrame(yLay));
// petite API pour le débogage / les autres écrans
const SK=document.createElement('div');SK.id='ytsk';document.body.appendChild(SK);
function ySeek(d){if(lockd()){toast('🔒 The host controls the music',1500);return}try{const du=Y.P.getDuration()||0,t=clamp((Y.P.getCurrentTime()||0)+d*5,0,Math.max(0,du-1));Y.P.seekTo(t,true);Y.lb=0;SK.innerHTML=(d<0?'⏪':'⏩')+' 5 s<small>'+fmt(t)+' / '+fmt(du)+'</small>';SK.classList.remove('on');void SK.offsetWidth;SK.classList.add('on');clearTimeout(Y.skh);Y.skh=setTimeout(()=>SK.classList.remove('on'),700)}catch(e){}}
function yHost(m){if(m.off){Y.hc=0;Y.hop=Y.hbl=null;toast('The host stopped sharing music',2500);return}Y.hc=performance.now();if(m.op!=null){Y.hop=+m.op;Y.hbl=+m.bl}if(!Y.on||!Y.ready||!m.v)return;const cur=Y.v[Y.c];
 if(!cur||cur.id!==m.v){yInsert({id:m.v,title:m.ti,author:m.au,duration:m.du,st0:(m.s||0)+.4,host:1},1);yAnn('♪  HOST MUSIC');return}
 let t=0;try{t=Y.P.getCurrentTime()||0}catch(e){}if(m.p&&Math.abs(t-m.s)>2.5)try{Y.P.seekTo(m.s+.3,true)}catch(e){}if(m.p&&Y.st!==1&&Y.st!==3)try{Y.P.playVideo()}catch(e){}if(!m.p&&Y.st===1)try{Y.P.pauseVideo()}catch(e){}}
if(typeof onlMsg==='function'){const O=onlMsg;onlMsg=(m,k)=>{if(m&&m.t==='ym'){if(!(ONL&&ONL.id===0))yHost(m);return true}return O(m,k)}}
window.YTP={locked:()=>lockd(),toast,Y,load:yLoad,play:yPlay,step:yStep,gone:yGone,ann:yAnn,host:yHost,pp:()=>$('.pp').onclick()};
yLoad(Y.list||DEFL);if(Y.vid)yColor(Y.vid)}});
// manette / clavier dans le hub : L1/R1 (Q/E) = morceau précédent/suivant, Select = lecture/pause
DEFER(()=>{{const N0=nav;nav=ev=>{if(mode==='menu'&&window.YTP&&!YTP.Y.gone&&YTP.Y.v.length){if(ev==='tabL'||ev==='tabR'){if(YTP.locked()){YTP.toast('🔒 The host controls the music',1800);return}YTP.step(ev==='tabL'?-1:1,1,1);sfx('se_select00',.5);return}}return N0(ev)}}});
DEFER(()=>{{const P0=padEv;padEv=k=>{if(k==='sel'&&mode==='menu'&&window.YTP&&!YTP.Y.gone&&YTP.Y.v.length){YTP.pp();return}P0(k)}}});
