import{d as k,r as d,j as e,L as u,S as E,e as F,f as L,g as U,h as a,I as N,B as V,M as S,C as W,a as G}from"./index-BJ7kTRrU.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=k("Sunrise",[["path",{d:"M12 2v8",key:"1q4o3n"}],["path",{d:"m4.93 10.93 1.41 1.41",key:"2a7f42"}],["path",{d:"M2 18h2",key:"j10viu"}],["path",{d:"M20 18h2",key:"wocana"}],["path",{d:"m19.07 10.93-1.41 1.41",key:"15zs5n"}],["path",{d:"M22 22H2",key:"19qnx5"}],["path",{d:"m8 6 4-4 4 4",key:"ybng9g"}],["path",{d:"M16 18a4 4 0 0 0-8 0",key:"1lzouq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=k("Sunset",[["path",{d:"M12 10V2",key:"16sf7g"}],["path",{d:"m4.93 10.93 1.41 1.41",key:"2a7f42"}],["path",{d:"M2 18h2",key:"j10viu"}],["path",{d:"M20 18h2",key:"wocana"}],["path",{d:"m19.07 10.93-1.41 1.41",key:"15zs5n"}],["path",{d:"M22 22H2",key:"19qnx5"}],["path",{d:"m16 6-4 4-4-4",key:"6wukr"}],["path",{d:"M16 18a4 4 0 0 0-8 0",key:"1lzouq"}]]),P=()=>{const[r,M]=d.useState("07:00"),[o,w]=d.useState(""),[s,C]=d.useState("adult"),[t,T]=d.useState(null),q={infant:50,toddler:60,child:70,teen:90,adult:90,senior:85},m={infant:{min:12,max:16},toddler:{min:11,max:14},child:{min:9,max:12},teen:{min:8,max:10},adult:{min:7,max:9},senior:{min:7,max:8}},D=()=>{if(!r)return;const[l,H]=r.split(":").map(Number),x=new Date;x.setHours(l,H,0,0);const h=q[s],p=5,n=new Date(x);n.setMinutes(n.getMinutes()-h*p);const I=n.getHours().toString().padStart(2,"0"),$=n.getMinutes().toString().padStart(2,"0"),z=`${I}:${$}`;let b="",f=p,c="";if(o){const[B,O]=o.split(":").map(Number),j=new Date;j.setHours(B,O,0,0);let i=x.getTime()-j.getTime();i<0&&(i+=24*60*60*1e3);const y=Math.floor(i/(60*60*1e3)),g=Math.floor(i%(60*60*1e3)/(60*1e3));b=`${y}h ${g}m`,f=Math.round(i/(h*60*1e3));const v=y+g/60,{min:R,max:A}=m[s];v<R?c="Insufficient":v>A?c="Excessive":c="Optimal"}T({bedtime:z,cycles:f,duration:b,quality:c})};return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx(u,{htmlFor:"age-group",className:"text-safebite-text",children:"Age Group"}),e.jsxs(E,{value:s,onValueChange:C,children:[e.jsx(F,{className:"bg-safebite-card-bg-alt border-safebite-card-bg-alt",children:e.jsx(L,{placeholder:"Select age group"})}),e.jsxs(U,{children:[e.jsx(a,{value:"infant",children:"Infant (0-1 years)"}),e.jsx(a,{value:"toddler",children:"Toddler (1-3 years)"}),e.jsx(a,{value:"child",children:"Child (3-12 years)"}),e.jsx(a,{value:"teen",children:"Teen (13-17 years)"}),e.jsx(a,{value:"adult",children:"Adult (18-64 years)"}),e.jsx(a,{value:"senior",children:"Senior (65+ years)"})]})]})]}),e.jsxs("div",{children:[e.jsxs(u,{htmlFor:"wake-up-time",className:"text-safebite-text",children:[e.jsx(Q,{className:"inline-block mr-2 h-4 w-4"}),"Wake-up Time"]}),e.jsx(N,{id:"wake-up-time",type:"time",value:r,onChange:l=>M(l.target.value),className:"bg-safebite-card-bg-alt border-safebite-card-bg-alt"})]}),e.jsxs("div",{children:[e.jsxs(u,{htmlFor:"sleep-time",className:"text-safebite-text",children:[e.jsx(J,{className:"inline-block mr-2 h-4 w-4"}),"Sleep Time (optional)"]}),e.jsx(N,{id:"sleep-time",type:"time",value:o,onChange:l=>w(l.target.value),className:"bg-safebite-card-bg-alt border-safebite-card-bg-alt",placeholder:"Optional"})]})]}),e.jsxs(V,{onClick:D,className:"w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80",children:[e.jsx(S,{className:"mr-2 h-4 w-4"}),"Calculate Optimal Sleep"]}),t&&e.jsx(W,{className:"mt-4 border-t-4 border-t-safebite-teal",children:e.jsx(G,{className:"pt-6",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center mb-1",children:[e.jsx(S,{className:"h-4 w-4 text-safebite-teal mr-2"}),e.jsx("span",{className:"font-semibold text-safebite-text",children:"Recommended Bedtime"})]}),e.jsx("p",{className:"text-xl font-bold text-safebite-teal",children:t.bedtime})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 mt-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-sm text-safebite-text-secondary",children:"Sleep Cycles"}),e.jsxs("div",{className:"font-semibold text-safebite-text",children:[t.cycles," cycles"]})]}),t.duration&&e.jsxs("div",{children:[e.jsx("div",{className:"text-sm text-safebite-text-secondary",children:"Sleep Duration"}),e.jsx("div",{className:"font-semibold text-safebite-text",children:t.duration})]}),t.quality&&e.jsxs("div",{className:"col-span-2",children:[e.jsx("div",{className:"text-sm text-safebite-text-secondary",children:"Sleep Quality"}),e.jsx("div",{className:`font-semibold ${t.quality==="Optimal"?"text-green-500":t.quality==="Insufficient"?"text-red-500":"text-yellow-500"}`,children:t.quality})]})]}),e.jsxs("div",{className:"mt-4 text-xs text-safebite-text-secondary",children:[e.jsxs("p",{children:["Recommended sleep for ",s==="adult"?"adults":s==="senior"?"seniors":s+"s",": ",m[s].min,"-",m[s].max," hours"]}),e.jsx("p",{className:"mt-1",children:"Note: This calculator provides general guidance based on average sleep cycles."})]})]})})})]})};export{P as default};
