import{r as u,j as e,L as f,R as S,i as C,B as p,k,C as R,a as A,P as H,b as P,c as T,T as b}from"./index-BJ7kTRrU.js";const z=()=>{const[d,g]=u.useState({}),[a,x]=u.useState(null),m=[{id:"q1",text:"How often have you felt that you were unable to control the important things in your life?"},{id:"q2",text:"How often have you felt nervous and stressed?"},{id:"q3",text:"How often have you found that you could not cope with all the things that you had to do?"},{id:"q4",text:"How often have you felt difficulties were piling up so high that you could not overcome them?"},{id:"q5",text:"How often have you had trouble sleeping because of stress?"}],y=[{value:0,label:"Never"},{value:1,label:"Almost Never"},{value:2,label:"Sometimes"},{value:3,label:"Fairly Often"},{value:4,label:"Very Often"}],v=(t,r)=>{g(l=>({...l,[t]:r}))},j=()=>{const t=Object.values(d).reduce((N,w)=>N+w,0),r=m.length*4,l=Math.round(t/r*100);let s="",i="",n=null,o="",c=[];l<25?(s="Low Stress",i="text-green-500",n=e.jsx(P,{className:"h-5 w-5 text-green-500"}),o="Your stress levels appear to be low. This is a good sign that you're managing life's challenges well.",c=["Continue your current stress management practices","Regular exercise and healthy eating","Maintain social connections","Practice mindfulness occasionally"]):l<50?(s="Moderate Stress",i="text-yellow-500",n=e.jsx(T,{className:"h-5 w-5 text-yellow-500"}),o="You're experiencing moderate stress. While this is common, finding ways to reduce stress can improve your wellbeing.",c=["Incorporate regular relaxation techniques","Ensure adequate sleep (7-8 hours)","Consider time management strategies","Limit caffeine and alcohol"]):l<75?(s="High Stress",i="text-orange-500",n=e.jsx(b,{className:"h-5 w-5 text-orange-500"}),o="Your stress levels are high. This may be affecting your physical and mental health.",c=["Practice daily stress reduction techniques (meditation, deep breathing)","Consider talking to a friend, family member, or counselor","Prioritize self-care activities","Evaluate work-life balance","Regular physical activity"]):(s="Severe Stress",i="text-red-500",n=e.jsx(b,{className:"h-5 w-5 text-red-500"}),o="You're experiencing severe stress. This level of stress can significantly impact your health and wellbeing.",c=["Consider speaking with a healthcare professional","Implement daily stress management practices","Evaluate major stressors in your life","Ensure adequate rest and nutrition","Seek support from friends, family, or support groups","Consider temporarily reducing commitments if possible"]),x({score:l,level:s,color:i,icon:n,description:o,recommendations:c})},h=Object.keys(d).length===m.length;return e.jsx("div",{className:"space-y-4",children:a?e.jsx(R,{className:"mt-4 border-t-4",style:{borderTopColor:a.color.replace("text-","")},children:e.jsxs(A,{className:"pt-6",children:[e.jsxs("div",{className:"flex items-center mb-4",children:[a.icon,e.jsx("span",{className:`ml-2 font-semibold ${a.color}`,children:a.level})]}),e.jsxs("div",{className:"mb-4",children:[e.jsxs("div",{className:"flex justify-between text-xs text-safebite-text-secondary mb-1",children:[e.jsx("span",{children:"Low"}),e.jsx("span",{children:"Moderate"}),e.jsx("span",{children:"High"}),e.jsx("span",{children:"Severe"})]}),e.jsx(H,{value:a.score,className:"h-2 bg-safebite-card-bg-alt"}),e.jsxs("div",{className:"text-right text-xs text-safebite-text-secondary mt-1",children:["Score: ",a.score,"/100"]})]}),e.jsx("p",{className:"text-safebite-text-secondary text-sm mb-4",children:a.description}),e.jsxs("div",{className:"mt-4",children:[e.jsx("h4",{className:"text-sm font-medium text-safebite-text mb-2",children:"Recommendations:"}),e.jsx("ul",{className:"text-sm text-safebite-text-secondary space-y-1",children:a.recommendations.map((t,r)=>e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"mr-2",children:"•"}),e.jsx("span",{children:t})]},r))})]}),e.jsx("div",{className:"mt-6 text-xs text-safebite-text-secondary",children:e.jsx("p",{children:"Note: This tool provides general information and is not a substitute for professional medical advice."})}),e.jsx(p,{onClick:()=>x(null),className:"w-full mt-4 bg-safebite-card-bg-alt text-safebite-text hover:bg-safebite-card-bg",children:"Retake Assessment"})]})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"space-y-4",children:m.map((t,r)=>{var l;return e.jsxs("div",{className:"space-y-2",children:[e.jsxs(f,{className:"text-safebite-text",children:[r+1,". ",t.text]}),e.jsx(S,{onValueChange:s=>v(t.id,parseInt(s)),value:(l=d[t.id])==null?void 0:l.toString(),className:"flex flex-wrap gap-2",children:y.map(s=>e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(C,{value:s.value.toString(),id:`${t.id}-${s.value}`,className:"text-safebite-teal"}),e.jsx(f,{htmlFor:`${t.id}-${s.value}`,className:"text-sm text-safebite-text-secondary cursor-pointer",children:s.label})]},s.value))})]},t.id)})}),e.jsxs(p,{onClick:j,className:"w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80",disabled:!h,children:[e.jsx(k,{className:"mr-2 h-4 w-4"}),"Analyze Stress Level"]}),!h&&e.jsx("p",{className:"text-xs text-safebite-text-secondary text-center",children:"Please answer all questions to analyze your stress level."})]})})};export{z as default};
