const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-SAl2EyZQ.js","assets/index-DBqE8Eah.css","assets/jspdf.es.min-Bk2TC002.js"])))=>i.map(i=>d[i]);
var Me=Object.defineProperty;var Qe=(w,e,s)=>e in w?Me(w,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):w[e]=s;var ae=(w,e,s)=>Qe(w,typeof e!="symbol"?e+"":e,s);import{d as ue,o as _e,_ as Ce,r as q,g as c,c as u,a as t,e as i,w as f,t as g,b as h,m as I,k as E,N as Z,n as F,K as G,P as Se,M as Pe,T as Oe,S as Ie,Y as Ge,Q as Ee,G as De,E as z,v as je,Z as Ve,$ as Be,F as M,C as j,a0 as $e,a1 as Je,a2 as we,a3 as We,a4 as ye,q as re,L as ce,j as ke,U as Ye}from"./index-SAl2EyZQ.js";import{u as Te,T as Ke}from"./useTTS-KGTHt4_d.js";import{u as xe,B as ze}from"./BottomInfoBar-Duo3HV6b.js";import{u as Fe,_ as de}from"./_plugin-vue_export-helper-Cve9Aa48.js";import{u as He}from"./useStudyTimer-DbNUJ6aN.js";import"./logo-Cq9nXPts.js";const Xe={class:"interview-setup"},Ze={class:"setup-container"},et={class:"setup-content"},tt={class:"alert-content"},st={class:"settings-form"},nt={class:"form-section"},ot={class:"form-item"},it={class:"form-item"},at={class:"form-section"},rt={class:"form-item"},lt={class:"form-item"},ct={key:0,class:"job-requirements-preview"},ut={class:"requirement-item"},dt={class:"value"},pt={class:"requirement-item"},vt={class:"value"},gt={class:"setup-actions"},ft=ue({__name:"InterviewSetup",emits:["start","cancel"],setup(w,{emit:e}){const{t:s}=Fe(),n=F({accent:"western",gender:"female",jobLevel:"junior",industry:"manufacturing"}),d=F({}),v=F({}),r=G(()=>d.value[n.value.jobLevel]),S=e;_e(async()=>{try{const{dataLoader:m}=await Ce(async()=>{const{dataLoader:R}=await import("./index-SAl2EyZQ.js").then(P=>P.ad);return{dataLoader:R}},__vite__mapDeps([0,1])),a=await m.loadConfig();a.jobLevels&&(d.value=a.jobLevels),a.industries&&(v.value=a.industries)}catch(m){console.error("Failed to load interview config:",m)}});function k(){S("start",n.value)}return(m,a)=>{const R=q("el-alert"),P=q("el-radio-button"),_=q("el-radio-group"),C=q("el-radio"),b=q("el-option"),l=q("el-select"),o=q("el-button");return c(),u("div",Xe,[t("div",Ze,[a[16]||(a[16]=t("div",{class:"setup-header"},[t("h2",null,"模拟面试"),t("p",{class:"subtitle"},"SAP FICO 实施顾问岗位 - 全英文面试")],-1)),t("div",et,[i(R,{type:"info",closable:!1,"show-icon":"",class:"info-alert"},{default:f(()=>[t("div",tt,[t("p",null,g(h(s)("mockInterview.interviewRules")),1),a[5]||(a[5]=t("ul",{class:"rules-list"},[t("li",null,"全程英文提问，请用英文回答"),t("li",null,"可以选择文字输入或语音回答"),t("li",null,"每个问题建议回答时间：1-3分钟"),t("li",null,"面试完成后将生成详细点评报告")],-1))])]),_:1}),t("div",st,[t("div",nt,[a[6]||(a[6]=t("h3",null,"面试设置",-1)),t("div",ot,[t("label",null,g(h(s)("mockInterview.selectAccent")),1),i(_,{modelValue:n.value.accent,"onUpdate:modelValue":a[0]||(a[0]=O=>n.value.accent=O)},{default:f(()=>[i(P,{value:"indian"},{default:f(()=>[I(g(h(s)("mockInterview.indianAccent")),1)]),_:1}),i(P,{value:"singapore"},{default:f(()=>[I(g(h(s)("mockInterview.singaporeAccent")),1)]),_:1}),i(P,{value:"western"},{default:f(()=>[I(g(h(s)("mockInterview.westernAccent")),1)]),_:1})]),_:1},8,["modelValue"])]),t("div",it,[t("label",null,g(h(s)("mockInterview.selectGender")),1),i(_,{modelValue:n.value.gender,"onUpdate:modelValue":a[1]||(a[1]=O=>n.value.gender=O)},{default:f(()=>[i(P,{value:"male"},{default:f(()=>[I(g(h(s)("mockInterview.male")),1)]),_:1}),i(P,{value:"female"},{default:f(()=>[I(g(h(s)("mockInterview.female")),1)]),_:1})]),_:1},8,["modelValue"])])]),t("div",at,[a[14]||(a[14]=t("h3",null,"岗位与行业",-1)),t("div",rt,[a[10]||(a[10]=t("label",null,"岗位级别",-1)),i(_,{modelValue:n.value.jobLevel,"onUpdate:modelValue":a[2]||(a[2]=O=>n.value.jobLevel=O)},{default:f(()=>[i(C,{value:"junior"},{default:f(()=>[...a[7]||(a[7]=[I(" 初级顾问 (0-2年) ",-1)])]),_:1}),i(C,{value:"middle"},{default:f(()=>[...a[8]||(a[8]=[I(" 中级顾问 (2-5年) ",-1)])]),_:1}),i(C,{value:"senior"},{default:f(()=>[...a[9]||(a[9]=[I(" 高级顾问 (5年+) ",-1)])]),_:1})]),_:1},8,["modelValue"])]),t("div",lt,[a[11]||(a[11]=t("label",null,"行业方向",-1)),i(l,{modelValue:n.value.industry,"onUpdate:modelValue":a[3]||(a[3]=O=>n.value.industry=O),placeholder:"请选择行业"},{default:f(()=>[i(b,{value:"manufacturing",label:"制造业"}),i(b,{value:"retail",label:"零售/电商"}),i(b,{value:"finance",label:"金融服务"}),i(b,{value:"energy",label:"能源与化工"}),i(b,{value:"pharma",label:"医药与生命科学"}),i(b,{value:"technology",label:"高科技与互联网"}),i(b,{value:"logistics",label:"物流与运输"}),i(b,{value:"public",label:"公共部门与教育"}),i(b,{value:"realestate",label:"房地产与建筑"}),i(b,{value:"other",label:"其他"})]),_:1},8,["modelValue"])]),r.value?(c(),u("div",ct,[t("div",ut,[a[12]||(a[12]=t("span",{class:"label"},"面试题数：",-1)),t("span",dt,g(r.value.questionsPerSession)+"题",1)]),t("div",pt,[a[13]||(a[13]=t("span",{class:"label"},"每题时长：",-1)),t("span",vt,g(Math.floor(r.value.timePerQuestion/60))+"分钟",1)])])):E("",!0)])]),t("div",gt,[i(o,{type:"primary",size:"large",icon:h(Z),onClick:k},{default:f(()=>[I(g(h(s)("mockInterview.startInterview")),1)]),_:1},8,["icon"]),i(o,{size:"large",onClick:a[4]||(a[4]=O=>m.$emit("cancel"))},{default:f(()=>[...a[15]||(a[15]=[I(" 取消 ",-1)])]),_:1})])])])])}}}),mt=de(ft,[["__scopeId","data-v-0a9c77c6"]]);function ht(){const w=F({isRecording:!1,isPaused:!1,duration:0,audioBlob:null,audioUrl:null});let e=null,s=[],n=null,d=0;async function v(){try{const P=await navigator.mediaDevices.getUserMedia({audio:!0});e=new MediaRecorder(P),s=[],e.ondataavailable=_=>{_.data.size>0&&s.push(_.data)},e.onstop=()=>{const _=new Blob(s,{type:"audio/wav"}),C=URL.createObjectURL(_);w.value.audioBlob=_,w.value.audioUrl=C},e.start(100),w.value.isRecording=!0,w.value.isPaused=!1,d=Date.now(),n=window.setInterval(()=>{w.value.duration=Math.floor((Date.now()-d)/1e3)},100)}catch(P){throw console.error("Failed to start recording:",P),new Error("无法访问麦克风，请检查权限设置")}}function r(){e&&e.state==="recording"&&(e.pause(),w.value.isPaused=!0,n&&(clearInterval(n),n=null))}function S(){e&&e.state==="paused"&&(e.resume(),w.value.isPaused=!1,d=Date.now()-w.value.duration*1e3,n=window.setInterval(()=>{w.value.duration=Math.floor((Date.now()-d)/1e3)},100))}function k(){e&&e.state!=="inactive"&&(e.stop(),e.stream.getTracks().forEach(P=>P.stop())),n&&(clearInterval(n),n=null),w.value.isRecording=!1,w.value.isPaused=!1}function m(){k(),w.value.audioUrl&&URL.revokeObjectURL(w.value.audioUrl),w.value={isRecording:!1,isPaused:!1,duration:0,audioBlob:null,audioUrl:null},s=[],e=null}function a(){const P=Math.floor(w.value.duration/60),_=w.value.duration%60;return`${P.toString().padStart(2,"0")}:${_.toString().padStart(2,"0")}`}function R(){return!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)}return Se(()=>{m()}),{state:w,startRecording:v,pauseRecording:r,resumeRecording:S,stopRecording:k,resetRecording:m,formattedDuration:a,isSupported:R}}const wt={class:"interview-session"},yt={class:"session-container"},kt={class:"session-header"},_t={class:"stage-info"},Ct={class:"question-count"},It={class:"session-actions"},St={key:0,class:"pause-overlay"},bt={key:1,class:"question-section"},At={class:"question-header"},Pt={class:"avatar-container"},$t={viewBox:"0 0 100 100",class:"avatar-svg"},Ot=["d"],Et={key:0,class:"sound-waves"},Tt={key:0,class:"countdown-overlay"},xt={class:"countdown-number"},Ft={class:"question-content"},Rt={class:"question-text"},Lt={class:"question-translation"},qt={key:2,class:"answer-section"},Nt={class:"answer-header"},Ut={key:0,class:"text-answer"},Mt={class:"answer-hint"},Qt={class:"answer-actions"},Gt={key:1,class:"voice-answer"},Dt={class:"recorder-container"},jt={class:"recorder-display"},Vt={class:"recorder-info"},Bt={class:"recording-time"},Jt={class:"recording-status"},Wt={key:0,class:"recorder-controls"},Yt={class:"recorder-actions"},Kt=["src"],zt={key:3,class:"timer-bar"},Ht={class:"timer-text"},Xt=ue({__name:"InterviewSession",props:{questions:{},settings:{}},emits:["complete","cancel"],setup(w,{emit:e}){const s=w,n=e,{speak:d,setAccent:v,setGender:r}=Te(),{state:S,startRecording:k,stopRecording:m,resetRecording:a,formattedDuration:R}=ht(),P=xe(),_=F(0),C=F(!1),b=F("text"),l=G(()=>{const Q=["项目经验","技术问题","真实场景","反问环节"],y=s.questions.length;if(y===0)return"";const me=Math.ceil(y/Q.length),D=Math.min(Math.floor(_.value/me),Q.length-1);return Q[D]}),o=F(""),O=F(!1),A=F(0),T=F(null),V=F(!1),p=G(()=>s.settings.timePerQuestion||180),L=F(p.value),N=F(null),U=F(!1),B=F(null),J=F([]),Y=[{label:"文字输入",value:"text"},{label:"语音回答",value:"voice"}],$=G(()=>s.questions[_.value]),x=G(()=>s.questions.length),ee=G(()=>(p.value-L.value)/p.value*100),H=G(()=>S.value.audioBlob!==null),te=G(()=>S.value.audioUrl);_e(()=>{v(s.settings.accent),r(s.settings.gender),L.value=p.value});function ne(){L.value=p.value,N.value=window.setInterval(()=>{L.value--,L.value<=0&&pe()},1e3)}function oe(){N.value&&(clearInterval(N.value),N.value=null)}function pe(){b.value==="text"&&o.value.trim().length>=10?ie():b.value==="voice"&&H.value?be():fe()}async function se(){var Q,y;W(),O.value=!0;try{await d($.value.englishQuestion),V.value=!0,P.addRecord({type:"interview",title:`模拟面试 - ${l.value}: ${(Q=$.value.englishQuestion)==null?void 0:Q.substring(0,30)}${((y=$.value.englishQuestion)==null?void 0:y.length)>30?"...":""}`})}finally{O.value=!1}}function K(){A.value=5,T.value=window.setInterval(()=>{A.value--,A.value<=0&&(T.value&&(clearInterval(T.value),T.value=null),se())},1e3)}function W(){T.value&&(clearInterval(T.value),T.value=null),A.value=0}function X(){C.value=!C.value,C.value?(oe(),W()):(ne(),!V.value&&!O.value&&K())}function ie(){const Q=o.value.trim();if(!Q){z.warning("请输入回答内容后再提交");return}if(Q.length<10){z.warning("回答内容太短，请至少输入10个字符");return}J.value.push({question:$.value.englishQuestion,answer:Q}),ge()}async function ve(){U.value?(m(),U.value=!1):(await k(),U.value=!0)}function be(){U.value&&(m(),U.value=!1),J.value.push({question:$.value.englishQuestion,answer:"[语音回答]",audioBlob:S.value.audioBlob}),ge()}function Re(){B.value&&B.value.play()}function Le(){}function ge(){if(o.value="",a(),oe(),W(),V.value=!1,_.value>=x.value-1){const Q=J.value.filter(y=>y.answer!=="[跳过]").length;P.addRecord({type:"interview",title:`模拟面试完成 - 回答 ${Q}/${x.value} 题`,score:Math.round(Q/x.value*100)}),n("complete",J.value)}else _.value++,ne(),K()}function fe(){J.value.push({question:$.value.englishQuestion,answer:"[跳过]"}),ge()}async function qe(){try{await Ve.confirm("确定要结束面试吗？当前进度将不会保存。","结束面试",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}),n("cancel")}catch{}}return _e(()=>{ne(),K()}),Se(()=>{oe(),W(),te.value&&URL.revokeObjectURL(te.value)}),(Q,y)=>{const me=q("el-tag"),D=q("el-button"),Ae=q("el-icon"),Ne=q("el-segmented"),Ue=q("el-input");return c(),u("div",wt,[t("div",yt,[t("div",kt,[t("div",_t,[i(me,{type:"primary",size:"large"},{default:f(()=>[I(g(l.value),1)]),_:1}),t("span",Ct,g(_.value+1)+" / "+g(x.value),1)]),t("div",It,[i(D,{icon:C.value?h(Z):h(Pe),circle:"",onClick:X},null,8,["icon"]),i(D,{icon:h(Oe),type:"danger",circle:"",onClick:qe},null,8,["icon"])])]),C.value?(c(),u("div",St,[i(Ae,{size:80},{default:f(()=>[i(h(Z))]),_:1}),y[3]||(y[3]=t("p",null,"面试已暂停",-1)),i(D,{type:"primary",onClick:X},{default:f(()=>[...y[2]||(y[2]=[I("继续面试",-1)])]),_:1})])):E("",!0),C.value?E("",!0):(c(),u("div",bt,[t("div",At,[i(Ae,{class:"question-icon"},{default:f(()=>[i(h(je))]),_:1}),y[5]||(y[5]=t("span",null,"面试问题",-1)),i(D,{icon:h(Z),size:"small",text:"",loading:O.value,onClick:se},{default:f(()=>[...y[4]||(y[4]=[I(" 播放问题 ",-1)])]),_:1},8,["icon","loading"])]),t("div",Pt,[t("div",{class:Ie(["ai-avatar",{speaking:O.value}])},[(c(),u("svg",$t,[y[7]||(y[7]=Ge('<defs data-v-0e7b81ca><linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%" data-v-0e7b81ca><stop offset="0%" style="stop-color:#667eea;stop-opacity:1;" data-v-0e7b81ca></stop><stop offset="100%" style="stop-color:#764ba2;stop-opacity:1;" data-v-0e7b81ca></stop></linearGradient></defs><circle cx="50" cy="50" r="45" fill="url(#avatarGradient)" data-v-0e7b81ca></circle><ellipse cx="35" cy="40" rx="8" ry="10" fill="white" data-v-0e7b81ca></ellipse><ellipse cx="65" cy="40" rx="8" ry="10" fill="white" data-v-0e7b81ca></ellipse><circle cx="35" cy="40" r="4" fill="#333" data-v-0e7b81ca></circle><circle cx="65" cy="40" r="4" fill="#333" data-v-0e7b81ca></circle><line x1="25" y1="28" x2="45" y2="32" stroke="white" stroke-width="2" stroke-linecap="round" data-v-0e7b81ca></line><line x1="55" y1="32" x2="75" y2="28" stroke="white" stroke-width="2" stroke-linecap="round" data-v-0e7b81ca></line>',8)),t("path",{d:O.value?"M 30 65 Q 50 80 70 65":"M 35 65 Q 50 60 65 65",stroke:"white","stroke-width":"3",fill:"none","stroke-linecap":"round"},null,8,Ot),O.value?(c(),u("g",Et,[...y[6]||(y[6]=[t("circle",{cx:"50",cy:"50",r:"50",fill:"none",stroke:"rgba(102, 126, 234, 0.3)","stroke-width":"2",class:"wave-1"},null,-1),t("circle",{cx:"50",cy:"50",r:"55",fill:"none",stroke:"rgba(102, 126, 234, 0.2)","stroke-width":"2",class:"wave-2"},null,-1)])])):E("",!0)]))],2),A.value>0?(c(),u("div",Tt,[t("div",xt,g(A.value),1),y[8]||(y[8]=t("div",{class:"countdown-text"},"秒后开始朗读",-1))])):E("",!0)]),t("div",Ft,[t("p",Rt,g($.value.englishQuestion),1),t("p",Lt,g($.value.chineseTranslation),1)])])),C.value?E("",!0):(c(),u("div",qt,[t("div",Nt,[y[9]||(y[9]=t("span",null,"你的回答",-1)),i(Ne,{modelValue:b.value,"onUpdate:modelValue":y[0]||(y[0]=he=>b.value=he),options:Y},null,8,["modelValue"])]),b.value==="text"?(c(),u("div",Ut,[i(Ue,{modelValue:o.value,"onUpdate:modelValue":y[1]||(y[1]=he=>o.value=he),type:"textarea",rows:8,placeholder:"请用英文输入你的回答...","show-word-limit":"",maxlength:"2000"},null,8,["modelValue"]),t("div",Mt,[t("span",{class:Ie({"hint-warning":o.value.trim().length>0&&o.value.trim().length<10})},g(o.value.trim().length)+" / 10 字符（最少10个字符） ",3)]),t("div",Qt,[i(D,{type:"primary",disabled:o.value.trim().length<10,onClick:ie},{default:f(()=>[...y[10]||(y[10]=[I(" 提交回答 ",-1)])]),_:1},8,["disabled"]),i(D,{onClick:fe},{default:f(()=>[...y[11]||(y[11]=[I(" 跳过此题 ",-1)])]),_:1})])])):(c(),u("div",Gt,[t("div",Dt,[t("div",jt,[i(D,{type:U.value?"danger":"primary",icon:U.value?h(Pe):h(Z),circle:"",size:60,onClick:ve},null,8,["type","icon"]),t("div",Vt,[t("div",Bt,g(h(R)()),1),t("div",Jt,g(U.value?"录音中（点击停止）":H.value?"录音完成":"点击开始录音"),1)]),H.value?(c(),u("div",Wt,[i(D,{icon:h(Z),circle:"",size:"small",onClick:Re},{default:f(()=>[...y[12]||(y[12]=[I(" 播放录音 ",-1)])]),_:1},8,["icon"]),i(D,{icon:h(Ee),circle:"",size:"small",onClick:h(a)},{default:f(()=>[...y[13]||(y[13]=[I(" 重新录制 ",-1)])]),_:1},8,["icon","onClick"])])):E("",!0)]),t("div",Yt,[i(D,{type:"primary",disabled:!H.value,onClick:be},{default:f(()=>[...y[14]||(y[14]=[I(" 提交录音 ",-1)])]),_:1},8,["disabled"]),i(D,{onClick:fe},{default:f(()=>[...y[15]||(y[15]=[I(" 跳过此题 ",-1)])]),_:1})])]),te.value?(c(),u("audio",{key:0,ref_key:"audioPlayer",ref:B,src:te.value,onEnded:Le},null,40,Kt)):E("",!0)]))])),C.value?E("",!0):(c(),u("div",zt,[t("div",{class:"timer-progress",style:De({width:`${ee.value}%`})},null,4),t("span",Ht,"剩余时间: "+g(L.value)+"秒",1)]))])])}}}),Zt=de(Xt,[["__scopeId","data-v-0e7b81ca"]]),es={class:"feedback-report"},ts={class:"report-container"},ss={class:"report-header"},ns={class:"score-display"},os={class:"score-value"},is={class:"header-info"},as={class:"report-date"},rs={class:"header-actions"},ls={class:"report-content"},cs={key:0,class:"special-notice all-skipped-notice"},us={key:1,class:"special-notice partially-answered-notice"},ds={key:2,class:"ai-insights-section"},ps={class:"insight-card"},vs={class:"insight-text"},gs={key:0,class:"insight-card"},fs={class:"insight-list"},ms={key:1,class:"insight-card"},hs={class:"insight-list"},ws={class:"dimensions-grid"},ys={class:"dimension-header"},ks={class:"dimension-content"},_s={key:0,class:"feedback-section strengths"},Cs={key:1,class:"feedback-section weaknesses"},Is={key:2,class:"feedback-section suggestions"},Ss={key:0,class:"feedback-section"},bs={key:1,class:"feedback-section"},As={key:2,class:"feedback-section"},Ps={key:0,class:"feedback-section"},$s={key:1,class:"feedback-section"},Os={key:2,class:"feedback-section"},Es={class:"answers-section"},Ts={class:"answers-list"},xs={class:"answer-header"},Fs={class:"question-number"},Rs={class:"answer-content"},Ls={class:"question"},qs={key:0,class:"audio-answer"},Ns=["src"],Us={key:1,class:"text-answer"},Ms={key:2,class:"reference-answer-box"},Qs={class:"reference-answer-header"},Gs={class:"reference-answer-content"},Ds={class:"english-answer"},js={class:"chinese-answer"},Vs=ue({__name:"FeedbackReport",props:{feedback:{},answers:{},jobLevel:{},industry:{}},emits:["restart"],setup(w){const e=w,{t:s}=Fe(),{speak:n}=Te(),d=F(new Map),v=G(()=>new Date().toLocaleString("zh-CN",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})),r=G(()=>[{key:"englishExpression",label:s("mockInterview.englishExpression"),score:e.feedback.englishExpression.score,data:e.feedback.englishExpression},{key:"ficoProfessionalism",label:s("mockInterview.ficoProfessionalism"),score:e.feedback.ficoProfessionalism.score,data:e.feedback.ficoProfessionalism},{key:"interviewSkills",label:s("mockInterview.interviewSkills"),score:e.feedback.interviewSkills.score,data:e.feedback.interviewSkills}]),S=G(()=>!e.answers||e.answers.length===0?!1:e.answers.every(l=>!l.answer.trim()||l.answer==="[跳过]"||l.answer==="[Skipped]")),k=G(()=>{if(!e.answers||e.answers.length===0)return!1;const l=e.answers.filter(o=>!o.answer.trim()||o.answer==="[跳过]"||o.answer==="[Skipped]").length;return l>0&&l<e.answers.length});function m(l){return l>=80?"excellent":l>=60?"good":"needs-improvement"}function a(l){return l>=80?"success":l>=60?"warning":"danger"}function R(l){return l>=80?"#4CAF50":l>=60?"#FF9800":"#F44336"}function P(l){if(!e.feedback.referenceAnswers)return;let o=e.feedback.referenceAnswers.find(T=>T.question===l);if(o)return o;const O=l.trim().toLowerCase().replace(/\s+/g," ");if(o=e.feedback.referenceAnswers.find(T=>T.question.trim().toLowerCase().replace(/\s+/g," ")===O),o)return o;const A=l.substring(0,40).trim().toLowerCase();return o=e.feedback.referenceAnswers.find(T=>T.question.toLowerCase().includes(A)),o||(o=e.feedback.referenceAnswers.find(T=>{const V=T.question.substring(0,40).trim().toLowerCase();return l.toLowerCase().includes(V)||T.question.toLowerCase().includes(A)}),o)}function _(l){if(!d.value.has(l)){const o=URL.createObjectURL(l);d.value.set(l,o)}return d.value.get(l)}async function C(l){await n(l)}async function b(){try{z.info("正在生成 PDF，请稍候...");const[{default:l},{default:o}]=await Promise.all([Ce(()=>import("./html2canvas.esm-CBrSDip1.js"),[]),Ce(()=>import("./jspdf.es.min-Bk2TC002.js").then(se=>se.j),__vite__mapDeps([2,0,1]))]),O=document.querySelector(".report-container");if(!O){z.error("找不到报告内容");return}const A=new o("p","mm","a4"),T=210,V=297,p=10,L=T-2*p,N=V-2*p,B=await l(O,{scale:3,useCORS:!0,logging:!1,backgroundColor:"#ffffff",allowTaint:!0}),J=B.height,Y=B.width,$=Y/L,x=Math.floor(N*$);let ee=0,H=1;for(;ee<J;){H>1&&A.addPage();const se=J-ee,K=Math.min(x,se),W=document.createElement("canvas");W.width=Y,W.height=K;const X=W.getContext("2d");X&&(X.fillStyle="#ffffff",X.fillRect(0,0,W.width,W.height),X.drawImage(B,0,ee,Y,K,0,0,Y,K));const ie=W.toDataURL("image/png",1),ve=K*L/Y;A.addImage(ie,"PNG",p,p,L,ve),ee+=K,H++}const te=e.jobLevel||"未指定",ne=e.industry||"未指定",oe=new Date().toISOString().slice(0,10),pe=`FICO面试报告_${te}_${ne}_${oe}.pdf`;A.save(pe),z.success("PDF 导出成功！")}catch(l){console.error("PDF export failed:",l),z.error("PDF 导出失败，请稍后重试")}}return Se(()=>{d.value.forEach(l=>URL.revokeObjectURL(l))}),(l,o)=>{const O=q("el-button"),A=q("el-icon"),T=q("el-tag"),V=q("el-progress");return c(),u("div",es,[t("div",ts,[t("div",ss,[t("div",ns,[t("div",{class:Ie(["score-circle",m(w.feedback.overallScore)])},[t("span",os,g(w.feedback.overallScore),1),o[1]||(o[1]=t("span",{class:"score-label"},"总分",-1))],2)]),t("div",is,[t("h2",null,g(h(s)("mockInterview.feedbackReport")),1),t("p",as,g(v.value),1)]),t("div",rs,[i(O,{icon:h(Ee),onClick:o[0]||(o[0]=p=>l.$emit("restart"))},{default:f(()=>[I(g(h(s)("mockInterview.restart")),1)]),_:1},8,["icon"]),i(O,{icon:h(Be),onClick:b},{default:f(()=>[I(g(h(s)("mockInterview.exportPDF")),1)]),_:1},8,["icon"])])]),t("div",ls,[S.value?(c(),u("div",cs,[i(A,{class:"notice-icon"},{default:f(()=>[i(h($e))]),_:1}),o[2]||(o[2]=t("div",{class:"notice-content"},[t("h4",null,"本次面试所有题目均已跳过"),t("p",null,"面试准备需要时间和勇气，开始学习就是进步的第一步。建议您："),t("ul",null,[t("li",null,"先从词汇模块开始，积累FICO专业术语"),t("li",null,"参考下方的面试题参考答案，学习标准回答思路"),t("li",null,"练习后再来尝试，每次进步都是成长")]),t("p",{class:"encouragement"},"继续加油，相信您一定能够掌握这些知识！")],-1))])):k.value?(c(),u("div",us,[i(A,{class:"notice-icon"},{default:f(()=>[i(h($e))]),_:1}),o[3]||(o[3]=t("div",{class:"notice-content"},[t("h4",null,"部分题目已跳过"),t("p",null,"您已经尝试回答了部分问题，这是很好的开始。对于跳过的题目，请参考下方的标准答案进行学习。")],-1))])):E("",!0),w.feedback.aiInsights?(c(),u("div",ds,[o[7]||(o[7]=t("h3",null,"AI 综合评估",-1)),t("div",ps,[t("h4",null,[i(A,null,{default:f(()=>[i(h(Je))]),_:1}),o[4]||(o[4]=I(" 总体评价 ",-1))]),t("p",vs,g(w.feedback.aiInsights.overallAssessment),1)]),w.feedback.aiInsights.careerRecommendations.length>0?(c(),u("div",gs,[t("h4",null,[i(A,null,{default:f(()=>[i(h(we))]),_:1}),o[5]||(o[5]=I(" 职业发展建议 ",-1))]),t("ul",fs,[(c(!0),u(M,null,j(w.feedback.aiInsights.careerRecommendations,(p,L)=>(c(),u("li",{key:L},g(p),1))),128))])])):E("",!0),w.feedback.aiInsights.skillGaps.length>0?(c(),u("div",ms,[t("h4",null,[i(A,null,{default:f(()=>[i(h(We))]),_:1}),o[6]||(o[6]=I(" 能力提升方向 ",-1))]),t("ul",hs,[(c(!0),u(M,null,j(w.feedback.aiInsights.skillGaps,(p,L)=>(c(),u("li",{key:L},g(p),1))),128))])])):E("",!0)])):E("",!0),t("div",ws,[(c(!0),u(M,null,j(r.value,p=>{var L,N,U,B,J,Y;return c(),u("div",{key:p.key,class:"dimension-card"},[t("div",ys,[t("h3",null,g(p.label),1),i(T,{type:a(p.score)},{default:f(()=>[I(g(p.score)+"分 ",1)]),_:2},1032,["type"])]),i(V,{percentage:p.score,color:R(p.score),"stroke-width":8},null,8,["percentage","color"]),t("div",ks,[p.data.strengths.length>0?(c(),u("div",_s,[t("h4",null,[i(A,null,{default:f(()=>[i(h(ye))]),_:1}),I(" "+g(h(s)("mockInterview.strengths")),1)]),t("ul",null,[(c(!0),u(M,null,j(p.data.strengths,($,x)=>(c(),u("li",{key:x},g($),1))),128))])])):E("",!0),p.data.weaknesses.length>0?(c(),u("div",Cs,[t("h4",null,[i(A,null,{default:f(()=>[i(h(Oe))]),_:1}),I(" "+g(h(s)("mockInterview.weaknesses")),1)]),t("ul",null,[(c(!0),u(M,null,j(p.data.weaknesses,($,x)=>(c(),u("li",{key:x},g($),1))),128))])])):E("",!0),p.data.suggestions.length>0?(c(),u("div",Is,[t("h4",null,[i(A,null,{default:f(()=>[i(h(re))]),_:1}),I(" "+g(h(s)("mockInterview.suggestions")),1)]),t("ul",null,[(c(!0),u(M,null,j(p.data.suggestions,($,x)=>(c(),u("li",{key:x},g($),1))),128))])])):E("",!0),p.key==="ficoProfessionalism"?(c(),u(M,{key:3},[((L=p.data.technicalAccuracy)==null?void 0:L.length)>0?(c(),u("div",Ss,[t("h4",null,[i(A,null,{default:f(()=>[i(h(ye))]),_:1}),o[8]||(o[8]=I(" 技术准确性 ",-1))]),t("ul",null,[(c(!0),u(M,null,j(p.data.technicalAccuracy,($,x)=>(c(),u("li",{key:`tech-${x}`},g($),1))),128))])])):E("",!0),((N=p.data.industryContext)==null?void 0:N.length)>0?(c(),u("div",bs,[t("h4",null,[i(A,null,{default:f(()=>[i(h(we))]),_:1}),o[9]||(o[9]=I(" 行业理解 ",-1))]),t("ul",null,[(c(!0),u(M,null,j(p.data.industryContext,($,x)=>(c(),u("li",{key:`industry-${x}`},g($),1))),128))])])):E("",!0),((U=p.data.keywordUsage)==null?void 0:U.length)>0?(c(),u("div",As,[t("h4",null,[i(A,null,{default:f(()=>[i(h(re))]),_:1}),o[10]||(o[10]=I(" 关键词使用 ",-1))]),t("ul",null,[(c(!0),u(M,null,j(p.data.keywordUsage,($,x)=>(c(),u("li",{key:`keyword-${x}`},g($),1))),128))])])):E("",!0)],64)):E("",!0),p.key==="interviewSkills"?(c(),u(M,{key:4},[((B=p.data.clarity)==null?void 0:B.length)>0?(c(),u("div",Ps,[t("h4",null,[i(A,null,{default:f(()=>[i(h(ye))]),_:1}),o[11]||(o[11]=I(" 清晰度 ",-1))]),t("ul",null,[(c(!0),u(M,null,j(p.data.clarity,($,x)=>(c(),u("li",{key:`clarity-${x}`},g($),1))),128))])])):E("",!0),((J=p.data.structure)==null?void 0:J.length)>0?(c(),u("div",$s,[t("h4",null,[i(A,null,{default:f(()=>[i(h(we))]),_:1}),o[12]||(o[12]=I(" 结构性 ",-1))]),t("ul",null,[(c(!0),u(M,null,j(p.data.structure,($,x)=>(c(),u("li",{key:`structure-${x}`},g($),1))),128))])])):E("",!0),((Y=p.data.completeness)==null?void 0:Y.length)>0?(c(),u("div",Os,[t("h4",null,[i(A,null,{default:f(()=>[i(h(re))]),_:1}),o[13]||(o[13]=I(" 完整性 ",-1))]),t("ul",null,[(c(!0),u(M,null,j(p.data.completeness,($,x)=>(c(),u("li",{key:`complete-${x}`},g($),1))),128))])])):E("",!0)],64)):E("",!0)])])}),128))]),t("div",Es,[o[20]||(o[20]=t("h3",null,"回答详情",-1)),t("div",Ts,[(c(!0),u(M,null,j(w.answers,(p,L)=>{var N,U;return c(),u("div",{key:L,class:"answer-item"},[t("div",xs,[t("span",Fs,"问题 "+g(L+1),1),i(O,{icon:h(Z),size:"small",text:"",onClick:B=>C(p.question)},{default:f(()=>[...o[14]||(o[14]=[I(" 播放问题 ",-1)])]),_:1},8,["icon","onClick"])]),t("div",Rs,[t("p",Ls,g(p.question),1),p.audioBlob?(c(),u("div",qs,[i(T,{type:"info"},{default:f(()=>[...o[15]||(o[15]=[I("语音回答",-1)])]),_:1}),t("audio",{src:_(p.audioBlob),controls:"",class:"audio-player"},null,8,Ns)])):(c(),u("div",Us,[i(T,{type:"info"},{default:f(()=>[...o[16]||(o[16]=[I("文字回答",-1)])]),_:1}),t("p",null,g(p.answer),1)])),P(p.question)?(c(),u("div",Ms,[t("div",Qs,[i(A,null,{default:f(()=>[i(h(re))]),_:1}),o[17]||(o[17]=t("span",null,"参考答案",-1))]),t("div",Gs,[t("div",Ds,[o[18]||(o[18]=t("span",{class:"answer-label"},"英文：",-1)),t("p",null,g((N=P(p.question))==null?void 0:N.englishAnswer),1)]),t("div",js,[o[19]||(o[19]=t("span",{class:"answer-label"},"中文：",-1)),t("p",null,g((U=P(p.question))==null?void 0:U.chineseAnswer),1)])])])):E("",!0)])])}),128))])])])])])}}}),Bs=de(Vs,[["__scopeId","data-v-8451757b"]]);class Js{constructor(){ae(this,"config",null)}async getConfig(){var e,s,n,d,v;if(!this.config){const r=await ce.loadConfig();this.config={apiKey:((e=r.glm)==null?void 0:e.apiKey)||"",baseUrl:((s=r.glm)==null?void 0:s.baseUrl)||"https://open.bigmodel.cn/api/paas/v4/chat/completions",model:((n=r.glm)==null?void 0:n.model)||"glm-4-flash",maxTokens:((d=r.glm)==null?void 0:d.maxTokens)||2e3,temperature:((v=r.glm)==null?void 0:v.temperature)||.7}}return this.config}async callGLM(e,s){var d,v;const n=await this.getConfig();if(!n.apiKey)throw new Error("GLM API key is not configured");try{const r=await fetch(n.baseUrl,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n.apiKey}`},body:JSON.stringify({model:n.model,messages:e,max_tokens:s||n.maxTokens,temperature:n.temperature})});if(!r.ok){const k=await r.json().catch(()=>({}));throw new Error(`GLM API error: ${r.status} ${JSON.stringify(k)}`)}return((v=(d=(await r.json()).choices[0])==null?void 0:d.message)==null?void 0:v.content)||""}catch(r){throw console.error("GLM API call failed:",r),r}}async callGLMWithRetry(e,s=3){let n=null;for(let d=0;d<s;d++)try{return await this.callGLM(e)}catch(v){n=v,console.warn(`GLM API call failed (attempt ${d+1}/${s}):`,v),d<s-1&&await new Promise(r=>setTimeout(r,Math.pow(2,d)*1e3))}throw n||new Error("GLM API call failed after retries")}isConfigured(){return this.getConfig().then(e=>!!e.apiKey&&e.apiKey.length>0)}}const le=new Js;class Ws{constructor(){ae(this,"feedbackCache",new Map)}buildEvaluationPrompt(e,s,n,d,v){return`You are a senior SAP FICO interview evaluation expert. Please provide a professional assessment of candidate's interview response.

Interview Question: ${e}
Candidate's Answer: ${s}
Job Level: ${n}
Industry: ${d}
Expected Competencies: ${v.join(", ")}

Please evaluate response across three dimensions (score 0-100 for each):

1. English Expression (30%)
   - Grammatical accuracy
   - Fluency and coherence
   - Professional terminology usage

2. FICO Professional Competence (40%)
   - Technical accuracy of FICO concepts
   - Understanding of industry scenarios
   - Usage of key FICO terminology

3. Interview Communication Skills (30%)
   - Completeness of answer
   - Logical structure
   - Use of examples and elaboration

Provide detailed, specific feedback that will help candidate improve.

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "englishExpression": {
    "score": 85,
    "strengths": ["Good grammar structure", "Clear communication"],
    "weaknesses": ["Some pronunciation issues with technical terms"],
    "suggestions": ["Practice pronouncing FICO terminology"]
  },
  "ficoProfessionalism": {
    "score": 75,
    "technicalAccuracy": ["Correct understanding of company code configuration"],
    "industryContext": ["Needs more industry-specific examples"],
    "keywordUsage": ["Used key terms like Company Code, Document Type"]
  },
  "interviewSkills": {
    "score": 80,
    "clarity": ["Answer was clear and direct"],
    "structure": ["Good logical flow"],
    "completeness": ["Covered main aspects thoroughly"]
  },
  "overallScore": 79,
  "aiInsights": {
    "overallAssessment": "The candidate demonstrates solid FICO foundational knowledge...",
    "careerRecommendations": ["Consider gaining more hands-on project experience"],
    "skillGaps": ["Limited exposure to real-world manufacturing scenarios"]
  }
}

Evaluate now.`}buildSessionEvaluationPrompt(e,s,n){const d=e.every(m=>!m.answer.trim()||m.answer==="[跳过]"||m.answer==="[Skipped]"||m.answer==="[语音回答]"&&!m.audioBlob),v=e.filter(m=>m.answer.trim()&&m.answer!=="[跳过]"&&m.answer!=="[Skipped]").length,r=e.map((m,a)=>{let R="";return(m.answer.trim()===""||m.answer==="[跳过]"||m.answer==="[Skipped]")&&(R="(Skipped)"),`Q${a+1}: ${m.question}
A${a+1}: ${m.answer||"[No answer provided]"} ${R}`}).join(`

`);let S="";return d?S=`
SPECIAL SITUATION - ALL QUESTIONS SKIPPED:
The candidate has skipped all ${e.length} questions in this interview session. This is understandable - interview preparation takes time and courage.

For your evaluation:
- Provide encouraging and constructive feedback
- Acknowledge that starting somewhere is first step to improvement
- Give a moderate baseline score (50-60 range) to allow room for growth
- Focus on learning recommendations and study resources
- Emphasize that practice makes progress
- Be motivational rather than critical
`:v<e.length/2&&(S=`
SPECIAL SITUATION - MOST QUESTIONS SKIPPED:
The candidate has only answered ${v} out of ${e.length} questions.

For your evaluation:
- Be encouraging and supportive
- Acknowledge questions that were attempted
- Provide constructive guidance for improvement
- Focus on building confidence
`),`You are a senior SAP FICO interview evaluation expert. Please provide a comprehensive professional assessment of candidate's entire interview session.

Job Level: ${s}
Industry: ${n}
Total Questions: ${e.length}
Questions Attempted: ${v}
${S}

Interview Session:
${r}

IMPORTANT EVALUATION INSTRUCTIONS:

1. You MUST FIRST generate reference answers for ALL questions, then evaluate FICO Professionalism by DIRECTLY COMPARING the candidate's answers against these reference answers.

2. For FICO Business Professionalism (40% weight), evaluate based on COMPARISON with reference answers:
   - Technical content accuracy: What correct FICO concepts from reference are present/absent in candidate's answer?
   - Key terminology coverage: What essential FICO keywords from reference are present/missing?
   - Completeness of technical points: What key technical points from reference are covered/missing?
   - Industry context relevance: Compared to reference, does the answer address industry-specific considerations?

3. Be OBJECTIVE and SPECIFIC in your feedback - state clearly what was covered vs missing:
   - List technical points from reference answer that ARE present in candidate's answer
   - List key FICO terminology that is MISSING from candidate's answer
   - List technical concepts that are INCORRECTLY explained compared to reference
   - For each feedback point, clearly indicate it came from comparing with reference answer

4. You MUST provide reference answers (2-3 sentences each) in BOTH English and Chinese for EVERY SINGLE QUESTION listed above. These should represent what an ideal ${s} level FICO consultant in ${n} industry should answer.

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "englishExpression": {
    "score": 82,
    "strengths": ["Consistently good grammar", "Professional vocabulary"],
    "weaknesses": ["Occasional hesitation"],
    "suggestions": ["Continue practicing to improve fluency"]
  },
  "ficoProfessionalism": {
    "score": 78,
    "strengths": ["Correctly explained Company Code configuration principles", "Mentioned key integration points"],
    "weaknesses": ["Missing Document Type posting logic details", "Did not cover fiscal year variant handling"],
    "suggestions": ["Study Document Posting configuration in depth", "Practice explaining fiscal year variants"]
  },
  "interviewSkills": {
    "score": 85,
    "clarity": ["Clear and structured responses"],
    "structure": ["Well-organized answers"],
    "completeness": ["Thorough coverage of topics"]
  },
  "overallScore": 81,
  "aiInsights": {
    "overallAssessment": "The candidate shows strong potential as a FICO consultant...",
    "careerRecommendations": ["Focus on gaining more project implementation experience"],
    "skillGaps": ["Consider deepening knowledge in Controlling module"]
  },
  "referenceAnswers": [
    {
      "question": "EXACT text of question 1 from interview",
      "englishAnswer": "A good English answer in 2-3 sentences...",
      "chineseAnswer": "中文参考答案..."
    },
    {
      "question": "EXACT text of question 2 from interview",
      "englishAnswer": "Another good answer...",
      "chineseAnswer": "另一个参考答案..."
    }
  ]
}

CRITICAL REMEMBER:
- You MUST include referenceAnswers for ALL ${e.length} questions
- For ficoProfessionalism feedback, base your assessment on DIRECT COMPARISON between candidate's answer and reference answer you generated
- Specify what technical points ARE covered, what are MISSING, what are INCORRECT
- Do not skip any question in referenceAnswers array

5. SCORE OBJECTIVELY based on ACTUAL answer quality:
   - Do NOT use template scores - evaluate each answer on its own merit
   - For junior level: 70-80 is a normal score, 85+ is excellent
   - Vary your scores and feedback based on the specific answers provided
   - If all answers are similar to previous evaluations, STILL evaluate them fairly based on quality
- Generate UNIQUE, SPECIFIC feedback for THIS evaluation session - do not repeat previous evaluations

Evaluate now.`}getCacheKey(e,s,n){return`${s}-${n}-${e.slice(0,50)}`}normalizeFeedback(e){return e.englishExpression.strengths||(e.englishExpression.strengths=[]),e.englishExpression.weaknesses||(e.englishExpression.weaknesses=[]),e.englishExpression.suggestions||(e.englishExpression.suggestions=[]),e.ficoProfessionalism.strengths||(e.ficoProfessionalism.strengths=[]),e.ficoProfessionalism.weaknesses||(e.ficoProfessionalism.weaknesses=[]),e.ficoProfessionalism.suggestions||(e.ficoProfessionalism.suggestions=[]),e.ficoProfessionalism.technicalAccuracy&&e.ficoProfessionalism.strengths.push(...e.ficoProfessionalism.technicalAccuracy),e.ficoProfessionalism.keywordUsage&&e.ficoProfessionalism.strengths.push(...e.ficoProfessionalism.keywordUsage),e.interviewSkills.strengths||(e.interviewSkills.strengths=[]),e.interviewSkills.weaknesses||(e.interviewSkills.weaknesses=[]),e.interviewSkills.suggestions||(e.interviewSkills.suggestions=[]),e.interviewSkills.clarity&&e.interviewSkills.strengths.push(...e.interviewSkills.clarity),e.interviewSkills.structure&&e.interviewSkills.strengths.push(...e.interviewSkills.structure),e.interviewSkills.completeness&&e.interviewSkills.strengths.push(...e.interviewSkills.completeness),e.aiInsights||(e.aiInsights={overallAssessment:"Good effort in interview.",careerRecommendations:[],skillGaps:[]}),e.aiInsights.careerRecommendations||(e.aiInsights.careerRecommendations=[]),e.aiInsights.skillGaps||(e.aiInsights.skillGaps=[]),e.referenceAnswers||(e.referenceAnswers=[]),e}getCompetencies(e){const s={junior:["Basic FI/CO knowledge","General Ledger","AP/AR basics","Document posting","Basic reporting"],middle:["Advanced configuration","Asset Accounting","Controlling (CO)","Cost Center accounting","Product Costing","Module integration"],senior:["S/4HANA migration","New General Ledger","Advanced CO-PA","Complex integrations","Strategic planning","Project leadership"]};return s[e]||s.junior}ensureAllReferenceAnswers(e,s,n,d){const v=new Map;return s.forEach(r=>{v.set(r.question,{englishAnswer:r.englishAnswer,chineseAnswer:r.chineseAnswer})}),e.forEach(r=>{v.has(r.question)||v.set(r.question,this.generateFallbackReferenceAnswer(r.question,n,d))}),e.map(r=>({question:r.question,englishAnswer:v.get(r.question).englishAnswer,chineseAnswer:v.get(r.question).chineseAnswer}))}generateFallbackReferenceAnswer(e,s,n){const d={junior:"初级顾问",middle:"中级顾问",senior:"高级顾问"}[s]||"顾问",v={manufacturing:"制造业",retail:"零售/电商",finance:"金融服务",energy:"能源与化工",pharma:"医药与生命科学",technology:"高科技与互联网",logistics:"物流与运输",public:"公共部门与教育",realestate:"房地产与建筑",other:"其他行业"}[n]||"相关行业";return{englishAnswer:`As a ${s} level FICO consultant in ${n} industry, I would explain that ${e.toLowerCase().replace("?","")} involves understanding core SAP FICO configuration principles and applying them based on business requirements. The key is to demonstrate knowledge of relevant module integration points and industry-specific considerations.`,chineseAnswer:`作为${v}行业的${d}，该问题的核心在于理解SAP FICO的配置原则并根据业务需求进行应用。关键在于展示对相关模块集成点和行业特定考虑因素的理解。建议结合实际项目经验和具体业务场景进行阐述。`}}async evaluateAnswer(e,s,n,d,v=!0){const r=this.getCacheKey(s,n,d);if(v&&this.feedbackCache.has(r))return this.feedbackCache.get(r);try{const S=this.getCompetencies(n),k=this.buildEvaluationPrompt(e,s,n,d,S);let a=(await le.callGLM([{role:"system",content:"You are a professional SAP FICO interview evaluator. Always respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Just raw JSON data."},{role:"user",content:k}],3e3)).trim();a.startsWith("```json")&&(a=a.slice(7)),a.startsWith("```")&&(a=a.slice(3)),a.endsWith("```")&&(a=a.slice(0,-3)),a=a.trim();const R=this.normalizeFeedback(JSON.parse(a));return this.feedbackCache.set(r,R),R}catch(S){throw console.error("Failed to evaluate answer with AI:",S),S}}async evaluateSession(e,s,n,d=!0){const v=`${s}-${n}-${e.map(r=>r.answer.slice(0,20)).join("-")}`;try{const r=this.buildSessionEvaluationPrompt(e,s,n);let k=(await le.callGLM([{role:"system",content:"You are a professional SAP FICO interview evaluator. Always respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Just raw JSON data."},{role:"user",content:r}],3e3)).trim();k.startsWith("```json")&&(k=k.slice(7)),k.startsWith("```")&&(k=k.slice(3)),k.endsWith("```")&&(k=k.slice(0,-3)),k=k.trim();const m=this.normalizeFeedback(JSON.parse(k));return m.referenceAnswers=this.ensureAllReferenceAnswers(e,m.referenceAnswers||[],s,n),this.feedbackCache.set(v,m),m}catch(r){throw console.error("Failed to evaluate session with AI:",r),r}}clearCache(){this.feedbackCache.clear()}async evaluateWithFallback(e,s,n,d){try{if(await le.isConfigured())return await this.evaluateAnswer(e,s,n,d)}catch(v){console.warn("AI evaluation failed, using fallback:",v)}return this.normalizeFeedback(this.getFallbackFeedback(s,n))}getFallbackFeedback(e,s){const n=e.split(/\s+/).length,d=/\b(SAP|FICO|GL|AP|AR|CO|Company Code|Document|Posting|Fiscal Year|Asset|Cost Center|Profit Center)\b/i.test(e);return{englishExpression:{score:n>30?70:60,strengths:n>30?["Provided a detailed response"]:["Attempted to answer"],weaknesses:n<30?["Response could be more detailed"]:[],suggestions:["Consider providing more specific examples"]},ficoProfessionalism:{score:d?75:50,technicalAccuracy:d?["Used FICO terminology"]:["Could include more technical terms"],industryContext:["Consider adding industry-specific context"],keywordUsage:d?["Appropriate terminology usage"]:["Include more FICO keywords"]},interviewSkills:{score:70,clarity:["Communication was clear"],structure:["Answer had some structure"],completeness:["Answer covered basic points"]},overallScore:d?72:60,aiInsights:{overallAssessment:`The candidate has ${s} level potential and should continue developing FICO expertise.`,careerRecommendations:["Continue studying FICO modules","Gain practical implementation experience"],skillGaps:["Consider deepening technical knowledge","Practice explaining complex concepts"]}}}}const Ys=new Ws;class Ks{constructor(){ae(this,"questionCache",new Map)}getCacheKey(e,s,n){return`${e}-${s}-${n}`}getJuniorLevelGuidelines(e){return{技术问题:`
JUNIOR LEVEL FOCUS - Questions MUST be basic and foundational:

PRIORITY TOPICS (Focus 70% of questions here):
1. BASIC CONCEPTS: Company code, Chart of Accounts, Document types, Posting keys, Fiscal year variant
2. BASIC CONFIGURATION: Account determination, Posting period variant, Depreciation key setup
3. DOCUMENTATION SKILLS: Test script writing, Configuration documentation, Simple error analysis
4. CORE PROCESS UNDERSTANDING: P2P (Procure to Pay), O2C (Order to Cash), Asset depreciation basics

ALLOWED QUESTION TYPES:
- "What is [concept]?" - Definition questions
- "How do you configure [basic setting]?" - Step-by-step configuration questions
- "What is the purpose of [T-code]?" - Transaction code purpose questions
- "Can you explain the difference between [X] and [Y]?" - Simple comparison questions
- "How do you handle [simple error scenario]?" - Basic troubleshooting questions

AVOID (Too advanced for junior):
- Complex integration scenarios
- Advanced configuration with multiple dependencies
- Production support/issue resolution
- Migration/Cutover activities
- Performance optimization
- Complex business scenarios requiring deep analysis

DIFFICULTY: ALL questions must be "basic" level difficulty`,真实场景问题:`
JUNIOR LEVEL FOCUS - Simple, practical scenarios:

SCENARIO TYPES (Keep scenarios simple and straightforward):
1. SIMPLE OPERATIONS: Vendor invoice posting, Asset master creation, Cost center maintenance
2. BASIC CONFIGURATION: Setting up a new GL account, Configuring document posting period
3. DOCUMENTATION: Writing a test script for basic scenarios, Documenting configuration steps
4. SIMPLE ERRORS: Posting errors due to period lock, Account determination errors, Document type issues

EXAMPLE SIMPLE SCENARIOS:
- "A vendor invoice cannot be posted because the posting period is closed. What do you check?"
- "You need to create a new G/L account. What information do you need?"
- "How do you write a test script for vendor invoice posting?"
- "What configuration is needed before creating an asset master record?"

DIFFICULTY: ALL scenarios must be "basic" - solvable with standard SAP knowledge`,项目经验:`
JUNIOR LEVEL FOCUS - Learning and support experience:

ACCEPTABLE PROJECT TOPICS:
- Assisting in configuration tasks under supervision
- Writing test scripts and execution
- Creating or updating configuration documentation
- Participating in data migration preparation
- Supporting UAT (User Acceptance Testing)
- Learning from senior consultants

QUESTION EXAMPLES:
- "What was your role in the FICO implementation project?"
- "Have you written test scripts? Can you describe the process?"
- "What configuration tasks have you assisted with?"
- "How do you document your configuration work?"`,自我介绍:`
JUNIOR LEVEL FOCUS - Career start and learning:

SUGGESTED QUESTIONS:
- "Please introduce yourself briefly."
- "Why did you choose SAP FICO as your career path?"
- "What SAP FICO topics have you learned so far?"
- "What are your expectations for this junior consultant position?"`,反问环节:`
JUNIOR LEVEL FOCUS - Learning-oriented questions:

This is for candidates to ask questions. Generate candidate questions that show interest in learning:
- Questions about training opportunities
- Questions about team structure and mentorship
- Questions about the technologies they will learn
- Questions about project exposure for junior consultants`}[e]||""}buildQuestionGenerationPrompt(e,s,n,d,v){var R,P,_,C,b,l;const r=this.getIndustryName(s),k={自我介绍:"Self Introduction",项目经验:"Project Experience",技术问题:"Technical Questions",真实场景问题:"Scenario-based Questions",反问环节:"Candidate Questions"}[n]||n;let m="";e==="junior"&&(m=`

`+this.getJuniorLevelGuidelines(n)+`

`);const a=e==="junior"?`

IMPORTANT FOR VARIETY: Generate UNIQUE questions each time. Avoid common/template questions. Use different angles, perspectives, and wording. Current timestamp reference: ${Date.now()}.`:"";return`You are a professional SAP FICO interviewer responsible for generating interview questions for a ${e} level FICO implementation consultant.

Job Requirements:
- Position: ${v.name}
- Experience: ${v.experience}
- Technical Skills: ${((P=(R=v.competencies)==null?void 0:R.technical)==null?void 0:P.join(", "))||"N/A"}
- Business Skills: ${((C=(_=v.competencies)==null?void 0:_.business)==null?void 0:C.join(", "))||"N/A"}
- Project Skills: ${((l=(b=v.competencies)==null?void 0:b.project)==null?void 0:l.join(", "))||"N/A"}

Target Industry: ${r} (${s})
Interview Stage: ${k}
Number of Questions Required: ${d}${m}${a}
Please generate ${d} professional interview questions following these guidelines:
1. Questions should be in English and professional
2. Each question should be specific and relevant to the job level and industry
3. Include expected keywords that a good answer should contain
4. Assign appropriate difficulty level (basic/intermediate/advanced)
5. Identify which competencies are being assessed
6. For junior level: Focus on foundational concepts, basic configuration, documentation skills, and simple operational scenarios${e==="junior"?'. All questions must be "basic" difficulty':""}

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": "unique_id_1",
      "englishQuestion": "Your English question here?",
      "chineseTranslation": "Your Chinese translation here",
      "difficulty": "basic",
      "competencies": ["competency1", "competency2"],
      "expectedAnswerKeywords": ["keyword1", "keyword2", "keyword3"],
      "stage": "${n}"
    }
  ]
}

Generate ${d} UNIQUE and CREATIVE questions now. Do NOT repeat common questions - be original and specific.${e==="junior"?" Keep them SIMPLE but vary the wording and angles.":""}`}getIndustryName(e){return{manufacturing:"Manufacturing",retail:"Retail/E-commerce",finance:"Financial Services"}[e]}async generateQuestions(e,s,n,d,v=!0){var S;const r=this.getCacheKey(e,s,n);if(v&&this.questionCache.has(r))return this.questionCache.get(r);try{const m=(S=(await ce.loadConfig()).jobLevels)==null?void 0:S[e];if(!m)throw new Error(`Job requirements not found for level: ${e}`);const a=this.buildQuestionGenerationPrompt(e,s,n,d,m),R=e==="junior"?"You are a professional SAP FICO interviewer conducting interviews for JUNIOR LEVEL consultants (0-2 years experience). Keep questions SIMPLE and FOUNDATIONAL. Focus on: (1) Basic concepts like company code, chart of accounts, document types, (2) Simple configuration steps, (3) Documentation and testing skills, (4) Basic process understanding. AVOID complex integration, advanced configuration, or production support scenarios. Always respond with valid JSON only, no markdown, no code blocks, no explanations.":"You are a professional SAP FICO interviewer. Always respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Just the raw JSON data.";let _=(await le.callGLM([{role:"system",content:R},{role:"user",content:a}],3e3)).trim();_.startsWith("```json")&&(_=_.slice(7)),_.startsWith("```")&&(_=_.slice(3)),_.endsWith("```")&&(_=_.slice(0,-3)),_=_.trim();const C=JSON.parse(_);if(!C.questions||!Array.isArray(C.questions))throw new Error("Invalid response format: questions array not found");const b=C.questions.map((l,o)=>({id:l.id||`${e}-${s}-${n}-${o}`,englishQuestion:l.englishQuestion||"",chineseTranslation:l.chineseTranslation||"",difficulty:l.difficulty||"intermediate",competencies:Array.isArray(l.competencies)?l.competencies:[],expectedAnswerKeywords:Array.isArray(l.expectedAnswerKeywords)?l.expectedAnswerKeywords:[],stage:l.stage||n}));return this.questionCache.set(r,b),b}catch(k){throw console.error("Failed to generate AI questions:",k),k}}async generateQuestionsForAllStages(e,s,n,d=!0){const r=(await ce.loadConfig()).interviewConfig.stages,S=e==="junior"?!1:d,k=[];for(const m of r)try{const a=await this.generateQuestions(e,s,m,n,S);k.push(...a)}catch(a){console.error(`Failed to generate questions for stage ${m}:`,a)}return k}clearCache(){this.questionCache.clear()}clearCacheForStage(e,s,n){const d=this.getCacheKey(e,s,n);this.questionCache.delete(d)}}const zs=new Ks,Hs={class:"mock-interview-page"},Xs={class:"page-content"},Zs={key:0,class:"generating-container"},en=ue({__name:"MockInterview",setup(w){const e=xe();He();const s=F("setup"),n=F({accent:"western",gender:"female",jobLevel:"junior",industry:"manufacturing"}),d=F([]),v=F([]),r=F(null),S=F(0),k=G(()=>({junior:"初级顾问",middle:"中级顾问",senior:"高级顾问"})[n.value.jobLevel]||""),m=G(()=>({manufacturing:"制造业",retail:"零售/电商",finance:"金融服务",energy:"能源与化工",pharma:"医药与生命科学",technology:"高科技与互联网",logistics:"物流与运输",public:"公共部门与教育",realestate:"房地产与建筑",other:"其他"})[n.value.industry]||"");async function a(C){var b;n.value=C,s.value="generating",S.value=0;try{const l=await ce.loadConfig(),o=(b=l.jobLevels)==null?void 0:b[C.jobLevel],O=l.interviewConfig.stages||["项目经验","技术问题","真实场景问题","反问环节"],A=(o==null?void 0:o.timePerQuestion)||180;n.value.timePerQuestion=A;const T=(o==null?void 0:o.questionsPerSession)||5,V=Math.ceil(T/O.length);S.value=20;const p=await zs.generateQuestionsForAllStages(C.jobLevel,C.industry,V);S.value=80;const L=p.slice(0,T);d.value=L.map(N=>({englishQuestion:N.englishQuestion,chineseTranslation:N.chineseTranslation})),S.value=100,await new Promise(N=>setTimeout(N,300)),s.value="session"}catch(l){console.error("Failed to generate interview questions:",l),z.error("生成面试题失败，请检查网络连接或稍后重试"),s.value="setup"}}async function R(C){console.log("handleInterviewComplete called with answers:",C),v.value=C;try{console.log("Setting phase to generating"),s.value="generating",S.value=20,console.log("Calling aiFeedbackService.evaluateSession..."),r.value=await Ys.evaluateSession(C,n.value.jobLevel,n.value.industry),console.log("Feedback received:",r.value),S.value=100,r.value&&r.value.overallScore&&C.filter(l=>l.answer.trim()&&l.answer!=="[跳过]"&&l.answer!=="[Skipped]").length>0&&e.addRecord({type:"mockInterview",title:`模拟面试 - ${k.value} (${m.value})`,score:r.value.overallScore}),await new Promise(b=>setTimeout(b,300)),console.log("Setting phase to feedback"),s.value="feedback"}catch(b){console.error("Failed to generate AI feedback:",b),r.value={englishExpression:{score:60,strengths:[],weaknesses:[],suggestions:[]},ficoProfessionalism:{score:60,strengths:[],weaknesses:[],suggestions:[]},interviewSkills:{score:60,strengths:[],weaknesses:[],suggestions:[]},overallScore:60,aiInsights:{overallAssessment:"评估暂时不可用，请稍后重试。",careerRecommendations:[],skillGaps:[]},referenceAnswers:C.map(l=>({question:l.question,englishAnswer:"暂无参考答案",chineseAnswer:"暂无参考答案"}))},z.error("评估失败，请稍后重试"),s.value="feedback"}}function P(){s.value="setup"}function _(){s.value="setup",v.value=[],r.value=null,d.value=[],S.value=0}return(C,b)=>{const l=q("el-icon"),o=q("el-progress");return c(),u("div",Hs,[i(Ke),t("div",Xs,[s.value==="generating"?(c(),u("div",Zs,[i(l,{class:"is-loading",size:60},{default:f(()=>[i(h(Ye))]),_:1}),b[0]||(b[0]=t("h3",null,"正在生成面试题...",-1)),t("p",null,"根据您选择的 "+g(k.value)+" 和 "+g(m.value)+" 岗位要求定制",1),i(o,{percentage:S.value,"stroke-width":10,class:"progress-bar"},null,8,["percentage"])])):s.value==="setup"?(c(),ke(mt,{key:1,onStart:a,onCancel:P})):s.value==="session"?(c(),ke(Zt,{key:2,questions:d.value,settings:n.value,onComplete:R,onCancel:P},null,8,["questions","settings"])):s.value==="feedback"?(c(),ke(Bs,{key:3,feedback:r.value,answers:v.value,"job-level":n.value.jobLevel,industry:n.value.industry,onRestart:_},null,8,["feedback","answers","job-level","industry"])):E("",!0)]),i(ze)])}}}),cn=de(en,[["__scopeId","data-v-286a2559"]]);export{cn as default};
