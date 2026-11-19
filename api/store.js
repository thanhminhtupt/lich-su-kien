/* Dữ liệu dùng chung: sự kiện, địa điểm, góp ý; duyệt bài; đếm lượt truy cập.
   Quản trị viên thêm/sửa trực tiếp. Thành viên gửi lịch/địa điểm → chờ duyệt, gửi góp ý cho địa điểm đã có. */
const L=require("./_lib.js");
const{expired}=require("./_events.js");
const{str,int,nameKey,fail}=L;

function cleanSpots(a,withNote){return(Array.isArray(a)?a:[]).slice(0,20).map(x=>{if(!x||typeof x!=="object")return null;
  const n=str(x.n,80),c=withNote?str(x.c,300):"";let u=str(x.u,500);if(u&&!/^https?:\/\/[^\s]+$/i.test(u))u="";
  return n||u||c?(withNote?{n,u,c}:{n,u}):null}).filter(Boolean)}
function cleanEvent(e){if(!e||typeof e!=="object")return null;
  const id=str(e.id,40),name=str(e.name,80),cal=e.cal==="s"?"s":e.cal==="l"?"l":null,m=int(e.m,1,12);let m2=int(e.m2,1,12)||m;
  let a=int(e.a,1,31),b=int(e.b,1,31);if(!/^[\w-]+$/.test(id)||!name||!cal||!m||!a||!b)return null;
  if(m2===m&&b<a)[a,b]=[b,a];
  const repeat=!!e.repeat,every=repeat&&+e.every===2?2:1,year=repeat&&every===1?null:int(e.year,1900,2200);if(!repeat&&!year)return null;if(every===2&&!year)return null;
  return{id,name,cal,m,a,m2,b,repeat,every,year,spots:cleanSpots(e.spots,false),time:/^\d{2}:\d{2}$/.test(e.time||"")?e.time:"",note:str(e.note,500)}}
function cleanPlace(p){if(!p||typeof p!=="object")return null;
  const id=str(p.id,40),name=str(p.name,80),note=str(p.note,1000);
  const prov=int(p.prov,1,34)||0,sub=prov?str(p.sub,40):"";
  return /^[\w-]+$/.test(id)&&name?{id,name,note,prov,sub,spots:cleanSpots(p.spots,true)}:null}
const KIND={events:"lịch",places:"địa điểm"};

/* ===== Đếm lượt truy cập (giờ Việt Nam): hôm nay, tuần này (thứ 2 → CN), tháng này, toàn thời gian ===== */
function vkeys(){const t=new Date(Date.now()+7*36e5),y=t.getUTCFullYear(),m=t.getUTCMonth(),d=t.getUTCDate(),p=n=>String(n).padStart(2,"0");
  const mon=new Date(Date.UTC(y,m,d-((t.getUTCDay()+6)%7)));
  return{d:`lich:vis:d:${y}${p(m+1)}${p(d)}`,w:`lich:vis:w:${mon.getUTCFullYear()}${p(mon.getUTCMonth()+1)}${p(mon.getUTCDate())}`,m:`lich:vis:m:${y}${p(m+1)}`,all:"lich:vis:all"}}
async function stats(){const k=vkeys(),r=await L.redis(["MGET",k.d,k.w,k.m,k.all]);return{d:+r[0]||0,w:+r[1]||0,m:+r[2]||0,all:+r[3]||0}}

/* Dữ liệu trả về tuỳ người xem: khách thấy mục đã duyệt; thành viên thấy thêm mục mình gửi; quản trị viên thấy tất cả */
function view(d,u){const admin=u&&u.role==="admin",uid=u&&u.uid;
  const vis=x=>x.status!=="pending"||admin||x.by===uid;
  const out=x=>{const{by,byName,delReq,...r}=x;r.mine=!!uid&&by===uid;if(admin&&by){r.by=by;r.byName=byName}if(delReq&&(admin||r.mine))r.delReq=delReq;return r};
  return{events:d.events.filter(vis).map(out),places:d.places.filter(vis).map(out),
    suggestions:d.suggestions.filter(s=>admin||s.by===uid).map(out),v:d.v}}

module.exports=L.handle(async(req,res)=>{
  if(req.method==="GET"){
    const u=await L.session(req,false);let d=await L.loadData();
    const keep=d.events.filter(e=>!expired(e));if(keep.length!==d.events.length){d.events=keep;d=await L.saveData(d)}
    const size=Buffer.byteLength(JSON.stringify(d));
    return res.status(200).json({...view(d,u),size,stats:await stats(),me:L.pub(u),nt:u?await L.getNotifs(u.uid):undefined})}
  if(req.method!=="POST")fail(405,"Phương thức không được hỗ trợ.");
  const b=L.body(req);
  if(b.op==="visit"){const k=vkeys(),ttl={d:2*86400,w:15*86400,m:400*86400};
    for(const x of["d","w","m","all"]){const n=await L.redis(["INCR",k[x]]);if(n===1&&ttl[x])await L.redis(["EXPIRE",k[x],ttl[x]])}
    return res.status(200).json({stats:await stats()})}
  const u=await L.needUser(req),admin=u.role==="admin";
  const d=await L.loadData();
  const done=async()=>{await L.saveData(d);res.status(200).json({...view(d,u),ok:true})};
  const k=b.kind;
  const list=()=>{if(k!=="events"&&k!=="places")fail(400,"Yêu cầu không hợp lệ.");return d[k]};
  const find=id=>{const x=list().find(i=>i.id===String(id));if(!x)fail(404,"Không tìm thấy mục này (có thể đã bị xoá).");return x};
  const dup=it=>{const o=list().find(x=>x.id!==it.id&&nameKey(x.name)===nameKey(it.name));
    if(o)fail(409,(k==="events"?"Tên sự kiện":"Tên địa điểm")+` "${o.name}" đã có`+(o.status==="pending"?" (đang chờ duyệt)":"")+". Hãy dùng tên khác"+(k==="places"&&o.status!=="pending"?" hoặc gửi góp ý vào địa điểm đã có.":"."),"dup")};

  switch(b.op){
    case"import":{if(!admin)fail(403,"Chỉ quản trị viên mới làm được việc này.");if(d.v)return res.status(200).json(view(d,u));
      d.events=(Array.isArray(b.events)?b.events:[]).slice(0,500).map(cleanEvent).filter(Boolean);
      d.places=(Array.isArray(b.places)?b.places:[]).slice(0,500).map(cleanPlace).filter(Boolean);return done()}
    case"upsert":{const it=(k==="events"?cleanEvent:cleanPlace)(b.item);list();if(!it)fail(400,"Dữ liệu không hợp lệ.");dup(it);
      const i=d[k].findIndex(x=>x.id===it.id),old=i>=0?d[k][i]:null;
      /* Thành viên chỉ sửa được mục do chính mình tạo; mục của quản trị viên / người khác thì gửi góp ý */
      if(old){if(!admin&&old.by!==u.uid)fail(403,"Bạn chỉ sửa được "+KIND[k]+" do chính bạn tạo."+(k==="places"?" Với địa điểm của người khác, hãy gửi góp ý.":""));
        d[k][i]={...it,status:old.status,by:old.by,byName:old.byName,at:old.at,...(old.delReq?{delReq:old.delReq}:{})};
        if(!admin&&old.status!=="pending"){await L.saveData(d);await L.notify(await L.adminIds(),`${u.name} vừa sửa ${KIND[k]} "${it.name}" (do bạn ấy tạo).`,"",d);return res.status(200).json({...view(d,u),ok:true})}}
      else{if(d[k].length>=500)fail(400,"Đã đạt giới hạn 500 mục.");
        d[k].push({...it,status:admin?"approved":"pending",by:u.uid,byName:u.name,at:Date.now()})}
      /* Quản trị viên đưa góp ý vào địa điểm */
      if(admin&&k==="places"&&b.merge){const s=d.suggestions.find(x=>x.id===String(b.merge));
        if(s){d.suggestions=d.suggestions.filter(x=>x!==s);await L.saveData(d);await L.notify([s.by],`Góp ý của bạn cho địa điểm "${it.name}" đã được cập nhật vào địa điểm. Cảm ơn bạn!`,"",d);return res.status(200).json({...view(d,u),ok:true})}}
      if(!old&&!admin){await L.saveData(d);await L.notify(await L.adminIds(),`${u.name} vừa gửi 1 ${KIND[k]} cần duyệt: "${it.name}".`,"#duyet",d);
        await L.notify([u.uid],`Đã gửi ${KIND[k]} "${it.name}". Quản trị viên sẽ duyệt trước khi hiển thị.`,"#duyet",d);
        return res.status(200).json({...view(d,u),ok:true,pending:true})}
      return done()}
    /* Chỉ quản trị viên được xoá. Thành viên gửi yêu cầu xoá (chỉ với mục mình tạo) */
    case"delete":{if(!admin)fail(403,"Thành viên không xoá được. Hãy bấm Yêu cầu xoá để quản trị viên xoá giúp.");const x=find(b.id);
      d[k]=d[k].filter(i=>i!==x);if(k==="places")d.suggestions=d.suggestions.filter(s=>s.placeId!==x.id);await L.saveData(d);
      if(x.delReq&&x.by&&x.by!==u.uid)await L.notify([x.by],`Quản trị viên đã xoá ${KIND[k]} "${x.name}" theo yêu cầu của bạn.`,"",d);
      return res.status(200).json({...view(d,u),ok:true})}
    case"reqDelete":{const x=find(b.id);if(x.by!==u.uid)fail(403,"Bạn chỉ yêu cầu xoá được "+KIND[k]+" do chính bạn tạo.");
      if(x.delReq)fail(400,"Bạn đã gửi yêu cầu xoá mục này rồi, hãy chờ quản trị viên.");
      x.delReq={at:Date.now(),reason:str(b.reason,200)};await L.saveData(d);
      await L.notify(await L.adminIds(),`${u.name} yêu cầu xoá ${KIND[k]} "${x.name}"${x.delReq.reason?": "+x.delReq.reason:"."}`,"#duyet",d);
      await L.notify([u.uid],`Đã gửi yêu cầu xoá ${KIND[k]} "${x.name}". Quản trị viên sẽ xem và xoá.`,"#duyet",d);
      return res.status(200).json({...view(d,u),ok:true})}
    case"keep":{if(!admin)fail(403,"Chỉ quản trị viên mới làm được việc này.");const x=find(b.id);if(!x.delReq)fail(400,"Mục này không có yêu cầu xoá.");
      delete x.delReq;await L.saveData(d);const why=str(b.reason,200);
      if(x.by&&x.by!==u.uid)await L.notify([x.by],`Quản trị viên giữ lại ${KIND[k]} "${x.name}", chưa xoá${why?": "+why:"."}`,"",d);
      return res.status(200).json({...view(d,u),ok:true})}
    case"approve":case"reject":{if(!admin)fail(403,"Chỉ quản trị viên mới duyệt được.");const x=find(b.id);
      if(x.status!=="pending")fail(400,"Mục này đã được duyệt rồi.");
      if(b.op==="approve"){x.status="approved";x.okAt=Date.now()}else d[k]=d[k].filter(i=>i!==x);
      await L.saveData(d);
      const why=str(b.reason,200);
      if(x.by&&x.by!==u.uid)await L.notify([x.by],b.op==="approve"?`${KIND[k][0].toUpperCase()+KIND[k].slice(1)} "${x.name}" của bạn đã được duyệt và hiển thị trên app.`:`${KIND[k][0].toUpperCase()+KIND[k].slice(1)} "${x.name}" của bạn chưa được duyệt${why?": "+why:"."}`,"",d);
      return res.status(200).json({...view(d,u),ok:true})}
    case"suggest":{const p=d.places.find(x=>x.id===String(b.placeId)&&x.status!=="pending");if(!p)fail(404,"Không tìm thấy địa điểm.");if(!admin&&p.by===u.uid)fail(400,"Đây là địa điểm bạn tạo, bạn có thể bấm Sửa trực tiếp.");
      const text=str(b.text,1000),spots=cleanSpots(b.spots,true).slice(0,10);if(!text&&!spots.length)fail(400,"Hãy nhập nội dung góp ý.");
      if(d.suggestions.filter(s=>s.by===u.uid).length>=30)fail(400,"Bạn đang có quá nhiều góp ý chờ xem.");
      d.suggestions.push({id:L.rid("g"),placeId:p.id,text,spots,by:u.uid,byName:u.name,at:Date.now()});
      await L.saveData(d);
      if(!admin)await L.notify(await L.adminIds(),`${u.name} góp ý cho địa điểm "${p.name}". Hãy xem và cập nhật.`,"#duyet",d);
      return res.status(200).json({...view(d,u),ok:true})}
    case"dismiss":{const s=d.suggestions.find(x=>x.id===String(b.id));if(!s)fail(404,"Không tìm thấy góp ý.");
      if(!admin)fail(403,"Chỉ quản trị viên mới xử lý được góp ý.");
      d.suggestions=d.suggestions.filter(x=>x!==s);await L.saveData(d);
      if(admin&&s.by!==u.uid){const p=d.places.find(x=>x.id===s.placeId);await L.notify([s.by],`Quản trị viên đã xem góp ý của bạn cho địa điểm "${p?p.name:""}".`,"",d)}
      return res.status(200).json({...view(d,u),ok:true})}
    default:fail(400,"Yêu cầu không hợp lệ.")}
});
module.exports.cleanEvent=cleanEvent;module.exports.cleanPlace=cleanPlace;
