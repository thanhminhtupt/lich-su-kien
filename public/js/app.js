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
let srvSize=0,warn="";
async function sync(){
  try{const r=await fetch("/api/store",{cache:"no-store"});
    if(r.status===404||r.status===503){mode="local";try{localStorage.setItem("lich-mode",mode)}catch{}warn="";if(pruneLocal())renderAll();setSync("Dữ liệu lưu trên máy này (chưa kết nối máy chủ).");renderStatus();return}
    if(!r.ok){let m="";try{m=(await r.json()).error||""}catch{}
      warn=m||(r.status===402?"Vercel báo dự án bị tạm dừng hoặc hết hạn mức gói miễn phí (mã 402).":r.status===429?"Vercel báo vượt giới hạn truy cập (mã 429), hãy thử lại sau.":"Máy chủ Vercel đang báo lỗi (mã "+r.status+").");
      setSync("Chưa đồng bộ được với máy chủ.");renderStatus();return}
    const d=await r.json();mode="server";try{localStorage.setItem("lich-mode",mode)}catch{}srvSize=d.size||0;warn="";
    if(d.v&&d.v!==serverV){applyServer(d);renderAll()}
    setSync("Dữ liệu dùng chung · cập nhật lúc "+hhmm());renderStatus()}
  catch{setSync("Đang ngoại tuyến · hiển thị dữ liệu đã lưu trên máy.")}}
/* Dung lượng lưu trữ: máy chủ (Upstash Free 250 MB) hoặc bộ nhớ trình duyệt (~5 MB) */
const fmtB=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(1)+" KB":(n/1048576).toFixed(n<1e7?2:0)+" MB";
function localBytes(){let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=(k.length+(localStorage.getItem(k)||"").length)*2}}catch{}return n}
function renderStatus(){const srv=mode==="server",used=srv?srvSize:localBytes(),lim=(srv?250:5)*1048576,pct=used/lim*100;
  const ps=pct<.01?"<0,01":pct.toLocaleString("vi-VN",{maximumFractionDigits:2});
  let w=warn;if(!w&&pct>=80)w=srv?"Sắp hết dung lượng lưu trữ miễn phí (Upstash/Vercel).":"Bộ nhớ trình duyệt sắp đầy.";
  $("#stor").innerHTML=`${srv?"Lưu trữ":"Lưu trữ trên máy"}: ${ps}% (${fmtB(used)} / ${fmtB(lim)})`+(w?`<span class="warn">${esc(w)}</span>`:"")}
/* Chế độ cục bộ: sự kiện một lần kết thúc quá 30 ngày thì tự xoá (máy chủ cũng làm vậy). Hằng năm và địa điểm luôn được giữ. */
function pruneLocal(){const n=events.length;
  events=events.filter(e=>{if(e.repeat)return true;try{return diffD(T0,occ(e,e.year).en)<=30}catch{return true}});
  if(events.length!==n){save();return true}return false}
function localApply(kind,op,x){let L=kind==="events"?events:places;
  L=op==="delete"?L.filter(i=>i.id!==x.id):L.some(i=>i.id===x.id)?L.map(i=>i.id===x.id?x:i):[...L,x];
  if(kind==="events")events=L;else places=L;save()}
const nameKey=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/\s+/g," ").trim();
async function mutate(kind,op,x){
  if(op==="upsert"&&(kind==="events"?events:places).some(i=>i.id!==x.id&&nameKey(i.name)===nameKey(x.name)))
    throw new Error((kind==="events"?"Tên sự kiện":"Tên địa điểm")+` "${x.name}" đã tồn tại. Hãy dùng tên khác.`);
  if(mode!=="server")return localApply(kind,op,x);
  if(!serverV&&(events.length||places.length))await api({op:"import",events,places});
  applyServer(await api({op,kind,item:x,id:x.id}))}

const dateTxt=e=>(e.cal==="s"?"Dương ":"Âm ")+(e.a===e.b?e.a:e.a+"–"+e.b)+"/"+e.m;
const repTxt=e=>e.repeat?(e.every===2?"2 năm/lần · từ "+e.year:"Hằng năm"):"Một lần · năm "+e.year;
const spotsHtml=e=>(e.spots||[]).map(s=>`<span class="evs">${esc(s.n||"")}${s.n&&s.u?" - ":""}${s.u?`<a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">Đường Đi</a>`:""}</span>`).join("");
const repIcon=e=>!e.repeat?"1️⃣":e.every===2?"2️⃣":"🔁";
const repChip=(e,c="chip")=>`<span class="${c} ${repCls(e)}">${repIcon(e)} ${esc(repTxt(e))}</span>`;
const repCls=e=>!e.repeat?"t-o":e.every===2?"t-t":"t-y";
const yearOk=(e,y)=>e.repeat?(e.every===2?(((y-e.year)%2)+2)%2===0:true):e.year===y;

/* Khoảng ngày dương lịch của sự kiện trong năm y (năm âm nếu là sự kiện âm lịch) */
function occ(e,y){
  if(e.cal==="s"){const n=new Date(y,e.m,0).getDate();return{s:new Date(y,e.m-1,Math.min(e.a,n)),en:new Date(y,e.m-1,Math.min(e.b,n))}}
  return{s:toSolar(e.a,e.m,y),en:toSolar(e.b,e.m,y)}}
/* Lần diễn ra kế tiếp (chưa kết thúc). Sự kiện một lần đã qua → null */
function nextOcc(e){let best=null;const Y=now.getFullYear(),ys=e.repeat?[Y-1,Y,Y+1,Y+(e.every===2?2:1)]:[e.year];
  for(const y of ys){if(e.repeat&&!yearOk(e,y))continue;const o=occ(e,y);if(day0(o.en)>=T0&&(!best||o.s<best.s))best={s:o.s,en:o.en,y}}return best}
function eventsOn(date){const d=date.getDate(),m=date.getMonth()+1,y=date.getFullYear();let l=null;
  return events.filter(e=>{
    if(e.cal==="s")return e.m===m&&d>=e.a&&d<=e.b&&yearOk(e,y);
    l=l||toLunar(d,m,y);
    return !l.leap&&e.m===l.m&&l.d>=e.a&&l.d<=e.b&&yearOk(e,l.y)})}

/* ===== Hôm nay ===== */
const greet=()=>{const h=new Date().getHours();return"Xin chào "+(h>=5&&h<11?"buổi sáng":h>=11&&h<13?"buổi trưa":h>=13&&h<18?"buổi chiều":h>=18&&h<22?"buổi tối":"buổi đêm")};
function renderToday(){$("#hello").textContent=greet();const l=toLunar(now.getDate(),now.getMonth()+1,now.getFullYear());
  $("#wd").textContent="Hôm nay là "+WD[now.getDay()].toLowerCase();
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
   (ev.length?ev.map(e=>`<div class="it" role="button" tabindex="0" data-ev="${esc(e.id)}"><b>${esc(e.name)}</b><span class="tag">${dateTxt(e)}</span>${repChip(e,"tag")}${e.time?`<small>Bắt đầu lúc ${e.time}</small>`:""}${spotsHtml(e)}${e.note?`<small>${esc(e.note)}</small>`:""}</div>`).join(""):`<div class="it">Không có sự kiện.</div>`)}
/* Danh sách sự kiện của tháng đang xem */
function renderMonth(){const n=new Date(vy,vm+1,0).getDate(),mp=new Map();
  for(let i=1;i<=n;i++)eventsOn(new Date(vy,vm,i)).forEach(e=>{const r=mp.get(e.id)||{e,f:i,l:i};r.l=i;mp.set(e.id,r)});
  $("#mTitle").textContent=`Sự kiện tháng ${vm+1}/${vy}`;
  /* chỉ hiện những ngày từ hôm nay trở đi: ngày đã qua trong tháng được ẩn đi */
  const first=new Date(vy,vm,1),last=new Date(vy,vm,n),cut=T0<first?0:T0>last?n+1:T0.getDate();
  const all=[...mp.values()],L=all.filter(r=>r.l>=cut).sort((a,b)=>a.f-b.f),box=$("#mList");
  box.innerHTML=L.length?L.map(r=>`<button class="mi" data-d="${r.f}" data-ev="${esc(r.e.id)}"><span class="dt"><b>${r.f}</b>${r.l>r.f?`<small>đến ${r.l}</small>`:`<small>/${vm+1}</small>`}</span><span class="rb"><b>${esc(r.e.name)}</b><small>${dateTxt(r.e)}${r.e.time?" · "+r.e.time:""}</small><span class="chips">${repChip(r.e)}<span class="chip d">${(()=>{const dd=diffD(new Date(vy,vm,r.f),T0);return dd>0?"Còn "+dd+" ngày":r.l>r.f?"Đang diễn ra":"Hôm nay"})()}</span></span></span></button>`).join(""):`<div class="empty">${all.length?"Các sự kiện trong tháng này đã qua.":"Tháng này chưa có sự kiện."}</div>`;
  const hl=[];for(let i=Math.max(cut,1);i<=n;i++){const d=new Date(vy,vm,i),h=holiday(d,toLunar(i,vm+1,vy));if(h.length)hl.push(`<div><b>${i}/${vm+1}</b> · ${h.join(", ")}</div>`)}
  if(hl.length)box.insertAdjacentHTML("beforeend",`<div class="hols">${hl.join("")}</div>`);
  box.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{sel=new Date(vy,vm,+b.dataset.d);renderCal();renderDetail()})}
mS.onchange=()=>{vm=+mS.value;renderCal();renderMonth()};yS.onchange=()=>{vy=+yS.value;renderCal();renderMonth()};
$("#prev").onclick=()=>{vm--;if(vm<0){vm=11;vy--}renderCal();renderMonth()};
$("#next").onclick=()=>{vm++;if(vm>11){vm=0;vy++}renderCal();renderMonth()};
$("#goToday").onclick=()=>{vy=now.getFullYear();vm=now.getMonth();sel=T0;renderCal();renderDetail();renderMonth()};

const MUTE="lich-notif-off",canN="Notification"in window;
const nOn=()=>canN&&Notification.permission==="granted"&&localStorage.getItem(MUTE)!=="1";
/* Số thông báo: chuông trên trang, tiêu đề tab và số trên icon màn hình (nếu thiết bị hỗ trợ) */
function updateBadge(n){const bn=$("#bellN");bn.hidden=!n;bn.textContent=n>99?"99+":n;
  document.title=(n?`(${n}) `:"")+"Lịch Sự Kiện";
  try{const on=localStorage.getItem(MUTE)!=="1"&&n>0;if(navigator.setAppBadge){on?navigator.setAppBadge(n):navigator.clearAppBadge()}}catch{}}
$("#bell").onclick=()=>{if(location.hash==="#tat-ca"){location.hash=""}setTimeout(()=>$(".remind").scrollIntoView({behavior:"smooth",block:"start"}),50)};
/* ===== Nhắc lịch: trước 7 ngày, trước 3 ngày, đang diễn ra. Sự kiện một lần hết hạn thì thôi ===== */
function remList(){const out=[],up=[];
  events.forEach(e=>{const o=nextOcc(e);if(!o)return;const dd=diffD(o.s,T0),it={e,o,dd,run:dd<=0};up.push(it);if(dd<=7)out.push(it)});
  const by=(a,b)=>a.o.s-b.o.s;return{out:out.sort(by),up:up.sort(by)}}
function renderNotes(){const{out,up}=remList(),nb=$("#nb");nb.hidden=!out.length;nb.textContent=out.length;updateBadge(out.length);
  const item=(n,st,lbl)=>`<div class="rem ${st}" role="button" tabindex="0" data-ev="${esc(n.e.id)}"><span class="cnt"><b>${n.run?"Nay":n.dd}</b><small>${n.run?"đang diễn ra":"ngày nữa"}</small></span><span class="rb"><b>${esc(n.e.name)}</b><small>${fmt(n.o.s)}${n.o.en>n.o.s?" – "+fmt(n.o.en):""}/${n.o.en.getFullYear()} · ${dateTxt(n.e)}${n.e.time?" · "+n.e.time:""}</small>${spotsHtml(n.e)}${n.e.note?`<small class="nt">${esc(n.e.note)}</small>`:""}<span class="chips">${repChip(n.e)}<span class="chip d">${n.run?"Đang diễn ra":"Còn "+n.dd+" ngày"}</span></span></span></div>`;
  $("#notes").innerHTML=up.length?up.slice(0,10).map(n=>item(n,n.run?"now":n.dd<=3?"w3":"w7")).join("")
    +(up.length>10?`<div class="empty">Đang hiện 10 sự kiện gần nhất, còn ${up.length-10} sự kiện nữa.</div>`:""):`<div class="empty">Chưa có sự kiện nào.</div>`;
  const pm=$("#perm"),lb=pm.querySelector(".lbl");pm.classList.remove("on","off");pm.disabled=false;
  const on=nOn();pm.setAttribute("aria-checked",on?"true":"false");
  if(!canN){lb.textContent="Thông báo: trình duyệt chưa hỗ trợ";pm.disabled=true}
  else if(Notification.permission==="denied"){lb.textContent="Thông báo bị chặn (mở trong cài đặt)"}
  else if(on){lb.textContent="Thông báo hiện đang BẬT";pm.classList.add("on")}
  else lb.textContent="Thông báo hiện đang TẮT";
  if(nOn()){let sent={};try{sent=JSON.parse(localStorage.getItem(SENT)||"{}")}catch{}
    out.forEach(n=>{const st=n.run?"now":n.dd<=3?"3":"7",k=n.e.id+"|"+n.o.y+"|"+st;
      if(!sent[k]){sent[k]=1;try{new Notification(n.e.name,{body:(n.run?"Đang diễn ra":"Còn "+n.dd+" ngày nữa")+(n.e.time?" · "+n.e.time:"")})}catch{}}});
    try{localStorage.setItem(SENT,JSON.stringify(sent))}catch{}}}
$("#perm").onclick=async()=>{if(!canN)return;
  if(Notification.permission==="denied")return alert("Thông báo đang bị chặn. Hãy bật lại trong cài đặt của trình duyệt cho trang này.");
  if(Notification.permission==="granted"){try{localStorage.setItem(MUTE,nOn()?"1":"0")}catch{}}
  else{try{await Notification.requestPermission()}catch{}try{localStorage.setItem(MUTE,"0")}catch{}}
  renderNotes()};
/* Mặc định luôn bật: lần chạm đầu tiên trên trang sẽ xin quyền thông báo (trình duyệt bắt buộc phải có sự đồng ý của người dùng) */
function autoAsk(){if(!canN||Notification.permission!=="default"||localStorage.getItem("lich-asked")==="1"||localStorage.getItem(MUTE)==="1")return;
  try{localStorage.setItem("lich-asked","1")}catch{}
  try{Promise.resolve(Notification.requestPermission()).then(renderNotes).catch(()=>{})}catch{}}
["pointerdown","keydown"].forEach(ev=>addEventListener(ev,autoAsk,{once:true,passive:true}));
$("#allBtn").onclick=()=>{location.hash="#tat-ca"};

/* ===== Mật khẩu (nhập một lần, mở khoá 5 phút trong bộ nhớ trang) ===== */
const pw=$("#pw"),ed=$("#ed"),pl=$("#pl");let editing=null,unlockUntil=0,afterAuth=null,pwd="";
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
function auth(cb){if(Date.now()<unlockUntil)return cb();afterAuth=cb;$("#pwI").value="";$("#pwE").textContent="";pw.showModal();$("#pwI").focus()}
pw.addEventListener("close",()=>{afterAuth=null});
$("#pwF").onsubmit=async ev=>{ev.preventDefault();const v=$("#pwI").value;
  try{if(mode==="server")await api({op:"check"},v);else if(v!==PASS)throw new Error("Mật khẩu không đúng.");
    pwd=v;unlockUntil=Date.now()+18e4;const f=afterAuth;afterAuth=null;pw.close();if(f)f()}
  catch(e){$("#pwE").textContent=e.message||"Mật khẩu không đúng."}};
const openAdd=()=>auth(()=>{resetForm();ed.showModal()});
$("#addBtn").onclick=openAdd;$("#addBtn2").onclick=openAdd;

/* ===== Thêm / sửa sự kiện (form) ===== */
const radio=n=>document.querySelector(`input[name=${n}]:checked`).value;
const setRadio=(n,v)=>{document.querySelector(`input[name=${n}][value=${v}]`).checked=true};
function numberEvSpots(){document.querySelectorAll("#evSpots .spot").forEach((d,i)=>d.querySelector(".spot-h b").textContent="Địa điểm "+(i+1))}
function addEvSpot(s){s=s||{};const d=document.createElement("div");d.className="spot";
  d.innerHTML=`<div class="spot-h"><b></b><button type="button" class="pill sm danger" data-sx>Xoá</button></div>
<label>Tên địa điểm<input class="en" maxlength="80" placeholder="Ví dụ: Trung tâm Văn Hóa A"></label>
<label>Link Google (bản đồ)<input class="eu" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…"></label>`;
  d.querySelector(".en").value=s.n||"";d.querySelector(".eu").value=s.u||"";
  d.querySelector("[data-sx]").onclick=()=>{d.remove();numberEvSpots()};$("#evSpots").append(d);numberEvSpots();return d}
function readEvSpots(){const out=[];
  for(const d of document.querySelectorAll("#evSpots .spot")){const n=d.querySelector(".en").value.trim();let u=d.querySelector(".eu").value.trim();
    if(!n&&!u)continue;if(u&&!/^https?:\/\//i.test(u))u="https://"+u;
    if(u&&!/^https?:\/\/[^\s]+\.[^\s]+$/i.test(u))throw new Error("Link Google không hợp lệ: "+u);
    out.push({n,u})}
  return out}
$("#evSpotAdd").onclick=()=>addEvSpot().querySelector(".en").focus();
function readForm(){let a=+$("#fA").value,b=+$("#fB").value;if(!a||!b)return null;
  const cal=radio("cal"),rp=radio("rep"),mx=cal==="s"?31:30;if(b<a)[a,b]=[b,a];a=Math.min(Math.max(a,1),mx);b=Math.min(Math.max(b,1),mx);
  return{id:editing||"e"+Date.now(),name:$("#fN").value.trim(),cal,m:+$("#fM").value,a,b,repeat:rp!=="o",every:rp==="t"?2:1,year:rp==="y"?null:(+$("#fY").value||now.getFullYear()),time:$("#fT").value,note:$("#fC").value.trim(),spots:(()=>{try{return readEvSpots()}catch{return []}})()}}
function syncForm(){const rp=radio("rep"),cal=radio("cal"),cn=cal==="l"?"âm lịch":"dương lịch";
  $("#fYw").hidden=rp==="y";$("#fYl").textContent=rp==="t"?`Năm diễn ra (${cn}), lặp lại mỗi 2 năm`:"Năm "+cn;$("#fA").max=$("#fB").max=cal==="s"?31:30;
  const e=readForm(),p=$("#fP");p.textContent="";if(!e)return;
  try{const o=e.repeat?nextOcc(e):occ(e,e.year);if(!o)return;
    const pre=e.repeat?"Lần tới: ":"Ngày: ";
    if(cal==="l")p.textContent=pre+"dương lịch "+fmtY(o.s)+(o.en>o.s?" – "+fmtY(o.en):"");
    else{const l=toLunar(o.s.getDate(),o.s.getMonth()+1,o.s.getFullYear());p.textContent=pre+"âm lịch "+l.d+"/"+l.m+" (ngày bắt đầu)"}}catch{}}
function resetForm(){editing=null;$("#evF").reset();$("#fY").value=now.getFullYear();$("#fSave").textContent="Lưu sự kiện";$("#fTitle").textContent="Thêm sự kiện mới";$("#evSpots").innerHTML="";syncForm()}
$("#fReset").onclick=resetForm;
$("#evF").addEventListener("input",syncForm);$("#evF").addEventListener("change",syncForm);
function editEvent(id){const e=events.find(x=>x.id===id);if(!e)return;editing=e.id;
  $("#fN").value=e.name;setRadio("cal",e.cal);setRadio("rep",!e.repeat?"o":e.every===2?"t":"y");$("#fM").value=e.m;$("#fA").value=e.a;$("#fB").value=e.b;$("#fY").value=e.year||now.getFullYear();$("#fT").value=e.time||"";$("#fC").value=e.note||"";$("#evSpots").innerHTML="";(e.spots||[]).forEach(addEvSpot);
  $("#fSave").textContent="Cập nhật";$("#fTitle").textContent="Sửa sự kiện";syncForm()}
$("#evF").onsubmit=async ev=>{ev.preventDefault();const o=readForm();if(!o||!o.name)return;
  try{o.spots=readEvSpots();await mutate("events","upsert",o);ed.close();resetForm();renderAll()}catch(e){alert(e.message)}};

/* ===== Trang "Tất cả các sự kiện" (quản lý: xem, sửa, xoá, tìm kiếm, sao lưu) ===== */
const nrm=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
function renderAllPage(){if($("#allPage").hidden)return;const q=nrm($("#aSearch").value.trim());
  const L=events.map(e=>({e,o:nextOcc(e)})).filter(x=>!q||nrm(x.e.name).includes(q)||nrm(x.e.note||"").includes(q))
    .sort((a,b)=>a.o&&b.o?a.o.s-b.o.s:a.o?-1:b.o?1:0);
  $("#aCount").textContent=q?`${L.length}/${events.length}`:events.length;
  const box=$("#aList");
  box.innerHTML=L.length?L.map(({e,o})=>{const dd=o?diffD(o.s,T0):0,chip=!o?"Đã qua":dd<=0?"Đang diễn ra":"Còn "+dd+" ngày";
    return`<div class="ei"><div class="eb" role="button" tabindex="0" data-ev="${esc(e.id)}"><b>${esc(e.name)}</b><small>${o?fmtY(o.s)+(o.en>o.s?" – "+fmtY(o.en):"")+" (dương lịch)":"Đã kết thúc"} · ${dateTxt(e)}${e.time?" · "+e.time:""}</small><span class="chips">${repChip(e,"tag")}<span class="chip d">${chip}</span></span></div><div class="acts"><button class="pill sm primary" data-e="${esc(e.id)}">Sửa</button><button class="pill sm danger" data-d="${esc(e.id)}">Xoá</button></div></div>`}).join("")
    :`<div class="empty">${events.length?"Không tìm thấy sự kiện phù hợp.":"Chưa có sự kiện nào."}</div>`;
  box.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>auth(()=>{resetForm();editEvent(b.dataset.e);ed.showModal()}));
  box.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>auth(async()=>{if(confirm("Xoá sự kiện này?")){try{await mutate("events","delete",{id:b.dataset.d});renderAll()}catch(e){alert(e.message)}}}))}
$("#aSearch").addEventListener("input",renderAllPage);
$("#bkBtn").onclick=()=>{const d=new Date(),a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify({xuatLuc:d.toISOString(),events,places},null,2)],{type:"application/json"}));
  a.download=`lich-su-kien-sao-luu-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
function route(){const all=location.hash==="#tat-ca";$("#mainView").hidden=all;$("#allPage").hidden=!all;if(all)renderAllPage();window.scrollTo(0,0)}
addEventListener("hashchange",route);
$("#backBtn").onclick=()=>{location.hash=""};

/* ===== Xem chi tiết sự kiện (ai cũng xem được; sửa/xoá cần mật khẩu) ===== */
const vd=$("#vd");let vdId=null;
function showEvent(id){const e=events.find(x=>x.id===id);if(!e)return;vdId=id;
  const o=nextOcc(e),row=(k,v)=>`<div class="vrow"><span>${k}</span><div>${v}</div></div>`;
  let when="Đã qua";if(o){const dd=diffD(o.s,T0);when=fmtY(o.s)+(o.en>o.s?" – "+fmtY(o.en):"")+` (${dd<=0?"đang diễn ra":"còn "+dd+" ngày"})`}
  let lu="";if(e.cal==="s"&&o){const l=toLunar(o.s.getDate(),o.s.getMonth()+1,o.s.getFullYear());lu=row("Âm lịch",`${l.d}/${l.m} (ngày bắt đầu)`)}
  $("#vdN").textContent=e.name;
  $("#vdB").innerHTML=row("Ngày",esc(dateTxt(e)))+row("Lặp lại",esc(repTxt(e)))+row(e.repeat?"Lần tới":"Diễn ra","Dương lịch: "+esc(when))+lu+(e.time?row("Giờ",esc(e.time)):"")+((e.spots||[]).length?row("Địa điểm",spotsHtml(e)):"")+row("Ghi chú",e.note?`<div class="vnote">${esc(e.note)}</div>`:"<i>Không có ghi chú</i>");
  $("#vdGcal").hidden=!/android/i.test(navigator.userAgent);vd.showModal()}
/* Thêm lời nhắc vào ứng dụng Lịch của điện thoại (file .ics có nhắc trước 7 ngày, 3 ngày và đúng ngày) */
const ymd=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
const icsEsc=s=>String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
const tmOk=e=>/^\d{2}:\d{2}$/.test(e.time||"");
function eventOccs(e,max=5){const out=[],Y=now.getFullYear();
  for(let y=Y-1;y<=Y+10&&out.length<max;y++){if(e.repeat?!yearOk(e,y):y!==e.year)continue;const o=occ(e,y);if(day0(o.en)>=T0)out.push(o)}
  return out.sort((a,b)=>a.s-b.s)}
function endHM(e){const[h,m]=e.time.split(":").map(Number);return h>=23?"2359":pad(h+1)+pad(m)}
function makeIcs(e){const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Lich Su Kien//VI","CALSCALE:GREGORIAN","METHOD:PUBLISH"],stamp=new Date().toISOString().replace(/[-:]|\.\d{3}/g,"");
  const sp=e.spots||[],desc=icsEsc(dateTxt(e)+" · "+repTxt(e)+sp.map(s=>"\nĐịa điểm: "+s.n+(s.u?" - "+s.u:"")).join("")+(e.note?"\n"+e.note:""));
  eventOccs(e).forEach((o,i)=>{const tm=tmOk(e),end=new Date(o.en.getFullYear(),o.en.getMonth(),o.en.getDate()+1);
    L.push("BEGIN:VEVENT",`UID:${e.id}-${ymd(o.s)}@lich-su-kien.vercel.app`,"DTSTAMP:"+stamp,"SUMMARY:"+icsEsc(e.name),"DESCRIPTION:"+desc,...(sp[0]&&sp[0].n?["LOCATION:"+icsEsc(sp[0].n)]:[]),
      tm?`DTSTART:${ymd(o.s)}T${e.time.replace(":","")}00`:`DTSTART;VALUE=DATE:${ymd(o.s)}`,
      tm?`DTEND:${ymd(o.en)}T${endHM(e)}00`:`DTEND;VALUE=DATE:${ymd(end)}`);
    (()=>{const sm=tm?+e.time.slice(0,2)*60+ +e.time.slice(3,5):0,dur=m=>`-P${Math.floor(m/1440)}DT${Math.floor(m%1440/60)}H${m%60}M`;
      /* Nhắc lúc 8h sáng của ngày cách 3 ngày và 1 ngày; nhắc trước 1 tiếng (không có giờ: tính 6h sáng, nhắc lúc 5h) */
      return tm?[[dur(3*1440+sm-480),"Còn 3 ngày: "],[dur(1440+sm-480),"Còn 1 ngày: "],["-PT1H","Còn 1 giờ: "]]
               :[["-P2DT16H","Còn 3 ngày: "],["-PT16H","Còn 1 ngày: "],["PT5H","Sắp diễn ra (6h sáng): "]]})().forEach(([tr,pre])=>L.push("BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsEsc(pre+e.name),"TRIGGER:"+tr,"END:VALARM"));
    L.push("END:VEVENT")});
  L.push("END:VCALENDAR");return L.join("\r\n")}
function gcalUrl(e){const o=eventOccs(e,1)[0];if(!o)return null;const tm=tmOk(e),end=new Date(o.en.getFullYear(),o.en.getMonth(),o.en.getDate()+1);
  const d=tm?`${ymd(o.s)}T${e.time.replace(":","")}00/${ymd(o.en)}T${endHM(e)}00`:`${ymd(o.s)}/${ymd(end)}`;
  const rec=e.repeat&&e.cal==="s"?"&recur="+encodeURIComponent("RRULE:FREQ=YEARLY"+(e.every===2?";INTERVAL=2":"")):"";
  return`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.name)}&dates=${d}&details=${encodeURIComponent(dateTxt(e)+((e.spots||[]).map(s=>"\nĐịa điểm: "+s.n+(s.u?" - "+s.u:"")).join(""))+(e.note?"\n"+e.note:""))}${(e.spots||[])[0]&&e.spots[0].n?"&location="+encodeURIComponent(e.spots[0].n):""}${rec}`}
$("#vdIcs").onclick=()=>{const e=events.find(x=>x.id===vdId);if(!e)return;
  if(!eventOccs(e,1).length)return alert("Sự kiện này đã kết thúc, không còn ngày sắp tới để nhắc.");
  const a=document.createElement("a");a.href="data:text/calendar;charset=utf-8,"+encodeURIComponent(makeIcs(e));
  a.download=(e.name.replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"")||"su-kien")+".ics";document.body.append(a);a.click();a.remove()};
$("#vdGcal").onclick=()=>{const e=events.find(x=>x.id===vdId),u=e&&gcalUrl(e);if(u)window.open(u,"_blank","noopener");else alert("Sự kiện này đã kết thúc.")};
$("#vdEdit").onclick=()=>auth(()=>{vd.close();resetForm();editEvent(vdId);ed.showModal()});
$("#vdDel").onclick=()=>auth(async()=>{if(confirm("Xoá sự kiện này?")){try{await mutate("events","delete",{id:vdId});vd.close();renderAll()}catch(e){alert(e.message)}}});
document.addEventListener("click",ev=>{if(ev.target.closest("a"))return;const t=ev.target.closest("[data-ev]");if(t)showEvent(t.dataset.ev)});
document.addEventListener("keydown",ev=>{const t=ev.target;if((ev.key==="Enter"||ev.key===" ")&&t.matches&&t.matches("div[data-ev]")){ev.preventDefault();showEvent(t.dataset.ev)}});

/* ===== Tiện ích: tải lại trang, dọn dữ liệu rác cũ trên máy ===== */
$("#reloadBtn").onclick=()=>location.reload();
/* Dọn dữ liệu rác cũ: dữ liệu thời tiết của các phiên bản trước, bản ghi "đã nhắc" của năm trước, bộ nhớ đệm cũ. Không đụng tới sự kiện/địa điểm. */
function cleanJunk(){["lich-wx-v1","lich-g-off","lich-asked-old"].forEach(k=>{try{localStorage.removeItem(k)}catch{}});
  try{const s=JSON.parse(localStorage.getItem(SENT)||"{}"),k={};for(const x in s)if(+x.split("|")[1]>=now.getFullYear())k[x]=1;localStorage.setItem(SENT,JSON.stringify(k))}catch{}}
$("#cleanBtn").onclick=async()=>{
  if(!confirm("Xoá dữ liệu rác cũ trên máy này (dữ liệu thời tiết cũ, bản ghi nhắc của các năm trước, bộ nhớ đệm cũ)?\n(Sự kiện và địa điểm không bị ảnh hưởng.)"))return;
  cleanJunk();try{if(window.caches)for(const n of await caches.keys())await caches.delete(n)}catch{}
  alert("Đã dọn xong dữ liệu rác cũ.");location.reload()};
cleanJunk();

/* ===== Ghi chú địa điểm (không nhắc lịch). Mỗi địa điểm: tên, nhiều vị trí (tên + link + ghi chú), ghi chú ===== */
let editingP=null;const openP=new Set();
const flat=s=>esc(s).replace(/\s*\n+\s*/g," · ");
function placeBody(p){let x="";const sp=p.spots||[];
  if(sp.length)x+='<ul class="spl">'+sp.map(s=>`<li>${s.n?`<span class="sn2">${esc(s.n)}</span>`:""}${s.u?`<a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">Đường Đi</a>`:""}${s.c?`<div class="sc2">${esc(s.c)}</div>`:""}</li>`).join("")+"</ul>";
  if(p.note)x+=`<div class="pnote"><span class="k">Ghi chú:</span> ${esc(p.note)}</div>`;
  return x||`<div class="empty">Chưa có chi tiết.</div>`}
function renderPlaces(){const q=nrm($("#pSearch").value.trim());
  const txt=p=>[p.name,p.note,...(p.spots||[]).flatMap(s=>[s.n,s.c])].filter(Boolean).join(" ");
  const L=places.filter(p=>!q||nrm(txt(p)).includes(q)).sort((a,b)=>a.name.localeCompare(b.name,"vi",{numeric:true,sensitivity:"base"}));
  $("#pCount").textContent=q?`${L.length}/${places.length}`:places.length;
  $("#pList").innerHTML=L.length?L.map(p=>{const pv=[...(p.spots||[]).map(s=>s.n),p.note].filter(Boolean).map(flat).join(" · ");
    return`<details class="pd" data-id="${esc(p.id)}"${openP.has(p.id)?" open":""}><summary><span class="ps"><span class="pn">${esc(p.name)}</span>${pv?`<span class="pv">${pv}</span>`:""}</span></summary><div class="pb">${placeBody(p)}<div class="acts"><button class="pill sm primary" data-pe="${esc(p.id)}">Sửa</button><button class="pill sm danger" data-pd="${esc(p.id)}">Xoá</button></div></div></details>`}).join(""):`<div class="empty">${places.length?"Không tìm thấy địa điểm phù hợp.":"Chưa có ghi chú địa điểm nào."}</div>`;
  document.querySelectorAll("details.pd").forEach(d=>d.addEventListener("toggle",()=>{d.open?openP.add(d.dataset.id):openP.delete(d.dataset.id)}));
  document.querySelectorAll("[data-pe]").forEach(b=>b.onclick=()=>auth(()=>openPlace(places.find(x=>x.id===b.dataset.pe))));
  document.querySelectorAll("[data-pd]").forEach(b=>b.onclick=()=>auth(async()=>{if(confirm("Xoá địa điểm này?")){try{await mutate("places","delete",{id:b.dataset.pd});renderPlaces()}catch(e){alert(e.message)}}}))}
/* Các dòng "vị trí" trong form */
function numberSpots(){document.querySelectorAll("#spots .spot").forEach((d,i)=>d.querySelector(".spot-h b").textContent="Vị trí "+(i+1))}
function addSpot(s){s=s||{};const d=document.createElement("div");d.className="spot";
  d.innerHTML=`<div class="spot-h"><b></b><button type="button" class="pill sm danger" data-sx>Xoá vị trí</button></div>
<label>Tên vị trí<input class="sn" maxlength="80" placeholder="Ví dụ: Quảng Trường"></label>
<label>Link vị trí<input class="su" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…"></label>
<label>Ghi chú vị trí (tuỳ chọn)<input class="sc" maxlength="300" placeholder="Ví dụ: nơi này cần đi buổi tối"></label>`;
  d.querySelector(".sn").value=s.n||"";d.querySelector(".su").value=s.u||"";d.querySelector(".sc").value=s.c||"";
  d.querySelector("[data-sx]").onclick=()=>{d.remove();numberSpots()};$("#spots").append(d);numberSpots();return d}
function readSpots(){const out=[];
  for(const d of document.querySelectorAll("#spots .spot")){let n=d.querySelector(".sn").value.trim(),u=d.querySelector(".su").value.trim(),c=d.querySelector(".sc").value.trim();
    if(!n&&!u&&!c)continue;if(u&&!/^https?:\/\//i.test(u))u="https://"+u;
    if(u&&!/^https?:\/\/[^\s]+\.[^\s]+$/i.test(u))throw new Error("Link vị trí không hợp lệ: "+u);
    out.push({n,u,c})}
  return out}
$("#spotAdd").onclick=()=>addSpot().querySelector(".sn").focus();
function openPlace(p){editingP=p?p.id:null;$("#plTitle").textContent=p?"Sửa địa điểm":"Thêm địa điểm";$("#plN").value=p?p.name:"";$("#plC").value=p?p.note||"":"";
  $("#spots").innerHTML="";(p&&p.spots||[]).forEach(addSpot);pl.showModal();$("#plN").focus()}
$("#pAdd").onclick=()=>auth(()=>openPlace(null));
$("#pSearch").addEventListener("input",renderPlaces);
$("#plF").onsubmit=async ev=>{ev.preventDefault();
  try{const o={id:editingP||"p"+Date.now(),name:$("#plN").value.trim(),note:$("#plC").value.trim(),spots:readSpots()};if(!o.name)return;
    await mutate("places","upsert",o);pl.close();$("#pSearch").value="";renderPlaces()}catch(e){alert(e.message)}};

/* ===== Tạo icon ngoài màn hình ===== */
let dip=null;addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e});addEventListener("appinstalled",()=>{dip=null});
$("#iconBtn").onclick=async()=>{const body=$("#icB"),ua=navigator.userAgent;
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
  const pv='<div class="icpv"><img src="/assets/icon-180.png" alt="Icon Lịch Sự Kiện"><b>Lịch Sự Kiện</b></div>';
  if(standalone){body.innerHTML=pv+"<p>Ứng dụng đã được thêm ra màn hình và đang chạy từ icon rồi.</p>";return ic.showModal()}
  if(dip){try{dip.prompt();await dip.userChoice}catch{}dip=null;return}
  const inApp=/Zalo|FBAN|FBAV|Instagram|Line\//i.test(ua),ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),and=/android/i.test(ua);
  let s;
  if(inApp)s="<p>Bạn đang mở trong ứng dụng khác (Zalo, Facebook…). Hãy bấm menu của ứng dụng đó rồi chọn <b>Mở bằng trình duyệt</b> ("+(ios?"Safari":"Chrome")+"), sau đó bấm lại nút này.</p>";
  else if(ios)s='<ol class="steps"><li>Mở trang bằng <b>Safari</b>.</li><li>Bấm nút <b>Chia sẻ</b> (hình vuông có mũi tên hướng lên) ở thanh dưới.</li><li>Kéo xuống, chọn <b>Thêm vào Màn hình chính</b>.</li><li>Bấm <b>Thêm</b>. Icon sẽ xuất hiện ngoài màn hình.</li></ol><p class="note">iPhone không cho trang web tự thêm icon, nên cần làm 4 bước trên.</p>';
  else if(and)s='<ol class="steps"><li>Mở trang bằng <b>Chrome</b>.</li><li>Bấm menu <b>⋮</b> ở góc trên.</li><li>Chọn <b>Cài đặt ứng dụng</b> (hoặc <b>Thêm vào màn hình chính</b>).</li><li>Bấm <b>Cài đặt</b> / <b>Thêm</b>.</li></ol>';
  else s='<ol class="steps"><li>Với Chrome hoặc Edge: bấm biểu tượng <b>cài đặt ứng dụng</b> ở cuối thanh địa chỉ.</li><li>Hoặc mở menu và chọn <b>Cài đặt Lịch Sự Kiện</b>.</li></ol>';
  body.innerHTML=pv+s;ic.showModal()};
const ic=$("#ic");

$("#shBtn").onclick=async()=>{const u="https://lich-su-kien.vercel.app/",b=$("#shBtn");
  try{if(navigator.share){await navigator.share({title:"Lịch Sự Kiện",text:"Lịch sự kiện âm dương, nhắc lịch và ghi chú địa điểm",url:u});return}}catch{return}
  try{await navigator.clipboard.writeText(u);b.textContent="Đã sao chép liên kết"}catch{b.textContent=u}
  setTimeout(()=>{b.textContent="Chia sẻ liên kết"},2500)};
function renderAll(){renderToday();renderCal();renderDetail();renderMonth();renderNotes();renderPlaces();renderAllPage();renderStatus()}
if(typeof document!=="undefined"&&!globalThis.__TEST__){
  route();renderAll();resetForm();sync();
  setInterval(()=>{if(!document.hidden)sync()},60000);setInterval(()=>{$("#hello").textContent=greet()},6e4);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync()});addEventListener("online",sync);
  setInterval(()=>{if(day0(new Date())-T0)location.reload();else renderNotes()},3600000);
  if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}
