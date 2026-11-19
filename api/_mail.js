/* Gửi email (quên mật khẩu). Cách 1: Resend – RESEND_API_KEY + MAIL_FROM.
   Cách 2: SMTP (ví dụ Gmail với Mật khẩu ứng dụng) – SMTP_USER, SMTP_PASS, SMTP_HOST (mặc định smtp.gmail.com), SMTP_PORT (mặc định 465), MAIL_FROM (tuỳ chọn). */
const ready=()=>!!(process.env.RESEND_API_KEY||(process.env.SMTP_USER&&process.env.SMTP_PASS));
async function sendMail(to,subject,text,html){
  const from=process.env.MAIL_FROM||(process.env.SMTP_USER?`Lịch Sự Kiện <${process.env.SMTP_USER}>`:"Lịch Sự Kiện <onboarding@resend.dev>");
  if(process.env.RESEND_API_KEY){
    const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject,text,html})});
    if(!r.ok)throw new Error("resend "+r.status+" "+(await r.text().catch(()=>"")));return}
  if(process.env.SMTP_USER&&process.env.SMTP_PASS){
    const nm=require("nodemailer"),port=+process.env.SMTP_PORT||465;
    const t=nm.createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port,secure:port===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
    await t.sendMail({from,to,subject,text,html});return}
  throw new Error("mail not configured")}
module.exports={ready,sendMail};
