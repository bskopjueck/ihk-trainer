"use strict";
"use strict";
/* ═══════════════ DATEN (unverändert aus der Vorgängerversion) ═══════════════ */
const DATA = window.__D, LERN = window.__L;
/* Zugangsdaten fuer den Geraete-Abgleich liegen nur im Geraet, nie in einer
   herunterladbaren Datei. Eingerichtet wird das in den Einstellungen. */
const GHKEY='ihk_abgleich';
let GH=null; try{ GH=JSON.parse(localStorage.getItem(GHKEY)||'null'); }catch(e){}
const ITEMS = DATA.items;                    // 958 Original-IHK-Aufgaben
const MODS  = DATA.modules;
const MOD_BY = {}; MODS.forEach(m=>MOD_BY[m.id]=m);
const BY_MOD = {}; ITEMS.forEach(i=>{ (BY_MOD[i.modul]=BY_MOD[i.modul]||[]).push(i); });
const BY_ID  = {}; ITEMS.forEach(i=>BY_ID[i.id]=i);
const modL = id => LERN[id] || {intro:'',lektionen:[],karten:[],mc:[]};
const TERMINE = [...new Set(ITEMS.map(i=>i.termin))].sort((a,b)=>{
  const y=x=>+((x.match(/\d{4}/)||[0])[0]); return y(a)-y(b)||(/Winter/.test(a)?1:0)-(/Winter/.test(b)?1:0); });
const BER_IM='Immobilienwirtschaft', BER_KS='Kaufmännische Steuerung & Kontrolle';

/* ═══════════════ ICONS ═══════════════ */
const IC={
org:'<path d="M4 20h16M6 20V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v14M14 10h3a1 1 0 0 1 1 1v9M9 9h2M9 13h2M9 17h2"/>',
mark:'<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1ZM16 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
miet:'<path d="M9.5 14.5a4 4 0 1 1 2.9-6.8L20 15.3l-2 2-1.6-1.6-1.7 1.7-1.6-1.6-1.4 1.4a4 4 0 0 1-2.2-2.7Z"/><circle cx="8" cy="12" r="1.1"/>',
weg:'<path d="M3 20h18M5 20v-8l4-3 4 3v8M13 20v-6l3-2.2L19 14v6M7 14h1.5M7 17h1.5M16 17h1"/>',
kauf:'<path d="M6 4h9l3 3v13H6zM15 4v3h3M9 11h6M9 15h4"/><circle cx="16.5" cy="18.5" r="2.2"/><path d="m15 20.5-1 2 1.6-.4.9 1.3"/>',
erb:'<path d="M12 21v-6M12 15a4.5 4.5 0 0 0 4.5-4.5A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-4.5 4.5A4.5 4.5 0 0 0 12 15ZM8.5 21h7M9.6 11.5 12 13.6l2.4-2.1"/>',
bau:'<path d="M4 21h16M6 21V9l12-4M6 13l12-4M6 17l12-4M18 21V5M9 21v-3h4v3"/>',
fin:'<path d="M3 10h18L12 4 3 10ZM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
makl:'<path d="M8 12.5 5 15a2 2 0 0 0 2.8 2.8l.7-.7a2 2 0 0 0 2.8 2.8 2 2 0 0 0 2.8 0 2 2 0 0 0 2.8 0L21 16M3 8l3-3 3 1 3-1 3 1 3-1 3 3"/><path d="m9 11 2.5 2.5"/>',
buch:'<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2ZM5 18a2 2 0 0 1 2-2h11M9 8h5M9 11h5"/>',
ja:'<path d="M5 20h14M8 20v-7M12 20V7M16 20v-4M5 4h5v3H5z"/>',
klr:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h3.01M8.5 18.5h.01M12 18.5h.01"/>',
ctrl:'<path d="M4 19h16M5 15.5l4-4.5 3.5 3L20 6"/><path d="M20 10V6h-4"/>',
div:'<path d="M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.5ZM9 8h6M9 12h6M9 16h3"/>',
recht:'<path d="M12 4v16M7 20h10M5 9h6L8 4Zm0 0a3 3 0 0 0 6 0M13 9h6l-3-5Zm0 0a3 3 0 0 0 6 0"/>',
book:'<path d="M12 7v13M12 7a5 5 0 0 0-5-3H4v13h3a5 5 0 0 1 5 3 5 5 0 0 1 5-3h3V4h-3a5 5 0 0 0-5 3Z"/>',
cards:'<rect x="3" y="7" width="12" height="14" rx="2"/><path d="M8 4h9a2 2 0 0 1 2 2v11"/>',
check:'<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.6 2.6L16 9.4"/>',
exam:'<path d="M8 4h8a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M10 3h4v3h-4zM10 11h4M10 15h4"/>',
flame:'<path d="M12 22a6 6 0 0 0 6-6c0-4-3-5.5-3-9 0 0-2 1.5-2 4 0 0-1.5-1-1.5-3.5C11.5 4 9 6 9 6 7.5 8 6 10.5 6 16a6 6 0 0 0 6 6Z"/>',
star:'<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.7l5.9-.8Z"/>',
bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
play:'<path d="m8 5 11 7-11 7Z"/>',
trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0ZM8 6H5.5a2.5 2.5 0 0 0 2.5 4M16 6h2.5a2.5 2.5 0 0 1-2.5 4M12 13v4M9 21h6l-.7-4H9.7Z"/>',
target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
cal:'<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3M8 17.5h3"/>',
medal:'<circle cx="12" cy="14.5" r="5.5"/><path d="m8.5 9.5-3-6.5h4l2 4M15.5 9.5l3-6.5h-4l-2 4M12 12v5M10 14.5h4"/>',
crown:'<path d="M4 18h16M4 18 3 7l5 4 4-6 4 6 5-4-1 11Z"/>',
rocket:'<path d="M12 3c3.5 2.4 5.5 6 5.5 10l-2 3h-7l-2-3C6.5 9 8.5 5.4 12 3Z"/><circle cx="12" cy="10" r="1.8"/><path d="M8.5 17.5c-1.5.8-2 2.3-2 3.5 1.4 0 2.8-.6 3.5-1.8M15.5 17.5c1.5.8 2 2.3 2 3.5-1.4 0-2.8-.6-3.5-1.8"/>',
gem:'<path d="M7 3h10l4 6-9 12L3 9Z"/><path d="M3 9h18M9.5 3 7 9l5 12M14.5 3 17 9l-5 12"/>',
grad:'<path d="m3 9 9-4.5L21 9l-9 4.5Z"/><path d="M7 11v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5M21 9v5"/>',
books:'<path d="M4 5h4v15H4zM9.5 5h4v15h-4zM15.5 6.2l3.9 1-3.6 13.4-3.9-1"/>',
hundred:'<path d="M4 8v8M8 8v8M4 12h4M12 8h2v8M18.5 8h1.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/>',
sparkle:'<path d="m12 3 1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4Z"/><path d="M18.5 16.5 19 18l1.5.5-1.5.5-.5 1.5-.5-1.5L16.5 18l1.5-.5Z"/>',
party:'<path d="m4 20 4.5-11L19 19.5Z"/><path d="M13 3.5c1 1 1 2 .3 2.8M16.5 6.5c1.3-.4 2.2.1 2.6 1.1M15 10.5c.9 1 2 1 2.9.4M19.5 3.5l.01.01"/>',
logo:'<path d="M4 20h16M6.5 20V9.5L12 5l5.5 4.5V20"/><path d="M10 20v-5h4v5M9.7 11.4h4.6"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
right:'<path d="m9 5 7 7-7 7"/>', left:'<path d="m15 5-7 7 7 7"/>',
up:'<path d="m6 15 6-6 6 6"/>', down:'<path d="m6 9 6 6 6-6"/>',
x:'<path d="m6 6 12 12M18 6 6 18"/>',
alert:'<path d="M12 3.5 21 19H3Z"/><path d="M12 9.5v4M12 16.5h.01"/>',
lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/>',
note:'<path d="M5 4h14v10l-5 6H5Z"/><path d="M19 14h-5v6M8.5 8.5h7M8.5 12h4"/>',
hl:'<path d="m14.5 4.5 5 5-8 8H7l-.5-3.5Z"/><path d="M4 21h16M12 7l5 5"/>',
sigma:'<path d="M17 4H7l6 8-6 8h10"/>',
weak:'<path d="M3 17 9 9l4 4 8-9"/><path d="M14 4h7v7"/>',
flag:'<path d="M5 21V4h13l-3 4 3 4H5"/>',
dot:'<circle cx="12" cy="12" r="4"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
home:'<path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z"/>',
chart:'<path d="M4 20h16M7 20v-6M12 20V6M17 20v-9"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.2 2"/>'
};
const FILLED={play:1,bolt:1,star:1,flame:1,dot:1};
function ic(n,sz,cls){ const p=IC[n]; if(!p) return ''; const f=FILLED[n];
  return '<svg class="ic '+(cls||'')+'" viewBox="0 0 24 24" width="'+(sz||20)+'" height="'+(sz||20)+'" fill="'+(f?'currentColor':'none')+'" stroke="currentColor" stroke-width="'+(f?1:1.6)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'; }
const MICON={m_org:'org',m_mark:'mark',m_miet:'miet',m_weg:'weg',m_kauf:'kauf',m_erb:'erb',m_bau:'bau',
 m_fin:'fin',m_makl:'makl',k_buch:'buch',k_ja:'ja',k_klr:'klr',k_ctrl:'ctrl',k_div:'div',z_recht:'recht'};
const MHUE={m_org:212,m_mark:330,m_miet:25,m_weg:150,m_kauf:265,m_erb:110,m_bau:35,m_fin:200,m_makl:180,
 k_buch:250,k_ja:190,k_klr:300,k_ctrl:160,k_div:15,z_recht:0};

/* ═══════════════ DATUM ═══════════════ */
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>dstr(new Date());
const dparse=s=>{const a=String(s).split('-').map(Number);return new Date(a[0],a[1]-1,a[2]);};
const dayDiff=(a,b)=>Math.round((dparse(b)-dparse(a))/864e5);
const plusDays=(s,n)=>dstr(new Date(dparse(s).getTime()+n*864e5));
const DE=['So','Mo','Di','Mi','Do','Fr','Sa'];
const fmtDay=s=>{const d=dparse(s);return DE[d.getDay()]+' '+pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.';};
const fmtLong=s=>{const d=dparse(s);return DE[d.getDay()]+', '+pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear();};

/* ═══════════════ SPEICHER + MIGRATION ═══════════════ */
const KEY='ihk_trainer_v3', OLD='ihk_immo_v2', OLD1='ihk_immo_trainer_v1';
function blank(){ return {v:3,read:{},srs:{},res:{},hl:{},xp:0,
  day:{d:'',xp:0,min:0,items:0},
  streak:{n:0,best:0,last:'',saver:0},
  badges:{},modDone:{},sims:[],stats:{},miss:{},
  plan:{exam:'2026-11-24',min:60,start:today()},
  ui:{}}; }
let P=blank();
function migrate(){
  let raw=null; try{ raw=localStorage.getItem(KEY); }catch(e){}
  if(raw){ try{ P=Object.assign(blank(),JSON.parse(raw)); }
    catch(e){ try{ const bak=localStorage.getItem(KEY+'_bak');
      if(bak) P=Object.assign(blank(),JSON.parse(bak)); }catch(x){} } }
  else{
    let o=null; try{ o=JSON.parse(localStorage.getItem(OLD)||'null'); }catch(e){}
    if(!o){ try{ o=JSON.parse(localStorage.getItem(OLD1)||'null'); }catch(e){} }
    if(o){
      P=blank();
      P.read=o.read||{}; P.res=o.res||{}; P.hl=o.hl||{}; P.xp=o.xp||0;
      P.badges=o.badges||{}; P.modDone=o.modDone||{};
      if(o.streak) P.streak={n:o.streak.n||0,best:o.streak.n||0,last:o.streak.last||'',saver:0};
      if(o.plan) P.plan=Object.assign(P.plan,o.plan);
      if(o.day) P.day={d:o.day.d||'',xp:o.day.xp||0,min:0,items:0};
      if(o.goal) P.plan.min=o.goal;
      // Karten- und Quizstände in das neue SRS-Modell überführen
      Object.entries(o.card||{}).forEach(([k,b])=>{ const m=k.split(':L')[0];
        const parts=k.split(':K'); if(parts.length<2) return;
        P.srs['c|'+parts[0]+'|'+parts[1]]={b:Math.min(6,b|0),n:b|0,w:0,d:(o.due||{})[k]||today(),t:0}; });
      Object.entries(o.mc||{}).forEach(([k,st])=>{ const parts=k.split(':Q'); if(parts.length<2) return;
        P.srs['q|'+parts[0]+'|'+parts[1]]={b:st.ok?(st.box||2):0,n:st.n||1,w:st.ok?0:1,d:(o.due||{})[k]||today(),t:0}; });
      P.mig=true;
    }
  }
  if(!P.plan) P.plan={exam:'2026-11-24',min:60,start:today()};
  ['read','srs','res','hl','badges','modDone','stats','miss','ui'].forEach(k=>{ if(!P[k]||typeof P[k]!=='object') P[k]={}; });
  if(!Array.isArray(P.sims)) P.sims=[];
  if(!P.streak) P.streak={n:0,best:0,last:'',saver:0};
  if(!P.day) P.day={d:'',xp:0,min:0,items:0};
  if(P.day.d!==today()) P.day={d:today(),xp:0,min:0,items:0};
}
migrate();
/* Korrektur 09/2026: Bei diesen Aufgaben war die automatische Prüfung fehlerhaft
   (Datum als Zahl gelesen, mehrteilige Lösung auf eine Zahl verkürzt, Freitext-Stichwörter zu großzügig).
   Dort gespeicherte Ergebnisse sind nicht verlässlich und werden neu abgefragt. */
(function(){ if(P.fix2609) return;
  const ids=["2019_imwi_1.1", "2019_imwi_1.2", "2019_imwi_1.3", "2019_imwi_2.1", "2019_imwi_2.2", "2019_imwi_2.3.1", "2019_imwi_2.3.2", "2019_imwi_3.1", "2019_imwi_3.2", "2019_imwi_3.3", "2019_imwi_3.4", "2019_imwi_3.5", "2019_imwi_4.1", "2019_imwi_4.2", "2019_imwi_4.3", "2019_imwi_5.1", "2019_imwi_5.2", "2019_imwi_5.3.1", "2019_imwi_5.3.2", "2019_imwi_5.4", "2019_imwi_6.1", "2019_imwi_6.2.1", "2019_imwi_6.2.2", "2019_imwi_6.3", "2019_imwi_6.4.1", "2019_imwi_6.4.2", "2019_imwi_6.4.3", "2019_imwi_7.1", "2019_imwi_7.2", "2019_imwi_7.3", "2019_imwi_8.1", "2019_imwi_8.2", "2019_imwi_8.3", "2019_imwi_8.4", "2019_imwi_9.1", "2019_imwi_9.2", "2020_imwi_1.1", "2020_imwi_1.2", "2020_imwi_1.3", "2020_imwi_2.1", "2020_imwi_2.2", "2020_imwi_2.3", "2020_imwi_2.4", "2020_imwi_3.1", "2020_imwi_3.2", "2020_imwi_3.3", "2020_imwi_4.1", "2020_imwi_4.2", "2020_imwi_4.3", "2020_imwi_5.1", "2020_imwi_5.2", "2020_imwi_5.3", "2020_imwi_6.1", "2020_imwi_6.2", "2020_imwi_6.3", "2020_imwi_6.4", "2020_imwi_6.5", "2020_imwi_6.6", "2020_imwi_6.7", "2020_imwi_6.8", "2020_imwi_6.9", "2020_imwi_7.1", "2020_imwi_7.2", "2020_imwi_7.3.1", "2020_imwi_7.3.2", "2020_imwi_7.4", "2020_imwi_7.5", "2020_ksk_18", "2020_ksk_29", "2021_imwi_1.1", "2021_imwi_1.2", "2021_imwi_1.3", "2021_imwi_2.1", "2021_imwi_3.1", "2021_imwi_3.2", "2021_imwi_4.1", "2021_imwi_4.2.1", "2021_imwi_4.2.2", "2021_imwi_5.1", "2021_imwi_5.2.1", "2021_imwi_5.2.2", "2021_imwi_5.3.1", "2021_imwi_5.3.2", "2021_imwi_5.3.3", "2021_imwi_5.3.4", "2021_imwi_5.3.5", "2021_imwi_6.1", "2021_imwi_6.2", "2021_imwi_6.3", "2021_imwi_6.4.1", "2021_imwi_6.4.2", "2021_imwi_6.5", "2021_imwi_6.6", "2021_imwi_6.7", "2021_imwi_6.8", "2021_imwi_7.1", "2021_imwi_7.2.1", "2021_imwi_7.2.2", "2021_imwi_8.1", "2021_imwi_8.2", "2021_imwi_8.3", "2021_imwi_8.4", "2022_imwi_1.1", "2022_imwi_1.2", "2022_imwi_2.1", "2022_imwi_2.2", "2022_imwi_3.1", "2022_imwi_3.2", "2022_imwi_3.3", "2022_imwi_3.4.1", "2022_imwi_3.4.2", "2022_imwi_3.5", "2022_imwi_3.6", "2022_imwi_3.7", "2022_imwi_4.1", "2022_imwi_4.2", "2022_imwi_4.3", "2022_imwi_4.4", "2022_imwi_4.5.1", "2022_imwi_4.5.2", "2022_imwi_4.5.3", "2022_imwi_5.1", "2022_imwi_5.2", "2022_imwi_5.3", "2022_imwi_6.1", "2022_imwi_6.2", "2022_imwi_6.3", "2022_imwi_7.1", "2022_imwi_7.2", "2022_imwi_7.3", "2022_imwi_7.4", "2022_imwi_7.5", "2022_imwi_8.1", "2022_imwi_8.2", "2022_imwi_8.3", "2022_imwi_8.4.1", "2022_imwi_8.4.2", "2022_ksk_12", "2022_ksk_13", "s2023_imwi_1.1", "s2023_imwi_1.2", "s2023_imwi_1.3", "s2023_imwi_2.1", "s2023_imwi_2.2", "s2023_imwi_2.3", "s2023_imwi_3.1", "s2023_imwi_3.2", "s2023_imwi_3.3", "s2023_imwi_4.1", "s2023_imwi_4.2", "s2023_imwi_4.3", "s2023_imwi_4.4", "s2023_imwi_4.5.1", "s2023_imwi_4.5.2", "s2023_imwi_5.1", "s2023_imwi_5.2.1", "s2023_imwi_5.2.2", "s2023_imwi_5.2.3", "s2023_imwi_5.2.4", "s2023_imwi_5.3", "s2023_imwi_6.1", "s2023_imwi_6.2", "s2023_imwi_7.2", "s2023_imwi_7.3.1", "s2023_imwi_7.3.2", "s2023_imwi_7.4", "s2023_imwi_8.1.1", "s2023_imwi_8.1.2", "s2023_imwi_8.2.1", "s2023_imwi_8.2.2", "s2023_imwi_8.3", "s2023_imwi_8.4", "s2023_ksk_24", "s2023_ksk_8", "s2024_imwi_1.1", "s2024_imwi_1.2", "s2024_imwi_2.1", "s2024_imwi_2.2", "s2024_imwi_3.1", "s2024_imwi_3.2.1", "s2024_imwi_3.2.2", "s2024_imwi_3.3.1", "s2024_imwi_3.3.2", "s2024_imwi_4", "s2024_imwi_5.1", "s2024_imwi_5.2", "s2024_imwi_5.3", "s2024_imwi_6.1.1", "s2024_imwi_6.1.2", "s2024_imwi_6.2", "s2024_imwi_6.3.1", "s2024_imwi_6.3.2", "s2024_imwi_7.1", "s2024_imwi_7.2", "s2024_imwi_7.3", "s2024_imwi_7.4", "s2024_imwi_7.5", "s2024_imwi_8.1", "s2024_imwi_8.2.1", "s2024_imwi_8.2.2", "s2024_imwi_8.2.3", "s2024_imwi_8.3.1", "s2024_imwi_8.3.2", "s2024_imwi_8.4", "s2024_imwi_8.5", "s2024_ksk_23", "s2024_ksk_25", "s2024_ksk_6", "s2024_ksk_8", "s2025_imwi_1.1", "s2025_imwi_1.2", "s2025_imwi_2.1", "s2025_imwi_2.2", "s2025_imwi_2.3", "s2025_imwi_3.1", "s2025_imwi_3.2", "s2025_imwi_3.3", "s2025_imwi_4.1.1", "s2025_imwi_4.1.2", "s2025_imwi_4.2", "s2025_imwi_4.3", "s2025_imwi_4.4", "s2025_imwi_4.5", "s2025_imwi_4.6", "s2025_imwi_4.7.1", "s2025_imwi_4.7.2", "s2025_imwi_5.1", "s2025_imwi_5.2", "s2025_imwi_5.3", "s2025_imwi_5.4", "s2025_imwi_5.5", "s2025_imwi_6.1", "s2025_imwi_6.2", "s2025_imwi_6.3", "s2025_imwi_7.1", "s2025_imwi_7.2", "s2025_imwi_7.3", "s2025_ksk_20", "w1920_imwi_1.1", "w1920_imwi_1.2", "w1920_imwi_1.3", "w1920_imwi_2.1", "w1920_imwi_2.2", "w1920_imwi_2.3", "w1920_imwi_2.4", "w1920_imwi_3.1", "w1920_imwi_3.2", "w1920_imwi_3.3", "w1920_imwi_3.4", "w1920_imwi_3.5", "w1920_imwi_4.1", "w1920_imwi_4.2", "w1920_imwi_4.3", "w1920_imwi_5.1", "w1920_imwi_5.2.1", "w1920_imwi_5.2.2", "w1920_imwi_5.2.3", "w1920_imwi_5.3", "w1920_imwi_5.4", "w1920_imwi_5.5", "w1920_imwi_6.1", "w1920_imwi_6.3", "w1920_imwi_7.1", "w1920_imwi_7.2", "w1920_imwi_7.3", "w1920_imwi_7.4", "w1920_imwi_8.1", "w1920_imwi_8.2", "w1920_imwi_8.3", "w1920_imwi_8.4", "w1920_imwi_8.5", "w1920_imwi_8.6", "w1920_ksk_24", "w2021_imwi_1.1", "w2021_imwi_1.2", "w2021_imwi_1.3", "w2021_imwi_2.1", "w2021_imwi_2.2", "w2021_imwi_2.3", "w2021_imwi_2.4", "w2021_imwi_2.5", "w2021_imwi_3.1", "w2021_imwi_3.2", "w2021_imwi_3.3", "w2021_imwi_4.1", "w2021_imwi_4.2.1", "w2021_imwi_4.2.2", "w2021_imwi_4.3", "w2021_imwi_4.4", "w2021_imwi_4.5", "w2021_imwi_5.1", "w2021_imwi_5.2", "w2021_imwi_5.3", "w2021_imwi_5.4", "w2021_imwi_5.5", "w2021_imwi_6.1", "w2021_imwi_6.2", "w2021_imwi_6.3", "w2021_imwi_6.4", "w2021_imwi_6.5", "w2021_imwi_7.1", "w2021_imwi_7.2", "w2021_imwi_7.3.1", "w2021_imwi_7.3.2", "w2021_imwi_7.4", "w2021_imwi_8.1", "w2021_imwi_8.2", "w2021_imwi_8.3", "w2122_imwi_1.1", "w2122_imwi_1.2", "w2122_imwi_1.3", "w2122_imwi_2.1", "w2122_imwi_2.2.1", "w2122_imwi_2.2.2", "w2122_imwi_2.3", "w2122_imwi_3.1", "w2122_imwi_3.2", "w2122_imwi_3.3.1", "w2122_imwi_3.3.2", "w2122_imwi_4.1", "w2122_imwi_4.2.1", "w2122_imwi_4.2.2", "w2122_imwi_4.2.3", "w2122_imwi_4.3", "w2122_imwi_4.4.1", "w2122_imwi_4.4.2", "w2122_imwi_5.1", "w2122_imwi_5.2", "w2122_imwi_5.3", "w2122_imwi_6.1", "w2122_imwi_6.2", "w2122_imwi_6.3", "w2122_imwi_7.1", "w2122_imwi_7.3", "w2122_imwi_7.4", "w2122_ksk_26", "w2223_imwi_1.1", "w2223_imwi_1.2", "w2223_imwi_2.1", "w2223_imwi_2.2", "w2223_imwi_2.3", "w2223_imwi_3.1", "w2223_imwi_3.2", "w2223_imwi_3.3", "w2223_imwi_3.4.1", "w2223_imwi_3.4.2", "w2223_imwi_3.5", "w2223_imwi_4.1", "w2223_imwi_4.2", "w2223_imwi_5.1", "w2223_imwi_5.2", "w2223_imwi_5.3", "w2223_imwi_5.4", "w2223_imwi_5.5", "w2223_imwi_5.6", "w2223_imwi_6.1", "w2223_imwi_6.2.1", "w2223_imwi_6.2.2", "w2223_imwi_6.2.3", "w2223_imwi_7.1", "w2223_imwi_7.2", "w2223_imwi_7.3.1", "w2223_imwi_7.3.2", "w2223_imwi_7.3.3", "w2223_imwi_7.4.1", "w2223_imwi_7.4.2", "w2223_imwi_7.5", "w2223_imwi_7.6", "w2324_imwi_1.1", "w2324_imwi_1.2", "w2324_imwi_2.1", "w2324_imwi_2.2", "w2324_imwi_2.3", "w2324_imwi_3.1", "w2324_imwi_3.2", "w2324_imwi_3.3.1", "w2324_imwi_3.3.2", "w2324_imwi_3.4", "w2324_imwi_3.5", "w2324_imwi_4.1", "w2324_imwi_4.2", "w2324_imwi_4.3", "w2324_imwi_5.1", "w2324_imwi_5.2", "w2324_imwi_5.3.1", "w2324_imwi_5.3.2", "w2324_imwi_5.3.3", "w2324_imwi_6.1", "w2324_imwi_6.2", "w2324_imwi_6.3", "w2324_imwi_6.4", "w2324_imwi_7.1", "w2324_imwi_7.2.1", "w2324_imwi_7.2.2", "w2324_imwi_7.2.3", "w2324_imwi_7.3", "w2324_imwi_7.4", "w2324_imwi_7.5", "w2324_imwi_7.6", "w2324_ksk_14", "w2324_ksk_15", "w2425_imwi_1.1", "w2425_imwi_1.2", "w2425_imwi_1.3", "w2425_imwi_2.1.1", "w2425_imwi_2.1.2", "w2425_imwi_2.2", "w2425_imwi_2.3", "w2425_imwi_2.4", "w2425_imwi_3.1", "w2425_imwi_3.2", "w2425_imwi_3.3", "w2425_imwi_3.4", "w2425_imwi_3.5", "w2425_imwi_4.1.1", "w2425_imwi_4.1.2", "w2425_imwi_4.2", "w2425_imwi_4.3", "w2425_imwi_5", "w2425_imwi_6.1", "w2425_imwi_6.2.1", "w2425_imwi_6.2.2", "w2425_imwi_6.3", "w2425_imwi_6.4", "w2425_imwi_6.5", "w2425_imwi_6.6", "w2425_imwi_7.1.1", "w2425_imwi_7.1.2", "w2425_imwi_7.2", "w2425_imwi_7.3", "w2425_imwi_7.4", "w2425_imwi_7.5", "w2425_ksk_11", "w2425_ksk_22", "w2526_imwi_1.1", "w2526_imwi_1.2", "w2526_imwi_2.1", "w2526_imwi_2.2", "w2526_imwi_2.3", "w2526_imwi_3.1", "w2526_imwi_3.2.1", "w2526_imwi_3.2.2", "w2526_imwi_3.3.1", "w2526_imwi_3.3.2", "w2526_imwi_3.3.3", "w2526_imwi_4", "w2526_imwi_5.1", "w2526_imwi_5.2", "w2526_imwi_5.3", "w2526_imwi_6.1", "w2526_imwi_6.2", "w2526_imwi_6.3", "w2526_imwi_6.4.1", "w2526_imwi_6.4.2", "w2526_imwi_6.4.3", "w2526_imwi_6.4.4", "w2526_imwi_6.5", "w2526_imwi_7.1", "w2526_imwi_7.2", "w2526_imwi_7.3", "w2526_imwi_8.1", "w2526_imwi_8.2", "w2526_imwi_8.3", "w2526_imwi_8.4", "w2526_imwi_8.5", "w2526_imwi_8.6", "w2526_ksk_17"];
  ids.forEach(id=>{ delete P.srs['t|'+id]; delete P.res[id]; });
  P.fix2609=1; try{ localStorage.setItem(KEY,JSON.stringify(P)); }catch(e){} })();
let _svT;
function save(){ clearTimeout(_svT); _svT=setTimeout(()=>{
  try{ localStorage.setItem(KEY,JSON.stringify(P)); }
  catch(e){ toast('Speichern fehlgeschlagen – Browserspeicher voll oder blockiert.'); }
  if(typeof syLater==='function') syLater(); },140); }
function saveNow(){ clearTimeout(_svT);
  try{ const j=JSON.stringify(P);
    // zweite Kopie: falls der Hauptschlüssel je beschädigt wird
    try{ const prev=localStorage.getItem(KEY); if(prev&&prev.length>200) localStorage.setItem(KEY+'_bak',prev); }catch(e){}
    localStorage.setItem(KEY,j);
  }catch(e){}
  if(typeof syLater==='function') syLater(); }
addEventListener('beforeunload',saveNow);
addEventListener('visibilitychange',()=>{ if(document.hidden) saveNow(); });

/* ═══════════════ SRS – Lernstatus je Einheit ═══════════════ */
/* Schlüssel:  c|modul|index (Karte) · q|modul|index (Quizfrage) · t|aufgabenId (IHK-Aufgabe) */
const ck=(m,i)=>'c|'+m+'|'+i, qk=(m,i)=>'q|'+m+'|'+i, tk=id=>'t|'+id;
const IVL=[0,1,2,4,9,18,38,75];
function srs(k){ return P.srs[k]||null; }
function srsBox(k){ const s=P.srs[k]; return s?s.b:-1; }
/* Status: -1 neu · 0/1 unsicher · 2/3 fast sicher · >=4 sitzt */
function statusOf(k){ const b=srsBox(k); return b<0?'neu':b<=1?'unsicher':b<=3?'fast':'sitzt'; }
const STATL={neu:'neu',unsicher:'unsicher',fast:'fast sicher',sitzt:'sitzt'};
function grade(k,ok,partial){
  const s=P.srs[k]||{b:0,n:0,w:0,d:today(),t:0};
  s.n++; s.t=Date.now();
  if(ok){ s.b=Math.min(IVL.length-1,(s.b<0?0:s.b)+1); }
  else if(partial){ s.b=Math.max(0,s.b); s.w++; }
  else { s.b=Math.max(0,s.b-2); s.w++; }
  s.d=plusDays(today(), ok?IVL[s.b]:(s.w>=2?0:1));
  P.srs[k]=s; return s;
}
function dueList(kind){
  const out=[], t=today();
  MODS.forEach(m=>{ const L=modL(m.id);
    if(kind!=='q') L.karten.forEach((_,i)=>{ const k=ck(m.id,i), s=P.srs[k];
      if(s && s.b>=1 && s.d<=t) out.push({k,m:m.id,i,kind:'c',b:s.b}); });
    if(kind!=='c') L.mc.forEach((_,i)=>{ const k=qk(m.id,i), s=P.srs[k];
      if(s && s.b>=1 && s.d<=t) out.push({k,m:m.id,i,kind:'q',b:s.b}); });
  });
  return out.sort((a,b)=>a.b-b.b);
}
function wrongList(){
  const out=[];
  MODS.forEach(m=>{ const L=modL(m.id);
    L.mc.forEach((_,i)=>{ const s=P.srs[qk(m.id,i)]; if(s&&s.w>0&&s.b<=1) out.push({m:m.id,i,kind:'q',w:s.w}); });
    L.karten.forEach((_,i)=>{ const s=P.srs[ck(m.id,i)]; if(s&&s.w>0&&s.b<=1) out.push({m:m.id,i,kind:'c',w:s.w}); });
  });
  return out.sort((a,b)=>b.w-a.w);
}
const dueCount=()=>dueList().length;

/* ═══════════════ TEXT & MARKDOWN ═══════════════ */
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function inl(s){ return esc(s).replace(/&lt;br&gt;/gi,'<br>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/__(.+?)__/g,'<b>$1</b>'); }
function mdTable(rows){
  const c=rows.map(r=>r.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()));
  const hdr=c[1]&&c[1].every(x=>/^:?-{2,}:?$/.test(x));
  let h='<table>';
  c.forEach((r,i)=>{ if(r.every(x=>/^:?-{2,}:?$/.test(x))) return;
    const t=(hdr&&i===0)?'th':'td';
    h+='<tr>'+r.map(x=>'<'+t+'>'+inl(x)+'</'+t+'>').join('')+'</tr>'; });
  return h+'</table>';
}
const RX_PKT=/^\(\s*\d+(?:[.,]\d+)?\s*(?:Punkte?|P\.?)?\s*\)$/i;
const RX_NUM=/^[+\-–./=<>~]*\s*[\d.,]+\s*(?:€|%|m²|m2|EUR|Punkte?)?$|^[+\-–=]$|^\.\/\.$/;
const RX_RULE=/^[-–—_=]{3,}$/;
const isCalc=l=>/\S {2,}\S/.test(l)&&/\d/.test(l);
const CALLOUT=[[/^achtung[!:]?/i,'falle','Prüfungsfalle','alert'],[/^merke[!:]?/i,'merke','Merke','star'],
 [/^hinweis[!:]?/i,'merke','Hinweis','alert'],[/^beispiel[!:]?/i,'bsp','Beispiel','target'],
 [/^(bemerkung|anmerkung)[!:]?/i,'merke','Anmerkung','alert'],
 [/^(frist|fristen)[!:]?/i,'frist','Frist','clock'],[/^prüfungsfalle[!:]?/i,'falle','Prüfungsfalle','alert']];
function md(src,rich){
  const L=String(src||'').split('\n'); const out=[]; let tbl=null,calc=null,list=null,pend=false;
  const fT=()=>{ if(tbl){out.push(mdTable(tbl));tbl=null;} };
  const fL=()=>{ if(list){out.push('</'+list+'>');list=null;} };
  const fC=()=>{ if(calc){ out.push('<div class="calcwrap"><table class="calc">'+calc.join('')+'</table></div>'); calc=null; pend=false; } };
  for(const raw of L){
    const ln=raw.replace(/\s+$/,''), t=ln.trim();
    if(/^\s*\|.*\|\s*$/.test(ln)){ fL();fC(); (tbl=tbl||[]).push(ln); continue; }
    fT();
    if(!t){ fC(); fL(); continue; }
    if(RX_RULE.test(t)){ if(calc) pend=true; else {fL();out.push('<hr>');} continue; }
    if(rich!==false && isCalc(ln)){
      fL();
      let cells=ln.trim().split(/ {2,}/).map(x=>x.trim()).filter(Boolean);
      let pkt=''; if(cells.length>1&&RX_PKT.test(cells[cells.length-1])) pkt=cells.pop();
      let h='';
      cells.forEach((c,i)=>{ const num=i>0&&RX_NUM.test(c.replace(/\s+/g,' ').trim());
        h+='<td class="'+(i===0?'lbl':num?'num':'lbl')+'">'+inl(c)+'</td>'; });
      if(pkt) h+='<td class="pkt">'+esc(pkt)+'</td>';
      (calc=calc||[]).push('<tr class="'+(pend?'sum':'')+'">'+h+'</tr>'); pend=false; continue;
    }
    if(rich!==false && (calc||pend) && RX_NUM.test(t) && /\d/.test(t)){
      (calc=calc||[]).push('<tr class="sum"><td class="lbl"></td><td class="num">'+inl(t)+'</td></tr>'); pend=false; continue; }
    fC();
    let m=ln.match(/^\s*[-*•●▪]\s+(.*)$/);
    if(m){ if(list!=='ul'){fL();out.push('<ul>');list='ul';} out.push('<li>'+inl(m[1])+'</li>'); continue; }
    m=ln.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if(m && !/^\d+[.,]\d/.test(t)){ if(list!=='ol'){fL();out.push('<ol>');list='ol';} out.push('<li>'+inl(m[2])+'</li>'); continue; }
    fL();
    if(rich!==false){
      const co=CALLOUT.find(c=>c[0].test(t));
      if(co){ out.push('<div class="callout '+co[1]+'"><span class="cl">'+ic(co[3],13)+' '+co[2]+'</span>'+
        inl(t.replace(co[0],'').replace(/^[\s:–-]+/,''))+'</div>'); continue; }
      if(/=/.test(t)&&/\d/.test(t)&&t.length<115&&!/[.!?]$/.test(t)){ out.push('<div class="frmline">'+inl(t)+'</div>'); continue; }
    }
    out.push('<p>'+inl(t)+'</p>');
  }
  fT(); fL(); fC(); return out.join('');
}
const mdPlain = s => md(s,false);

/* ═══════════════ NORMALISIERUNG & BEWERTUNG (Freitext) ═══════════════ */
function norm(s){ return (s||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
  .replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim(); }
const normKey=k=>norm(k).replace(/\s+/g,'');
const PRE='(aus|ein|an|ab|auf|zu|mit|vor|nach|um|bei|her|hin|durch|ueber|unter|weiter|zurueck|fest|frei|los|statt|teil|wieder)';
const _hc=new Map();
function hayV(h){ if(_hc.has(h))return _hc.get(h);
  const b=norm(h).replace(/\s+/g,''), s=new Set([b]);
  s.add(b.replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u'));
  s.add(b.replace(new RegExp(PRE+'ge','g'),'$1')); s.add(b.replace(new RegExp(PRE+'zu','g'),'$1'));
  const a=[...s]; if(_hc.size>400)_hc.clear(); _hc.set(h,a); return a; }
function lev(a,b,max){ const n=a.length,m=b.length; if(Math.abs(n-m)>max) return max+1;
  let prev=new Array(m+1),cur=new Array(m+1);
  for(let j=0;j<=m;j++) prev[j]=j;
  for(let i=1;i<=n;i++){ cur[0]=i; let best=i;
    for(let j=1;j<=m;j++){ cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)); if(cur[j]<best)best=cur[j]; }
    if(best>max) return max+1; const t=prev; prev=cur; cur=t; }
  return prev[m]; }
const tolOf=s=>s.length<=5?0:s.length<=9?1:2;
const _wc=new Map();
function ansWords(a){ if(_wc.has(a))return _wc.get(a); const w=norm(a).split(' ').filter(Boolean);
  if(_wc.size>200)_wc.clear(); _wc.set(a,w); return w; }
function stemHit(ans,stem){
  const k=normKey(stem), k2=k.replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u');
  if(hayV(ans).some(h=>h.includes(k)||h.includes(k2))) return true;
  if(/\d/.test(k)) return false;
  const tol=tolOf(k); if(!tol) return false;
  for(const w of ansWords(ans)){
    if(w.length+tol<k.length) continue;
    for(let off=0; off+k.length-tol<=w.length && off<=7; off++)
      for(let len=k.length-tol;len<=k.length+tol;len++){
        if(off+len>w.length) break;
        if(lev(k,w.substr(off,len),tol)<=tol) return true; }
  }
  return false; }
const grpHit=(a,g)=>g.every(s=>stemHit(a,s));
const ptHit=(a,p)=>(p.keys||[]).some(g=>grpHit(a,g));
const STOP=new Set(('der die das den dem des ein eine einer eines einem einen und oder aber auch als am an auf aus bei bis durch fuer gegen hat haben hier ich im in ist kann man mit nach nicht nur ohne sich sie sind so ueber um vom von vor was wenn werden wird wie zu zum zur dass sein seine ihrer ihre dann noch beim jeweils muss muessen koennen soll sollen wurde wurden bzw ggf etc usw dabei damit dazu diese dieser dieses jede jeder jedes alle allen sowie bereits nennen geben beschreiben erlaeutern mieter vermieter').split(' '));
function cTok(t){ const o=new Set(); for(const w of norm(t).split(' ')) if(w.length>=4&&!STOP.has(w)) o.add(w.slice(0,6)); return o; }
const _pc=new Map();
function ptTok(p){ if(_pc.has(p))return _pc.get(p); const s=cTok((p.titel||'')+' '+(p.beleg||'')); _pc.set(p,s); return s; }
function nearness(ans,p){ const A=cTok(ans),B=ptTok(p); if(!B.size||!A.size) return 0;
  let h=0; B.forEach(t=>{ if(A.has(t))h++; });
  return Math.max(h/B.size, 2*h/(A.size+B.size)*1.3); }
/* Was schon in Frage oder Situation steht, beweist nichts: Solche Stichwörter
   zählen bei der Bewertung nicht. Ein Lösungspunkt, der sich nur über solche
   Wörter erkennen ließe, gilt als „nicht automatisch prüfbar". */
const _lpq=new Map();
function lpPruef(it){
  if(_lpq.has(it.id)) return _lpq.get(it.id);
  const given=(it.situation||'')+' '+(it.frage||'');
  const gTok=cTok(given);
  const res=(it.lp||[]).map(p=>{
    const keys=(p.keys||[]).filter(g=>g.length&&!grpHit(given,g));
    const tok=new Set([...ptTok(p)].filter(t=>!gTok.has(t)));
    return {keys, tok, pruefbar: keys.length>0};
  });
  const out={pts:res, gTok, auto:!it.lp_auto};
  _lpq.set(it.id,out); return out; }
function nearQ(ans,q,gTok){ if(!q.tok.size) return 0;
  const A=new Set([...cTok(ans)].filter(t=>!gTok.has(t))); if(!A.size) return 0;
  let h=0; q.tok.forEach(t=>{ if(A.has(t))h++; });
  return q.tok.size<2 ? 0 : Math.max(h/q.tok.size, 2*h/(A.size+q.tok.size)*1.3); }
/* Kann diese Aufgabe verlässlich automatisch bewertet werden? */
function autoBewertbar(it){
  if(!it.lp||!it.lp.length||it.auto===false) return false;
  const q=lpPruef(it); if(!q.auto) return false;
  const need=it.n_gefordert||Math.min(it.lp.length,3);
  return q.pts.filter(x=>x.pruefbar).length>=need; }
function gradeText(it,ans){
  const pts=it.lp||[];
  if(!autoBewertbar(it)) return {score:0,selbst:true,marks:[],nF:0,nP:0,need:0,warn:[]};
  const Q=lpPruef(it);
  // Nur echte Stichwort-Treffer zählen (mit Tippfehler- und Wortformtoleranz).
  // Bloße Wortähnlichkeit gab auch falschen Antworten halbe Punkte und entfällt.
  const marks=Q.pts.map(q=>(q.pruefbar&&q.keys.some(g=>grpHit(ans,g)))?2:0);
  const nF=marks.filter(m=>m===2).length, nP=marks.filter(m=>m===1).length;
  const need=it.n_gefordert||(pts.length?Math.min(pts.length,3):1);
  let sc=pts.length?Math.min(1,(nF+0.5*nP)/need):0;
  const warn=(it.fm||[]).filter(f=>(f.keys||[]).some(g=>grpHit(ans,g)));
  if(warn.length) sc=Math.max(0,sc-0.2*warn.length);
  if(norm(ans).replace(/\s/g,'').length<3) sc=0;
  return {score:Math.max(0,Math.min(1,sc)),marks,nF,nP,need,warn}; }
const DATE_IN=/^\s*\d{1,2}\.\d{1,2}\.\d{2,4}\s*$/;
function parseDate(s){ const m=String(s||'').match(/(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})(?!\d)/); if(!m) return null;
  let y=+m[3]; if(y<100) y+=2000; const d=+m[1], mo=+m[2];
  if(d<1||d>31||mo<1||mo>12) return null; return pad(d)+'.'+pad(mo)+'.'+y; }
/* Zulässige Zahlenwerte einer Lösung. „855,00 oder 71,25" ergibt zwei Werte.
   Folgefehler-Formeln („oder Algo …") hängen von eigenen Vorergebnissen ab und
   werden hier bewusst nicht als feste Lösung gewertet. */
function solNums(sol){ return String(sol||'').split(/\s+oder\s+/i)
  .map(x=>x.replace(/\([^)]*\)/g,'').trim())
  .filter(x=>/^-?[\d. ]+(,\d+)?\s*(€|EUR|%|m²)?$/.test(x))
  .map(x=>parseNum(x.replace(/\s/g,''))).filter(n=>!isNaN(n)); }
function decs(s){ const m=String(s).match(/,(\d+)\s*\D*$/); return m?m[1].length:0; }
function kskZahlOk(a,ansStr,b){
  if(Math.abs(a-b)<=0.011) return true;
  const db=(String(b).split('.')[1]||'').length, da=decs(ansStr);
  if(db>=3 && da>=1 && da<db){ const f=Math.pow(10,da); return Math.abs(Math.round(b*f)/f-a)<1e-9; }
  return false; }
function parseNum(s){ if(s==null)return NaN; if(DATE_IN.test(String(s))) return NaN;
  let t=String(s).replace(/[^\d,.\-]/g,'').trim(); if(!t)return NaN;
  if(t.includes(',')) t=t.replace(/\./g,'').replace(',','.');
  else if(/\.\d{3}(\D|$)/.test(t)&&!/\.\d{1,2}$/.test(t)) t=t.replace(/\./g,'');
  return parseFloat(t); }
const setOf=s=>(String(s).match(/\d+/g)||[]).map(Number).sort((a,b)=>a-b).join(';');
const seqOf=s=>(String(s).match(/\d+/g)||[]).join(';');
function gradeKsk(it,ans){
  const sol=String(it.loesung||'').trim();
  if(/keine auswertung/i.test(sol)) return {score:1,info:'Diese Aufgabe wurde in der Original-Prüfung nicht gewertet.'};
  const t=it.typ;
  if(t==='zahl'){ const a=parseNum(ans), bs=solNums(sol);
    if(isNaN(a)||!bs.length) return {score:norm(ans)===norm(sol)?1:0};
    return {score:bs.some(b=>kskZahlOk(a,ans,b))?1:0}; }
  if(t==='datum') return {score:seqOf(ans)===seqOf(sol)?1:0};
  if(t==='mc_einfach'||t==='mc_mehrfach') return {score:setOf(ans)===setOf(sol)?1:0};
  if(t==='reihenfolge') return {score:sol.split(/\s+oder\s+/i).map(seqOf).includes(seqOf(ans))?1:0};
  if(t==='buchungssatz'){ const n2=s=>{const p=String(s).split(/\ban\b/i); return p.length<2?null:setOf(p[0])+'>'+setOf(p.slice(1).join(' '));};
    const a=n2(ans),b=n2(sol); if(!b) return {score:setOf(ans)===setOf(sol)?1:0};
    if(!a) return {score:0,info:'Format: Soll an Haben, z. B. „3 an 5".'};
    return {score:a===b?1:0}; }
  if(sol.split(/\s+oder\s+/i).map(seqOf).some(x=>x&&x===seqOf(ans))) return {score:1};
  return {score:norm(ans)===norm(sol)?1:0}; }

/* ═══════════════ HILFSFUNKTIONEN ═══════════════ */
function shuffle(a,seed){ a=a.slice();
  if(seed==null){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  let s=seed>>>0||1;
  for(let i=a.length-1;i>0;i--){ s=(s*1664525+1013904223)>>>0; const j=s%(i+1); [a[i],a[j]]=[a[j],a[i]]; }
  return a; }
const hashStr=s=>{let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0;};
let _tT; function toast(m){ let e=document.querySelector('.toast');
  if(!e){ e=document.createElement('div'); e.className='toast'; e.setAttribute('role','status'); document.body.appendChild(e); }
  e.textContent=m; clearTimeout(_tT); _tT=setTimeout(()=>e.remove(),2800); }
function confetti(){ if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const c=document.createElement('div'); c.className='conf';
  const col=['#2f5cdb','#0e7a48','#e0a52a','#e0655c','#8b5cf6'];
  for(let i=0;i<64;i++){ const s=document.createElement('i');
    s.style.left=Math.random()*100+'vw'; s.style.top=(-12-Math.random()*25)+'vh';
    s.style.background=col[i%col.length]; s.style.animationDuration=(1.6+Math.random()*1.5)+'s';
    s.style.animationDelay=(Math.random()*.45)+'s'; c.appendChild(s); }
  document.body.appendChild(c); setTimeout(()=>c.remove(),3500); }
function celebrate(icon,titel,text,cb){
  confetti();
  const d=document.createElement('div'); d.className='pop'; d.setAttribute('role','dialog');
  d.innerHTML='<div class="popc"><div class="big">'+ic(icon,40)+'</div><h2>'+esc(titel)+'</h2>'+
    '<p class="muted" style="margin:0 0 20px">'+esc(text)+'</p><button class="btn lg">Weiter</button></div>';
  const close=()=>{ d.remove(); if(cb)cb(); };
  d.onclick=close; d.querySelector('button').onclick=close;
  document.body.appendChild(d); d.querySelector('button').focus();
}

/* ═══════════════ XP · LEVEL · SERIE · ABZEICHEN ═══════════════ */
const RANKS=['Azubi 1. Lehrjahr','Azubi 2. Lehrjahr','Azubi 3. Lehrjahr','Immobilien-Assistent/-in',
 'Sachbearbeiter/-in','Objektbetreuer/-in','WEG-Profi','Immobilienexperte/-in','Prüfungsprofi','Prüfungsprofi Gold'];
function levelOf(xp){ let l=1,need=150,acc=0;
  while(xp>=acc+need && l<RANKS.length*4){ acc+=need; l++; need=Math.round(need*1.16); }
  return {l,cur:xp-acc,need,rank:RANKS[Math.min(Math.floor((l-1)/2),RANKS.length-1)]}; }
function dayRec(){ if(P.day.d!==today()) P.day={d:today(),xp:0,min:0,items:0}; return P.day; }
function statRec(){ const t=today(); if(!P.stats[t]) P.stats[t]={q:0,r:0,xp:0};
  const ks=Object.keys(P.stats); if(ks.length>400) ks.sort().slice(0,ks.length-370).forEach(k=>delete P.stats[k]);
  return P.stats[t]; }
let _xpQ=0,_xpT;
function addXp(n,why){
  if(!n) return;
  const before=levelOf(P.xp).l, d=dayRec(), had=d.xp>=P.plan.min*2;
  P.xp+=n; d.xp+=n; statRec().xp+=n;
  const after=levelOf(P.xp).l;
  if(after>before) setTimeout(()=>celebrate('star','Level '+after,'Neuer Rang: '+levelOf(P.xp).rank),380);
  save(); checkBadges(); paintHeader();
  if(why){ _xpQ+=n; clearTimeout(_xpT); _xpT=setTimeout(()=>{ toast('+'+_xpQ+' XP · '+why); _xpQ=0; },300); }
}
/* Serie: zählt, sobald an einem Tag mindestens 10 Aufgaben bearbeitet wurden */
function touchStreak(){
  const d=dayRec();
  if(d.items<10 || P.streak.last===today()) return;
  const y=plusDays(today(),-1);
  if(P.streak.last===y) P.streak.n++;
  else if(P.streak.saver>0 && P.streak.last===plusDays(today(),-2)){ P.streak.saver--; P.streak.n++;
    setTimeout(()=>toast('Serienretter eingesetzt – deine Serie läuft weiter.'),600); }
  else P.streak.n=1;
  P.streak.last=today();
  P.streak.best=Math.max(P.streak.best||0,P.streak.n);
  save();
  setTimeout(()=>celebrate('flame','Tagesziel erreicht','Serie: '+P.streak.n+' '+(P.streak.n===1?'Tag':'Tage')+' in Folge.'),400);
}
function countItem(right){ const d=dayRec(); d.items++; const s=statRec(); s.q++; if(right)s.r++; touchStreak(); }
const streakNow=()=> (P.streak.last===today()||P.streak.last===plusDays(today(),-1))?P.streak.n:0;

const BADGES=[
 {id:'l1',e:'book',n:'Erste Lektion',f:()=>Object.keys(P.read).length>=1},
 {id:'l10',e:'books',n:'10 Lektionen',f:()=>Object.keys(P.read).length>=10},
 {id:'lall',e:'grad',n:'Alle Lektionen',f:()=>Object.keys(P.read).length>=totLek()},
 {id:'q1',e:'target',n:'Erste Frage',f:()=>Object.keys(P.srs).some(k=>k[0]==='q'&&P.srs[k].b>0)},
 {id:'d1',e:'cal',n:'Erstes Tagesziel',f:()=>P.streak.n>=1},
 {id:'q100',e:'hundred',n:'100 Fragen sitzen',f:()=>Object.keys(P.srs).filter(k=>k[0]==='q'&&P.srs[k].b>=2).length>=100},
 {id:'k100',e:'cards',n:'100 Karten sitzen',f:()=>Object.keys(P.srs).filter(k=>k[0]==='c'&&P.srs[k].b>=2).length>=100},
 {id:'m1',e:'medal',n:'Erster Modul-Check',f:()=>Object.keys(P.modDone).length>=1},
 {id:'m5',e:'rocket',n:'5 Module bestanden',f:()=>Object.keys(P.modDone).length>=5},
 {id:'mall',e:'crown',n:'Alle Module',f:()=>Object.keys(P.modDone).length>=MODS.length},
 {id:'s3',e:'flame',n:'3 Tage Serie',f:()=>P.streak.best>=3},
 {id:'s7',e:'bolt',n:'7 Tage Serie',f:()=>P.streak.best>=7},
 {id:'s30',e:'gem',n:'30 Tage Serie',f:()=>P.streak.best>=30},
 {id:'r25',e:'klr',n:'25 Rechenaufgaben',f:()=>ITEMS.filter(i=>isNum(i)&&(P.res[i.id]||{}).best>=0.7).length>=25},
 {id:'b25',e:'buch',n:'25 Buchungssätze',f:()=>ITEMS.filter(i=>i.typ==='buchungssatz'&&(P.res[i.id]||{}).best>=0.7).length>=25},
 {id:'e1',e:'exam',n:'Erste Simulation',f:()=>P.sims.length>=1},
 {id:'e50',e:'trophy',n:'Simulation ≥ 50 P.',f:()=>P.sims.some(s=>s.pct>=50)},
 {id:'x2000',e:'sparkle',n:'2000 XP',f:()=>P.xp>=2000},
];
function checkBadges(){ let neu=null;
  BADGES.forEach(b=>{ if(!P.badges[b.id]){ try{ if(b.f()){ P.badges[b.id]=Date.now(); neu=neu||b; } }catch(e){} } });
  if(neu){ save(); setTimeout(()=>celebrate(neu.e,'Abzeichen freigeschaltet',neu.n),560); } }
const totLek=()=>MODS.reduce((a,m)=>a+modL(m.id).lektionen.length,0);
const totKar=()=>MODS.reduce((a,m)=>a+modL(m.id).karten.length,0);
const totMc =()=>MODS.reduce((a,m)=>a+modL(m.id).mc.length,0);

/* ═══════════════ PRÜFUNGSREIFE (Lernstands-Schätzung) ═══════════════ */
function modReife(mid){
  const L=modL(mid), it=BY_MOD[mid]||[];
  const lek = L.lektionen.length ? L.lektionen.filter((_,i)=>P.read[mid+':L'+i]).length/L.lektionen.length : 1;
  let kb=0; L.karten.forEach((_,i)=>{ kb+=Math.min(1,Math.max(0,srsBox(ck(mid,i)))/3); });
  const kar = L.karten.length ? kb/L.karten.length : 1;
  let qb=0, qn=0, qr=0;
  L.mc.forEach((_,i)=>{ const s=srs(qk(mid,i)); qb+=Math.min(1,Math.max(0,s?s.b:0)/3); if(s){qn++; if(s.b>=2)qr++;} });
  const quiz = L.mc.length ? qb/L.mc.length : 1;
  const att = it.filter(i=>P.res[i.id]);
  const aufgQuote = att.length ? att.reduce((a,i)=>a+(P.res[i.id].best||0),0)/att.length : 0;
  const aufgCov   = it.length ? Math.min(1, att.length/Math.max(6,it.length*0.35)) : 1;
  const aufg = it.length ? aufgQuote*aufgCov : 0;
  const hasA = it.length>0;
  const w = hasA ? {lek:.12,kar:.16,quiz:.32,aufg:.40} : {lek:.25,kar:.30,quiz:.45,aufg:0};
  const val = lek*w.lek + kar*w.kar + quiz*w.quiz + aufg*w.aufg;
  return {val, lek, kar, quiz, aufg, aufgQuote, aufgN:att.length, aufgTot:it.length, quizN:qn, quizR:qr};
}
function bereichReife(ber){
  const ms=MODS.filter(m=>m.bereich===(ber===BER_IM?'Immobilienwirtschaft':'KSK'));
  if(!ms.length) return {val:0,mods:[]};
  const rs=ms.map(m=>({m,r:modReife(m.id)}));
  const wsum=rs.reduce((a,x)=>a+Math.max(1,x.m.n),0);
  const val=rs.reduce((a,x)=>a+x.r.val*Math.max(1,x.m.n),0)/wsum;
  return {val,mods:rs};
}
function gesamtReife(){
  const a=bereichReife(BER_IM).val, b=bereichReife(BER_KS).val;
  const rc=modReife('z_recht').val;
  // Immobilienwirtschaft zählt in der IHK-Prüfung doppelt
  let v=(a*2+b)/3;
  v=v*0.94+rc*0.06;
  // letzte Simulationen fließen leicht ein
  if(P.sims.length){ const last=P.sims.slice(-3), sim=last.reduce((x,s)=>x+s.pct,0)/last.length/100;
    v=v*0.85+sim*0.15; }
  return Math.max(0,Math.min(1,v));
}
const isNum = i => i.zahl!=null || !!i.datum || (i.bereich!==BER_IM && i.typ==='zahl' && solNums(i.loesung).length>0);

/* ═══════════════ SCHWÄCHEN ═══════════════ */
function themenStat(){
  const map={};
  const put=(th,mid,right,n)=>{ const k=th; (map[k]=map[k]||{th,mid,r:0,n:0,items:0}); map[k].r+=right; map[k].n+=n; };
  MODS.forEach(m=>{ const L=modL(m.id);
    L.mc.forEach((q,i)=>{ const s=srs(qk(m.id,i)); if(!s||!s.n) return;
      put(m.name,m.id, s.b>=2?1:0, 1); });
  });
  ITEMS.forEach(i=>{ const r=P.res[i.id]; if(!r) return;
    const m=MOD_BY[i.modul]; if(!m) return;
    put(m.name,i.modul, r.best||0, 1); });
  return Object.values(map).map(x=>({...x,q:x.n?x.r/x.n:0})).filter(x=>x.n>=4).sort((a,b)=>a.q-b.q);
}
function schwaechen(limit){
  const t=themenStat().filter(x=>x.q<0.75);
  return t.slice(0,limit||5);
}
function schwachSteps(max){
  const out=[], w=wrongList();
  w.slice(0,Math.ceil((max||14)*0.6)).forEach(x=>{
    if(x.kind==='q') out.push({k:'mc',m:x.m,i:x.i});
    else out.push({k:'card',m:x.m,i:x.i});
  });
  const weak=schwaechen(3).map(x=>x.mid);
  weak.forEach(mid=>{ const L=modL(mid);
    const cand=L.mc.map((_,i)=>i).filter(i=>{const s=srs(qk(mid,i));return !s||s.b<2;});
    shuffle(cand).slice(0,3).forEach(i=>out.push({k:'mc',m:mid,i}));
    (BY_MOD[mid]||[]).filter(i=>isNum(i)&&(!(P.res[i.id])||P.res[i.id].best<0.7)).slice(0,1)
      .forEach(it=>out.push({k:'num',id:it.id}));
  });
  return shuffle(out).slice(0,max||14);
}

/* ═══════════════ LERNPLAN ═══════════════ */
const MODORDER=['m_miet','m_weg','z_recht','m_kauf','m_bau','m_fin','m_erb','m_makl','m_mark','m_org',
 'k_buch','k_klr','k_ctrl','k_ja','k_div'];
const daysLeft=()=>Math.max(0,dayDiff(today(),P.plan.exam));
function planPos(){
  // aktuelles Modul = erstes mit ungelesenen Lektionen, sonst erstes unvollständiges
  for(const mid of MODORDER){ const L=modL(mid);
    for(let i=0;i<L.lektionen.length;i++) if(!P.read[mid+':L'+i]) return {mid,lek:i};
  }
  for(const mid of MODORDER){ const L=modL(mid);
    if(L.mc.some((_,i)=>srsBox(qk(mid,i))<2)) return {mid,lek:null};
    if((BY_MOD[mid]||[]).some(i=>!((P.res[i.id]||{}).best>=0.7))) return {mid,lek:null};
  }
  return {mid:MODORDER[0],lek:null};
}
function nextTasks(mid,count){
  const ord=t=>{const y=+((t.match(/\d{4}/)||[0])[0]);return y*2+(/Winter/.test(t)?1:0);};
  return (BY_MOD[mid]||[]).filter(i=>!((P.res[i.id]||{}).best>=0.7))
    .sort((a,b)=>ord(b.termin)-ord(a.termin)).slice(0,count||3);
}
function numTasks(mid,count){
  const pool=ITEMS.filter(i=>isNum(i)&&!((P.res[i.id]||{}).best>=0.7)&&(!mid||i.modul===mid));
  const ord=t=>{const y=+((t.match(/\d{4}/)||[0])[0]);return y*2+(/Winter/.test(t)?1:0);};
  return pool.sort((a,b)=>ord(b.termin)-ord(a.termin)).slice(0,count||2);
}

/* ═══════════════ TAGESMISSION ═══════════════ */
/* Blöcke werden pro Tag deterministisch gebaut und in P.miss gespeichert. */
const BLOCKW={warm:4,lek:10,quick:7,rech:8,wdh:6,ihk:10,buch:6,schwach:7};
function buildMission(){
  const t=today(), min=P.plan.min|0;
  const seed=hashStr(t+'|'+min);
  const pos=planPos(), mid=pos.mid, L=modL(mid), M=MOD_BY[mid];
  const blocks=[];
  const due=dueList();
  // 1 Warm-up
  if(due.length>=4||Object.keys(P.srs).length>=8)
    blocks.push({id:'warm',t:'Warm-up',s:'5 Fragen zum Aufwärmen',ic:'bolt',min:4,n:5});
  // 2 Neuer Stoff
  if(pos.lek!=null)
    blocks.push({id:'lek',t:(L.lektionen[pos.lek]||{}).titel||'Neue Lektion',s:M.name+' · lesen und anwenden',
      ic:'book',min:10,mid,lek:pos.lek});
  // 3 Schnellrunde
  blocks.push({id:'quick',t:'Schnellrunde',s:'8 Fragen aus '+M.name,ic:'target',min:7,mid,n:8});
  // 4 Rechenchallenge
  if(min>=30 && numTasks(null,1).length)
    blocks.push({id:'rech',t:'Rechenchallenge',s:'Zahlen sicher im Griff',ic:'klr',min:8,n:min>=60?3:2});
  // 5 Buchungssatz-Training (nur wenn KSK-Stoff angefangen)
  if(min>=45 && ITEMS.some(i=>i.typ==='buchungssatz'&&!((P.res[i.id]||{}).best>=0.7)) && (seed%3)!==0)
    blocks.push({id:'buch',t:'Buchungssätze',s:'Soll an Haben zusammensetzen',ic:'buch',min:6,n:min>=90?4:3});
  // 6 Wiederholung
  if(due.length) blocks.push({id:'wdh',t:'Wiederholung',s:due.length+' fällige Einheiten',ic:'flame',min:6,n:Math.min(due.length,20)});
  // 7 Schwächen
  if(min>=45 && wrongList().length>=4)
    blocks.push({id:'schwach',t:'Schwachstellen',s:'Was zuletzt schiefging',ic:'weak',min:7,n:8});
  // 7b Praxisfälle aus den neuen Übungen
  if(min>=45 && uebFaelleAll().filter(uOpen).length && (seed%2)===0)
    blocks.push({id:'fall',t:'Praxisfälle',s:'Realistische Situationen entscheiden',ic:'target',min:6,n:3});
  // 8 IHK-Aufgabe des Tages
  blocks.push({id:'ihk',t:'IHK-Aufgabe des Tages',s:'Original-Prüfungsaufgabe',ic:'exam',min:10,mid,
    n:min>=60?3:min>=30?2:1});
  // auf Zeitbudget kürzen
  const keep=[]; let sum=0;
  const prio=['warm','lek','quick','wdh','rech','fall','buch','schwach','ihk'];
  prio.forEach(id=>{ const b=blocks.find(x=>x.id===id); if(!b) return;
    if(sum+b.min<=min+6 || id==='lek'){ keep.push(b); sum+=b.min; } });
  keep.sort((a,b)=>prio.indexOf(a.id)-prio.indexOf(b.id));
  return {d:t,blocks:keep,min:sum};
}
function mission(){
  if(!P.miss||P.miss.d!==today()||P.miss.min!==P.plan.min){
    const m=buildMission(); P.miss={d:m.d,min:P.plan.min,blocks:m.blocks,done:{}}; save();
  }
  return P.miss;
}
const missDone=b=>!!(P.miss.done||{})[b.id];
function markMissionDone(id){ P.miss.done=P.miss.done||{}; P.miss.done[id]=1; save();
  const m=mission(); if(m.blocks.every(b=>missDone(b))){
    addXp(30,'Tagesmission');
    setTimeout(()=>celebrate('trophy','Tagesmission geschafft','Alle Blöcke von heute sind durch. Morgen wartet die nächste.'),350);
  } }

/* ═══════════════ WOCHENMISSIONEN ═══════════════ */
function isoWeek(){ const d=new Date(); const t=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  t.setDate(t.getDate()+3-((t.getDay()+6)%7)); const w1=new Date(t.getFullYear(),0,4);
  return t.getFullYear()+'-W'+pad(1+Math.round(((t-w1)/864e5-3+((w1.getDay()+6)%7))/7)); }
function weekMiss(){
  const w=isoWeek();
  if(!P.week||P.week.w!==w) P.week={w,days:{},q:0,sims:0,fix:0,claimed:{}};
  return P.week; }
function weekTick(kind){ const W=weekMiss(); W.days[today()]=1;
  if(kind==='q') W.q++; if(kind==='sim') W.sims++; if(kind==='fix') W.fix++; save(); }
function weekGoals(){ const W=weekMiss();
  return [ {id:'d3',t:'An 3 Tagen lernen',cur:Object.keys(W.days).length,goal:3,xp:40},
    {id:'q50',t:'50 Fragen beantworten',cur:W.q,goal:50,xp:50},
    {id:'fix',t:'10 alte Fehler korrigieren',cur:W.fix,goal:10,xp:40},
    {id:'sim',t:'1 Prüfungssimulation',cur:W.sims,goal:1,xp:60} ]; }
function claimWeek(g){ const W=weekMiss(); if(W.claimed[g.id]||g.cur<g.goal) return;
  W.claimed[g.id]=1; P.streak.saver=(P.streak.saver||0)+ (g.id==='d3'?1:0); save();
  addXp(g.xp,'Wochenziel'); toast('Wochenziel erreicht: +'+g.xp+' XP'+(g.id==='d3'?' und ein Serienretter':'')); render(); }

/* ═══════════════ ÜBUNGSTYPEN ═══════════════
   Alle Aufgaben werden ausschließlich aus den vorhandenen Daten abgeleitet:
   mc/tf  → Quizfragen der Module · match/gap/card → Karteikarten
   order/num/buch/task → Original-IHK-Aufgaben (unverändert)                     */
const KINDL={mc:'Multiple Choice',tf:'Wahr oder falsch',match:'Zuordnen',gap:'Lückentext',
 card:'Karteikarte',order:'Reihenfolge',num:'Rechenaufgabe',buch:'Buchungssatz',task:'Original-IHK-Aufgabe',
 unum:'Rechen-Übung',fall:'Praxisfall'};
/* Herkunft: ihk = Original-Prüfungsaufgabe · gen = aus verifizierten Inhalten erstellt · ueb = Übungsaufgabe */
const SRCL={ihk:['ihk','Original-IHK'],gen:['gen','Übung'],ueb:['ueb','Übungsaufgabe']};
function srcTag(kind,step){
  if(kind==='order'||kind==='num'||kind==='buch'||kind==='task') return SRCL.ihk;
  if(kind==='unum'||kind==='fall') return SRCL.ueb;
  return SRCL.gen;
}
function xpFor(kind,box,score){
  const base={mc:5,tf:4,match:6,gap:6,card:2,order:8,num:10,buch:8,task:12,unum:10,fall:8}[kind]||4;
  const fresh = box<2 ? 1 : box<4 ? 0.4 : 0.2;     // verhindert XP-Farming
  return Math.max(1,Math.round(base*fresh*(score==null?1:score)));
}
/* ---------- Multiple Choice ---------- */
function mkMC(st){
  const L=modL(st.m), q=L.mc[st.i]; if(!q) return null;
  const ord=shuffle([0,1,2], st.i*7+hashStr(st.m));
  return {kind:'mc', key:qk(st.m,st.i), mod:st.m, lek:q.lektion,
    q:md(q.frage),
    ctx: q.situation ? '<b>Ausgangslage:</b> '+md(q.situation) : '',
    body:'<div id="opts">'+ord.map((oi,n)=>'<button class="opt" data-o="'+oi+'"><span class="k">'+'ABC'[n]+'</span><span>'+inl(q.optionen[oi])+'</span></button>').join('')+'</div>',
    bind(root,done){ root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const ch=+b.dataset.o, right=ch===q.richtig;
      root.querySelectorAll('.opt').forEach(x=>{ x.disabled=true;
        if(+x.dataset.o===q.richtig) x.classList.add('right'); else if(x===b) x.classList.add('wrong'); });
      done({right, score:right?1:0,
        fh:right?'Richtig':'Noch nicht', warum:q.erklaerung||'',
        deine:right?'':inl(q.optionen[ch]), loesung:inl(q.optionen[q.richtig])});
    }); } };
}
/* ---------- Wahr oder falsch (aus Quizfragen abgeleitet) ---------- */
function mkTF(st){
  const L=modL(st.m), q=L.mc[st.i]; if(!q) return null;
  const useRight=(hashStr(st.m+st.i)%2)===0;
  const wrongIdx=[0,1,2].filter(x=>x!==q.richtig);
  const oi=useRight?q.richtig:wrongIdx[hashStr(st.m+'x'+st.i)%wrongIdx.length];
  const soll=useRight;
  return {kind:'tf', key:qk(st.m,st.i), mod:st.m, lek:q.lektion,
    ctx:(q.situation?'<b>Ausgangslage:</b> '+md(q.situation)+'<br>':'')+'<b>Frage:</b> '+esc(q.frage),
    q:'<p>Ist diese Antwort richtig?</p><p style="font-weight:700;color:var(--txt)">'+inl(q.optionen[oi])+'</p>',
    body:'<div class="tf"><button data-v="1">'+ic('check',22)+'RICHTIG</button><button data-v="0">'+ic('x',22)+'FALSCH</button></div>',
    bind(root,done){ root.querySelectorAll('.tf button').forEach(b=>b.onclick=()=>{
      const v=b.dataset.v==='1', right=(v===soll);
      root.querySelectorAll('.tf button').forEach(x=>{ x.disabled=true; });
      b.classList.add(right?'right':'wrong');
      done({right,score:right?1:0, fh:right?'Richtig':'Noch nicht',
        warum:(soll?'Diese Antwort ist richtig. ':'Diese Antwort ist falsch. ')+(q.erklaerung||''),
        loesung:'Die richtige Antwort auf die Frage lautet: '+inl(q.optionen[q.richtig])});
    }); } };
}
/* ---------- Zuordnen (Karteikarten) ---------- */
function mkMatch(st){
  const L=modL(st.m); const idx=st.idx||[]; if(idx.length<3) return null;
  const cards=idx.map(i=>({i,c:L.karten[i]})).filter(x=>x.c);
  if(cards.length<3) return null;
  const rights=shuffle(cards,hashStr(st.m+'m'+idx[0]));
  return {kind:'match', keys:cards.map(x=>ck(st.m,x.i)), mod:st.m,
    q:'<p>Ordne jeden Begriff seiner Erklärung zu.</p>', ctx:'',
    body:'<div class="match"><div class="mcol" id="ml">'+
      cards.map((x,n)=>'<button class="mchip" data-l="'+n+'">'+esc(x.c.v)+'</button>').join('')+
      '</div><div class="mcol" id="mr">'+
      rights.map((x,n)=>'<button class="mchip" data-r="'+n+'">'+esc(x.c.r)+'</button>').join('')+'</div></div>',
    bind(root,done){
      let sel=null, pairs=0, wrongN=0;
      const ls=[...root.querySelectorAll('[data-l]')], rs=[...root.querySelectorAll('[data-r]')];
      const finish=()=>{ const score=Math.max(0,(cards.length-wrongN)/cards.length);
        cards.forEach((x,n)=>grade(ck(st.m,x.i), score>=0.999, score>0.4));
        done({right:wrongN===0, score, fh:wrongN===0?'Alles richtig zugeordnet':(wrongN+' Zuordnung'+(wrongN>1?'en':'')+' saß'+(wrongN>1?'en':'')+' nicht'),
          warum:'', skipKeys:true}); };
      const pick=(el,side)=>{ if(el.classList.contains('paired')) return;
        if(!sel){ sel={el,side}; el.classList.add('sel'); return; }
        if(sel.side===side){ sel.el.classList.remove('sel'); sel={el,side}; el.classList.add('sel'); return; }
        const l=side==='l'?el:sel.el, r=side==='r'?el:sel.el;
        sel.el.classList.remove('sel');
        const li=+l.dataset.l, ri=+r.dataset.r;
        const ok=cards[li].i===rights[ri].i;
        if(ok){ pairs++; l.classList.add('paired'); r.classList.add('paired'); l.disabled=true; r.disabled=true;
          l.insertAdjacentHTML('beforeend','<span class="pn">✓</span>'); }
        else { wrongN++; l.classList.add('miss'); r.classList.add('miss');
          setTimeout(()=>{l.classList.remove('miss');r.classList.remove('miss');},520); }
        sel=null;
        if(pairs===cards.length) setTimeout(finish,260);
      };
      ls.forEach(e=>e.onclick=()=>pick(e,'l')); rs.forEach(e=>e.onclick=()=>pick(e,'r'));
    } };
}
/* ---------- Lückentext (aus Karteikarten) ---------- */
function gapOf(mod,i){
  const c=modL(mod).karten[i]; if(!c) return null;
  const term=c.v.split(/[(/,–-]/)[0].trim();
  if(term.length<5) return null;
  const stem=term.slice(0,Math.max(5,Math.floor(term.length*0.7)));
  const rx=new RegExp(stem.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-zäöüß]*','i');
  if(!rx.test(c.r)) return null;
  return {text:c.r.replace(rx,'_____'), term, card:c};
}
function mkGap(st){
  const g=gapOf(st.m,st.i); if(!g) return null;
  return {kind:'gap', key:ck(st.m,st.i), mod:st.m,
    q:'<p>Welcher Begriff gehört in die Lücke?</p>', ctx:'',
    body:'<p style="font-size:16.5px;line-height:1.7;margin:0 0 16px">'+esc(g.text)+'</p>'+
      '<input type="text" id="gi" placeholder="Begriff eintippen…" autocomplete="off" autocapitalize="off" spellcheck="false">'+
      '<div class="row" style="margin-top:12px"><button class="btn" id="gs">Prüfen</button></div>',
    bind(root,done){ const inp=root.querySelector('#gi'); inp.focus();
      const sub=()=>{ const v=inp.value.trim(); if(!v) return toast('Bitte etwas eintippen.');
        const right=stemHit(v,g.term.slice(0,Math.max(5,g.term.length-2)));
        inp.disabled=true;
        done({right,score:right?1:0, fh:right?'Richtig':'Noch nicht',
          deine:right?'':esc(v), loesung:esc(g.term), warum:esc(g.card.r)}); };
      root.querySelector('#gs').onclick=sub;
      inp.onkeydown=e=>{ if(e.key==='Enter') sub(); }; } };
}
/* ---------- Karteikarte ---------- */
function mkCard(st){
  const c=modL(st.m).karten[st.i]; if(!c) return null;
  return {kind:'card', key:ck(st.m,st.i), mod:st.m, noAuto:true,
    q:'', ctx:'',
    body:'<div class="flip" id="fl"><div class="flipin">'+
      '<div class="face"><div class="lbl">Begriff</div><div class="v">'+esc(c.v)+'</div>'+
      '<p class="muted small" style="margin-top:22px">Tippen zum Umdrehen</p></div>'+
      '<div class="face back"><div class="lbl">Erklärung</div><div class="r">'+inl(c.r)+'</div></div></div></div>'+
      '<div class="row" id="crate" style="justify-content:center"><button class="btn sec" id="cshow">Antwort zeigen</button></div>',
    bind(root,done){
      const fl=root.querySelector('#fl');
      const showRate=()=>{ root.querySelector('#crate').innerHTML=
        '<button class="btn sec" id="cno">Nochmal üben</button><button class="btn" id="cyes">Gewusst</button>';
        root.querySelector('#cno').onclick=()=>done({right:false,score:0,silent:true});
        root.querySelector('#cyes').onclick=()=>done({right:true,score:1,silent:true}); };
      const flip=()=>{ if(fl.classList.contains('on')) return; fl.classList.add('on'); setTimeout(showRate,240); };
      fl.onclick=flip; root.querySelector('#cshow').onclick=flip; } };
}
/* ---------- Reihenfolge (Original-IHK-Aufgabe) ---------- */
function mkOrder(st){
  const it=BY_ID[st.id]; if(!it||!it.optionen||!it.optionen.length) return null;
  const sol=seqOf(String(it.loesung).split(/\s+oder\s+/i)[0]).split(';').map(Number);
  if(sol.length<2) return null;
  let cur=shuffle(it.optionen.map(o=>o.nr), hashStr(st.id));
  return {kind:'order', key:tk(it.id), item:it, mod:it.modul,
    ctx: it.situation? '<b>Situation:</b> '+esc(it.situation.slice(0,340))+(it.situation.length>340?'…':'') : '',
    q: md(it.frage),
    body:'<div class="sortl" id="sl"></div><div class="row" style="margin-top:14px"><button class="btn" id="os">Reihenfolge prüfen</button></div>',
    bind(root,done){
      const box=root.querySelector('#sl');
      const txt=nr=>(it.optionen.find(o=>o.nr===nr)||{}).text||('#'+nr);
      const draw=()=>{ box.innerHTML=cur.map((nr,i)=>
        '<div class="sorti" data-p="'+i+'"><span class="sn">'+(i+1)+'</span><span class="st">'+esc(txt(nr))+'</span>'+
        '<span class="sb"><button data-u="'+i+'" aria-label="nach oben"'+(i===0?' disabled':'')+'>'+ic('up',13)+'</button>'+
        '<button data-d="'+i+'" aria-label="nach unten"'+(i===cur.length-1?' disabled':'')+'>'+ic('down',13)+'</button></span></div>').join('');
        box.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{const i=+b.dataset.u;[cur[i-1],cur[i]]=[cur[i],cur[i-1]];draw();});
        box.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const i=+b.dataset.d;[cur[i+1],cur[i]]=[cur[i],cur[i+1]];draw();}); };
      draw();
      root.querySelector('#os').onclick=()=>{
        const right=cur.join(';')===sol.join(';');
        let n=0; cur.forEach((nr,i)=>{ if(nr===sol[i])n++; });
        const score=right?1:Math.max(0,(n/sol.length)*0.6);
        box.querySelectorAll('.sorti').forEach((el,i)=>{ el.classList.add(cur[i]===sol[i]?'right':'wrong');
          el.querySelectorAll('button').forEach(b=>b.disabled=true); });
        root.querySelector('#os').disabled=true;
        done({right,score,fh:right?'Genau richtig':(n+' von '+sol.length+' an der richtigen Stelle'),
          loesung:sol.map((nr,i)=>(i+1)+'. '+esc(txt(nr))).join('<br>'),
          warum:it.erklaerung||''}); }; } };
}
/* ---------- Rechenaufgabe (Original-IHK-Aufgabe) ---------- */
function mkNum(st){
  const it=BY_ID[st.id]; if(!it) return null;
  if(it.datum) return mkDatum(it);
  const alts = it.zahl!=null ? [it.zahl] : (it.bereich!==BER_IM && it.typ==='zahl' ? solNums(it.loesung) : []);
  if(!alts.length) return null;
  const soll=alts[0];
  const tolOf=a=> Math.max(0.011, Math.abs(a)*0.000001);   // 1 Cent Rundungsdifferenz
  const tol=tolOf(soll);
  const einheit = it.einheit || (/€/.test(String(it.ergebnis||it.loesung))?'€':/%/.test(String(it.ergebnis||it.loesung))?'%':'');
  const hint=String(it.loesung||'').split('\n').filter(x=>x.trim()).slice(0,2).join(' · ').slice(0,180);
  return {kind:'num', key:tk(it.id), item:it, mod:it.modul,
    ctx: it.situation? '<b>Situation:</b> '+esc(it.situation.slice(0,520))+(it.situation.length>520?'…':'') : '',
    q: md(it.frage),
    body:'<div class="numin"><input type="text" inputmode="decimal" id="ni" placeholder="0,00" autocomplete="off">'+
      (einheit?'<span class="un">'+esc(einheit)+'</span>':'')+'</div>'+
      '<div class="row" style="margin-top:14px"><button class="btn" id="ns">Ergebnis prüfen</button>'+
      (hint?'<button class="btn ghost sm" id="nh">Hinweis</button>':'')+'</div><div id="nhb"></div>',
    bind(root,done){
      const inp=root.querySelector('#ni'); inp.focus();
      const hb=root.querySelector('#nh');
      if(hb) hb.onclick=()=>{ root.querySelector('#nhb').innerHTML=
        '<div class="callout formel" style="margin-top:12px"><span class="cl">'+ic('alert',12)+' Ansatz</span>'+esc(hint)+'</div>';
        hb.disabled=true; };
      const sub=()=>{ if(DATE_IN.test(inp.value)) return toast('Hier ist ein Betrag gefragt, kein Datum.');
        const v=parseNum(inp.value); if(isNaN(v)) return toast('Bitte eine Zahl eintragen.');
        const diff=Math.abs(v-soll), right= it.zahl!=null ? alts.some(a=>Math.abs(v-a)<=tolOf(a))
                                                          : alts.some(a=>kskZahlOk(v,inp.value,a));
        const nah=!right && diff<=Math.abs(soll)*0.05;
        inp.disabled=true; root.querySelector('#ns').disabled=true;
        done({right, score:right?1:(nah?0.35:0),
          fh:right?'Richtig gerechnet':(nah?'Knapp daneben':'Noch nicht'),
          deine:right?'':fmtNum(v)+(einheit?' '+einheit:''),
          loesung:alts.map(a=>fmtNum(a)+(einheit?' '+einheit:'')).join(' oder '),
          rechenweg:it.loesung, warum:it.erklaerung||''}); };
      root.querySelector('#ns').onclick=sub;
      inp.onkeydown=e=>{ if(e.key==='Enter') sub(); }; } };
}
/* ---------- Datumsaufgabe (Original-IHK-Aufgabe) ---------- */
function mkDatum(it){
  const soll=parseDate(it.datum); if(!soll) return null;
  return {kind:'num', key:tk(it.id), item:it, mod:it.modul,
    ctx: it.situation? '<b>Situation:</b> '+esc(it.situation.slice(0,520))+(it.situation.length>520?'…':'') : '',
    q: md(it.frage),
    body:'<div class="numin"><input type="text" inputmode="decimal" id="ni" placeholder="TT.MM.JJJJ" autocomplete="off"></div>'+
      '<div class="row" style="margin-top:14px"><button class="btn" id="ns">Datum prüfen</button></div>',
    bind(root,done){
      const inp=root.querySelector('#ni'); inp.focus();
      const sub=()=>{ const v=parseDate(inp.value);
        if(!v) return toast('Bitte ein Datum im Format TT.MM.JJJJ eintragen.');
        const right=v===soll;
        inp.disabled=true; root.querySelector('#ns').disabled=true;
        done({right, score:right?1:0, fh:right?'Richtiges Datum':'Falsches Datum',
          deine:right?'':v, loesung:soll, rechenweg:it.loesung, warum:it.erklaerung||''}); };
      root.querySelector('#ns').onclick=sub;
      inp.onkeydown=e=>{ if(e.key==='Enter') sub(); }; } };
}
const fmtNum=n=>(Math.abs(n)>=1000||n%1!==0)?n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}):String(n).replace('.',',');
/* ---------- Buchungssatz-Trainer (Original-IHK-Aufgabe) ---------- */
function mkBuch(st){
  const it=BY_ID[st.id]; if(!it||!it.optionen||!it.optionen.length) return null;
  const sol=String(it.loesung); const parts=sol.split(/\ban\b/i); if(parts.length<2) return null;
  const solS=setOf(parts[0]).split(';').filter(Boolean).map(Number);
  const solH=setOf(parts.slice(1).join(' ')).split(';').filter(Boolean).map(Number);
  if(!solS.length||!solH.length) return null;
  const konto=nr=>{ const o=it.optionen.find(x=>x.nr===nr); return o?o.text:('#'+nr); };
  return {kind:'buch', key:tk(it.id), item:it, mod:it.modul,
    ctx: it.situation? '<b>Beleg / Sachverhalt:</b> '+esc(it.situation.slice(0,620))+(it.situation.length>620?'…':'') : '',
    q: md(it.frage),
    body:'<div class="bpick"><button id="pS" aria-pressed="true">Soll auswählen</button><button id="pH" aria-pressed="false">Haben auswählen</button></div>'+
      '<div class="buch" style="margin-top:12px">'+
      '<div class="bside s"><div class="bl">Soll</div><div class="bslots" id="slS"><span class="bempty">noch leer</span></div></div>'+
      '<div class="bside h"><div class="bl">Haben</div><div class="bslots" id="slH"><span class="bempty">noch leer</span></div></div></div>'+
      '<p class="small muted" style="margin:14px 0 6px">Konten – erst Seite wählen, dann Konto antippen:</p>'+
      '<div class="bkonten" id="bk">'+it.optionen.map(o=>'<button class="bk" data-nr="'+o.nr+'"><span class="bnr">'+o.nr+'</span>'+esc(o.text)+'</button>').join('')+'</div>'+
      '<div class="row" style="margin-top:16px"><button class="btn" id="bs">Buchungssatz prüfen</button></div>',
    bind(root,done){
      let side='S'; const pick={S:[],H:[]};
      const pS=root.querySelector('#pS'), pH=root.querySelector('#pH');
      const setSide=s=>{ side=s; pS.setAttribute('aria-pressed',s==='S'); pH.setAttribute('aria-pressed',s==='H'); };
      pS.onclick=()=>setSide('S'); pH.onclick=()=>setSide('H');
      const draw=()=>{ ['S','H'].forEach(s=>{ const el=root.querySelector('#sl'+s);
          el.innerHTML = pick[s].length ? pick[s].map(nr=>'<span class="bslot"><span class="bnr">'+nr+'</span>'+esc(konto(nr).slice(0,34))+
            '<button data-rm="'+s+'|'+nr+'" aria-label="entfernen">'+ic('x',13)+'</button></span>').join('') : '<span class="bempty">noch leer</span>'; });
        root.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ const [s,nr]=b.dataset.rm.split('|');
          pick[s]=pick[s].filter(x=>x!==+nr); draw(); });
        root.querySelectorAll('.bk').forEach(b=>{ const nr=+b.dataset.nr;
          b.disabled = pick.S.includes(nr)||pick.H.includes(nr); }); };
      root.querySelectorAll('.bk').forEach(b=>b.onclick=()=>{ const nr=+b.dataset.nr;
        if(pick.S.includes(nr)||pick.H.includes(nr)) return; pick[side].push(nr); draw(); if(side==='S'&&pick.S.length>=solS.length) setSide('H'); });
      draw();
      root.querySelector('#bs').onclick=()=>{
        if(!pick.S.length||!pick.H.length) return toast('Bitte beide Seiten belegen.');
        const eq=(a,b)=>a.slice().sort((x,y)=>x-y).join(';')===b.slice().sort((x,y)=>x-y).join(';');
        const okS=eq(pick.S,solS), okH=eq(pick.H,solH), right=okS&&okH;
        root.querySelector('#bs').disabled=true;
        root.querySelectorAll('.bk').forEach(b=>b.disabled=true);
        done({right, score:right?1:(okS||okH?0.4:0),
          fh:right?'Buchungssatz stimmt':(okS?'Soll stimmt, Haben nicht':okH?'Haben stimmt, Soll nicht':'Noch nicht'),
          deine:right?'':pick.S.map(konto).join(' + ')+' an '+pick.H.map(konto).join(' + '),
          loesung:'<b>Soll:</b> '+solS.map(n=>konto(n)).join(' + ')+'<br><b>Haben:</b> '+solH.map(n=>konto(n)).join(' + ')+
            '<br><span class="mono" style="color:var(--muted)">'+esc(sol)+'</span>',
          warum:it.erklaerung||''}); }; } };
}
/* ---------- Original-IHK-Aufgabe (Freitext / gebunden) ---------- */
function mkTask(st){
  const it=BY_ID[st.id]; if(!it) return null;
  const free=['freitext','rechnen','tabelle'].includes(it.typ)&&it.bereich===BER_IM;
  let body;
  if(it.ohne_loesung||free) body='<textarea id="ta" placeholder="Deine Antwort – Stichpunkte genügen, wie in der echten Prüfung…"></textarea>';
  else if(it.optionen&&it.optionen.length){ const multi=it.typ==='mc_mehrfach';
    body='<div id="opts">'+it.optionen.map(o=>'<label class="opt"><input type="'+(multi?'checkbox':'radio')+'" name="oo" value="'+o.nr+'" style="margin-top:4px;accent-color:var(--acc)"><span class="k">'+o.nr+'</span><span>'+esc(o.text)+'</span></label>').join('')+'</div>'+
      (multi?'<p class="small muted">Mehrfachauswahl möglich.</p>':''); }
  else { const h=it.typ==='buchungssatz'?'z. B. 3 an 5':it.typ==='reihenfolge'?'z. B. 3;1;4;2':
      it.typ==='datum'?'TT.MM.JJJJ':it.typ==='zuordnung'?'z. B. 2;6;4':'Zahlenwert, z. B. 1.234,56';
    body='<input type="text" id="ti" placeholder="'+h+'" autocomplete="off"><p class="small muted" style="margin-top:6px">'+h+'</p>'; }
  return {kind:'task', key:tk(it.id), item:it, mod:it.modul, orig:true,
    ctx: it.situation ? '<div class="sit" id="sit">'+md(it.situation)+'</div>' : '',
    q: md(it.frage),
    body: (it.warn||[]).map(w=>'<div class="rwarn">'+ic('alert',15)+' <b>Rechtsstand '+esc(w.t)+':</b> '+esc(w.h)+'</div>').join('')
      + body + '<div class="row" style="margin-top:14px"><button class="btn" id="ts">Antwort prüfen</button></div>',
    bind(root,done){
      const ta=root.querySelector('#ta'), ti=root.querySelector('#ti');
      if(ta) ta.focus(); if(ti) ti.focus();
      const getA=()=> ta?ta.value : ti?ti.value : [...root.querySelectorAll('input:checked')].map(x=>x.value).join(';');
      const sub=()=>{ const ans=getA(); if(!String(ans).trim()) return toast('Bitte erst etwas eintragen.');
        let g;
        if(it.ohne_loesung) g={score:0,keine:true};
        else if(free) g=gradeText(it,ans);
        else g=gradeKsk(it,ans);
        root.querySelector('#ts').disabled=true;
        root.querySelectorAll('input').forEach(x=>x.disabled=true); if(ta)ta.disabled=true; if(ti)ti.disabled=true;
        if(!free && it.optionen) root.querySelectorAll('.opt').forEach(l=>{
          const rt=setOf(it.loesung).split(';').includes(l.querySelector('input').value);
          if(rt) l.classList.add('right'); else if(l.querySelector('input').checked) l.classList.add('wrong'); });
        done({right:g.score>=0.95, score:g.score, task:true, g, it, ans}); }; 
      root.querySelector('#ts').onclick=sub;
      if(ti) ti.onkeydown=e=>{ if(e.key==='Enter') sub(); };
      if(ta) ta.onkeydown=e=>{ if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)) sub(); };
      const sit=root.querySelector('#sit');
      if(sit && sit.scrollHeight>sit.clientHeight+4){
        const b=document.createElement('button'); b.className='btn ghost sm'; b.style.margin='-8px 0 14px';
        b.textContent='Situation ganz anzeigen';
        b.onclick=()=>{ sit.classList.toggle('open'); b.textContent=sit.classList.contains('open')?'Situation einklappen':'Situation ganz anzeigen'; };
        sit.after(b); } } };
}
/* ---------- Rechen-Übung (neu erstellt, keine IHK-Aufgabe) ---------- */
function mkUNum(st){
  const M=modL(st.m), u=(M.ueb&&M.ueb.rechnen||[]).find(x=>x.id===st.id); if(!u) return null;
  return {kind:'unum', key:'u|'+u.id, mod:st.m, lek:u.lektion, uid:u.id,
    ctx: u.situation? '<b>Ausgangsdaten:</b> '+esc(u.situation) : '',
    q: md(u.frage),
    body:'<div class="numin"><input type="text" inputmode="decimal" id="ni" placeholder="0,00" autocomplete="off">'+
      (u.einheit?'<span class="un">'+esc(u.einheit)+'</span>':'')+'</div>'+
      '<div class="row" style="margin-top:14px"><button class="btn" id="ns">Ergebnis prüfen</button></div>',
    bind(root,done){ const inp=root.querySelector('#ni'); inp.focus();
      const sub=()=>{ if(DATE_IN.test(inp.value)) return toast('Hier ist ein Betrag gefragt, kein Datum.');
        const v=parseNum(inp.value); if(isNaN(v)) return toast('Bitte eine Zahl eintragen.');
        const tol=Math.max(0.011, Math.abs(u.zahl)*0.000001);   // 1 Cent / 0,01 Prozentpunkt
        const right=Math.abs(v-u.zahl)<=tol, nah=!right&&Math.abs(v-u.zahl)<=Math.abs(u.zahl)*0.05;
        inp.disabled=true; root.querySelector('#ns').disabled=true;
        done({right,score:right?1:(nah?0.35:0),
          fh:right?'Richtig gerechnet':(nah?'Knapp daneben':'Noch nicht'),
          deine:right?'':fmtNum(v)+(u.einheit?' '+u.einheit:''),
          loesung:fmtNum(u.zahl)+(u.einheit?' '+u.einheit:''),
          rechenweg:u.rechenweg}); };
      root.querySelector('#ns').onclick=sub;
      inp.onkeydown=e=>{ if(e.key==='Enter') sub(); }; } };
}
/* ---------- Praxisfall (neu erstellt, keine IHK-Aufgabe) ---------- */
function mkFall(st){
  const M=modL(st.m), u=(M.ueb&&M.ueb.faelle||[]).find(x=>x.id===st.id); if(!u) return null;
  const ord=shuffle([0,1,2], hashStr(u.id));
  return {kind:'fall', key:'u|'+u.id, mod:st.m, lek:u.lektion, uid:u.id,
    ctx: u.situation? '<b>Situation:</b> '+esc(u.situation) : '',
    q: md(u.frage),
    body:'<div id="opts">'+ord.map((oi,k)=>'<button class="opt" data-o="'+oi+'"><span class="k">'+'ABC'[k]+
      '</span><span>'+inl(u.optionen[oi])+'</span></button>').join('')+'</div>',
    bind(root,done){ root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const ch=+b.dataset.o, right=ch===u.richtig;
      root.querySelectorAll('.opt').forEach(x=>{ x.disabled=true;
        if(+x.dataset.o===u.richtig) x.classList.add('right'); else if(x===b) x.classList.add('wrong'); });
      done({right,score:right?1:0,fh:right?'Richtig entschieden':'Noch nicht',
        deine:right?'':inl(u.optionen[ch]), loesung:inl(u.optionen[u.richtig]), warum:u.erklaerung||''}); }); } };
}
const MAKERS={unum:mkUNum,fall:mkFall,mc:mkMC,tf:mkTF,match:mkMatch,gap:mkGap,card:mkCard,order:mkOrder,num:mkNum,buch:mkBuch,task:mkTask};
function makeStep(st){ const f=MAKERS[st.k]; if(!f) return null; try{ return f(st); }catch(e){ return null; } }

/* ═══════════════ ÜBUNGS-RUNNER ═══════════════ */
let RUN=null;
function startRun(steps,opts){
  steps=(steps||[]).filter(Boolean);
  if(!steps.length){ toast('Hier ist gerade nichts zu üben.'); return; }
  RUN={steps,i:0,res:[],ok:0,combo:0,best:0,t0:Date.now(),
       title:(opts&&opts.title)||'Übung', back:(opts&&opts.back)||{p:'heute'},
       onDone:(opts&&opts.onDone)||null, missId:(opts&&opts.missId)||null, mode:'lern'};
  go('run');
}
function pRun(){
  if(!RUN) return go('heute');
  if(RUN.i>=RUN.steps.length) return runEnd();
  const S=makeStep(RUN.steps[RUN.i]);
  if(!S){ RUN.i++; return render(); }
  RUN.cur=S;
  const pct=Math.round(RUN.i/RUN.steps.length*100);
  V.innerHTML='<div class="stage">'+
   '<div class="qtop"><button class="btn ghost sm" id="rq" aria-label="Übung beenden">'+ic('x',14)+'</button>'+
   '<span class="qprog"><span class="bar sm"><i style="width:'+pct+'%"></i></span></span>'+
   '<span class="small muted nums">'+(RUN.i+1)+' / '+RUN.steps.length+'</span></div>'+
   '<div class="qbox">'+
    '<div class="qsrc">'+(function(){const t=srcTag(S.kind,S);
      return '<span class="src '+t[0]+'">'+t[1]+'</span><span class="qkind">'+esc(KINDL[S.kind]||'')+'</span>'+
      (S.item?'<span class="small muted">'+esc(S.item.termin)+' · Aufgabe '+esc(S.item.nr)+
        (S.item.punkte?' · '+esc(String(S.item.punkte))+' Punkte':'')+'</span>':'');})()+'</div>'+
    (S.ctx?(S.ctx.indexOf('<div')===0?S.ctx:'<div class="qctx">'+S.ctx+'</div>'):'')+
    (S.q?'<div class="qtx">'+S.q+'</div>':'')+
    '<div id="ansbox">'+S.body+'</div><div id="fbbox"></div>'+
   '</div></div>';
  V.querySelector('#rq').onclick=()=>quitRun();
  S.bind(V.querySelector('#ansbox'), r=>answer(S,r));
}
function quitRun(){ const b=RUN&&RUN.back; RUN=null; go((b&&b.p)||'heute',b); }
function answer(S,r){
  const first = S.key ? srsBox(S.key)<2 : true;
  let xp=0;
  if(!S.skipSrs && S.key && !r.skipKeys) grade(S.key, r.right, r.score>0.4&&!r.right);
  if(S.kind==='task'&&S.item){ const p=P.res[S.item.id]||{n:0,best:0};
    p.n++; p.best=Math.max(p.best||0,r.score||0); p.last=Date.now(); P.res[S.item.id]=p; }
  if(S.item && S.kind!=='task'){ const p=P.res[S.item.id]||{n:0,best:0};
    p.n++; p.best=Math.max(p.best||0,r.score||0); p.last=Date.now(); P.res[S.item.id]=p; }
  if(!r.silent||r.right) xp=xpFor(S.kind, first?0:srsBox(S.key||''), r.score);
  if(xp) addXp(xp);
  countItem(r.right); weekTick('q');
  if(!r.right && S.key && (srs(S.key)||{}).w>=1) weekTick('fix');
  RUN.res.push({kind:S.kind,score:r.score||0,right:!!r.right,mod:S.mod,key:S.key,id:S.item&&S.item.id});
  if(r.right){ RUN.ok++; RUN.combo++; RUN.best=Math.max(RUN.best,RUN.combo);
    if(RUN.combo===5||RUN.combo===10||RUN.combo===15) showCombo(RUN.combo); }
  else RUN.combo=0;
  save();
  if(r.silent){ RUN.i++; return render(); }
  renderFB(S,r,xp);
}
function showCombo(n){ if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const d=document.createElement('div'); d.className='combo'; d.textContent=n+' richtige in Folge';
  document.body.appendChild(d); setTimeout(()=>d.remove(),1300); }
function renderFB(S,r,xp){
  const box=V.querySelector('#fbbox');
  const cls = r.task ? ((r.g.keine||r.g.selbst)?'part':r.score>=0.95?'ok':r.score>=0.4?'part':'bad')
                     : (r.right?'ok':r.score>0.3?'part':'bad');
  let h='';
  if(r.task){
    const g=r.g, it=r.it;
    const head = g.selbst?'Vergleiche mit der Musterlösung' : g.keine?'Bewerte dich selbst'
      : g.score>=0.95?'Richtig':g.score>=0.7?'Fast vollständig':g.score>=0.4?'Teilweise richtig':g.score>0?'Ansatz erkennbar':'Noch nicht';
    h+='<div class="fh">'+ic(g.score>=0.95?'check':'alert',18)+head+((g.keine||g.selbst)?'':' · '+Math.round(g.score*100)+' %')+'</div>';
    if(g.selbst) h+='<p>Diese Aufgabe lässt sich nicht zuverlässig über Stichwörter bewerten. Lies die offizielle Musterlösung unten und entscheide ehrlich selbst.</p>';
    else if(g.keine) h+='<p>Zu dieser Aufgabe liegt in deinen Unterlagen keine offizielle Musterlösung vor. Vergleiche selbst und wert dich unten.</p>';
    else if(!g.selbst&&it.lp&&it.lp.length){
      const pk=it.punkte&&/^\d/.test(String(it.punkte))?parseFloat(it.punkte):null;
      h+='<p>'+g.nF+' von '+g.need+' geforderten Punkten sicher erkannt'+(g.nP?', '+g.nP+' sinngemäß (zählen halb)':'')+
        (pk?' – rund '+(Math.round(g.score*pk*2)/2).toString().replace('.',',')+' von '+esc(String(it.punkte))+' Punkten.':'.')+'</p>';
      (g.warn||[]).forEach(w=>{ h+='<p><b>Achtung:</b> '+esc(w.hinweis)+'</p>'; });
      h+='<ul class="pts">'+it.lp.map((p,i)=>{const m=g.marks[i];
        return '<li class="'+(m===2?'hit':m===1?'part':'miss')+'"><span class="mk">'+(m===2?'✓':m===1?'≈':'○')+'</span><span>'+esc(p.titel)+
          (m===1?' <span class="tag warn">sinngemäß</span>':'')+'</span></li>';}).join('')+'</ul>'+
        '<p class="small muted" style="margin-top:9px">✓ getroffen · ≈ sinngemäß · ○ gefehlt. Anders formuliert und trotzdem richtig? Dann unten selbst werten.</p>';
    } else {
      h+='<p>Offizielle Lösung: <b class="mono">'+esc(String(it.loesung).split('\n')[0])+'</b></p>';
      if(g.info) h+='<p class="small muted">'+esc(g.info)+'</p>';
    }
  } else {
    h+='<div class="fh">'+ic(r.right?'check':'alert',18)+esc(r.fh||(r.right?'Richtig':'Noch nicht'))+'</div>';
    if(r.deine) h+='<span class="flab">Deine Antwort</span><div>'+r.deine+'</div>';
    if(!r.right&&r.loesung) h+='<span class="flab">Richtig ist</span><div>'+r.loesung+'</div>';
    if(r.warum) h+='<span class="flab">Warum</span><div>'+mdPlain(r.warum)+'</div>';
  }
  if(xp) h+='<p class="small" style="margin-top:10px;color:var(--ok);font-weight:700">+'+xp+' XP</p>';
  let extra='';
  if(r.rechenweg) extra+='<details class="sol" open><summary>Rechenweg der IHK</summary><div class="body">'+md(r.rechenweg)+'</div></details>';
  if(r.task&&!r.g.keine) extra+='<details class="sol"'+(r.score>=0.95&&!r.g.selbst?'':' open')+'><summary>Offizielle Musterlösung im Wortlaut</summary><div class="body">'+
    md(r.it.loesung)+(r.it.erklaerung?'<hr>'+md(r.it.erklaerung):'')+'</div></details>';
  if(r.task) extra+='<details class="sol"><summary>Meine Antwort</summary><div class="body">'+esc(r.ans)+'</div></details>';
  const wdh = !r.right && S.key;
  box.innerHTML='<div class="fb '+cls+'">'+h+'</div>'+extra+
    '<div class="row" style="margin-top:16px">'+
    '<button class="btn" id="nx">'+(RUN.i+1<RUN.steps.length?'Weiter':'Auswertung')+' '+ic('right',15)+'</button>'+
    ((r.task&&(r.score<0.95))?'<button class="btn sec" id="sv1">Hatte ich richtig</button><button class="btn sec" id="sv2">War halb richtig</button>'+(r.g.selbst?'<button class="btn ghost" id="sv0">War falsch</button>':''):'')+
    (S.lek!=null&&!r.right?'<button class="btn ghost sm" id="rl">Lektion nachlesen</button>':'')+'</div>'+
    (wdh?'<p class="small muted" style="margin-top:9px">'+ic('flame',12)+' Diese Einheit kommt bald zur Wiederholung.</p>':'');
  box.querySelector('#nx').onclick=()=>{ RUN.i++; render(); };
  const s1=box.querySelector('#sv1'), s2=box.querySelector('#sv2');
  const setSelf=v=>{ const p=P.res[r.it.id]; p.best=Math.max(p.best||0,v);
    RUN.res[RUN.res.length-1].score=Math.max(RUN.res[RUN.res.length-1].score,v);
    if(v>=1){RUN.ok++;} save(); RUN.i++; render(); };
  if(s1) s1.onclick=()=>setSelf(1);
  if(s2) s2.onclick=()=>setSelf(0.6);
  const s0=box.querySelector('#sv0'); if(s0) s0.onclick=()=>{ RUN.i++; render(); };
  const rl=box.querySelector('#rl');
  if(rl) rl.onclick=()=>{ const m=S.mod,l=S.lek; RUN=null; go('lektion',{m,i:l}); };
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
  box.querySelector('#nx').focus({preventScroll:true});
}
function runEnd(){
  const R=RUN, n=R.steps.length, ok=R.res.filter(x=>x.right).length;
  const avg=R.res.length?R.res.reduce((a,x)=>a+x.score,0)/R.res.length:0;
  const min=Math.max(1,Math.round((Date.now()-R.t0)/60000));
  dayRec().min+=min; save();
  if(ok===n&&n>=5) addXp(15,'perfekte Runde');
  if(R.missId) markMissionDone(R.missId);
  const wrongSteps=R.steps.filter((s,i)=>R.res[i]&&!R.res[i].right);
  const byMod={}; R.res.forEach(x=>{ if(!x.mod)return; const m=MOD_BY[x.mod]; if(!m)return;
    (byMod[m.name]=byMod[m.name]||{r:0,n:0}); byMod[m.name].n++; if(x.right)byMod[m.name].r++; });
  const mods=Object.entries(byMod).sort((a,b)=>a[1].r/a[1].n-b[1].r/b[1].n);
  const pct=Math.round(avg*100);
  const back=R.back, onDone=R.onDone;
  let bossMsg='';
  if(R.boss){
    const best=(P.modDone[R.boss]||{}).pct||0;
    if(pct>=70){ if(pct>best){ P.modDone[R.boss]={pct,date:today()}; save(); }
      bossMsg='<div class="fb ok" style="margin-bottom:18px"><div class="fh">'+ic('trophy',18)+'Modul-Check bestanden</div>'+
        '<p>'+esc(MOD_BY[R.boss].name)+' gilt jetzt intern als sicher. Das ist dein Lernstatus in diesem Trainer, keine IHK-Bewertung.</p></div>';
      addXp(40,'Modul-Check'); setTimeout(()=>celebrate('trophy','Modul bestanden',MOD_BY[R.boss].name+' – '+pct+' %'),300); }
    else bossMsg='<div class="fb part" style="margin-bottom:18px"><div class="fh">'+ic('alert',18)+'Noch nicht bestanden</div>'+
      '<p>Ab 70 % gilt das Modul intern als sicher – du hast '+pct+' % erreicht. Schau dir die schwachen Themen unten an und versuch es danach nochmal.</p></div>';
  }
  RUN=null;
  V.innerHTML='<div class="stage"><h1 style="margin-top:28px">'+ok+' von '+n+' richtig</h1>'+bossMsg+
   '<div class="bar '+(pct>=80?'ok':pct>=50?'w':'bad')+'" style="margin:8px 0 20px"><i style="width:'+pct+'%"></i></div>'+
   '<div class="statrow"><div><b>'+pct+'%</b><span>Trefferquote</span></div>'+
    '<div><b>'+R.best+'</b><span>beste Serie</span></div>'+
    '<div><b>'+min+'</b><span>Minuten</span></div>'+
    '<div><b>'+Math.round(dayRec().xp)+'</b><span>XP heute</span></div></div>'+
   (mods.length>1?'<h2>Nach Thema</h2><table class="stat">'+mods.map(([nm,v])=>
     '<tr><td>'+esc(nm)+'</td><td style="width:120px"><span class="bar sm '+(v.r/v.n>=0.7?'ok':'w')+'"><i style="width:'+Math.round(v.r/v.n*100)+'%"></i></span></td>'+
     '<td class="nums" style="width:60px;text-align:right">'+v.r+'/'+v.n+'</td></tr>').join('')+'</table>':'')+
   '<div class="row" style="margin-top:22px">'+
    (wrongSteps.length?'<button class="btn" id="again">'+wrongSteps.length+' Fehler sofort wiederholen</button>':'')+
    '<button class="btn '+(wrongSteps.length?'sec':'')+'" id="home">Weiter</button></div></div>';
  const a=V.querySelector('#again');
  if(a) a.onclick=()=>startRun(wrongSteps,{title:'Wiederholung',back});
  V.querySelector('#home').onclick=()=>{ if(onDone) onDone(); else go(back.p||'heute',back); };
  window.scrollTo(0,0);
}

/* ═══════════════ SCHRITT-GENERATOREN FÜR MISSIONEN ═══════════════ */
function pickQuiz(mid,n,filter){
  const L=modL(mid); const all=L.mc.map((_,i)=>i).filter(i=>filter?filter(i):true);
  const fresh=all.filter(i=>srsBox(qk(mid,i))<2);
  return shuffle(fresh.length>=n?fresh:all).slice(0,n);
}
function stepsWarm(n){
  const d=dueList(); const out=[];
  shuffle(d).slice(0,n).forEach(x=>out.push(x.kind==='q'?{k:'mc',m:x.m,i:x.i}:{k:'gap',m:x.m,i:x.i}));
  out.forEach((s,i)=>{ if(s.k==='gap'&&!gapOf(s.m,s.i)) out[i]={k:'card',m:s.m,i:s.i}; });
  while(out.length<n){ const mid=MODORDER[out.length%MODORDER.length];
    const q=pickQuiz(mid,1); if(q.length) out.push({k:'mc',m:mid,i:q[0]}); else break; }
  return out.slice(0,n);
}
function stepsQuick(mid,n){
  const out=[]; const qs=pickQuiz(mid,n);
  qs.forEach((i,k)=>{ const mod=k%4;
    if(mod===1) out.push({k:'tf',m:mid,i});
    else out.push({k:'mc',m:mid,i}); });
  // eine Zuordnung und ggf. ein Lückentext zur Abwechslung
  const L=modL(mid);
  const cidx=L.karten.map((_,i)=>i);
  if(cidx.length>=4) out.splice(Math.min(3,out.length),0,{k:'match',m:mid,idx:shuffle(cidx).slice(0,4)});
  const gcand=cidx.filter(i=>gapOf(mid,i));
  if(gcand.length) out.splice(Math.min(6,out.length),0,{k:'gap',m:mid,i:shuffle(gcand)[0]});
  return out.slice(0,n+2);
}
function stepsWdh(n){
  const d=dueList(); const out=[];
  shuffle(d).slice(0,n).forEach(x=>{
    if(x.kind==='q'){ out.push(((hashStr(x.k)%3)===0)?{k:'tf',m:x.m,i:x.i}:{k:'mc',m:x.m,i:x.i}); }
    else { const g=gapOf(x.m,x.i); out.push(g?{k:'gap',m:x.m,i:x.i}:{k:'card',m:x.m,i:x.i}); }
  });
  return out;
}
function uebRechAll(){ const o=[]; MODS.forEach(m=>{ const u=modL(m.id).ueb; if(u&&u.rechnen)
    u.rechnen.forEach(r=>o.push({k:'unum',m:m.id,id:r.id})); }); return o; }
function uebFaelleAll(){ const o=[]; MODS.forEach(m=>{ const u=modL(m.id).ueb; if(u&&u.faelle)
    u.faelle.forEach(f=>o.push({k:'fall',m:m.id,id:f.id})); }); return o; }
const uOpen=s2=>{ const st=srs('u|'+s2.id); return !st||st.b<2; };
function stepsRech(n){
  const ihk=numTasks(null,Math.max(1,n-1)).map(i=>({k:'num',id:i.id}));
  const ue=shuffle(uebRechAll().filter(uOpen)).slice(0,Math.max(0,n-ihk.length));
  return shuffle(ihk.concat(ue)).slice(0,n);
}
function stepsFall(n){ return shuffle(uebFaelleAll().filter(uOpen)).slice(0,n||3); }
function stepsBuch(n){
  const pool=ITEMS.filter(i=>i.typ==='buchungssatz'&&!((P.res[i.id]||{}).best>=0.7));
  const ord=t=>{const y=+((t.match(/\d{4}/)||[0])[0]);return y*2+(/Winter/.test(t)?1:0);};
  return pool.sort((a,b)=>ord(b.termin)-ord(a.termin)).slice(0,n).map(i=>({k:'buch',id:i.id}));
}
function stepsIHK(mid,n){
  const out=[];
  nextTasks(mid,n).forEach(i=>{
    if(i.typ==='buchungssatz') out.push({k:'buch',id:i.id});
    else if(i.typ==='reihenfolge') out.push({k:'order',id:i.id});
    else if(isNum(i)&&i.bereich!==BER_IM) out.push({k:'num',id:i.id});
    else out.push({k:'task',id:i.id});
  });
  return out;
}
function blockSteps(b){
  switch(b.id){
    case 'warm':   return stepsWarm(b.n||5);
    case 'quick':  return stepsQuick(b.mid,b.n||8);
    case 'wdh':    return stepsWdh(b.n||12);
    case 'rech':   return stepsRech(b.n||2);
    case 'fall':   return stepsFall(b.n||3);
    case 'buch':   return stepsBuch(b.n||3);
    case 'schwach':return schwachSteps(b.n||8);
    case 'ihk':    return stepsIHK(b.mid,b.n||2);
    default: return [];
  }
}
function startBlock(b){
  if(b.id==='lek'){ go('lektion',{m:b.mid,i:b.lek,miss:1}); return; }
  const steps=blockSteps(b);
  if(!steps.length){ markMissionDone(b.id); toast('Hier ist gerade nichts offen.'); render(); return; }
  startRun(steps,{title:b.t,missId:b.id,back:{p:'heute'},onDone:()=>go('heute')});
}
function startMission(){
  const m=mission(); const nxt=m.blocks.find(b=>!missDone(b));
  if(!nxt){ toast('Die heutige Mission ist schon durch.'); return; }
  startBlock(nxt);
}

/* ═══════════════ LEKTION: lesen und sofort anwenden ═══════════════ */
function splitLesson(txt){
  const parts=String(txt||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  const secs=[]; let buf=[], words=0;
  parts.forEach(p=>{ buf.push(p); words+=p.split(/\s+/).length;
    if(words>=110){ secs.push(buf.join('\n\n')); buf=[]; words=0; } });
  if(buf.length){ if(secs.length&&words<45) secs[secs.length-1]+='\n\n'+buf.join('\n\n'); else secs.push(buf.join('\n\n')); }
  return secs.length?secs:[String(txt||'')];
}
let LEK=null;
function pLektion(){
  const mid=R.m, li=R.i|0, L=modL(mid), l=L.lektionen[li], M=MOD_BY[mid];
  if(!l) return go('modul',{m:mid});
  const wasRead=!!P.read[mid+':L'+li];
  if(!LEK||LEK.m!==mid||LEK.i!==li) LEK={m:mid,i:li,step:wasRead?999:0,ok:0,asked:0,
    secs:splitLesson(l.inhalt), qs:shuffle(L.mc.map((q,k)=>({q,k})).filter(x=>x.q.lektion===li), hashStr(mid+li))};
  const secs=LEK.secs;
  // Ablauf: Abschnitt, Abschnitt, Frage, Abschnitt, Abschnitt, Frage …
  const seq=[]; let qi=0;
  secs.forEach((s,k)=>{ seq.push({t:'s',v:s});
    if((k%2===1||k===secs.length-1) && qi<LEK.qs.length && qi<3) seq.push({t:'q',v:LEK.qs[qi++]}); });
  const full=LEK.step>=seq.length;
  const shown=full?seq.length:Math.min(LEK.step+1,seq.length);
  const warnBox = (l.neu&&l.geprueft===false)
    ? '<div class="unverif">'+ic('alert',14)+' <b>Teilweise nicht abschließend geprüft.</b> Diese Lektion wurde neu erstellt und gegen Gesetzestext und Fachquellen geprüft. Einzelne Praxiswerte darin ließen sich nicht amtlich belegen – sie sind im Text als solche gekennzeichnet. Lerngrundlage sind die belegten Aussagen; auf den ungeprüften Werten baut keine Quiz- oder Karteikartenfrage auf.</div>'
    : '';
  const srcBox = (l.quellen&&l.quellen.length)
    ? '<div class="qsrcs">'+ic('check',12)+' Geprüft gegen: '+l.quellen.slice(0,6).map(u=>esc(String(u).replace(/^https?:\/\//,'').slice(0,58))).join(' · ')+'</div>'
    : '';
  const solo = !full || !(P.hl[mid+':L'+li]||[]).some(h=>h.n);
  let html='<div class="lwrap'+(solo?' solo':'')+'"><div><div class="lesson" id="lesson">';
  for(let k=0;k<shown;k++){ const e=seq[k];
    if(e.t==='s') html+=md(e.v);
    else if(full||k<LEK.step) html+='<div class="callout merke" style="margin:20px 0"><span class="cl">'+ic('check',13)+' Kurz gefragt – beantwortet</span>'+esc(e.v.q.frage)+'</div>';
  }
  if(full && l.merksatz) html+='<div class="callout klassiker"><span class="cl">'+ic('star',13)+' Merksatz</span>'+inl(l.merksatz)+'</div>';
  if(full) html+=srcBox;
  html+='</div>';
  const curr=seq[LEK.step];
  if(!full && curr && curr.t==='q'){
    const q=curr.v.q, ord=shuffle([0,1,2],hashStr(mid+li+curr.v.k));
    html+='<div class="qbox" style="margin-top:16px" id="inq"><div class="qkind" style="margin-bottom:10px">Kurz gefragt</div>'+
      '<div class="qtx">'+md(q.frage)+'</div><div id="iopts">'+
      ord.map((oi,n)=>'<button class="opt" data-o="'+oi+'"><span class="k">'+'ABC'[n]+'</span><span>'+inl(q.optionen[oi])+'</span></button>').join('')+
      '</div><div id="ifb"></div></div>';
  } else if(!full){
    html+='<div class="row" style="margin-top:18px"><button class="btn" id="cont">Weiter '+ic('right',15)+'</button>'+
      '<span class="small muted">Abschnitt '+Math.min(LEK.step+1,seq.length)+' von '+seq.length+'</span></div>';
  } else {
    html+='<div class="row" style="margin-top:20px">'+
      '<button class="btn" id="fin">'+(wasRead?'Zurück zum Modul':'Lektion abschließen')+' '+ic('right',15)+'</button>'+
      (LEK.qs.length?'<button class="btn sec" id="quiz">Quiz zum Thema</button>':'')+
      '<button class="btn ghost sm" id="prev"'+(li===0?' disabled':'')+'>'+ic('left',14)+' vorige</button>'+
      '<button class="btn ghost sm" id="next2"'+(li+1>=L.lektionen.length?' disabled':'')+'>nächste '+ic('right',14)+'</button></div>'+
      '<p class="small muted" style="margin-top:10px">'+ic('hl',13)+' Text markieren, um ihn hervorzuheben oder eine Randnotiz zu schreiben.</p>';
  }
  html+='</div><div class="notes" id="notes"></div></div>';
  V.innerHTML='<div class="crumb"><button id="bm">'+esc(M.name)+'</button> › <span>Lektion '+(li+1)+' von '+L.lektionen.length+'</span>'+
    (full?'':'<span class="tag acc" style="margin-left:auto">lesen &amp; anwenden</span>')+'</div>'+
    '<h1>'+esc(l.titel)+'</h1>'+
    (l.neu?'<div class="row" style="margin:0 0 12px"><span class="src gen">neu erstellt &amp; quellengeprüft</span></div>':'')+
    (l.kurz?'<p class="lede">'+esc(l.kurz)+'</p>':'')+warnBox+html;
  V.querySelector('#bm').onclick=()=>{ LEK=null; go('modul',{m:mid}); };
  const c=V.querySelector('#cont'); if(c) c.onclick=()=>{ LEK.step++; render(); window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}); };
  const iq=V.querySelector('#iopts');
  if(iq){ const q=curr.v.q, key=qk(mid,curr.v.k);
    iq.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const ch=+b.dataset.o, right=ch===q.richtig;
      iq.querySelectorAll('.opt').forEach(x=>{ x.disabled=true;
        if(+x.dataset.o===q.richtig) x.classList.add('right'); else if(x===b) x.classList.add('wrong'); });
      grade(key,right,false); countItem(right); weekTick('q');
      if(right){ LEK.ok++; addXp(xpFor('mc',srsBox(key),1)); }
      LEK.asked++;
      V.querySelector('#ifb').innerHTML='<div class="fb '+(right?'ok':'bad')+'">'+
        '<div class="fh">'+ic(right?'check':'alert',18)+(right?'Richtig':'Noch nicht')+'</div>'+
        (right?'':'<span class="flab">Richtig ist</span><div>'+inl(q.optionen[q.richtig])+'</div>')+
        (q.erklaerung?'<span class="flab">Warum</span><div>'+mdPlain(q.erklaerung)+'</div>':'')+'</div>'+
        '<div class="row" style="margin-top:14px"><button class="btn" id="iw">Weiter '+ic('right',15)+'</button></div>';
      V.querySelector('#iw').onclick=()=>{ LEK.step++; render(); };
      V.querySelector('#iw').focus({preventScroll:true});
      save(); }); }
  const fin=V.querySelector('#fin');
  if(fin) fin.onclick=()=>{
    if(!wasRead){ P.read[mid+':L'+li]=1; save(); addXp(15,'Lektion abgeschlossen'); }
    const wasMiss=R.miss; LEK=null;
    if(wasMiss){ markMissionDone('lek'); go('heute'); }
    else go('modul',{m:mid}); };
  const qz=V.querySelector('#quiz');
  if(qz) qz.onclick=()=>{ const idx=LEK.qs.map(x=>x.k); LEK=null;
    startRun(idx.map(i=>({k:'mc',m:mid,i})),{title:'Quiz: '+l.titel,back:{p:'lektion',m:mid,i:li}}); };
  const pv=V.querySelector('#prev'); if(pv) pv.onclick=()=>{LEK=null;go('lektion',{m:mid,i:li-1});};
  const nx=V.querySelector('#next2'); if(nx) nx.onclick=()=>{LEK=null;go('lektion',{m:mid,i:li+1});};
  if(full) initHL(mid+':L'+li);
}

/* ═══════════════ TEXTMARKER & RANDNOTIZEN ═══════════════ */
let HLKEY=null,TB=null;
const hlList=()=>P.hl[HLKEY]||(P.hl[HLKEY]=[]);
function textNodes(root){ const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); const a=[]; let off=0,x;
  while(x=w.nextNode()){ const L=x.nodeValue.length; a.push({n:x,s:off,e:off+L}); off+=L; } return a; }
function paintHL(){
  const root=document.getElementById('lesson'); if(!root) return;
  root.querySelectorAll('mark.hl').forEach(m=>{ const p=m.parentNode; while(m.firstChild)p.insertBefore(m.firstChild,m); p.removeChild(m); p.normalize(); });
  hlList().map((h,i)=>({h,i})).sort((a,b)=>b.h.s-a.h.s).forEach(({h,i})=>{
    const nodes=textNodes(root);
    for(let k=nodes.length-1;k>=0;k--){ const it=nodes[k], a=Math.max(h.s,it.s), b=Math.min(h.e,it.e);
      if(b<=a) continue;
      try{ const r=document.createRange(); r.setStart(it.n,a-it.s); r.setEnd(it.n,b-it.s);
        const mk=document.createElement('mark'); mk.className='hl c'+(h.c||'y')+(h.n?' hasnote':'');
        mk.dataset.i=i; r.surroundContents(mk); }catch(e){} } });
  root.querySelectorAll('mark.hl').forEach(m=>m.onclick=ev=>{ ev.stopPropagation(); openNote(+m.dataset.i); });
  paintNotes();
}
function paintNotes(){
  const box=document.getElementById('notes'), root=document.getElementById('lesson'); if(!box||!root) return;
  const wrap=box.closest('.lwrap');
  if(wrap) wrap.classList.toggle('solo', !hlList().some(h=>h.n));
  box.innerHTML=''; const wide=matchMedia('(min-width:941px)').matches;
  const br=box.getBoundingClientRect(); let last=-1e6;
  hlList().forEach((h,i)=>{ if(!h.n) return;
    const mk=root.querySelector('mark.hl[data-i="'+i+'"]');
    const d=document.createElement('div'); d.className='note';
    d.style.setProperty('--nc',{y:'#e0a52a',g:'#22a45d',b:'#3b82f6',p:'#e5559f'}[h.c||'y']);
    d.innerHTML='<span class="nq">„'+esc((h.t||'').slice(0,50))+((h.t||'').length>50?'…':'')+'"</span>'+esc(h.n);
    d.onclick=()=>openNote(i); box.appendChild(d);
    if(wide&&mk){ let top=mk.getBoundingClientRect().top-br.top;
      if(top<last+8) top=last+8; d.style.top=Math.max(0,top)+'px'; last=top+d.offsetHeight; } });
  box.style.height = matchMedia('(min-width:941px)').matches ? Math.max(0,last+20)+'px' : 'auto';
}
function selOffsets(root){ const sel=getSelection(); if(!sel.rangeCount||sel.isCollapsed) return null;
  const r=sel.getRangeAt(0); if(!root.contains(r.commonAncestorContainer)) return null;
  const pre=document.createRange(); pre.selectNodeContents(root); pre.setEnd(r.startContainer,r.startOffset);
  const st=pre.toString().length, tx=r.toString(); if(!tx.trim()) return null;
  return {s:st,e:st+tx.length,t:tx.trim()}; }
function closeTB(){ if(TB){TB.remove();TB=null;} }
function initHL(key){
  HLKEY=key; const root=document.getElementById('lesson'); if(!root) return;
  paintHL();
  const show=()=>{ const o=selOffsets(root); closeTB(); if(!o) return;
    const r=getSelection().getRangeAt(0).getBoundingClientRect();
    TB=document.createElement('div'); TB.className='hltb';
    TB.innerHTML=['y','g','b','p'].map(c=>'<button data-c="'+c+'" aria-label="markieren"><span class="sw c'+c+'"></span></button>').join('')+
      '<button data-note="1" aria-label="Notiz">'+ic('note',16)+'</button>';
    document.body.appendChild(TB);
    const w=TB.offsetWidth,h=TB.offsetHeight;
    TB.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';
    let ty=(r.top-h-10<8)?r.bottom+10:r.top-h-10;
    ty=Math.max(8,Math.min(innerHeight-h-8,ty));
    TB.style.top=ty+'px';
    TB.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ hlList().push({s:o.s,e:o.e,c:b.dataset.c,t:o.t});
      save(); getSelection().removeAllRanges(); closeTB(); paintHL(); });
    TB.querySelector('[data-note]').onclick=()=>{ hlList().push({s:o.s,e:o.e,c:'y',t:o.t,n:''});
      save(); getSelection().removeAllRanges(); closeTB(); paintHL(); openNote(hlList().length-1); }; };
  root.onmouseup=()=>setTimeout(show,10);
  root.ontouchend=()=>setTimeout(show,80);
  document.addEventListener('mousedown',e=>{ if(TB&&!TB.contains(e.target)) closeTB(); });
  addEventListener('resize',paintNotes);
}
function openNote(i){
  const h=hlList()[i]; if(!h) return;
  const d=document.createElement('div'); d.className='pop';
  d.innerHTML='<div class="popc" style="text-align:left;max-width:460px">'+
    '<div class="qctx" style="font-style:italic">'+esc((h.t||'').slice(0,220))+'</div>'+
    '<textarea id="nt" placeholder="Deine Notiz zu dieser Stelle…" style="margin-top:12px">'+esc(h.n||'')+'</textarea>'+
    '<div class="row" style="margin-top:14px;justify-content:space-between">'+
    '<div class="row" style="gap:6px">'+['y','g','b','p'].map(c=>'<button class="ico" data-c="'+c+'" style="width:30px;height:30px'+(h.c===c?';border-color:var(--acc)':'')+'"><span class="sw c'+c+'"></span></button>').join('')+'</div>'+
    '<div class="row" style="gap:7px"><button class="btn ghost sm" id="del">Löschen</button><button class="btn sm" id="ok">Speichern</button></div>'+
    '</div></div>';
  d.onclick=e=>{ if(e.target===d) d.remove(); };
  document.body.appendChild(d);
  const ta=d.querySelector('#nt'); ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length);
  d.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ h.c=b.dataset.c; save();
    d.querySelectorAll('[data-c]').forEach(x=>x.style.borderColor=x.dataset.c===h.c?'var(--acc)':'var(--line)'); paintHL(); });
  d.querySelector('#del').onclick=()=>{ hlList().splice(i,1); save(); d.remove(); paintHL(); };
  d.querySelector('#ok').onclick=()=>{ h.n=ta.value.trim(); if(!h.n) delete h.n; save(); d.remove(); paintHL(); };
}

/* ═══════════════ SEITE: HEUTE ═══════════════ */
function greet(){ const h=new Date().getHours();
  return h<11?'Guten Morgen':h<18?'Guten Tag':'Guten Abend'; }
function pHeute(){
  const m=mission(), dl=daysLeft(), lvl=levelOf(P.xp), st=streakNow(), d=dayRec();
  const R1=bereichReife(BER_IM).val, R2=bereichReife(BER_KS).val, G=gesamtReife();
  const done=m.blocks.filter(missDone).length, tot=m.blocks.length;
  const sw=schwaechen(3);
  const lastSim=P.sims[P.sims.length-1];
  const wg=weekGoals();
  V.innerHTML=
  '<div class="hero">'+
    '<h1 class="greet" style="font-size:13px;margin:0;font-weight:600;letter-spacing:0;text-transform:none">'+greet()+' – heute ist '+fmtLong(today())+'</h1>'+
    '<div class="cdrow"><span class="cdbig nums">'+dl+'</span><span class="cdsub">Tage bis zur schriftlichen Prüfung am '+fmtLong(P.plan.exam)+'</span></div>'+
    '<div class="reifebar"><div class="reifehead"><span class="muted">Prüfungsreife – Schätzung deines Lernstands</span><b>'+Math.round(G*100)+' %</b></div>'+
    '<span class="bar '+(G>=0.6?'ok':G>=0.35?'w':'')+'"><i style="width:'+Math.round(G*100)+'%"></i></span>'+
    '<div class="row small muted" style="margin-top:9px;gap:16px">'+
      '<span>Immobilienwirtschaft '+Math.round(R1*100)+' %</span><span>Kaufm. Steuerung '+Math.round(R2*100)+' %</span></div></div>'+
  '</div>'+

  '<div class="mission">'+
   '<div class="mhead"><div class="mt">Heutige Mission</div>'+
    '<div class="ms">'+m.min+' Minuten · '+done+' von '+tot+' Blöcken erledigt</div>'+
    '<span class="bar sm" style="margin-top:11px"><i style="width:'+(tot?Math.round(done/tot*100):0)+'%"></i></span></div>'+
   '<div class="mlist">'+m.blocks.map((b,k)=>{
      const dn=missDone(b), now=!dn&&m.blocks.slice(0,k).every(missDone);
      return '<button class="mrow '+(dn?'done':now?'now':'')+'" data-b="'+b.id+'">'+
        '<span class="mi">'+(dn?ic('check',17):ic(b.ic,17))+'</span>'+
        '<span class="mb"><b>'+esc(b.t)+'</b><span>'+esc(b.s)+'</span></span>'+
        '<span class="mmin">'+b.min+' Min</span></button>';}).join('')+'</div>'+
   '<div class="mfoot"><button class="btn lg" id="go"'+(done===tot?' disabled':'')+'>'+ic('play',17)+' '+
     (done===tot?'Mission geschafft':(done?'Weiterlernen':'Mission starten'))+'</button>'+
     (done===tot?'<div class="row" style="margin-top:10px"><button class="btn sec sm" id="extra">Noch eine Extra-Runde</button></div>':'')+
   '</div></div>'+

  '<div class="statrow">'+
   '<div><b class="nums">'+d.xp+'</b><span>XP heute</span></div>'+
   '<div><b class="nums">'+(st||'–')+'</b><span>Tage Serie</span></div>'+
   '<div><b class="nums">'+lvl.l+'</b><span>Level</span></div>'+
   '<div><b class="nums">'+dueCount()+'</b><span>fällig</span></div></div>'+

  (sw.length?'<h2>'+ic('weak',14)+' Deine Schwachstellen</h2>'+
   '<div class="card"><table class="stat">'+sw.map(x=>
     '<tr><td>'+esc(x.th)+'</td><td style="width:110px"><span class="bar sm '+(x.q>=0.6?'w':'bad')+'"><i style="width:'+Math.round(x.q*100)+'%"></i></span></td>'+
     '<td class="nums" style="width:46px;text-align:right">'+Math.round(x.q*100)+'%</td></tr>').join('')+'</table>'+
   '<div class="row" style="margin-top:14px"><button class="btn sec" id="sw">Schwächen trainieren</button></div></div>':'')+

  '<h2>'+ic('flag',14)+' Diese Woche</h2><div class="card">'+wg.map(g=>{
    const cl=Math.min(1,g.cur/g.goal), got=weekMiss().claimed[g.id];
    return '<div class="setrow"><div class="sl"><b>'+esc(g.t)+'</b>'+
      '<span class="bar sm" style="margin-top:6px"><i style="width:'+Math.round(cl*100)+'%"></i></span></div>'+
      '<span class="tag '+(cl>=1?'ok':'')+' nums">'+Math.min(g.cur,g.goal)+' / '+g.goal+'</span>'+
      (cl>=1&&!got?'<button class="btn sm" data-claim="'+g.id+'">+'+g.xp+' XP holen</button>':
        got?'<span class="tag ok">'+ic('check',12)+' erledigt</span>':'')+'</div>';}).join('')+'</div>'+

  (lastSim?'<h2>'+ic('exam',14)+' Letzte Prüfungssimulation</h2><div class="card">'+
    '<div class="row" style="justify-content:space-between"><div><b>'+esc(lastSim.title)+'</b>'+
    '<div class="small muted">'+fmtDay(lastSim.date)+' · '+lastSim.min+' Minuten</div></div>'+
    '<span class="kpi" style="font-size:24px;color:'+(lastSim.pct>=50?'var(--ok)':'var(--bad)')+'">'+lastSim.pct+' P.</span></div></div>':'')+

  '<footer>Aufgaben und Lösungen: Gemeinsame Prüfungsaufgaben der Industrie- und Handelskammern (AkA Nürnberg), '+
  'Abschlussprüfungen Sommer 2019 bis Winter 2025/26 mit den zugehörigen Lösungshinweisen. '+
  'Die Prüfungsreife ist eine Schätzung deines Lernstands und keine Aussage darüber, ob du die Prüfung bestehst.</footer>';

  V.querySelector('#go').onclick=startMission;
  const ex=V.querySelector('#extra'); if(ex) ex.onclick=()=>startRun(stepsWarm(10),{title:'Extra-Runde'});
  V.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{ const blk=m.blocks.find(x=>x.id===b.dataset.b); if(blk) startBlock(blk); });
  const s=V.querySelector('#sw'); if(s) s.onclick=()=>startRun(schwachSteps(14),{title:'Schwächen-Training'});
  V.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>claimWeek(wg.find(g=>g.id===b.dataset.claim)));
}

/* ═══════════════ SEITE: LERNEN ═══════════════ */
function pLernen(){
  const groups=[['Immobilienwirtschaft','Immobilienwirtschaft','180 Minuten · ungebunden · doppelt gewichtet'],
                ['KSK','Kaufmännische Steuerung, Dokumentation &amp; Kontrolle','90 Minuten · gebunden'],
                ['Aktuell','Aktueller Rechtsstand','']];
  V.innerHTML='<h1>Lernen</h1><p class="lede">Alle Themen frei zugänglich. Wenn du nicht weißt, womit du anfangen sollst, nimm die Tagesmission auf der Startseite.</p>'+
  '<div class="card small" style="margin-bottom:18px"><div class="row" style="gap:14px">'+
   '<span><span class="src ihk">Original-IHK</span> echte Prüfungsaufgabe mit offizieller Lösung</span>'+
   '<span><span class="src gen">Übung</span> aus geprüften Inhalten erstellt</span>'+
   '<span><span class="src ueb">Übungsaufgabe</span> neu erstellt, quellengeprüft</span></div></div>'+
  '<div class="grid g2" style="margin-bottom:8px">'+
   '<button class="tile" id="tSchwach"><div class="thead"><span class="ttile" style="--h:5">'+ic('weak',20)+'</span>'+
    '<span class="tname">Schwächen-Trainer</span></div><p class="tsub">Die Fragen und Themen, bei denen du zuletzt danebenlagst</p></button>'+
   '<button class="tile" id="tRech"><div class="thead"><span class="ttile" style="--h:300">'+ic('klr',20)+'</span>'+
    '<span class="tname">Rechentrainer</span></div><p class="tsub">Alle Rechenaufgaben nach Kategorien, mit Ansatz und Original-Rechenweg</p></button>'+
   '<button class="tile" id="tForm"><div class="thead"><span class="ttile" style="--h:200">'+ic('sigma',20)+'</span>'+
    '<span class="tname">Formelsammlung</span></div><p class="tsub">Alle Formeln aus den Lektionen, mit Sprung zur passenden Übung</p></button>'+
   '<button class="tile" id="tOp"><div class="thead"><span class="ttile" style="--h:35">'+ic('alert',20)+'</span>'+
    '<span class="tname">IHK richtig lesen</span></div><p class="tsub">Prüfungsoperatoren und typische Fallen in der Aufgabenstellung</p></button>'+
  '</div>'+
  groups.map(([key,label,sub])=>{
    const ms=MODS.filter(m=>m.bereich===key); if(!ms.length) return '';
    return '<h2>'+esc(label)+(sub?' <span class="tag">'+sub+'</span>':'')+'</h2><div class="grid g2">'+
      ms.map(m=>modTile(m)).join('')+'</div>'; }).join('');
  V.querySelector('#tSchwach').onclick=()=>go('schwach');
  V.querySelector('#tRech').onclick=()=>go('rechnen');
  V.querySelector('#tForm').onclick=()=>go('formeln');
  V.querySelector('#tOp').onclick=()=>go('operatoren');
  bindTiles();
}
function modTile(m){
  const r=modReife(m.id), L=modL(m.id), it=BY_MOD[m.id]||[];
  const pct=Math.round(r.val*100);
  return '<button class="tile" data-m="'+m.id+'">'+
    '<div class="thead"><span class="ttile" style="--h:'+(MHUE[m.id]||210)+'">'+ic(MICON[m.id]||'book',20)+'</span>'+
    '<span class="tname">'+esc(m.name)+(P.modDone[m.id]?' <span class="tag ok">bestanden</span>':'')+'</span></div>'+
    '<p class="tsub">'+L.lektionen.length+' Lektionen · '+L.karten.length+' Karten · '+L.mc.length+' Quizfragen'+(it.length?' · '+it.length+' IHK-Aufgaben':'')+'</p>'+
    '<span class="bar '+(pct>=70?'ok':'')+'"><i style="width:'+pct+'%"></i></span>'+
    '<div class="tfoot"><span class="nums">'+pct+' %</span><span>·</span><span>'+
      (pct>=70?'sicher':pct>=35?'in Arbeit':'noch offen')+'</span></div></button>';
}
function bindTiles(){ V.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>go('modul',{m:b.dataset.m})); }

/* ═══════════════ SEITE: MODUL ═══════════════ */
function pModul(){
  const mid=R.m, M=MOD_BY[mid], L=modL(mid), it=BY_MOD[mid]||[], r=modReife(mid);
  if(!M) return go('lernen');
  const nL=L.lektionen.filter((_,i)=>P.read[mid+':L'+i]).length;
  const nK=L.karten.filter((_,i)=>srsBox(ck(mid,i))>=2).length;
  const nQ=L.mc.filter((_,i)=>srsBox(qk(mid,i))>=2).length;
  const nA=it.filter(i=>(P.res[i.id]||{}).best>=0.7).length;
  const ready=nL===L.lektionen.length;
  V.innerHTML='<div class="crumb"><button id="bl">Lernen</button> › <span>'+esc(M.name)+'</span></div>'+
   '<h1>'+esc(M.name)+'</h1><p class="lede">'+esc(L.intro||'')+'</p>'+
   (L.stand?'<p class="small muted" style="margin-top:-12px">'+esc(L.stand)+'</p>':'')+
   '<span class="bar '+(r.val>=0.7?'ok':'')+'" style="margin-bottom:20px"><i style="width:'+Math.round(r.val*100)+'%"></i></span>'+
   '<div class="grid g4" style="margin-bottom:22px">'+
    '<button class="tile" id="aLek" style="padding:13px"><div class="tfoot" style="margin:0 0 6px"><span>'+ic('book',16)+'</span></div>'+
     '<b style="font-size:14px">Lektionen</b><div class="small muted nums">'+nL+' / '+L.lektionen.length+'</div></button>'+
    '<button class="tile" id="aKar" style="padding:13px"><div class="tfoot" style="margin:0 0 6px"><span>'+ic('cards',16)+'</span></div>'+
     '<b style="font-size:14px">Karteikarten</b><div class="small muted nums">'+nK+' / '+L.karten.length+'</div></button>'+
    '<button class="tile" id="aQuiz" style="padding:13px"><div class="tfoot" style="margin:0 0 6px"><span>'+ic('check',16)+'</span></div>'+
     '<b style="font-size:14px">Übungen</b><div class="small muted nums">'+nQ+' / '+L.mc.length+'</div></button>'+
    ((modL(mid).ueb&&((modL(mid).ueb.faelle||[]).length+(modL(mid).ueb.rechnen||[]).length))?
      '<button class="tile" id="aFall" style="padding:13px"><div class="tfoot" style="margin:0 0 6px"><span>'+ic('target',16)+'</span></div>'+
      '<b style="font-size:14px">Übungen &amp; Fälle</b><div class="small muted nums">'+
      ((modL(mid).ueb.faelle||[]).length+(modL(mid).ueb.rechnen||[]).length)+' neu</div></button>':'')+
    (it.length?'<button class="tile" id="aIHK" style="padding:13px"><div class="tfoot" style="margin:0 0 6px"><span>'+ic('exam',16)+'</span></div>'+
     '<b style="font-size:14px">IHK-Aufgaben</b><div class="small muted nums">'+nA+' / '+it.length+'</div></button>':'')+
   '</div>'+
   '<div class="card" style="margin-bottom:22px"><div class="row" style="justify-content:space-between">'+
    '<div><b>'+ic('trophy',15)+' Modul-Check</b><div class="small muted">20 gemischte Aufgaben quer durch das Thema'+
      (it.length?', inklusive einer Original-IHK-Aufgabe':'')+'. Ab 70 % gilt das Modul intern als sicher.</div></div>'+
    (P.modDone[mid]?'<span class="tag ok">'+ic('check',12)+' bestanden ('+P.modDone[mid].pct+' %)</span>':'')+'</div>'+
    '<div class="row" style="margin-top:14px"><button class="btn" id="boss"'+(ready?'':' disabled')+'>'+
     (ready?'Modul-Check starten':'Erst alle '+L.lektionen.length+' Lektionen lesen \u2013 '+nL+' geschafft')+'</button></div></div>'+
   '<h2>Lektionen</h2><div>'+L.lektionen.map((l,i)=>
     '<button class="lrow '+(P.read[mid+':L'+i]?'done':'')+'" data-l="'+i+'">'+
     '<span class="li">'+(P.read[mid+':L'+i]?ic('check',15):(i+1))+'</span>'+
     '<span class="lb"><b>'+esc(l.titel)+'</b><span>'+esc(l.kurz||'')+'</span></span>'+
     '<span class="la">'+ic('right',17)+'</span></button>').join('')+'</div>';
  V.querySelector('#bl').onclick=()=>go('lernen');
  V.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>go('lektion',{m:mid,i:+b.dataset.l}));
  V.querySelector('#aLek').onclick=()=>{ const i=L.lektionen.findIndex((_,k)=>!P.read[mid+':L'+k]); go('lektion',{m:mid,i:i<0?0:i}); };
  V.querySelector('#aKar').onclick=()=>{ const idx=L.karten.map((_,i)=>i).filter(i=>srsBox(ck(mid,i))<3);
    startRun(shuffle(idx.length?idx:L.karten.map((_,i)=>i)).slice(0,20).map(i=>({k:'card',m:mid,i})),
      {title:'Karteikarten '+M.name,back:{p:'modul',m:mid}}); };
  V.querySelector('#aQuiz').onclick=()=>startRun(stepsQuick(mid,12),{title:'Übungen '+M.name,back:{p:'modul',m:mid}});
  const ai=V.querySelector('#aIHK'); if(ai) ai.onclick=()=>startRun(stepsIHK(mid,6),{title:'IHK-Aufgaben '+M.name,back:{p:'modul',m:mid}});
  const af=V.querySelector('#aFall'); if(af) af.onclick=()=>{ const u=modL(mid).ueb||{};
    const st=(u.faelle||[]).map(f=>({k:'fall',m:mid,id:f.id})).concat((u.rechnen||[]).map(r=>({k:'unum',m:mid,id:r.id})));
    startRun(shuffle(st),{title:'Übungen '+M.name,back:{p:'modul',m:mid}}); };
  V.querySelector('#boss').onclick=()=>startBoss(mid);
}
function startBoss(mid){
  const L=modL(mid), it=BY_MOD[mid]||[];
  const steps=[];
  pickQuiz(mid,12).forEach((i,k)=>steps.push({k:(k%5===4?'tf':'mc'),m:mid,i}));
  const cidx=L.karten.map((_,i)=>i);
  if(cidx.length>=4) steps.push({k:'match',m:mid,idx:shuffle(cidx).slice(0,4)});
  const g=cidx.filter(i=>gapOf(mid,i)); if(g.length) steps.push({k:'gap',m:mid,i:shuffle(g)[0]});
  const num=(BY_MOD[mid]||[]).filter(isNum); if(num.length) steps.push({k:'num',id:shuffle(num)[0].id});
  const bu=it.filter(i=>i.typ==='buchungssatz'); if(bu.length) steps.push({k:'buch',id:shuffle(bu)[0].id});
  const uu=modL(mid).ueb||{};
  if((uu.faelle||[]).length) steps.push({k:'fall',m:mid,id:shuffle(uu.faelle)[0].id});
  if((uu.rechnen||[]).length) steps.push({k:'unum',m:mid,id:shuffle(uu.rechnen)[0].id});
  if(it.length) stepsIHK(mid,1).forEach(s=>steps.push(s));
  startRun(shuffle(steps.slice(0,20)),{title:'Modul-Check '+MOD_BY[mid].name,back:{p:'modul',m:mid},
    onDone:()=>go('modul',{m:mid})});
  if(RUN) RUN.boss=mid;
}

/* ═══════════════ SEITE: PRÜFUNG ═══════════════ */
function pPruefung(){
  V.innerHTML='<h1>Prüfung</h1>'+
  '<p class="lede">Im Prüfungsmodus gibt es keine Hilfen, keine Erklärungen und keine Sofortkorrektur – nur Uhr, Aufgaben und am Ende die Auswertung. Genau wie am Prüfungstag.</p>'+
  '<div class="grid g2" style="margin-bottom:10px">'+
   '<button class="tile" id="kurz"><div class="thead"><span class="ttile" style="--h:160">'+ic('bolt',20)+'</span>'+
    '<span class="tname">Kurzsimulation</span></div><p class="tsub">30 gemischte Original-Aufgaben quer durch alle Jahrgänge · 60 Minuten</p></button>'+
   '<button class="tile" id="fehler"><div class="thead"><span class="ttile" style="--h:5">'+ic('weak',20)+'</span>'+
    '<span class="tname">Fehler der letzten Prüfungen</span></div><p class="tsub">Alle Original-Aufgaben, die du unter 70 % gelöst hast – im Lernmodus mit Lösungen</p></button>'+
  '</div>'+
  [[BER_IM,'Immobilienwirtschaft',180],[BER_KS,'Kaufmännische Steuerung, Dokumentation',90]].map(([ber,label,min])=>
   '<h2>'+esc(label)+' <span class="tag">'+min+' Minuten · 100 Punkte</span></h2><div class="grid g3">'+
   TERMINE.slice().reverse().map(t=>{ const l=ITEMS.filter(i=>i.bereich===ber&&i.termin===t); if(!l.length) return '';
     const sim=P.sims.filter(s=>s.key===ber+'|'+t).slice(-1)[0];
     return '<button class="tile" data-sim="'+ber+'|'+t+'" style="padding:14px">'+
      '<div class="tname" style="font-size:14.5px">'+esc(t)+(t==='Winter 2025/26'?' <span class="tag ok">neuste</span>':'')+'</div>'+
      '<p class="tsub" style="margin:4px 0 0">'+l.length+' Teilaufgaben</p>'+
      (sim?'<div class="tfoot"><span class="tag '+(sim.pct>=50?'ok':'bad')+'">zuletzt '+sim.pct+' P.</span></div>':
        '<div class="tfoot"><span class="muted">noch nicht geschrieben</span></div>')+'</button>';}).join('')+'</div>').join('')+
  (P.sims.length?'<h2>Deine Simulationen</h2><div class="card"><table class="stat">'+
    '<tr><th>Datum</th><th>Prüfung</th><th>Zeit</th><th style="text-align:right">Punkte</th></tr>'+
    P.sims.slice().reverse().slice(0,12).map(s=>'<tr><td class="nums">'+fmtDay(s.date)+'</td><td>'+esc(s.title)+'</td>'+
    '<td class="nums">'+s.min+' Min</td><td class="nums" style="text-align:right"><b style="color:'+(s.pct>=50?'var(--ok)':'var(--bad)')+'">'+s.pct+'</b></td></tr>').join('')+
    '</table></div>':'');
  V.querySelector('#kurz').onclick=()=>examIntro('Kurzsimulation',shuffle(ITEMS.filter(i=>!i.ohne_loesung)).slice(0,30),60,'kurz');
  V.querySelector('#fehler').onclick=()=>{
    const l=ITEMS.filter(i=>{const r=P.res[i.id];return r&&r.best<0.7&&!i.ohne_loesung;});
    if(!l.length) return toast('Keine Fehler gespeichert – schreib erst eine Simulation.');
    startRun(shuffle(l).slice(0,20).map(i=>({k:i.typ==='buchungssatz'?'buch':i.typ==='reihenfolge'?'order':(isNum(i)&&i.bereich!==BER_IM)?'num':'task',id:i.id})),
      {title:'Fehler wiederholen',back:{p:'pruefung'}}); };
  V.querySelectorAll('[data-sim]').forEach(b=>b.onclick=()=>{ const [ber,t]=b.dataset.sim.split('|');
    const l=ITEMS.filter(i=>i.bereich===ber&&i.termin===t);
    examIntro(ber+' · '+t, l, ber===BER_IM?180:90, ber+'|'+t); });
}
function examIntro(title,list,min,key){
  V.innerHTML='<div class="stage"><div class="crumb"><button id="bp">Prüfung</button> › <span>Start</span></div>'+
   '<div class="qbox" style="text-align:center;padding:34px 26px">'+
   '<div style="width:64px;height:64px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;background:var(--acc-soft);color:var(--acc)">'+ic('exam',30)+'</div>'+
   '<h1 style="margin:0 0 6px;font-size:22px">'+esc(title)+'</h1>'+
   '<p class="muted" style="margin:0 0 22px">'+list.length+' Aufgaben · '+min+' Minuten · Prüfungsmodus</p>'+
   '<div class="card" style="text-align:left;margin-bottom:20px"><div class="small">'+
    '<p style="margin:0 0 8px"><b>'+ic('clock',13)+' Uhr läuft</b> – sie stoppt nicht, wenn du pausierst.</p>'+
    '<p style="margin:0 0 8px"><b>'+ic('lock',13)+' Keine Hilfen</b> – keine Lösungen, keine Erklärungen, keine Rückmeldung während der Prüfung.</p>'+
    '<p style="margin:0 0 8px"><b>'+ic('flag',13)+' Markieren</b> – unsichere Aufgaben kannst du kennzeichnen und später zurückspringen.</p>'+
    '<p style="margin:0"><b>'+ic('check',13)+' Abgabe</b> – erst danach siehst du Punkte, Lösungen und die Themenanalyse.</p>'+
    '</div></div>'+
   '<button class="btn lg" id="start">Prüfung starten</button>'+
   '<p class="small muted" style="margin:14px 0 0">Die Punktzahl ist eine Auswertung deiner Antworten in diesem Trainer, keine IHK-Bewertung.</p>'+
   '</div></div>';
  V.querySelector('#bp').onclick=()=>go('pruefung');
  V.querySelector('#start').onclick=()=>startExam(title,list,min,key);
}
/* ---------- Prüfungsmodus ---------- */
let EX=null,exTimer=null;
function startExam(title,list,min,key){
  EX={title,key,list:list.slice(),i:0,ans:{},flag:{},left:min*60,min,t0:Date.now()};
  clearInterval(exTimer);
  exTimer=setInterval(()=>{ if(!EX){clearInterval(exTimer);return;} EX.left--;
    const el=document.getElementById('extime');
    if(el){ el.textContent=fmtT(EX.left); el.className='timer '+(EX.left<300?'red':EX.left<900?'warn':''); }
    if(EX.left<=0){ clearInterval(exTimer); toast('Zeit abgelaufen – Prüfung wird abgegeben.'); examSubmit(); } },1000);
  go('exam');
}
const fmtT=s=>{ s=Math.max(0,s); const h=Math.floor(s/3600);
  return (h?h+':':'')+pad(Math.floor(s/60)%60)+':'+pad(s%60); };
function pExam(){
  if(!EX) return go('pruefung');
  const it=EX.list[EX.i]; if(!it) return examSubmit();
  const free=['freitext','rechnen','tabelle'].includes(it.typ)&&it.bereich===BER_IM;
  const cur=EX.ans[it.id]||'';
  let body;
  if(free||it.ohne_loesung) body='<textarea id="xa" placeholder="Deine Antwort…">'+esc(cur)+'</textarea>';
  else if(it.optionen&&it.optionen.length){ const multi=it.typ==='mc_mehrfach';
    const sel=String(cur).split(';');
    body='<div id="opts">'+it.optionen.map(o=>'<label class="opt'+(sel.includes(String(o.nr))?' sel':'')+'">'+
     '<input type="'+(multi?'checkbox':'radio')+'" name="xo" value="'+o.nr+'"'+(sel.includes(String(o.nr))?' checked':'')+
     ' style="margin-top:4px;accent-color:var(--acc)"><span class="k">'+o.nr+'</span><span>'+esc(o.text)+'</span></label>').join('')+'</div>';
  } else body='<input type="text" id="xi" value="'+esc(cur)+'" placeholder="Antwort eintragen" autocomplete="off">';
  V.innerHTML='<div class="exambar"><div class="inner">'+
    '<span class="timer" id="extime">'+fmtT(EX.left)+'</span>'+
    '<span class="small muted nums">Aufgabe '+(EX.i+1)+' von '+EX.list.length+'</span>'+
    '<span style="flex:1"></span>'+
    '<button class="btn ghost sm" id="xflag">'+ic('flag',13)+(EX.flag[it.id]?' markiert':' markieren')+'</button>'+
    '<button class="btn sm" id="xsub">Abgeben</button></div></div>'+
   '<div class="stage">'+
   '<div class="qbox"><div class="qkind" style="margin-bottom:10px">'+esc(it.termin)+' · Aufgabe '+esc(it.nr)+
     (it.punkte?' · '+esc(String(it.punkte))+' Punkte':'')+'</div>'+
    (it.situation?'<div class="sit" id="sit">'+md(it.situation)+'</div>':'')+
    '<div class="qtx">'+md(it.frage)+'</div>'+body+
    '<div class="row" style="margin-top:18px">'+
     '<button class="btn sec" id="xprev"'+(EX.i===0?' disabled':'')+'>'+ic('left',14)+' zurück</button>'+
     '<button class="btn" id="xnext">'+(EX.i+1<EX.list.length?'weiter '+ic('right',14):'zur Abgabe')+'</button></div>'+
   '</div>'+
   '<h2>Übersicht</h2><div class="qnav">'+EX.list.map((x,k)=>'<button data-g="'+k+'" class="'+
     (k===EX.i?'cur':'')+' '+(EX.ans[x.id]?'ans':'')+' '+(EX.flag[x.id]?'flag':'')+'">'+(k+1)+'</button>').join('')+'</div>'+
   '<p class="small muted" style="margin-top:8px">Grau hinterlegt = beantwortet · goldener Rand = markiert</p></div>';
  const store=()=>{ const ta=V.querySelector('#xa'), ti=V.querySelector('#xi');
    if(ta) EX.ans[it.id]=ta.value;
    else if(ti) EX.ans[it.id]=ti.value;
    else EX.ans[it.id]=[...V.querySelectorAll('input:checked')].map(x=>x.value).join(';'); };
  V.querySelectorAll('#opts input').forEach(x=>x.onchange=()=>{ store();
    V.querySelectorAll('.opt').forEach(l=>l.classList.toggle('sel',l.querySelector('input').checked)); });
  V.querySelector('#xflag').onclick=()=>{ EX.flag[it.id]=!EX.flag[it.id]; store(); render(); };
  V.querySelector('#xprev').onclick=()=>{ store(); EX.i--; render(); window.scrollTo(0,0); };
  V.querySelector('#xnext').onclick=()=>{ store(); if(EX.i+1<EX.list.length){EX.i++; render(); window.scrollTo(0,0);} else examConfirm(); };
  V.querySelector('#xsub').onclick=()=>{ store(); examConfirm(); };
  V.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ store(); EX.i=+b.dataset.g; render(); window.scrollTo(0,0); });
  const sit=V.querySelector('#sit');
  if(sit&&sit.scrollHeight>sit.clientHeight+4){ const b=document.createElement('button');
    b.className='btn ghost sm'; b.style.margin='-8px 0 14px'; b.textContent='Situation ganz anzeigen';
    b.onclick=()=>{ sit.classList.toggle('open'); b.textContent=sit.classList.contains('open')?'einklappen':'Situation ganz anzeigen'; };
    sit.after(b); }
}
function examConfirm(){
  const offen=EX.list.filter(x=>!String(EX.ans[x.id]||'').trim()).length;
  const d=document.createElement('div'); d.className='pop';
  d.innerHTML='<div class="popc"><h2 style="margin-top:0">Prüfung abgeben?</h2>'+
   '<p class="muted">'+(offen?offen+' von '+EX.list.length+' Aufgaben sind noch unbeantwortet.':'Alle Aufgaben sind beantwortet.')+
   ' Nach der Abgabe siehst du Punkte, Lösungen und die Themenanalyse.</p>'+
   '<div class="row" style="margin-top:18px;justify-content:center"><button class="btn sec" id="no">Weiter bearbeiten</button>'+
   '<button class="btn" id="yes">Jetzt abgeben</button></div></div>';
  d.onclick=e=>{ if(e.target===d) d.remove(); };
  document.body.appendChild(d);
  d.querySelector('#no').onclick=()=>d.remove();
  d.querySelector('#yes').onclick=()=>{ d.remove(); examSubmit(); };
}
function examSubmit(){
  clearInterval(exTimer);
  const E=EX; if(!E) return go('pruefung');
  const res=E.list.map(it=>{ const a=E.ans[it.id]||'';
    let g;
    if(it.ohne_loesung) g={score:0,keine:true};
    else if(['freitext','rechnen','tabelle'].includes(it.typ)&&it.bereich===BER_IM){ g=gradeText(it,a); if(g.selbst) g.keine=true; }
    else g=gradeKsk(it,a);
    if(!String(a).trim()) g={score:0,leer:true};
    const p=P.res[it.id]||{n:0,best:0}; p.n++; p.best=Math.max(p.best||0,g.score||0); p.last=Date.now(); P.res[it.id]=p;
    return {it,a,g}; });
  const graded=res.filter(r=>!r.g.keine);
  const pct=graded.length?Math.round(graded.reduce((a,r)=>a+r.g.score,0)/graded.length*100):0;
  const min=Math.max(1,Math.round((Date.now()-E.t0)/60000));
  P.sims.push({date:today(),title:E.title,key:E.key,pct,min,n:E.list.length});
  if(P.sims.length>40) P.sims=P.sims.slice(-40);
  weekTick('sim'); addXp(Math.round(pct*0.6),'Prüfungssimulation');
  dayRec().min+=min; save(); checkBadges();
  EX=null; EXRES={title:E.title,res,pct,min,list:E.list};
  go('examres');
}
let EXRES=null;
function pExamRes(){
  if(!EXRES) return go('pruefung');
  const X=EXRES;
  const voll=X.res.filter(r=>r.g.score>=0.95).length, teil=X.res.filter(r=>r.g.score>=0.4&&r.g.score<0.95).length;
  const leer=X.res.filter(r=>r.g.leer).length;
  const selbst=X.res.filter(r=>r.g.keine&&!r.g.leer).length;
  const byTh={}; X.res.filter(r=>!r.g.keine).forEach(r=>{ const t=r.it.thema; (byTh[t]=byTh[t]||{r:0,n:0}); byTh[t].n++; byTh[t].r+=r.g.score; });
  const th=Object.entries(byTh).map(([k,v])=>({k,q:v.r/v.n,n:v.n})).sort((a,b)=>a.q-b.q);
  const note=X.pct>=92?'1 – sehr gut':X.pct>=81?'2 – gut':X.pct>=67?'3 – befriedigend':X.pct>=50?'4 – ausreichend':X.pct>=30?'5 – mangelhaft':'6 – ungenügend';
  const wrong=X.res.filter(r=>!r.g.keine&&r.g.score<0.7).map(r=>r.it);
  V.innerHTML='<h1>Auswertung – '+esc(X.title)+'</h1>'+
   '<div class="card" style="margin-bottom:18px;text-align:center;padding:26px">'+
    '<div class="kpi" style="font-size:52px;color:'+(X.pct>=50?'var(--ok)':'var(--bad)')+'">'+X.pct+'<small style="font-size:13px;text-transform:none;letter-spacing:0">von 100 Punkten · '+note+'</small></div>'+
    '<span class="bar '+(X.pct>=50?'ok':'bad')+'" style="margin-top:16px"><i style="width:'+X.pct+'%"></i></span>'+
    '<p class="small muted" style="margin:14px 0 0">Auswertung dieses Trainers auf Basis der offiziellen Lösungshinweise – keine IHK-Bewertung.'+
      (selbst?' '+selbst+' Aufgabe'+(selbst>1?'n lassen':' lässt')+' sich nicht zuverlässig automatisch bewerten und '+(selbst>1?'sind':'ist')+' in der Punktzahl nicht enthalten – prüfe sie beim Durchgehen selbst.':'')+'</p></div>'+
   '<div class="statrow"><div><b class="nums">'+voll+'</b><span>vollständig</span></div>'+
    '<div><b class="nums">'+teil+'</b><span>teilweise</span></div>'+
    '<div><b class="nums">'+leer+'</b><span>ohne Antwort</span></div>'+
    '<div><b class="nums">'+X.min+'</b><span>Minuten</span></div></div>'+
   '<h2>Themenanalyse</h2><div class="card"><table class="stat">'+th.map(t=>
    '<tr><td>'+esc(t.k)+'</td><td style="width:120px"><span class="bar sm '+(t.q>=0.7?'ok':t.q>=0.4?'w':'bad')+'"><i style="width:'+Math.round(t.q*100)+'%"></i></span></td>'+
    '<td class="nums" style="width:70px;text-align:right">'+Math.round(t.q*100)+' %</td></tr>').join('')+'</table></div>'+
   '<div class="row" style="margin:20px 0">'+
    (wrong.length?'<button class="btn" id="tr">'+wrong.length+' Fehler dieser Prüfung trainieren</button>':'')+
    '<button class="btn sec" id="det">Aufgaben mit Lösungen durchgehen</button>'+
    '<button class="btn ghost" id="bk">Zurück</button></div>';
  const tr=V.querySelector('#tr');
  if(tr) tr.onclick=()=>startRun(wrong.map(i=>({k:i.typ==='buchungssatz'?'buch':i.typ==='reihenfolge'?'order':(isNum(i)&&i.bereich!==BER_IM)?'num':'task',id:i.id})),
    {title:'Fehler: '+X.title,back:{p:'pruefung'}});
  V.querySelector('#det').onclick=()=>startRun(X.list.map(i=>({k:i.typ==='buchungssatz'?'buch':i.typ==='reihenfolge'?'order':(isNum(i)&&i.bereich!==BER_IM)?'num':'task',id:i.id})),
    {title:X.title+' – Durchgang',back:{p:'pruefung'}});
  V.querySelector('#bk').onclick=()=>go('pruefung');
}

/* ═══════════════ RECHENTRAINER ═══════════════ */
const RKAT=[
 {id:'fin',n:'Finanzierung: Zins, Tilgung, Annuität',mods:['m_fin','k_div'],rx:/annuit|tilgung|zins|darlehen|restschuld|disagio/i},
 {id:'bew',n:'Immobilienbewertung & Kaufpreis',mods:['m_fin','m_kauf'],rx:/verkehrswert|ertragswert|sachwert|bodenricht|kaufpreis|erwerbsneben|grunderwerb/i},
 {id:'miet',n:'Miete, Mieterhöhung, Flächen',mods:['m_miet'],rx:/vergleichsmiete|mieterh|quadrat|wohnfl|kappungs|modernisier/i},
 {id:'bk',n:'Betriebs- und Heizkosten',mods:['m_miet','m_weg'],rx:/betriebskost|heizkost|umlage|abrechnung|hausgeld|wirtschaftsplan/i},
 {id:'klr',n:'Kosten- und Leistungsrechnung',mods:['k_klr'],rx:/zuschlag|deckungsbeitrag|kalkul|break|kostenstelle/i},
 {id:'ctrl',n:'Kennzahlen & Controlling',mods:['k_ctrl'],rx:/quote|rentabilit|liquidit|cashflow|deckung|umschlag/i},
 {id:'ja',n:'Abschreibung & Bewertung',mods:['k_ja'],rx:/abschreib|afa|restbuchwert|anschaffungskost|rueckstell/i},
 {id:'erb',n:'Erbbaurecht & Sonstiges',mods:['m_erb','m_bau','m_makl','m_org','m_mark','k_buch'],rx:/./}
];
function rechPool(kat){
  const all=ITEMS.filter(isNum);
  if(!kat) return all;
  const k=RKAT.find(x=>x.id===kat); if(!k) return all;
  return all.filter(i=>k.mods.includes(i.modul) && (k.rx.test(i.frage)||k.rx.test(i.thema)||k.id==='erb'));
}
function pRechnen(){
  const all=ITEMS.filter(isNum);
  const done=all.filter(i=>(P.res[i.id]||{}).best>=0.7).length;
  V.innerHTML='<div class="crumb"><button id="bl">Lernen</button> › <span>Rechentrainer</span></div>'+
   '<h1>Rechentrainer</h1><p class="lede">'+all.length+' Rechenaufgaben aus 14 Original-Prüfungen. Du tippst das Ergebnis ein, bekommst bei Bedarf einen Ansatz und danach den vollständigen Rechenweg der IHK.</p>'+
   '<div class="card" style="margin-bottom:20px"><div class="row" style="justify-content:space-between;align-items:flex-end">'+
    '<div><b>'+done+' von '+all.length+' Original-Aufgaben sitzen</b><span class="bar sm" style="margin-top:8px;width:220px"><i style="width:'+Math.round(done/all.length*100)+'%"></i></span></div>'+
    '<div class="row"><button class="btn" id="mix">'+ic('play',15)+' 8 gemischte</button>'+
     (uebRechAll().length?'<button class="btn sec" id="ueb">'+uebRechAll().length+' Rechen-Übungen</button>':'')+
     '</div></div></div>'+
   '<div class="grid g2">'+RKAT.map(k=>{ const p=rechPool(k.id);
     if(!p.length) return '';
     const d=p.filter(i=>(P.res[i.id]||{}).best>=0.7).length;
     return '<button class="tile" data-k="'+k.id+'"><div class="thead"><span class="ttile" style="--h:'+(MHUE[k.mods[0]]||200)+'">'+ic('klr',19)+'</span>'+
      '<span class="tname">'+esc(k.n)+'</span></div><p class="tsub">'+p.length+' Aufgaben</p>'+
      '<span class="bar sm '+(d===p.length?'ok':'')+'"><i style="width:'+Math.round(d/p.length*100)+'%"></i></span>'+
      '<div class="tfoot"><span class="nums">'+d+' / '+p.length+'</span></div></button>';}).join('')+'</div>';
  V.querySelector('#bl').onclick=()=>go('lernen');
  V.querySelector('#mix').onclick=()=>startRun(stepsRech(8),{title:'Rechentrainer',back:{p:'rechnen'}});
  const uf=V.querySelector('#ueb'); if(uf) uf.onclick=()=>startRun(shuffle(uebRechAll()).slice(0,8),
    {title:'Rechen-Übungen',back:{p:'rechnen'}});
  V.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ const p=rechPool(b.dataset.k);
    const open=p.filter(i=>!((P.res[i.id]||{}).best>=0.7));
    startRun(shuffle(open.length?open:p).slice(0,10).map(i=>({k:'num',id:i.id})),
      {title:(RKAT.find(x=>x.id===b.dataset.k)||{}).n||'Rechnen',back:{p:'rechnen'}}); });
}

/* ═══════════════ FORMELSAMMLUNG (aus den Lektionen abgeleitet) ═══════════════ */
function formeln(){
  const out=[];
  MODS.forEach(m=>{ modL(m.id).lektionen.forEach((l,li)=>{
    l.inhalt.split('\n').forEach(ln=>{ const t=ln.trim();
      if(t.startsWith('|')||t.length>120) return;
      if(!/=/.test(t)||!/[A-Za-zÄÖÜäöü]{3}/.test(t)) return;
      if(/[.!?]$/.test(t)) return;
      if(!/[A-ZÄÖÜ]/.test(t[0]||'')) return;
      out.push({f:t.replace(/\*\*/g,''),m:m.id,mn:m.name,l:li,lt:l.titel}); }); }); });
  const seen=new Set();
  return out.filter(x=>{ const k=norm(x.f); if(seen.has(k)||k.length<8) return false; seen.add(k); return true; });
}
function pFormeln(){
  const F=formeln(); const byMod={};
  F.forEach(f=>{ (byMod[f.mn]=byMod[f.mn]||[]).push(f); });
  V.innerHTML='<div class="crumb"><button id="bl">Lernen</button> › <span>Formelsammlung</span></div>'+
   '<h1>Formelsammlung</h1><p class="lede">'+F.length+' Formeln, automatisch aus den Lektionstexten gesammelt. Jede Formel verlinkt auf die Lektion, in der sie erklärt wird.</p>'+
   Object.entries(byMod).map(([mn,list])=>'<h2>'+esc(mn)+'</h2><div class="card">'+
     list.map(f=>'<div class="setrow"><div class="sl"><div class="frmline" style="margin:0">'+esc(f.f)+'</div>'+
      '<span style="margin-top:6px;display:block">'+esc(f.lt)+'</span></div>'+
      '<button class="btn ghost sm" data-f="'+f.m+'|'+f.l+'">Lektion '+ic('right',13)+'</button></div>').join('')+'</div>').join('')+
   '<div class="row" style="margin-top:22px"><button class="btn" id="ue">Passende Rechenaufgaben üben</button></div>';
  V.querySelector('#bl').onclick=()=>go('lernen');
  V.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{ const [m,l]=b.dataset.f.split('|'); go('lektion',{m,i:+l}); });
  V.querySelector('#ue').onclick=()=>{ const all=ITEMS.filter(isNum);
    startRun(shuffle(all).slice(0,8).map(i=>({k:'num',id:i.id})),{title:'Formeln anwenden',back:{p:'formeln'}}); };
}

/* ═══════════════ IHK RICHTIG LESEN ═══════════════ */
const OPERATOREN=[
 ['Nennen','Begriffe oder Aussagen ohne Erklärung aufzählen. Stichworte genügen – aber es müssen so viele sein, wie gefordert.'],
 ['Beschreiben','Sachverhalt mit eigenen Worten in ganzen Sätzen darstellen, ohne ihn zu bewerten.'],
 ['Erläutern','Zusammenhänge darstellen und mit Beispielen oder Begründungen verständlich machen – deutlich mehr als „nennen".'],
 ['Begründen','Aussagen auf Ursachen und Regeln zurückführen: weil …, deshalb …'],
 ['Berechnen','Ergebnis mit nachvollziehbarem Rechenweg ermitteln. Ohne Rechenweg gibt es in der Regel Punktabzug.'],
 ['Beurteilen','Einen Sachverhalt abwägen und zu einem begründeten Urteil kommen.'],
 ['Prüfen','Einen Sachverhalt an einer Regel messen und das Ergebnis begründen.'],
 ['Erstellen / Anfertigen','Ein Schriftstück, eine Tabelle oder eine Berechnung vollständig ausfüllen.']];
function fallen(){
  const out=[];
  const mitAnzahl=ITEMS.filter(i=>i.n_gefordert>=2).length;
  if(mitAnzahl) out.push({t:'Die geforderte Anzahl zählt',
    d:'In '+mitAnzahl+' der hinterlegten Aufgaben steht eine konkrete Zahl („Nennen Sie 2 …"). Bewertet werden nur so viele Angaben, wie gefordert sind – und zwar die ersten. Schreib nie mehr in der Hoffnung, dass schon etwas Richtiges dabei ist.'});
  const fm=ITEMS.filter(i=>i.fm&&i.fm.length);
  fm.slice(0,8).forEach(i=>{ (i.fm||[]).forEach(f=>out.push({t:i.thema+' · '+i.termin, d:f.hinweis})); });
  const warn=ITEMS.filter(i=>i.warn&&i.warn.length);
  const seen=new Set();
  warn.forEach(i=>(i.warn||[]).forEach(w=>{ if(seen.has(w.t))return; seen.add(w.t);
    out.push({t:'Rechtsstand: '+w.t, d:w.h}); }));
  return out;
}
function pOperatoren(){
  const F=fallen();
  V.innerHTML='<div class="crumb"><button id="bl">Lernen</button> › <span>IHK richtig lesen</span></div>'+
   '<h1>IHK richtig lesen</h1>'+
   '<p class="lede">Viele Punkte gehen nicht durch fehlendes Wissen verloren, sondern weil die Aufgabenstellung nicht genau gelesen wurde.</p>'+
   '<h2>Prüfungsoperatoren</h2><div class="card">'+OPERATOREN.map(([o,d])=>
    '<div class="setrow"><div class="sl"><b>'+esc(o)+'</b><span>'+esc(d)+'</span></div></div>').join('')+'</div>'+
   '<h2>Fallen aus deinen Aufgabensätzen</h2>'+
   '<p class="lede">Abgeleitet aus den Hinweisen in den offiziellen Lösungen deiner Prüfungen.</p>'+
   '<div class="card">'+F.map(f=>'<div class="setrow"><div class="sl"><b>'+ic('alert',13)+' '+esc(f.t)+'</b><span>'+esc(f.d)+'</span></div></div>').join('')+'</div>';
  V.querySelector('#bl').onclick=()=>go('lernen');
}

/* ═══════════════ SCHWÄCHEN-TRAINER ═══════════════ */
function pSchwach(){
  const th=themenStat(), w=wrongList();
  const alt=[]; MODS.forEach(m=>{ const L=modL(m.id);
    L.mc.forEach((_,i)=>{ const s=srs(qk(m.id,i)); if(s&&s.b>=2&&s.d<plusDays(today(),-10)) alt.push({m:m.id,i}); }); });
  const rech=ITEMS.filter(i=>isNum(i)&&P.res[i.id]&&P.res[i.id].best<0.7);
  const ihk=ITEMS.filter(i=>P.res[i.id]&&P.res[i.id].best<0.5&&!i.ohne_loesung);
  V.innerHTML='<div class="crumb"><button id="bl">Lernen</button> › <span>Schwächen</span></div>'+
   '<h1>Meine Schwächen</h1><p class="lede">Automatisch erkannt aus deiner Trefferquote, deinen Fehlern und dem, was du lange nicht wiederholt hast.</p>'+
   (th.length?'<h2>Trefferquote nach Thema</h2><div class="card"><table class="stat">'+
     th.slice(0,14).map(x=>'<tr><td>'+esc(x.th)+'</td><td style="width:120px"><span class="bar sm '+(x.q>=0.75?'ok':x.q>=0.5?'w':'bad')+'"><i style="width:'+Math.round(x.q*100)+'%"></i></span></td>'+
     '<td class="nums" style="width:56px;text-align:right">'+Math.round(x.q*100)+' %</td>'+
     '<td style="width:80px;text-align:right"><button class="btn ghost sm" data-t="'+x.mid+'">üben</button></td></tr>').join('')+
     '</table></div>':'<div class="card"><p class="muted" style="margin:0">Noch zu wenig Daten. Beantworte ein paar Fragen, dann erkenne ich deine Schwachstellen automatisch.</p></div>')+
   '<div class="statrow" style="margin-top:20px">'+
    '<div><b class="nums">'+w.length+'</b><span>offene Fehler</span></div>'+
    '<div><b class="nums">'+alt.length+'</b><span>lange nicht geübt</span></div>'+
    '<div><b class="nums">'+rech.length+'</b><span>Rechenlücken</span></div>'+
    '<div><b class="nums">'+ihk.length+'</b><span>schwache IHK-Aufgaben</span></div></div>'+
   '<div class="row" style="margin-top:20px">'+
    '<button class="btn" id="tr">'+ic('play',15)+' Schwächen trainieren (14 Aufgaben)</button>'+
    (rech.length?'<button class="btn sec" id="trR">Nur Rechnen</button>':'')+
    (ihk.length?'<button class="btn sec" id="trI">Nur IHK-Aufgaben</button>':'')+'</div>';
  V.querySelector('#bl').onclick=()=>go('lernen');
  V.querySelector('#tr').onclick=()=>startRun(schwachSteps(14),{title:'Schwächen-Training',back:{p:'schwach'}});
  const a=V.querySelector('#trR'); if(a) a.onclick=()=>startRun(shuffle(rech).slice(0,8).map(i=>({k:'num',id:i.id})),{title:'Rechenlücken',back:{p:'schwach'}});
  const b=V.querySelector('#trI'); if(b) b.onclick=()=>startRun(shuffle(ihk).slice(0,8).map(i=>({k:i.typ==='buchungssatz'?'buch':i.typ==='reihenfolge'?'order':(isNum(i)&&i.bereich!==BER_IM)?'num':'task',id:i.id})),{title:'Schwache IHK-Aufgaben',back:{p:'schwach'}});
  V.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>startRun(stepsQuick(x.dataset.t,10),{title:MOD_BY[x.dataset.t].name,back:{p:'schwach'}}));
}

/* ═══════════════ SEITE: FORTSCHRITT ═══════════════ */
function pFortschritt(){
  const G=gesamtReife(), A=bereichReife(BER_IM), B=bereichReife(BER_KS);
  const lvl=levelOf(P.xp);
  const days=[]; for(let i=29;i>=0;i--){ const d=plusDays(today(),-i); days.push({d,s:P.stats[d]||{q:0,r:0,xp:0}}); }
  const maxq=Math.max(1,...days.map(x=>x.s.q));
  const tq=Object.values(P.stats).reduce((a,s)=>a+s.q,0), tr=Object.values(P.stats).reduce((a,s)=>a+s.r,0);
  const lek=Object.keys(P.read).length;
  const kar=Object.keys(P.srs).filter(k=>k[0]==='c'&&P.srs[k].b>=2).length;
  const quiz=Object.keys(P.srs).filter(k=>k[0]==='q'&&P.srs[k].b>=2).length;
  const ihk=Object.keys(P.res).filter(k=>P.res[k].best>=0.7).length;
  const rech=ITEMS.filter(i=>isNum(i)&&(P.res[i.id]||{}).best>=0.7).length;
  const rechT=ITEMS.filter(isNum).length;
  const st=themenStat();
  const stark=st.filter(x=>x.q>=0.8).slice(-4).reverse(), schw=st.filter(x=>x.q<0.65).slice(0,4);
  const mins=Object.values(P.stats).length;
  V.innerHTML='<h1>Dein Lernstand</h1>'+
   '<div class="card" style="margin-bottom:18px">'+
    '<div class="reifehead"><span class="muted">Prüfungsreife (Schätzung)</span><b style="font-size:26px">'+Math.round(G*100)+' %</b></div>'+
    '<span class="bar '+(G>=0.6?'ok':G>=0.35?'w':'')+'"><i style="width:'+Math.round(G*100)+'%"></i></span>'+
    '<p class="small muted" style="margin:12px 0 0">Berücksichtigt gelesene Lektionen, Karteikarten- und Quizstand, deine Ergebnisse bei den Original-IHK-Aufgaben und die letzten Prüfungssimulationen. Das ist eine Einschätzung deines Lernstands – keine Vorhersage über das Bestehen der Prüfung.</p></div>'+
   '<div class="grid g2" style="margin-bottom:18px">'+
    [[A,'Immobilienwirtschaft','zählt in der Prüfung doppelt'],[B,'Kaufmännische Steuerung','zählt einfach']].map(([x,n,s])=>
    '<div class="card"><div class="reifehead"><span class="muted">'+n+'</span><b>'+Math.round(x.val*100)+' %</b></div>'+
    '<span class="bar '+(x.val>=0.6?'ok':'')+'"><i style="width:'+Math.round(x.val*100)+'%"></i></span>'+
    '<p class="small muted" style="margin:8px 0 0">'+s+'</p></div>').join('')+'</div>'+
   '<h2>Module</h2><div class="card"><table class="stat">'+
    '<tr><th>Modul</th><th>Lektionen</th><th>Quiz</th><th>IHK</th><th style="width:100px">Stand</th></tr>'+
    MODS.map(m=>{ const r=modReife(m.id), L=modL(m.id), it=BY_MOD[m.id]||[];
      return '<tr><td>'+esc(m.name)+'</td>'+
       '<td class="nums small">'+L.lektionen.filter((_,i)=>P.read[m.id+':L'+i]).length+'/'+L.lektionen.length+'</td>'+
       '<td class="nums small">'+Math.round(r.quiz*100)+'%</td>'+
       '<td class="nums small">'+(it.length?r.aufgN+'/'+it.length:'–')+'</td>'+
       '<td><span class="bar sm '+(r.val>=0.7?'ok':'')+'"><i style="width:'+Math.round(r.val*100)+'%"></i></span></td></tr>';}).join('')+
    '</table></div>'+
   '<h2>Aktivität der letzten 30 Tage</h2><div class="card">'+
    '<div class="spark">'+days.map(x=>'<div class="'+(x.s.q?'on':'')+'" style="height:'+Math.max(3,Math.round(x.s.q/maxq*56))+'px" title="'+fmtDay(x.d)+': '+x.s.q+' Aufgaben"></div>').join('')+'</div>'+
    '<div class="row small muted" style="margin-top:9px;justify-content:space-between"><span>'+fmtDay(days[0].d)+'</span><span>heute</span></div></div>'+
   '<div class="statrow" style="margin-top:18px">'+
    '<div><b class="nums">'+tq+'</b><span>Aufgaben bearbeitet</span></div>'+
    '<div><b class="nums">'+(tq?Math.round(tr/tq*100):0)+'%</b><span>Trefferquote</span></div>'+
    '<div><b class="nums">'+streakNow()+' / '+(P.streak.best||0)+'</b><span>Serie jetzt / best</span></div>'+
    '<div><b class="nums">'+P.sims.length+'</b><span>Simulationen</span></div></div>'+
   '<div class="statrow" style="margin-top:2px">'+
    '<div><b class="nums">'+lek+' / '+totLek()+'</b><span>Lektionen</span></div>'+
    '<div><b class="nums">'+kar+' / '+totKar()+'</b><span>Karten sitzen</span></div>'+
    '<div><b class="nums">'+quiz+' / '+totMc()+'</b><span>Fragen sitzen</span></div>'+
    '<div><b class="nums">'+rech+' / '+rechT+'</b><span>Rechenaufgaben</span></div></div>'+
   ((stark.length||schw.length)?'<div class="grid g2" style="margin-top:20px">'+
    (stark.length?'<div class="card"><b class="small">'+ic('check',14)+' Stärken</b><ul style="margin:10px 0 0;padding-left:20px">'+
      stark.map(x=>'<li>'+esc(x.th)+' <span class="muted nums">'+Math.round(x.q*100)+' %</span></li>').join('')+'</ul></div>':'')+
    (schw.length?'<div class="card"><b class="small">'+ic('weak',14)+' Baustellen</b><ul style="margin:10px 0 0;padding-left:20px">'+
      schw.map(x=>'<li>'+esc(x.th)+' <span class="muted nums">'+Math.round(x.q*100)+' %</span></li>').join('')+'</ul>'+
      '<button class="btn sec sm" id="sw" style="margin-top:12px">Gezielt trainieren</button></div>':'')+'</div>':'')+
   '<h2>Abzeichen <span class="tag">'+BADGES.filter(b=>P.badges[b.id]).length+' / '+BADGES.length+'</span></h2>'+
   '<div class="badges">'+BADGES.map(b=>'<div class="bdg '+(P.badges[b.id]?'on':'')+'"><div class="e">'+
     ic(P.badges[b.id]?b.e:'lock',24)+'</div><div class="n">'+esc(b.n)+'</div></div>').join('')+'</div>'+
   '<h2>Einstellungen</h2><div class="card">'+
    '<div class="setrow"><div class="sl"><b>Prüfungstermin</b><span>Schriftliche Abschlussprüfung Immobilienwirtschaft</span></div>'+
     '<input type="date" id="exam" value="'+P.plan.exam+'" style="max-width:180px"></div>'+
    '<div class="setrow"><div class="sl"><b>Tagesziel</b><span>Danach richtet sich, wie viel deine Tagesmission umfasst</span></div>'+
     '<div class="seg">'+[15,30,45,60,90].map(v=>'<button data-min="'+v+'" aria-pressed="'+(P.plan.min===v)+'">'+v+'</button>').join('')+'</div></div>'+
    '<div class="setrow"><div class="sl"><b>Level '+lvl.l+' · '+esc(lvl.rank)+'</b><span>'+P.xp+' XP insgesamt · '+lvl.cur+' / '+lvl.need+' bis Level '+(lvl.l+1)+'</span>'+
     '<span class="bar sm" style="margin-top:7px"><i style="width:'+Math.round(lvl.cur/lvl.need*100)+'%"></i></span></div></div>'+
    '<div class="setrow"><div class="sl"><b>Serienretter</b><span>'+(P.streak.saver||0)+' verfügbar – rettet deine Serie, wenn ein Tag ausfällt. Verdienst du dir über Wochenziele.</span></div></div>'+
    '<div class="setrow"><div class="sl"><b>Geräte-Abgleich</b><span>'+
     (SY.on?'Aktiv – dein Lernstand gleicht sich zwischen Handy und PC ab. Status: '+esc(syStat())
           :'Aus – dieser Stand wird nur auf diesem Gerät gespeichert. Mit dem Abgleich-Code schaltest du ihn ein.')+'</span></div>'+
     '<div class="row">'+(SY.on?'<button class="btn sec sm" id="synow">Jetzt abgleichen</button>':'')+
      '<button class="btn sec sm" id="syset">'+(SY.on?'Ändern':'Einrichten')+'</button></div></div>'+
    '<div class="setrow"><div class="sl"><b>Fortschritt sichern</b><span>Als Datei oder als Text-Code sichern und auf einem anderen Gerät wieder einlesen</span></div>'+
     '<div class="row"><button class="btn sec sm" id="exp">Sichern</button>'+
     '<button class="btn sec sm" id="impt">Einlesen</button>'+
     (SY.on?'<button class="btn sec sm" id="snp">Ältere Stände</button>':'')+
     '<label class="btn sec sm" style="cursor:pointer">Datei<input type="file" id="imp" accept="application/json" class="hide"></label></div></div>'+
    '<div class="setrow"><div class="sl"><b>Zurücksetzen</b><span>Löscht Fortschritt, XP, Serie, Markierungen und Notizen unwiderruflich</span></div>'+
     '<button class="btn ghost sm" id="rst">Alles zurücksetzen</button></div></div>';
  const sw=V.querySelector('#sw'); if(sw) sw.onclick=()=>go('schwach');
  V.querySelector('#exam').onchange=e=>{ if(e.target.value){ P.plan.exam=e.target.value; P.miss=null; save(); render(); } };
  V.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>{ P.plan.min=+b.dataset.min; P.miss=null; save(); toast('Tagesziel: '+b.dataset.min+' Minuten'); render(); });
  V.querySelector('#exp').onclick=()=>{ saveNow(); expPop(); };
  V.querySelector('#impt').onclick=()=>impPop();
  const snb=V.querySelector('#snp'); if(snb) snb.onclick=()=>snapPop();
  const sys=V.querySelector('#syset'); if(sys) sys.onclick=()=>ghSetup();
  const syb=V.querySelector('#synow'); if(syb) syb.onclick=async()=>{ syb.disabled=true;
    await syPull(); await syPush(); syb.disabled=false; toast(SY.fail?'Kein Kontakt zum Server.':'Abgeglichen.'); render(); };
  V.querySelector('#imp').onchange=e=>{ const f=e.target.files[0]; if(!f) return;
    const fr=new FileReader();
    fr.onload=()=>{ if(applyImport(fr.result)){ toast('Fortschritt eingelesen und zusammengeführt.'); paintHeader(); render(); }
      else toast('Datei konnte nicht gelesen werden.'); };
    fr.readAsText(f); };
  V.querySelector('#rst').onclick=()=>{
    const d=document.createElement('div'); d.className='pop';
    d.innerHTML='<div class="popc"><h2 style="margin-top:0">Wirklich alles zurücksetzen?</h2>'+
      '<p class="muted">Fortschritt, XP, Serie, Abzeichen, Markierungen und Notizen werden gelöscht. Das lässt sich nicht rückgängig machen. Exportiere vorher, wenn du unsicher bist.</p>'+
      '<div class="row" style="margin-top:18px;justify-content:center"><button class="btn sec" id="n">Abbrechen</button>'+
      '<button class="btn" style="background:var(--bad)" id="y">Ja, löschen</button></div></div>';
    d.onclick=e=>{ if(e.target===d) d.remove(); };
    document.body.appendChild(d);
    d.querySelector('#n').onclick=()=>d.remove();
    d.querySelector('#y').onclick=()=>{ const ex=P.plan; P=blank(); P.plan=ex; saveNow(); d.remove();
      toast('Alles zurückgesetzt.'); paintHeader(); go('heute'); }; };
}

/* ═══════════════ GERÄTE-ABGLEICH über GitHub ═══════════════ */
/* Der Lernstand liegt als eine Datei in einem privaten Repository.
   Jede Speicherung ist ein Commit – die komplette Historie bleibt erhalten.
   Aktiv nur, wenn beim Entsperren Zugangsdaten mitgeliefert wurden. */
const SY={on:false,sha:null,t:null,busy:false,last:0,fail:0};
function syStat(){ return !SY.on?'aus':(SY.fail?'keine Verbindung':(SY.last?'zuletzt '+new Date(SY.last).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'bereit')); }

const ghURL=()=>'https://api.github.com/repos/'+GH.repo+'/contents/'+GH.path;
const ghHead=()=>({Authorization:'Bearer '+GH.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'});
function b64enc(str){ const b=new TextEncoder().encode(str); let s=''; const CH=0x8000;
  for(let i=0;i<b.length;i+=CH) s+=String.fromCharCode.apply(null,b.subarray(i,i+CH)); return btoa(s); }
function b64dec(b64){ const bin=atob(b64.replace(/\s+/g,''));
  const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(u); }

async function ghLoad(){
  const r=await fetch(ghURL()+'?ref='+encodeURIComponent(GH.branch)+'&t='+Date.now(),
    {headers:ghHead(),cache:'no-store'});
  if(r.status===404) return {sha:null,state:null};
  if(!r.ok) throw new Error('github '+r.status);
  const j=await r.json();
  let st=null; try{ st=JSON.parse(b64dec(j.content||'')); }catch(e){}
  return {sha:j.sha,state:st};
}
async function ghSave(state,sha){
  const body={message:'Lernstand '+new Date().toLocaleString('de-DE'),
    content:b64enc(JSON.stringify(state)),branch:GH.branch};
  if(sha) body.sha=sha;
  const r=await fetch(ghURL(),{method:'PUT',headers:Object.assign(ghHead(),
    {'content-type':'application/json'}),body:JSON.stringify(body)});
  if(r.status===409||r.status===422) return {conflict:true};
  if(!r.ok) throw new Error('github '+r.status);
  const j=await r.json();
  return {sha:(j.content||{}).sha||null};
}

function syApply(remote,sha){
  const before=JSON.stringify(P);
  if(remote) mergeState(remote);
  SY.sha=sha;
  return JSON.stringify(P)!==before;
}
async function syPull(quiet){
  if(!SY.on||SY.busy) return;
  SY.busy=true;
  try{ const d=await ghLoad(); SY.fail=0; SY.last=Date.now();
    if(d.sha!==SY.sha){
      if(syApply(d.state,d.sha)){ paintHeader(); render();
        if(!quiet) toast('Lernstand vom anderen Gerät übernommen.'); }
    }
  }catch(e){ SY.fail=1; }
  finally{ SY.busy=false; }
}
async function syPush(){
  if(!SY.on||SY.busy) return;
  SY.busy=true;
  try{
    for(let i=0;i<3;i++){
      const res=await ghSave(P,SY.sha);
      if(res.conflict){ const d=await ghLoad(); syApply(d.state,d.sha); continue; }
      SY.sha=res.sha; SY.fail=0; SY.last=Date.now(); break;
    }
  }catch(e){ SY.fail=1; }
  finally{ SY.busy=false; }
}
function syLater(){ if(!SY.on) return; clearTimeout(SY.t);
  const gap=Math.max(9000, 25000-(Date.now()-(SY.last||0)));
  SY.t=setTimeout(syPush,gap); }
function syFlush(){ if(!SY.on) return; clearTimeout(SY.t); syPush(); }

async function syInit(){
  if(!GH||!GH.token||!GH.repo) return;
  try{
    const d=await ghLoad();
    SY.on=true; SY.last=Date.now();
    if(d.state){ if(syApply(d.state,d.sha)){ paintHeader(); render(); } else SY.sha=d.sha; }
    else SY.sha=d.sha;
    syPush();
    addEventListener('visibilitychange',()=>{
      if(document.hidden) syFlush();
      else if(R.p!=='run'&&R.p!=='exam') syPull();
    });
    addEventListener('pagehide',syFlush);
    setInterval(()=>{ if(!document.hidden&&R.p!=='run'&&R.p!=='exam') syPull(true); },90000);
  }catch(e){ SY.on=false; }
}

/* ═══════════════ SICHERN / EINLESEN ═══════════════ */
/* Zusammenf\u00fchren ist bewusst \u201emonoton\u201c: es kann Lernstand nur hinzuf\u00fcgen,
   nie l\u00f6schen. Mehrfaches Anwenden \u00e4ndert nichts (wichtig f\u00fcr den Sync). */
function mergeState(o){
  if(!o||typeof o!=='object') return false;
  ['read','badges','modDone','hl'].forEach(k=>Object.assign(P[k]=P[k]||{},o[k]||{}));
  Object.entries(o.stats||{}).forEach(([d,v])=>{ const c=P.stats[d]||{q:0,r:0,xp:0};
    P.stats[d]={q:Math.max(c.q||0,v.q||0),r:Math.max(c.r||0,v.r||0),xp:Math.max(c.xp||0,v.xp||0)}; });
  Object.entries(o.srs||{}).forEach(([k,v])=>{ const c=P.srs[k];
    if(!c||(v.b||0)>(c.b||0)||((v.b||0)===(c.b||0)&&(v.n||0)>(c.n||0))) P.srs[k]=v; });
  Object.entries(o.res||{}).forEach(([k,v])=>{ const c=P.res[k]; if(!c||(v.best||0)>(c.best||0)) P.res[k]=v; });
  if((o.xp||0)>P.xp) P.xp=o.xp;
  if(o.streak){ const a=P.streak||{},b=o.streak;
    P.streak={n:Math.max(a.n||0,b.n||0),best:Math.max(a.best||0,b.best||0),
      last:((a.last||'')>(b.last||''))?a.last:(b.last||''),saver:Math.max(a.saver||0,b.saver||0)}; }
  if(o.day&&o.day.d===today()){ const a=P.day||{};
    P.day={d:today(),xp:Math.max(a.xp||0,o.day.xp||0),min:Math.max(a.min||0,o.day.min||0),
      items:Math.max(a.items||0,o.day.items||0)}; }
  if(Array.isArray(o.sims)){ const seen={}; P.sims=o.sims.concat(P.sims)
    .filter(x=>{ const k=JSON.stringify(x); if(seen[k]) return false; seen[k]=1; return true; }).slice(-40); }
  if(o.plan) P.plan=Object.assign(P.plan,o.plan);
  if(o.week){ if(!P.week||P.week.w!==o.week.w){ if(!P.week) P.week=o.week; }
    else { Object.assign(P.week.days=P.week.days||{},o.week.days||{});
      Object.assign(P.week.claimed=P.week.claimed||{},o.week.claimed||{});
      ['q','sims','fix'].forEach(k=>P.week[k]=Math.max(P.week[k]||0,o.week[k]||0)); } }
  if(o.miss&&o.miss.d===today()){
    if(!P.miss||P.miss.d!==o.miss.d||P.miss.min!==o.miss.min) P.miss=o.miss;
    else Object.assign(P.miss.done=P.miss.done||{},o.miss.done||{});
  }
  saveNow(); return true;
}
function applyImport(txt){ try{ return mergeState(JSON.parse(txt)); }catch(e){ return false; } }
function popShell(title,inner){
  const d=document.createElement('div'); d.className='pop';
  d.innerHTML='<div class="popc" style="max-width:620px;width:100%;text-align:left">'+
    '<h2 style="margin-top:0">'+title+'</h2>'+inner+'</div>';
  d.onclick=e=>{ if(e.target===d) d.remove(); };
  document.body.appendChild(d); return d;
}
function expPop(){
  const txt=JSON.stringify(P);
  const d=popShell('Fortschritt sichern',
    '<p class="muted">Kopiere den Text und bewahre ihn auf – oder speichere ihn als Datei. Auf dem anderen Gerät fügst du ihn unter „Einlesen" wieder ein.</p>'+
    '<textarea id="xt" readonly style="width:100%;height:150px;font-family:var(--mono);font-size:11px;padding:10px;border-radius:var(--rs);border:1px solid var(--line2);background:var(--panel2);color:var(--txt)"></textarea>'+
    '<div class="row" style="margin-top:14px"><button class="btn sm" id="cp">Text kopieren</button>'+
    '<button class="btn sec sm" id="dl">Als Datei speichern</button>'+
    '<button class="btn ghost sm" id="cl">Schließen</button></div>');
  const ta=d.querySelector('#xt'); ta.value=txt;
  d.querySelector('#cp').onclick=()=>{ ta.select(); ta.setSelectionRange(0,txt.length);
    const done=()=>toast('In die Zwischenablage kopiert.');
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done,()=>{ try{document.execCommand('copy');done();}catch(e){ toast('Bitte von Hand markieren und kopieren.'); } });
    else { try{ document.execCommand('copy'); done(); }catch(e){ toast('Bitte von Hand markieren und kopieren.'); } } };
  d.querySelector('#dl').onclick=()=>{ try{
      const blob=new Blob([txt],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
      a.download='ihk-lernfortschritt-'+today()+'.json'; document.body.appendChild(a); a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500); toast('Datei wurde erzeugt.');
    }catch(e){ toast('Speichern hier nicht möglich – nimm den Text.'); } };
  d.querySelector('#cl').onclick=()=>d.remove();
}
function ghPack(){ return btoa(unescape(encodeURIComponent(JSON.stringify(GH)))); }
function ghUnpack(t){ try{ const o=JSON.parse(decodeURIComponent(escape(atob(t.trim()))));
  return (o&&o.repo&&o.token)?o:null; }catch(e){ return null; } }
function ghSetup(){
  const on=!!(GH&&GH.token);
  const d=popShell('Geräte-Abgleich einrichten',
    '<p class="muted">Füge hier den Abgleich-Code ein. Danach gleicht sich dein Lernstand zwischen allen Geräten ab, auf denen du denselben Code eingetragen hast.</p>'+
    '<textarea id="gt" placeholder="Abgleich-Code einfügen" style="width:100%;height:110px;font-family:var(--mono);font-size:11px;padding:10px;border-radius:var(--rs);border:1px solid var(--line2);background:var(--panel2);color:var(--txt)"></textarea>'+
    '<div class="row" style="margin-top:14px"><button class="btn sm" id="ok">Übernehmen</button>'+
    (on?'<button class="btn sec sm" id="cp">Code für anderes Gerät kopieren</button>'+
        '<button class="btn ghost sm" id="rm">Abgleich ausschalten</button>':'')+
    '<button class="btn ghost sm" id="cl">Abbrechen</button></div>');
  d.querySelector('#cl').onclick=()=>d.remove();
  const cp=d.querySelector('#cp');
  if(cp) cp.onclick=()=>{ const t=ghPack();
    const fin=()=>toast('Code kopiert – auf dem anderen Gerät hier einfügen.');
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fin,()=>{ d.querySelector('#gt').value=t; toast('Bitte von Hand kopieren.'); });
    else { d.querySelector('#gt').value=t; toast('Bitte von Hand kopieren.'); } };
  const rm=d.querySelector('#rm');
  if(rm) rm.onclick=()=>{ try{ localStorage.removeItem(GHKEY); }catch(e){}
    GH=null; SY.on=false; d.remove(); toast('Abgleich ausgeschaltet.'); render(); };
  d.querySelector('#ok').onclick=async()=>{
    const o=ghUnpack(d.querySelector('#gt').value);
    if(!o){ toast('Dieser Code ergibt keinen Sinn.'); return; }
    GH=o; try{ localStorage.setItem(GHKEY,JSON.stringify(o)); }catch(e){}
    d.remove(); toast('Wird verbunden …');
    await syInit();
    toast(SY.on?'Abgleich läuft.':'Verbindung fehlgeschlagen – stimmt der Code?');
    render();
  };
}
async function snapPop(){
  const d=popShell('Ältere Sicherung laden',
    '<p class="muted">Vom Server wird jeden Tag eine Sicherung deines Lernstands abgelegt (90 Tage lang). Ein geladener Stand wird mit deinem jetzigen zusammengeführt – es geht nichts verloren.</p>'+
    '<div id="sl" class="muted">Sicherungen werden geladen …</div>'+
    '<div class="row" style="margin-top:14px"><button class="btn ghost sm" id="cl">Schließen</button></div>');
  d.querySelector('#cl').onclick=()=>d.remove();
  const box=d.querySelector('#sl');
  try{
    const r=await fetch('api/state?snap=list',{credentials:'same-origin'});
    const j=await r.json();
    const list=(j.snapshots||[]);
    if(!list.length){ box.textContent='Es gibt noch keine Sicherung.'; return; }
    box.className=''; box.innerHTML='<div class="row" style="flex-wrap:wrap;gap:8px">'+
      list.slice(0,30).map(x=>'<button class="btn sec sm" data-s="'+x+'">'+fmtLong(x)+'</button>').join('')+'</div>';
    box.querySelectorAll('[data-s]').forEach(b=>b.onclick=async()=>{
      b.disabled=true;
      try{
        const rr=await fetch('api/state?snap='+b.dataset.s,{credentials:'same-origin'});
        if(!rr.ok) throw 0;
        const jj=await rr.json();
        if(!jj.state) throw 0;
        mergeState(jj.state); d.remove();
        toast('Sicherung vom '+fmtLong(b.dataset.s)+' wurde zusammengeführt.');
        paintHeader(); render(); syPush();
      }catch(e){ b.disabled=false; toast('Diese Sicherung ließ sich nicht laden.'); }
    });
  }catch(e){ box.textContent='Die Liste ließ sich nicht laden.'; }
}
function impPop(){
  const d=popShell('Fortschritt einlesen',
    '<p class="muted">Füge hier den gesicherten Text ein. Dein bisheriger Stand geht nicht verloren – beide Stände werden zusammengeführt.</p>'+
    '<textarea id="it" placeholder="Text hier einfügen" style="width:100%;height:150px;font-family:var(--mono);font-size:11px;padding:10px;border-radius:var(--rs);border:1px solid var(--line2);background:var(--panel2);color:var(--txt)"></textarea>'+
    '<div class="row" style="margin-top:14px"><button class="btn sm" id="ok">Einlesen</button>'+
    '<button class="btn ghost sm" id="cl">Abbrechen</button></div>');
  d.querySelector('#cl').onclick=()=>d.remove();
  d.querySelector('#ok').onclick=()=>{
    if(applyImport(d.querySelector('#it').value.trim())){ d.remove(); toast('Fortschritt eingelesen und zusammengeführt.'); paintHeader(); render(); }
    else toast('Der Text konnte nicht gelesen werden.'); };
}

/* ═══════════════ SUCHE ═══════════════ */
function openSearch(){
  if(document.getElementById('sov')) return;
  const d=document.createElement('div'); d.className='pop'; d.id='sov'; d.style.alignItems='flex-start';
  d.innerHTML='<div class="popc" style="max-width:660px;width:100%;text-align:left;margin-top:7vh;padding:20px">'+
   '<input type="text" id="sq" placeholder="Mietvertrag, Betriebskosten, Grundbuch, Annuität, Buchungssatz …" aria-label="Suche">'+
   '<div id="sr" style="max-height:60vh;overflow:auto;margin-top:14px"></div></div>';
  d.onclick=e=>{ if(e.target===d) d.remove(); };
  document.body.appendChild(d);
  const q=d.querySelector('#sq'), res=d.querySelector('#sr'); q.focus();
  let hits=[];
  const run=()=>{
    const t=norm(q.value);
    if(t.length<3){ res.innerHTML='<p class="small muted">Mindestens drei Buchstaben eingeben.</p>'; return; }
    hits=[];
    MODS.forEach(m=>{ const L=modL(m.id);
      L.lektionen.forEach((l,i)=>{ if(norm(l.titel+' '+l.inhalt).includes(t))
        hits.push({g:'Lektionen',t:l.titel,s:m.name,go:{p:'lektion',m:m.id,i}}); });
      L.karten.forEach((c,i)=>{ if(norm(c.v+' '+c.r).includes(t))
        hits.push({g:'Karteikarten',t:c.v,s:c.r.slice(0,80),run:{k:'card',m:m.id,i}}); });
      L.mc.forEach((c,i)=>{ if(norm(c.frage+' '+(c.erklaerung||'')).includes(t))
        hits.push({g:'Übungen',t:c.frage.slice(0,95),s:m.name,run:{k:'mc',m:m.id,i}}); });
    });
    formeln().forEach(f=>{ if(norm(f.f).includes(t)) hits.push({g:'Formeln',t:f.f,s:f.lt,go:{p:'lektion',m:f.m,i:f.l}}); });
    MODS.forEach(m=>{ const u=modL(m.id).ueb; if(!u) return;
      (u.faelle||[]).forEach(f=>{ if(norm(f.frage+' '+f.situation+' '+(f.erklaerung||'')).includes(t))
        hits.push({g:'Übungen & Fälle',t:f.frage.slice(0,95),s:m.name,run:{k:'fall',m:m.id,id:f.id}}); });
      (u.rechnen||[]).forEach(r=>{ if(norm(r.frage+' '+(r.rechenweg||'')).includes(t))
        hits.push({g:'Übungen & Fälle',t:r.frage.slice(0,95),s:m.name,run:{k:'unum',m:m.id,id:r.id}}); }); });
    ITEMS.forEach(i=>{ if(norm(i.frage+' '+i.loesung).includes(t))
      hits.push({g:'Original-IHK-Aufgaben',t:i.frage.slice(0,95),s:i.termin+' · '+i.thema,
        run:{k:i.typ==='buchungssatz'?'buch':i.typ==='reihenfolge'?'order':(isNum(i)&&i.bereich!==BER_IM)?'num':'task',id:i.id}}); });
    const groups=['Lektionen','Übungen','Karteikarten','Übungen & Fälle','Formeln','Original-IHK-Aufgaben'];
    let html='', n=0;
    groups.forEach(g=>{ const l=hits.filter(h=>h.g===g); if(!l.length) return;
      html+='<h2 style="margin:14px 0 8px">'+g+' <span class="tag">'+l.length+'</span></h2>';
      l.slice(0,8).forEach(h=>{ const idx=hits.indexOf(h); n++;
        html+='<button class="lrow" data-h="'+idx+'" style="margin-bottom:7px;padding:11px 13px">'+
         '<span class="lb"><b style="font-size:14px">'+esc(h.t)+'</b><span>'+esc(h.s)+'</span></span>'+
         '<span class="la">'+ic('right',16)+'</span></button>'; });
      if(l.length>8) html+='<p class="small muted">… und '+(l.length-8)+' weitere</p>'; });
    res.innerHTML = n?html:'<p class="small muted">Nichts gefunden.</p>';
    res.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{
      const h=hits[+b.dataset.h]; d.remove(); RUN=null; LEK=null;
      if(h.run) startRun([h.run],{title:'Suchtreffer',back:{p:R.p}});
      else go(h.go.p,h.go); });
  };
  let tmr; q.oninput=()=>{ clearTimeout(tmr); tmr=setTimeout(run,170); };
  q.onkeydown=e=>{ if(e.key==='Escape') d.remove(); };
}

/* ═══════════════ NAVIGATION ═══════════════ */
const V=document.getElementById('view');
const PAGES=[['heute','Heute','home'],['lernen','Lernen','book'],['pruefung','Prüfung','exam'],['fort','Fortschritt','chart']];
const ROUTES={heute:pHeute,lernen:pLernen,pruefung:pPruefung,fort:pFortschritt,
 modul:pModul,lektion:pLektion,run:pRun,exam:pExam,examres:pExamRes,
 rechnen:pRechnen,formeln:pFormeln,operatoren:pOperatoren,schwach:pSchwach};
const TOPOF={modul:'lernen',lektion:'lernen',rechnen:'lernen',formeln:'lernen',operatoren:'lernen',
 schwach:'lernen',exam:'pruefung',examres:'pruefung'};
let R={p:'heute'};
function go(p,o){ R=Object.assign({p:p},o||{}); window.scrollTo(0,0); render();
  try{ history.replaceState(null,'','#'+p); }catch(e){} }
function render(){
  const top=TOPOF[R.p]||R.p;
  document.querySelectorAll('#navTop button,#navTab button').forEach(b=>{
    if(b.dataset.p===top) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  (ROUTES[R.p]||pHeute)();
  paintHeader();
  if(RUN||EX) V.focus({preventScroll:true});
}
function paintHeader(){
  const lvl=levelOf(P.xp), st=streakNow();
  const h=document.getElementById('hstat');
  if(h) h.innerHTML='<span class="pill xp" title="Level '+lvl.l+' · '+esc(lvl.rank)+'">'+ic('star',12)+' '+lvl.l+'</span>'+
    (st?'<span class="pill fire" title="'+st+' Tage in Folge">'+ic('flame',12)+' '+st+'</span>':'');
  const lg=document.getElementById('logoSlot'); if(lg&&!lg.firstChild) lg.innerHTML=ic('logo',18);
  const sb=document.getElementById('searchBtn'); if(sb&&!sb.firstChild){ sb.innerHTML=ic('search',17); sb.onclick=openSearch; }
  const tb=document.getElementById('themeBtn');
  if(tb){ const dk=document.documentElement.dataset.theme==='dark'||
      (!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);
    tb.innerHTML=ic(dk?'sun':'moon',17); }
}
document.getElementById('navTop').innerHTML=PAGES.map(([k,l])=>'<button data-p="'+k+'">'+l+'</button>').join('');
document.getElementById('navTab').innerHTML=PAGES.map(([k,l,i])=>'<button data-p="'+k+'">'+ic(i,20)+'<span>'+l+'</span></button>').join('');
[...document.querySelectorAll('#navTop,#navTab')].forEach(n=>n.onclick=e=>{
  const b=e.target.closest('[data-p]'); if(!b) return;
  if(EX && !confirm('Die laufende Prüfung wird abgebrochen. Wirklich verlassen?')) return;
  if(EX){ clearInterval(exTimer); EX=null; }
  RUN=null; LEK=null; go(b.dataset.p); });
document.getElementById('brand').onclick=()=>{ if(EX) return; RUN=null; LEK=null; go('heute'); };
try{ const t=localStorage.getItem(KEY+'_th'); if(t) document.documentElement.dataset.theme=t; }catch(e){}
document.getElementById('themeBtn').onclick=()=>{
  const c=document.documentElement.dataset.theme;
  const dark=c?c==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  const n=dark?'light':'dark';
  document.documentElement.dataset.theme=n;
  try{ localStorage.setItem(KEY+'_th',n); }catch(e){}
  paintHeader(); };
addEventListener('keydown',e=>{
  if(e.key==='/'&&!/input|textarea/i.test((e.target.tagName||''))){ e.preventDefault(); openSearch(); return; }
  if(RUN&&!EX){ const o=V.querySelectorAll('#ansbox .opt:not(:disabled), #ansbox .tf button:not(:disabled)');
    if(o.length&&/^[1-3a-cA-C]$/.test(e.key)){ const m={'1':0,'2':1,'3':2,a:0,b:1,c:2,A:0,B:1,C:2}[e.key];
      if(o[m]){ e.preventDefault(); o[m].click(); } }
    const nx=V.querySelector('#nx'); if(nx&&(e.key==='Enter')){ e.preventDefault(); nx.click(); } }
});

/* ═══════════════ START ═══════════════ */
if(P.mig){ delete P.mig; saveNow();
  setTimeout(()=>toast('Dein bisheriger Lernfortschritt wurde übernommen.'),700); }
dayRec(); checkBadges(); mission();
paintHeader();
if(typeof syInit==='function') syInit();

/* ═══ Als App installieren ═══ */
let _ip=null;
addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); _ip=e; showInstall(); });
function stand(){ return matchMedia('(display-mode: standalone)').matches || navigator.standalone===true; }
function showInstall(){
  if(stand()||!_ip) return;
  try{ if(localStorage.getItem(KEY+'_noinst')) return; }catch(e){}
  if(document.getElementById('instbar')) return;
  const b=document.createElement('div'); b.id='instbar'; b.className='instbar';
  b.innerHTML='<span>'+ic('logo',18)+'Auf dem Startbildschirm ablegen – dann öffnet sich der Trainer wie eine App.</span>'+
    '<span class="row"><button class="btn sm" id="iy">Installieren</button>'+
    '<button class="btn ghost sm" id="in">Später</button></span>';
  document.body.appendChild(b);
  b.querySelector('#iy').onclick=async()=>{ b.remove(); if(_ip){ _ip.prompt(); await _ip.userChoice.catch(()=>{}); _ip=null; } };
  b.querySelector('#in').onclick=()=>{ b.remove(); try{ localStorage.setItem(KEY+'_noinst','1'); }catch(e){} };
}
/* iPhone kennt beforeinstallprompt nicht – dort eine kurze Anleitung */
(function(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  if(!ios||stand()) return;
  try{ if(localStorage.getItem(KEY+'_noinst')) return; }catch(e){}
  setTimeout(()=>{
    if(document.getElementById('instbar')) return;
    const b=document.createElement('div'); b.id='instbar'; b.className='instbar';
    b.innerHTML='<span>'+ic('logo',18)+'Tippe unten auf <b>Teilen</b> und dann auf <b>„Zum Home-Bildschirm"</b> – dann hast du den Trainer als App.</span>'+
      '<span class="row"><button class="btn ghost sm" id="in">Verstanden</button></span>';
    document.body.appendChild(b);
    b.querySelector('#in').onclick=()=>{ b.remove(); try{ localStorage.setItem(KEY+'_noinst','1'); }catch(e){} };
  },4000);
})();
const hash=(location.hash||'').replace('#','');
go(ROUTES[hash]?hash:'heute');
