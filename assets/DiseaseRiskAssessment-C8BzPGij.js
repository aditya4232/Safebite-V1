import{d as V,r as y,j as e,l as N,m as w,n as h,o as k,L as R,R as E,i as O,B as C,C as Y,a as $,P as F,T as I,c as B,b as P}from"./index-BJ7kTRrU.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=V("Microscope",[["path",{d:"M6 18h8",key:"1borvv"}],["path",{d:"M3 22h18",key:"8prr45"}],["path",{d:"M14 22a7 7 0 1 0 0-14h-1",key:"1jwaiy"}],["path",{d:"M9 14h2",key:"197e7h"}],["path",{d:"M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z",key:"1bmzmy"}],["path",{d:"M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3",key:"1drr47"}]]),z=()=>{const[c,M]=y.useState({}),[u,T]=y.useState("heart"),[f,p]=y.useState(null),x={heart:{title:"Heart Disease",questions:[{id:"heart_family",text:"Do you have a family history of heart disease?",options:[{value:"no",label:"No",score:0},{value:"distant",label:"Yes, distant relatives",score:1},{value:"immediate",label:"Yes, immediate family",score:2}]},{id:"heart_smoking",text:"Do you smoke?",options:[{value:"never",label:"Never",score:0},{value:"former",label:"Former smoker",score:1},{value:"current",label:"Current smoker",score:2}]},{id:"heart_exercise",text:"How often do you exercise?",options:[{value:"regular",label:"Regularly (3+ times/week)",score:0},{value:"occasional",label:"Occasionally (1-2 times/week)",score:1},{value:"rarely",label:"Rarely or never",score:2}]},{id:"heart_diet",text:"How would you describe your diet?",options:[{value:"healthy",label:"Healthy (low in saturated fat, high in fruits/vegetables)",score:0},{value:"moderate",label:"Moderate (some processed foods)",score:1},{value:"unhealthy",label:"Unhealthy (high in processed foods, saturated fat)",score:2}]},{id:"heart_pressure",text:"Do you have high blood pressure?",options:[{value:"no",label:"No",score:0},{value:"borderline",label:"Borderline",score:1},{value:"yes",label:"Yes",score:2}]}]},diabetes:{title:"Type 2 Diabetes",questions:[{id:"diabetes_family",text:"Do you have a family history of diabetes?",options:[{value:"no",label:"No",score:0},{value:"distant",label:"Yes, distant relatives",score:1},{value:"immediate",label:"Yes, immediate family",score:2}]},{id:"diabetes_weight",text:"Are you overweight or obese?",options:[{value:"no",label:"No",score:0},{value:"overweight",label:"Overweight",score:1},{value:"obese",label:"Obese",score:2}]},{id:"diabetes_activity",text:"How physically active are you?",options:[{value:"very",label:"Very active",score:0},{value:"moderate",label:"Moderately active",score:1},{value:"sedentary",label:"Sedentary",score:2}]},{id:"diabetes_diet",text:"How often do you consume sugary foods/drinks?",options:[{value:"rarely",label:"Rarely",score:0},{value:"sometimes",label:"Sometimes",score:1},{value:"frequently",label:"Frequently",score:2}]},{id:"diabetes_age",text:"Are you over 45 years old?",options:[{value:"no",label:"No",score:0},{value:"yes",label:"Yes",score:2}]}]}},A=(a,s)=>{M(t=>({...t,[a]:s}))},D=()=>{const a={};Object.entries(x).forEach(([s,t])=>{let l=0;const i=t.questions.filter(r=>c[r.id]);if(i.length===0)return;i.forEach(r=>{const b=c[r.id],d=r.options.find(v=>v.value===b);d&&(l+=d.score)});const m=t.questions.length*2,o=Math.round(l/m*100);let n;o<30?n="low":o<70?n="moderate":n="high";const j=[];t.questions.forEach(r=>{const b=c[r.id],d=r.options.find(v=>v.value===b);d&&d.score>0&&j.push(r.text)});const L=H(s,n);a[s]={risk:n,score:o,factors:j,recommendations:L}}),p(a)},H=(a,s,t)=>{var m,o;const l=["Maintain a balanced diet rich in fruits, vegetables, and whole grains","Exercise regularly (aim for at least 150 minutes per week)","Avoid smoking and limit alcohol consumption","Get regular health check-ups"],i={heart:["Monitor your blood pressure regularly","Limit saturated and trans fats in your diet","Manage stress through relaxation techniques","Consider discussing heart health with your doctor"],diabetes:["Limit sugar and refined carbohydrate intake","Maintain a healthy weight","Monitor your blood glucose levels","Stay hydrated and get adequate sleep"]};return s==="low"?[...l.slice(0,2),...((m=i[a])==null?void 0:m.slice(0,1))||[]]:s==="moderate"?[...l,...((o=i[a])==null?void 0:o.slice(0,2))||[]]:[...l,...i[a]||[]]},g=a=>x[a].questions.every(s=>c[s.id]),S=a=>{switch(a){case"low":return"text-green-500";case"moderate":return"text-yellow-500";case"high":return"text-red-500";default:return"text-safebite-text"}},_=a=>{switch(a){case"low":return e.jsx(P,{className:"h-5 w-5 text-green-500"});case"moderate":return e.jsx(B,{className:"h-5 w-5 text-yellow-500"});case"high":return e.jsx(I,{className:"h-5 w-5 text-red-500"});default:return null}};return e.jsx("div",{className:"space-y-4",children:f?e.jsxs("div",{className:"space-y-4",children:[e.jsxs(N,{defaultValue:"heart",className:"w-full",children:[e.jsxs(w,{className:"grid grid-cols-2 mb-4",children:[e.jsx(h,{value:"heart",children:"Heart Disease"}),e.jsx(h,{value:"diabetes",children:"Type 2 Diabetes"})]}),Object.entries(f).map(([a,s])=>e.jsx(k,{value:a,children:e.jsx(Y,{className:`border-t-4 border-t-${s.risk==="low"?"green":s.risk==="moderate"?"yellow":"red"}-500`,children:e.jsxs($,{className:"pt-6",children:[e.jsxs("div",{className:"flex items-center mb-4",children:[_(s.risk),e.jsxs("span",{className:`ml-2 font-semibold ${S(s.risk)}`,children:[s.risk.charAt(0).toUpperCase()+s.risk.slice(1)," Risk"]})]}),e.jsxs("div",{className:"mb-4",children:[e.jsxs("div",{className:"flex justify-between text-xs text-safebite-text-secondary mb-1",children:[e.jsx("span",{children:"Low"}),e.jsx("span",{children:"Moderate"}),e.jsx("span",{children:"High"})]}),e.jsx(F,{value:s.score,className:"h-2 bg-safebite-card-bg-alt"}),e.jsxs("div",{className:"text-right text-xs text-safebite-text-secondary mt-1",children:["Score: ",s.score,"/100"]})]}),s.factors.length>0&&e.jsxs("div",{className:"mt-4",children:[e.jsx("h4",{className:"text-sm font-medium text-safebite-text mb-2",children:"Risk Factors:"}),e.jsx("ul",{className:"text-sm text-safebite-text-secondary space-y-1",children:s.factors.map((t,l)=>e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"mr-2",children:"•"}),e.jsx("span",{children:t})]},l))})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("h4",{className:"text-sm font-medium text-safebite-text mb-2",children:"Recommendations:"}),e.jsx("ul",{className:"text-sm text-safebite-text-secondary space-y-1",children:s.recommendations.map((t,l)=>e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"mr-2",children:"•"}),e.jsx("span",{children:t})]},l))})]})]})})},a))]}),e.jsx("div",{className:"mt-6 text-xs text-safebite-text-secondary",children:e.jsx("p",{children:"Note: This tool provides a general risk assessment based on common risk factors. It is not a diagnostic tool and should not replace professional medical advice."})}),e.jsx(C,{onClick:()=>p(null),className:"w-full mt-4 bg-safebite-card-bg-alt text-safebite-text hover:bg-safebite-card-bg",children:"Retake Assessment"})]}):e.jsxs(e.Fragment,{children:[e.jsxs(N,{defaultValue:"heart",value:u,onValueChange:T,className:"w-full",children:[e.jsxs(w,{className:"grid grid-cols-2 mb-4",children:[e.jsx(h,{value:"heart",children:"Heart Disease"}),e.jsx(h,{value:"diabetes",children:"Type 2 Diabetes"})]}),Object.entries(x).map(([a,s])=>e.jsx(k,{value:a,className:"space-y-4",children:e.jsx("div",{className:"space-y-4",children:s.questions.map(t=>e.jsxs("div",{className:"space-y-2",children:[e.jsx(R,{className:"text-safebite-text",children:t.text}),e.jsx(E,{onValueChange:l=>A(t.id,l),value:c[t.id],className:"flex flex-col space-y-1",children:t.options.map(l=>e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(O,{value:l.value,id:`${t.id}-${l.value}`,className:"text-safebite-teal"}),e.jsx(R,{htmlFor:`${t.id}-${l.value}`,className:"text-sm text-safebite-text-secondary cursor-pointer",children:l.label})]},l.value))})]},t.id))})},a))]}),e.jsxs(C,{onClick:D,className:"w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80",disabled:!g(u),children:[e.jsx(q,{className:"mr-2 h-4 w-4"}),"Calculate Risk Assessment"]}),!g(u)&&e.jsx("p",{className:"text-xs text-safebite-text-secondary text-center",children:"Please answer all questions to calculate your risk assessment."})]})})};export{z as default};
