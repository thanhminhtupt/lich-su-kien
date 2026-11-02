/* Máy chủ lưu dữ liệu dùng chung (Vercel Function + Upstash Redis qua REST).
   Biến môi trường: ADMIN_PASSWORD, KV_REST_API_URL, KV_REST_API_TOKEN (hoặc UPSTASH_REDIS_REST_URL/TOKEN). */
const crypto=require("crypto");
const KEY="lich:data";
const URL_=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const TOKEN=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const PASS=process.env.ADMIN_PASSWORD;
const redis=async cmd=>{
  const r=await fetch(URL_,{method:"POST",headers:{Authorization:"Bearer "+TOKEN,"Content-Type":"application/json"},body:JSON.stringify(cmd)});
  if(!r.ok)throw new Error("redis "+r.status);return (await r.json()).result};
const sha=s=>crypto.createHash("sha256").update(String(s??"")).digest();
const okPass=p=>crypto.timingSafeEqual(sha(p),sha(PASS));
const str=(s,n)=>String(s??"").trim().slice(0,n);
const int=(v,a,b)=>{v=Math.trunc(+v);return v>=a&&v<=b?v:null};
function cleanEvent(e){if(!e||typeof e!=="object")return null;
  const id=str(e.id,40),name=str(e.name,80),cal=e.cal==="s"?"s":e.cal==="l"?"l":null,m=int(e.m,1,12);
  let a=int(e.a,1,31),b=int(e.b,1,31);if(!/^[\w-]+$/.test(id)||!name||!cal||!m||!a||!b)return null;if(b<a)[a,b]=[b,a];
  const repeat=!!e.repeat,year=repeat?null:int(e.year,1900,2200);if(!repeat&&!year)return null;
  return{id,name,cal,m,a,b,repeat,year,time:/^\d{2}:\d{2}$/.test(e.time||"")?e.time:"",note:str(e.note,500)}}
function cleanPlace(p){if(!p||typeof p!=="object")return null;
  const id=str(p.id,40),name=str(p.name,80),note=str(p.note,1000);
  return /^[\w-]+$/.test(id)&&name&&note?{id,name,note}:null}
async function load(){const raw=await redis(["GET",KEY]);
  try{const d=JSON.parse(raw);return{events:d.events||[],places:d.places||[],v:d.v||0}}catch{return{events:[],places:[],v:0}}}
async function store(d){d.v=Date.now();await redis(["SET",KEY,JSON.stringify(d)]);return d}
module.exports=async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(!URL_||!TOKEN||!PASS)return res.status(503).json({error:"Chưa cấu hình máy chủ lưu trữ."});
  try{
    if(req.method==="GET")return res.status(200).json(await load());
    if(req.method!=="POST")return res.status(405).json({error:"Phương thức không được hỗ trợ."});
    let b=req.body;if(typeof b==="string"){try{b=JSON.parse(b)}catch{b=null}}b=b||{};
    if(!okPass(b.password)){await new Promise(r=>setTimeout(r,500));return res.status(401).json({error:"Mật khẩu không đúng."})}
    if(b.op==="check")return res.status(200).json({ok:true});
    const d=await load();
    if(b.op==="import"){
      if(d.v)return res.status(200).json(d);
      d.events=(Array.isArray(b.events)?b.events:[]).slice(0,500).map(cleanEvent).filter(Boolean);
      d.places=(Array.isArray(b.places)?b.places:[]).slice(0,500).map(cleanPlace).filter(Boolean);
      return res.status(200).json(await store(d))}
    const k=b.kind;if(k!=="events"&&k!=="places")return res.status(400).json({error:"Yêu cầu không hợp lệ."});
    if(b.op==="delete")d[k]=d[k].filter(i=>i.id!==String(b.id));
    else if(b.op==="upsert"){
      const it=(k==="events"?cleanEvent:cleanPlace)(b.item);if(!it)return res.status(400).json({error:"Dữ liệu không hợp lệ."});
      const i=d[k].findIndex(x=>x.id===it.id);
      if(i>=0)d[k][i]=it;else{if(d[k].length>=500)return res.status(400).json({error:"Đã đạt giới hạn 500 mục."});d[k].push(it)}}
    else return res.status(400).json({error:"Yêu cầu không hợp lệ."});
    return res.status(200).json(await store(d));
  }catch{return res.status(500).json({error:"Lỗi máy chủ lưu trữ."})}
};
