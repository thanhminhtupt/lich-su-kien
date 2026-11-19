/* Đăng ký / huỷ / gửi thử thông báo đẩy và danh sách thiết bị đang nhận thông báo. */
const L=require("./_lib.js");
const P=require("./_push.js");
const{str,fail}=L;
const cleanSub=s=>{if(!s||typeof s!=="object")return null;const ep=str(s.endpoint,800),k=s.keys||{};
  if(!/^https:\/\//.test(ep)||!k.p256dh||!k.auth)return null;return{endpoint:ep,keys:{p256dh:str(k.p256dh,200),auth:str(k.auth,100)}}};
const dev=(r,me)=>({label:r.label,at:r.at,mine:r.id===me});

module.exports=L.handle(async(req,res)=>{
  if(req.method==="GET")return res.status(200).json({key:process.env.VAPID_PUBLIC_KEY||"",ready:P.ready()});
  if(req.method!=="POST")fail(405,"Phương thức không được hỗ trợ.");
  const b=L.body(req),u=await L.session(req);
  switch(b.op){
    case"subscribe":{if(!P.ready())fail(503,"Máy chủ chưa cấu hình khoá thông báo đẩy (VAPID).");
      const sub=cleanSub(b.sub);if(!sub)fail(400,"Đăng ký thông báo không hợp lệ.");
      const id=P.subId(sub.endpoint),old=await P.getSub(id);
      if(!old){const n=(await P.allSubs()).length;if(n>=2000)fail(400,"Đã đạt giới hạn số thiết bị nhận thông báo.")}
      await P.saveSub({id,sub,uid:u?u.uid:null,label:str(b.label,60)||"Thiết bị",at:old?old.at:Date.now()});
      return res.status(200).json({ok:true,id})}
    case"unsubscribe":{const id=P.subId(str(b.endpoint,800));await P.delSub(id);return res.status(200).json({ok:true})}
    case"test":{const id=P.subId(str(b.endpoint,800)),rec=await P.getSub(id);if(!rec)fail(404,"Máy này chưa bật thông báo.");
      const d=await L.loadData(),n=await P.badge(rec.uid,d);
      const r=await P.send(rec,{title:"Lịch Sự Kiện",body:"Đây là thông báo thử. Thông báo trên máy này đang hoạt động tốt"+(n?` · số trên icon: ${n}`:"")+".",n,url:"/",tag:"test"});
      if(!r.ok)fail(502,r.error);return res.status(200).json({ok:true,n})}
    case"devices":{const me=b.endpoint?P.subId(str(b.endpoint,800)):"",all=await P.allSubs();
      const L2=u?all.filter(s=>s.uid===u.uid||s.id===me):all.filter(s=>s.id===me);
      return res.status(200).json({ok:true,ready:P.ready(),list:L2.map(s=>dev(s,me)),total:u&&u.role==="admin"?all.length:undefined,last:await L.redis(["GET","lich:push:last"])})}
    default:fail(400,"Yêu cầu không hợp lệ.")}
});
