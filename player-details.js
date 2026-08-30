(() => {
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const money=v=>{const n=Number(v)||0;if(!n)return"—";if(n>=1e9)return`${(n/1e9).toFixed(1)}B`;if(n>=1e6)return`${Math.round(n/1e6)}M`;return new Intl.NumberFormat("es-ES").format(n)};
const ps=()=>Array.isArray(window.FSM_PLAYERS)?window.FSM_PLAYERS:[];
const find=id=>ps().find(p=>String(p?.id??"")===String(id??""))||null;
function init(){
if($("fsmPlayerDetail"))return;
const s=document.createElement("style");s.textContent=`#fsmPlayerDetail{position:fixed;inset:0;z-index:120000;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.82);backdrop-filter:blur(10px)}#fsmPlayerDetail.open{display:flex}.fsm-pd-box{width:min(780px,100%);max-height:90vh;overflow:auto;background:#0f1520;border:1px solid #ffffff14;border-radius:20px;box-shadow:0 30px 100px #000b}.fsm-pd-head{display:flex;justify-content:space-between;padding:15px 18px;color:#fff;border-bottom:1px solid #ffffff0d}.fsm-pd-close{border:1px solid #ffffff12;border-radius:10px;background:#ffffff08;color:#fff;font-size:22px;cursor:pointer}.fsm-pd-main{display:grid;grid-template-columns:270px 1fr;gap:20px;padding:20px}.fsm-pd-visual{position:relative;min-height:330px;display:flex;align-items:center;justify-content:center;border:1px solid #ffffff10;border-radius:16px;background:linear-gradient(160deg,#171326,#080c13);overflow:hidden}.fsm-pd-visual img{width:100%;height:100%;max-height:420px;object-fit:contain;padding:12px}.fsm-pd-initials{font-size:76px;font-weight:950;color:#fff}.fsm-pd-ovr{position:absolute;top:12px;left:14px;font-size:36px;font-weight:950;color:#fff}.fsm-pd-pos{position:absolute;top:56px;left:16px;color:#bcaeff;font-weight:900}.fsm-pd-info h2{margin:0;color:#fff;font-size:30px}.fsm-pd-meta{margin:6px 0 14px;color:#929caf;font-size:13px}.fsm-pd-price{margin-bottom:16px;color:#fff;font-size:28px;font-weight:950}.fsm-pd-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.fsm-pd-actions button{padding:10px 13px;border-radius:10px;font-weight:800;cursor:pointer}.fsm-pd-primary{border:0;background:#7c5cff;color:#fff}.fsm-pd-secondary{border:1px solid #ffffff12;background:#ffffff08;color:#fff}.fsm-pd-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fsm-pd-stat{display:flex;justify-content:space-between;padding:10px 12px;border:1px solid #ffffff0c;border-radius:10px;background:#ffffff04;color:#aeb5c5;font-size:12px}.fsm-pd-stat b{color:#fff}@media(max-width:700px){.fsm-pd-main{grid-template-columns:1fr}.fsm-pd-visual{min-height:250px}.fsm-pd-stats{grid-template-columns:1fr}}`;document.head.appendChild(s);
const m=document.createElement("div");m.id="fsmPlayerDetail";m.innerHTML=`<div class="fsm-pd-box"><div class="fsm-pd-head"><strong>Ficha del jugador</strong><button id="fsmPdClose" class="fsm-pd-close" type="button">×</button></div><div id="fsmPdContent"></div></div>`;document.body.appendChild(m);
const close=()=>{$("fsmPlayerDetail")?.classList.remove("open");document.body.style.overflow=""};
$("fsmPdClose").onclick=close;m.onclick=e=>{if(e.target===m)close()};
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
document.addEventListener("click",e=>{
if(e.target.closest("[data-fav-player]"))return;
const c=e.target.closest(".card[data-player-id]");if(!c)return;
const p=find(c.dataset.playerId);if(!p)return;
const img=c.querySelector("img")?.src||"";
let f=new Set();try{f=new Set(JSON.parse(localStorage.getItem("fsm_favorites_v1")||"[]").map(String))}catch{}
const id=String(p.id),fav=f.has(id),ini=String(p.name||"?").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
const stat=(n,v)=>`<div class="fsm-pd-stat"><span>${esc(n)}</span><b>${esc(v??"—")}</b></div>`;
$("fsmPdContent").innerHTML=`<div class="fsm-pd-main"><div class="fsm-pd-visual"><div class="fsm-pd-ovr">${esc(p.ovr)}</div><div class="fsm-pd-pos">${esc(p.pos)}</div>${img?`<img src="${esc(img)}" alt="${esc(p.name)}" loading="eager">`:`<div class="fsm-pd-initials">${esc(ini)}</div>`}</div><div class="fsm-pd-info"><h2>${esc(p.name)}</h2><div class="fsm-pd-meta">${esc(p.club)} · ${esc(p.league)} · ${esc(p.country)}</div><div class="fsm-pd-price">🪙 ${money(p.price)}</div><div class="fsm-pd-actions"><button id="fsmPdFav" class="fsm-pd-primary" type="button">${fav?"★ Quitar favorito":"☆ Añadir favorito"}</button><button id="fsmPdCompare" class="fsm-pd-secondary" type="button">⚖️ Comparar</button></div><div class="fsm-pd-stats">${stat("Ritmo",p.pace)}${stat("Tiro",p.shoot)}${stat("Pase",p.pass)}${stat("Regate",p.dribble)}${stat("Defensa",p.def)}${stat("Físico",p.phys)}</div></div></div>`;
$("fsmPdFav").onclick=()=>{f.has(id)?f.delete(id):f.add(id);localStorage.setItem("fsm_favorites_v1",JSON.stringify([...f]));$("fsmPdFav").textContent=f.has(id)?"★ Quitar favorito":"☆ Añadir favorito";document.dispatchEvent(new CustomEvent("fsm:favorites-changed"))};
$("fsmPdCompare").onclick=()=>{close();document.querySelector('[data-page="compare"]')?.click();const q=$("playerA");if(q){q.value=id;q.dispatchEvent(new Event("change",{bubbles:true}))}};
m.classList.add("open");document.body.style.overflow="hidden";
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
