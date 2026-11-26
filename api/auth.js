/* Tài khoản: đăng ký, đăng nhập, đăng xuất, đổi mật khẩu, quên mật khẩu (gửi email), thông báo trong app. */
const crypto=require("crypto");
const L=require("./_lib.js");
const mail=require("./_mail.js");
const{str,fail}=L;
const EMAIL=/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const pwRule=p=>{if(String(p||"").length<6)fail(400,"Mật khẩu cần ít nhất 6 ký tự.");if(String(p).length>100)fail(400,"Mật khẩu quá dài.")};
async function findLogin(id){id=str(id,120).toLowerCase();if(!id)return null;
  let u=await L.getUser(id);if(u)return u;
  /* Quản trị viên có thể đăng nhập bằng email ADMIN_EMAIL */
  const a=await L.getUser("admin");return a&&a.email&&a.email===id?a:null}
/* Cookie dự phòng (HttpOnly, 6 tháng): nếu trình duyệt xoá bộ nhớ của trang (Safari xoá sau 7 ngày không mở),
   app vẫn tự đăng nhập lại được bằng op "resume". Cookie chỉ dùng cho resume, không dùng để xác thực thao tác khác. */
const CK="lich_s";
const setCk=(res,t,age)=>res.setHeader("Set-Cookie",`${CK}=${t||""}; Path=/api; Max-Age=${age}; HttpOnly; Secure; SameSite=Lax`);
const ckOf=req=>{const m=String(req.headers.cookie||"").match(/(?:^|;\s*)lich_s=([\w-]{20,100})/);return m?m[1]:""};
const siteUrl=req=>(process.env.APP_URL||`https://${req.headers["x-forwarded-host"]||req.headers.host}`).replace(/\/+$/,"");

module.exports=L.handle(async(req,res)=>{
  if(req.method!=="POST")fail(405,"Phương thức không được hỗ trợ.");
  const b=L.body(req),ip=L.ipOf(req),ok=x=>{if(x&&x.token)setCk(res,x.token,L.SESSION_SEC);return res.status(200).json({ok:true,...x})};
  switch(b.op){
    case"signup":{const name=str(b.name,60),email=str(b.email,120).toLowerCase();
      if(!name)fail(400,"Hãy nhập tên hiển thị.");if(!EMAIL.test(email))fail(400,"Email không hợp lệ.");pwRule(b.password);
      const hit=await L.limit("su:"+ip,5,3600,"Đăng ký quá nhiều lần. Hãy thử lại sau 1 giờ.");
      if(await findLogin(email))fail(409,"Email này đã có tài khoản. Hãy đăng nhập hoặc dùng Quên mật khẩu.");
      const u=L.setPw({uid:email,name,email,role:"member",at:Date.now()},b.password);await L.saveUser(u);await hit();
      await L.notify(await L.adminIds(),`Thành viên mới đăng ký: ${name}.`,"");
      return ok({token:await L.newSession(u.uid),me:L.pub(u)})}
    case"login":{const id=str(b.id,120).toLowerCase();
      const hitId=await L.limit("li:"+L.shaHex(id).slice(0,20),8,600,"Nhập sai quá nhiều lần. Hãy thử lại sau 10 phút."),hitIp=await L.limit("lip:"+ip,30,600,"Nhập sai quá nhiều lần. Hãy thử lại sau 10 phút.");
      const u=await findLogin(id);
      if(!u||!L.pwOk(u,b.password)){await hitId();await hitIp();await new Promise(r=>setTimeout(r,400));fail(401,"Email/tên đăng nhập hoặc mật khẩu không đúng.")}
      return ok({token:await L.newSession(u.uid),me:L.pub(u)})}
    case"logout":{const t=L.tokenOf(req)||ckOf(req);if(t)await L.redis(["DEL",L.skey(t)]);setCk(res,"",0);return ok()}
    case"resume":{const t=ckOf(req);if(!t)return ok({});const uid=await L.redis(["GET",L.skey(t)]);const u=uid&&await L.getUser(uid);
      if(!u){setCk(res,"",0);return ok({})}await L.redis(["EXPIRE",L.skey(t),L.SESSION_SEC]);return ok({token:t,me:L.pub(u)})}
    case"me":{const u=await L.needUser(req);setCk(res,L.tokenOf(req),L.SESSION_SEC);return ok({me:L.pub(u),ttl:L.SESSION_SEC,unread:await L.unread(u.uid)})}
    case"changePassword":{const u=await L.needUser(req);
      const hit=await L.limit("cp:"+u.uid,8,600,"Nhập sai quá nhiều lần. Hãy thử lại sau 10 phút.");
      if(!L.pwOk(u,b.old)){await hit();fail(400,"Mật khẩu hiện tại không đúng.")}pwRule(b.password);
      await L.saveUser(L.setPw(u,b.password));return ok()}
    case"profile":{const u=await L.needUser(req),name=str(b.name,60);if(!name)fail(400,"Hãy nhập tên hiển thị.");
      u.name=name;if(u.uid==="admin"&&b.email!==undefined){const e=str(b.email,120).toLowerCase();if(e&&!EMAIL.test(e))fail(400,"Email không hợp lệ.");u.email=e}
      await L.saveUser(u);return ok({me:L.pub(u)})}
    case"forgot":{const email=str(b.email,120).toLowerCase();if(!EMAIL.test(email))fail(400,"Email không hợp lệ.");
      const hit=await L.limit("fg:"+ip,6,3600,"Gửi yêu cầu quá nhiều lần. Hãy thử lại sau 1 giờ.");await hit();
      const u=await findLogin(email);if(!u||u.email!==email)fail(404,"Email này chưa đăng ký tài khoản. Hãy kiểm tra lại.");
      if(!mail.ready()&&!L.MEM)fail(503,"Máy chủ chưa cấu hình gửi email. Hãy liên hệ quản trị viên.");
      const t=crypto.randomBytes(24).toString("base64url");await L.redis(["SET","lich:rs:"+L.shaHex(t),u.uid,"EX",1800]);
      const link=`${siteUrl(req)}/#dat-lai-mat-khau=${t}`;
      if(!mail.ready())return ok({devLink:link}); /* chỉ ở chế độ thử trên máy */
      try{await mail.sendMail(email,"Đặt lại mật khẩu – Lịch Sự Kiện",
        `Xin chào ${u.name},\n\nBấm vào liên kết sau để đặt mật khẩu mới (hiệu lực 30 phút):\n${link}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
        `<p>Xin chào ${u.name.replace(/[<>&]/g,"")},</p><p>Bấm vào nút sau để đặt mật khẩu mới (hiệu lực 30 phút):</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#007aff;color:#fff;border-radius:12px;text-decoration:none;font-weight:600">Đặt lại mật khẩu</a></p><p style="color:#666">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`)}
      catch(e){console.error(e);fail(502,"Không gửi được email. Hãy thử lại sau.")}
      return ok()}
    case"reset":{const t=str(b.token,100);pwRule(b.password);const k="lich:rs:"+L.shaHex(t),uid=t&&await L.redis(["GET",k]);
      const u=uid&&await L.getUser(uid);if(!u)fail(400,"Liên kết đặt lại mật khẩu đã hết hạn hoặc không đúng. Hãy yêu cầu lại.");
      await L.saveUser(L.setPw(u,b.password));await L.redis(["DEL",k]);
      return ok({token:await L.newSession(u.uid),me:L.pub(u)})}
    case"notifs":{const u=await L.needUser(req);return ok({list:await L.getNotifs(u.uid)})}
    case"readNotifs":{const u=await L.needUser(req),L2=(await L.getNotifs(u.uid)).map(n=>({...n,r:1}));await L.redis(["SET",L.nkey(u.uid),JSON.stringify(L2)]);return ok({list:L2})}
    case"clearNotifs":{const u=await L.needUser(req);await L.redis(["DEL",L.nkey(u.uid)]);return ok({list:[]})}
    default:fail(400,"Yêu cầu không hợp lệ.")}
});
