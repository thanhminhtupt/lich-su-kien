/* Thư viện dùng chung cho các Vercel Function (file bắt đầu bằng "_" không thành API riêng).
   Biến môi trường: KV_REST_API_URL, KV_REST_API_TOKEN (hoặc UPSTASH_REDIS_REST_URL/TOKEN), ADMIN_PASSWORD, ADMIN_EMAIL (tuỳ chọn). */
const crypto=require("crypto");
const URL_=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const TOKEN=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
/* Chế độ thử trên máy (npm run dev): dữ liệu giữ trong bộ nhớ, tắt máy là mất */
const MEM=!(URL_&&TOKEN)&&process.env.LICH_DEV_MEMORY==="1";
const SESSION_SEC=20*60; /* Phiên làm việc 20 phút */
const configured=()=>!!(MEM||(URL_&&TOKEN&&process.env.ADMIN_PASSWORD));

/* ===== Redis (Upstash REST) ===== */
const mem=globalThis.__lichMem||(globalThis.__lichMem={kv:new Map(),exp:new Map()});
function memCmd(c){const C=c[0].toUpperCase(),a=c.slice(1),now=Date.now();
  const alive=k=>{const e=mem.exp.get(k);if(e&&e<=now){mem.kv.delete(k);mem.exp.delete(k)}return mem.kv.has(k)};
  const hash=k=>{if(!alive(k))mem.kv.set(k,new Map());return mem.kv.get(k)};
  switch(C){
    case"GET":return alive(a[0])?mem.kv.get(a[0]):null;
    case"MGET":return a.map(k=>alive(k)?mem.kv.get(k):null);
    case"SET":mem.kv.set(a[0],a[1]);mem.exp.delete(a[0]);if((a[2]||"").toUpperCase()==="EX")mem.exp.set(a[0],now+a[3]*1000);return"OK";
    case"DEL":{let n=0;for(const k of a){if(alive(k))n++;mem.kv.delete(k);mem.exp.delete(k)}return n}
    case"INCR":{const v=(alive(a[0])?+mem.kv.get(a[0]):0)+1;mem.kv.set(a[0],String(v));return v}
    case"EXPIRE":if(!alive(a[0]))return 0;mem.exp.set(a[0],now+a[1]*1000);return 1;
    case"HSET":{const h=hash(a[0]);for(let i=1;i<a.length;i+=2)h.set(a[i],a[i+1]);return 1}
    case"HGET":return alive(a[0])?mem.kv.get(a[0]).get(a[1])??null:null;
    case"HDEL":{if(!alive(a[0]))return 0;let n=0;for(const f of a.slice(1))n+=mem.kv.get(a[0]).delete(f)?1:0;return n}
    case"HGETALL":return alive(a[0])?[...mem.kv.get(a[0])].flat():[];
    default:throw new Error("mem: lệnh chưa hỗ trợ "+C)}}
async function redis(cmd){
  cmd=cmd.map(String);if(MEM)return memCmd(cmd);
  const r=await fetch(URL_,{method:"POST",headers:{Authorization:"Bearer "+TOKEN,"Content-Type":"application/json"},body:JSON.stringify(cmd)});
  if(!r.ok){let m="";try{m=await r.text()}catch{}const e=new Error("redis "+r.status+" "+m);e.status=r.status;throw e}
  return(await r.json()).result}
const hgetall=async k=>{const a=await redis(["HGETALL",k])||[],o={};for(let i=0;i<a.length;i+=2)o[a[i]]=a[i+1];return o};
const jget=async(k,d)=>{try{const v=await redis(["GET",k]);return v==null?d:JSON.parse(v)}catch{return d}};

/* ===== Tiện ích ===== */
const sha=s=>crypto.createHash("sha256").update(String(s??"")).digest();
const shaHex=s=>sha(s).toString("hex");
const eq=(a,b)=>crypto.timingSafeEqual(sha(a),sha(b));
const str=(s,n)=>String(s??"").trim().slice(0,n);
const int=(v,a,b)=>{v=Math.trunc(+v);return v>=a&&v<=b?v:null};
const nameKey=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/\s+/g," ").trim();
const rid=p=>p+Date.now().toString(36)+crypto.randomBytes(3).toString("hex");
function body(req){let b=req.body;if(typeof b==="string"){try{b=JSON.parse(b)}catch{b=null}}return b&&typeof b==="object"?b:{}}
const ipOf=req=>String(req.headers["x-forwarded-for"]||req.socket&&req.socket.remoteAddress||"?").split(",")[0].trim();
class HttpError extends Error{constructor(status,msg,code){super(msg);this.status=status;this.code=code}}
const fail=(s,m,c)=>{throw new HttpError(s,m,c)};
/* Giới hạn số lần thử (đăng nhập sai, đăng ký, quên mật khẩu) */
async function limit(key,max,sec,msg){const k="lich:rl:"+key,n=+(await redis(["GET",k]))||0;if(n>=max)fail(429,msg||"Bạn thao tác quá nhiều lần. Hãy thử lại sau.");return async()=>{const v=await redis(["INCR",k]);if(v===1)await redis(["EXPIRE",k,sec])}}
function handle(fn){return async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(!configured())return res.status(503).json({error:"Chưa cấu hình máy chủ lưu trữ."});
  try{return await fn(req,res)}catch(e){
    if(e instanceof HttpError)return res.status(e.status).json({error:e.message,code:e.code});
    const m=String(e&&e.message||"");console.error(e);
    if(e&&(e.status===401||e.status===403))return res.status(502).json({error:"Khoá kết nối Upstash không hợp lệ hoặc đã hết hạn. Hãy kiểm tra biến môi trường trên Vercel."});
    if(/limit|quota|exceed/i.test(m))return res.status(429).json({error:"Upstash đã chạm hạn mức gói miễn phí (số lệnh hoặc dung lượng). Hãy kiểm tra gói trên Upstash/Vercel."});
    return res.status(500).json({error:"Lỗi máy chủ lưu trữ (Upstash/Vercel)."})}}}

/* ===== Tài khoản ===== */
const UKEY="lich:users";
const hashPw=(pw,salt)=>crypto.scryptSync(String(pw),salt,64).toString("hex");
const pwOk=(u,pw)=>u.pwEnv?eq(pw,process.env.ADMIN_PASSWORD||(MEM?"admin123":"")):crypto.timingSafeEqual(Buffer.from(hashPw(pw,u.salt),"hex"),Buffer.from(u.hash,"hex"));
function setPw(u,pw){u.salt=crypto.randomBytes(16).toString("hex");u.hash=hashPw(pw,u.salt);delete u.pwEnv;return u}
async function getUser(uid){if(!uid)return null;const v=await redis(["HGET",UKEY,uid]);if(v)try{return JSON.parse(v)}catch{}
  /* Tài khoản quản trị "admin" tự tạo lần đầu, mật khẩu = ADMIN_PASSWORD cho tới khi đổi */
  if(uid==="admin")return{uid:"admin",name:"Quản trị viên",email:str(process.env.ADMIN_EMAIL||"ducanhitpt@gmail.com",120).toLowerCase(),role:"admin",pwEnv:true,at:Date.now()};
  return null}
const saveUser=u=>redis(["HSET",UKEY,u.uid,JSON.stringify(u)]);
async function allUsers(){const o=await hgetall(UKEY),L=[];for(const k in o)try{L.push(JSON.parse(o[k]))}catch{}
  if(!L.some(u=>u.uid==="admin"))L.push(await getUser("admin"));return L}
async function adminIds(){return(await allUsers()).filter(u=>u.role==="admin").map(u=>u.uid)}
const pub=u=>u&&{uid:u.uid,name:u.name,email:u.email,role:u.role};

/* ===== Phiên làm việc (token ngẫu nhiên, hết hạn sau 20 phút không hoạt động) ===== */
const skey=t=>"lich:s:"+shaHex(t);
async function newSession(uid){const t=crypto.randomBytes(32).toString("base64url");await redis(["SET",skey(t),uid,"EX",SESSION_SEC]);return t}
const tokenOf=req=>{const h=String(req.headers.authorization||"");return h.startsWith("Bearer ")?h.slice(7).trim():""};
async function session(req,refresh=true){const t=tokenOf(req);if(!t||t.length>100)return null;
  const uid=await redis(["GET",skey(t)]);if(!uid)return null;const u=await getUser(uid);if(!u)return null;
  if(refresh)await redis(["EXPIRE",skey(t),SESSION_SEC]);return u}
async function needUser(req){const u=await session(req);if(!u)fail(401,tokenOf(req)?"Phiên làm việc đã hết hạn (20 phút). Hãy đăng nhập lại.":"Bạn cần đăng nhập để làm việc này.","session");return u}
async function needAdmin(req){const u=await needUser(req);if(u.role!=="admin")fail(403,"Chỉ quản trị viên mới làm được việc này.");return u}

/* ===== Dữ liệu dùng chung ===== */
const DKEY="lich:data";
async function loadData(){let d;try{d=JSON.parse(await redis(["GET",DKEY]))}catch{}d=d&&typeof d==="object"?d:{};
  return{events:d.events||[],places:d.places||[],suggestions:d.suggestions||[],v:d.v||0}}
async function saveData(d){d.v=Date.now();await redis(["SET",DKEY,JSON.stringify({events:d.events,places:d.places,suggestions:d.suggestions,v:d.v})]);return d}

/* ===== Thông báo trong app (mỗi người tối đa 50 thông báo) + gửi thông báo đẩy ===== */
const nkey=uid=>"lich:nt:"+uid;
const getNotifs=uid=>jget(nkey(uid),[]);
const unread=async uid=>uid?(await getNotifs(uid)).filter(n=>!n.r).length:0;
async function notify(uids,text,link,data){
  uids=[...new Set(uids.filter(Boolean))];if(!uids.length)return;
  for(const uid of uids){const L=await getNotifs(uid);L.unshift({id:rid("n"),at:Date.now(),t:str(text,300),u:str(link||"",80),r:0});
    await redis(["SET",nkey(uid),JSON.stringify(L.slice(0,50))])}
  try{const push=require("./_push.js");const d=data||await loadData();
    for(const uid of uids)await push.sendToUser(uid,{title:"Lịch Sự Kiện",body:text,url:"/"+(link||""),tag:"nt-"+Date.now()},d)}catch(e){console.error("push",e)}}

module.exports={redis,hgetall,jget,MEM,SESSION_SEC,configured,sha,shaHex,eq,str,int,nameKey,rid,body,ipOf,HttpError,fail,limit,handle,
  getUser,saveUser,allUsers,adminIds,pub,hashPw,pwOk,setPw,newSession,session,needUser,needAdmin,skey,tokenOf,loadData,saveData,getNotifs,unread,notify,nkey};
