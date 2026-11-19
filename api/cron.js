/* Chạy mỗi sáng lúc 0h UTC (7h sáng giờ Việt Nam, Vercel Cron gói miễn phí chạy trong khoảng 7:00 – 8:00).
   Nếu có sự kiện trong 7 ngày tới hoặc thông báo chưa đọc: gửi 1 thông báo và đặt số trên icon app bằng đúng số ở chuông.
   Đặt biến CRON_SECRET trên Vercel để chỉ Vercel Cron gọi được. */
const L=require("./_lib.js");
const P=require("./_push.js");
const{upcoming}=require("./_events.js");
module.exports=L.handle(async(req,res)=>{
  const sec=process.env.CRON_SECRET;
  if(sec&&!L.eq(req.headers.authorization||"","Bearer "+sec))L.fail(401,"Không có quyền.");
  if(!sec&&!L.MEM)L.fail(503,"Hãy đặt biến CRON_SECRET trên Vercel.");
  if(!P.ready())return res.status(200).json({ok:false,error:"Chưa cấu hình VAPID."});
  const d=await L.loadData(),up=upcoming(d.events),subs=await P.allSubs(),cache={};
  const evTxt=up.slice(0,4).map(x=>`${x.e.name} (${x.run?"đang diễn ra":x.dd===1?"ngày mai":"còn "+x.dd+" ngày"})`).join(" · ")+(up.length>4?` và ${up.length-4} sự kiện khác`:"");
  let sent=0,gone=0;
  for(const s of subs){const un=s.uid?(cache[s.uid]??=await L.unread(s.uid)):0,n=up.length+un;if(!n)continue;
    const body=[up.length?`${up.length} sự kiện trong 7 ngày tới: ${evTxt}.`:"",un?`Bạn có ${un} thông báo chưa đọc.`:""].filter(Boolean).join(" ");
    const r=await P.send(s,{title:"Lịch Sự Kiện – nhắc lịch hôm nay",body,n,url:"/",tag:"daily"});if(r.ok)sent++;else if(r.gone)gone++}
  await L.redis(["SET","lich:push:last",new Date().toISOString()]);
  return res.status(200).json({ok:true,devices:subs.length,sent,removed:gone})});
