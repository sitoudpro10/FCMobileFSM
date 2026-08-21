(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  // Conexión propia del sistema de soporte.
  const supportSupabase =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  function $(id) {
    return document.getElementById(id);
  }

  const FAQ = {
    cuenta:
      "Para crear una cuenta entra en Mi cuenta, pulsa CREAR CUENTA, confirma el correo y después pulsa ENTRAR.",

    jugadores:
      "En Jugadores puedes buscar por nombre, club, posición, liga o programa.",

    ia:
      "En FSM IA introduce presupuesto, posición y prioridad y pulsa USAR 1 ANÁLISIS.",

    plantilla:
      "En Plantilla selecciona los jugadores y pulsa GUARDAR Y ANALIZAR.",

    mercado:
      "En Mercado selecciona un jugador, escribe el precio y pulsa ANALIZAR PRECIO."
  };

  function addStyles() {
    if ($("fsmSupportStyles")) return;

    const style =
      document.createElement("style");

    style.id =
      "fsmSupportStyles";

    style.textContent = `
      .fsm-guide-button {
        border:1px solid #ffffff18;
        background:#ffffff08;
        color:#fff;
        border-radius:10px;
        padding:9px 13px;
        cursor:pointer;
        font-weight:800;
      }

      .fsm-support-launcher {
        position:fixed;
        right:18px;
        bottom:18px;
        z-index:99999;
      }

      .fsm-support-button {
        width:58px;
        height:58px;
        border:0;
        border-radius:50%;
        background:linear-gradient(
          135deg,
          #7c5cff,
          #6043df
        );
        color:#fff;
        font-size:24px;
        cursor:pointer;
        box-shadow:0 10px 35px #0008;
      }

      .fsm-support-window {
        display:none;
        position:absolute;
        right:0;
        bottom:70px;
        width:380px;
        max-width:calc(100vw - 24px);
        height:530px;
        background:#0f1521;
        border:1px solid #ffffff18;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 20px 80px #0009;
      }

      .fsm-support-window.open {
        display:flex;
        flex-direction:column;
      }

      .fsm-support-header {
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:14px 16px;
        background:linear-gradient(
          135deg,
          #19152f,
          #111624
        );
        border-bottom:1px solid #ffffff10;
      }

      .fsm-support-title {
        font-weight:900;
        color:#fff;
      }

      .fsm-support-subtitle {
        color:#929caf;
        font-size:11px;
        margin-top:3px;
      }

      .fsm-support-close {
        border:0;
        background:#ffffff08;
        color:#fff;
        width:32px;
        height:32px;
        border-radius:9px;
        cursor:pointer;
      }

      .fsm-support-messages {
        flex:1;
        overflow-y:auto;
        padding:14px;
      }

      .fsm-support-message {
        max-width:86%;
        margin:8px 0;
        padding:10px 12px;
        border-radius:13px;
        font-size:13px;
        line-height:1.45;
        word-break:break-word;
      }

      .fsm-support-message.bot {
        background:#ffffff09;
        color:#e8ebf2;
      }

      .fsm-support-message.user {
        margin-left:auto;
        background:#704cf4;
        color:#fff;
      }

      .fsm-support-quick {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        padding:0 14px 10px;
      }

      .fsm-support-quick button {
        border:1px solid #ffffff18;
        background:#ffffff06;
        color:#fff;
        border-radius:999px;
        padding:7px 10px;
        font-size:11px;
        cursor:pointer;
      }

      .fsm-support-form {
        display:flex;
        gap:8px;
        padding:10px;
        border-top:1px solid #ffffff10;
      }

      .fsm-support-input {
        flex:1;
        min-width:0;
        height:48px;
        resize:none;
        border:1px solid #ffffff14;
        background:#070b12;
        color:#fff;
        border-radius:10px;
        padding:9px;
        outline:none;
        font-family:inherit;
      }

      .fsm-support-send {
        border:0;
        border-radius:10px;
        padding:0 13px;
        background:#7657ff;
        color:#fff;
        font-weight:900;
        cursor:pointer;
      }

      .fsm-support-send:disabled {
        opacity:.5;
        cursor:not-allowed;
      }

      .fsm-support-status {
        padding:0 14px 8px;
        color:#929caf;
        font-size:10px;
      }

      .fsm-guide-overlay {
        display:none;
        position:fixed;
        inset:0;
        z-index:99998;
        background:#000b;
        backdrop-filter:blur(7px);
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      .fsm-guide-overlay.open {
        display:flex;
      }

      .fsm-guide-window {
        width:min(720px,100%);
        max-height:85vh;
        overflow-y:auto;
        background:#101622;
        border:1px solid #ffffff12;
        border-radius:18px;
        padding:22px;
      }

      .fsm-guide-card {
        margin-top:10px;
        padding:14px;
        border:1px solid #ffffff09;
        background:#ffffff05;
        border-radius:13px;
      }

      .fsm-guide-card strong {
        color:#fff;
      }

      .fsm-guide-card p {
        color:#929caf;
        font-size:13px;
        line-height:1.5;
        margin:6px 0 0;
      }

      @media(max-width:650px) {
        .fsm-support-launcher {
          right:10px;
          bottom:70px;
        }

        .fsm-support-window {
          width:calc(100vw - 20px);
          height:70vh;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function addGuide() {
    if ($("fsmGuideOverlay")) return;

    const overlay =
      document.createElement("div");

    overlay.id =
      "fsmGuideOverlay";

    overlay.className =
      "fsm-guide-overlay";

    overlay.innerHTML = `
      <div class="fsm-guide-window">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
        ">

          <div>
            <div style="
              color:#bcaeff;
              font-size:11px;
              font-weight:900;
              letter-spacing:1px;
            ">
              FC MOBILE FSM
            </div>

            <h2 style="
              color:#fff;
              margin:5px 0;
            ">
              📘 Guía para nuevos
            </h2>

            <p style="
              color:#929caf;
              margin:0;
            ">
              Aprende a utilizar FSM paso a paso.
            </p>
          </div>

          <button
            id="fsmGuideClose"
            type="button"
            class="fsm-guide-button"
          >
            Cerrar
          </button>

        </div>

        <div style="margin-top:15px">

          <div class="fsm-guide-card">
            <strong>👤 Crear cuenta</strong>
            <p>
              Mi cuenta → CREAR CUENTA →
              confirma el correo → ENTRAR.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>👥 Jugadores</strong>
            <p>
              Busca jugadores por nombre,
              club, posición, liga o programa.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>🤖 FSM IA</strong>
            <p>
              Selecciona presupuesto, posición
              y prioridad para obtener una recomendación.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>⚖️ Comparar</strong>
            <p>
              Selecciona dos jugadores para
              comparar sus estadísticas.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>👥 Plantilla</strong>
            <p>
              Crea tu equipo y utiliza
              GUARDAR Y ANALIZAR.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>📈 Mercado</strong>
            <p>
              Introduce un precio para analizar
              si parece caro o barato respecto
              a la referencia disponible.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>⭐ FSM PRO</strong>
            <p>
              Las herramientas PRO se activarán
              en una fase posterior.
            </p>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(
      overlay
    );

    $("fsmGuideClose").onclick =
      () => {
        overlay.classList.remove(
          "open"
        );
      };

    overlay.onclick = (event) => {
      if (
        event.target === overlay
      ) {
        overlay.classList.remove(
          "open"
        );
      }
    };
  }

  function addGuideButton() {
    if ($("fsmGuideButton")) {
      return;
    }

    const container =
      document.querySelector(
        ".top-actions"
      );

    if (!container) {
      return;
    }

    const button =
      document.createElement(
        "button"
      );

    button.id =
      "fsmGuideButton";

    button.className =
      "fsm-guide-button";

    button.type =
      "button";

    button.textContent =
      "📘 Guía";

    button.onclick =
      () => {
        $("fsmGuideOverlay")
          ?.classList.add(
            "open"
          );
      };

    container.prepend(
      button
    );
  }

  function addChat() {
    if ($("fsmSupportLauncher")) {
      return;
    }

    const root =
      document.createElement(
        "div"
      );

    root.id =
      "fsmSupportLauncher";

    root.className =
      "fsm-support-launcher";

    root.innerHTML = `
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
              Ayuda y soporte
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
            👋 ¡Hola! ¿En qué podemos ayudarte?
          </div>

        </div>

        <div class="fsm-support-quick">

          <button
            type="button"
            data-topic="cuenta"
          >
            👤 Cuenta
          </button>

          <button
            type="button"
            data-topic="jugadores"
          >
            👥 Jugadores
          </button>

          <button
            type="button"
            data-topic="ia"
          >
            🤖 FSM IA
          </button>

          <button
            type="button"
            data-topic="plantilla"
          >
            📋 Plantilla
          </button>

          <button
            type="button"
            data-topic="mercado"
          >
            📈 Mercado
          </button>

        </div>

        <div
          id="fsmSupportStatus"
          class="fsm-support-status"
        >
          Preparado.
        </div>

        <form
          id="fsmSupportForm"
          class="fsm-support-form"
        >

          <textarea
            id="fsmSupportInput"
            class="fsm-support-input"
            maxlength="2000"
            placeholder="Escribe tu problema..."
          ></textarea>

          <button
            id="fsmSupportSend"
            class="fsm-support-send"
            type="submit"
          >
            Enviar
          </button>

        </form>

      </div>

      <button
        id="fsmSupportOpen"
        class="fsm-support-button"
        type="button"
      >
        💬
      </button>
    `;

    document.body.appendChild(
      root
    );

    $("fsmSupportOpen").onclick =
      () => {
        $("fsmSupportWindow")
          .classList.add(
            "open"
          );
      };

    $("fsmSupportClose").onclick =
      () => {
        $("fsmSupportWindow")
          .classList.remove(
            "open"
          );
      };

    $("fsmSupportForm").onsubmit =
      handleSubmit;

    document
      .querySelectorAll(
        "[data-topic]"
      )
      .forEach(
        (button) => {
          button.onclick =
            () =>
              showFAQ(
                button.dataset.topic
              );
        }
      );
  }

  function showFAQ(topic) {
    const answers = {
      cuenta:
        "Para crear una cuenta: Mi cuenta → CREAR CUENTA → confirma tu correo → ENTRAR.",

      jugadores:
        "En Jugadores puedes buscar por nombre, club o posición.",

      ia:
        "En FSM IA introduce tu presupuesto, posición y prioridad y pulsa USAR 1 ANÁLISIS.",

      plantilla:
        "En Plantilla selecciona los jugadores y pulsa GUARDAR Y ANALIZAR.",

      mercado:
        "En Mercado selecciona un jugador e introduce el precio para analizarlo."
    };

    const titles = {
      cuenta:
        "¿Cómo creo una cuenta?",

      jugadores:
        "¿Cómo busco jugadores?",

      ia:
        "¿Cómo funciona FSM IA?",

      plantilla:
        "¿Cómo funciona Plantilla?",

      mercado:
        "¿Cómo funciona Mercado?"
    };

    addMessage(
      titles[topic],
      "user"
    );

    addMessage(
      answers[topic],
      "bot"
    );
  }

  function addMessage(
    text,
    type
  ) {
    const box =
      $("fsmSupportMessages");

    if (!box) {
      return;
    }

    const message =
      document.createElement(
        "div"
      );

    message.className =
      `fsm-support-message ${type}`;

    message.textContent =
      text;

    box.appendChild(
      message
    );

    box.scrollTop =
      box.scrollHeight;
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const input =
      $("fsmSupportInput");

    const send =
      $("fsmSupportSend");

    const status =
      $("fsmSupportStatus");

    const text =
      input.value.trim();

    if (!text) {
      return;
    }

    addMessage(
      text,
      "user"
    );

    input.value = "";

    send.disabled = true;

    status.textContent =
      "Guardando incidencia...";

    try {
      await createTicket(
        text
      );

      addMessage(
        "✅ Incidencia guardada correctamente. El equipo de soporte podrá revisarla.",
        "bot"
      );

      status.textContent =
        "Incidencia guardada.";

    } catch (error) {
      console.error(
        "FSM SUPPORT ERROR:",
        error
      );

      addMessage(
        getReadableError(
          error
        ),
        "bot"
      );

      status.textContent =
        "No se pudo guardar.";

    } finally {
      send.disabled = false;
    }
  }

  async function createTicket(
    text
  ) {
    if (!supportSupabase) {
      throw new Error(
        "SUPABASE_CONNECTION_ERROR"
      );
    }

    const sessionResult =
      await supportSupabase.auth.getSession();

    if (
      sessionResult.error
    ) {
      throw sessionResult.error;
    }

    const session =
      sessionResult.data?.session;

    if (!session) {
      throw new Error(
        "NO_SESSION"
      );
    }

    const user =
      session.user;

    const ticketResult =
      await supportSupabase
        .from("support_tickets")
        .insert({
          user_id:
            user.id,

          subject:
            text.slice(
              0,
              100
            ),

          status:
            "open"
        })
        .select("id")
        .single();

    if (
      ticketResult.error
    ) {
      throw ticketResult.error;
    }

    const messageResult =
      await supportSupabase
        .from("support_messages")
        .insert({
          ticket_id:
            ticketResult.data.id,

          user_id:
            user.id,

          body:
            text,

          sender_type:
            "user"
        });

    if (
      messageResult.error
    ) {
      throw messageResult.error;
    }

    return true;
  }

  function getReadableError(
    error
  ) {
    const message =
      String(
        error?.message ||
        ""
      ).toLowerCase();

    if (
      message.includes(
        "row-level security"
      ) ||
      message.includes(
        "permission denied"
      )
    ) {
      return "❌ Supabase ha bloqueado la incidencia por seguridad. Voy a revisar las políticas.";
    }

    if (
      message.includes(
        "no_session"
      )
    ) {
      return "❌ Tu sesión no está activa. Pulsa Cerrar sesión y vuelve a entrar.";
    }

    if (
      message.includes(
        "supabase_connection_error"
      )
    ) {
      return "❌ No se pudo conectar con Supabase.";
    }

    return (
      "❌ No se pudo guardar la incidencia. Inténtalo de nuevo."
    );
  }

  function init() {
    addStyles();
    addGuide();
    addChat();

    setTimeout(
      addGuideButton,
      500
    );

    setTimeout(
      addGuideButton,
      1500
    );
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
