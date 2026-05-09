import { useState, useEffect, useCallback, useRef } from "react";

// ─── Firebase via CDN (no npm needed) ────────────────────────────────────────
// @ts-ignore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// @ts-ignore
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── Sticker catalog ──────────────────────────────────────────────────────────
const SECTIONS: { prefix: string; label: string; flag: string; codes: string[] }[] = [
  { prefix:"FWC", flag:"🏆", label:"FIFA WC",         codes: Array.from({length:18},(_,i)=>`FWC${i+1}`) },
  { prefix:"MEX", flag:"🇲🇽", label:"México",          codes: Array.from({length:20},(_,i)=>`MEX${i+1}`) },
  { prefix:"RSA", flag:"🇿🇦", label:"Sudáfrica",       codes: Array.from({length:20},(_,i)=>`RSA${i+1}`) },
  { prefix:"KOR", flag:"🇰🇷", label:"Corea",           codes: Array.from({length:20},(_,i)=>`KOR${i+1}`) },
  { prefix:"CZE", flag:"🇨🇿", label:"Rep. Checa",      codes: Array.from({length:20},(_,i)=>`CZE${i+1}`) },
  { prefix:"CAN", flag:"🇨🇦", label:"Canadá",          codes: Array.from({length:20},(_,i)=>`CAN${i+1}`) },
  { prefix:"BIH", flag:"🇧🇦", label:"Bosnia",          codes: Array.from({length:20},(_,i)=>`BIH${i+1}`) },
  { prefix:"QAT", flag:"🇶🇦", label:"Qatar",           codes: Array.from({length:20},(_,i)=>`QAT${i+1}`) },
  { prefix:"SUI", flag:"🇨🇭", label:"Suiza",           codes: Array.from({length:20},(_,i)=>`SUI${i+1}`) },
  { prefix:"BRA", flag:"🇧🇷", label:"Brasil",          codes: Array.from({length:20},(_,i)=>`BRA${i+1}`) },
  { prefix:"MAR", flag:"🇲🇦", label:"Marruecos",       codes: Array.from({length:20},(_,i)=>`MAR${i+1}`) },
  { prefix:"HAI", flag:"🇭🇹", label:"Haití",           codes: Array.from({length:20},(_,i)=>`HAI${i+1}`) },
  { prefix:"SCO", flag:"🏴", label:"Escocia",          codes: Array.from({length:20},(_,i)=>`SCO${i+1}`) },
  { prefix:"USA", flag:"🇺🇸", label:"USA",             codes: Array.from({length:20},(_,i)=>`USA${i+1}`) },
  { prefix:"PAR", flag:"🇵🇾", label:"Paraguay",        codes: Array.from({length:20},(_,i)=>`PAR${i+1}`) },
  { prefix:"AUS", flag:"🇦🇺", label:"Australia",       codes: Array.from({length:20},(_,i)=>`AUS${i+1}`) },
  { prefix:"TUR", flag:"🇹🇷", label:"Turquía",         codes: Array.from({length:20},(_,i)=>`TUR${i+1}`) },
  { prefix:"GER", flag:"🇩🇪", label:"Alemania",        codes: Array.from({length:20},(_,i)=>`GER${i+1}`) },
  { prefix:"CUW", flag:"🇨🇼", label:"Curazao",         codes: Array.from({length:20},(_,i)=>`CUW${i+1}`) },
  { prefix:"CIV", flag:"🇨🇮", label:"Costa de Marfil", codes: Array.from({length:20},(_,i)=>`CIV${i+1}`) },
  { prefix:"ECU", flag:"🇪🇨", label:"Ecuador",         codes: Array.from({length:20},(_,i)=>`ECU${i+1}`) },
  { prefix:"NED", flag:"🇳🇱", label:"Países Bajos",    codes: Array.from({length:20},(_,i)=>`NED${i+1}`) },
  { prefix:"JPN", flag:"🇯🇵", label:"Japón",           codes: Array.from({length:20},(_,i)=>`JPN${i+1}`) },
  { prefix:"SWE", flag:"🇸🇪", label:"Suecia",          codes: Array.from({length:20},(_,i)=>`SWE${i+1}`) },
  { prefix:"TUN", flag:"🇹🇳", label:"Túnez",           codes: Array.from({length:20},(_,i)=>`TUN${i+1}`) },
  { prefix:"BEL", flag:"🇧🇪", label:"Bélgica",         codes: Array.from({length:20},(_,i)=>`BEL${i+1}`) },
  { prefix:"EGY", flag:"🇪🇬", label:"Egipto",          codes: Array.from({length:20},(_,i)=>`EGY${i+1}`) },
  { prefix:"IRN", flag:"🇮🇷", label:"Irán",            codes: Array.from({length:20},(_,i)=>`IRN${i+1}`) },
  { prefix:"NZL", flag:"🇳🇿", label:"Nueva Zelanda",   codes: Array.from({length:20},(_,i)=>`NZL${i+1}`) },
  { prefix:"ESP", flag:"🇪🇸", label:"España",          codes: Array.from({length:20},(_,i)=>`ESP${i+1}`) },
  { prefix:"CPV", flag:"🇨🇻", label:"Cabo Verde",      codes: Array.from({length:20},(_,i)=>`CPV${i+1}`) },
  { prefix:"KSA", flag:"🇸🇦", label:"Arabia Saudí",    codes: Array.from({length:20},(_,i)=>`KSA${i+1}`) },
  { prefix:"URU", flag:"🇺🇾", label:"Uruguay",         codes: Array.from({length:20},(_,i)=>`URU${i+1}`) },
  { prefix:"FRA", flag:"🇫🇷", label:"Francia",         codes: Array.from({length:20},(_,i)=>`FRA${i+1}`) },
  { prefix:"SEN", flag:"🇸🇳", label:"Senegal",         codes: Array.from({length:20},(_,i)=>`SEN${i+1}`) },
  { prefix:"IRQ", flag:"🇮🇶", label:"Iraq",            codes: Array.from({length:20},(_,i)=>`IRQ${i+1}`) },
  { prefix:"NOR", flag:"🇳🇴", label:"Noruega",         codes: Array.from({length:20},(_,i)=>`NOR${i+1}`) },
  { prefix:"ARG", flag:"🇦🇷", label:"Argentina",       codes: Array.from({length:20},(_,i)=>`ARG${i+1}`) },
  { prefix:"ALG", flag:"🇩🇿", label:"Argelia",         codes: Array.from({length:20},(_,i)=>`ALG${i+1}`) },
  { prefix:"AUT", flag:"🇦🇹", label:"Austria",         codes: Array.from({length:20},(_,i)=>`AUT${i+1}`) },
  { prefix:"JOR", flag:"🇯🇴", label:"Jordania",        codes: Array.from({length:20},(_,i)=>`JOR${i+1}`) },
  { prefix:"POR", flag:"🇵🇹", label:"Portugal",        codes: Array.from({length:20},(_,i)=>`POR${i+1}`) },
  { prefix:"COD", flag:"🇨🇩", label:"Congo DR",        codes: Array.from({length:20},(_,i)=>`COD${i+1}`) },
  { prefix:"UZB", flag:"🇺🇿", label:"Uzbekistán",      codes: Array.from({length:20},(_,i)=>`UZB${i+1}`) },
  { prefix:"COL", flag:"🇨🇴", label:"Colombia",        codes: Array.from({length:20},(_,i)=>`COL${i+1}`) },
  { prefix:"ENG", flag:"🏴", label:"Inglaterra",       codes: Array.from({length:20},(_,i)=>`ENG${i+1}`) },
  { prefix:"CRO", flag:"🇭🇷", label:"Croacia",         codes: Array.from({length:20},(_,i)=>`CRO${i+1}`) },
  { prefix:"GHA", flag:"🇬🇭", label:"Ghana",           codes: Array.from({length:20},(_,i)=>`GHA${i+1}`) },
  { prefix:"PAN", flag:"🇵🇦", label:"Panamá",          codes: Array.from({length:20},(_,i)=>`PAN${i+1}`) },
  { prefix:"CC",  flag:"🥤", label:"Coca-Cola",        codes: Array.from({length:14},(_,i)=>`CC${i+1}`) },
];
const ALL_CODES = new Set(SECTIONS.flatMap(s => s.codes));

// ─── Types ────────────────────────────────────────────────────────────────────
interface Loc { lat: number; lon: number; }
interface Player { uuid: string; name: string; phone?: string; have: string[]; want: string[]; loc?: Loc; updatedAt: number; paid?: boolean; }
interface Match extends Player { canGive: string[]; canReceive: string[]; score: number; distKm: number | null; isNew: boolean; }

// ─── Geo ──────────────────────────────────────────────────────────────────────
function haversineKm(lat1:number,lon1:number,lat2:number,lon2:number):number {
  const R=6371,dLat=((lat2-lat1)*Math.PI)/180,dLon=((lon2-lon1)*Math.PI)/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function fmtDist(km:number|null):string|null {
  if(km==null) return null;
  return km<1?`${Math.round(km*1000)} m`:km<10?`${km.toFixed(1)} km`:`${Math.round(km)} km`;
}
function distColor(km:number|null):string {
  if(km==null) return "#888";
  return km<2?"#22d3ee":km<10?"#86efac":km<30?"#fbbf24":"#f87171";
}

// ─── LocalStorage ─────────────────────────────────────────────────────────────
const lsGet=(k:string)=>{try{return localStorage.getItem(k);}catch{return null;}};
const lsSet=(k:string,v:string)=>{try{localStorage.setItem(k,v);}catch{}};

// ─── UUID ─────────────────────────────────────────────────────────────────────
function getOrCreateUUID():string {
  let id=lsGet("ps_uuid");
  if(!id){
    id=crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now().toString(36);
    lsSet("ps_uuid",id);
  }
  return id;
}
function shortCode(uuid:string):string {
  return uuid.slice(0,8).toUpperCase();
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
function buildWALink(phone:string,myName:string,canGive:string[],canReceive:string[]):string {
  const clean=phone.replace(/\D/g,"");
  const text=`¡Hola! Vi tu perfil en *Panini Swap* 👋\n\nSoy *${myName}*.\n\n📤 Yo tengo repetidas que buscas: *${canGive.join(", ")||"ninguna"}*\n📥 Tú tienes repetidas que busco: *${canReceive.join(", ")||"ninguna"}*\n\n¿Hacemos un cambio? ⚽🔥`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS=`
  *:focus-visible{outline:3px solid #818cf8;outline-offset:2px;border-radius:4px;}
  html{font-size:16px;}
  body{margin:0;background:#0d0d1a;}
  @keyframes sIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}

  .hb-overlay{
    position:fixed;inset:0;z-index:200;
    background:rgba(0,0,0,0.6);
    animation:fadeIn 0.18s ease;
  }
  .hb-panel{
    position:absolute;top:0;right:0;
    width:min(300px,85vw);
    height:100vh;
    background:#0d1f35;
    border-left:2px solid #1a3050;
    padding:20px;
    display:flex;flex-direction:column;gap:0;
    animation:slideInRight 0.22s ease;
    overflow-y:auto;
    box-sizing:border-box;
  }

  .country-grid{
    display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;padding:2px;
  }
  .country-pill{
    border-radius:20px;padding:6px 12px;font-size:13px;cursor:pointer;
    font-family:inherit;font-weight:400;white-space:nowrap;
    border:2px solid #2a4a6b;background:#0a1628;color:#a0a0bc;
    transition:transform 0.1s;
  }
  .country-pill.active{font-weight:700;}
  .country-pill.has-count{font-weight:700;}

  .sticker-grid{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(52px,1fr));
    gap:6px;
  }

  .stats-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:10px;
    margin-bottom:24px;
  }

  @media(max-width:480px){
    .sticker-grid{
      grid-template-columns:repeat(auto-fill,minmax(44px,1fr));
    }
    .country-pill{
      padding:5px 9px;font-size:12px;
    }
    .stats-grid{
      grid-template-columns:repeat(2,1fr);
    }
  }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({notifications,onDismiss}:{notifications:string[];onDismiss:(i:number)=>void}) {
  return (
    <div role="region" aria-label="Notificaciones" aria-live="polite" aria-atomic="false"
      style={{position:"fixed",bottom:"24px",right:"24px",zIndex:999,display:"flex",flexDirection:"column",gap:"8px",maxWidth:"320px"}}>
      {notifications.map((n,i)=>(
        <div key={i} role="alert" style={{background:"#0a1628",border:"2px solid #e03c2d",borderRadius:"12px",padding:"14px 16px",boxShadow:"0 8px 32px #00000088",animation:"sIn 0.3s ease",display:"flex",gap:"12px",alignItems:"flex-start"}}>
          <span aria-hidden="true" style={{fontSize:"20px"}}>🔔</span>
          <div style={{flex:1}}>
            <div style={{color:"#e8e8f0",fontWeight:"700",fontSize:"14px",marginBottom:"3px"}}>Nuevo match</div>
            <div style={{color:"#a0a0bc",fontSize:"13px",lineHeight:"1.5"}}>{n}</div>
          </div>
          <button onClick={()=>onDismiss(i)} aria-label="Cerrar notificación"
            style={{background:"none",border:"2px solid transparent",borderRadius:"4px",color:"#a0a0bc",cursor:"pointer",fontSize:"18px",padding:"0 4px",lineHeight:1}}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Feedback Section ─────────────────────────────────────────────────────────
function FeedbackSection({userName}:{userName:string}) {
  const [text,setText] = useState("");
  const [sent,setSent] = useState(false);
  const [sending,setSending] = useState(false);

  const handleSend = async() => {
    if(!text.trim()||sending) return;
    setSending(true);
    try {
      const entry = {
        from: userName||"Anónimo",
        message: text.trim(),
        sentAt: Date.now(),
      };
      await setDoc(doc(db,"feedback",`${Date.now()}-${Math.random().toString(36).slice(2)}`), entry);
      setSent(true);
      setText("");
    } catch(e) {
      console.error(e);
    }
    setSending(false);
  };

  return (
    <div style={{marginBottom:"16px",borderTop:"1px solid #1a3050",paddingTop:"16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
        <span aria-hidden="true" style={{fontSize:"16px"}}>💡</span>
        <span style={{color:"#e8e8f0",fontWeight:"700",fontSize:"14px"}}>Recomendaciones</span>
      </div>
      <p style={{color:"#a0a0bc",fontSize:"12px",lineHeight:"1.5",margin:"0 0 10px"}}>
        ¿Tenés alguna idea para mejorar la app? Nos encantaría escucharte.
      </p>
      {sent ? (
        <div style={{background:"#0f2318",border:"1px solid #4ade8044",borderRadius:"8px",padding:"12px",textAlign:"center"}}>
          <span style={{fontSize:"20px"}}>🙌</span>
          <p style={{color:"#4ade80",fontSize:"13px",fontWeight:"700",margin:"6px 0 0"}}>¡Gracias por tu recomendación!</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <textarea
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="Ej: Sería bueno poder buscar por nombre de jugador..."
            rows={3}
            style={{width:"100%",background:"#0a1628",border:"2px solid #2a4a6b",borderRadius:"8px",padding:"10px 12px",color:"#e8e8f0",fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"13px",outline:"none",resize:"none",boxSizing:"border-box" as const,lineHeight:"1.5"}}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()||sending}
            style={{background:text.trim()&&!sending?"#e03c2d":"#1a3050",border:"2px solid transparent",borderRadius:"8px",padding:"10px",color:text.trim()&&!sending?"#fff":"#555",fontFamily:"inherit",fontSize:"13px",fontWeight:"700",cursor:text.trim()&&!sending?"pointer":"not-allowed",transition:"all 0.2s"}}>
            {sending?"Enviando...":"Enviar recomendación"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Hamburger Menu ───────────────────────────────────────────────────────────
function HamburgerMenu({
  userName, userPhone, userLoc, userUUID, accessGranted, onClose, onLogout
}:{
  userName:string; userPhone:string; userLoc:Loc|null; userUUID:string;
  accessGranted:boolean; onClose:()=>void; onLogout:()=>void;
})  {
  const [copyLabel,setCopyLabel] = useState("Copiar");

  const handleCopy = () => {
    navigator.clipboard?.writeText(shortCode(userUUID));
    setCopyLabel("¡Copiado!");
    setTimeout(()=>setCopyLabel("Copiar"),2000);
  };

  return (
    <div className="hb-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Menú de perfil">
      <div className="hb-panel" onClick={e=>e.stopPropagation()} style={{fontFamily:"'Bricolage Grotesque',sans-serif"}}>

        {/* Header del panel */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
          <span style={{color:"#e8e8f0",fontWeight:"900",fontSize:"16px"}}>Mi perfil</span>
          <button onClick={onClose} aria-label="Cerrar menú"
            style={{background:"none",border:"2px solid #2a4a6b",borderRadius:"8px",padding:"5px 10px",color:"#a0a0bc",cursor:"pointer",fontSize:"16px",lineHeight:1}}>
            ✕
          </button>
        </div>

        {/* Info del usuario */}
        <div style={{background:"#0d0d1a",borderRadius:"12px",padding:"14px",marginBottom:"12px",border:"1px solid #1a3050"}}>
          <div style={{color:"#e8e8f0",fontWeight:"700",fontSize:"17px",marginBottom:"10px"}}>{userName}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {userPhone
              ? <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <span style={{color:"#25d366",fontSize:"11px",fontWeight:"700",background:"#25d36622",padding:"2px 7px",borderRadius:"20px"}}>WA</span>
                  <span style={{color:"#a0a0bc",fontSize:"13px"}}>{userPhone}</span>
                </div>
              : <span style={{color:"#555",fontSize:"13px"}}>Sin WhatsApp registrado</span>
            }
            {userLoc
              ? <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <span style={{fontSize:"11px",fontWeight:"700",color:"#22d3ee",background:"#22d3ee22",padding:"2px 7px",borderRadius:"20px"}}>📍</span>
                  <span style={{color:"#a0a0bc",fontSize:"13px"}}>Ubicación registrada</span>
                </div>
              : <span style={{color:"#555",fontSize:"13px"}}>Sin ubicación registrada</span>
            }
          </div>
        </div>

        {/* Código de perfil — solo si tiene acceso */}
        {accessGranted&&(
          <div style={{background:"#0d0d1a",borderRadius:"12px",padding:"14px",marginBottom:"24px",border:"1px solid #1a3050"}}>
            <div style={{color:"#888",fontSize:"12px",marginBottom:"10px",lineHeight:"1.5"}}>
              Código para acceder desde otro dispositivo:
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <code style={{color:"#a78bfa",fontFamily:"'DM Mono',monospace",fontSize:"20px",fontWeight:"700",letterSpacing:"0.12em",flex:1}}>
                {shortCode(userUUID)}
              </code>
              <button onClick={handleCopy} aria-label="Copiar código de perfil"
                style={{background:"#0a1628",border:"1px solid #2a4a6b",borderRadius:"8px",padding:"7px 12px",color:"#a0a0bc",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",fontWeight:"700",whiteSpace:"nowrap"}}>
                {copyLabel}
              </button>
            </div>
          </div>
        )}

        <div style={{flex:1}}/>

        {/* Recomendaciones */}
        <FeedbackSection userName={userName}/>

        {/* Cerrar sesión */}
        <button onClick={onLogout}
          style={{width:"100%",background:"none",border:"2px solid #2a4a6b",borderRadius:"10px",padding:"13px",color:"#f87171",fontFamily:"inherit",fontSize:"15px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
          <span aria-hidden="true">↩</span> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ─── Sticker panel ────────────────────────────────────────────────────────────
function StickerPanel({selected,onToggle,accent,labelPrefix}:{selected:string[];onToggle:(c:string)=>void;accent:string;labelPrefix:string}) {
  const [activeSection,setActiveSection]=useState("FWC");
  const section=SECTIONS.find(s=>s.prefix===activeSection)??SECTIONS[0];
  const selCount=section.codes.filter(c=>(selected||[]).includes(c)).length;
  const isDark=accent==="#f59e0b";
  return (
    <div>
      <nav aria-label="Seleccionar país">
        <div className="country-grid" role="list">
          {SECTIONS.map(s=>{
            const count=s.codes.filter(c=>(selected||[]).includes(c)).length;
            const isActive=s.prefix===activeSection;
            return (
              <div key={s.prefix} role="listitem">
                <button
                  onClick={()=>setActiveSection(s.prefix)}
                  aria-pressed={isActive}
                  aria-label={`${s.label}${count>0?`, ${count} seleccionadas`:""}`}
                  className={`country-pill${isActive?" active":""}${count>0&&!isActive?" has-count":""}`}
                  style={{
                    background:isActive?accent:count>0?accent+"33":"#0a1628",
                    borderColor:isActive?accent:count>0?accent+"88":"#2a4a6b",
                    color:isActive?(isDark?"#0d0d1a":"#fff"):count>0?accent:"#a0a0bc",
                  }}>
                  <span aria-hidden="true">{s.flag}</span> {s.prefix}{count>0&&!isActive?` (${count})`:""}
                </button>
              </div>
            );
          })}
        </div>
      </nav>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
        <h2 style={{color:"#e8e8f0",fontWeight:"700",fontSize:"15px",margin:0}}><span aria-hidden="true">{section.flag}</span> {section.label}</h2>
        <span aria-live="polite" style={{color:"#a0a0bc",fontSize:"13px"}}>{selCount} de {section.codes.length} {labelPrefix}</span>
      </div>
      <div role="group" aria-label={`Figuras de ${section.label}`} className="sticker-grid">
        {section.codes.map(code=>{
          const isSel=(selected||[]).includes(code);
          return (
            <button key={code} onClick={()=>onToggle(code)} aria-pressed={isSel}
              aria-label={`${code}${isSel?`, quitar de ${labelPrefix}s`:`, agregar a ${labelPrefix}s`}`}
              style={{height:"46px",borderRadius:"8px",border:`2px solid ${isSel?accent:"#2a4a6b"}`,background:isSel?accent:"#0a1628",color:isSel?(isDark?"#0d0d1a":"#fff"):"#a0a0bc",fontFamily:"'DM Mono',monospace",fontSize:"12px",fontWeight:isSel?"700":"400",cursor:"pointer",transition:"transform 0.1s",transform:isSel?"scale(1.06)":"scale(1)"}}>
              {code.replace(section.prefix,"")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Range selector ───────────────────────────────────────────────────────────
function RangeSelector({onAdd,accent}:{onAdd:(codes:string[])=>void;accent:string}) {
  const [val,setVal]=useState(""); const [error,setError]=useState("");
  const isDark=accent==="#f59e0b";
  const apply=()=>{
    const codes:string[]=[];
    for(const part of val.trim().toUpperCase().split(",").map(s=>s.trim())) {
      const range=part.match(/^([A-Z]+)(\d+)-(\d+)$/);
      const single=part.match(/^([A-Z]+\d+)$/);
      if(range){const[,pfx,a,b]=range;for(let i=parseInt(a);i<=parseInt(b);i++){const c=`${pfx}${i}`;if(ALL_CODES.has(c))codes.push(c);}}
      else if(single&&ALL_CODES.has(part))codes.push(part);
    }
    if(!codes.length){setError("No se encontraron códigos válidos. Ejemplo: ARG1-5, BRA7");return;}
    setError("");onAdd(codes);setVal("");
  };
  return (
    <div style={{marginBottom:"14px"}}>
      <div style={{display:"flex",gap:"8px"}}>
        <label htmlFor="range-input" style={{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap" as const}}>Agregar figuras por rango</label>
        <input id="range-input" value={val} onChange={e=>{setVal(e.target.value);setError("");}}
          onKeyDown={e=>e.key==="Enter"&&apply()} placeholder="ej: ARG1-5, BRA7, MEX1-3"
          aria-describedby={error?"range-error":undefined} aria-invalid={!!error}
          style={{flex:1,background:"#0a1628",border:`2px solid ${error?"#f87171":"#2a4a6b"}`,borderRadius:"8px",padding:"9px 12px",color:"#e8e8f0",fontFamily:"'DM Mono',monospace",fontSize:"13px",outline:"none"}}/>
        <button onClick={apply} style={{background:accent,border:"2px solid transparent",borderRadius:"8px",padding:"9px 14px",color:isDark?"#0d0d1a":"#fff",fontWeight:"700",cursor:"pointer",fontSize:"13px",whiteSpace:"nowrap" as const,fontFamily:"inherit"}}>
          + Agregar
        </button>
      </div>
      {error&&<p id="range-error" role="alert" style={{color:"#f87171",fontSize:"12px",margin:"6px 0 0"}}>{error}</p>}
    </div>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────
function MatchCard({match,myName}:{match:Match;myName:string}) {
  const [expanded,setExpanded]=useState(false);
  const distLabel=fmtDist(match.distKm);
  return (
    <article aria-labelledby={`mh-${match.name}`}
      style={{background:"#0d1f35",border:`2px solid ${expanded?"#e03c2d":"#1a3050"}`,borderRadius:"12px",padding:"16px",marginBottom:"12px",transition:"border-color 0.2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap" as const}}>
            <h3 id={`mh-${match.name}`} style={{color:"#e8e8f0",fontWeight:"700",fontSize:"15px",margin:0}}>{match.name}</h3>
            {match.isNew&&<span style={{fontSize:"11px",color:"#fff",background:"#e03c2d",padding:"2px 8px",borderRadius:"20px",fontWeight:"700"}} aria-label="Match nuevo">NUEVO</span>}
            {match.phone&&<span style={{fontSize:"11px",color:"#25d366",background:"#25d36622",padding:"2px 8px",borderRadius:"20px"}} aria-label="Tiene WhatsApp">WA</span>}
          </div>
          {distLabel
            ?<span style={{fontSize:"12px",color:distColor(match.distKm),background:distColor(match.distKm)+"22",padding:"2px 10px",borderRadius:"20px",fontWeight:"700",width:"fit-content"}} aria-label={`A ${distLabel} de distancia`}><span aria-hidden="true">📍</span> {distLabel}</span>
            :<span style={{fontSize:"12px",color:"#666"}}>Sin ubicación registrada</span>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px",marginLeft:"12px"}}>
          <div style={{display:"flex",gap:"12px",fontSize:"13px"}}>
            <span style={{color:"#f59e0b"}} aria-label={`Te puede dar ${match.canGive.length} figuras`}>Te da: <strong>{match.canGive.length}</strong></span>
            <span style={{color:"#22d3ee"}} aria-label={`Le puedes dar ${match.canReceive.length} figuras`}>Le das: <strong>{match.canReceive.length}</strong></span>
          </div>
          <button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}
            style={{background:"#0a1628",border:"2px solid #2a4a6b",borderRadius:"8px",padding:"4px 10px",color:"#a0a0bc",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
            {expanded?"Ver menos ▲":"Ver detalle ▼"}
          </button>
        </div>
      </div>
      {expanded&&(
        <div style={{marginTop:"14px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
            {[{label:`Te puede dar (${match.canGive.length})`,items:match.canGive,color:"#f59e0b"},{label:`Le puedes dar (${match.canReceive.length})`,items:match.canReceive,color:"#22d3ee"}].map(({label,items,color})=>(
              <div key={label}>
                <h4 style={{color,fontSize:"12px",fontWeight:"700",margin:"0 0 6px"}}>{label}</h4>
                <div role="list" style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                  {items.map(c=><span key={c} role="listitem" style={{background:color+"22",color,borderRadius:"4px",padding:"2px 6px",fontSize:"11px",fontFamily:"'DM Mono',monospace"}}>{c}</span>)}
                  {!items.length&&<span style={{color:"#555",fontSize:"12px"}}>Ninguna</span>}
                </div>
              </div>
            ))}
          </div>
          {match.phone?(
            <a href={buildWALink(match.phone,myName,match.canReceive,match.canGive)}
              target="_blank" rel="noopener noreferrer" aria-label={`Contactar a ${match.name} por WhatsApp`}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",background:"#25d366",borderRadius:"8px",padding:"11px 20px",color:"#fff",fontWeight:"700",fontSize:"14px",textDecoration:"none",fontFamily:"inherit"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true" focusable={false}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contactar por WhatsApp
            </a>
          ):(
            <p style={{display:"flex",alignItems:"center",gap:"8px",background:"#0a1628",borderRadius:"8px",padding:"10px 16px",color:"#888",fontSize:"13px",margin:0}}>
              <span aria-hidden="true">📵</span> Este coleccionista no registró WhatsApp
            </p>
          )}
        </div>
      )}
    </article>
  );
}


// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({tab}:{tab:"have"|"want"|"match"}) {
  const [showTerms,setShowTerms] = useState(false);

  const instructions:{[k:string]:{icon:string;title:string;steps:string[]}} = {
    have:{
      icon:"📤",
      title:"¿Cómo registro mis repetidas?",
      steps:[
        "Selecciona el país en la barra de banderas.",
        "Toca cada número que tengas repetido — se ilumina en naranja.",
        "También puedes escribir rangos como ARG1-5, BRA7 en el campo de texto.",
        "Cuando termines, presiona Guardar en la parte de arriba.",
      ]
    },
    want:{
      icon:"📥",
      title:"¿Cómo registro las que me faltan?",
      steps:[
        "Selecciona el país y toca las figuras que te faltan — se iluminan en celeste.",
        "Puedes usar rangos también: MEX1-10, FWC3.",
        "Entre más completa tu lista, más matches vas a encontrar.",
        "Recuerda guardar cuando termines.",
      ]
    },
    match:{
      icon:"🤝",
      title:"¿Cómo funciona el sistema de matches?",
      steps:[
        "Un match aparece cuando alguien tiene repetidas que vos buscás, o viceversa.",
        "Toca 'Ver detalle' para ver exactamente qué figuras pueden intercambiar.",
        "Si el coleccionista registró WhatsApp, podés contactarlo directo desde la app.",
        "Activá tu ubicación para ver qué tan cerca están los coleccionistas.",
      ]
    }
  };

  const info = instructions[tab];

  return (
    <footer style={{marginTop:"40px",borderTop:"2px solid #1a3050",paddingTop:"24px"}}>

      {/* Instrucciones */}
      <div style={{background:"#0d1f35",borderRadius:"12px",padding:"16px",marginBottom:"16px",border:"1px solid #1a3050"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
          <span aria-hidden="true" style={{fontSize:"18px"}}>{info.icon}</span>
          <h3 style={{color:"#e8e8f0",fontWeight:"700",fontSize:"14px",margin:0}}>{info.title}</h3>
        </div>
        <ol style={{margin:0,paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"6px"}}>
          {info.steps.map((step,i)=>(
            <li key={i} style={{color:"#a0a0bc",fontSize:"13px",lineHeight:"1.6"}}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Términos */}
      <div style={{background:"#0d1f35",borderRadius:"12px",padding:"16px",border:"1px solid #1a3050"}}>
        <button
          onClick={()=>setShowTerms(!showTerms)}
          aria-expanded={showTerms}
          style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span aria-hidden="true" style={{fontSize:"16px"}}>📋</span>
            <span style={{color:"#e8e8f0",fontWeight:"700",fontSize:"14px"}}>Términos de uso</span>
          </div>
          <span style={{color:"#a0a0bc",fontSize:"12px"}}>{showTerms?"Cerrar ▲":"Ver ▼"}</span>
        </button>

        {showTerms&&(
          <div style={{marginTop:"14px",display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              {icon:"⚽", text:"Panini Swap es una plataforma para conectar coleccionistas del álbum FIFA World Cup 2026. Su único propósito es facilitar el intercambio de figuritas entre personas."},
              {icon:"🤝", text:"Los intercambios son acuerdos directos entre usuarios. No somos intermediarios ni participamos en la coordinación, entrega ni verificación de ningún canje."},
              {icon:"💬", text:"La comunicación entre usuarios por WhatsApp u otros medios es responsabilidad exclusiva de cada persona. Panini Swap no monitorea ni garantiza esas conversaciones."},
              {icon:"🔒", text:"Tu número de WhatsApp solo es visible para los coleccionistas con quienes tienes un match. No lo compartimos con terceros ni lo usamos para fines comerciales."},
              {icon:"⚠️", text:"No nos hacemos responsables por intercambios que no se concreten, acuerdos incumplidos, o cualquier situación que surja entre usuarios fuera de esta plataforma."},
              {icon:"✅", text:"Al usar Panini Swap aceptás estos términos. Si tenés alguna consulta, escribinos al WhatsApp 50660582201."},
            ].map(({icon,text},i)=>(
              <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start"}}>
                <span aria-hidden="true" style={{fontSize:"15px",flexShrink:0,marginTop:"1px"}}>{icon}</span>
                <p style={{color:"#a0a0bc",fontSize:"13px",lineHeight:"1.6",margin:0}}>{text}</p>
              </div>
            ))}
            <p style={{color:"#555",fontSize:"11px",margin:"6px 0 0",textAlign:"center"}}>
              Panini Swap · Costa Rica · 2026
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PaniniSwap() {
  const [view,setView]               = useState<"setup"|"main"|"restore">("setup");
  const [nameInput,setNameInput]     = useState("");
  const [accessCode,setAccessCode]   = useState("");
  const [accessError,setAccessError] = useState("");
  const [accessChecking,setAccessChecking] = useState(false);
  const [phoneInput,setPhoneInput]   = useState("");
  const [restoreCode,setRestoreCode] = useState("");
  const [restoreError,setRestoreError] = useState("");
  const [userUUID,setUserUUID]       = useState("");
  const [accessGranted,setAccessGranted] = useState(false);
  const [showAccessModal,setShowAccessModal] = useState(false);
  const [userName,setUserName]       = useState("");
  const [userPhone,setUserPhone]     = useState("");
  const [userLoc,setUserLoc]         = useState<Loc|null>(null);
  const [locLoading,setLocLoading]   = useState(false);
  const [locError,setLocError]       = useState("");
  const [locQuery,setLocQuery]       = useState("");
  const [tab,setTab]                 = useState<"have"|"want"|"match">("have");
  const [have,setHave]               = useState<string[]>([]);
  const [want,setWant]               = useState<string[]>([]);
  const [allPlayers,setAllPlayers]   = useState<Player[]>([]);
  const [appLoading,setAppLoading]   = useState(true);
  const [saving,setSaving]           = useState(false);
  const [saved,setSaved]             = useState(false);
  const [toasts,setToasts]           = useState<string[]>([]);
  const [seenMatches,setSeenMatches] = useState<Set<string>>(new Set());
  const [maxDist,setMaxDist]         = useState<number|null>(null);
  const [sortBy,setSortBy]           = useState<"score"|"distance">("score");
  const [menuOpen,setMenuOpen]       = useState(false);

  useEffect(()=>{
    const uuid=getOrCreateUUID();
    setUserUUID(uuid);
    const u=lsGet("ps_user"),ph=lsGet("ps_phone"),h=lsGet("ps_have"),w=lsGet("ps_want"),s=lsGet("ps_seen"),l=lsGet("ps_loc");
    if(u){setUserName(u);setView("main");}
    if(lsGet("ps_access")==="1")setAccessGranted(true);
    if(ph)setUserPhone(ph);
    if(h)setHave(JSON.parse(h));
    if(w)setWant(JSON.parse(w));
    if(s)setSeenMatches(new Set(JSON.parse(s)));
    if(l)setUserLoc(JSON.parse(l));
    const unsub=onSnapshot(collection(db,"players"),(snap:any)=>{
      setAllPlayers(snap.docs.map((d:any)=>d.data() as Player));
      setAppLoading(false);
    },()=>setAppLoading(false));
    return()=>unsub();
  },[]);

  // Cerrar menú con Escape
  useEffect(()=>{
    if(!menuOpen) return;
    const handler=(e:KeyboardEvent)=>{ if(e.key==="Escape") setMenuOpen(false); };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[menuOpen]);

  const detectLocation=()=>{
    if(!navigator.geolocation){setLocError("Tu navegador no soporta geolocalización.");return;}
    setLocLoading(true);setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        const loc:Loc={lat:pos.coords.latitude,lon:pos.coords.longitude};
        setUserLoc(loc);setLocLoading(false);lsSet("ps_loc",JSON.stringify(loc));
        // Publicar inmediatamente a Firebase con la nueva ubicación
        if(userName){
          const entry:Player={uuid:userUUID,name:userName,phone:userPhone,have:have||[],want:want||[],loc,updatedAt:Date.now()};
          setDoc(doc(db,"players",userUUID),entry).catch(console.error);
          lsSet("ps_have",JSON.stringify(have||[]));lsSet("ps_want",JSON.stringify(want||[]));
          setSaved(true);setTimeout(()=>setSaved(false),3000);
        }
      },
      ()=>{setLocLoading(false);setLocError("GPS no disponible. Usa la búsqueda manual.");},
      {enableHighAccuracy:false,timeout:8000,maximumAge:300000}
    );
  };

  const searchLocation=async()=>{
    if(!locQuery.trim())return;
    setLocLoading(true);setLocError("");
    try{
      const res=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locQuery)}&format=json&limit=1`,{headers:{"Accept-Language":"es"}});
      const data=await res.json();
      if(!data.length){setLocError("No se encontró esa ciudad. Intenta con otro nombre.");setLocLoading(false);return;}
      const loc:Loc={lat:parseFloat(data[0].lat),lon:parseFloat(data[0].lon)};
      setUserLoc(loc);lsSet("ps_loc",JSON.stringify(loc));
      setLocQuery("");
      // Publicar inmediatamente a Firebase con la nueva ubicación
      if(userName){
        const entry:Player={uuid:userUUID,name:userName,phone:userPhone,have,want,loc,updatedAt:Date.now()};
        setDoc(doc(db,"players",userUUID),entry).catch(console.error);
        lsSet("ps_have",JSON.stringify(have));lsSet("ps_want",JSON.stringify(want));
        setSaved(true);setTimeout(()=>setSaved(false),3000);
      }
    }catch{setLocError("Error al buscar. Verifica tu conexión.");}
    setLocLoading(false);
  };

  const rawMatches:Match[]=(allPlayers||[])
    .filter(p=>p.uuid!==userUUID)
    .map(p=>({...p,canGive:(p.have||[]).filter(c=>(want||[]).includes(c)),canReceive:(have||[]).filter(c=>(p.want||[]).includes(c)),distKm:(userLoc&&p.loc)?haversineKm(userLoc.lat,userLoc.lon,p.loc.lat,p.loc.lon):null,score:0,isNew:!seenMatches.has(p.name)}))
    .map(p=>({...p,score:p.canGive.length+p.canReceive.length}))
    .filter(m=>m.score>0);

  const matches=rawMatches
    .filter(m=>maxDist==null||m.distKm==null||m.distKm<=maxDist)
    .sort((a,b)=>sortBy==="distance"?a.distKm==null?1:b.distKm==null?-1:a.distKm-b.distKm:b.score-a.score);

  useEffect(()=>{
    if(appLoading||view!=="main"||!userName)return;
    const newOnes=rawMatches.filter(m=>!(seenMatches||new Set()).has(m.name));
    if(!newOnes.length)return;
    setToasts(prev=>[...prev,...newOnes.map(m=>`${m.name}${m.distKm!=null?` (a ${fmtDist(m.distKm)})`:""}  tiene ${m.canGive.length} figura${m.canGive.length!==1?"s":""} que buscas.`)]);
    const upd=new Set([...(seenMatches||new Set()),...newOnes.map(m=>m.name)]);
    setSeenMatches(upd);lsSet("ps_seen",JSON.stringify([...upd]));
  },[allPlayers,have,want,appLoading,userName]);

  const validateAccessCode=async(uuid:string)=>{
    const code=accessCode.trim().toUpperCase();
    if(!code){setAccessError("Ingresa un código de acceso.");return false;}
    setAccessChecking(true);setAccessError("");
    try{
      const ref=doc(db,"access_codes",code);
      const snap=await getDoc(ref);
      if(!snap.exists()){setAccessError("Código inválido. Verifica e intenta de nuevo.");setAccessChecking(false);return false;}
      const data=snap.data();
      if(data.used){setAccessError("Este código ya fue utilizado.");setAccessChecking(false);return false;}
      await updateDoc(ref,{used:true,usedBy:uuid,usedAt:Date.now()});
      // Escribir paid:true — si el doc no existe lo crea, si existe lo actualiza
      const playerRef=doc(db,"players",uuid);
      const playerSnap=await getDoc(playerRef);
      if(playerSnap.exists()){
        // Doc existe — solo actualizar paid
        await updateDoc(playerRef,{paid:true});
      } else {
        // Doc no existe aún — crear con datos mínimos
        await setDoc(playerRef,{
          uuid,
          name:lsGet("ps_user")||"",
          phone:lsGet("ps_phone")||"",
          have:[],
          want:[],
          paid:true,
          updatedAt:Date.now()
        });
      }
      setAccessGranted(true);
      lsSet("ps_access","1");
      setAccessChecking(false);
      return true;
    }catch{
      setAccessError("Error al validar. Verifica tu conexión.");
      setAccessChecking(false);
      return false;
    }
  };

  const handleActivateCode=async()=>{
    try{
      const ok=await validateAccessCode(userUUID);
      if(!ok) return;
      // Solo cerramos el modal y marcamos acceso — el usuario guarda manualmente
      setShowAccessModal(false);
      setAccessCode("");
      setAccessError("");
    }catch(e){
      console.error("Error al activar código:",e);
      setAccessError("Error inesperado. Intenta de nuevo.");
      setAccessChecking(false);
    }
  };

  const saveProfile=()=>{
    if(!nameInput.trim()||!phoneInput.trim())return;
    lsSet("ps_user",nameInput.trim());lsSet("ps_phone",phoneInput.trim());
    setUserName(nameInput.trim());setUserPhone(phoneInput.trim());setView("main");
  };

  const restoreProfile=async()=>{
    const code=restoreCode.trim().toLowerCase();
    if(!code){setRestoreError("Ingresa tu código de perfil.");return;}
    const matched=allPlayers.find(p=>p.uuid&&p.uuid.startsWith(code));
    if(!matched){setRestoreError("No se encontró ningún perfil con ese código. Verifica e intenta de nuevo.");return;}
    const newUUID=matched.uuid;
    lsSet("ps_uuid",newUUID);lsSet("ps_user",matched.name);
    if(matched.phone)lsSet("ps_phone",matched.phone);
    lsSet("ps_have",JSON.stringify(matched.have));
    lsSet("ps_want",JSON.stringify(matched.want));
    setUserUUID(newUUID);setUserName(matched.name);setUserPhone(matched.phone||"");
    setHave(matched.have);setWant(matched.want);
    setView("main");
  };

  const publishToFirebase=async(forcePaid=false)=>{
    if(!userName||saving)return;
    setSaving(true);
    const isPaid=forcePaid||accessGranted||undefined;
    const entry:Player={uuid:userUUID,name:userName,phone:userPhone,have:have||[],want:want||[],updatedAt:Date.now(),paid:isPaid||undefined};
    if(userLoc)entry.loc=userLoc;
    try{
      await setDoc(doc(db,"players",userUUID),entry);
      lsSet("ps_have",JSON.stringify(have));lsSet("ps_want",JSON.stringify(want));
      setSaved(true);setTimeout(()=>setSaved(false),3000);
    }catch(e){console.error(e);}finally{setSaving(false);}
  };

  const handleLogout=()=>{
    ["ps_user","ps_phone","ps_have","ps_want","ps_seen","ps_loc","ps_uuid"].forEach(k=>localStorage.removeItem(k));
    window.location.reload();
  };

  const toggleHave=useCallback((c:string)=>{
    setHave(p=>{
      const cur=p||[];
      if(cur.includes(c)) return cur.filter(x=>x!==c);
      // Al agregar a repetidas, quitar de buscadas automáticamente
      setWant(w=>(w||[]).filter(x=>x!==c));
      return [...cur,c];
    });
  },[]);
  const toggleWant=useCallback((c:string)=>setWant(p=>(p||[]).includes(c)?(p||[]).filter(x=>x!==c):[...(p||[]),c]),[]);
  const addToHave=useCallback((cs:string[])=>{
    setHave(p=>[...new Set([...(p||[]),...cs])]);
    // Quitar de buscadas todas las que se agregan a repetidas
    setWant(w=>(w||[]).filter(x=>!cs.includes(x)));
  },[]);
  const addToWant=useCallback((cs:string[])=>setWant(p=>[...new Set([...p,...cs])]),[]);

  const myEntry=allPlayers.find(p=>p.uuid===userUUID);
  const newMatchCount=(rawMatches||[]).filter(m=>m.isNew).length;
  const dismissToast=(i:number)=>setToasts(p=>p.filter((_,idx)=>idx!==i));

  const TABS=[
    {id:"have" as const,label:"Mis Repetidas",color:"#f59e0b"},
    {id:"want" as const,label:"Las que Busco",color:"#22d3ee"},
    {id:"match" as const,label:`Matches${rawMatches.length?` (${rawMatches.length})`:""}`  ,color:"#e03c2d"},
  ];
  const DIST_OPTS:[string,number|null][]=[["Todos",null],["<2 km",2],["<10 km",10],["<30 km",30],["<100 km",100]];
  const inp:React.CSSProperties={width:"100%",background:"#0a1628",border:"2px solid #2a4a6b",borderRadius:"10px",padding:"14px 16px",color:"#e8e8f0",fontFamily:"inherit",fontSize:"16px",outline:"none",boxSizing:"border-box"};

  // ── Loading ──────────────────────────────────────────────────────────────────
  if(appLoading)return(
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0d0d1a"}} role="status" aria-label="Cargando aplicación">
        <div style={{textAlign:"center"}}>
          <div style={{width:"40px",height:"40px",border:"3px solid #1a3050",borderTopColor:"#e03c2d",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}} aria-hidden="true"/>
          <p style={{color:"#a0a0bc",fontFamily:"'DM Mono',monospace",fontSize:"14px",margin:0}}>Conectando…</p>
        </div>
      </div>
    </>
  );

  // ── Setup ────────────────────────────────────────────────────────────────────
  if(view==="setup")return(
    <>
      <style>{GLOBAL_CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:wght@400;700;900&display=swap" rel="stylesheet"/>
      <main style={{minHeight:"100vh",background:"#0d0d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bricolage Grotesque',sans-serif",padding:"24px"}}>
        <div style={{background:"#0d1f35",border:"2px solid #1a3050",borderRadius:"20px",padding:"48px 40px",maxWidth:"440px",width:"100%"}}>
          <div aria-hidden="true" style={{fontSize:"52px",marginBottom:"12px",textAlign:"center"}}>⚽</div>
          <h1 style={{color:"#e8e8f0",margin:"0 0 4px",fontSize:"28px",fontWeight:"900",textAlign:"center"}}>Panini Swap</h1>
          <p style={{color:"#666",fontSize:"13px",margin:"0 0 28px",textAlign:"center"}}>FIFA World Cup 2026</p>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"8px"}}>
            <div>
              <label htmlFor="setup-name" style={{display:"block",color:"#e8e8f0",fontSize:"14px",fontWeight:"700",marginBottom:"6px"}}>
                Nombre o apodo <span aria-hidden="true" style={{color:"#f87171"}}>*</span>
              </label>
              <input id="setup-name" value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveProfile()} placeholder="Ej: Will" required aria-required="true" style={inp}/>
            </div>
            <div>
              <label htmlFor="setup-phone" style={{display:"block",color:"#e8e8f0",fontSize:"14px",fontWeight:"700",marginBottom:"6px"}}>
                WhatsApp <span aria-hidden="true" style={{color:"#f87171"}}>*</span>
              </label>
              <input id="setup-phone" value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} placeholder="50688887777" type="tel" autoComplete="tel" required aria-required="true" style={inp}/>
              <p style={{color:"#666",fontSize:"12px",margin:"6px 0 0",lineHeight:"1.5"}}>Con código de país. Es la forma en que otros coleccionistas te contactarán.</p>
            </div>
          </div>
          {/* Condiciones */}
          <div style={{marginTop:"16px",padding:"12px 14px",background:"#0d0d1a",borderRadius:"8px",border:"1px solid #1a3050"}}>
            <p style={{color:"#666",fontSize:"11px",lineHeight:"1.6",margin:0}}>
              Al crear tu perfil aceptas que <strong style={{color:"#888"}}>Panini Swap</strong> es únicamente una plataforma para conectar coleccionistas. No nos hacemos responsables por los intercambios de figuras entre usuarios, la comunicación por WhatsApp, ni por cualquier acuerdo entre las partes.
            </p>
          </div>

          <button onClick={saveProfile} disabled={!nameInput.trim()||!phoneInput.trim()}
            style={{width:"100%",marginTop:"16px",background:(nameInput.trim()&&phoneInput.trim())?"#e03c2d":"#1a3050",border:"2px solid transparent",borderRadius:"10px",padding:"14px",color:(nameInput.trim()&&phoneInput.trim())?"#fff":"#666",fontFamily:"inherit",fontSize:"16px",fontWeight:"700",cursor:(nameInput.trim()&&phoneInput.trim())?"pointer":"not-allowed",transition:"all 0.2s"}}>
            Crear perfil →
          </button>
          <div style={{marginTop:"20px",paddingTop:"20px",borderTop:"1px solid #1a3050",textAlign:"center"}}>
            <p style={{color:"#666",fontSize:"13px",margin:"0 0 10px"}}>¿Ya tienes un perfil en otro dispositivo?</p>
            <button onClick={()=>setView("restore")}
              style={{background:"none",border:"2px solid #2a4a6b",borderRadius:"10px",padding:"10px 20px",color:"#a0a0bc",fontFamily:"inherit",fontSize:"14px",cursor:"pointer",fontWeight:"700"}}>
              Restaurar con código
            </button>
          </div>
        </div>
      </main>
    </>
  );

  // ── Restore ──────────────────────────────────────────────────────────────────
  if(view==="restore")return(
    <>
      <style>{GLOBAL_CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:wght@400;700;900&display=swap" rel="stylesheet"/>
      <main style={{minHeight:"100vh",background:"#0d0d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bricolage Grotesque',sans-serif",padding:"24px"}}>
        <div style={{background:"#0d1f35",border:"2px solid #1a3050",borderRadius:"20px",padding:"48px 40px",maxWidth:"440px",width:"100%"}}>
          <div aria-hidden="true" style={{fontSize:"40px",marginBottom:"12px",textAlign:"center"}}>🔑</div>
          <h1 style={{color:"#e8e8f0",margin:"0 0 8px",fontSize:"24px",fontWeight:"900",textAlign:"center"}}>Restaurar perfil</h1>
          <p style={{color:"#a0a0bc",fontSize:"14px",margin:"0 0 28px",lineHeight:"1.6",textAlign:"center"}}>
            Ingresa el código de 8 caracteres que aparece en tu perfil del otro dispositivo.
          </p>
          <div>
            <label htmlFor="restore-code" style={{display:"block",color:"#e8e8f0",fontSize:"14px",fontWeight:"700",marginBottom:"6px"}}>
              Código de perfil
            </label>
            <input id="restore-code" value={restoreCode} onChange={e=>{setRestoreCode(e.target.value);setRestoreError("");}}
              onKeyDown={e=>e.key==="Enter"&&restoreProfile()}
              placeholder="Ej: A1B2C3D4"
              style={{...inp,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",textTransform:"uppercase" as const}}
            />
            {restoreError&&<p role="alert" style={{color:"#f87171",fontSize:"13px",margin:"8px 0 0"}}>{restoreError}</p>}
          </div>
          <button onClick={restoreProfile}
            style={{width:"100%",marginTop:"16px",background:"#e03c2d",border:"2px solid transparent",borderRadius:"10px",padding:"14px",color:"#fff",fontFamily:"inherit",fontSize:"16px",fontWeight:"700",cursor:"pointer"}}>
            Restaurar perfil →
          </button>
          <button onClick={()=>setView("setup")}
            style={{width:"100%",marginTop:"10px",background:"none",border:"2px solid #2a4a6b",borderRadius:"10px",padding:"12px",color:"#a0a0bc",fontFamily:"inherit",fontSize:"14px",cursor:"pointer"}}>
            ← Volver
          </button>
        </div>
      </main>
    </>
  );

  // ── Main app ─────────────────────────────────────────────────────────────────
  return(
    <>
      <style>{GLOBAL_CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:wght@400;700;900&display=swap" rel="stylesheet"/>
      <Toast notifications={toasts} onDismiss={dismissToast}/>

      {/* ── Modal de código de acceso ── */}
      {showAccessModal&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}
          onClick={()=>{if(!accessChecking){setShowAccessModal(false);setAccessError("");setAccessCode("");}}}>
          <div style={{background:"#0d1f35",border:"2px solid #1a3050",borderRadius:"20px",padding:"32px 28px",maxWidth:"400px",width:"100%",fontFamily:"'Bricolage Grotesque',sans-serif"}}
            onClick={e=>e.stopPropagation()}>

            {accessGranted?(
              /* Estado: acceso activado */
              <div style={{textAlign:"center"}}>
                <div aria-hidden="true" style={{fontSize:"48px",marginBottom:"12px"}}>🎉</div>
                <h2 style={{color:"#4ade80",fontWeight:"900",fontSize:"20px",margin:"0 0 8px"}}>¡Acceso activado!</h2>
                <p style={{color:"#a0a0bc",fontSize:"14px",lineHeight:"1.6",margin:"0 0 24px"}}>
                  Ya podés guardar tu perfil y ver los matches. Presioná <strong style={{color:"#e8e8f0"}}>Guardar</strong> para publicar tu lista.
                </p>
                <button onClick={()=>{setShowAccessModal(false);setAccessCode("");setAccessError("");}}
                  style={{width:"100%",background:"#e03c2d",border:"2px solid transparent",borderRadius:"10px",padding:"13px",color:"#fff",fontFamily:"inherit",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>
                  ¡Entendido! →
                </button>
              </div>
            ):(
              /* Estado: ingresar código */
              <>
                <div aria-hidden="true" style={{fontSize:"36px",textAlign:"center",marginBottom:"12px"}}>🔒</div>
                <h2 style={{color:"#e8e8f0",fontWeight:"900",fontSize:"20px",textAlign:"center",margin:"0 0 8px"}}>Código de acceso</h2>
                <p style={{color:"#a0a0bc",fontSize:"14px",textAlign:"center",lineHeight:"1.6",margin:"0 0 20px"}}>
                  Para guardar tu perfil y conectar con otros coleccionistas necesitas un código de acceso.
                </p>
                <input
                  value={accessCode}
                  onChange={e=>{setAccessCode(e.target.value.toUpperCase());setAccessError("");}}
                  onKeyDown={e=>{if(e.key==="Enter") handleActivateCode();}}
                  placeholder="Ej: SWAP-4X9K"
                  autoFocus
                  style={{width:"100%",background:"#0a1628",border:`2px solid ${accessError?"#f87171":"#2a4a6b"}`,borderRadius:"10px",padding:"14px 16px",color:"#e8e8f0",fontFamily:"'DM Mono',monospace",fontSize:"16px",outline:"none",boxSizing:"border-box" as const,letterSpacing:"0.08em",marginBottom:"8px"}}
                />
                {accessError&&<p role="alert" style={{color:"#f87171",fontSize:"13px",margin:"0 0 12px"}}>{accessError}</p>}
                <button
                  onClick={handleActivateCode}
                  disabled={!accessCode.trim()||accessChecking}
                  style={{width:"100%",background:accessCode.trim()&&!accessChecking?"#e03c2d":"#1a3050",border:"2px solid transparent",borderRadius:"10px",padding:"13px",color:accessCode.trim()&&!accessChecking?"#fff":"#666",fontFamily:"inherit",fontSize:"15px",fontWeight:"700",cursor:accessCode.trim()&&!accessChecking?"pointer":"not-allowed",marginBottom:"10px"}}>
                  {accessChecking?"Verificando...":"Activar acceso →"}
                </button>
                <p style={{color:"#666",fontSize:"12px",textAlign:"center",margin:"0 0 12px"}}>¿No tienes código? Escríbenos para obtener el tuyo.</p>
                <a href="https://wa.me/50660582201?text=Hola%2C%20quiero%20un%20c%C3%B3digo%20para%20Panini%20Swap%20%E2%9A%BD"
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",background:"#25d366",borderRadius:"10px",padding:"12px",color:"#fff",fontWeight:"700",fontSize:"14px",textDecoration:"none",fontFamily:"inherit"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Obtener código por WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {menuOpen&&(
        <HamburgerMenu
          userName={userName}
          userPhone={userPhone}
          userLoc={userLoc}
          userUUID={userUUID}
          accessGranted={accessGranted}
          onClose={()=>setMenuOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <div aria-live="polite" aria-atomic="true" style={{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0,0,0,0)"}}>
        {saved?"Perfil publicado correctamente":saving?"Publicando…":""}
      </div>

      <div style={{minHeight:"100vh",background:"#0d0d1a",fontFamily:"'Bricolage Grotesque',sans-serif",color:"#e8e8f0",paddingBottom:"48px"}}>

        {/* ── Header limpio: logo | Guardar + hamburger ── */}
        <header style={{background:"#0d1f35",borderBottom:"2px solid #0a1628",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,gap:"10px"}}>
          <span style={{fontSize:"17px",fontWeight:"900",whiteSpace:"nowrap" as const,flexShrink:0}}>
            <span aria-hidden="true">⚽</span> Panini Swap
          </span>

          <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
            {!accessGranted&&(
              <button onClick={()=>setShowAccessModal(true)}
                style={{background:"#e03c2d22",border:"2px solid #e03c2d88",borderRadius:"8px",padding:"6px 10px",color:"#ff7b6e",fontFamily:"inherit",fontSize:"12px",fontWeight:"700",cursor:"pointer",whiteSpace:"nowrap" as const,lineHeight:1.3,textAlign:"center" as const}}>
                🔒 Activar<br/><span style={{fontSize:"11px",fontWeight:"400"}}>₡1.500</span>
              </button>
            )}
            <button onClick={accessGranted?()=>publishToFirebase():()=>setShowAccessModal(true)} disabled={saving}
              aria-label={saved?"Cambios guardados":saving?"Guardando cambios":"Guardar cambios"}
              style={{background:!accessGranted?"#e03c2d":saved?"#14532d":saving?"#1a3050":"#e03c2d",border:"2px solid transparent",borderRadius:"8px",padding:"8px 16px",color:saved?"#86efac":saving?"#666":"#fff",fontWeight:"700",fontSize:"14px",cursor:saving?"default":"pointer",fontFamily:"inherit",transition:"all 0.3s",whiteSpace:"nowrap" as const}}>
              {!accessGranted?"🔒 Guardar":saved?"✓ Guardado":saving?"Guardando...":"Guardar"}
            </button>

            {/* Botón hamburger */}
            <button
              onClick={()=>setMenuOpen(true)}
              aria-label="Abrir menú de perfil"
              aria-expanded={menuOpen}
              style={{background:"#0a1628",border:"2px solid #2a4a6b",borderRadius:"8px",padding:"0",color:"#a0a0bc",cursor:"pointer",display:"flex",flexDirection:"column",gap:"4px",alignItems:"center",justifyContent:"center",width:"40px",height:"40px",flexShrink:0}}>
              <span style={{display:"block",width:"16px",height:"2px",background:"#a0a0bc",borderRadius:"2px"}}/>
              <span style={{display:"block",width:"16px",height:"2px",background:"#a0a0bc",borderRadius:"2px"}}/>
              <span style={{display:"block",width:"16px",height:"2px",background:"#a0a0bc",borderRadius:"2px"}}/>
            </button>
          </div>
        </header>

        <main style={{maxWidth:"900px",margin:"0 auto",padding:"24px 16px"}}>

          {/* Stats — 4 cols desktop, 2 cols mobile */}
          <section aria-label="Resumen" className="stats-grid">
            {[
              {label:"Repetidas",val:have.length,color:"#f59e0b"},
              {label:"Buscando",val:want.length,color:"#22d3ee"},
              {label:"Coleccionistas",val:(allPlayers||[]).filter(p=>p.paid).length,color:"#a78bfa"},
              {label:"Cerca de ti",val:(rawMatches||[]).filter(m=>m.distKm!=null&&m.distKm<=10).length,color:"#86efac"},
            ].map(s=>(
              <div key={s.label} style={{background:"#0d1f35",border:"2px solid #0a1628",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:"26px",fontWeight:"900",color:s.color}} aria-hidden="true">{s.val}</div>
                <div style={{fontSize:"12px",color:"#a0a0bc",marginTop:"2px"}} aria-label={`${s.val} ${s.label}`}>{s.label}</div>
              </div>
            ))}
          </section>

          {/* Tabs */}
          <div role="tablist" aria-label="Secciones" style={{display:"flex",gap:"4px",marginBottom:"20px",background:"#0d1f35",padding:"4px",borderRadius:"12px"}}>
            {TABS.map(t=>(
              <button key={t.id} role="tab" onClick={()=>setTab(t.id)} aria-selected={tab===t.id} aria-controls={`panel-${t.id}`} id={`tab-${t.id}`}
                style={{flex:1,padding:"10px",borderRadius:"8px",border:"2px solid transparent",background:tab===t.id?t.color:"transparent",color:tab===t.id?(t.id==="have"?"#0d0d1a":"#fff"):"#a0a0bc",fontFamily:"inherit",fontSize:"13px",fontWeight:"700",cursor:"pointer",transition:"all 0.2s",position:"relative"}}>
                {t.label}
                {t.id==="match"&&newMatchCount>0&&(
                  <span aria-label={`${newMatchCount} matches nuevos`} style={{position:"absolute",top:"4px",right:"6px",background:"#ef4444",color:"#fff",borderRadius:"10px",fontSize:"10px",fontWeight:"700",padding:"1px 5px"}}>{newMatchCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Panel: Mis Repetidas */}
          <div id="panel-have" role="tabpanel" aria-labelledby="tab-have" hidden={tab!=="have"}>
            <p style={{color:"#a0a0bc",fontSize:"14px",margin:"0 0 12px",lineHeight:"1.6"}}>Selecciona por país las figuras que tienes repetidas, o escribe rangos como <code style={{color:"#f59e0b",background:"#f59e0b11",padding:"1px 6px",borderRadius:"4px"}}>ARG1-5, BRA7</code></p>
            <RangeSelector onAdd={addToHave} accent="#f59e0b"/>
            <StickerPanel selected={have} onToggle={toggleHave} accent="#f59e0b" labelPrefix="repetida"/>
            <Footer tab="have"/>
          </div>

          {/* Panel: Las que Busco */}
          <div id="panel-want" role="tabpanel" aria-labelledby="tab-want" hidden={tab!=="want"}>
            <p style={{color:"#a0a0bc",fontSize:"14px",margin:"0 0 12px",lineHeight:"1.6"}}>Selecciona las figuras que te faltan. Otros las verán al hacer match contigo.</p>
            <RangeSelector onAdd={addToWant} accent="#22d3ee"/>
            <StickerPanel selected={want} onToggle={toggleWant} accent="#22d3ee" labelPrefix="buscada"/>
            <Footer tab="want"/>
          </div>

          {/* Panel: Matches */}
          <div id="panel-match" role="tabpanel" aria-labelledby="tab-match" hidden={tab!=="match"}>
            {!accessGranted&&(
              <div style={{textAlign:"center",padding:"48px 24px",background:"#0d1f35",borderRadius:"12px",border:"2px solid #1a3050"}}>
                <div aria-hidden="true" style={{fontSize:"40px",marginBottom:"12px"}}>🔒</div>
                <h2 style={{color:"#e8e8f0",fontSize:"18px",fontWeight:"900",margin:"0 0 8px"}}>Acceso requerido</h2>
                <p style={{color:"#a0a0bc",fontSize:"14px",lineHeight:"1.6",margin:"0 0 20px"}}>
                  Para ver los matches y conectar con otros coleccionistas necesitas un código de acceso.<br/>
                  Escríbenos por WhatsApp para obtener el tuyo.
                </p>
                <a href="https://wa.me/50660582201?text=Hola%2C%20quiero%20un%20c%C3%B3digo%20para%20Panini%20Swap%20%E2%9A%BD"
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#25d366",borderRadius:"10px",padding:"12px 24px",color:"#fff",fontWeight:"700",fontSize:"15px",textDecoration:"none",fontFamily:"inherit"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Obtener código por WhatsApp
                </a>
              </div>
            )}
            {accessGranted&&<>
            <section aria-label="Mi ubicación" style={{background:"#0d1f35",border:"2px solid #0a1628",borderRadius:"12px",padding:"16px",marginBottom:"16px"}}>
              <h2 style={{color:"#e8e8f0",fontWeight:"700",fontSize:"15px",margin:"0 0 4px"}}><span aria-hidden="true">📍</span> Mi ubicación</h2>
              {userLoc
                ?<p style={{color:"#22d3ee",fontSize:"13px",margin:"0 0 12px"}}>Ubicación registrada — los matches muestran distancia</p>
                :<p style={{color:"#888",fontSize:"13px",margin:"0 0 12px"}}>Registra tu ubicación para ver qué tan lejos están los coleccionistas</p>
              }

              {/* Botón GPS */}
              <div style={{display:"flex",gap:"8px",marginBottom:"10px",flexWrap:"wrap" as const}}>
                <button onClick={detectLocation} disabled={locLoading}
                  style={{background:userLoc?"#0f2318":"#14532d",border:`2px solid ${userLoc?"#22d3ee66":"#22d3ee"}`,borderRadius:"8px",padding:"9px 16px",color:userLoc?"#86efac":"#fff",fontFamily:"inherit",fontWeight:"700",fontSize:"13px",cursor:locLoading?"default":"pointer",whiteSpace:"nowrap" as const}}>
                  {locLoading?"Detectando...":userLoc?"✓ GPS activo":"📡 Usar GPS"}
                </button>
                {userLoc&&(
                  <button onClick={()=>{
                      setUserLoc(null);
                      localStorage.removeItem("ps_loc");
                      if(userName){
                        const entry:Player={uuid:userUUID,name:userName,phone:userPhone,have,want,updatedAt:Date.now()};
                        setDoc(doc(db,"players",userUUID),entry).catch(console.error);
                      }
                    }}
                    style={{background:"none",border:"2px solid #2a4a6b",borderRadius:"8px",padding:"9px 14px",color:"#888",fontFamily:"inherit",fontSize:"13px",cursor:"pointer"}}>
                    Quitar
                  </button>
                )}
              </div>

              {/* Búsqueda manual — fallback para Chrome iOS */}
              <div style={{display:"flex",gap:"8px"}}>
                <input
                  value={locQuery}
                  onChange={e=>setLocQuery(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&searchLocation()}
                  placeholder="O escribe tu ciudad: San José, CR"
                  style={{flex:1,background:"#0a1628",border:"2px solid #2a4a6b",borderRadius:"8px",padding:"9px 12px",color:"#e8e8f0",fontFamily:"inherit",fontSize:"13px",outline:"none"}}
                />
                <button onClick={searchLocation} disabled={locLoading||!locQuery.trim()}
                  style={{background:"#e03c2d",border:"2px solid transparent",borderRadius:"8px",padding:"9px 14px",color:"#fff",fontFamily:"inherit",fontWeight:"700",fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap" as const}}>
                  Buscar
                </button>
              </div>

              {locError&&<p role="alert" style={{color:"#f87171",fontSize:"13px",margin:"8px 0 0"}}>{locError}</p>}
            </section>

            {rawMatches.length>0&&(
              <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap" as const,alignItems:"center"}}>
                <span id="dist-label" style={{color:"#a0a0bc",fontSize:"13px"}}>Distancia:</span>
                <div role="group" aria-labelledby="dist-label" style={{display:"flex",gap:"6px",flexWrap:"wrap" as const}}>
                  {DIST_OPTS.map(([label,val])=>(
                    <button key={label} onClick={()=>setMaxDist(val)} aria-pressed={maxDist===val}
                      style={{background:maxDist===val?"#e03c2d":"#0d1f35",border:`2px solid ${maxDist===val?"#e03c2d":"#2a4a6b"}`,borderRadius:"20px",padding:"5px 12px",color:maxDist===val?"#fff":"#a0a0bc",fontSize:"13px",cursor:"pointer",fontFamily:"inherit",fontWeight:maxDist===val?"700":"400"}}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:"6px",alignItems:"center"}}>
                  <span id="sort-label" style={{color:"#a0a0bc",fontSize:"13px"}}>Orden:</span>
                  <div role="group" aria-labelledby="sort-label" style={{display:"flex",gap:"6px"}}>
                    {(["score","distance"] as const).map(v=>(
                      <button key={v} onClick={()=>setSortBy(v)} aria-pressed={sortBy===v}
                        style={{background:sortBy===v?"#0a1628":"transparent",border:`2px solid ${sortBy===v?"#e03c2d":"#2a4a6b"}`,borderRadius:"8px",padding:"5px 10px",color:sortBy===v?"#e8e8f0":"#888",fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
                        {v==="score"?"Relevancia":"Distancia"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {matches.length===0?(
              <div style={{textAlign:"center",padding:"48px 0"}}>
                <div aria-hidden="true" style={{fontSize:"40px",marginBottom:"12px"}}>🔍</div>
                <p style={{fontSize:"15px",color:"#888",lineHeight:"1.6",margin:0}}>
                  {allPlayers.length<=1?"Aún no hay otros coleccionistas. Comparte la app con tu grupo.":maxDist!=null?`No hay matches dentro de ${maxDist} km. Prueba ampliar el radio.`:"No hay matches todavía. Publica tu lista y espera que otros se unan."}
                </p>
              </div>
            ):(
              <section aria-label={`${matches.length} matches encontrados`}>
                <p style={{color:"#888",fontSize:"13px",margin:"0 0 16px"}}>
                  {matches.length} coleccionista{matches.length!==1?"s":""} con intercambios posibles.
                  {newMatchCount>0&&<span style={{color:"#a78bfa",marginLeft:"6px"}}>{newMatchCount} nuevo{newMatchCount!==1?"s":""} ✨</span>}
                </p>
                {matches.map(m=><MatchCard key={m.name} match={m} myName={userName}/>)}
              </section>
            )}

            {myEntry&&(
              <section aria-label="Tu perfil publicado" style={{marginTop:"24px",padding:"16px",background:"#0d1f35",borderRadius:"12px",border:"2px solid #0a1628"}}>
                <h2 style={{fontSize:"13px",color:"#888",fontWeight:"400",margin:"0 0 10px"}}>Tu perfil en la red</h2>
                <dl style={{display:"flex",flexWrap:"wrap" as const,gap:"14px",fontSize:"13px",margin:0}}>
                  <div><dt style={{display:"inline",color:"#888"}}>Repetidas: </dt><dd style={{display:"inline",color:"#f59e0b",margin:0,fontWeight:"700"}}>{myEntry.have.length}</dd></div>
                  <div><dt style={{display:"inline",color:"#888"}}>Buscando: </dt><dd style={{display:"inline",color:"#22d3ee",margin:0,fontWeight:"700"}}>{myEntry.want.length}</dd></div>
                  <div><dt style={{display:"inline",color:"#888"}}>WhatsApp: </dt><dd style={{display:"inline",color:myEntry.phone?"#86efac":"#555",margin:0}}>{myEntry.phone?"✓ Sí":"No"}</dd></div>
                  <div><dt style={{display:"inline",color:"#888"}}>Ubicación: </dt><dd style={{display:"inline",color:myEntry.loc?"#86efac":"#555",margin:0}}>{myEntry.loc?"✓ Sí":"No"}</dd></div>
                  <div><dt style={{display:"inline",color:"#888"}}>Actualizado: </dt><dd style={{display:"inline",color:"#555",margin:0}}>{new Date(myEntry.updatedAt).toLocaleDateString()}</dd></div>
                </dl>
                {accessGranted&&(
                  <div style={{marginTop:"14px",background:"#0d0d1a",borderRadius:"8px",padding:"12px 14px",border:"1px solid #2a4a6b"}}>
                    <p style={{color:"#888",fontSize:"12px",margin:"0 0 6px"}}>Tu código de perfil — úsalo para acceder desde otro dispositivo:</p>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      <code style={{color:"#a78bfa",fontFamily:"'DM Mono',monospace",fontSize:"18px",fontWeight:"700",letterSpacing:"0.12em"}}>{shortCode(userUUID)}</code>
                      <button onClick={()=>navigator.clipboard?.writeText(shortCode(userUUID))}
                        aria-label="Copiar código de perfil"
                        style={{background:"#0a1628",border:"1px solid #2a4a6b",borderRadius:"6px",padding:"4px 10px",color:"#a0a0bc",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
              <Footer tab="match"/>
            </>}
          </div>
        </main>
      </div>
    </>
  );
}
