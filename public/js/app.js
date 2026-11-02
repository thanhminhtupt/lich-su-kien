const $=s=>document.querySelector(s), PASS="29081989@", KEY="lich-events-v1", SENT="lich-sent-v1";
const WD=["Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"];
const CAN=["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"],CHI=["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const day0=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const diffD=(a,b)=>Math.round((day0(a)-day0(b))/864e5);

/* ===== Âm lịch (thuật toán Hồ Ngọc Đức, múi giờ +7) ===== */
const TZ=7,PI=Math.PI,fl=Math.floor;
function jdFrom(d,m,y){const a=fl((14-m)/12),Y=y+4800-a,M=m+12*a-3;let j=d+fl((153*M+2)/5)+365*Y+fl(Y/4)-fl(Y/100)+fl(Y/400)-32045;if(j<2299161)j=d+fl((153*M+2)/5)+365*Y+fl(Y/4)-32083;return j}
function jdTo(j){let b,c;if(j>2299160){const a=j+32044;b=fl((4*a+3)/146097);c=a-fl(b*146097/4)}else{b=0;c=j+32082}
 const d=fl((4*c+3)/1461),e=c-fl(1461*d/4),m=fl((5*e+2)/153);return[e-fl((153*m+2)/5)+1,m+3-12*fl(m/10),b*100+d-4800+fl(m/10)]}
function newMoon(k){const T=k/1236.85,T2=T*T,T3=T2*T,r=PI/180;let J=2415020.75933+29.53058868*k+.0001178*T2-.000000155*T3+.00033*Math.sin((166.56+132.87*T-.009173*T2)*r);
 const M=359.2242+29.10535608*k-.0000333*T2-.00000347*T3,Mp=306.0253+385.81691806*k+.0107306*T2+.00001236*T3,F=21.2964+390.67050646*k-.0016528*T2-.00000239*T3,s=Math.sin;
 const C=(.1734-.000393*T)*s(M*r)+.0021*s(2*r*M)-.4068*s(Mp*r)+.0161*s(r*2*Mp)-.0004*s(r*3*Mp)+.0104*s(r*2*F)-.0051*s(r*(M+Mp))-.0074*s(r*(M-Mp))+.0004*s(r*(2*F+M))-.0004*s(r*(2*F-M))-.0006*s(r*(2*F+Mp))+.001*s(r*(2*F-Mp))+.0005*s(r*(2*Mp+M));
 const dt=T<-11?.001+.000839*T+.0002261*T2-.00000845*T3-.000000081*T*T3:-.000278+.000265*T+.000262*T2;return J+C-dt}
const nmDay=k=>fl(newMoon(k)+.5+TZ/24);
function sunLong(j){const T=(j-2451545.5-TZ/24)/36525,T2=T*T,r=PI/180,M=357.5291+35999.0503*T-.0001559*T2-.00000048*T*T2,L0=280.46645+36000.76983*T+.0003032*T2;
 let L=(L0+(1.9146-.004817*T-.000014*T2)*Math.sin(r*M)+(.019993-.000101*T)*Math.sin(2*r*M)+.00029*Math.sin(3*r*M))*r;L-=PI*2*fl(L/(PI*2));return fl(L/PI*6)}
function lm11(y){const off=jdFrom(31,12,y)-2415021,k=fl(off/29.530588853);let n=nmDay(k);if(sunLong(n)>=9)n=nmDay(k-1);return n}
function leapOff(a){const k=fl((a-2415021.076998695)/29.530588853+.5);let last=0,i=1,arc=sunLong(nmDay(k+i));do{last=arc;i++;arc=sunLong(nmDay(k+i))}while(arc!=last&&i<14);return i-1}
function toLunar(d,m,y){const dn=jdFrom(d,m,y),k=fl((dn-2415021.076998695)/29.530588853);let ms=nmDay(k+1);if(ms>dn)ms=nmDay(k);
 let a=lm11(y),b=a,ly;if(a>=ms){ly=y;a=lm11(y-1)}else{ly=y+1;b=lm11(y+1)}
 const ld=dn-ms+1,df=fl((ms-a)/29);let leap=0,lmn=df+11;
 if(b-a>365){const lo=leapOff(a);if(df>=lo){lmn=df+10;if(df==lo)leap=1}}
 if(lmn>12)lmn-=12;if(lmn>=11&&df<4)ly-=1;return{d:ld,m:lmn,y:ly,leap}}
function toSolar(ld,lmn,ly){let a,b;if(lmn<11){a=lm11(ly-1);b=lm11(ly)}else{a=lm11(ly);b=lm11(ly+1)}
 const k=fl(.5+(a-2415021.076998695)/29.530588853);let off=lmn-11;if(off<0)off+=12;
 if(b-a>365&&off>=leapOff(a))off+=1;const[d,m,y]=jdTo(nmDay(k+off)+ld-1);return new Date(y,m-1,d)}
const canChi=y=>CAN[(y+6)%10]+" "+CHI[(y+8)%12];

/* ===== Dữ liệu ===== */
let events=[];
try{events=JSON.parse(localStorage.getItem(KEY)||"null")||[]}catch{}
if(!events.length&&!localStorage.getItem(KEY+"-init")){
  events=[{id:"e1",name:"Lễ hội Dinh Thầy Thím",lm:9,a:14,b:16,time:"05:00",note:"Sự kiện bắt đầu lúc 5h sáng."}];
  try{localStorage.setItem(KEY+"-init","1")}catch{}save()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(events))}catch{}}
const eventsOn=date=>{const l=toLunar(date.getDate(),date.getMonth()+1,date.getFullYear());
  return l.leap?[]:events.filter(e=>e.lm===l.m&&l.d>=e.a&&l.d<=e.b)};

/* ===== Hôm nay ===== */
const now=new Date(),T0=day0(now);
function renderToday(){const l=toLunar(now.getDate(),now.getMonth()+1,now.getFullYear());
  $("#wd").textContent=WD[now.getDay()];
  $("#solar").textContent=`Ngày ${now.getDate()} tháng ${now.getMonth()+1} năm ${now.getFullYear()}`;
  $("#lunar").textContent=`Âm lịch: ngày ${l.d} tháng ${l.m}${l.leap?" (nhuận)":""} năm ${canChi(l.y)}`}

/* ===== Lịch tháng ===== */
let vy=now.getFullYear(),vm=now.getMonth(),sel=T0;
const mS=$("#mSel"),yS=$("#ySel");
for(let i=0;i<12;i++)mS.add(new Option("Tháng "+(i+1),i));
for(let y=now.getFullYear()-5;y<=now.getFullYear()+15;y++)yS.add(new Option(y,y));
for(let i=1;i<=12;i++)$("#fM").add(new Option("Tháng "+i,i));
function renderCal(){mS.value=vm;yS.value=vy;
  const g=$("#cal");g.innerHTML=["T2","T3","T4","T5","T6","T7","CN"].map(d=>`<div class="dow">${d}</div>`).join("");
  const first=new Date(vy,vm,1),lead=(first.getDay()+6)%7,start=new Date(vy,vm,1-lead);
  for(let i=0;i<42;i++){const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);if(i>=35&&d.getMonth()!==vm)break;
    const l=toLunar(d.getDate(),d.getMonth()+1,d.getFullYear()),ev=eventsOn(d),b=document.createElement("button");
    b.className="day"+(d.getMonth()!==vm?" out":"")+(ev.length?" ev":"")+(+d===+T0?" today":"")+(+d===+sel?" sel":"");
    b.innerHTML=`<span class="s">${d.getDate()}</span><span class="l">${l.d===1?l.d+"/"+l.m:l.d}</span>`;
    b.title=ev.length?ev.map(e=>e.name+(e.time?" ("+e.time+")":"")).join("\n"):`Âm lịch: ${l.d}/${l.m}`;
    b.onclick=()=>{sel=d;if(d.getMonth()!==vm){vm=d.getMonth();vy=d.getFullYear()}renderCal();renderDetail()};
    g.append(b)}}
function renderDetail(){const l=toLunar(sel.getDate(),sel.getMonth()+1,sel.getFullYear()),ev=eventsOn(sel);
  $("#detail").innerHTML=`<b style="color:var(--text)">${WD[sel.getDay()]}, ${sel.getDate()}/${sel.getMonth()+1}/${sel.getFullYear()}</b> · âm lịch ${l.d}/${l.m}`+
   (ev.length?ev.map(e=>`<div class="item"><b>${esc(e.name)}</b><span class="tag">Âm ${e.a}–${e.b}/${e.lm}</span>${e.time?`<small>Bắt đầu lúc ${e.time}</small>`:""}${e.note?`<small>${esc(e.note)}</small>`:""}</div>`).join(""):`<div class="item muted">Không có sự kiện.</div>`)}
mS.onchange=()=>{vm=+mS.value;renderCal()};yS.onchange=()=>{vy=+yS.value;renderCal()};
$("#prev").onclick=()=>{vm--;if(vm<0){vm=11;vy--}renderCal()};
$("#next").onclick=()=>{vm++;if(vm>11){vm=0;vy++}renderCal()};
$("#goToday").onclick=()=>{vy=now.getFullYear();vm=now.getMonth();sel=T0;renderCal();renderDetail()};

/* ===== Thông báo: trước 7 ngày và 3 ngày ===== */
function nextOcc(e){let best=null;
  for(let y=now.getFullYear()-1;y<=now.getFullYear()+1;y++){const s=toSolar(e.a,e.lm,y),en=toSolar(e.b,e.lm,y);
    if(day0(en)>=T0&&(!best||s<best.s))best={s,en,y}}return best}
function renderNotes(){const out=[];
  events.forEach(e=>{const o=nextOcc(e);if(!o)return;const dd=diffD(o.s,T0);
    if(dd<=0&&diffD(o.en,T0)>=0)out.push({e,o,dd,msg:"Đang diễn ra",stage:"now"});
    else if(dd>0&&dd<=3)out.push({e,o,dd,msg:`Còn ${dd} ngày nữa (nhắc lần 2)`,stage:"3"});
    else if(dd>3&&dd<=7)out.push({e,o,dd,msg:`Còn ${dd} ngày nữa (nhắc lần 1)`,stage:"7"})});
  out.sort((a,b)=>a.dd-b.dd);
  const nb=$("#nb");nb.hidden=!out.length;nb.textContent=out.length;
  $("#notes").innerHTML=out.length?out.map(n=>`<div class="item"><b>${esc(n.e.name)}</b><span class="tag">${n.msg}</span><small>${n.o.s.getDate()}/${n.o.s.getMonth()+1} – ${n.o.en.getDate()}/${n.o.en.getMonth()+1}/${n.o.en.getFullYear()} dương lịch (âm ${n.e.a}–${n.e.b}/${n.e.lm})${n.e.time?" · "+n.e.time:""}</small>${n.e.note?`<small>${esc(n.e.note)}</small>`:""}</div>`).join(""):`<div class="muted">Chưa có sự kiện nào trong 7 ngày tới.</div>`;
  if("Notification"in window&&Notification.permission==="granted"){let sent={};try{sent=JSON.parse(localStorage.getItem(SENT)||"{}")}catch{}
    out.forEach(n=>{const k=n.e.id+"|"+n.o.y+"|"+n.stage;if(!sent[k]){sent[k]=1;new Notification(n.e.name,{body:n.msg+(n.e.time?" · "+n.e.time:"")})}});
    try{localStorage.setItem(SENT,JSON.stringify(sent))}catch{}}}
$("#perm").onclick=async()=>{if(!("Notification"in window))return alert("Trình duyệt chưa hỗ trợ thông báo.");await Notification.requestPermission();renderNotes()};

/* ===== Mật khẩu & quản lý sự kiện ===== */
const pw=$("#pw"),ed=$("#ed");let editing=null;
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
$("#addBtn").onclick=()=>{$("#pwI").value="";$("#pwE").textContent="";pw.showModal();$("#pwI").focus()};
$("#pwF").onsubmit=ev=>{ev.preventDefault();if($("#pwI").value===PASS){pw.close();resetForm();renderList();ed.showModal()}else $("#pwE").textContent="Mật khẩu không đúng."};
function resetForm(){editing=null;$("#evF").reset();$("#fSave").textContent="Lưu sự kiện"}
$("#fReset").onclick=resetForm;
function renderList(){$("#list").innerHTML=events.length?events.map(e=>`<div class="item"><b>${esc(e.name)}</b><span class="tag">Âm ${e.a}–${e.b}/${e.lm}</span><div class="acts" style="justify-content:flex-start;margin:6px 0 0"><button data-e="${e.id}">Sửa</button><button class="danger" data-d="${e.id}">Xoá</button></div></div>`).join(""):`<div class="muted">Chưa có sự kiện.</div>`;
  $("#list").querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{const e=events.find(x=>x.id===b.dataset.e);editing=e.id;$("#fN").value=e.name;$("#fM").value=e.lm;$("#fA").value=e.a;$("#fB").value=e.b;$("#fT").value=e.time||"";$("#fC").value=e.note||"";$("#fSave").textContent="Cập nhật"});
  $("#list").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("Xoá sự kiện này?")){events=events.filter(x=>x.id!==b.dataset.d);save();renderAll();renderList();resetForm()}})}
$("#evF").onsubmit=ev=>{ev.preventDefault();let a=+$("#fA").value,b=+$("#fB").value;if(b<a)[a,b]=[b,a];
  const o={id:editing||"e"+Date.now(),name:$("#fN").value.trim(),lm:+$("#fM").value,a,b,time:$("#fT").value,note:$("#fC").value.trim()};
  events=editing?events.map(x=>x.id===editing?o:x):[...events,o];save();resetForm();renderAll();renderList()};

/* ===== Thời tiết (Open-Meteo) ===== */
const WC=c=>c===0?["☀️","Trời quang"]:c<=2?["🌤️","Ít mây"]:c===3?["☁️","Nhiều mây"]:c<=48?["🌫️","Sương mù"]:c<=57?["🌦️","Mưa phùn"]:c<=67?["🌧️","Mưa"]:c<=77?["❄️","Tuyết"]:c<=82?["🌧️","Mưa rào"]:["⛈️","Dông"];
async function weather(lat,lon,label){try{
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`),j=await r.json();
  const [e,t]=WC(j.current.weather_code);$("#wxE").textContent=e;$("#wxT").textContent=Math.round(j.current.temperature_2m)+"°C";$("#wxL").textContent=t+" · "+label;
  $("#wxW").innerHTML=j.daily.time.map((d,i)=>{const dt=new Date(d+"T00:00");return`<div><b>${i?["CN","T2","T3","T4","T5","T6","T7"][dt.getDay()]:"Nay"}</b><span class="e">${WC(j.daily.weather_code[i])[0]}</span>${Math.round(j.daily.temperature_2m_max[i])}° <span style="opacity:.6">${Math.round(j.daily.temperature_2m_min[i])}°</span></div>`}).join("")
 }catch{$("#wxL").textContent="Không tải được thời tiết (cần kết nối mạng)."}}
function initWx(){const fb=()=>weather(11.94,108.44,"Lâm Đồng (mặc định)");
  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>weather(p.coords.latitude,p.coords.longitude,"Vị trí của bạn"),fb,{timeout:8000});else fb()}

function renderAll(){renderToday();renderCal();renderDetail();renderNotes()}
renderAll();initWx();
setInterval(()=>{if(day0(new Date())-T0)location.reload();else renderNotes()},3600000);

if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
