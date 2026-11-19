/* Tính ngày diễn ra của sự kiện phía máy chủ (giờ Việt Nam) – dùng cho tự xoá sự kiện cũ, số trên icon và thông báo buổi sáng. */
const{toSolar}=require("./_lunar.js");
const DAY=864e5;
/* Ngày hôm nay theo giờ Việt Nam (mốc 0h, dạng số ms UTC) */
function today(){const t=new Date(Date.now()+7*36e5);return Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate())}
const utc=d=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
/* Sự kiện kéo sang năm sau (ví dụ 25/12 → 5/1) */
const crossY=e=>(e.m2||e.m)<e.m||((e.m2||e.m)===e.m&&e.b<e.a);
const yearOk=(e,y)=>e.repeat?(e.every===2?(((y-e.year)%2)+2)%2===0:true):e.year===y;
function occ(e,y){const m2=e.m2||e.m,y2=crossY(e)?y+1:y;
  if(e.cal==="s"){const n1=new Date(Date.UTC(y,e.m,0)).getUTCDate(),n2=new Date(Date.UTC(y2,m2,0)).getUTCDate();
    return{s:Date.UTC(y,e.m-1,Math.min(e.a,n1)),en:Date.UTC(y2,m2-1,Math.min(e.b,n2))}}
  return{s:utc(toSolar(e.a,e.m,y)),en:utc(toSolar(e.b,m2,y2))}}
function nextOcc(e,T0=today()){let best=null;const Y=new Date(T0).getUTCFullYear(),ys=e.repeat?[Y-2,Y-1,Y,Y+1,Y+2]:[e.year];
  for(const y of ys){if(!yearOk(e,y))continue;let o;try{o=occ(e,y)}catch{continue}if(o.en>=T0&&(!best||o.s<best.s))best={...o,y}}return best}
/* Sự kiện đã duyệt diễn ra trong 7 ngày tới (kể cả đang diễn ra) */
function upcoming(events,T0=today()){const out=[];
  for(const e of events){if(e.status==="pending")continue;const o=nextOcc(e,T0);if(!o)continue;const dd=Math.round((o.s-T0)/DAY);if(dd<=7)out.push({e,o,dd,run:dd<=0})}
  return out.sort((a,b)=>a.o.s-b.o.s)}
/* Sự kiện "một lần" đã kết thúc quá 30 ngày */
function expired(e){if(!e||e.repeat)return false;try{const o=occ(e,e.year);return today()-o.en>30*DAY}catch{return false}}
module.exports={today,occ,nextOcc,upcoming,expired,crossY};
