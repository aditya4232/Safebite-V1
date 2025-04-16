import{g as ne}from"./index-BWELSAIX.js";function le(C,w){for(var p=0;p<w.length;p++){const c=w[p];if(typeof c!="string"&&!Array.isArray(c)){for(const g in c)if(g!=="default"&&!(g in C)){const f=Object.getOwnPropertyDescriptor(c,g);f&&Object.defineProperty(C,g,f.get?f:{enumerable:!0,get:()=>c[g]})}}}return Object.freeze(Object.defineProperty(C,Symbol.toStringTag,{value:"Module"}))}var O={exports:{}},de=O.exports,L;function he(){return L||(L=1,function(C,w){(function(p,c){C.exports=c(p._Highcharts,p._Highcharts.SeriesRegistry,p._Highcharts.Color)})(typeof window>"u"?de:window,(p,c,g)=>(()=>{var f,B={512:o=>{o.exports=c},620:o=>{o.exports=g},944:o=>{o.exports=p}},S={};function n(o){var e=S[o];if(e!==void 0)return e.exports;var t=S[o]={exports:{}};return B[o](t,t.exports,n),t.exports}n.n=o=>{var e=o&&o.__esModule?()=>o.default:()=>o;return n.d(e,{a:e}),e},n.d=(o,e)=>{for(var t in e)n.o(e,t)&&!n.o(o,t)&&Object.defineProperty(o,t,{enumerable:!0,get:e[t]})},n.o=(o,e)=>Object.prototype.hasOwnProperty.call(o,e);var T={};n.d(T,{default:()=>ie});var F=n(944),m=n.n(F);let{defaultOptions:pe}=m(),{noop:ce}=m(),{addEvent:ge,extend:fe,isObject:W,merge:J,relativeLength:me}=m(),K={radius:0,scope:"stack",where:void 0};function Q(o,e){return W(o)||(o={radius:o||0}),J(K,e,o)}let U={optionsToObject:Q};var X=n(512),G=n.n(X),Y=n(620);let{parse:M}=n.n(Y)(),{merge:Z}=m();(function(o){o.initDataClasses=function(e){let t=this.chart,a=this.legendItem=this.legendItem||{},r=this.options,h=e.dataClasses||[],l,u,i=t.options.chart.colorCount,s=0,d;this.dataClasses=u=[],a.labels=[];for(let x=0,y=h.length;x<y;++x)l=Z(l=h[x]),u.push(l),(t.styledMode||!l.color)&&(r.dataClassColor==="category"?(t.styledMode||(i=(d=t.options.colors||[]).length,l.color=d[s]),l.colorIndex=s,++s===i&&(s=0)):l.color=M(r.minColor).tweenTo(M(r.maxColor),y<2?.5:x/(y-1)))},o.initStops=function(){let e=this.options,t=this.stops=e.stops||[[0,e.minColor||""],[1,e.maxColor||""]];for(let a=0,r=t.length;a<r;++a)t[a].color=M(t[a][1])},o.normalizedValue=function(e){let t=this.max||0,a=this.min||0;return this.logarithmic&&(e=this.logarithmic.log2lin(e)),1-(t-e)/(t-a||1)},o.toColor=function(e,t){let a,r,h,l,u,i,s=this.dataClasses,d=this.stops;if(s){for(i=s.length;i--;)if(r=(u=s[i]).from,h=u.to,(r===void 0||e>=r)&&(h===void 0||e<=h)){l=u.color,t&&(t.dataClass=i,t.colorIndex=u.colorIndex);break}}else{for(a=this.normalizedValue(e),i=d.length;i--&&!(a>d[i][0]););r=d[i]||d[i+1],a=1-((h=d[i+1]||r)[0]-a)/(h[0]-r[0]||1),l=r.color.tweenTo(h.color,a)}return l}})(f||(f={}));let ee=f,{extend:te}=m(),oe={init:function(o){te(o,ee)}},{gauge:j,pie:re}=G().seriesTypes,{clamp:D,extend:se,isNumber:N,merge:ae,pick:P,pInt:z}=m();class H extends j{translate(){let e=this.yAxis;oe.init(e),!e.dataClasses&&e.options.dataClasses&&e.initDataClasses(e.options),e.initStops(),j.prototype.translate.call(this)}drawPoints(){let e,t=this.yAxis,a=t.center,r=this.options,h=this.chart.renderer,l=r.overshoot,u=r.rounded&&r.borderRadius===void 0,i=N(l)?l/180*Math.PI:0;for(let s of(N(r.threshold)&&(e=t.startAngleRad+t.translate(r.threshold,void 0,void 0,void 0,!0)),this.thresholdAngleRad=P(e,t.startAngleRad),this.points))if(!s.isNull){let d=z(P(s.options.radius,r.radius,100))*a[2]/200,x=z(P(s.options.innerRadius,r.innerRadius,60))*a[2]/200,y=Math.min(t.startAngleRad,t.endAngleRad),q=Math.max(t.startAngleRad,t.endAngleRad),v=s.graphic,R=t.startAngleRad+t.translate(s.y,void 0,void 0,void 0,!0),A,_,b=t.toColor(s.y,s);b==="none"&&(b=s.color||this.color||"none"),b!=="none"&&(s.color=b),R=D(R,y-i,q+i),r.wrap===!1&&(R=D(R,y,q));let E=u?(d-x)/2/d:0,I=Math.min(R,this.thresholdAngleRad)-E,k=Math.max(R,this.thresholdAngleRad)+E;k-I>2*Math.PI&&(k=I+2*Math.PI);let $=u?"50%":0;r.borderRadius&&($=U.optionsToObject(r.borderRadius).radius),s.shapeArgs=A={x:a[0],y:a[1],r:d,innerR:x,start:I,end:k,borderRadius:$},s.startR=d,v?(_=A.d,v.animate(se({fill:b},A)),_&&(A.d=_)):s.graphic=v=h.arc(A).attr({fill:b,"sweep-flag":0}).add(this.group),this.chart.styledMode||(r.linecap!=="square"&&v.attr({"stroke-linecap":"round","stroke-linejoin":"round"}),v.attr({stroke:r.borderColor||"none","stroke-width":r.borderWidth||0})),v&&v.addClass(s.getClassName(),!0)}}animate(e){e||(this.startAngleRad=this.thresholdAngleRad,re.prototype.animate.call(this,e))}}H.defaultOptions=ae(j.defaultOptions,{colorByPoint:!0,dataLabels:{y:0}}),G().registerSeriesType("solidgauge",H);let ie=m();return T.default})())}(O)),O.exports}var V=he();const ue=ne(V),ve=le({__proto__:null,default:ue},[V]);export{ve as s};
