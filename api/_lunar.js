/* Thuật toán âm lịch (Hồ Ngọc Đức, múi giờ +7) dùng phía máy chủ để tính ngày kết thúc sự kiện âm lịch. */
const CAN=[],CHI=[];
module.exports=(function(){
/* ===== Âm lịch (thuật toán Hồ Ngọc Đức, múi giờ +7) ===== */
const TZ=7,PI=Math.PI,fl=Math.floor;
function jdFrom(d,m,y){const a=fl((14-m)/12),Y=y+4800-a,M=m+12*a-3;let j=d+fl((153*M+2)/5)+365*Y+fl(Y/4)-fl(Y/100)+fl(Y/400)-32045;if(j<2299161)j=d+fl((153*M+2)/5)+365*Y+fl(Y/4)-32083;return j}
function jdTo(j){let b,c;if(j>2299160){const a=j+32044;b=fl((4*a+3)/146097);c=a-fl(b*146097/4)}else{b=0;c=j+32082}
 const d=fl((4*c+3)/1461),e=c-fl(1461*d/4),m=fl((5*e+2)/153);return[e-fl((153*m+2)/5)+1,m+3-12*fl(m/10),b*100+d-4800+fl(m/10)]}
function newMoon(k){const T=k/1236.85,T2=T*T,T3=T2*T,r=PI/180;let J=2415020.75933+29.53058868*k+.0001178*T2-.000000155*T3+.00033*Math.sin((166.56+132.87*T-.009173*T2)*r);
 const M=359.2242+29.10535608*k-.0000333*T2-.00000347*T3,Mp=306.0253+385.81691806*k+.0107306*T2+.00001236*T3,F=21.2964+390.67050646*k-.0016528*T2-.00000239*T3,s=Math.sin;
 const C=(.1734-.000393*T)*s(M*r)+.0021*s(2*r*M)-.4068*s(Mp*r)+.0161*s(r*2*Mp)-.0004*s(r*3*Mp)+.0104*s(r*2*F)-.0051*s(r*(M+Mp))-.0074*s(r*(M-Mp))+.0004*s(r*(2*F+M))-.0004*s(r*(2*F-M))-.0006*s(r*(2*F+Mp))+.001*s(r*(2*F-Mp))+.0005*s(r*(2*Mp+M));
 const dt=T<-11?.001+.000839*T+.0002261*T2-.00000845*T3-.000000081*T*T3:-.000278+.000265*T+.000262*T2;return J+C-dt}
const nmDay=k=>fl(newMoon(k)+.5+TZ/24);
function sunLong(j){const T=(j-2451545.5-TZ/24)/36525,T2=T*T,r=PI/180,M=357.5291+35999.0503*T-.0001559*T2-.00000048*T*T2,L0=280.46645+36000.76983*T+.0003032*T2;
 let L=(L0+(1.9146-.004817*T-.000014*T2)*Math.sin(r*M)+(.019993-.000101*T)*Math.sin(2*r*M)+.00029*Math.sin(3*r*M))*r;L-=PI*2*fl(L/(PI*2));return fl(L/PI*6)}
function lm11(y){const off=jdFrom(31,12,y)-2415021,k=fl(off/29.530588853);let n=nmDay(k);if(sunLong(n)>=9)n=nmDay(k-1);return n}
function leapOff(a){const k=fl((a-2415021.076998695)/29.530588853+.5);let last=0,i=1,arc=sunLong(nmDay(k+i));do{last=arc;i++;arc=sunLong(nmDay(k+i))}while(arc!=last&&i<14);return i-1}
function toLunar(d,m,y){const dn=jdFrom(d,m,y),k=fl((dn-2415021.076998695)/29.530588853);let ms=nmDay(k+1);if(ms>dn)ms=nmDay(k);
 let a=lm11(y),b=a,ly;if(a>=ms){ly=y;a=lm11(y-1)}else{ly=y+1;b=lm11(y+1)}
 const ld=dn-ms+1,df=fl((ms-a)/29);let leap=0,lmn=df+11;
 if(b-a>365){const lo=leapOff(a);if(df>=lo){lmn=df+10;if(df==lo)leap=1}}
 if(lmn>12)lmn-=12;if(lmn>=11&&df<4)ly-=1;return{d:ld,m:lmn,y:ly,leap}}
function toSolar(ld,lmn,ly){let a,b;if(lmn<11){a=lm11(ly-1);b=lm11(ly)}else{a=lm11(ly);b=lm11(ly+1)}
 const k=fl(.5+(a-2415021.076998695)/29.530588853);let off=lmn-11;if(off<0)off+=12;
 if(b-a>365&&off>=leapOff(a))off+=1;const[d,m,y]=jdTo(nmDay(k+off)+ld-1);return new Date(y,m-1,d)}
const canChi=y=>CAN[(y+6)%10]+" "+CHI[(y+8)%12];


return{toSolar,toLunar};
})();
