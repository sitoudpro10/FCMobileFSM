
const P=window.FSM_PLAYERS||[];
const $=id=>document.getElementById(id);
const money=n=>n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?Math.round(n/1e6)+"M":new Intl.NumberFormat("es-ES").format(n);
const initials=s=>s.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
let state=JSON.parse(localStorage.getItem("fsm_final_state")||"null")||{email:null,uses:2,pro:false,squad:[]};

function persist(){localStorage.setItem("fsm_final_state",JSON.stringify(state)); updateHeader();}
function card(p){
 return `<article class="card"><div class="art"><div class="ovr">${p.ovr}</div><div class="pos">${p.pos}</div><div class="crest">${initials(p.club)}</div><div class="face">${p.country}</div><div class="flag">${p.country}</div></div><h3>${p.name}</h3><p class="sub">${p.club}</p><div class="stats"><span>RIT ${p.pace}</span><span>TIR ${p.shoot}</span><span>PAS ${p.pass}</span><span>REG ${p.dribble}</span><span>DEF ${p.def}</span><span>FIS ${p.phys}</span></div><div class="price">🪙 ${money(p.price)}</div></article>`;
}
function options(){return `<option value="">Seleccionar...</option>`+P.map(p=>`<option value="${p.id}">${p.name} · ${p.pos}</option>`).join("");}
function go(id){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 $(id).classList.add("active");
 document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===id));
 scrollTo({top:0,behavior:"smooth"});
}
function updateHeader(){
 $("usage").textContent=state.pro?"⭐ PRO · ∞":`🎟️ ${state.uses}/5`;
 $("accountBtn").textContent=state.email?`👤 ${state.email.split("@")[0]}`:"👤 Cuenta";
 $("planText").textContent=state.pro?"FSM PRO":"FREE";
 $("remaining").textContent=state.pro?"Ilimitados":state.uses+" análisis restantes";
 $("bar").style.width=(state.pro?100:state.uses/5*100)+"%";
 $("logout").style.display=state.email?"inline-block":"none";
 $("authBox").style.display=state.email?"none":"block";
 $("loggedBox").style.display=state.email?"block":"none";
 if(state.email) $("userEmail").textContent=state.email;
}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2400)}
function needCredit(){
 if(state.pro)return true;
 if(state.uses<=0){openPro();return false}
 state.uses--;persist();return true;
}
function recommend(){
 if(!needCredit())return;
 const budget=+$("budget").value,pos=$("recPos").value,key=$("priority").value;
 if(!budget){state.uses++;persist();toast("Escribe un presupuesto.");return}
 let arr=P.filter(p=>p.price<=budget&&p.pos===pos);
 if(!arr.length){$("results").innerHTML=`<div class="notice">No hay jugadores DEMO que cumplan esos filtros.</div>`;return}
 const max=Math.max(...arr.map(p=>p[key]||p.ovr));
 arr=arr.map(p=>({...p,score:key==="value"?p.ovr*.5+((p.pace+p.shoot+p.dribble)/3)*.25+(p.ovr/(p.price/1e6))*.25:(p[key]/max*100)*.7+(p.ovr/122*100)*.3})).sort((a,b)=>b.score-a.score).slice(0,5);
 $("results").innerHTML=arr.map((p,i)=>`<div class="result"><div class="mini">${p.country}</div><div class="grow"><b>${["🥇","🥈","🥉","⭐","⭐"][i]} ${p.name}</b><div class="muted">GRL ${p.ovr} · ${p.club} · 🪙 ${money(p.price)}</div></div><div class="score">${p.score.toFixed(1)}</div></div>`).join("");
 $("resultTitle").textContent=state.pro?"Resultado FSM PRO":"Resultado FSM";
}
function compare(){
 const a=P.find(p=>p.id==$("playerA").value),b=P.find(p=>p.id==$("playerB").value);
 if(!a||!b){$("compareOut").innerHTML='<div class="notice">Selecciona dos jugadores.</div>';return}
 const rows=[["GRL","ovr"],["Ritmo","pace"],["Tiro","shoot"],["Pase","pass"],["Regate","dribble"],["Defensa","def"],["Físico","phys"]];
 const box=p=>`<div class="panel"><h2>${p.country} ${p.name}</h2>${rows.map(r=>`<div class="metric"><span class="muted">${r[0]}</span><b>${p[r[1]]}</b></div>`).join("")}<p class="price">🪙 ${money(p.price)}</p></div>`;
 $("compareOut").innerHTML=`<div class="compare">${box(a)}${box(b)}</div>`;
}
function buildSquad(){
 const saved=state.squad||[];
 const positions=[["gk","GK"],["lb","LB"],["cb1","CB"],["cb2","CB"],["rb","RB"],["cm1","CM"],["cm2","CM"],["cam","CAM"],["lw","LW"],["rw","RW"],["st","ST"]];
 $("formation").innerHTML=`<div class="spot gk"><select data-slot>${options()}</select><span>GK</span></div><div class="spot lb"><select data-slot>${options()}</select><span>LB</span></div><div class="spot cb1"><select data-slot>${options()}</select><span>CB</span></div><div class="spot cb2"><select data-slot>${options()}</select><span>CB</span></div><div class="spot rb"><select data-slot>${options()}</select><span>RB</span></div><div class="spot cm1"><select data-slot>${options()}</select><span>CM</span></div><div class="spot cm2"><select data-slot>${options()}</select><span>CM</span></div><div class="spot cam"><select data-slot>${options()}</select><span>CAM</span></div><div class="spot lw"><select data-slot>${options()}</select><span>LW</span></div><div class="spot rw"><select data-slot>${options()}</select><span>RW</span></div><div class="spot st"><select data-slot>${options()}</select><span>ST</span></div><div class="circle" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:75px;height:75px;border:2px solid #ffffff75;border-radius:50%"></div>`;
 document.querySelectorAll("[data-slot]").forEach((s,i)=>s.value=saved[i]||"");
}
function saveSquad(){
 state.squad=[...document.querySelectorAll("[data-slot]")].map(s=>s.value);persist();
 const arr=state.squad.map(id=>P.find(p=>p.id==id)).filter(Boolean);
 $("squadSummary").innerHTML=`<b>✅ Plantilla guardada</b><p class="muted">${arr.length}/11 jugadores seleccionados.</p>`;
}
function analyzeSquad(){
 const arr=state.squad.map(id=>P.find(p=>p.id==id)).filter(Boolean);
 if(!arr.length){$("squadSummary").innerHTML='<div class="notice">Selecciona jugadores y pulsa guardar.</div>';return}
 const avg=arr.reduce((s,p)=>s+p.ovr,0)/arr.length;
 const att=arr.reduce((s,p)=>s+(p.pace+p.shoot+p.dribble)/3,0)/arr.length;
 const def=arr.reduce((s,p)=>s+p.def,0)/arr.length;
 $("squadSummary").innerHTML=`<div class="pro"><h3>🧠 Análisis FSM</h3><p>GRL medio: <b>${avg.toFixed(1)}</b></p><p>Ataque: <b>${att.toFixed(1)}</b> · Defensa: <b>${def.toFixed(1)}</b></p><p class="muted">${def<75?"Tu mayor prioridad es reforzar la defensa.":att<82?"Te falta potencia ofensiva.":"Plantilla equilibrada para la demo."}</p></div>`;
}
function market(){
 const p=P.find(x=>x.id==$("marketPlayer").value),v=+$("marketPrice").value;
 if(!p||!v){$("marketOut").innerHTML='<div class="notice">Selecciona jugador y precio.</div>';return}
 const r=v/p.price,label=r<.9?"🟢 BUENA COMPRA":r<1.08?"🟡 PRECIO NORMAL":"🔴 CARO";
 $("marketOut").innerHTML=`<div class="pro"><h2>${label}</h2><p>Precio introducido: <b>🪙 ${money(v)}</b></p><p>Referencia FSM DEMO: <b>🪙 ${money(p.price)}</b></p><p class="muted">Los precios son de demostración y no representan el mercado real.</p></div>`;
}
function auth(){
 const email=$("email").value.trim(),pass=$("password").value;
 if(!email||!pass){toast("Completa email y contraseña.");return}
 if(pass.length<6){toast("La contraseña debe tener 6 caracteres o más.");return}
 state.email=email;persist();toast("Cuenta local creada correctamente.");go("account");
}
function logout(){state.email=null;state.pro=false;state.uses=2;persist();toast("Sesión cerrada.")}
function openPro(){$("modal").classList.add("show")}function closePro(){$("modal").classList.remove("show")}
function activateDemo(){state.pro=true;persist();closePro();toast("⭐ FSM PRO activado en modo DEMO. No se ha cobrado nada.");}
function init(){
 $("featured").innerHTML=P.slice(0,5).map(card).join("");$("allPlayers").innerHTML=P.map(card).join("");
 $("playerA").innerHTML=options();$("playerB").innerHTML=options();$("marketPlayer").innerHTML=options();buildSquad();
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>go(b.dataset.page));
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
 $("search").oninput=e=>{go("players");filterPlayers(e.target.value)};$("playerSearch").oninput=e=>filterPlayers(e.target.value);
 $("recommend").onclick=recommend;$("compareBtn").onclick=compare;$("marketBtn").onclick=market;$("saveSquad").onclick=()=>{saveSquad();analyzeSquad()};
 $("accountBtn").onclick=()=>go("account");$("proBtn").onclick=openPro;$("modalClose").onclick=closePro;$("activate").onclick=activateDemo;
 $("authSubmit").onclick=auth;$("logout").onclick=logout;
 updateHeader();
}
function filterPlayers(q){q=q.toLowerCase();$("allPlayers").innerHTML=P.filter(p=>(p.name+" "+p.club+" "+p.pos).toLowerCase().includes(q)).map(card).join("")||"<div class='notice'>No hay resultados.</div>"}
window.addEventListener("DOMContentLoaded",init);
