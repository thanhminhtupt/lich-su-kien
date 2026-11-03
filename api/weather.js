/* Dự phòng thời tiết bằng Google Weather API (khoá giữ bí mật ở máy chủ).
   Biến môi trường: GOOGLE_WEATHER_API_KEY. Không có khoá thì trả 503 và trang tự dùng nguồn khác. */
const KEY=process.env.GOOGLE_WEATHER_API_KEY;
const BASE="https://weather.googleapis.com/v1/";
const cat=t=>{t=String(t||"").toUpperCase();
  return /THUNDER/.test(t)?6:/SNOW|SLEET|HAIL|BLIZZARD|FLURR|ICE|FREEZING/.test(t)?5:/RAIN|SHOWER|DRIZZLE/.test(t)?4:/FOG|HAZE|MIST|SMOKE/.test(t)?3:/PARTLY/.test(t)?1:/CLOUDY|OVERCAST/.test(t)?2:/CLEAR|SUNNY/.test(t)?0:1};
const pad=n=>String(n).padStart(2,"0");
const pop=x=>Math.round(x?.precipitation?.probability?.percent??0);
const deg=x=>Math.round(x?.degrees??0);
module.exports=async(req,res)=>{
  res.setHeader("Cache-Control","public, s-maxage=600, stale-while-revalidate=1800");
  if(!KEY)return res.status(503).json({error:"Chưa cấu hình GOOGLE_WEATHER_API_KEY."});
  const lat=Number(req.query&&req.query.lat),lon=Number(req.query&&req.query.lon);
  if(!isFinite(lat)||!isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({error:"Toạ độ không hợp lệ."});
  const q=`key=${encodeURIComponent(KEY)}&location.latitude=${lat.toFixed(3)}&location.longitude=${lon.toFixed(3)}&languageCode=vi`;
  const get=async p=>{const r=await fetch(BASE+p+(p.includes("?")?"&":"?")+q);if(!r.ok)throw new Error(p+" "+r.status);return r.json()};
  try{
    const [cur,days]=await Promise.all([get("currentConditions:lookup"),get("forecast/days:lookup?days=7")]);
    const fd=days.forecastDays||[];if(!fd.length)throw new Error("no days");
    const d0=fd[0],day=d0.daytimeForecast||d0.fullDayForecast||{},night=d0.nighttimeForecast||d0.fullDayForecast||{};
    const part=(n,x)=>[n,x&&x.weatherCondition?cat(x.weatherCondition.type):null,pop(x)];
    res.status(200).json({
      t:deg(cur.temperature),fl:cur.feelsLikeTemperature&&cur.feelsLikeTemperature.degrees!=null?deg(cur.feelsLikeTemperature):null,c:cat(cur.weatherCondition&&cur.weatherCondition.type),day:cur.isDaytime===false?0:1,
      hi:deg(d0.maxTemperature),lo:deg(d0.minTemperature),
      parts:[part("Sáng",day),part("Chiều",day),part("Tối",night)],
      days:fd.slice(0,7).map(f=>{const x=f.daytimeForecast||f.fullDayForecast||{},dd=f.displayDate||{};
        return{d:`${dd.year}-${pad(dd.month)}-${pad(dd.day)}`,c:cat(x.weatherCondition&&x.weatherCondition.type),hi:deg(f.maxTemperature),lo:deg(f.minTemperature),p:pop(x)}})});
  }catch{res.status(502).json({error:"Không lấy được dữ liệu từ Google Weather."})}
};
