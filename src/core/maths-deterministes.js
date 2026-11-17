'use strict';
// ===== maths déterministes : mêmes résultats sur tous les navigateurs (obligatoire pour le jeu en ligne) =====
DEFER(()=>{{const PI=3.141592653589793,TP=6.283185307179586,HP=1.5707963267948966,QP=0.7853981633974483,LN2=0.6931471805599453,sq=Math.sqrt;
 const S=[1,-1/6,1/120,-1/5040,1/362880,-1/39916800,1/6227020800,-1/1307674368000,1/355687428096000,-1/121645100408832000];
 const sin=x=>{if(x!==x||x===Infinity||x===-Infinity)return NaN;let r=x-Math.round(x/TP)*TP;if(r>HP)r=PI-r;else if(r<-HP)r=-PI-r;const z=r*r;let p=S[9];for(let i=8;i>=0;i--)p=p*z+S[i];return r*p};
 const at1=x=>{const z=x*x;let p=0;for(let k=27;k>=1;k-=2)p=p*z+((k>>1)&1?-1:1)/k;return x*p};
 const atan=x=>{if(x!==x)return NaN;const n=x<0;if(n)x=-x;let r;if(x>1)r=HP-atn(1/x);else r=atn(x);return n?-r:r};
 const atn=x=>x>0.4142135623730950?QP+at1((x-1)/(x+1)):at1(x);
 const atan2=(y,x)=>{if(y!==y||x!==x)return NaN;if(x>0)return atan(y/x);if(x<0)return y>=0?atan(y/x)+PI:atan(y/x)-PI;return y>0?HP:y<0?-HP:0};
 const hypot=(a,b,...c)=>{if(!c.length)return sq(a*a+(b||0)*(b||0));let t=a*a+b*b;for(const v of c)t+=v*v;return sq(t)};
 const ln=a=>{if(!(a>0))return a===0?-Infinity:NaN;let e=0;while(a>=2){a/=2;e++}while(a<1){a*=2;e--}const z=(a-1)/(a+1),z2=z*z;let p=0;for(let k=41;k>=1;k-=2)p=p*z2+1/k;return e*LN2+2*z*p};
 const ex=x=>{if(x!==x)return NaN;if(x>709)return Infinity;if(x<-745)return 0;const k=Math.round(x/LN2),r=x-k*LN2;let p=1;for(let i=22;i>=1;i--)p=1+p*r/i;let m=p,K=k;while(K>0){m*=2;K--}while(K<0){m/=2;K++}return m};
 const pow=(a,b)=>{if(b===0)return 1;if(Number.isInteger(b)&&Math.abs(b)<=64){let r=1,x=a,n=Math.abs(b);while(n){if(n&1)r*=x;x*=x;n>>=1}return b<0?1/r:r}if(a<0)return NaN;if(a===0)return b>0?0:Infinity;return ex(b*ln(a))};
 Object.assign(Math,{sin,cos:x=>sin(x+HP),atan,atan2,hypot,pow,exp:ex,log:ln})}});
