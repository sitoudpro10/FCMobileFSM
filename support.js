/* FC MOBILE FSM - SUPPORT V2
   Guía + FAQ + soporte sin tickets duplicados */

(() => {
  "use strict";

  const SUPABASE_URL = "https://jshevgjyweoianpbbjdl.supabase.co";
  const SUPABASE_KEY = "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";
  const sb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);

  let sending = false;
  let currentTicketId = null;

  const TOPICS = {
    cuenta: ["Cuenta", "account", "Para crear una cuenta: Mi cuenta → CREAR CUENTA → confirma el correo → vuelve a FSM → ENTRAR."],
    ia: ["FSM IA", "ai", "En FSM IA introduce presupuesto, posición y prioridad y pulsa USAR 1 ANÁLISIS."],
    jugadores: ["Jugadores", "players", "En Jugadores busca por nombre, club o posición. Prueba también con una parte del nombre."],
    plantilla: ["Plantilla", "squad", "Selecciona los jugadores y pulsa GUARDAR Y ANALIZAR."],
    mercado: ["Mercado", "market", "Selecciona un jugador, introduce el precio y pulsa ANALIZAR PRECIO."],
    comparador: ["Comparador", "general", "Selecciona dos jugadores y pulsa COMPARAR."],
    error: ["Error técnico", "bug", "Recarga con Ctrl + F5. Si continúa, envía una incidencia explicando qué botón pulsaste y qué mensaje apareció."]
  };

  const GUIDE = {
    inicio: ["🚀", "Primeros pasos",
      "1. Crea la cuenta. 2. Confirma el correo. 3. Entra. 4. Prueba FSM IA. 5. Busca jugadores. 6. Compara. 7. Crea tu plantilla."],
    cuenta: ["👤", "Cuenta y acceso",
      "Revisa Spam/Promociones si no llega el correo. Usa siempre el enlace de confirmación más reciente."],
    jugadores: ["👥", "Jugadores",
      "Busca por nombre, club, posición, liga o programa. Guarda tus favoritos con ⭐."],
    ia: ["🤖", "FSM IA",
      "Introduce presupuesto, posición y prioridad y pulsa USAR 1 ANÁLISIS."],
    comparador: ["⚖️", "Comparador",
      "Selecciona dos jugadores para comparar GRL, ritmo, tiro, pase, regate, defensa y físico."],
    plantilla: ["📋", "Plantilla",
      "Coloca jugadores en la formación y pulsa GUARDAR Y ANALIZAR."],
    mercado: ["📈", "Mercado",
      "Introduce el precio y analiza la referencia disponible. Algunas referencias pueden ser de demostración."],
    pro: ["⭐", "FSM PRO",
      "Las funciones premium están preparadas. El cobro real todavía no está activado."],
    seguridad: ["🔐", "Seguridad",
      "Nunca compartas contraseñas, códigos de confirmación ni claves privadas de Supabase."]
  };

  function addStyles() {
    if ($("fsmSupportV2Styles")) return;

    const s = document.createElement("style");
    s.id = "fsmSupportV2Styles";
    s.textContent = `
      .fsm-sup-btn{
        border:1px solid #ffffff18;
        background:#ffffff08;
        color:#fff;
        border-radius:10px;
        padding:9px 12px;
        cursor:pointer;
        font-weight:800;
        font-size:12px
      }

      .fsm-sup-btn:hover{
        background:#ffffff14
      }

      .fsm-support-launcher{
        position:fixed;
        right:18px;
        bottom:18px;
        z-index:99999
      }

      .fsm-support-button{
        width:58px;
        height:58px;
        border:0;
        border-radius:50%;
        background:linear-gradient(135deg,#7c5cff,#6043df);
        color:#fff;
        font-size:24px;
        cursor:pointer;
        box-shadow:0 12px 35px #0008
      }

      .fsm-support-window{
        display:none;
        position:absolute;
        right:0;
        bottom:70px;
        width:430px;
        max-width:calc(100vw - 20px);
        height:650px;
        max-height:calc(100vh - 100px);
        background:#0f1521;
        border:1px solid #ffffff15;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 25px 90px #000b
      }

      .fsm-support-window.open{
        display:flex;
        flex-direction:column
      }

      .fsm-support-header{
        display:flex;
        justify-content:space-between;
        gap:10px;
        padding:14px 15px;
        background:linear-gradient(135deg,#1a1532,#101622);
        border-bottom:1px solid #ffffff0e
      }

      .fsm-support-title{
        color:#fff;
        font-weight:900
      }

      .fsm-support-subtitle{
        color:#929caf;
        font-size:10px;
        margin-top:3px
      }

      .fsm-support-close{
        border:0;
        background:#ffffff08;
        color:#fff;
        border-radius:8px;
        padding:7px 10px;
        cursor:pointer
      }

      .fsm-support-messages{
        flex:1;
        overflow:auto;
        padding:14px
      }

      .fsm-support-message{
        max-width:88%;
        margin:8px 0;
        padding:10px 12px;
        border-radius:13px;
        font-size:13px;
        line-height:1.5;
        white-space:pre-wrap;
        word-break:break-word
      }

      .fsm-support-message.bot{
        background:#ffffff08;
        color:#edf0f7
      }

      .fsm-support-message.user{
        margin-left:auto;
        background:#704cf4;
        color:#fff
      }

      .fsm-support-message.system{
        margin:10px auto;
        text-align:center;
        background:#ffffff05;
        color:#929caf;
        font-size:11px
      }

      .fsm-support-quick{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        padding:0 13px 10px
      }

      .fsm-support-quick button{
        border:1px solid #ffffff12;
        background:#ffffff06;
        color:#fff;
        border-radius:999px;
        padding:7px 10px;
        font-size:11px;
        cursor:pointer
      }

      .fsm-support-form{
        display:flex;
        flex-direction:column;
        gap:8px;
        padding:10px;
        border-top:1px solid #ffffff0e
      }

      .fsm-support-select{
        width:100%;
        border:1px solid #ffffff12;
        background:#080c13;
        color:#fff;
        border-radius:9px;
        padding:8px;
        font-size:11px
      }

      .fsm-support-row{
        display:flex;
        gap:7px
      }

      .fsm-support-input{
        flex:1;
        min-width:0;
        height:54px;
        resize:none;
        border:1px solid #ffffff12;
        background:#080c13;
        color:#fff;
        border-radius:10px;
        padding:10px;
        outline:none;
        font:13px inherit
      }

      .fsm-support-send{
        border:0;
        border-radius:10px;
        background:#7657ff;
        color:#fff;
        padding:0 14px;
        font-weight:900;
        cursor:pointer
      }

      .fsm-support-send:disabled{
        opacity:.5;
        cursor:not-allowed
      }

      .fsm-support-status{
        padding:0 13px 7px;
        color:#929caf;
        font-size:10px
      }

      .fsm-help-overlay{
        display:none;
        position:fixed;
        inset:0;
        z-index:99998;
        background:#000c;
        backdrop-filter:blur(10px);
        padding:14px;
        align-items:center;
        justify-content:center
      }

      .fsm-help-overlay.open{
        display:flex
      }

      .fsm-help-window{
        width:min(1050px,100%);
        max-height:92vh;
        overflow:hidden;
        display:grid;
        grid-template-columns:270px 1fr;
        background:#0f1521;
        border:1px solid #ffffff15;
        border-radius:20px;
        box-shadow:0 25px 90px #000b
      }

      .fsm-help-sidebar{
        padding:18px;
        border-right:1px solid #ffffff10;
        background:linear-gradient(180deg,#151126,#101622);
        overflow:auto
      }

      .fsm-help-brand{
        color:#bcaeff;
        font-size:11px;
        font-weight:900;
        letter-spacing:1.5px
      }

      .fsm-help-sidebar h2{
        color:#fff;
        margin:6px 0 15px
      }

      .fsm-help-search{
        width:100%;
        box-sizing:border-box;
        border:1px solid #ffffff12;
        background:#080c13;
        color:#fff;
        border-radius:10px;
        padding:10px;
        outline:none
      }

      .fsm-help-nav{
        display:grid;
        gap:6px;
        margin-top:12px
      }

      .fsm-help-nav button{
        width:100%;
        text-align:left;
        border:1px solid transparent;
        background:transparent;
        color:#aeb5c5;
        border-radius:10px;
        padding:10px;
        cursor:pointer
      }

      .fsm-help-nav button.active,
      .fsm-help-nav button:hover{
        background:#ffffff08;
        color:#fff;
        border-color:#ffffff10
      }

      .fsm-help-content{
        min-width:0;
        overflow:auto;
        padding:22px
      }

      .fsm-help-title{
        color:#fff;
        font-size:30px;
        margin:3px 0 6px
      }

      .fsm-help-intro{
        color:#929caf;
        line-height:1.55;
        margin:0 0 20px
      }

      .fsm-help-card{
        border:1px solid #ffffff10;
        background:#ffffff04;
        border-radius:14px;
        padding:14px;
        margin-bottom:12px
      }

      .fsm-help-card h3{
        color:#fff;
        font-size:14px;
        margin:0 0 8px
      }

      .fsm-help-card p{
        color:#929caf;
        font-size:12px;
        line-height:1.55
      }

      @media(max-width:820px){
        .fsm-help-window{
          grid-template-columns:1fr
        }

        .fsm-help-sidebar{
          border-right:0;
          border-bottom:1px solid #ffffff10;
          max-height:220px
        }
      }

      @media(max-width:600px){
        .fsm-support-launcher{
          right:10px;
          bottom:70px
        }

        .fsm-support-window{
          width:calc(100vw - 20px);
          height:72vh
        }

        .fsm-support-row{
          flex-direction:column
        }

        .fsm-support-send{
          min-height:44px
        }

        .fsm-help-content{
          padding:15px
        }

        .fsm-help-title{
          font-size:24px
        }
      }
    `;

    document.head.appendChild(s);
  }

  function escapeHtml(v) {
    return String(v ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function addMessage(text,type) {
    const box=$("fsmSupportMessages");
    if(!box)return;

    const d=document.createElement("div");

    d.className=
      `fsm-support-message ${type}`;

    d.textContent=
      text;

    box.appendChild(d);

    box.scrollTop=
      box.scrollHeight;
  }

  function createGuide() {
    if($("fsmHelpOverlay"))return;

    const overlay=
      document.createElement("div");

    overlay.id=
      "fsmHelpOverlay";

    overlay.className=
      "fsm-help-overlay";

    overlay.innerHTML=`
      <div class="fsm-help-window">

        <aside class="fsm-help-sidebar">

          <div class="fsm-help-brand">
            FC MOBILE FSM
          </div>

          <h2>
            Centro de ayuda
          </h2>

          <input
            id="fsmHelpSearch"
            class="fsm-help-search"
            placeholder="🔎 Buscar ayuda..."
            autocomplete="off"
          >

          <nav
            id="fsmHelpNav"
            class="fsm-help-nav"
          ></nav>

        </aside>

        <main class="fsm-help-content">

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:12px;
              align-items:flex-start
            "
          >

            <div>

              <div
                id="fsmHelpIcon"
                style="font-size:28px"
              ></div>

              <h1
                id="fsmHelpTitle"
                class="fsm-help-title"
              ></h1>

              <p
                id="fsmHelpText"
                class="fsm-help-intro"
              ></p>

            </div>

            <button
              id="fsmHelpClose"
              class="fsm-sup-btn"
              type="button"
            >
              Cerrar
            </button>

          </div>

          <div id="fsmHelpBody"></div>

        </main>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    const nav=
      $("fsmHelpNav");

    Object.entries(
      GUIDE
    ).forEach(
      ([key,item])=>{
        const b=
          document.createElement(
            "button"
          );

        b.type="button";
        b.dataset.key=key;
        b.textContent=
          `${item[0]} ${item[1]}`;

        b.onclick=
          ()=>renderGuide(key);

        nav.appendChild(b);
      }
    );

    $("fsmHelpClose").onclick=
      closeGuide;

    overlay.onclick=
      e=>{
        if(e.target===overlay){
          closeGuide();
        }
      };

    $("fsmHelpSearch").oninput=
      searchGuide;

    renderGuide(
      "inicio"
    );
  }

  function renderGuide(
    key
  ) {
    const item=
      GUIDE[key];

    if(!item)return;

    document
      .querySelectorAll(
        "#fsmHelpNav button"
      )
      .forEach(
        b=>b.classList.toggle(
          "active",
          b.dataset.key===key
        )
      );

    $("fsmHelpIcon").textContent=
      item[0];

    $("fsmHelpTitle").textContent=
      item[1];

    $("fsmHelpText").textContent=
      item[2];

    $("fsmHelpBody").innerHTML=`
      <div class="fsm-help-card">

        <h3>
          📚 Ayuda
        </h3>

        <p>
          ${escapeHtml(item[2])}
        </p>

      </div>

      <div class="fsm-help-card">

        <h3>
          💡 Consejo
        </h3>

        <p>
          Si no encuentras lo que buscas,
          abre 💬 Soporte y envía una incidencia.
        </p>

      </div>
    `;
  }

  function searchGuide() {
    const q=
      $("fsmHelpSearch")
        ?.value
        .trim()
        .toLowerCase();

    if(!q){
      renderGuide(
        "inicio"
      );
      return;
    }

    const found=
      Object.entries(
        GUIDE
      ).find(
        ([,item])=>
          JSON.stringify(
            item
          )
            .toLowerCase()
            .includes(q)
      );

    if(found){
      renderGuide(
        found[0]
      );
      return;
    }

    $("fsmHelpBody").innerHTML=`
      <div class="fsm-help-card">

        <h3>
          🔎 No encontramos esa ayuda
        </h3>

        <p>
          Prueba con cuenta, correo, IA,
          jugadores, plantilla, mercado o error.
        </p>

      </div>
    `;
  }

  function openGuide(){
    $("fsmHelpOverlay")
      ?.classList.add(
        "open"
      );
  }

  function closeGuide(){
    $("fsmHelpOverlay")
      ?.classList.remove(
        "open"
      );
  }

  function addGuideButton() {
    if($("fsmGuideButton"))return;

    const actions=
      document.querySelector(
        ".top-actions"
      );

    if(!actions)return;

    const b=
      document.createElement(
        "button"
      );

    b.id=
      "fsmGuideButton";

    b.className=
      "fsm-sup-btn";

    b.type=
      "button";

    b.textContent=
      "📘 Guía";

    b.onclick=
      openGuide;

    actions.prepend(
      b
    );
  }

  function createChat() {
    if(
      $("fsmSupportLauncher")
    )return;

    const root=
      document.createElement(
        "div"
      );

    root.id=
      "fsmSupportLauncher";

    root.className=
      "fsm-support-launcher";

    root.innerHTML=`
      <div
        id="fsmSupportWindow"
        class="fsm-support-window"
      >

        <div class="fsm-support-header">

          <div>

            <div class="fsm-support-title">
              💬 Soporte FSM
            </div>

            <div class="fsm-support-subtitle">
              Ayuda y seguimiento de incidencias
            </div>

          </div>

          <button
            id="fsmSupportClose"
            class="fsm-support-close"
            type="button"
          >
            ✕
          </button>

        </div>

        <div
          id="fsmSupportMessages"
          class="fsm-support-messages"
        >

          <div class="fsm-support-message bot">
            👋 Hola. Puedes hacerme una pregunta o
            enviar una incidencia.
          </div>

        </div>

        <div class="fsm-support-quick">

          ${Object.entries(
            TOPICS
          )
            .slice(0,6)
            .map(
              ([key,v])=>
                `
                  <button
                    data-topic="${key}"
                  >
                    ${v[0]}
                  </button>
                `
            )
            .join("")}

        </div>

        <div class="fsm-support-form">

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:7px
            "
          >

            <select
              id="fsmSupportCategory"
              class="fsm-support-select"
            >

              <option value="general">
                Categoría: General
              </option>

              <option value="account">
                Cuenta
              </option>

              <option value="ai">
                FSM IA
              </option>

              <option value="players">
                Jugadores
              </option>

              <option value="squad">
                Plantilla
              </option>

              <option value="market">
                Mercado
              </option>

              <option value="bug">
                Error técnico
              </option>

              <option value="security">
                Seguridad
              </option>

            </select>

            <select
              id="fsmSupportPriority"
              class="fsm-support-select"
            >

              <option value="normal">
                Prioridad: Normal
              </option>

              <option value="low">
                Prioridad: Baja
              </option>

              <option value="high">
                Prioridad: Alta
              </option>

              <option value="urgent">
                🚨 Urgente
              </option>

            </select>

          </div>

          <div class="fsm-support-row">

            <textarea
              id="fsmSupportInput"
              class="fsm-support-input"
              maxlength="2000"
              placeholder="Describe tu problema..."
            ></textarea>

            <button
              id="fsmSupportSend"
              class="fsm-support-send"
              type="button"
            >
              Enviar
            </button>

          </div>

        </div>

        <div
          id="fsmSupportStatus"
          class="fsm-support-status"
        >
          Soporte listo.
        </div>

      </div>

      <button
        id="fsmSupportOpen"
        class="fsm-support-button"
        type="button"
        aria-label="Abrir soporte"
      >
        💬
      </button>
    `;

    document.body.appendChild(
      root
    );

    $("fsmSupportOpen").onclick=
      async()=>{
        $("fsmSupportWindow")
          ?.classList.add(
            "open"
          );

        await loadOpenTicket();
      };

    $("fsmSupportClose").onclick=
      ()=>
        $("fsmSupportWindow")
          ?.classList.remove(
            "open"
          );

    $("fsmSupportSend").onclick=
      submitSupport;

    $("fsmSupportInput")
      .addEventListener(
        "keydown",
        e=>{
          if(
            e.key==="Enter" &&
            !e.shiftKey
          ){
            e.preventDefault();
            submitSupport();
          }
        }
      );

    root
      .querySelectorAll(
        "[data-topic]"
      )
      .forEach(
        b=>{
          b.onclick=
            ()=>{
              const topic=
                TOPICS[
                  b.dataset.topic
                ];

              if(!topic)return;

              $("fsmSupportCategory")
                .value=
                  topic[1];

              addMessage(
                topic[0],
                "user"
              );

              addMessage(
                topic[2],
                "bot"
              );
            };
        }
      );
  }

  async function getUser() {
    if(!sb){
      throw new Error(
        "SUPABASE_NOT_AVAILABLE"
      );
    }

    const {
      data,
      error
    }=
      await sb.auth.getSession();

    if(error){
      throw error;
    }

    if(
      !data?.session?.user
    ){
      throw new Error(
        "NO_SESSION"
      );
    }

    return data.session.user;
  }

  async function findOpenTicket(
    userId,
    category
  ) {
    const {
      data,
      error
    }=
      await sb
        .from(
          "support_tickets"
        )
        .select(
          "id,subject,status,priority,category,created_at,updated_at"
        )
        .eq(
          "user_id",
          userId
        )
        .eq(
          "category",
          category
        )
        .in(
          "status",
          [
            "open",
            "pending"
          ]
        )
        .order(
          "updated_at",
          {
            ascending:
              false
          }
        )
        .limit(
          1
        )
        .maybeSingle();

    if(error){
      throw error;
    }

    return data || null;
  }

  async function loadOpenTicket() {
    try {

      const user=
        await getUser();

      const category=
        $("fsmSupportCategory")
          ?.value ||
        "general";

      const ticket=
        await findOpenTicket(
          user.id,
          category
        );

      currentTicketId=
        ticket?.id ||
        null;

      if(!ticket){
        $("fsmSupportStatus")
          .textContent=
            "No hay una incidencia abierta en esta categoría.";

        return;
      }

      const {
        data,
        error
      }=
        await sb
          .from(
            "support_messages"
          )
          .select(
            "body,sender_type,created_at"
          )
          .eq(
            "ticket_id",
            ticket.id
          )
          .order(
            "created_at",
            {
              ascending:
                true
            }
          );

      if(error){
        throw error;
      }

      const box=
        $("fsmSupportMessages");

      box.innerHTML=
        "";

      addMessage(
        `🎫 Incidencia activa: ${ticket.id.slice(0,8)}`,
        "system"
      );

      (
        data ||
        []
      ).forEach(
        m=>{
          addMessage(
            m.body,
            m.sender_type ===
              "user"
              ? "user"
              : "bot"
          );
        }
      );

      $("fsmSupportStatus")
        .textContent=
          "Los siguientes mensajes se añadirán a esta misma incidencia.";

    } catch(error) {

      if(
        error?.message ===
        "NO_SESSION"
      ){
        $("fsmSupportStatus")
          .textContent=
            "Inicia sesión para usar el soporte.";
      }

    }
  }

  async function submitSupport() {

    if(sending){
      return;
    }

    const input=
      $("fsmSupportInput");

    const send=
      $("fsmSupportSend");

    const status=
      $("fsmSupportStatus");

    const text=
      input.value.trim();

    if(!text){
      status.textContent=
        "Escribe primero tu problema.";

      return;
    }

    sending=
      true;

    send.disabled=
      true;

    try {

      const user=
        await getUser();

      const category=
        $("fsmSupportCategory")
          ?.value ||
        "general";

      const priority=
        $("fsmSupportPriority")
          ?.value ||
        "normal";

      addMessage(
        text,
        "user"
      );

      input.value=
        "";

      status.textContent=
        "Buscando incidencia abierta...";

      let ticket=
        await findOpenTicket(
          user.id,
          category
        );

      let createdNew=
        false;

      if(!ticket){

        status.textContent=
          "Creando incidencia...";

        const inserted=
          await sb
            .from(
              "support_tickets"
            )
            .insert({
              user_id:
                user.id,

              subject:
                `[${category}] ${text.slice(0,90)}`,

              status:
                "open",

              priority,

              category
            })
            .select(
              "id,subject,status,priority,category"
            )
            .single();

        if(
          inserted.error
        ){

          if(
            inserted.error.code===
              "23505"
          ){

            ticket=
              await findOpenTicket(
                user.id,
                category
              );

          }else{

            throw inserted.error;

          }

        }else{

          ticket=
            inserted.data;

          createdNew=
            true;

        }
      }

      if(!ticket?.id){
        throw new Error(
          "TICKET_NOT_CREATED"
        );
      }

      currentTicketId=
        ticket.id;

      status.textContent=
        "Guardando mensaje...";

      const message=
        await sb
          .from(
            "support_messages"
          )
          .insert({
            ticket_id:
              ticket.id,

            user_id:
              user.id,

            body:
              text,

            sender_type:
              "user"
          });

      if(
        message.error
      ){
        throw message.error;
      }

      const update=
        await sb
          .from(
            "support_tickets"
          )
          .update({
            status:
              "open",

            priority,

            category,

            updated_at:
              new Date()
                .toISOString()
          })
          .eq(
            "id",
            ticket.id
          )
          .eq(
            "user_id",
            user.id
          );

      if(
        update.error
      ){
        throw update.error;
      }

      status.textContent=
        createdNew
          ? "✅ Incidencia creada."
          : "✅ Mensaje añadido.";

      addMessage(
        createdNew
          ? `✅ Incidencia creada.\nID: ${ticket.id}`
          : "✅ Tu mensaje se ha añadido a la incidencia abierta.",
        "bot"
      );

    } catch(error) {

      console.error(
        "FSM SUPPORT:",
        error
      );

      if(
        error?.message ===
        "NO_SESSION"
      ){

        addMessage(
          "🔐 Necesitas iniciar sesión para enviar una incidencia.",
          "bot"
        );

        status.textContent=
          "Inicia sesión primero.";

      }else if(
        error?.message ===
        "SUPABASE_NOT_AVAILABLE"
      ){

        addMessage(
          "❌ No se pudo conectar con Supabase.",
          "bot"
        );

        status.textContent=
          "Supabase no disponible.";

      }else{

        addMessage(
          "❌ No se pudo guardar el mensaje. Inténtalo de nuevo.",
          "bot"
        );

        status.textContent=
          "Error al guardar.";

      }

    }finally{

      sending=
        false;

      send.disabled=
        false;
    }
  }

  function init() {

    if(!sb){
      console.warn(
        "FSM Support: Supabase no disponible."
      );

      return;
    }

    addStyles();
    createGuide();
    createChat();

    setTimeout(
      addGuideButton,
      500
    );

    setTimeout(
      addGuideButton,
      1500
    );

    document.addEventListener(
      "keydown",
      e=>{

        const tag=
          document.activeElement
            ?.tagName;

        const typing=
          [
            "INPUT",
            "TEXTAREA",
            "SELECT"
          ].includes(
            tag
          );

        if(
          e.key==="?" &&
          !typing
        ){
          openGuide();
        }

        if(
          e.key==="Escape"
        ){

          closeGuide();

          $("fsmSupportWindow")
            ?.classList.remove(
              "open"
            );
        }
      }
    );
  }

  if(
    document.readyState===
      "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  }else{

    init();

  }

})();
