/* Lịch Sự Kiện – by Đức Anh Hoàng */
const $=s=>document.querySelector(s),PASS="29081989@",KEY="lich-events-v1",PKEY="lich-places-v1",SENT="lich-sent-v1";
const WD=["Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"];
const CAN=["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"],CHI=["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const day0=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const diffD=(a,b)=>Math.round((day0(a)-day0(b))/864e5);
const pad=n=>String(n).padStart(2,"0"),fmt=d=>pad(d.getDate())+"/"+pad(d.getMonth()+1),fmtY=d=>fmt(d)+"/"+d.getFullYear();

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



/* ===== Dữ liệu sự kiện =====
   {id,name,cal:"l"|"s" (âm/dương),m,a,b (tháng, từ ngày, đến ngày),repeat:true|false,year (chỉ khi một lần),time,note} */
const now=new Date(),T0=day0(now);
let events=[],places=[],serverV=+localStorage.getItem("lich-v")||0,mode=localStorage.getItem("lich-mode")||"local";
const norm=e=>e.cal?e:{id:e.id,name:e.name,cal:"l",m:e.lm,a:e.a,b:e.b,repeat:true,year:null,time:e.time||"",note:e.note||""};
try{events=(JSON.parse(localStorage.getItem(KEY)||"[]")||[]).map(norm)}catch{}
try{places=JSON.parse(localStorage.getItem(PKEY)||"[]")||[]}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(events));localStorage.setItem(PKEY,JSON.stringify(places))}catch{}}
if(!events.length&&!places.length&&!serverV&&!localStorage.getItem(KEY+"-init")){
  events=[{id:"e1",name:"Lễ hội Dinh Thầy Thím",cal:"l",m:9,a:14,b:16,repeat:true,year:null,time:"05:00",note:"Sự kiện bắt đầu lúc 5h sáng."}];
  try{localStorage.setItem(KEY+"-init","1")}catch{}save()}

/* ===== Đồng bộ dữ liệu dùng chung (/api/store). Không có máy chủ thì lưu trên máy ===== */
function applyServer(d){events=(d.events||[]).map(norm);places=d.places||[];serverV=d.v||0;try{localStorage.setItem("lich-v",serverV)}catch{}save()}
function setSync(s){$("#sync").textContent=s}
const hhmm=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())};
async function api(body,p=pwd){let r;
  try{r=await fetch("/api/store",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,password:p})})}catch{throw new Error("Không kết nối được máy chủ.")}
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Lỗi máy chủ ("+r.status+").");return j}
async function sync(){
  try{const r=await fetch("/api/store",{cache:"no-store"});
    if(r.status===404||r.status===503){mode="local";try{localStorage.setItem("lich-mode",mode)}catch{}setSync("Dữ liệu lưu trên máy này (chưa kết nối máy chủ).");return}
    if(!r.ok)throw 0;const d=await r.json();mode="server";try{localStorage.setItem("lich-mode",mode)}catch{}
    if(d.v&&d.v!==serverV){applyServer(d);renderAll()}
    setSync("Dữ liệu dùng chung · cập nhật lúc "+hhmm())}
  catch{setSync("Đang ngoại tuyến · hiển thị dữ liệu đã lưu trên máy.")}}
function localApply(kind,op,x){let L=kind==="events"?events:places;
  L=op==="delete"?L.filter(i=>i.id!==x.id):L.some(i=>i.id===x.id)?L.map(i=>i.id===x.id?x:i):[...L,x];
  if(kind==="events")events=L;else places=L;save()}
async function mutate(kind,op,x){
  if(mode!=="server")return localApply(kind,op,x);
  if(!serverV&&(events.length||places.length))await api({op:"import",events,places});
  applyServer(await api({op,kind,item:x,id:x.id}))}

const dateTxt=e=>(e.cal==="s"?"Dương ":"Âm ")+(e.a===e.b?e.a:e.a+"–"+e.b)+"/"+e.m;
const repTxt=e=>e.repeat?"Hằng năm":"Một lần · năm "+e.year;

/* Khoảng ngày dương lịch của sự kiện trong năm y (năm âm nếu là sự kiện âm lịch) */
function occ(e,y){
  if(e.cal==="s"){const n=new Date(y,e.m,0).getDate();return{s:new Date(y,e.m-1,Math.min(e.a,n)),en:new Date(y,e.m-1,Math.min(e.b,n))}}
  return{s:toSolar(e.a,e.m,y),en:toSolar(e.b,e.m,y)}}
/* Lần diễn ra kế tiếp (chưa kết thúc). Sự kiện một lần đã qua → null */
function nextOcc(e){let best=null;const Y=now.getFullYear(),ys=e.repeat?[Y-1,Y,Y+1]:[e.year];
  for(const y of ys){const o=occ(e,y);if(day0(o.en)>=T0&&(!best||o.s<best.s))best={s:o.s,en:o.en,y}}return best}
function eventsOn(date){const d=date.getDate(),m=date.getMonth()+1,y=date.getFullYear();let l=null;
  return events.filter(e=>{
    if(e.cal==="s")return e.m===m&&d>=e.a&&d<=e.b&&(e.repeat||e.year===y);
    l=l||toLunar(d,m,y);
    return !l.leap&&e.m===l.m&&l.d>=e.a&&l.d<=e.b&&(e.repeat||e.year===l.y)})}

/* ===== Hôm nay ===== */
const greet=()=>{const h=new Date().getHours();return"Xin chào "+(h>=5&&h<11?"buổi sáng":h>=11&&h<13?"buổi trưa":h>=13&&h<18?"buổi chiều":h>=18&&h<22?"buổi tối":"buổi đêm")};
function renderToday(){$("#hello").textContent=greet();const l=toLunar(now.getDate(),now.getMonth()+1,now.getFullYear());
  $("#wd").textContent=WD[now.getDay()];
  $("#solar").textContent=`Ngày ${now.getDate()} tháng ${now.getMonth()+1} năm ${now.getFullYear()}`;
  $("#lunar").textContent=`Âm lịch: ngày ${l.d} tháng ${l.m}${l.leap?" (nhuận)":""} năm ${canChi(l.y)}`}

/* ===== Ngày lễ ===== */
const HS={"1/1":"Tết Dương lịch","14/2":"Lễ tình nhân","8/3":"Quốc tế Phụ nữ","30/4":"Giải phóng miền Nam","1/5":"Quốc tế Lao động","1/6":"Quốc tế Thiếu nhi","2/9":"Quốc khánh","20/10":"Phụ nữ Việt Nam","20/11":"Nhà giáo Việt Nam","25/12":"Giáng sinh"};
const HL={"1/1":"Mùng 1 Tết Nguyên đán","2/1":"Mùng 2 Tết","3/1":"Mùng 3 Tết","15/1":"Rằm tháng Giêng","10/3":"Giỗ Tổ Hùng Vương","15/4":"Lễ Phật đản","5/5":"Tết Đoan Ngọ","15/7":"Lễ Vu Lan","15/8":"Tết Trung thu","23/12":"Ông Táo chầu trời"};
function holiday(d,l){const r=[],s=HS[d.getDate()+"/"+(d.getMonth()+1)];if(s)r.push(s);
  if(!l.leap){const k=HL[l.d+"/"+l.m];if(k)r.push(k);
    if(l.m===12){const n=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1),nl=toLunar(n.getDate(),n.getMonth()+1,n.getFullYear());if(nl.d===1&&nl.m===1)r.push("Giao thừa")}}
  return r}

/* ===== Lịch tháng ===== */
let vy=now.getFullYear(),vm=now.getMonth(),sel=T0;
const mS=$("#mSel"),yS=$("#ySel");
for(let i=0;i<12;i++)mS.add(new Option("Tháng "+(i+1),i));
for(let y=now.getFullYear()-5;y<=now.getFullYear()+15;y++)yS.add(new Option(y,y));
for(let i=1;i<=12;i++)$("#fM").add(new Option("Tháng "+i,i));
function renderCal(){mS.value=vm;yS.value=vy;
  const g=$("#cal");g.innerHTML=["T2","T3","T4","T5","T6","T7","CN"].map(d=>`<div class="dow">${d}</div>`).join("");
  const lead=(new Date(vy,vm,1).getDay()+6)%7,start=new Date(vy,vm,1-lead);
  for(let i=0;i<42;i++){const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);if(i>=35&&d.getMonth()!==vm)break;
    const l=toLunar(d.getDate(),d.getMonth()+1,d.getFullYear()),ev=eventsOn(d),hol=holiday(d,l),b=document.createElement("button");
    b.className="day"+(d.getMonth()!==vm?" out":"")+(d.getDay()===0?" sun":"")+(hol.length?" hol":"")+(ev.length?" ev":"")+(+d===+T0?" tdy":"")+(+d===+sel?" sel":"");
    b.innerHTML=`<span class="s">${d.getDate()}</span><span class="l">${l.d===1?l.d+"/"+l.m:l.d}</span>`;
    b.title=[...hol,...ev.map(e=>e.name+(e.time?" ("+e.time+")":""))].join("\n")||`Âm lịch: ${l.d}/${l.m}`;
    b.onclick=()=>{sel=d;if(d.getMonth()!==vm){vm=d.getMonth();vy=d.getFullYear()}renderCal();renderDetail();renderMonth()};
    g.append(b)}}
function renderDetail(){const l=toLunar(sel.getDate(),sel.getMonth()+1,sel.getFullYear()),ev=eventsOn(sel),hol=holiday(sel,l);
  $("#detail").innerHTML=`<b style="color:var(--text)">${WD[sel.getDay()]}, ${fmtY(sel)}</b> · <span class="lun">âm lịch ${l.d}/${l.m}</span>${hol.length?` · <span class="holt">${hol.join(", ")}</span>`:""}`+
   (ev.length?ev.map(e=>`<div class="it"><b>${esc(e.name)}</b><span class="tag">${dateTxt(e)}</span><span class="tag">${repTxt(e)}</span>${e.time?`<small>Bắt đầu lúc ${e.time}</small>`:""}${e.note?`<small>${esc(e.note)}</small>`:""}</div>`).join(""):`<div class="it">Không có sự kiện.</div>`)}
/* Danh sách sự kiện của tháng đang xem */
function renderMonth(){const n=new Date(vy,vm+1,0).getDate(),mp=new Map();
  for(let i=1;i<=n;i++)eventsOn(new Date(vy,vm,i)).forEach(e=>{const r=mp.get(e.id)||{e,f:i,l:i};r.l=i;mp.set(e.id,r)});
  $("#mTitle").textContent=`Sự kiện tháng ${vm+1}/${vy}`;
  const L=[...mp.values()].sort((a,b)=>a.f-b.f),box=$("#mList");
  box.innerHTML=L.length?L.map(r=>`<button class="mi" data-d="${r.f}"><span class="dt"><b>${r.f}</b>${r.l>r.f?`<small>đến ${r.l}</small>`:`<small>/${vm+1}</small>`}</span><span class="rb"><b>${esc(r.e.name)}</b><small>${dateTxt(r.e)} · ${repTxt(r.e)}${r.e.time?" · "+r.e.time:""}</small></span></button>`).join(""):`<div class="empty">Tháng này chưa có sự kiện.</div>`;
  const hl=[];for(let i=1;i<=n;i++){const d=new Date(vy,vm,i),h=holiday(d,toLunar(i,vm+1,vy));if(h.length)hl.push(`<div><b>${i}/${vm+1}</b> · ${h.join(", ")}</div>`)}
  if(hl.length)box.insertAdjacentHTML("beforeend",`<div class="hols">${hl.join("")}</div>`);
  box.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{sel=new Date(vy,vm,+b.dataset.d);renderCal();renderDetail()})}
mS.onchange=()=>{vm=+mS.value;renderCal();renderMonth()};yS.onchange=()=>{vy=+yS.value;renderCal();renderMonth()};
$("#prev").onclick=()=>{vm--;if(vm<0){vm=11;vy--}renderCal();renderMonth()};
$("#next").onclick=()=>{vm++;if(vm>11){vm=0;vy++}renderCal();renderMonth()};
$("#goToday").onclick=()=>{vy=now.getFullYear();vm=now.getMonth();sel=T0;renderCal();renderDetail();renderMonth()};

/* ===== Nhắc lịch: trước 7 ngày, trước 3 ngày, đang diễn ra. Sự kiện một lần hết hạn thì thôi ===== */
function remList(){const out=[],up=[];
  events.forEach(e=>{const o=nextOcc(e);if(!o)return;const dd=diffD(o.s,T0),it={e,o,dd,run:dd<=0};up.push(it);if(dd<=7)out.push(it)});
  const by=(a,b)=>a.o.s-b.o.s;return{out:out.sort(by),up:up.sort(by)}}
function renderNotes(){const{out,up}=remList(),nb=$("#nb");nb.hidden=!out.length;nb.textContent=out.length;
  $("#notes").innerHTML=out.length?out.map(n=>{const st=n.run?"now":n.dd<=3?"w3":"w7",lbl=n.run?"Đang diễn ra":n.dd<=3?"Nhắc lần 2":"Nhắc lần 1";
    return`<div class="rem ${st}"><div class="cnt"><b>${n.run?"Nay":n.dd}</b><small>${n.run?"đang diễn ra":"ngày nữa"}</small></div><div class="rb"><b>${esc(n.e.name)}</b><small>${fmt(n.o.s)}${n.o.en>n.o.s?" – "+fmt(n.o.en):""}/${n.o.en.getFullYear()} · ${dateTxt(n.e)}${n.e.time?" · "+n.e.time:""}</small>${n.e.note?`<small>${esc(n.e.note)}</small>`:""}<span class="chip">${lbl} · ${repTxt(n.e)}</span></div></div>`}).join("")
   :up.length?`<div class="empty">Không có nhắc nhở trong 7 ngày tới.<small>Sắp tới: <b>${esc(up[0].e.name)}</b> – ${fmtY(up[0].o.s)} (còn ${up[0].dd} ngày)</small></div>`:`<div class="empty">Chưa có sự kiện nào.</div>`;
  const pm=$("#perm"),ok="Notification"in window;
  pm.textContent=!ok?"Không hỗ trợ":Notification.permission==="granted"?"Đã bật thông báo":Notification.permission==="denied"?"Thông báo bị chặn":"Bật thông báo";
  if(ok&&Notification.permission==="granted"){let sent={};try{sent=JSON.parse(localStorage.getItem(SENT)||"{}")}catch{}
    out.forEach(n=>{const st=n.run?"now":n.dd<=3?"3":"7",k=n.e.id+"|"+n.o.y+"|"+st;
      if(!sent[k]){sent[k]=1;try{new Notification(n.e.name,{body:(n.run?"Đang diễn ra":"Còn "+n.dd+" ngày nữa")+(n.e.time?" · "+n.e.time:"")})}catch{}}});
    try{localStorage.setItem(SENT,JSON.stringify(sent))}catch{}}}
$("#perm").onclick=async()=>{if(!("Notification"in window))return alert("Trình duyệt chưa hỗ trợ thông báo.");await Notification.requestPermission();renderNotes()};

/* ===== Mật khẩu (nhập một lần, mở khoá 5 phút trong bộ nhớ trang) ===== */
const pw=$("#pw"),ed=$("#ed"),pl=$("#pl");let editing=null,unlockUntil=0,afterAuth=null,pwd="";
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
function auth(cb){if(Date.now()<unlockUntil)return cb();afterAuth=cb;$("#pwI").value="";$("#pwE").textContent="";pw.showModal();$("#pwI").focus()}
pw.addEventListener("close",()=>{afterAuth=null});
$("#pwF").onsubmit=async ev=>{ev.preventDefault();const v=$("#pwI").value;
  try{if(mode==="server")await api({op:"check"},v);else if(v!==PASS)throw new Error("Mật khẩu không đúng.");
    pwd=v;unlockUntil=Date.now()+3e5;const f=afterAuth;afterAuth=null;pw.close();if(f)f()}
  catch(e){$("#pwE").textContent=e.message||"Mật khẩu không đúng."}};
$("#addBtn").onclick=()=>auth(()=>{resetForm();renderList();ed.showModal()});

/* ===== Quản lý sự kiện ===== */
const radio=n=>document.querySelector(`input[name=${n}]:checked`).value;
const setRadio=(n,v)=>{document.querySelector(`input[name=${n}][value=${v}]`).checked=true};
function readForm(){let a=+$("#fA").value,b=+$("#fB").value;if(!a||!b)return null;
  const cal=radio("cal"),rep=radio("rep")==="y",mx=cal==="s"?31:30;if(b<a)[a,b]=[b,a];a=Math.min(Math.max(a,1),mx);b=Math.min(Math.max(b,1),mx);
  return{id:editing||"e"+Date.now(),name:$("#fN").value.trim(),cal,m:+$("#fM").value,a,b,repeat:rep,year:rep?null:(+$("#fY").value||now.getFullYear()),time:$("#fT").value,note:$("#fC").value.trim()}}
function syncForm(){const rep=radio("rep")==="y",cal=radio("cal");
  $("#fYw").hidden=rep;$("#fYl").textContent=cal==="l"?"Năm âm lịch":"Năm dương lịch";$("#fA").max=$("#fB").max=cal==="s"?31:30;
  const e=readForm(),p=$("#fP");p.textContent="";if(!e)return;
  try{const o=e.repeat?nextOcc(e):occ(e,e.year);if(!o)return;
    const pre=e.repeat?"Lần tới: ":"Ngày: ";
    if(cal==="l")p.textContent=pre+"dương lịch "+fmtY(o.s)+(o.en>o.s?" – "+fmtY(o.en):"");
    else{const l=toLunar(o.s.getDate(),o.s.getMonth()+1,o.s.getFullYear());p.textContent=pre+"âm lịch "+l.d+"/"+l.m+" (ngày bắt đầu)"}}catch{}}
function resetForm(){editing=null;$("#evF").reset();$("#fY").value=now.getFullYear();$("#fSave").textContent="Lưu sự kiện";$("#fTitle").textContent="Thêm sự kiện mới";syncForm()}
$("#fReset").onclick=resetForm;
$("#evF").addEventListener("input",syncForm);$("#evF").addEventListener("change",syncForm);
function renderList(){const L=$("#list");
  L.innerHTML=events.length?events.map(e=>{const past=!e.repeat&&!nextOcc(e);
    return`<div class="it"><b>${esc(e.name)}</b><span class="tag">${dateTxt(e)}</span><span class="tag">${repTxt(e)}</span>${past?`<span class="tag">Đã qua</span>`:""}<div class="acts"><button class="pill" data-e="${e.id}">Sửa</button><button class="pill danger" data-d="${e.id}">Xoá</button></div></div>`}).join(""):`<div class="empty">Chưa có sự kiện.</div>`;
  L.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{const e=events.find(x=>x.id===b.dataset.e);editing=e.id;
    $("#fN").value=e.name;setRadio("cal",e.cal);setRadio("rep",e.repeat?"y":"o");$("#fM").value=e.m;$("#fA").value=e.a;$("#fB").value=e.b;$("#fY").value=e.year||now.getFullYear();$("#fT").value=e.time||"";$("#fC").value=e.note||"";
    $("#fSave").textContent="Cập nhật";$("#fTitle").textContent="Sửa sự kiện";syncForm()});
  L.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{if(confirm("Xoá sự kiện này?")){try{await mutate("events","delete",{id:b.dataset.d});renderAll();renderList();resetForm()}catch(e){alert(e.message)}}})}
$("#evF").onsubmit=async ev=>{ev.preventDefault();const o=readForm();if(!o||!o.name)return;
  try{await mutate("events","upsert",o);resetForm();renderAll();renderList()}catch(e){alert(e.message)}};

/* ===== Thời tiết (Open-Meteo) – mô tả bằng chữ ===== */
const CN=["Nắng","Ít mây","Âm u","Sương mù","Mưa","Tuyết","Dông"];
const cat=c=>c<=1?0:c===2?1:c===3?2:c<=48?3:c<=67?4:c<=77?5:c<=82?4:c<=94?5:6;
function part(j,a,b){const cs=j.hourly.weather_code.slice(a,b),ps=j.hourly.precipitation_probability.slice(a,b),n=Array(7).fill(0);
  cs.forEach(c=>n[cat(c)]++);let k=n.indexOf(Math.max(...n));const pm=Math.max(0,...ps.map(x=>x||0));
  if(pm>=60&&k<4&&cs.some(c=>cat(c)>=4))k=cs.some(c=>cat(c)===6)?6:4;return[CN[k],pm]}
async function weather(lat,lon){try{
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&hourly=weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`);
  if(!r.ok)throw 0;const j=await r.json(),c=cat(j.current.weather_code);
  $("#wxT").textContent=Math.round(j.current.temperature_2m)+"°C";
  $("#wxD").textContent=c===0&&!j.current.is_day?"Trời quang":CN[c];
  $("#wxH").innerHTML=`Cao nhất ${Math.round(j.daily.temperature_2m_max[0])}°<br>Thấp nhất ${Math.round(j.daily.temperature_2m_min[0])}°`;
  $("#wxP").innerHTML=[["Sáng",6,12],["Chiều",12,18],["Tối",18,24]].map(([n,a,b])=>{const[t,p]=part(j,a,b);return`<div><small>${n}</small><b>${t}</b><small>Mưa ${p}%</small></div>`}).join("");
  $("#wxW").innerHTML=j.daily.time.map((d,i)=>{const dt=new Date(d+"T00:00");
    return`<div class="${i?"":"now"}"><small>${i?["CN","T2","T3","T4","T5","T6","T7"][dt.getDay()]:"Hôm nay"}</small><b>${CN[cat(j.daily.weather_code[i])]}</b><span>${Math.round(j.daily.temperature_2m_max[i])}°/${Math.round(j.daily.temperature_2m_min[i])}°</span><small>Mưa ${j.daily.precipitation_probability_max[i]??0}%</small></div>`}).join("")
 }catch{$("#wxD").textContent="Không tải được thời tiết";$("#wxH").textContent="Cần kết nối mạng."}}
/* Tên nơi người xem đang đứng (đổi toạ độ → địa danh chi tiết) */
async function placeName(lat,lon,acc){
  const get=async u=>{const r=await fetch(u);if(!r.ok)throw 0;return r.json()};
  try{const a=(await get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=vi&lat=${lat}&lon=${lon}`)).address||{};
    const n=[...new Set([acc<=100?a.road:null,a.quarter||a.suburb||a.village||a.hamlet||a.neighbourhood||a.town,a.city_district||a.county||a.city||a.municipality,a.state||a.region].filter(Boolean))].join(", ");if(n)return n}catch{}
  try{const j=await get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`);
    const n=[...new Set([j.locality,j.city,j.principalSubdivision].filter(Boolean))].join(", ");if(n)return n}catch{}
  return null}
const setLoc=s=>{$("#wxL").textContent=s};
let watchId=null;
/* Định vị chính xác: GPS độ chính xác cao, chờ tối đa ~12 giây để lấy kết quả tốt nhất */
function initWx(){
  const fb=msg=>{setLoc(msg+" – đang dùng Lâm Đồng (mặc định)");weather(11.94,108.44)};
  if(!navigator.geolocation)return fb("Thiết bị không hỗ trợ định vị");
  if(watchId!==null)navigator.geolocation.clearWatch(watchId);
  setLoc("Đang xác định vị trí chính xác…");
  let best=null,first=null,done=false,timer;
  const finish=async()=>{if(done||!best)return;done=true;clearTimeout(timer);navigator.geolocation.clearWatch(watchId);watchId=null;
    const{latitude:la,longitude:lo,accuracy:ac}=best.coords;
    if(first&&Math.abs(first.latitude-la)+Math.abs(first.longitude-lo)>.02)weather(la,lo);
    const n=await placeName(la,lo,ac),km=ac>=1000?(ac/1000).toFixed(1)+" km":Math.round(ac)+" m";
    setLoc("Vị trí của bạn: "+(n||`${la.toFixed(4)}, ${lo.toFixed(4)}`)+` (sai số ~${km})`)};
  watchId=navigator.geolocation.watchPosition(p=>{
    if(!first){first=p.coords;weather(p.coords.latitude,p.coords.longitude);setLoc("Đang tìm tên địa điểm…")}
    if(!best||p.coords.accuracy<best.coords.accuracy)best=p;
    if(p.coords.accuracy<=30)finish()},
   e=>{if(best)finish();else if(!done){done=true;clearTimeout(timer);fb(e&&e.code===1?"Chưa cho phép vị trí":"Không lấy được vị trí")}},
   {enableHighAccuracy:true,maximumAge:0,timeout:15000});
  timer=setTimeout(()=>{if(best)finish()},12000)}
$("#locBtn").onclick=initWx;

/* ===== Ghi chú địa điểm (không nhắc lịch) ===== */
let editingP=null;const openP=new Set();
const nrm=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
function renderPlaces(){const q=nrm($("#pSearch").value.trim());
  const L=places.filter(p=>!q||nrm(p.name).includes(q)||nrm(p.note).includes(q)).sort((a,b)=>a.name.localeCompare(b.name,"vi"));
  $("#pCount").textContent=q?`${L.length}/${places.length}`:places.length;
  $("#pList").innerHTML=L.length?L.map(p=>`<details class="pd" data-id="${esc(p.id)}"${openP.has(p.id)?" open":""}><summary>${esc(p.name)}</summary><div class="pb"><p>${esc(p.note)}</p><div class="acts"><button class="pill sm" data-pe="${esc(p.id)}">Sửa</button><button class="pill sm danger" data-pd="${esc(p.id)}">Xoá</button></div></div></details>`).join(""):`<div class="empty">${places.length?"Không tìm thấy địa điểm phù hợp.":"Chưa có ghi chú địa điểm nào."}</div>`;
  document.querySelectorAll("details.pd").forEach(d=>d.addEventListener("toggle",()=>{d.open?openP.add(d.dataset.id):openP.delete(d.dataset.id)}));
  document.querySelectorAll("[data-pe]").forEach(b=>b.onclick=()=>auth(()=>openPlace(places.find(x=>x.id===b.dataset.pe))));
  document.querySelectorAll("[data-pd]").forEach(b=>b.onclick=()=>auth(async()=>{if(confirm("Xoá địa điểm này?")){try{await mutate("places","delete",{id:b.dataset.pd});renderPlaces()}catch(e){alert(e.message)}}}))}
function openPlace(p){editingP=p?p.id:null;$("#plTitle").textContent=p?"Sửa địa điểm":"Thêm địa điểm";$("#plN").value=p?p.name:"";$("#plC").value=p?p.note:"";pl.showModal();$("#plN").focus()}
$("#pAdd").onclick=()=>auth(()=>openPlace(null));
$("#pSearch").addEventListener("input",renderPlaces);
$("#plF").onsubmit=async ev=>{ev.preventDefault();const o={id:editingP||"p"+Date.now(),name:$("#plN").value.trim(),note:$("#plC").value.trim()};if(!o.name||!o.note)return;
  try{await mutate("places","upsert",o);pl.close();$("#pSearch").value="";renderPlaces()}catch(e){alert(e.message)}};

function renderAll(){renderToday();renderCal();renderDetail();renderMonth();renderNotes();renderPlaces()}
if(typeof document!=="undefined"&&!globalThis.__TEST__){
  renderAll();initWx();resetForm();sync();
  setInterval(sync,30000);setInterval(()=>{$("#hello").textContent=greet()},6e4);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync()});addEventListener("online",sync);
  setInterval(()=>{if(day0(new Date())-T0)location.reload();else renderNotes()},3600000);
  if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}
