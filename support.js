/* FSM Support + New User Guide */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const supabaseClient =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  const guide = [
    [
      "👤 Crear cuenta",
      "Ve a Mi cuenta, pulsa CREAR CUENTA, confirma tu correo y después usa ENTRAR."
    ],
    [
      "🤖 FSM IA",
      "Elige presupuesto, posición y prioridad. Pulsa USAR 1 ANÁLISIS para recibir una recomendación."
    ],
    [
      "👥 Plantilla",
      "Selecciona jugadores en cada posición y pulsa GUARDAR Y ANALIZAR para ver GRL, ataque y defensa."
    ],
    [
      "⚖️ Comparar",
      "Elige dos jugadores para comparar GRL, ritmo, tiro, pase, regate, defensa y físico."
    ],
    [
      "📈 Mercado",
      "Introduce un precio y FSM te indica si está por debajo, cerca o por encima de la referencia."
    ],
    [
      "⭐ FSM PRO",
      "Las funciones PRO se activarán en una fase posterior. No hay cobro real todavía."
    ]
  ];

  function injectStyles() {
    if ($("fsmSupportStyles")) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "fsmSupportStyles";

    style.textContent = `
      .fsm-help-actions {
        display:flex;
        gap:8px;
        align-items:center;
        margin-left:8px;
      }

      .fsm-help-btn {
        border:1px solid #ffffff18;
        background:#ffffff08;
        color:#fff;
        border-radius:10px;
        padding:9px 11px;
        cursor:pointer;
        font-weight:800;
        font-size:12px;
      }

      .fsm-help-btn:hover {
        background:#ffffff13;
        border-color:#7c5cff55;
      }

      .fsm-modal {
        display:none;
        position:fixed;
        inset:0;
        z-index:150;
        background:#000b;
        backdrop-filter:blur(8px);
        align-items:center;
        justify-content:center;
        padding:16px;
      }

      .fsm-modal.show {
        display:flex;
      }

      .fsm-modal-box {
        width:min(760px,100%);
        max-height:85vh;
        overflow:auto;
        background:
          linear-gradient(
            145deg,
            #111724,
            #0d121c
          );
        border:1px solid #ffffff18;
        border-radius:18px;
        padding:20px;
        box-shadow:0 20px 70px #0008;
      }

      .fsm-guide-item {
        padding:14px;
        border:1px solid #ffffff12;
        background:#ffffff05;
        border-radius:13px;
        margin:10px 0;
      }

      .fsm-guide-item b {
        display:block;
        margin-bottom:5px;
      }

      .fsm-guide-item p {
        margin:0;
        color:#929caf;
        font-size:13px;
        line-height:1.5;
      }

      .fsm-chat {
        position:fixed;
        right:18px;
        bottom:18px;
        z-index:145;
      }

      .fsm-chat-toggle {
        width:56px;
        height:56px;
        border:0;
        border-radius:50%;
        background:
          linear-gradient(
            135deg,
            #7c5cff,
            #6043df
          );
        color:#fff;
        font-size:23px;
        box-shadow:0 10px 30px #0006;
        cursor:pointer;
      }

      .fsm-chat-box {
        display:none;
        width:min(
          380px,
          calc(100vw - 28px)
        );
        height:510px;
        position:absolute;
        right:0;
        bottom:68px;
        background:#0f1521;
        border:1px solid #ffffff18;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 20px 70px #0009;
      }

      .fsm-chat-box.show {
        display:flex;
        flex-direction:column;
      }

      .fsm-chat-head {
        padding:13px 15px;
        background:
          linear-gradient(
            135deg,
            #19152f,
            #111624
          );
        border-bottom:1px solid #ffffff10;
      }

      .fsm-chat-head b {
        display:block;
      }

      .fsm-chat-head small {
        color:#929caf;
      }

      .fsm-chat-body {
        flex:1;
        overflow:auto;
        padding:13px;
      }

      .fsm-msg {
        max-width:85%;
        padding:9px 11px;
        border-radius:12px;
        margin:8px 0;
        font-size:13px;
        line-height:1.45;
      }

      .fsm-msg.bot {
        background:#ffffff09;
      }

      .fsm-msg.user {
        margin-left:auto;
        background:#7c5cff;
        color:#fff;
      }

      .fsm-quick {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin:8px 0;
      }

      .fsm-quick button {
        border:1px solid #ffffff18;
        background:#ffffff06;
        color:#fff;
        border-radius:99px;
        padding:7px 9px;
        font-size:11px;
        cursor:pointer;
      }

      .fsm-chat-foot {
        padding:10px;
        border-top:1px solid #ffffff10;
        display:flex;
        gap:7px;
      }

      .fsm-chat-foot textarea {
        flex:1;
        resize:none;
        height:50px;
        border:1px solid #ffffff14;
        background:#070b12;
        color:#fff;
        border-radius:10px;
        padding:9px;
        font:inherit;
      }

      .fsm-chat-foot button {
        border:0;
        border-radius:10px;
        background:#7c5cff;
        color:#fff;
        padding:0 13px;
        font-weight:900;
        cursor:pointer;
      }

      .fsm-status {
        font-size:11px;
        color:#929caf;
        margin-top:6px;
      }

      @media(max-width:700px) {
        .fsm-help-actions {
          display:none;
        }

        .fsm-chat {
          right:12px;
          bottom:72px;
        }

        .fsm-chat-box {
          height:70vh;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createGuide() {
    if ($("fsmGuideModal")) {
      return;
    }

    const modal =
      document.createElement("div");

    modal.id =
      "fsmGuideModal";

    modal.className =
      "fsm-modal";

    modal.innerHTML = `
      <div class="fsm-modal-box">

        <div
          style="
            display:flex;
            justify-content:space-between;
            gap:12px;
            align-items:center;
          "
        >

          <div>

            <div
              style="
                color:#bcaeff;
                font-size:11px;
                font-weight:900;
                letter-spacing:1.4px;
              "
            >
              FC MOBILE FSM
            </div>

            <h2 style="margin:5px 0">
              📘 Guía para nuevos
            </h2>

            <p
              style="
                margin:0;
                color:#929caf;
              "
            >
              Empieza en menos de 2 minutos.
            </p>

          </div>

          <button
            id="fsmGuideClose"
            class="fsm-help-btn"
            type="button"
          >
            Cerrar
          </button>

        </div>

        <div style="margin-top:14px">

          ${guide
            .map(
              ([title, description]) => `
                <div class="fsm-guide-item">

                  <b>
                    ${title}
                  </b>

                  <p>
                    ${description}
                  </p>

                </div>
              `
            )
            .join("")}

        </div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    $("fsmGuideClose").onclick =
      () => {
        modal.classList.remove(
          "show"
        );
      };

    modal.addEventListener(
      "click",
      (event) => {
        if (
          event.target === modal
        ) {
          modal.classList.remove(
            "show"
          );
        }
      }
    );
  }

  function addGuideButton() {
    const actions =
      document.querySelector(
        ".top-actions"
      );

    if (
      !actions ||
      $("fsmGuideBtn")
    ) {
      return;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "fsm-help-actions";

    wrapper.innerHTML = `
      <button
        id="fsmGuideBtn"
        class="fsm-help-btn"
        type="button"
      >
        📘 Guía
      </button>
    `;

    actions.prepend(
      wrapper
    );

    $("fsmGuideBtn").onclick =
      () => {
        $("fsmGuideModal")
          ?.classList.add(
            "show"
          );
      };
  }

  function addChat() {
    if ($("fsmChat")) {
      return;
    }

    const root =
      document.createElement(
        "div"
      );

    root.id =
      "fsmChat";

    root.className =
      "fsm-chat";

    root.innerHTML = `
      <div
        id="fsmChatBox"
        class="fsm-chat-box"
      >

        <div class="fsm-chat-head">

          <b>
            💬 Soporte FSM
          </b>

          <small>
            Ayuda rápida y envío de incidencias
          </small>

        </div>

        <div
          id="fsmChatBody"
          class="fsm-chat-body"
        >

          <div class="fsm-msg bot">
            ¡Hola! Soy el soporte de FSM.
            Puedo ayudarte con cuentas,
            IA, jugadores, plantilla o mercado.
          </div>

          <div class="fsm-quick">

            <button
              data-q="cuenta"
              type="button"
            >
              Cuenta
            </button>

            <button
              data-q="ia"
              type="button"
            >
              FSM IA
            </button>

            <button
              data-q="jugadores"
              type="button"
            >
              Jugadores
            </button>

            <button
              data-q="plantilla"
              type="button"
            >
              Plantilla
            </button>

            <button
              data-q="mercado"
              type="button"
            >
              Mercado
            </button>

          </div>

          <div
            id="fsmSupportStatus"
            class="fsm-status"
          ></div>

        </div>

        <div class="fsm-chat-foot">

          <textarea
            id="fsmSupportInput"
            placeholder="Escribe tu problema..."
          ></textarea>

          <button
            id="fsmSupportSend"
            type="button"
          >
            Enviar
          </button>

        </div>

      </div>

      <button
        id="fsmChatToggle"
        class="fsm-chat-toggle"
        type="button"
        aria-label="Abrir soporte"
      >
        💬
      </button>
    `;

    document.body.appendChild(
      root
    );

    const faq = {
      cuenta:
        "Para crear una cuenta: Mi cuenta → CREAR CUENTA → confirma el correo → ENTRAR. Si el correo no llega, no pulses muchas veces seguidas porque Supabase aplica límites de envío.",

      ia:
        "FSM IA necesita que inicies sesión. Después elige presupuesto, posición y prioridad y pulsa USAR 1 ANÁLISIS.",

      jugadores:
        "Jugadores permite buscar por nombre, club, posición, liga o programa. El catálogo está preparado para crecer desde Supabase.",

      plantilla:
        "Plantilla permite colocar jugadores y calcular GRL, ataque y defensa. En una siguiente mejora añadiremos validación estricta de posiciones.",

      mercado:
        "Mercado compara el precio introducido con la referencia del catálogo. Los precios reales se conectarán cuando tengamos una fuente autorizada."
    };

    $("fsmChatToggle").onclick =
      () => {
        $("fsmChatBox")
          .classList.toggle(
            "show"
          );
      };

    root
      .querySelectorAll(
        "[data-q]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () => {

              addBotMessage(
                faq[
                  button.dataset.q
                ]
              );

            };
        }
      );

    $("fsmSupportSend").onclick =
      sendSupportMessage;

    $("fsmSupportInput")
      .addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {

            event.preventDefault();

            sendSupportMessage();
          }
        }
      );

    async function sendSupportMessage() {
      const input =
        $("fsmSupportInput");

      const body =
        input.value.trim();

      if (!body) {
        return;
      }

      addUserMessage(
        body
      );

      input.value = "";

      if (!supabaseClient) {

        addBotMessage(
          "No puedo conectar con el sistema de soporte ahora mismo."
        );

        return;
      }

      try {

        const {
          data: {
            user
          }
        } =
          await supabaseClient.auth
            .getUser();

        if (!user) {

          addBotMessage(
            "Para enviar una incidencia al soporte, primero inicia sesión en Mi cuenta."
          );

          return;
        }

        const ticket =
          await supabaseClient
            .from(
              "support_tickets"
            )
            .insert({
              user_id:
                user.id,

              subject:
                body.slice(
                  0,
                  80
                )
            })
            .select("id")
            .single();

        if (
          ticket.error
        ) {
          throw ticket.error;
        }

        const message =
          await supabaseClient
            .from(
              "support_messages"
            )
            .insert({
              ticket_id:
                ticket.data.id,

              user_id:
                user.id,

              body:
                body,

              sender_type:
                "user"
            });

        if (
          message.error
        ) {
          throw message.error;
        }

        $("fsmSupportStatus")
          .textContent =
          "Incidencia enviada al soporte.";

        addBotMessage(
          "He recibido tu incidencia. Ya está guardada para soporte. ¡Gracias!"
        );

      } catch (error) {

        console.error(
          "FSM support:",
          error
        );

        addBotMessage(
          "No pude guardar la incidencia. Prueba de nuevo en unos segundos."
        );
      }
    }

    function addUserMessage(
      text
    ) {
      const body =
        $("fsmChatBody");

      body.insertAdjacentHTML(
        "beforeend",
        `
          <div class="fsm-msg user">
            ${escapeHtml(text)}
          </div>
        `
      );

      body.scrollTop =
        body.scrollHeight;
    }

    function addBotMessage(
      text
    ) {
      const body =
        $("fsmChatBody");

      body.insertAdjacentHTML(
        "beforeend",
        `
          <div class="fsm-msg bot">
            ${escapeHtml(text)}
          </div>
        `
      );

      body.scrollTop =
        body.scrollHeight;
    }

    function escapeHtml(
      text
    ) {
      return String(text)
        .replaceAll(
          "&",
          "&amp;"
        )
        .replaceAll(
          "<",
          "&lt;"
        )
        .replaceAll(
          ">",
          "&gt;"
        )
        .replaceAll(
          '"',
          "&quot;"
        )
        .replaceAll(
          "'",
          "&#039;"
        );
    }
  }

  function init() {
    injectStyles();
    createGuide();
    addGuideButton();
    addChat();
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();
