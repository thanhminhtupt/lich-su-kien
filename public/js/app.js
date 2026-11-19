/* Lịch Sự Kiện – by Đức Anh Hoàng */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY="lich-events-v1",PKEY="lich-places-v1",SKEY="lich-sess-v1";
const WD=["Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"];
const CAN=["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"],CHI=["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const day0=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const diffD=(a,b)=>Math.round((day0(a)-day0(b))/864e5);
const pad=n=>String(n).padStart(2,"0"),fmt=d=>pad(d.getDate())+"/"+pad(d.getMonth()+1),fmtY=d=>fmt(d)+"/"+d.getFullYear();
const ls={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}},del:k=>{try{localStorage.removeItem(k)}catch{}}};

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

/* ===== Dữ liệu =====
   Sự kiện: {id,name,cal:"l"|"s",m,a (tháng, ngày bắt đầu),m2,b (tháng, ngày kết thúc – có thể sang tháng sau / năm sau),
             repeat,every,year,time,note,spots,status:"pending"|"approved",mine,byName}
   Địa điểm: {id,name,note,spots:[{n,u,c}],status,mine,byName}. Góp ý: {id,placeId,text,spots,byName,at,mine} */
const now=new Date(),T0=day0(now);
let events=[],places=[],suggestions=[],notifs=[],evA=[],plA=[];
let me=null,token="",sessExp=0,serverOk=false,srvSize=0,warn="",stats=null,lastData="";
const SESSION_MS=20*60e3;
const norm=e=>e.cal?{...e,m2:e.m2||e.m}:{id:e.id,name:e.name,cal:"l",m:e.lm,a:e.a,m2:e.lm,b:e.b,repeat:true,year:null,time:e.time||"",note:e.note||""};
try{events=(JSON.parse(ls.get(KEY)||"[]")||[]).map(norm)}catch{}
try{places=JSON.parse(ls.get(PKEY)||"[]")||[]}catch{}
function derive(){evA=events.filter(e=>e.status!=="pending");plA=places.filter(p=>p.status!=="pending");occCache.clear()}
function cache(){ls.set(KEY,JSON.stringify(evA));ls.set(PKEY,JSON.stringify(plA))}
const isAdmin=()=>!!me&&me.role==="admin";

/* ===== Phiên làm việc 20 phút (tự đăng xuất khi không thao tác 20 phút) ===== */
try{const s=JSON.parse(ls.get(SKEY)||"null");if(s&&s.exp>Date.now()){token=s.t;me=s.me;sessExp=s.exp}}catch{}
function saveSess(){token?ls.set(SKEY,JSON.stringify({t:token,me,exp:sessExp})):ls.del(SKEY)}
function touch(){if(token){sessExp=Date.now()+SESSION_MS;saveSess()}}
function startSession(j){token=j.token;me=j.me;touch();lastData="";renderAcc();sync();relinkPush()}
function endSession(expired){if(!token&&!me)return;token="";me=null;notifs=[];saveSess();
  events=events.filter(e=>e.status!=="pending");places=places.filter(p=>p.status!=="pending");suggestions=[];derive();lastData="";
  renderAcc();renderAll();relinkPush();if(location.hash==="#duyet")location.hash="";
  if(expired){toast("Phiên làm việc 20 phút đã kết thúc. Hãy đăng nhập lại.");openAcc("login")}}
let lastPing=0;
function ping(){if(!token||Date.now()-lastPing<60e3)return;lastPing=Date.now();
  api("auth",{op:"me"}).then(j=>{me=j.me;saveSess();renderAcc()}).catch(()=>{})}
["pointerdown","keydown"].forEach(ev=>addEventListener(ev,ping,{passive:true}));
function tick(){const el=$("#sessT");if(!token)return;const r=sessExp-Date.now();
  if(r<=0){endSession(true);return}
  const m=Math.floor(r/60e3),s=Math.floor(r%60e3/1e3);el.textContent=pad(m)+":"+pad(s);el.classList.toggle("low",r<120e3);if(acc.open)$("#meSess").textContent=`Phiên làm việc còn ${pad(m)}:${pad(s)} · tự đăng xuất sau 20 phút không thao tác.`}

/* ===== Gọi máy chủ ===== */
async function api(path,body,auth=true){let r;const h={"Content-Type":"application/json"};if(auth&&token)h.Authorization="Bearer "+token;
  try{r=await fetch("/api/"+path,{method:"POST",headers:h,body:JSON.stringify(body||{}),cache:"no-store"})}catch{throw new Error("Không kết nối được máy chủ. Hãy kiểm tra mạng.")}
  const j=await r.json().catch(()=>({}));
  if(r.status===401&&j.code==="session"&&token)endSession(true);
  if(r.status===404&&!j.error)throw new Error("Máy chủ chưa sẵn sàng (chưa có API).");
  if(!r.ok){const e=new Error(j.error||"Lỗi máy chủ ("+r.status+").");e.status=r.status;e.code=j.code;throw e}
  if(auth&&token)touch();return j}
function apply(d){if(d.events)events=d.events.map(norm);if(d.places)places=d.places;if(d.suggestions)suggestions=d.suggestions;if(d.nt)notifs=d.nt;
  derive();cache();const k=JSON.stringify([events,places,suggestions,notifs]);if(k!==lastData){lastData=k;renderAll()}}
const setSync=s=>{$("#sync").textContent=s};
const hhmm=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())};
async function sync(){
  try{const r=await fetch("/api/store",{cache:"no-store",headers:token?{Authorization:"Bearer "+token}:{}});
    if(r.status===404||r.status===503){serverOk=false;warn="";setSync("Chưa kết nối máy chủ · đang hiển thị dữ liệu đã lưu trên máy.");renderStatus();renderAll();return}
    if(!r.ok){let m="";try{m=(await r.json()).error||""}catch{}
      warn=m||(r.status===402?"Vercel báo dự án bị tạm dừng hoặc hết hạn mức gói miễn phí (mã 402).":r.status===429?"Vercel báo vượt giới hạn truy cập (mã 429), hãy thử lại sau.":"Máy chủ Vercel đang báo lỗi (mã "+r.status+").");
      setSync("Chưa đồng bộ được với máy chủ.");renderStatus();return}
    const d=await r.json();serverOk=true;srvSize=d.size||0;warn="";stats=d.stats;
    if(token&&!d.me){endSession(true);return}
    if(d.me){me=d.me;saveSess();renderAcc()}
    apply(d);renderVisits();countVisit();
    setSync("Dữ liệu dùng chung · cập nhật lúc "+hhmm());renderStatus()}
  catch{setSync("Đang ngoại tuyến · hiển thị dữ liệu đã lưu trên máy.")}}
const fmtB=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(1)+" KB":(n/1048576).toFixed(n<1e7?2:0)+" MB";
function renderStatus(){const used=srvSize,lim=250*1048576,pct=used/lim*100,ps=pct<.01?"<0,01":pct.toLocaleString("vi-VN",{maximumFractionDigits:2});
  let w=warn;if(!w&&pct>=80)w="Sắp hết dung lượng lưu trữ miễn phí (Upstash/Vercel).";
  $("#stor").innerHTML=(serverOk?`Lưu trữ: ${ps}% (${fmtB(used)} / ${fmtB(lim)})`:"")+(w?`<span class="warn">${esc(w)}</span>`:"")}
async function mutate(kind,op,x,extra){const j=await api("store",{op,kind,item:x,id:x&&x.id,...extra});apply(j);return j}

/* ===== Đếm lượt truy cập (mỗi máy tính 1 lượt / ngày) ===== */
const nf=n=>Number(n||0).toLocaleString("vi-VN");
function renderVisits(){const v=$("#visits");if(!stats){v.innerHTML="";return}
  v.innerHTML=`<div class="vh"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C6.5 5 2.7 9.4 1.6 12c1.1 2.6 4.9 7 10.4 7s9.3-4.4 10.4-7C21.3 9.4 17.5 5 12 5Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="currentColor"/></svg>Lượt truy cập</div>`+
   [["Hôm nay",stats.d],["Tuần này",stats.w],["Tháng này",stats.m],["Toàn thời gian",stats.all]].map(([k,n])=>`<div class="vt"><b>${nf(n)}</b><span>${k}</span></div>`).join("")}
let visitSent=false;
async function countVisit(){if(visitSent)return;visitSent=true;const k=ymd(new Date());if(ls.get("lich-visit")===k)return;
  try{const j=await api("store",{op:"visit"},false);ls.set("lich-visit",k);stats=j.stats;renderVisits()}catch{}}

/* ===== Ngày diễn ra của sự kiện ===== */
const crossY=e=>e.m2<e.m||(e.m2===e.m&&e.b<e.a);
const dateTxt=e=>(e.cal==="s"?"Dương ":"Âm ")+(e.m2===e.m?(e.a===e.b?e.a:e.a+"–"+e.b)+"/"+e.m:e.a+"/"+e.m+" – "+e.b+"/"+e.m2);
const repTxt=e=>e.repeat?(e.every===2?"2 năm/lần · từ "+e.year:"Hằng năm"):"Một lần · năm "+e.year;
const spotsHtml=e=>(e.spots||[]).map(s=>`<span class="evs">${esc(s.n||"")}${s.n&&s.u?" - ":""}${s.u?`<a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">Đường Đi</a>`:""}</span>`).join("");
const RI={y:'<svg class="ri" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 7V6a2.5 2.5 0 0 1 2.5-2.5H12M10 1.5l2 2-2 2M13 9v1a2.5 2.5 0 0 1-2.5 2.5H4M6 14.5l-2-2 2-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  o:'<svg class="ri" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 6l1.3-1v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  t:'<svg class="ri" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6.2 6.2a1.8 1.8 0 0 1 3.5.5c0 1.3-3.6 2.4-3.6 4.3h3.7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
const repIcon=e=>!e.repeat?RI.o:e.every===2?RI.t:RI.y;
const repCls=e=>!e.repeat?"t-o":e.every===2?"t-t":"t-y";
const repChip=(e,c="chip")=>`<span class="${c} ${repCls(e)}">${repIcon(e)} ${esc(repTxt(e))}</span>`;
const yearOk=(e,y)=>e.repeat?(e.every===2?(((y-e.year)%2)+2)%2===0:true):e.year===y;
const occCache=new Map();
/* Khoảng ngày dương lịch của sự kiện bắt đầu trong năm y (năm âm nếu là sự kiện âm lịch) */
function occ(e,y){const k=[e.cal,e.m,e.a,e.m2,e.b,y].join("|");let o=occCache.get(k);if(o)return o;const y2=crossY(e)?y+1:y;
  if(e.cal==="s"){const n1=new Date(y,e.m,0).getDate(),n2=new Date(y2,e.m2,0).getDate();o={s:new Date(y,e.m-1,Math.min(e.a,n1)),en:new Date(y2,e.m2-1,Math.min(e.b,n2))}}
  else o={s:toSolar(e.a,e.m,y),en:toSolar(e.b,e.m2,y2)};
  occCache.set(k,o);return o}
/* Lần diễn ra kế tiếp (chưa kết thúc). Sự kiện một lần đã qua → null */
function nextOcc(e){let best=null;const Y=now.getFullYear(),ys=e.repeat?[Y-2,Y-1,Y,Y+1,Y+2]:[e.year];
  for(const y of ys){if(!yearOk(e,y))continue;let o;try{o=occ(e,y)}catch{continue}if(day0(o.en)>=T0&&(!best||o.s<best.s))best={s:o.s,en:o.en,y}}return best}
function eventsOn(date){const t=+day0(date),Y=date.getFullYear();
  return evA.filter(e=>{for(const y of[Y-1,Y]){if(!yearOk(e,y))continue;let o;try{o=occ(e,y)}catch{continue}if(+o.s<=t&&t<=+o.en)return true}return false})}

/* ===== Hôm nay ===== */
const dispName=()=>me?(isAdmin()?"Admin":me.name):"";
const greet=()=>{const h=new Date().getHours();return"Xin chào "+(h>=5&&h<11?"buổi sáng":h>=11&&h<13?"buổi trưa":h>=13&&h<18?"buổi chiều":h>=18&&h<22?"buổi tối":"buổi đêm")+(me?", "+dispName():"")};
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
   `<button class="pill sm filled blue addday" data-addday>+ Thêm sự kiện ngày ${fmt(sel)}</button>`+(ev.length?ev.map(e=>`<div class="it" role="button" tabindex="0" data-ev="${esc(e.id)}"><b>${esc(e.name)}</b><span class="tag">${dateTxt(e)}</span>${repChip(e,"tag")}${e.time?`<small>Bắt đầu lúc ${e.time}</small>`:""}${spotsHtml(e)}${e.note?`<small>${esc(e.note)}</small>`:""}</div>`).join(""):`<div class="it">Không có sự kiện.</div>`)}
$("#detail").addEventListener("click",ev=>{if(ev.target.closest("[data-addday]"))openAddOn(sel)});
function openAddOn(d){requireLogin(()=>{resetForm();const l=toLunar(d.getDate(),d.getMonth()+1,d.getFullYear());
  $("#fA").value=$("#fB").value=Math.min(l.d,30);$("#fM").value=$("#fM2").value=l.m;$("#fY").value=l.y;$("#fD1").value=$("#fD2").value=isoD(d);
  setRadio("rep","o");syncForm();ed.showModal();$("#fN").focus()},"Hãy đăng nhập để thêm sự kiện. Chưa có tài khoản? Bấm Tạo tài khoản.")}
function renderMonth(){const n=new Date(vy,vm+1,0).getDate(),mp=new Map();
  for(let i=1;i<=n;i++)eventsOn(new Date(vy,vm,i)).forEach(e=>{const r=mp.get(e.id)||{e,f:i,l:i};r.l=i;mp.set(e.id,r)});
  $("#mTitle").textContent=`Sự kiện tháng ${vm+1}/${vy}`;
  const first=new Date(vy,vm,1),last=new Date(vy,vm,n),cut=T0<first?0:T0>last?n+1:T0.getDate();
  const all=[...mp.values()],L=all.filter(r=>r.l>=cut).sort((a,b)=>a.f-b.f),box=$("#mList");
  box.innerHTML=L.length?L.map(r=>`<button class="mi" data-d="${r.f}" data-ev="${esc(r.e.id)}"><span class="dt"><b>${r.f}</b>${r.l>r.f?`<small>đến ${r.l}</small>`:`<small>/${vm+1}</small>`}</span><span class="rb"><b>${esc(r.e.name)}</b><small class="dl">${dateTxt(r.e)}${r.e.time?" · "+r.e.time:""}</small><span class="chips">${repChip(r.e)}<span class="chip d">${(()=>{const dd=diffD(new Date(vy,vm,r.f),T0);return dd>0?"Còn "+dd+" ngày":r.l>r.f||dd<0?"Đang diễn ra":"Hôm nay"})()}</span></span></span></button>`).join(""):`<div class="empty">${all.length?"Các sự kiện trong tháng này đã qua.":"Tháng này chưa có sự kiện."}</div>`;
  const hl=[];for(let i=Math.max(cut,1);i<=n;i++){const d=new Date(vy,vm,i),h=holiday(d,toLunar(i,vm+1,vy));if(h.length)hl.push(`<div><b>${i}/${vm+1}</b> · ${h.join(", ")}</div>`)}
  if(hl.length)box.insertAdjacentHTML("beforeend",`<div class="hols">${hl.join("")}</div>`);
  box.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{sel=new Date(vy,vm,+b.dataset.d);renderCal();renderDetail()})}
mS.onchange=()=>{vm=+mS.value;renderCal();renderMonth()};yS.onchange=()=>{vy=+yS.value;renderCal();renderMonth()};
$("#prev").onclick=()=>{vm--;if(vm<0){vm=11;vy--}renderCal();renderMonth()};
$("#next").onclick=()=>{vm++;if(vm>11){vm=0;vy++}renderCal();renderMonth()};
$("#goToday").onclick=()=>{vy=now.getFullYear();vm=now.getMonth();sel=T0;renderCal();renderDetail();renderMonth()};

/* ===== Sắp tới + số thông báo (chuông, tiêu đề tab, số trên icon app) ===== */
function remList(){const out=[],up=[];
  evA.forEach(e=>{const o=nextOcc(e);if(!o)return;const dd=diffD(o.s,T0),it={e,o,dd,run:dd<=0};up.push(it);if(dd<=7)out.push(it)});
  const by=(a,b)=>a.o.s-b.o.s;return{out:out.sort(by),up:up.sort(by)}}
const unreadN=()=>notifs.filter(n=>!n.r).length;
function badgeCount(){return remList().out.length+unreadN()}
function updateBadge(){const n=badgeCount(),bn=$("#bellN");bn.hidden=!n;bn.textContent=n>99?"99+":n;
  document.title=(n?`(${n}) `:"")+"Lịch Sự Kiện";
  try{if(navigator.setAppBadge){n>0?navigator.setAppBadge(n).catch(()=>{}):navigator.clearAppBadge().catch(()=>{})}}catch{}}
const remItem=(n)=>{const st=n.run?"now":n.dd<=3?"w3":"w7";return`<div class="rem ${st}" role="button" tabindex="0" data-ev="${esc(n.e.id)}"><span class="cnt"><b>${n.run?"Nay":n.dd}</b><small>${n.run?"đang diễn ra":"ngày nữa"}</small></span><span class="rb"><b>${esc(n.e.name)}</b><small class="dl"><b>${fmt(n.o.s)}${n.o.en>n.o.s?" – "+fmt(n.o.en):""}/${n.o.en.getFullYear()}</b> · ${dateTxt(n.e)}${n.e.time?" · "+n.e.time:""}</small>${spotsHtml(n.e)}${n.e.note?`<small class="nt">${esc(n.e.note)}</small>`:""}<span class="chips">${repChip(n.e)}<span class="chip d">${n.run?"Đang diễn ra":"Còn "+n.dd+" ngày"}</span></span></span></div>`};
function renderNotes(){const{out,up}=remList(),nb=$("#nb");nb.hidden=!out.length;nb.textContent=out.length;updateBadge();
  $("#notes").innerHTML=up.length?up.slice(0,5).map(remItem).join(""):`<div class="empty">Chưa có sự kiện nào.</div>`;
  $("#notesMore").textContent=up.length>5?`Đang hiện 5 sự kiện gần nhất. Bấm "Tất cả các sự kiện" để xem thêm ${up.length-5} sự kiện.`:""}
$("#allBtn").onclick=()=>{location.hash="#tat-ca"};

/* ===== Bảng thông báo (bấm chuông) ===== */
const nt=$("#nt");
const ago=t=>{const s=(Date.now()-t)/1e3;return s<60?"vừa xong":s<3600?Math.floor(s/60)+" phút trước":s<86400?Math.floor(s/3600)+" giờ trước":fmtY(new Date(t))};
function renderNt(){const pend=pendingCount();
  $("#ntRev").innerHTML=me?(pend?`<button class="revcta" data-go="#duyet"><b>${pend}</b><span>${isAdmin()?"mục đang chờ bạn duyệt (lịch, địa điểm, góp ý)":"bài bạn gửi đang chờ duyệt"}</span><span class="ext">›</span></button>`:""):`<div class="note">Đăng nhập để nhận thông báo khi có lịch/địa điểm cần duyệt hoặc đã được duyệt. <button class="link" data-login>Đăng nhập</button></div>`;
  $("#ntList").innerHTML=me?(notifs.length?notifs.map(n=>`<div class="ntit${n.r?"":" new"}"${n.u?` data-go="${esc(n.u)}" role="button" tabindex="0"`:""}><span class="dotn"></span><div><div>${esc(n.t)}</div><small>${ago(n.at)}</small></div></div>`).join(""):`<div class="empty">Chưa có thông báo nào.</div>`):"";
  $("#ntClear").hidden=!me||!notifs.length;
  const{out}=remList();$("#ntUp").innerHTML=out.length?out.map(remItem).join(""):`<div class="empty">Không có sự kiện nào trong 7 ngày tới.</div>`}
$("#bell").onclick=async()=>{renderNt();nt.showModal();
  if(me&&unreadN()){try{const j=await api("auth",{op:"readNotifs"});notifs=j.list;lastData="";updateBadge()}catch{}}};
$("#ntClear").onclick=async()=>{try{const j=await api("auth",{op:"clearNotifs"});notifs=j.list;renderNt();updateBadge()}catch(e){toast(e.message)}};
nt.addEventListener("click",ev=>{const g=ev.target.closest("[data-go]");if(g){nt.close();location.hash=g.dataset.go;return}
  if(ev.target.closest("[data-login]")){nt.close();openAcc("login")}});

/* ===== Tài khoản: đăng nhập, đăng ký, quên mật khẩu, đổi mật khẩu ===== */
const acc=$("#acc");let afterLogin=null;
$$("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
function accView(v){$$("#acc [data-view]").forEach(x=>x.hidden=x.dataset.view!==v);
  $("#accTabs").hidden=!(v==="login"||v==="signup");$$("#accTabs button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  $$("#acc .err,#acc .okm").forEach(x=>x.textContent="");
  if(v==="me")renderMe();setTimeout(()=>{const i=acc.querySelector(`[data-view="${v}"] input`);if(i&&v!=="me")i.focus()},50)}
function openAcc(v,msg){accView(v);acc.showModal();if(msg){const e=acc.querySelector(`[data-view="${v}"] .err`);if(e)e.textContent=msg}}
acc.addEventListener("close",()=>{afterLogin=null});
$$("#accTabs button").forEach(b=>b.onclick=()=>accView(b.dataset.v));
$$("#acc [data-go]").forEach(b=>b.onclick=()=>accView(b.dataset.go));
function requireLogin(cb,why){if(me)return cb();openAcc("login",why||"Hãy đăng nhập (hoặc tạo tài khoản) để tiếp tục.");afterLogin=cb}
function formErr(f,e){f.querySelector(".err").textContent=e.message||String(e)}
async function busy(f,fn){const b=f.querySelector("button:not([type=button])");if(b)b.disabled=true;try{await fn()}catch(e){formErr(f,e)}finally{if(b)b.disabled=false}}
function loggedIn(j){const cb=afterLogin;afterLogin=null;startSession(j);acc.close();toast("Xin chào "+(j.me.role==="admin"?"Admin":j.me.name)+"!");if(cb)setTimeout(cb,50)}
$("#fLogin").onsubmit=ev=>{ev.preventDefault();const f=ev.target;busy(f,async()=>{const j=await api("auth",{op:"login",id:$("#liId").value.trim(),password:$("#liPw").value},false);$("#liPw").value="";loggedIn(j)})};
$("#fSignup").onsubmit=ev=>{ev.preventDefault();const f=ev.target;busy(f,async()=>{
  if($("#suPw").value!==$("#suPw2").value)throw new Error("Hai mật khẩu chưa giống nhau.");
  const j=await api("auth",{op:"signup",name:$("#suName").value.trim(),email:$("#suEmail").value.trim(),password:$("#suPw").value},false);f.reset();loggedIn(j)})};
$("#fForgot").onsubmit=ev=>{ev.preventDefault();const f=ev.target;busy(f,async()=>{f.querySelector(".err").textContent="";
  const j=await api("auth",{op:"forgot",email:$("#fgEmail").value.trim()},false);
  f.querySelector(".okm").innerHTML="Đã gửi email đặt lại mật khẩu. Hãy mở hộp thư (kể cả mục Spam) và bấm vào liên kết trong 30 phút."+(j.devLink?`<br><small>(Chế độ thử: <a href="${esc(j.devLink)}">mở liên kết</a>)</small>`:"")})};
let resetTok="";
$("#fReset").onsubmit=ev=>{ev.preventDefault();const f=ev.target;busy(f,async()=>{
  if($("#rsPw").value!==$("#rsPw2").value)throw new Error("Hai mật khẩu chưa giống nhau.");
  const j=await api("auth",{op:"reset",token:resetTok,password:$("#rsPw").value},false);f.reset();resetTok="";loggedIn(j);toast("Đã đặt mật khẩu mới.")})};
function renderMe(){if(!me)return;const ini=initials(me.name);$("#meIni2").textContent=ini;$("#meName").textContent=dispName();$("#meMail").textContent=me.uid==="admin"?(me.email||"Tài khoản: admin"):me.email;
  $("#meRole").textContent=isAdmin()?"Quản trị viên":"Thành viên";$("#meRole").className="role"+(isAdmin()?" adm":"");
  $("#pfName").value=me.name;$("#pfMailW").hidden=me.uid!=="admin";$("#pfMail").value=me.email||"";
  $("#meSess").textContent="Phiên làm việc tự kết thúc sau 20 phút không thao tác."}
$("#fName").onsubmit=ev=>{ev.preventDefault();const f=ev.target;busy(f,async()=>{const j=await api("auth",{op:"profile",name:$("#pfName").value.trim(),email:me.uid==="admin"?$("#pfMail").value.trim():undefined});me=j.me;saveSess();renderAcc();renderMe();toast("Đã lưu.")})};
$("#fPw").onsubmit=ev=>{ev.preventDefault();const f=ev.target;busy(f,async()=>{f.querySelector(".okm").textContent="";
  if($("#cpNew").value!==$("#cpNew2").value)throw new Error("Hai mật khẩu mới chưa giống nhau.");
  await api("auth",{op:"changePassword",old:$("#cpOld").value,password:$("#cpNew").value});f.reset();f.querySelector(".okm").textContent="Đã đổi mật khẩu."})};
const initials=n=>String(n||"?").trim().split(/\s+/).slice(-2).map(w=>w[0]).join("").toUpperCase()||"?";
async function logout(){try{await api("auth",{op:"logout"})}catch{}acc.close();endSession(false);toast("Đã đăng xuất.")}
$("#logoutBtn").onclick=logout;$("#logout2").onclick=logout;
$("#loginBtn").onclick=()=>openAcc("login");$("#meBtn").onclick=()=>openAcc("me");
function renderAcc(){const on=!!me&&!!token;$("#loginBtn").hidden=on;$("#who").hidden=!on;
  if(on){$("#meName0").textContent=dispName();$("#meIni").textContent=isAdmin()?"AD":initials(me.name);$("#meBtn").title=me.name+(isAdmin()?" (quản trị viên)":"");$("#meBtn").classList.toggle("adm",isAdmin());tick()}
  const rb=$("#reviewBtn"),n=pendingCount();rb.hidden=!on||(!isAdmin()&&!n);
  rb.firstChild.textContent=isAdmin()?"Cần duyệt ":"Bài gửi của tôi ";$("#reviewN").textContent=n;$("#reviewN").classList.toggle("z",!n);
  $("#hello").textContent=greet()}
$("#reviewBtn").onclick=()=>{location.hash="#duyet"};

/* ===== Thêm / sửa sự kiện ===== */
const ed=$("#ed");let editing=null;
for(let i=1;i<=12;i++){$("#fM").add(new Option("Tháng "+i,i));$("#fM2").add(new Option("Tháng "+i,i))}
for(let i=1;i<=30;i++){$("#fA").add(new Option("Mùng "+i,i));$("#fB").add(new Option("Mùng "+i,i))}
[...$("#fA").options,...$("#fB").options].forEach(o=>{if(+o.value>10)o.text="Ngày "+o.value});
const radio=n=>document.querySelector(`input[name=${n}]:checked`).value;
const setRadio=(n,v)=>{document.querySelector(`input[name=${n}][value="${v}"]`).checked=true};
const isoD=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parseD=v=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||"");return m?new Date(+m[1],m[2]-1,+m[3]):null};
function numberEvSpots(){$$("#evSpots .spot").forEach((d,i)=>d.querySelector(".spot-h b").textContent="Địa điểm "+(i+1))}
function addEvSpot(s){s=s||{};const d=document.createElement("div");d.className="spot";
  d.innerHTML=`<div class="spot-h"><b></b><button type="button" class="pill sm danger" data-sx>Xoá</button></div>
<label>Tên địa điểm<input class="en" maxlength="80" placeholder="Ví dụ: Trung tâm Văn Hóa A"></label>
<label>Link Google (bản đồ)<input class="eu" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…"></label>`;
  d.querySelector(".en").value=s.n||"";d.querySelector(".eu").value=s.u||"";
  d.querySelector("[data-sx]").onclick=()=>{d.remove();numberEvSpots()};$("#evSpots").append(d);numberEvSpots();return d}
function readEvSpots(){const out=[];
  for(const d of $$("#evSpots .spot")){const n=d.querySelector(".en").value.trim();let u=d.querySelector(".eu").value.trim();
    if(!n&&!u)continue;if(u&&!/^https?:\/\//i.test(u))u="https://"+u;
    if(u&&!/^https?:\/\/[^\s]+\.[^\s]+$/i.test(u))throw new Error("Link Google không hợp lệ: "+u);
    out.push({n,u})}
  return out}
$("#evSpotAdd").onclick=()=>addEvSpot().querySelector(".en").focus();
/* Đọc form → sự kiện. Trả về {err} nếu ngày chưa hợp lệ */
function readForm(){const cal=radio("cal"),rp=radio("rep"),dm=radio("dm");let m,a,m2,b,year;
  if(cal==="s"){const d1=parseD($("#fD1").value),d2=dm==="r"?parseD($("#fD2").value):d1;
    if(!d1)return{err:"Hãy chọn ngày."};if(!d2)return{err:"Hãy chọn ngày kết thúc."};
    if(d2<d1)return{err:"Ngày kết thúc phải sau ngày bắt đầu."};if(diffD(d2,d1)>=365)return{err:"Khoảng ngày tối đa dưới 1 năm."};
    m=d1.getMonth()+1;a=d1.getDate();m2=d2.getMonth()+1;b=d2.getDate();year=d1.getFullYear()}
  else{m=+$("#fM").value;a=+$("#fA").value;m2=dm==="r"?+$("#fM2").value:m;b=dm==="r"?+$("#fB").value:a;year=+$("#fY").value||toLunar(now.getDate(),now.getMonth()+1,now.getFullYear()).y;
    if(m2===m&&b<a)return{err:"Ngày kết thúc phải sau ngày bắt đầu."}}
  return{id:editing||"e"+Date.now(),name:$("#fN").value.trim(),cal,m,a,m2,b,repeat:rp!=="o",every:rp==="t"?2:1,year:rp==="y"?null:year,time:$("#fT").value,note:$("#fC").value.trim()}}
let lastCal="l";
function syncForm(){const rp=radio("rep"),cal=radio("cal"),dm=radio("dm");
  /* Đổi loại ngày: tự quy đổi ngày đang chọn sang âm/dương */
  if(cal!==lastCal){try{if(cal==="l"){const d1=parseD($("#fD1").value),d2=parseD($("#fD2").value)||d1;if(d1){const l1=toLunar(d1.getDate(),d1.getMonth()+1,d1.getFullYear()),l2=toLunar(d2.getDate(),d2.getMonth()+1,d2.getFullYear());$("#fA").value=Math.min(l1.d,30);$("#fM").value=l1.m;$("#fB").value=Math.min(l2.d,30);$("#fM2").value=l2.m;$("#fY").value=l1.y}}
    else{const y=+$("#fY").value||now.getFullYear(),s=toSolar(+$("#fA").value,+$("#fM").value,y),e2=toSolar(+$("#fB").value,+$("#fM2").value,y+(((+$("#fM2").value)<(+$("#fM").value))?1:0));$("#fD1").value=isoD(s);$("#fD2").value=isoD(e2<s?s:e2)}}catch{}lastCal=cal}
  $("#solarW").hidden=cal!=="s";$("#lunarW").hidden=cal!=="l";
  $$("#ed .rng").forEach(x=>x.hidden=dm!=="r");$$("#ed .dl1").forEach(x=>x.textContent=dm==="r"?"Từ ngày":"Vào ngày");
  $("#fYw").hidden=rp==="y";$("#fYl").textContent=rp==="t"?"Năm âm lịch diễn ra (lặp lại mỗi 2 năm)":"Năm âm lịch";
  if(dm==="r"&&cal==="s"&&!$("#fD2").value&&$("#fD1").value)$("#fD2").value=$("#fD1").value;
  if(dm==="r"&&cal==="l"&&+$("#fM2").value===+$("#fM").value&&+$("#fB").value<+$("#fA").value)$("#fB").value=$("#fA").value;
  const e=readForm(),p=$("#fP");p.classList.toggle("bad",!!e.err);$("#fSave").disabled=!!e.err;
  if(e.err){p.textContent=e.err;return}p.textContent="";
  try{const o=e.repeat?nextOcc(e):occ(e,e.year);if(!o){p.textContent="Ngày này đã qua.";return}
    const n=diffD(o.en,o.s)+1,pre=e.repeat?"Lần tới: ":"Diễn ra: ";
    if(cal==="l")p.textContent=pre+"dương lịch "+fmtY(o.s)+(n>1?" → "+fmtY(o.en)+` (${n} ngày)`:"");
    else{const l=toLunar(o.s.getDate(),o.s.getMonth()+1,o.s.getFullYear()),l2=toLunar(o.en.getDate(),o.en.getMonth()+1,o.en.getFullYear());
      p.textContent=pre+fmtY(o.s)+(n>1?" → "+fmtY(o.en)+` (${n} ngày)`:"")+" · âm lịch "+l.d+"/"+l.m+(n>1?" → "+l2.d+"/"+l2.m:"")}}catch{}
  dupHint($("#fN").value,editing,evA.concat(events.filter(x=>x.status==="pending")),$("#fDup"),"sự kiện")}
function resetForm(){editing=null;$("#evF").reset();lastCal="l";
  const l=toLunar(now.getDate(),now.getMonth()+1,now.getFullYear());$("#fA").value=$("#fB").value=Math.min(l.d,30);$("#fM").value=$("#fM2").value=l.m;$("#fY").value=l.y;
  $("#fD1").value=$("#fD2").value=isoD(now);
  $("#fSave").textContent=isAdmin()?"Lưu sự kiện":"Gửi để duyệt";$("#fTitle").textContent="Thêm sự kiện mới";$("#fPend").hidden=isAdmin();$("#evSpots").innerHTML="";syncForm()}
$("#fNew").onclick=resetForm;
$("#evF").addEventListener("input",syncForm);$("#evF").addEventListener("change",syncForm);
function editEvent(id){const e=events.find(x=>x.id===id);if(!e)return;resetForm();editing=e.id;
  $("#fN").value=e.name;setRadio("rep",!e.repeat?"o":e.every===2?"t":"y");setRadio("dm",e.m2===e.m&&e.a===e.b?"1":"r");setRadio("cal",e.cal);lastCal=e.cal;
  if(e.cal==="s"){const y=e.year||(nextOcc(e)||{}).y||now.getFullYear(),o=occ(e,y);$("#fD1").value=isoD(o.s);$("#fD2").value=isoD(o.en)}
  else{$("#fM").value=e.m;$("#fA").value=e.a;$("#fM2").value=e.m2;$("#fB").value=e.b;$("#fY").value=e.year||toLunar(now.getDate(),now.getMonth()+1,now.getFullYear()).y}
  $("#fT").value=e.time||"";$("#fC").value=e.note||"";(e.spots||[]).forEach(addEvSpot);
  $("#fSave").textContent="Cập nhật";$("#fTitle").textContent="Sửa sự kiện";$("#fPend").hidden=true;syncForm()}
$("#evF").onsubmit=async ev=>{ev.preventDefault();const o=readForm();if(o.err||!o.name)return;
  try{o.spots=readEvSpots();const j=await mutate("events","upsert",o);ed.close();resetForm();
    toast(j.pending?"Đã gửi sự kiện. Quản trị viên sẽ duyệt trước khi hiển thị.":"Đã lưu sự kiện.")}catch(e){alert(e.message)}};
const openAdd=()=>requireLogin(()=>{resetForm();ed.showModal()},"Hãy đăng nhập để thêm sự kiện. Chưa có tài khoản? Bấm Tạo tài khoản.");
$("#addBtn").onclick=openAdd;$("#addBtn2").onclick=openAdd;

/* ===== Trùng tên / tên tương tự ===== */
const nameKey=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
function lev(a,b){const v=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let p=v[0];v[0]=i;for(let j=1;j<=b.length;j++){const t=v[j];v[j]=Math.min(v[j]+1,v[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return v[b.length]}
function similar(name,exceptId,list){const k=nameKey(name);if(k.length<2)return[];const kt=k.split(" ").filter(t=>t.length>1);
  return list.filter(p=>p.id!==exceptId).map(p=>{const pk=nameKey(p.name);if(!pk)return null;if(pk===k)return{p,s:1,dup:true};
    let s=0;if((k.length>=3&&pk.includes(k))||(pk.length>=3&&k.includes(pk)))s=.85;
    else{const pt=pk.split(" ").filter(t=>t.length>1),inter=kt.filter(t=>pt.includes(t)).length,uni=new Set([...kt,...pt]).size;
      s=Math.max(uni?inter/uni:0,k.length>=4?1-lev(pk,k)/Math.max(pk.length,k.length):0)}
    return s>=.6?{p,s}:null}).filter(Boolean).sort((a,b)=>b.s-a.s).slice(0,5)}
function dupHint(name,exceptId,list,box,what){const L=similar(name,exceptId,list);if(!L.length){box.hidden=true;box.innerHTML="";return null}
  const dup=L.find(x=>x.dup),isPl=what==="địa điểm";
  const row=x=>`<div class="dr"><div><b>${esc(x.p.name)}</b>${x.p.status==="pending"?' <span class="chip pend">chờ duyệt</span>':""}</div>${isPl&&x.p.status!=="pending"?`<div class="btns"><button type="button" class="pill sm" data-view-pl="${esc(x.p.id)}">Xem</button><button type="button" class="pill sm primary" data-sg-pl="${esc(x.p.id)}">Góp ý vào đây</button></div>`:""}</div>`;
  box.innerHTML=(dup?`<div class="dh bad">Tên ${what} này đã có. Hãy dùng ${what} đã có${isPl?" (bấm Góp ý vào đây để bổ sung thông tin)":""} hoặc đặt tên khác.</div>`:`<div class="dh">Có ${what} tương tự. Kiểm tra xem có phải cùng một ${what} không:</div>`)+L.map(row).join("");
  box.hidden=false;box.classList.toggle("bad",!!dup);return dup}

/* ===== Trang "Tất cả các sự kiện" ===== */
const nrm=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
function renderAllPage(){if($("#allPage").hidden)return;const q=nrm($("#aSearch").value.trim()),adm=isAdmin();
  const L=evA.map(e=>({e,o:nextOcc(e)})).filter(x=>!q||nrm(x.e.name).includes(q)||nrm(x.e.note||"").includes(q))
    .sort((a,b)=>a.o&&b.o?a.o.s-b.o.s:a.o?-1:b.o?1:0);
  $("#aCount").textContent=q?`${L.length}/${evA.length}`:evA.length;
  const box=$("#aList");
  box.innerHTML=L.length?L.map(({e,o})=>{const dd=o?diffD(o.s,T0):0,chip=!o?"Đã qua":dd<=0?"Đang diễn ra":"Còn "+dd+" ngày";
    return`<div class="ei"><div class="eb" role="button" tabindex="0" data-ev="${esc(e.id)}"><b>${esc(e.name)}</b><small class="dl">${o?"<b>"+fmtY(o.s)+(o.en>o.s?" – "+fmtY(o.en):"")+"</b> (dương lịch)":"Đã kết thúc"} · ${dateTxt(e)}${e.time?" · "+e.time:""}</small><span class="chips">${repChip(e,"tag")}<span class="chip d">${chip}</span></span></div>${ownActs(e,"events")}</div>`}).join("")
    :`<div class="empty">${evA.length?"Không tìm thấy sự kiện phù hợp.":"Chưa có sự kiện nào."}</div>`;
  bindActs(box)}
$("#aSearch").addEventListener("input",renderAllPage);
async function delEvent(id){if(!confirm("Xoá sự kiện này?"))return;try{await mutate("events","delete",{id});vd.close()}catch(e){alert(e.message)}}
$("#bkBtn").onclick=()=>{const d=new Date(),a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify({xuatLuc:d.toISOString(),events:evA,places:plA},null,2)],{type:"application/json"}));
  a.download=`lich-su-kien-sao-luu-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};

/* Nút thao tác: quản trị viên Sửa + Xoá; người tạo Sửa + Yêu cầu xoá (thành viên không tự xoá được) */
function ownActs(x,k){const ev=k==="events",id=esc(x.id);
  if(isAdmin())return`<div class="acts"><button class="pill sm primary" ${ev?"data-e":"data-pe"}="${id}">Sửa</button><button class="pill sm danger" ${ev?"data-d":"data-pd"}="${id}">Xoá</button></div>`;
  if(!x.mine)return"";
  return`<div class="acts"><button class="pill sm primary" ${ev?"data-e":"data-pe"}="${id}">Sửa</button>${x.delReq?'<span class="chip pend">Đã gửi yêu cầu xoá</span>':`<button class="pill sm danger" data-rq="${k}:${id}">Yêu cầu xoá</button>`}</div>`}
async function reqDelete(k,id){const x=(k==="events"?events:places).find(i=>i.id===id);if(!x)return;
  const why=prompt(`Gửi yêu cầu xoá "${x.name}" cho quản trị viên.\nLý do (tuỳ chọn):`,"");if(why===null)return;
  try{apply(await api("store",{op:"reqDelete",kind:k,id,reason:why}));vd.close();toast("Đã gửi yêu cầu xoá. Quản trị viên sẽ xem và xoá giúp bạn.")}catch(e){alert(e.message)}}

/* ===== Trang duyệt bài (quản trị viên) / Bài gửi của tôi (thành viên) ===== */
function pendingCount(){if(!me)return 0;const all=[...events,...places];return all.filter(x=>x.status==="pending"&&(isAdmin()||x.mine)).length+all.filter(x=>x.delReq&&x.status!=="pending").length+(isAdmin()?suggestions.length:0)}
const plName=id=>{const p=places.find(x=>x.id===id);return p?p.name:"(đã xoá)"};
const byLine=x=>`<small class="by2">${x.byName?"Gửi bởi <b>"+esc(x.byName)+"</b> · ":""}${x.at?ago(x.at):""}</small>`;
function sugHtml(s,adm){return`<div class="sg"><div class="sgt">${s.text?esc(s.text):"<i>(không có nội dung)</i>"}</div>${(s.spots||[]).length?'<ul class="spl">'+s.spots.map(x=>`<li><span class="sn2">${esc(x.n||"")}</span>${x.u?` <a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">Đường Đi</a>`:""}${x.c?`<div class="sc2">${esc(x.c)}</div>`:""}</li>`).join("")+"</ul>":""}${byLine(s)}
  <div class="btns">${adm?`<button class="pill sm filled blue" data-merge="${esc(s.id)}">Đưa vào địa điểm</button><button class="pill sm" data-dismiss="${esc(s.id)}">Bỏ qua</button>`:`<span class="chip pend">Đang chờ quản trị viên xem</span>`}</div></div>`}
function renderReview(){if($("#revPage").hidden)return;const adm=isAdmin(),box=$("#revList");
  if(!me){box.innerHTML=`<div class="empty">Hãy đăng nhập để xem mục này.</div>`;return}
  $("#revTitle").textContent=adm?"Cần duyệt":"Bài gửi của tôi";$("#admTools").hidden=!adm;
  $("#revNote").textContent=adm?"Lịch và địa điểm do thành viên gửi chỉ hiển thị sau khi bạn duyệt. Góp ý được đính kèm vào địa điểm để bạn cập nhật.":"Các lịch và địa điểm bạn gửi đang chờ quản trị viên duyệt. Bạn sẽ nhận thông báo khi được duyệt.";
  const pe=events.filter(e=>e.status==="pending"),pp=places.filter(p=>p.status==="pending");
  const evRow=e=>`<div class="ei"><div class="eb" role="button" tabindex="0" data-ev="${esc(e.id)}"><b>${esc(e.name)}</b><small>${dateTxt(e)} · ${esc(repTxt(e))}${e.time?" · "+e.time:""}</small>${e.note?`<small>${esc(e.note)}</small>`:""}${byLine(e)}</div><div class="acts">${adm?`<button class="pill sm filled green" data-ok="events:${esc(e.id)}">Duyệt</button><button class="pill sm danger" data-no="events:${esc(e.id)}">Từ chối</button>`:""}<button class="pill sm primary" data-e="${esc(e.id)}">Sửa</button>${adm?"":e.delReq?'<span class="chip pend">Đã gửi yêu cầu xoá</span>':`<button class="pill sm danger" data-rq="events:${esc(e.id)}">Yêu cầu xoá</button>`}</div></div>`;
  const plRow=p=>`<div class="ei col"><div class="eb"><b>${esc(p.name)}</b>${placeBody(p)}${byLine(p)}</div><div class="acts">${adm?`<button class="pill sm filled green" data-ok="places:${esc(p.id)}">Duyệt</button><button class="pill sm danger" data-no="places:${esc(p.id)}">Từ chối</button>`:""}<button class="pill sm primary" data-pe="${esc(p.id)}">Sửa</button>${adm?"":p.delReq?'<span class="chip pend">Đã gửi yêu cầu xoá</span>':`<button class="pill sm danger" data-rq="places:${esc(p.id)}">Yêu cầu xoá</button>`}</div></div>`;
  const sec=(t,n,body)=>`<h3 class="sub">${t} <span class="badge${n?"":" ok"}">${n}</span></h3>${n?body:'<div class="empty">Không có.</div>'}`;
  const dr=[...events.filter(e=>e.delReq&&e.status!=="pending").map(e=>["events",e]),...places.filter(p=>p.delReq&&p.status!=="pending").map(p=>["places",p])];
  const drRow=([k,x])=>`<div class="ei"><div class="eb"${k==="events"?` role="button" tabindex="0" data-ev="${esc(x.id)}"`:""}><b>${k==="events"?"📅":"📍"} ${esc(x.name)}</b><small>${k==="events"?dateTxt(x):"Địa điểm"} · yêu cầu ${ago(x.delReq.at)}</small>${x.delReq.reason?`<small>Lý do: ${esc(x.delReq.reason)}</small>`:""}${byLine(x)}</div><div class="acts">${adm?`<button class="pill sm danger filled red" ${k==="events"?"data-d":"data-pd"}="${esc(x.id)}">Xoá</button><button class="pill sm" data-keep="${k}:${esc(x.id)}">Giữ lại</button>`:'<span class="chip pend">Chờ quản trị viên xoá</span>'}</div></div>`;
  box.innerHTML=sec(adm?"Yêu cầu xoá":"Yêu cầu xoá của tôi",dr.length,dr.map(drRow).join(""))+sec("Lịch chờ duyệt",pe.length,pe.map(evRow).join(""))+sec("Địa điểm chờ duyệt",pp.length,pp.map(plRow).join(""))+
    sec(adm?"Góp ý cho địa điểm":"Góp ý của tôi",suggestions.length,suggestions.map(s=>`<div class="ei col"><div class="eb"><b>${esc(plName(s.placeId))}</b>${sugHtml(s,adm)}</div></div>`).join(""));
  bindActs(box)}
function bindActs(box){
  box.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{editEvent(b.dataset.e);ed.showModal()});
  box.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>delEvent(b.dataset.d));
  box.querySelectorAll("[data-pe]").forEach(b=>b.onclick=()=>openPlace(places.find(x=>x.id===b.dataset.pe)));
  box.querySelectorAll("[data-pd]").forEach(b=>b.onclick=async()=>{if(confirm("Xoá địa điểm này?"+(()=>{const p=places.find(x=>x.id===b.dataset.pd);return p&&p.delReq?" (người tạo đã yêu cầu xoá)":""})())){try{await mutate("places","delete",{id:b.dataset.pd})}catch(e){alert(e.message)}}});
  box.querySelectorAll("[data-ok]").forEach(b=>b.onclick=async()=>{const[k,id]=b.dataset.ok.split(":");b.disabled=true;try{await api("store",{op:"approve",kind:k,id}).then(apply);toast("Đã duyệt. Người gửi đã được thông báo.")}catch(e){alert(e.message);b.disabled=false}});
  box.querySelectorAll("[data-no]").forEach(b=>b.onclick=async()=>{const[k,id]=b.dataset.no.split(":"),why=prompt("Lý do từ chối (tuỳ chọn, sẽ gửi cho người gửi):","");if(why===null)return;
    try{await api("store",{op:"reject",kind:k,id,reason:why}).then(apply);toast("Đã từ chối. Người gửi đã được thông báo.")}catch(e){alert(e.message)}});
  box.querySelectorAll("[data-merge]").forEach(b=>b.onclick=()=>{const s=suggestions.find(x=>x.id===b.dataset.merge),p=s&&places.find(x=>x.id===s.placeId);if(p)openPlace(p,s);else alert("Địa điểm đã bị xoá.")});
  box.querySelectorAll("[data-dismiss]").forEach(b=>b.onclick=async()=>{if(!confirm(isAdmin()?"Bỏ qua góp ý này? Người gửi sẽ được báo là bạn đã xem.":"Xoá góp ý này?"))return;
    try{await api("store",{op:"dismiss",id:b.dataset.dismiss}).then(apply)}catch(e){alert(e.message)}});
  box.querySelectorAll("[data-sg]").forEach(b=>b.onclick=ev=>{ev.preventDefault();ev.stopPropagation();openSuggest(b.dataset.sg)});
  box.querySelectorAll("[data-rq]").forEach(b=>b.onclick=()=>{const[k,id]=b.dataset.rq.split(":");reqDelete(k,id)});
  box.querySelectorAll("[data-keep]").forEach(b=>b.onclick=async()=>{const[k,id]=b.dataset.keep.split(":"),why=prompt("Giữ lại, không xoá. Lý do (tuỳ chọn, sẽ gửi cho người yêu cầu):","");if(why===null)return;
    try{apply(await api("store",{op:"keep",kind:k,id,reason:why}));toast("Đã giữ lại. Người yêu cầu đã được thông báo.")}catch(e){alert(e.message)}})}
$("#revBack").onclick=()=>{location.hash=""};

function route(){const h=location.hash;
  if(h.startsWith("#dat-lai-mat-khau=")){resetTok=decodeURIComponent(h.slice(18));history.replaceState(null,"",location.pathname);openAcc("reset");return route()}
  const all=h==="#tat-ca",rev=h==="#duyet";
  if(rev&&!me){history.replaceState(null,"",location.pathname);requireLogin(()=>{location.hash="#duyet"});}
  $("#mainView").hidden=all||(rev&&!!me);$("#allPage").hidden=!all;$("#revPage").hidden=!(rev&&me);
  if(all)renderAllPage();if(rev)renderReview();window.scrollTo(0,0)}
addEventListener("hashchange",route);
$("#backBtn").onclick=()=>{location.hash=""};

/* ===== Xem chi tiết sự kiện ===== */
const vd=$("#vd");let vdId=null;
function showEvent(id){const e=events.find(x=>x.id===id);if(!e)return;vdId=id;
  const o=nextOcc(e),row=(k,v)=>`<div class="vrow"><span>${k}</span><div>${v}</div></div>`;
  let when="Đã qua";if(o){const dd=diffD(o.s,T0);when=fmtY(o.s)+(o.en>o.s?" – "+fmtY(o.en):"")+` (${dd<=0?"đang diễn ra":"còn "+dd+" ngày"})`}
  let lu="";if(e.cal==="s"&&o){const l=toLunar(o.s.getDate(),o.s.getMonth()+1,o.s.getFullYear());lu=row("Âm lịch",`${l.d}/${l.m} (ngày bắt đầu)`)}
  $("#vdN").textContent=e.name;
  const pend=e.status==="pending";
  $("#vdS").innerHTML=pend?`<div class="pendbox"><span class="chip pend">Đang chờ duyệt</span>${e.byName?" Gửi bởi <b>"+esc(e.byName)+"</b>":""}${isAdmin()?`<div class="btns"><button class="pill sm filled green" data-ok="events:${esc(e.id)}">Duyệt</button><button class="pill sm danger" data-no="events:${esc(e.id)}">Từ chối</button></div>`:""}</div>`:"";
  bindActs($("#vdS"));$$("#vdS [data-ok],#vdS [data-no]").forEach(b=>b.addEventListener("click",()=>vd.close()));
  $("#vdB").innerHTML=row("Ngày",esc(dateTxt(e)))+row("Lặp lại",esc(repTxt(e)))+row(e.repeat?"Lần tới":"Diễn ra","Dương lịch: "+esc(when))+lu+(e.time?row("Giờ",esc(e.time)):"")+((e.spots||[]).length?row("Địa điểm",spotsHtml(e)):"")+row("Ghi chú",e.note?`<div class="vnote">${esc(e.note)}</div>`:"<i>Không có ghi chú</i>");
  const can=isAdmin()||e.mine;$("#vdEdit").hidden=!can;$("#vdDel").hidden=!can;$("#vdDel").textContent=isAdmin()?"Xoá":e.delReq?"Đã gửi yêu cầu xoá":"Yêu cầu xoá";$("#vdDel").disabled=!isAdmin()&&!!e.delReq;$("#vdRem").hidden=$("#vdHint").hidden=pend;
  $("#vdGcal").hidden=!/android/i.test(navigator.userAgent);vd.showModal()}
const ymd=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
const icsEsc=s=>String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
const tmOk=e=>/^\d{2}:\d{2}$/.test(e.time||"");
function eventOccs(e,max=5){const out=[],Y=now.getFullYear();
  for(let y=Y-1;y<=Y+10&&out.length<max;y++){if(!yearOk(e,y))continue;const o=occ(e,y);if(day0(o.en)>=T0)out.push(o)}
  return out.sort((a,b)=>a.s-b.s)}
function endHM(e){const[h,m]=e.time.split(":").map(Number);return h>=23?"2359":pad(h+1)+pad(m)}
function makeIcs(e){const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Lich Su Kien//VI","CALSCALE:GREGORIAN","METHOD:PUBLISH"],stamp=new Date().toISOString().replace(/[-:]|\.\d{3}/g,"");
  const sp=e.spots||[],desc=icsEsc(dateTxt(e)+" · "+repTxt(e)+sp.map(s=>"\nĐịa điểm: "+s.n+(s.u?" - "+s.u:"")).join("")+(e.note?"\n"+e.note:""));
  eventOccs(e).forEach(o=>{const tm=tmOk(e),end=new Date(o.en.getFullYear(),o.en.getMonth(),o.en.getDate()+1);
    L.push("BEGIN:VEVENT",`UID:${e.id}-${ymd(o.s)}@lich-su-kien.vercel.app`,"DTSTAMP:"+stamp,"SUMMARY:"+icsEsc(e.name),"DESCRIPTION:"+desc,...(sp[0]&&sp[0].n?["LOCATION:"+icsEsc(sp[0].n)]:[]),
      tm?`DTSTART:${ymd(o.s)}T${e.time.replace(":","")}00`:`DTSTART;VALUE=DATE:${ymd(o.s)}`,
      tm?`DTEND:${ymd(o.en)}T${endHM(e)}00`:`DTEND;VALUE=DATE:${ymd(end)}`);
    (()=>{const sm=tm?+e.time.slice(0,2)*60+ +e.time.slice(3,5):0,dur=m=>`-P${Math.floor(m/1440)}DT${Math.floor(m%1440/60)}H${m%60}M`;
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
$("#vdEdit").onclick=()=>{vd.close();editEvent(vdId);ed.showModal()};
$("#vdDel").onclick=()=>isAdmin()?delEvent(vdId):reqDelete("events",vdId);
document.addEventListener("click",ev=>{if(ev.target.closest("a,button:not([data-ev])"))return;const t=ev.target.closest("[data-ev]");if(t)showEvent(t.dataset.ev)});
document.addEventListener("keydown",ev=>{const t=ev.target;if((ev.key==="Enter"||ev.key===" ")&&t.matches&&t.matches("div[data-ev]")){ev.preventDefault();showEvent(t.dataset.ev)}});

/* ===== Tiện ích ===== */
$("#reloadBtn").onclick=()=>{$("#reloadBtn").classList.add("spin");location.reload()};
/* ===== Giao diện Sáng / Tối / Auto: bật/tắt các khối CSS "chế độ tối" theo lựa chọn ===== */
const darkRules=[];
try{for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch{continue}for(const r of rs)if(r.media&&/prefers-color-scheme:\s*dark/.test(r.media.mediaText))darkRules.push([r,r.media.mediaText])}}catch{}
function setTheme(t){t=t==="light"||t==="dark"?t:"auto";ls.set("lich-theme",t);
  for(const[r,orig]of darkRules){try{r.media.mediaText=t==="auto"?orig:t==="dark"?"all":"not all"}catch{}}
  const de=document.documentElement;de.style.colorScheme=t==="auto"?"light dark":t;de.dataset.theme=t;
  const dark=t==="dark"||(t==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);
  $$('meta[name="theme-color"]').forEach(m=>{m.content=dark?"#000000":"#f2f2f7";m.removeAttribute("media")});
  $$("#themeSeg button").forEach(b=>{b.classList.toggle("on",b.dataset.th===t);b.setAttribute("aria-pressed",b.dataset.th===t)})}
$$("#themeSeg button").forEach(b=>b.onclick=()=>setTheme(b.dataset.th));
setTheme(ls.get("lich-theme")||"auto");
function cleanJunk(){["lich-wx-v1","lich-g-off","lich-asked-old","lich-sent-v1","lich-notif-off","lich-asked","lich-mode","lich-v","lich-events-v1-init"].forEach(ls.del)}
$("#cleanBtn").onclick=async()=>{
  if(!confirm("Xoá dữ liệu rác cũ trên máy này (dữ liệu thời tiết cũ, bản ghi nhắc cũ, bộ nhớ đệm cũ)?\n(Sự kiện, địa điểm và đăng nhập không bị ảnh hưởng.)"))return;
  cleanJunk();try{if(window.caches)for(const n of await caches.keys())await caches.delete(n)}catch{}
  alert("Đã dọn xong dữ liệu rác cũ.");location.reload()};
cleanJunk();
let toastT=0;function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},3800)}

/* ===== Ghi chú địa điểm ===== */
/* 34 tỉnh, thành mới (từ 2025) và các tỉnh cũ sáp nhập vào */
const PROV=[["Hà Nội"],["TP. Hồ Chí Minh",["TP. Hồ Chí Minh","Bà Rịa - Vũng Tàu","Bình Dương"]],["Hải Phòng",["Hải Phòng","Hải Dương"]],["Đà Nẵng",["Đà Nẵng","Quảng Nam"]],
 ["Cần Thơ",["Cần Thơ","Sóc Trăng","Hậu Giang"]],["Huế"],["Tuyên Quang",["Tuyên Quang","Hà Giang"]],["Lào Cai",["Lào Cai","Yên Bái"]],["Thái Nguyên",["Thái Nguyên","Bắc Kạn"]],
 ["Phú Thọ",["Phú Thọ","Vĩnh Phúc","Hòa Bình"]],["Bắc Ninh",["Bắc Ninh","Bắc Giang"]],["Hưng Yên",["Hưng Yên","Thái Bình"]],["Ninh Bình",["Ninh Bình","Hà Nam","Nam Định"]],
 ["Quảng Trị",["Quảng Trị","Quảng Bình"]],["Quảng Ngãi",["Quảng Ngãi","Kon Tum"]],["Gia Lai",["Gia Lai","Bình Định"]],["Khánh Hòa",["Khánh Hòa","Ninh Thuận"]],
 ["Lâm Đồng",["Lâm Đồng","Đắk Nông","Bình Thuận"]],["Đắk Lắk",["Đắk Lắk","Phú Yên"]],["Đồng Nai",["Đồng Nai","Bình Phước"]],["Tây Ninh",["Tây Ninh","Long An"]],
 ["Vĩnh Long",["Vĩnh Long","Bến Tre","Trà Vinh"]],["Đồng Tháp",["Đồng Tháp","Tiền Giang"]],["Cà Mau",["Cà Mau","Bạc Liêu"]],["An Giang",["An Giang","Kiên Giang"]],
 ["Lai Châu"],["Điện Biên"],["Sơn La"],["Lạng Sơn"],["Quảng Ninh"],["Thanh Hóa"],["Nghệ An"],["Hà Tĩnh"],["Cao Bằng"]];
const provName=i=>i>=1&&i<=34?PROV[i-1][0]:"";
let provF=0;
/* Tỉnh đang thu gọn (nhớ trên máy). Mặc định: thu gọn tất cả cho gọn */
const pClosed=new Set();let pcInit=false;
try{const v=JSON.parse(ls.get("lich-pclosed")||"null");if(Array.isArray(v)){v.forEach(x=>pClosed.add(+x));pcInit=true}}catch{}
function savePC(){ls.set("lich-pclosed",JSON.stringify([...pClosed]))}

const pl=$("#pl");let editingP=null,mergeS=null;const openP=new Set();
const flat=s=>esc(s).replace(/\s*\n+\s*/g," · ");
function placeBody(p){let x="";const sp=p.spots||[];
  if(sp.length)x+='<ul class="spl">'+sp.map(s=>`<li>${s.n?`<span class="sn2">${esc(s.n)}</span>`:""}${s.u?`<a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">Đường Đi</a>`:""}${s.c?`<div class="sc2">${esc(s.c)}</div>`:""}</li>`).join("")+"</ul>";
  if(p.note)x+=`<div class="pnote"><span class="k">Ghi chú:</span> ${esc(p.note)}</div>`;
  return x||`<div class="empty">Chưa có chi tiết.</div>`}
function placeRow(p,adm){const pv=[...(p.spots||[]).map(s=>s.n),p.note].filter(Boolean).map(flat).join(" · "),sg=suggestions.filter(s=>s.placeId===p.id),canSg=!adm&&!p.mine;
  return`<details class="pd" data-id="${esc(p.id)}"${openP.has(p.id)?" open":""}><summary><span class="ps"><span class="pn">${esc(p.name)}${sg.length?` <span class="chip sgc">${sg.length} góp ý</span>`:""}${p.delReq?' <span class="chip pend">yêu cầu xoá</span>':""}</span>${pv?`<span class="pv">${pv}</span>`:""}</span></summary><div class="pb">${placeBody(p)}`+
    (sg.length?`<div class="sgs"><div class="sgh">${adm?"Góp ý của thành viên":"Góp ý của bạn"}</div>${sg.map(s=>sugHtml(s,adm)).join("")}</div>`:"")+
    (canSg?`<div class="sgcta"><div><b>Bạn biết thêm về địa điểm này?</b><span>Góp ý sẽ đính kèm vào địa điểm để quản trị viên cập nhật cho đầy đủ hơn.</span></div><button type="button" class="pill filled blue" data-sg="${esc(p.id)}">💬 Góp ý thêm</button></div>`:"")+
    (p.byName&&adm?byLine(p):"")+ownActs(p,"places")+`</div></details>`}
/* Danh sách địa điểm nhóm theo 34 tỉnh (đúng thứ tự 1 → 34), tỉnh không có địa điểm thì ẩn */
function renderPlaces(){const q=nrm($("#pSearch").value.trim()),adm=isAdmin();
  const txt=p=>[p.name,p.note,provName(p.prov),p.sub,...(p.spots||[]).flatMap(s=>[s.n,s.c])].filter(Boolean).join(" ");
  const byName=(a,b)=>a.name.localeCompare(b.name,"vi",{numeric:true,sensitivity:"base"});
  const M=plA.filter(p=>!q||nrm(txt(p)).includes(q)),groups=new Map();
  for(const p of M){const k=p.prov||0;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p)}
  if(!pcInit&&plA.length){pcInit=true;for(let i=0;i<=34;i++)pClosed.add(i)}
  const keys=[...groups.keys()].sort((a,b)=>(a||99)-(b||99));if(provF&&!groups.has(provF))provF=0;
  $("#pCount").textContent=q?`${M.length}/${plA.length}`:plA.length;
  $("#pAdd").textContent=me&&!adm?"+ Gửi địa điểm mới":"+ Thêm địa điểm";
  $("#pProvs").innerHTML=keys.length>1?`<button type="button" class="pv-chip${provF?"":" on"}" data-prov="0">Tất cả <b>${M.length}</b></button>`+keys.map(k=>`<button type="button" class="pv-chip${provF===k?" on":""}" data-prov="${k}">${k?esc(provName(k)):"Chưa chọn tỉnh"} <b>${groups.get(k).length}</b></button>`).join(""):"";
  $("#pList").innerHTML=M.length?keys.filter(k=>!provF||k===provF).map(k=>{const L=groups.get(k).sort((a,b)=>(a.sub||"").localeCompare(b.sub||"","vi")||byName(a,b));
    const open=!!q||(!!provF&&provF===k)||!pClosed.has(k),subs=k&&PROV[k-1][1];
    let body;if(subs){const bySub=new Map();for(const p of L){const sk=p.sub||"";if(!bySub.has(sk))bySub.set(sk,[]);bySub.get(sk).push(p)}
      const order=[...subs,""].filter(x=>bySub.has(x));body=order.map(sk=>`<div class="psub"><div class="psh">${sk?esc(sk):"Chưa chọn khu vực"}<span>${bySub.get(sk).length}</span></div><div class="plist">${bySub.get(sk).map(p=>placeRow(p,adm)).join("")}</div></div>`).join("")}
    else body=`<div class="plist">${L.map(p=>placeRow(p,adm)).join("")}</div>`;
    return`<section class="pgrp${open?" open":""}"><button type="button" class="pgh" data-pg="${k}" aria-expanded="${open}"><span class="pno">${k||"?"}</span><span class="pgt"><b>${k?esc(provName(k)):"Chưa chọn tỉnh"}</b>${subs?`<small>${esc(subs.join(" · "))}</small>`:""}</span><span class="badge ok">${L.length}</span><span class="chev" aria-hidden="true">›</span></button><div class="pgb">${!k&&adm?'<div class="note sm">Bấm Sửa từng địa điểm để chọn tỉnh cho đúng.</div>':""}${body}</div></section>`}).join("")
    :`<div class="empty">${plA.length?"Không tìm thấy địa điểm phù hợp.":"Chưa có ghi chú địa điểm nào."}</div>`;
  $$("#pProvs [data-prov]").forEach(b=>b.onclick=()=>{provF=+b.dataset.prov;if(provF)pClosed.delete(provF);renderPlaces()});
  $$("#pList [data-pg]").forEach(b=>b.onclick=()=>{const k=+b.dataset.pg;pClosed.has(k)?pClosed.delete(k):pClosed.add(k);savePC();renderPlaces()});
  const allK=keys,allClosed=allK.every(k=>pClosed.has(k));$("#pToggle").hidden=!M.length||!!q;$("#pToggle").textContent=allClosed?"Mở tất cả":"Thu gọn tất cả";
  $("#pToggle").onclick=()=>{if(allClosed)allK.forEach(k=>pClosed.delete(k));else allK.forEach(k=>pClosed.add(k));savePC();renderPlaces()};
  $$("details.pd").forEach(d=>d.addEventListener("toggle",()=>{d.open?openP.add(d.dataset.id):openP.delete(d.dataset.id)}));
  bindActs($("#pList"))}
/* Chọn tỉnh (1–34) → hiện các tỉnh cũ trong đó để tick chọn */
for(let i=0;i<=34;i++)$("#plProv").add(new Option(i?i+". "+PROV[i-1][0]+(PROV[i-1][1]?" ("+PROV[i-1][1].join(", ")+")":""):"— Chọn tỉnh / thành phố —",i));
function renderSubs(sel){const i=+$("#plProv").value,box=$("#plSubs"),subs=i?PROV[i-1][1]:null;
  if(!subs){box.innerHTML="";box.hidden=true;return}box.hidden=false;
  box.innerHTML=`<div class="fsec-h">Khu vực (tỉnh cũ):</div>`+subs.map(n=>`<label class="subc2"><input type="radio" name="plSub" value="${esc(n)}"${n===sel?" checked":""}><span>${esc(n)}</span></label>`).join("")}
$("#plProv").onchange=()=>renderSubs("");
function numberSpots(){$$("#spots .spot").forEach((d,i)=>d.querySelector(".spot-h b").textContent="Vị trí "+(i+1))}
function addSpot(s){s=s||{};const d=document.createElement("div");d.className="spot";
  d.innerHTML=`<div class="spot-h"><b></b><button type="button" class="pill sm danger" data-sx>Xoá vị trí</button></div>
<label>Tên vị trí<input class="sn" maxlength="80" placeholder="Ví dụ: Quảng Trường"></label>
<label>Link vị trí<input class="su" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…"></label>
<label>Ghi chú vị trí (tuỳ chọn)<input class="sc" maxlength="300" placeholder="Ví dụ: nơi này cần đi buổi tối"></label>`;
  d.querySelector(".sn").value=s.n||"";d.querySelector(".su").value=s.u||"";d.querySelector(".sc").value=s.c||"";
  d.querySelector("[data-sx]").onclick=()=>{d.remove();numberSpots()};$("#spots").append(d);numberSpots();return d}
function readSpots(){const out=[];
  for(const d of $$("#spots .spot")){let n=d.querySelector(".sn").value.trim(),u=d.querySelector(".su").value.trim(),c=d.querySelector(".sc").value.trim();
    if(!n&&!u&&!c)continue;if(u&&!/^https?:\/\//i.test(u))u="https://"+u;
    if(u&&!/^https?:\/\/[^\s]+\.[^\s]+$/i.test(u))throw new Error("Link vị trí không hợp lệ: "+u);
    out.push({n,u,c})}
  return out}
$("#spotAdd").onclick=()=>addSpot().querySelector(".sn").focus();
function plDupCheck(){const dup=dupHint($("#plN").value,editingP,places,$("#plDup"),"địa điểm");$("#plSave").disabled=!!dup}
/* Mở form địa điểm. s = góp ý cần đưa vào (quản trị viên) */
function openPlace(p,s){editingP=p?p.id:null;mergeS=s||null;$("#plTitle").textContent=s?"Cập nhật góp ý vào địa điểm":p?"Sửa địa điểm":isAdmin()?"Thêm địa điểm":"Gửi địa điểm mới";
  $("#plPend").hidden=!!p||isAdmin();$("#plN").value=p?p.name:"";$("#plC").value=p?p.note||"":"";
  $("#spots").innerHTML="";(p&&p.spots||[]).forEach(addSpot);
  $("#plProv").value=p&&p.prov||(!p&&provF)||0;renderSubs(p&&p.sub||"");
  $("#plMerge").hidden=!s;
  if(s){$("#plMerge").innerHTML=`<b>Góp ý của ${esc(s.byName||"thành viên")}:</b> ${esc(s.text||"")}<br><small>Nội dung góp ý đã được thêm vào bên dưới. Chỉnh lại cho gọn rồi bấm Lưu.</small>`;
    (s.spots||[]).forEach(addSpot);if(s.text)$("#plC").value=($("#plC").value?$("#plC").value+"\n":"")+s.text}
  $("#plSave").textContent=s?"Lưu & đánh dấu đã cập nhật":p||isAdmin()?"Lưu địa điểm":"Gửi để duyệt";
  plDupCheck();pl.showModal();if(!p)$("#plN").focus()}
$("#plN").addEventListener("input",plDupCheck);
$("#plDup").addEventListener("click",ev=>{const v=ev.target.closest("[data-view-pl]"),g=ev.target.closest("[data-sg-pl]");
  if(v){pl.close();showPlace(v.dataset.viewPl)}else if(g){pl.close();openSuggest(g.dataset.sgPl)}});
function showPlace(id){location.hash="";$("#pSearch").value="";openP.add(id);{const p=places.find(x=>x.id===id);if(p)pClosed.delete(p.prov||0)}renderPlaces();const d=document.querySelector(`details.pd[data-id="${CSS.escape(id)}"]`);if(d){d.open=true;d.scrollIntoView({behavior:"smooth",block:"center"});d.classList.add("flash");setTimeout(()=>d.classList.remove("flash"),1600)}}
$("#pAdd").onclick=()=>requireLogin(()=>openPlace(null),"Hãy đăng nhập để thêm địa điểm. Chưa có tài khoản? Bấm Tạo tài khoản.");
$("#pSearch").addEventListener("input",renderPlaces);
$("#plF").onsubmit=async ev=>{ev.preventDefault();
  try{const prov=+$("#plProv").value,sb=document.querySelector("input[name=plSub]:checked");
    if(!prov){alert("Hãy chọn tỉnh / thành phố (1 – 34) để địa điểm được sắp xếp đúng.");$("#plProv").focus();return}
    if(PROV[prov-1][1]&&!sb){alert("Hãy tick chọn khu vực (tỉnh cũ) của địa điểm.");return}
    const o={id:editingP||"p"+Date.now(),name:$("#plN").value.trim(),note:$("#plC").value.trim(),prov,sub:sb?sb.value:"",spots:readSpots()};if(!o.name)return;
    const j=await mutate("places","upsert",o,mergeS?{merge:mergeS.id}:undefined);pl.close();$("#pSearch").value="";renderPlaces();
    toast(mergeS?"Đã cập nhật địa điểm. Người góp ý đã được thông báo.":j.pending?"Đã gửi địa điểm. Quản trị viên sẽ duyệt trước khi hiển thị.":"Đã lưu địa điểm.");mergeS=null}
  catch(e){if(e.code==="dup")plDupCheck();alert(e.message)}};

/* ===== Góp ý cho địa điểm của quản trị viên ===== */
const sg=$("#sg");let sgPlace=null;
/* Mỗi vị trí góp ý: tên, link Google, nội dung góp ý (= ghi chú vị trí khi quản trị viên đưa vào địa điểm) */
function addSgSpot(){const d=document.createElement("div");d.className="spot";
  d.innerHTML=`<div class="spot-h"><b></b><button type="button" class="pill sm danger" data-sx>Bỏ</button></div>
<label>Tên vị trí<input class="sn" maxlength="80" placeholder="Ví dụ: Bãi Sau"></label>
<label>Link Google Maps<input class="su" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…"></label>
<label>Nội dung góp ý (ghi chú vị trí)<textarea class="sc" rows="2" maxlength="300" placeholder="Ví dụ: Nên đi buổi chiều, có bãi giữ xe miễn phí…"></textarea></label>`;
  d.querySelector("[data-sx]").onclick=()=>{d.parentNode.removeChild(d);numSg()};$("#sgSpots").append(d);numSg();return d}
function numSg(){$$("#sgSpots .spot").forEach((d,i)=>d.querySelector(".spot-h b").textContent="Vị trí góp ý "+(i+1))}
$("#sgSpotAdd").onclick=()=>addSgSpot().querySelector(".sn").focus();
function openSuggest(id){requireLogin(()=>{const p=places.find(x=>x.id===id);if(!p)return;sgPlace=id;$("#sgP").textContent=p.name;$("#sgPrev").innerHTML=placeBody(p);$("#sgF").reset();$("#sgSpots").innerHTML="";addSgSpot();$("#sgE").textContent="";sg.showModal();$("#sgSpots .sn").focus()},"Hãy đăng nhập để gửi góp ý cho địa điểm.")}
$("#sgF").onsubmit=async ev=>{ev.preventDefault();const text=$("#sgT").value.trim(),spots=[];
  for(const d of $$("#sgSpots .spot")){const n=d.querySelector(".sn").value.trim(),c=d.querySelector(".sc").value.trim();let u=d.querySelector(".su").value.trim();
    if(!n&&!u&&!c)continue;if(u&&!/^https?:\/\//i.test(u))u="https://"+u;
    if(u&&!/^https?:\/\/[^\s]+\.[^\s]+$/i.test(u)){$("#sgE").textContent="Link Google không hợp lệ: "+u;return}spots.push({n,u,c})}
  if(!text&&!spots.length){$("#sgE").textContent="Hãy nhập ít nhất 1 vị trí hoặc nội dung góp ý.";return}
  try{apply(await api("store",{op:"suggest",placeId:sgPlace,text,spots}));sg.close();toast("Đã gửi góp ý. Quản trị viên sẽ xem và cập nhật vào địa điểm.")}catch(e){$("#sgE").textContent=e.message}};

/* ===== Thông báo đẩy (Web Push) ===== */
const UA=navigator.userAgent;
const isIOS=/iphone|ipad|ipod/i.test(UA)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),isAnd=/android/i.test(UA);
const standalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const canPush=()=>"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window;
let swReg=null,pushBusy=false;
const devLabel=()=>(isIOS?(/ipad/i.test(UA)||navigator.maxTouchPoints>1&&!/iphone/i.test(UA)?"iPad":"iPhone"):isAnd?"Android":/Mac/.test(UA)?"Máy Mac":/Windows/.test(UA)?"Máy tính Windows":"Máy tính")+(standalone()?" (app màn hình chính)":" (trình duyệt)");
const b64u=s=>{const p="=".repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(b,c=>c.charCodeAt(0))};
async function getSub(){try{const r=swReg||await navigator.serviceWorker.getRegistration();return r?await r.pushManager.getSubscription():null}catch{return null}}
async function relinkPush(){const s=await getSub();if(s)try{await api("push",{op:"subscribe",sub:s.toJSON(),label:devLabel()})}catch{}}
const dtVN=s=>{const d=new Date(s);return isNaN(d)?"":pad(d.getHours())+":"+pad(d.getMinutes())+" "+fmtY(d)};
async function renderPush(){const st=$("#pStat"),dv=$("#pDev"),on=$("#pOn"),te=$("#pTest"),off=$("#pOff");
  const sub=canPush()?await getSub():null,perm="Notification"in window?Notification.permission:"default",enabled=!!sub&&perm==="granted";
  let msg="",cls="";
  if(!canPush()){if(isIOS&&!standalone()){msg="Trên iPhone/iPad: hãy thêm app ra màn hình chính (nút Tạo Icon Màn Hình ở mục QR), rồi mở app từ icon để bật thông báo (cần iOS 16.4 trở lên).";cls="warn"}else{msg="Trình duyệt này chưa hỗ trợ thông báo đẩy. Hãy dùng Chrome/Edge/Safari bản mới.";cls="warn"}}
  else if(perm==="denied"){msg="Thông báo đang bị chặn trên máy này. Hãy mở Cài đặt của trình duyệt/điện thoại cho trang này và cho phép Thông báo.";cls="bad"}
  else if(enabled){msg="Máy này ĐANG BẬT thông báo";cls="ok"}
  else{msg="Máy này chưa bật thông báo";cls="off"}
  st.className="pstat "+cls;st.innerHTML=(cls==="ok"?'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m7 12.5 3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>':"")+esc(msg);
  on.disabled=pushBusy||!canPush()||perm==="denied";on.lastChild.textContent=enabled?"Bật lại / làm mới trên máy này":"Bật thông báo trên máy này";
  te.disabled=off.disabled=pushBusy||!enabled;
  if(!serverOk){dv.textContent="";return}
  try{const j=await api("push",{op:"devices",endpoint:sub?sub.endpoint:""},!!token);
    if(!j.ready){dv.textContent="Máy chủ chưa cấu hình khoá thông báo đẩy (VAPID) – xem README.";on.disabled=true;return}
    const L=j.list||[];dv.innerHTML=`Thiết bị đang nhận thông báo (${L.length})${L.length?": ":"."}`+L.map(d=>`${esc(d.label)}${d.mine?" – máy này":""} – bật ngày ${fmtY(new Date(d.at))}`).join("; ")+(L.length?".":"")+
      (j.last?` Lần gửi nhắc gần nhất: ${dtVN(j.last)}.`:"")+(j.total!=null?` <span class="note">(Toàn hệ thống: ${j.total} thiết bị)</span>`:"")+(me?"":` <span class="note">Đăng nhập để nhận cả thông báo duyệt bài.</span>`)}catch{dv.textContent=""}}
$("#pOn").onclick=async()=>{if(isIOS&&!standalone()){toast("Trên iPhone cần thêm app ra màn hình chính trước.");return openGuide()}
  pushBusy=true;renderPush();
  try{const perm=await Notification.requestPermission();if(perm!=="granted")throw new Error("Bạn chưa cho phép thông báo.");
    const k=await(await fetch("/api/push",{cache:"no-store"})).json().catch(()=>({}));if(!k.key)throw new Error("Máy chủ chưa cấu hình khoá thông báo đẩy (VAPID).");
    const r=swReg||await navigator.serviceWorker.ready;let s=await r.pushManager.getSubscription();
    if(s&&s.options&&s.options.applicationServerKey){const cur=new Uint8Array(s.options.applicationServerKey),nk=b64u(k.key);if(cur.length!==nk.length||cur.some((x,i)=>x!==nk[i])){await s.unsubscribe();s=null}}
    if(!s)s=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(k.key)});
    await api("push",{op:"subscribe",sub:s.toJSON(),label:devLabel()},!!token);toast("Đã bật thông báo trên máy này.");updateBadge()}
  catch(e){toast(e.message||"Không bật được thông báo.")}
  pushBusy=false;renderPush()};
$("#pOff").onclick=async()=>{pushBusy=true;renderPush();const s=await getSub();
  try{if(s){await api("push",{op:"unsubscribe",endpoint:s.endpoint},false).catch(()=>{});await s.unsubscribe()}toast("Đã tắt thông báo trên máy này.")}catch(e){toast(e.message)}
  try{navigator.clearAppBadge&&navigator.clearAppBadge()}catch{}pushBusy=false;renderPush()};
$("#pTest").onclick=async()=>{const s=await getSub();if(!s)return;const b=$("#pTest");b.disabled=true;
  try{const j=await api("push",{op:"test",endpoint:s.endpoint},!!token);toast("Đã gửi thông báo thử"+(j.n?` (số trên icon: ${j.n})`:"")+". Nếu chưa thấy, hãy kiểm tra chế độ Tập trung / Không làm phiền.")}catch(e){toast(e.message)}
  b.disabled=false};

/* ===== Thêm icon ra màn hình chính ===== */
let dip=null;
const inApp=/Zalo|FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|Messenger/i.test(UA);
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e;updInstall()});
addEventListener("appinstalled",()=>{dip=null;updInstall();toast("Đã thêm Lịch Sự Kiện ra màn hình chính.")});
function updInstall(){const b=$("#iconBtn"),h=$("#iconHint"),t=b.lastChild;
  if(standalone()){t.textContent="Đã cài trên máy này";h.textContent="";return}
  if(dip){t.textContent="Thêm vào màn hình chính ngay";h.textContent="";return}
  t.textContent="Tạo Icon Màn Hình";h.textContent="";}
async function install(){if(dip){const e=dip;dip=null;try{await e.prompt();const c=await e.userChoice;if(c&&c.outcome==="accepted")toast("Đang thêm icon ra màn hình chính…")}catch{}updInstall();return}openGuide()}
$("#iconBtn").onclick=()=>{if(standalone())return openGuide();install()};
const SV={share:'<svg class="ii" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  add:'<svg class="ii" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  dots:'<svg class="ii" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>',
  vdots:'<svg class="ii" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
  inst:'<svg class="ii" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7.5v6M9.5 11l2.5 2.5 2.5-2.5M8 20.5h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
function guideHtml(os){const steps=a=>'<ol class="steps">'+a.map((s,i)=>`<li><span class="sn">${i+1}</span><div>${s}</div></li>`).join("")+"</ol>";
  let warnH=inApp?`<div class="warnbox">Bạn đang mở trong ứng dụng khác (Zalo, Facebook…). Hãy bấm menu ${SV.dots} / ${SV.vdots} của ứng dụng đó và chọn <b>Mở bằng trình duyệt</b> (${isIOS?"Safari":"Chrome"}), sau đó bấm lại nút Tạo Icon Màn Hình.</div>`:"";
  if(os==="ios")return warnH+steps([`Mở trang <b>lich-su-kien.vercel.app</b> bằng <b>Safari</b> (Chrome trên iPhone cũng được).`,
    `Bấm nút <b>Chia sẻ</b> ${SV.share} ở thanh dưới cùng (iOS 26: bấm ${SV.dots} cạnh thanh địa chỉ rồi chọn <b>Chia sẻ</b> ${SV.share}).`,
    `Kéo xuống, chọn <b>Thêm vào MH chính</b> ${SV.add} (Add to Home Screen). Nếu có công tắc <b>Mở dưới dạng ứng dụng web</b>, hãy để BẬT.`,
    `Bấm <b>Thêm</b> ở góc trên bên phải. Icon <b>Lịch Sự Kiện</b> sẽ xuất hiện ngoài màn hình chính.`])+
    `<p class="note">Apple không cho trang web tự thêm icon, nên trên iPhone/iPad cần làm 4 bước trên. Sau khi thêm, mở app từ icon rồi bấm <b>Bật thông báo trên máy này</b> để nhận thông báo và số trên icon.</p>`;
  if(os==="and")return warnH+(dip?`<button class="pill filled green big" data-inst>Thêm vào màn hình chính ngay</button><p class="note">Bấm nút trên, điện thoại sẽ hỏi <b>Cài đặt</b> – bấm đồng ý là xong.</p><h3 class="sub">Hoặc làm thủ công:</h3>`:"")+
    steps([`Mở trang bằng <b>Chrome</b> (hoặc Samsung Internet, Cốc Cốc, Edge).`,
    `Bấm menu ${SV.vdots} ở góc trên bên phải (Samsung Internet: menu ☰ ở dưới).`,
    `Chọn <b>Thêm vào màn hình chính</b> ${SV.add} hoặc <b>Cài đặt ứng dụng</b> ${SV.inst}.`,
    `Bấm <b>Cài đặt</b> / <b>Thêm</b>. Icon sẽ xuất hiện ngoài màn hình chính (có thể nằm ở trang cuối).`]);
  return(dip?`<button class="pill filled green big" data-inst>Cài đặt ngay trên máy tính</button>`:"")+steps([`Mở trang bằng <b>Chrome</b> hoặc <b>Edge</b>.`,`Bấm biểu tượng <b>cài đặt ứng dụng</b> ${SV.inst} ở cuối thanh địa chỉ, hoặc mở menu ${SV.vdots} → <b>Truyền, lưu và chia sẻ</b> → <b>Cài đặt trang dưới dạng ứng dụng</b>.`,`Bấm <b>Cài đặt</b>. Safari trên Mac: menu <b>Tệp → Thêm vào Dock</b>.`])}
const ic=$("#ic");
function openGuide(os){os=os||(isIOS?"ios":isAnd?"and":"pc");
  $$("#icTabs button").forEach(b=>b.classList.toggle("on",b.dataset.os===os));
  $("#icB").innerHTML=(standalone()?'<div class="okbox">Ứng dụng đã được thêm ra màn hình và đang chạy từ icon rồi.</div>':"")+guideHtml(os);
  const bi=$("#icB [data-inst]");if(bi)bi.onclick=()=>{ic.close();install()};if(!ic.open)ic.showModal()}
$$("#icTabs button").forEach(b=>b.onclick=()=>openGuide(b.dataset.os));

$("#shBtn").onclick=async()=>{const u="https://lich-su-kien.vercel.app/",b=$("#shBtn");
  try{if(navigator.share){await navigator.share({title:"Lịch Sự Kiện",text:"Lịch sự kiện âm dương, nhắc lịch và ghi chú địa điểm",url:u});return}}catch{return}
  try{await navigator.clipboard.writeText(u);b.textContent="Đã sao chép liên kết"}catch{b.textContent=u}
  setTimeout(()=>{b.textContent="Chia sẻ liên kết"},2500)};

function renderAll(){renderToday();renderCal();renderDetail();renderMonth();renderNotes();renderPlaces();renderAllPage();renderReview();renderAcc();renderStatus();if(nt.open)renderNt()}
if(typeof document!=="undefined"&&!globalThis.__TEST__){
  derive();renderAcc();route();renderAll();resetForm();updInstall();renderVisits();sync().then(renderPush);
  setInterval(tick,1000);
  setInterval(()=>{if(!document.hidden)sync()},60000);setInterval(()=>{$("#hello").textContent=greet()},6e4);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){tick();sync()}});addEventListener("online",sync);
  setInterval(()=>{if(day0(new Date())-T0)location.reload();else renderNotes()},3600000);
  if("serviceWorker"in navigator&&location.protocol!=="file:"){
    /* Có bản mới: service worker mới tiếp quản → tự tải lại trang 1 lần để dùng giao diện mới */
    const hadCtl=!!navigator.serviceWorker.controller;let reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{if(hadCtl&&!reloaded){reloaded=true;location.reload()}});
    navigator.serviceWorker.register("/sw.js",{updateViaCache:"none"}).then(r=>{swReg=r;renderPush();r.update().catch(()=>{})}).catch(()=>{})}
}
