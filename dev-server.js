/* Chạy thử trên máy: node dev-server.js (hoặc npm run dev) → http://localhost:3000
   Không cần Upstash: dữ liệu giữ trong bộ nhớ (tắt là mất). Tài khoản quản trị: admin / admin123 (hoặc ADMIN_PASSWORD). */
const http=require("http"),fs=require("fs"),path=require("path");
process.env.LICH_DEV_MEMORY="1";
if(!process.env.VAPID_PUBLIC_KEY){try{const k=require("web-push").generateVAPIDKeys();process.env.VAPID_PUBLIC_KEY=k.publicKey;process.env.VAPID_PRIVATE_KEY=k.privateKey}catch{console.log("(Chưa cài web-push: chạy npm install để thử thông báo đẩy)")}}
const ROOT=path.join(__dirname,"public"),PORT=+process.env.PORT||3000;
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json",".json":"application/json",".txt":"text/plain; charset=utf-8"};
http.createServer(async(req,res)=>{const u=new URL(req.url,"http://x");
  if(u.pathname.startsWith("/api/")){const name=u.pathname.slice(5).replace(/[^a-z]/g,"");const f=path.join(__dirname,"api",name+".js");
    if(!name||name.startsWith("_")||!fs.existsSync(f)){res.writeHead(404);return res.end()}
    let raw="";for await(const c of req)raw+=c;req.body=raw;
    res.status=c=>{res.statusCode=c;return res};res.json=o=>{res.setHeader("Content-Type","application/json");res.end(JSON.stringify(o))};
    return require(f)(req,res)}
  let p=path.normalize(decodeURIComponent(u.pathname)).replace(/^(\.\.[/\\])+/,"");let f=path.join(ROOT,p);
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,"index.html");
  if(!fs.existsSync(f)&&fs.existsSync(f+".html"))f+=".html";
  if(!f.startsWith(ROOT)||!fs.existsSync(f)){res.writeHead(404);return res.end("404")}
  res.writeHead(200,{"Content-Type":TYPES[path.extname(f)]||"application/octet-stream","Cache-Control":"no-cache"});fs.createReadStream(f).pipe(res);
}).listen(PORT,()=>console.log("Lịch Sự Kiện (thử trên máy): http://localhost:"+PORT));
