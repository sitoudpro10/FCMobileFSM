(() => {
"use strict";
const URL="https://jshevgjyweoianpbbjdl.supabase.co",KEY="sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";
let sb=null;const $=id=>document.getElementById(id);const client=()=>sb||(sb=window.supabase?.createClient(URL,KEY));
const money=n=>{n=Number(n)||0;if(!n)return"—";if(n>=1e9)return`${(n/1e9).toFixed(1)}B`;if(n>=1e6)return`${Math.round(n/1e6)}M`;return new Intl.NumberFormat("es-ES").format(n)};
async function refresh(){const q=$("marketPlayer"),out=$("marketOut");if(!q||!out||!q.value)return;const c=client();if(!c)return;const {data,error}=await c.from("market_prices").select("price,source,observed_at,is_untradable").eq("player_id",q.value).order("observed_at",{ascending:false}).limit(1).maybeSingle();if(error){console.warn(error);return}out.innerHTML=data?`<div class="notice"><b>Precio más reciente:</b> 🪙 ${money(data.price)}<br><small>Fuente: ${String(data.source||"—")}</small><br><small>Actualizado: ${new Date(data.observed_at).toLocaleString("es-ES")}</small></div>`:`<div class="notice">No hay precio actualizado para este jugador.</div>`}
function init(){ $("marketPlayer")?.addEventListener("change",()=>void refresh()) }
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
