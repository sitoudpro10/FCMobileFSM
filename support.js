/* =========================================================
   FC MOBILE FSM - CHAT DE SOPORTE + GUÍA PARA NUEVOS
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     CONFIGURACIÓN
     --------------------------------------------------------- */

  // Intentamos reutilizar la conexión que ya utiliza app.js.
  const getSupabase = () => {
    if (window.supabaseClient) {
      return window.supabaseClient;
    }

    if (window.FSMSupabase) {
      return window.FSMSupabase;
    }

    // Si app.js ha dejado las credenciales disponibles
    // también podemos crear la conexión desde aquí.
    if (
      window.supabase &&
      window.FSM_SUPABASE_URL &&
      window.FSM_SUPABASE_KEY
    ) {
      return window.supabase.createClient(
        window.FSM_SUPABASE_URL,
        window.FSM_SUPABASE_KEY
      );
    }

    return null;
  };

  /* ---------------------------------------------------------
     ESTILOS
     --------------------------------------------------------- */

  function addStyles() {
    if (document.getElementById("fsmSupportStyles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "fsmSupportStyles";

    style.textContent = `
      /* =========================
         BOTÓN GUÍA
         ========================= */

      .fsm-guide-button {
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.05);
        color: white;
        border-radius: 10px;
        padding: 9px 13px;
        cursor: pointer;
        font-weight: 800;
      }

      .fsm-guide-button:hover {
        background: rgba(124,92,255,.18);
      }

      /* =========================
         CHAT
         ========================= */

      .fsm-support-launcher {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 99999;
      }

      .fsm-support-button {
        width: 58px;
        height: 58px;
        border: 0;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          #7c5cff,
          #5d3ee8
        );
        color: white;
        font-size: 25px;
        cursor: pointer;
        box-shadow: 0 10px 35px rgba(0,0,0,.45);
      }

      .fsm-support-button:hover {
        transform: translateY(-2px);
      }

      .fsm-support-window {
        display: none;
        position: absolute;
        right: 0;
        bottom: 70px;
        width: 380px;
        max-width: calc(100vw - 30px);
        height: 530px;
        background: #0f1521;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 20px 80px rgba(0,0,0,.65);
      }

      .fsm-support-window.open {
        display: flex;
        flex-direction: column;
      }

      .fsm-support-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        background: linear-gradient(
          135deg,
          #1b1533,
          #101622
        );
        border-bottom: 1px solid rgba(255,255,255,.08);
      }

      .fsm-support-title {
        font-weight: 900;
        color: white;
      }

      .fsm-support-subtitle {
        margin-top: 3px;
        color: #929caf;
        font-size: 11px;
      }

      .fsm-support-close {
        border: 0;
        background: rgba(255,255,255,.07);
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 9px;
        cursor: pointer;
      }

      .fsm-support-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
      }

      .fsm-support-message {
        max-width: 86%;
        margin: 8px 0;
        padding: 10px 12px;
        border-radius: 13px;
        font-size: 13px;
        line-height: 1.45;
        word-break: break-word;
      }

      .fsm-support-message.bot {
        background: rgba(255,255,255,.06);
        color: #e8ebf2;
      }

      .fsm-support-message.user {
        margin-left: auto;
        background: #704cf4;
        color: white;
      }

      .fsm-support-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 14px 10px;
      }

      .fsm-support-quick button {
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.05);
        color: white;
        border-radius: 999px;
        padding: 7px 10px;
        font-size: 11px;
        cursor: pointer;
      }

      .fsm-support-quick button:hover {
        background: rgba(124,92,255,.18);
      }

      .fsm-support-form {
        display: flex;
        gap: 8px;
        padding: 10px;
        border-top: 1px solid rgba(255,255,255,.08);
      }

      .fsm-support-input {
        flex: 1;
        min-width: 0;
        height: 48px;
        resize: none;
        border: 1px solid rgba(255,255,255,.12);
        background: #080c13;
        color: white;
        border-radius: 10px;
        padding: 9px;
        font-family: inherit;
        outline: none;
      }

      .fsm-support-input:focus {
        border-color: #7657ff;
      }

      .fsm-support-send {
        border: 0;
        border-radius: 10px;
        padding: 0 13px;
        background: #7657ff;
        color: white;
        font-weight: 900;
        cursor: pointer;
      }

      .fsm-support-send:disabled {
        opacity: .5;
        cursor: not-allowed;
      }

      .fsm-support-status {
        padding: 0 14px 8px;
        color: #929caf;
        font-size: 10px;
      }

      /* =========================
         GUÍA
         ========================= */

      .fsm-guide-overlay {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99998;
        background: rgba(0,0,0,.72);
        backdrop-filter: blur(7px);
        padding: 20px;
        align-items: center;
        justify-content: center;
      }

      .fsm-guide-overlay.open {
        display: flex;
      }

      .fsm-guide-window {
        width: min(720px, 100%);
        max-height: 85vh;
        overflow-y: auto;
        background: #101622;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 18px;
        padding: 22px;
        box-shadow: 0 20px 80px rgba(0,0,0,.6);
      }

      .fsm-guide-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
      }

      .fsm-guide-top h2 {
        margin: 0;
        color: white;
      }

      .fsm-guide-close {
        border: 0;
        background: rgba(255,255,255,.07);
        color: white;
        padding: 8px 12px;
        border-radius: 9px;
        cursor: pointer;
      }

      .fsm-guide-card {
        margin-top: 10px;
        padding: 14px;
        border: 1px solid rgba(255,255,255,.09);
        background: rgba(255,255,255,.035);
        border-radius: 13px;
      }

      .fsm-guide-card strong {
        color: white;
      }

      .fsm-guide-card p {
        margin: 6px 0 0;
        color: #929caf;
        font-size: 13px;
        line-height: 1.5;
      }

      @media (max-width: 650px) {
        .fsm-support-launcher {
          right: 12px;
          bottom: 15px;
        }

        .fsm-support-window {
          width: calc(100vw - 24px);
          height: 70vh;
          right: -2px;
        }

        .fsm-guide-overlay {
          padding: 10px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ---------------------------------------------------------
     GUÍA PARA NUEVOS
     --------------------------------------------------------- */

  function createGuide() {
    if (document.getElementById("fsmGuideOverlay")) {
      return;
    }

    const overlay = document.createElement("div");

    overlay.id = "fsmGuideOverlay";
    overlay.className = "fsm-guide-overlay";

    overlay.innerHTML = `
      <div class="fsm-guide-window">

        <div class="fsm-guide-top">

          <div>
            <div
              style="
                color:#a998ff;
                font-size:11px;
                font-weight:900;
                letter-spacing:1px;
              "
            >
              FC MOBILE FSM
            </div>

            <h2>
              📘 Guía para nuevos
            </h2>

            <p
              style="
                color:#929caf;
                margin:6px 0 0;
              "
            >
              Aprende a utilizar la página paso a paso.
            </p>
          </div>

          <button
            id="fsmGuideClose"
            class="fsm-guide-close"
          >
            Cerrar
          </button>

        </div>

        <div style="margin-top:16px">

          <div class="fsm-guide-card">
            <strong>👤 Mi cuenta</strong>
            <p>
              Crea una cuenta, confirma tu correo
              electrónico e inicia sesión.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>👥 Jugadores</strong>
            <p>
              Busca jugadores por nombre, club o posición
              y consulta sus estadísticas.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>🤖 FSM IA</strong>
            <p>
              Introduce tu presupuesto, posición y prioridad
              para recibir una recomendación.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>⚖️ Comparar</strong>
            <p>
              Compara dos jugadores y revisa sus estadísticas
              para saber cuál puede ser mejor opción.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>👥 Plantilla</strong>
            <p>
              Construye tu equipo seleccionando jugadores
              para cada posición y analiza la plantilla.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>📈 Mercado</strong>
            <p>
              Introduce el precio de un jugador para compararlo
              con el precio de referencia disponible.
            </p>
          </div>

          <div class="fsm-guide-card">
            <strong>⭐ FSM PRO</strong>
            <p>
              Las funciones PRO permitirán utilizar
              herramientas avanzadas cuando estén activadas.
            </p>
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    document
      .getElementById("fsmGuideClose")
      .addEventListener("click", closeGuide);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeGuide();
      }
    });
  }

  function openGuide() {
    const overlay =
      document.getElementById("fsmGuideOverlay");

    if (overlay) {
      overlay.classList.add("open");
    }
  }

  function closeGuide() {
    const overlay =
      document.getElementById("fsmGuideOverlay");

    if (overlay) {
      overlay.classList.remove("open");
    }
  }

  /* ---------------------------------------------------------
     BOTÓN GUÍA
     --------------------------------------------------------- */

  function addGuideButton() {
    if (document.getElementById("fsmGuideButton")) {
      return;
    }

    // Intentamos encontrar la zona superior de la aplicación.
    const possibleContainers = [
      ".top-actions",
      ".header-actions",
      "header",
      ".topbar"
    ];

    let container = null;

    for (const selector of possibleContainers) {
      const found =
        document.querySelector(selector);

      if (found) {
        container = found;
        break;
      }
    }

    // Si no encontramos la cabecera,
    // no rompemos la página.
    if (!container) {
      return;
    }

    const button =
      document.createElement("button");

    button.id = "fsmGuideButton";
    button.className = "fsm-guide-button";
    button.type = "button";
    button.textContent = "📘 Guía";

    button.addEventListener(
      "click",
      openGuide
    );

    container.prepend(button);
  }

  /* ---------------------------------------------------------
     CHAT
     --------------------------------------------------------- */

  function createChat() {
    if (document.getElementById("fsmSupportLauncher")) {
      return;
    }

    const launcher =
      document.createElement("div");

    launcher.id = "fsmSupportLauncher";
    launcher.className = "fsm-support-launcher";

    launcher.innerHTML = `
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
              Estamos aquí para ayudarte
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
            👋 ¡Hola! Bienvenido al soporte de FC Mobile FSM.
            ¿En qué puedo ayudarte?
          </div>

        </div>

        <div class="fsm-support-quick">

          <button
            type="button"
            data-support-topic="cuenta"
          >
            👤 Cuenta
          </button>

          <button
            type="button"
            data-support-topic="jugadores"
          >
            👥 Jugadores
          </button>

          <button
            type="button"
            data-support-topic="ia"
          >
            🤖 FSM IA
          </button>

          <button
            type="button"
            data-support-topic="plantilla"
          >
            📋 Plantilla
          </button>

          <button
            type="button"
            data-support-topic="mercado"
          >
            📈 Mercado
          </button>

        </div>

        <div
          id="fsmSupportStatus"
          class="fsm-support-status"
        >
          Soporte conectado.
        </div>

        <form
          id="fsmSupportForm"
          class="fsm-support-form"
        >

          <textarea
            id="fsmSupportInput"
            class="fsm-support-input"
            placeholder="Escribe tu problema..."
            maxlength="2000"
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
        aria-label="Abrir soporte"
      >
        💬
      </button>
    `;

    document.body.appendChild(launcher);

    document
      .getElementById("fsmSupportOpen")
      .addEventListener(
        "click",
        toggleChat
      );

    document
      .getElementById("fsmSupportClose")
      .addEventListener(
        "click",
        closeChat
      );

    document
      .getElementById("fsmSupportForm")
      .addEventListener(
        "submit",
        handleSubmit
      );

    document
      .querySelectorAll(
        "[data-support-topic]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            handleTopic(
              button.dataset.supportTopic
            );
          }
        );
      });
  }

  function toggleChat() {
    const box =
      document.getElementById(
        "fsmSupportWindow"
      );

    if (!box) {
      return;
    }

    box.classList.toggle("open");
  }

  function closeChat() {
    const box =
      document.getElementById(
        "fsmSupportWindow"
      );

    if (box) {
      box.classList.remove("open");
    }
  }

  /* ---------------------------------------------------------
     RESPUESTAS RÁPIDAS
     --------------------------------------------------------- */

  const FAQ = {
    cuenta:
      "Para crear una cuenta entra en «Mi cuenta», pulsa «CREAR CUENTA», introduce tu correo y contraseña y confirma el correo que recibirás de Supabase. Después podrás iniciar sesión.",

    jugadores:
      "En «Jugadores» puedes buscar por nombre, club o posición. Selecciona el jugador que quieras para consultar sus estadísticas.",

    ia:
      "En «FSM IA» introduce tu presupuesto, selecciona la posición y la prioridad. Después pulsa «USAR 1 ANÁLISIS».",

    plantilla:
      "En «Plantilla» selecciona los jugadores de cada posición. Cuando termines pulsa «GUARDAR Y ANALIZAR».",

    mercado:
      "En «Mercado» selecciona un jugador e introduce el precio que has encontrado. El sistema lo compara con el precio de referencia disponible."
  };

  function handleTopic(topic) {
    const answer =
      FAQ[topic];

    if (!answer) {
      return;
    }

    addMessage(
      topicLabel(topic),
      "user"
    );

    addMessage(
      answer,
      "bot"
    );
  }

  function topicLabel(topic) {
    const names = {
      cuenta: "¿Cómo creo una cuenta?",
      jugadores: "¿Cómo busco jugadores?",
      ia: "¿Cómo funciona FSM IA?",
      plantilla: "¿Cómo hago una plantilla?",
      mercado: "¿Cómo funciona el mercado?"
    };

    return (
      names[topic] ||
      topic
    );
  }

  /* ---------------------------------------------------------
     MENSAJES
     --------------------------------------------------------- */

  function addMessage(
    text,
    type
  ) {
    const messages =
      document.getElementById(
        "fsmSupportMessages"
      );

    if (!messages) {
      return;
    }

    const div =
      document.createElement("div");

    div.className =
      `fsm-support-message ${type}`;

    // textContent para evitar HTML enviado
    // por usuarios.
    div.textContent = text;

    messages.appendChild(div);

    messages.scrollTop =
      messages.scrollHeight;
  }

  /* ---------------------------------------------------------
     ENVÍO A SUPABASE
     --------------------------------------------------------- */

  async function handleSubmit(event) {
    event.preventDefault();

    const input =
      document.getElementById(
        "fsmSupportInput"
      );

    const send =
      document.getElementById(
        "fsmSupportSend"
      );

    const status =
      document.getElementById(
        "fsmSupportStatus"
      );

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
      "Enviando incidencia...";

    try {
      await saveTicket(text);

      addMessage(
        "✅ He recibido tu mensaje. La incidencia ha quedado guardada para soporte.",
        "bot"
      );

      status.textContent =
        "Incidencia guardada correctamente.";
    } catch (error) {
      console.error(
        "FSM Support error:",
        error
      );

      addMessage(
        "❌ No he podido guardar la incidencia. Comprueba que hayas iniciado sesión e inténtalo de nuevo.",
        "bot"
      );

      status.textContent =
        "No se pudo guardar la incidencia.";
    } finally {
      send.disabled = false;
    }
  }

  async function saveTicket(text) {
    const client =
      getSupabase();

    if (!client) {
      throw new Error(
        "No se encontró la conexión de Supabase."
      );
    }

    const {
      data: {
        user
      },
      error: userError
    } =
      await client.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "El usuario no ha iniciado sesión."
      );
    }

    /* -----------------------------------------------------
       1. Crear ticket
       ----------------------------------------------------- */

    const {
      data: ticket,
      error: ticketError
    } =
      await client
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: text.slice(0, 100),
          status: "open"
        })
        .select("id")
        .single();

    if (ticketError) {
      throw ticketError;
    }

    /* -----------------------------------------------------
       2. Guardar mensaje
       ----------------------------------------------------- */

    const {
      error: messageError
    } =
      await client
        .from("support_messages")
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          body: text,
          sender_type: "user"
        });

    if (messageError) {
      throw messageError;
    }

    return ticket.id;
  }

  /* ---------------------------------------------------------
     INICIO
     --------------------------------------------------------- */

  function init() {
    addStyles();
    createGuide();
    createChat();

    // Esperamos un poco para que app.js termine
    // de construir la cabecera.
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
