/* Service worker: chạy ngoại tuyến + nhận thông báo đẩy và đặt số trên icon app */
const V="lich-v20",SHELL=["/","/css/styles.css","/js/app.js","/manifest.webmanifest","/assets/icon.svg","/assets/icon-192.png","/assets/icon-180.png","/assets/qr.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.startsWith("/api/"))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==="navigate"?caches.match("/"):Response.error()))));
});
/* Thông báo đẩy: {title, body, n (số trên icon), url, tag} */
self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data&&e.data.text()}}
  const n=+d.n||0,title=d.title||"Lịch Sự Kiện";
  e.waitUntil(Promise.all([
    self.registration.showNotification(title,{body:d.body||"",icon:"/assets/icon-192.png",badge:"/assets/badge-96.png",tag:d.tag||"lich",renotify:true,data:{url:d.url||"/"}}),
    (async()=>{try{if(self.navigator.setAppBadge){n>0?await self.navigator.setAppBadge(n):await self.navigator.clearAppBadge()}}catch{}})()]))});
self.addEventListener("notificationclick",e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||"/",location.origin).href;
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(L=>{for(const c of L){if(c.url.startsWith(location.origin)){c.navigate&&c.url!==url&&c.navigate(url).catch(()=>{});return c.focus()}}return self.clients.openWindow(url)}))});
/* Trình duyệt đổi khoá đăng ký → đăng ký lại với máy chủ */
self.addEventListener("pushsubscriptionchange",e=>{e.waitUntil((async()=>{try{const k=(await(await fetch("/api/push")).json()).key;if(!k)return;
  const p="=".repeat((4-k.length%4)%4),raw=atob((k+p).replace(/-/g,"+").replace(/_/g,"/")),key=Uint8Array.from(raw,c=>c.charCodeAt(0));
  const s=await self.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
  await fetch("/api/push",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({op:"subscribe",sub:s.toJSON(),label:"Thiết bị"})})}catch{}})())});
