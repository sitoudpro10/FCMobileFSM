(() => {
"use strict";
const URL="https://jshevgjyweoianpbbjdl.supabase.co",KEY="sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK",FN=`${URL}/functions/v1/create-fsm-checkout`, $=id=>document.getElementById(id);
async function checkout(){try{if(!window.supabase?.createClient)throw new Error("Supabase no está cargado.");const sb=window.supabase.createClient(URL,KEY),{data:{session}}=await sb.auth.getSession();if(!session?.access_token)throw new Error("Inicia sesión para contratar FSM PRO.");const r=await fetch(FN,{method:"POST",headers:{Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({return_to:location.href})});const d=await r.json();if(!r.ok)throw new Error(d?.error||"No se pudo iniciar el pago.");if(!d?.url)throw new Error("Stripe no devolvió una URL.");location.href=d.url}catch(e){$("toast")?($("toast").textContent=e.message,$("toast").classList.add("show")):alert(e.message)}}
function init(){["homePro","accountPro","activate"].forEach(id=>$(id)?.addEventListener("click",checkout))}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
