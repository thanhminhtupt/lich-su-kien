/* Thông báo đẩy (Web Push, chuẩn VAPID). Biến môi trường: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:email-cua-ban). */
const L=require("./_lib.js");
const{upcoming}=require("./_events.js");
const PKEY="lich:push";
let wp;
function lib(){if(wp!==undefined)return wp;
  const pubK=process.env.VAPID_PUBLIC_KEY,priv=process.env.VAPID_PRIVATE_KEY;
  try{if(!pubK||!priv)throw 0;wp=require("web-push");wp.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:admin@lich-su-kien.vercel.app",pubK,priv)}catch{wp=null}
  return wp}
const ready=()=>!!lib();
const subId=endpoint=>L.shaHex(endpoint).slice(0,32);
async function allSubs(){const o=await L.hgetall(PKEY),out=[];for(const k in o)try{out.push({id:k,...JSON.parse(o[k])})}catch{}return out}
const getSub=async id=>{const v=await L.redis(["HGET",PKEY,id]);try{return v?{id,...JSON.parse(v)}:null}catch{return null}};
const saveSub=r=>{const{id,...x}=r;return L.redis(["HSET",PKEY,id,JSON.stringify(x)])};
const delSub=id=>L.redis(["HDEL",PKEY,id]);
/* Số trên icon app = số ở chuông: sự kiện trong 7 ngày tới + thông báo chưa đọc */
async function badge(uid,data){return upcoming(data.events).length+await L.unread(uid)}
async function send(rec,payload){const w=lib();if(!w)return{ok:false,error:"Máy chủ chưa cấu hình khoá VAPID."};
  try{await w.sendNotification(rec.sub,JSON.stringify(payload),{TTL:86400,urgency:"high"});return{ok:true}}
  catch(e){const s=e&&e.statusCode;if(s===404||s===410){await delSub(rec.id);return{ok:false,gone:true,error:"Thiết bị đã huỷ đăng ký thông báo."}}
    return{ok:false,error:"Gửi thông báo lỗi"+(s?" (mã "+s+")":"")+"."}}}
async function sendToUser(uid,payload,data){if(!ready())return;const subs=(await allSubs()).filter(s=>s.uid===uid);if(!subs.length)return;
  const n=await badge(uid,data||await L.loadData());for(const s of subs)await send(s,{...payload,n})}
module.exports={ready,lib,subId,allSubs,getSub,saveSub,delSub,badge,send,sendToUser,PKEY};
