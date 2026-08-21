/* =========================================================
   FC MOBILE FSM
   SOPORTE AVANZADO + CENTRO DE AYUDA
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     SUPABASE
     ========================================================= */

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const supabaseClient =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  const $ = (id) =>
    document.getElementById(id);

  let currentTicketId = null;

  /* =========================================================
     FAQ / RESPUESTAS AUTOMÁTICAS
     ========================================================= */

  const FAQ = [
    {
      keys: [
        "cuenta",
        "crear cuenta",
        "registrar",
        "registro"
      ],
      title: "Cuenta",
      answer:
        "Para crear una cuenta entra en Mi cuenta → CREAR CUENTA. Después confirma el correo electrónico y vuelve a FSM para pulsar ENTRAR."
    },

    {
      keys: [
        "correo",
        "email",
        "gmail",
        "no me llega",
        "confirmacion",
        "confirmación"
      ],
      title: "Correo",
      answer:
        "Si no recibes el correo de confirmación, revisa Spam, Promociones y Correo no deseado. No pulses muchas veces seguidas porque el sistema de correo aplica límites temporales."
    },

    {
      keys: [
        "contraseña",
        "contrasena",
        "password",
        "olvidé",
        "olvide"
      ],
      title: "Contraseña",
      answer:
        "Si has olvidado tu contraseña, utiliza el sistema de recuperación de cuenta cuando esté disponible. Nunca compartas tu contraseña con el soporte."
    },

    {
      keys: [
        "ia",
        "fsm ia",
        "analisis",
        "análisis",
        "recomendacion",
        "recomendación"
      ],
      title: "FSM IA",
      answer:
        "FSM IA necesita que tengas la sesión iniciada. Después selecciona presupuesto, posición y prioridad y pulsa USAR 1 ANÁLISIS."
    },

    {
      keys: [
        "jugador",
        "jugadores",
        "buscar jugador",
        "buscador"
      ],
      title: "Jugadores",
      answer:
        "En Jugadores puedes buscar por nombre, club, posición, liga o programa. El catálogo está preparado para crecer con futuras actualizaciones."
    },

    {
      keys: [
        "comparar",
        "comparador",
        "comparación"
      ],
      title: "Comparador",
      answer:
        "En Comparar selecciona dos jugadores y pulsa COMPARAR para revisar GRL, ritmo, tiro, pase, regate, defensa y físico."
    },

    {
      keys: [
        "plantilla",
        "equipo",
        "formacion",
        "formación"
      ],
      title: "Plantilla",
      answer:
        "En Plantilla coloca los jugadores en los huecos de la formación y después pulsa GUARDAR Y ANALIZAR para obtener GRL medio, ataque y defensa."
    },

    {
      keys: [
        "mercado",
        "precio",
        "comprar",
        "caro",
        "barato"
      ],
      title: "Mercado",
      answer:
        "En Mercado selecciona un jugador, introduce el precio y pulsa ANALIZAR PRECIO. La referencia actual puede ser de demostración hasta conectar una fuente real."
    },

    {
      keys: [
        "pro",
        "premium",
        "fsm pro"
      ],
      title: "FSM PRO",
      answer:
        "FSM PRO está preparado para funciones avanzadas. El sistema de pago real todavía no está activado."
    },

    {
      keys: [
        "error",
        "no funciona",
        "fallo",
        "falla",
        "no abre",
        "boton",
        "botón"
      ],
      title: "Error",
      answer:
        "Prueba primero a recargar la página con Ctrl + F5. Si continúa, indícanos exactamente qué botón has pulsado y qué mensaje aparece."
    },

    {
      keys: [
        "hack",
        "hacker",
        "seguridad",
        "robo"
      ],
      title: "Seguridad",
      answer:
        "Nunca compartas tu contraseña, códigos de confirmación ni claves privadas. Si detectas una actividad sospechosa, crea una incidencia urgente."
    }
  ];

  /* =========================================================
     ESTILOS
     ========================================================= */

  function addStyles() {
    if ($("fsmSupportStyles")) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "fsmSupportStyles";

    style.textContent = `
      /* =========================
         BOTÓN GUÍA
         ========================= */

      .fsm-guide-button {
        border: 1px solid #ffffff18;
        background: #ffffff08;
        color: #fff;
        border-radius: 10px;
        padding: 9px 12px;
        cursor: pointer;
        font-weight: 800;
        font-size: 12px;
      }

      .fsm-guide-button:hover {
        background: #ffffff14;
        border-color: #7c5cff55;
      }

      /* =========================
         LANZADOR
         ========================= */

      .fsm-support-launcher {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 99999;
      }

      .fsm-support-button {
        width: 58px;
        height: 58px;
        border: 0;
        border-radius: 50%;
        background:
          linear-gradient(
            135deg,
            #7c5cff,
            #6043df
          );
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        box-shadow:
          0 12px 35px #0008;
      }

      .fsm-support-button:hover {
        transform: translateY(-2px);
      }

      /* =========================
         VENTANA
         ========================= */

      .fsm-support-window {
        display: none;
        position: absolute;
        right: 0;
        bottom: 70px;

        width: 430px;
        max-width:
          calc(100vw - 24px);

        height: 650px;
        max-height:
          calc(100vh - 100px);

        background: #0f1521;
        border:
          1px solid #ffffff15;

        border-radius: 18px;
        overflow: hidden;

        box-shadow:
          0 25px 90px #000b;
      }

      .fsm-support-window.open {
        display: flex;
        flex-direction: column;
      }

      /* =========================
         CABECERA
         ========================= */

      .fsm-support-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        padding: 14px 15px;

        background:
          linear-gradient(
            135deg,
            #1a1532,
            #101622
          );

        border-bottom:
          1px solid #ffffff0e;
      }

      .fsm-support-title {
        color: #fff;
        font-weight: 900;
        font-size: 15px;
      }

      .fsm-support-subtitle {
        color: #929caf;
        font-size: 10px;
        margin-top: 3px;
      }

      .fsm-support-close {
        border: 0;
        background: #ffffff08;
        color: #fff;
        border-radius: 8px;
        padding: 7px 10px;
        cursor: pointer;
      }

      /* =========================
         MENSAJES
         ========================= */

      .fsm-support-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
      }

      .fsm-support-message {
        max-width: 88%;
        margin: 8px 0;

        padding: 10px 12px;

        border-radius: 13px;

        font-size: 13px;
        line-height: 1.5;

        word-break: break-word;
      }

      .fsm-support-message.bot {
        background: #ffffff08;
        color: #edf0f7;
      }

      .fsm-support-message.user {
        margin-left: auto;
        background: #704cf4;
        color: #fff;
      }

      .fsm-support-message.system {
        margin: 10px auto;
        max-width: 95%;

        background: #ffffff05;
        color: #929caf;

        text-align: center;
        font-size: 11px;
      }

      /* =========================
         ACCIONES RÁPIDAS
         ========================= */

      .fsm-support-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        padding:
          0 13px 10px;
      }

      .fsm-support-quick button {
        border:
          1px solid #ffffff12;

        background:
          #ffffff06;

        color: #fff;

        border-radius: 999px;

        padding:
          7px 10px;

        font-size: 11px;
        cursor: pointer;
      }

      .fsm-support-quick button:hover {
        background:
          #7c5cff22;
      }

      /* =========================
         FORMULARIO
         ========================= */

      .fsm-support-form {
        display: flex;
        flex-direction: column;
        gap: 8px;

        padding: 10px;

        border-top:
          1px solid #ffffff0e;
      }

      .fsm-support-row {
        display: flex;
        gap: 7px;
      }

      .fsm-support-input {
        flex: 1;
        min-width: 0;

        height: 54px;

        resize: none;

        border:
          1px solid #ffffff12;

        background:
          #080c13;

        color:
          #fff;

        border-radius: 10px;

        padding: 10px;

        outline: none;

        font-family:
          inherit;

        font-size:
          13px;
      }

      .fsm-support-input:focus {
        border-color:
          #7657ff;
      }

      .fsm-support-send {
        border: 0;

        border-radius: 10px;

        background:
          #7657ff;

        color:
          #fff;

        padding:
          0 14px;

        font-weight:
          900;

        cursor:
          pointer;
      }

      .fsm-support-send:disabled {
        opacity: .5;
        cursor: not-allowed;
      }

      /* =========================
         SELECTS
         ========================= */

      .fsm-support-select {
        width: 100%;

        border:
          1px solid #ffffff12;

        background:
          #080c13;

        color:
          #fff;

        border-radius:
          9px;

        padding:
          8px;

        outline:
          none;

        font-size:
          11px;
      }

      /* =========================
         ESTADO
         ========================= */

      .fsm-support-status {
        padding:
          0 13px 7px;

        color:
          #929caf;

        font-size:
          10px;
      }

      /* =========================
         GUÍA
         ========================= */

      .fsm-help-overlay {
        display:
          none;

        position:
          fixed;

        inset:
          0;

        z-index:
          99998;

        background:
          #000c;

        backdrop-filter:
          blur(10px);

        padding:
          14px;

        align-items:
          center;

        justify-content:
          center;
      }

      .fsm-help-overlay.open {
        display:
          flex;
      }

      .fsm-help-window {
        width:
          min(1050px,100%);

        max-height:
          92vh;

        overflow:
          hidden;

        display:
          grid;

        grid-template-columns:
          280px 1fr;

        background:
          #0f1521;

        border:
          1px solid #ffffff15;

        border-radius:
          20px;

        box-shadow:
          0 25px 90px #000b;
      }

      .fsm-help-sidebar {
        padding:
          18px;

        border-right:
          1px solid #ffffff10;

        background:
          linear-gradient(
            180deg,
            #151126,
            #101622
          );

        overflow:
          auto;
      }

      .fsm-help-brand {
        color:
          #bcaeff;

        font-size:
          11px;

        font-weight:
          900;

        letter-spacing:
          1.5px;
      }

      .fsm-help-sidebar h2 {
        color:
          #fff;

        margin:
          6px 0 15px;
      }

      .fsm-help-search {
        width:
          100%;

        box-sizing:
          border-box;

        border:
          1px solid #ffffff12;

        background:
          #080c13;

        color:
          #fff;

        border-radius:
          10px;

        padding:
          10px;

        outline:
          none;
      }

      .fsm-help-nav {
        display:
          grid;

        gap:
          6px;

        margin-top:
          12px;
      }

      .fsm-help-nav button {
        width:
          100%;

        text-align:
          left;

        border:
          1px solid transparent;

        background:
          transparent;

        color:
          #aeb5c5;

        border-radius:
          10px;

        padding:
          10px;

        cursor:
          pointer;
      }

      .fsm-help-nav button.active,
      .fsm-help-nav button:hover {
        background:
          #ffffff08;

        color:
          #fff;

        border-color:
          #ffffff10;
      }

      .fsm-help-content {
        min-width:
          0;

        overflow:
          auto;

        padding:
          22px;
      }

      .fsm-help-title {
        color:
          #fff;

        font-size:
          30px;

        margin:
          3px 0 6px;
      }

      .fsm-help-intro {
        color:
          #929caf;

        line-height:
          1.55;

        margin:
          0 0 20px;
      }

      .fsm-help-card {
        border:
          1px solid #ffffff10;

        background:
          #ffffff04;

        border-radius:
          14px;

        padding:
          14px;

        margin-bottom:
          12px;
      }

      .fsm-help-card h3 {
        color:
          #fff;

        font-size:
          14px;

        margin:
          0 0 8px;
      }

      .fsm-help-faq {
        border:
          1px solid #ffffff0d;

        border-radius:
          12px;

        overflow:
          hidden;

        margin:
          8px 0;
      }

      .fsm-help-faq button {
        width:
          100%;

        text-align:
          left;

        border:
          0;

        background:
          #ffffff05;

        color:
          #fff;

        padding:
          12px;

        cursor:
          pointer;

        font-weight:
          800;
      }

      .fsm-help-faq-answer {
        display:
          none;

        padding:
          0 12px 12px;

        color:
          #929caf;

        font-size:
          12px;

        line-height:
          1.55;
      }

      .fsm-help-faq.open
      .fsm-help-faq-answer {
        display:
          block;
      }

      @media(max-width:820px) {

        .fsm-help-window {
          grid-template-columns:
            1fr;
        }

        .fsm-help-sidebar {
          border-right:
            0;

          border-bottom:
            1px solid #ffffff10;

          max-height:
            220px;
        }

      }

      @media(max-width:600px) {

        .fsm-support-launcher {
          right:
            10px;

          bottom:
            70px;
        }

        .fsm-support-window {
          width:
            calc(100vw - 20px);

          height:
            72vh;
        }

        .fsm-help-content {
          padding:
            15px;
        }

        .fsm-help-title {
          font-size:
            24px;
        }

      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     GUÍA
     ========================================================= */

  const GUIDE = {
    inicio: {
      icon: "🚀",
      title: "Primeros pasos",
      text:
        "Crea tu cuenta, confirma el correo, inicia sesión y empieza con FSM IA."
    },

    cuenta: {
      icon: "👤",
      title: "Cuenta y acceso",
      text:
        "Solución de problemas relacionados con registro, inicio de sesión, correo y contraseña."
    },

    jugadores: {
      icon: "👥",
      title: "Jugadores",
      text:
        "Cómo buscar jugadores y entender la información disponible."
    },

    ia: {
      icon: "🤖",
      title: "FSM IA",
      text:
        "Cómo utilizar la IA para encontrar jugadores según presupuesto y prioridad."
    },

    comparador: {
      icon: "⚖️",
      title: "Comparador",
      text:
        "Compara dos jugadores y analiza sus estadísticas."
    },

    plantilla: {
      icon: "📋",
      title: "Plantilla",
      text:
        "Crea una plantilla y analiza su equilibrio."
    },

    mercado: {
      icon: "📈",
      title: "Mercado",
      text:
        "Analiza precios y descubre si una oferta parece buena."
    },

    pro: {
      icon: "⭐",
      title: "FSM PRO",
      text:
        "Funciones premium y futuras ventajas."
    },

    seguridad: {
      icon: "🔐",
      title: "Seguridad",
      text:
        "Buenas prácticas para proteger tu cuenta."
    }
  };

  function createGuide() {
    if ($("fsmHelpOverlay")) {
      return;
    }

    const overlay =
      document.createElement("div");

    overlay.id =
      "fsmHelpOverlay";

    overlay.className =
      "fsm-help-overlay";

    overlay.innerHTML = `
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
            placeholder="🔎 Buscar..."
            autocomplete="off"
          >

          <nav
            id="fsmHelpNav"
            class="fsm-help-nav"
          >
          </nav>

        </aside>

        <main class="fsm-help-content">

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:12px;
              align-items:flex-start;
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
              >
                Ayuda
              </h1>

              <p
                id="fsmHelpText"
                class="fsm-help-intro"
              ></p>

            </div>

            <button
              id="fsmHelpClose"
              class="fsm-help-button"
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

    buildGuideNav();

    renderGuide(
      "inicio"
    );

    $("fsmHelpClose").onclick =
      closeGuide;

    overlay.onclick =
      (event) => {

        if (
          event.target ===
          overlay
        ) {
          closeGuide();
        }

      };

    $("fsmHelpSearch").oninput =
      searchGuide;
  }

  function buildGuideNav() {
    const nav =
      $("fsmHelpNav");

    if (!nav) {
      return;
    }

    nav.innerHTML = "";

    Object.entries(
      GUIDE
    ).forEach(
      ([key, value]) => {

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.dataset.key =
          key;

        button.textContent =
          `${value.icon} ${value.title}`;

        button.onclick =
          () =>
            renderGuide(
              key
            );

        nav.appendChild(
          button
        );

      }
    );
  }

  function renderGuide(
    key
  ) {
    const item =
      GUIDE[key];

    if (!item) {
      return;
    }

    document
      .querySelectorAll(
        "#fsmHelpNav button"
      )
      .forEach(
        (button) => {

          button.classList.toggle(
            "active",
            button.dataset.key ===
              key
          );

        }
      );

    $("fsmHelpIcon").textContent =
      item.icon;

    $("fsmHelpTitle").textContent =
      item.title;

    $("fsmHelpText").textContent =
      item.text;

    const body =
      $("fsmHelpBody");

    const sections = {
      inicio: `
        <div class="fsm-help-card">
          <h3>✅ Ruta recomendada</h3>

          <div>
            1️⃣ Crear cuenta<br>
            2️⃣ Confirmar correo<br>
            3️⃣ Entrar<br>
            4️⃣ Probar FSM IA<br>
            5️⃣ Buscar jugadores<br>
            6️⃣ Comparar<br>
            7️⃣ Crear plantilla<br>
            8️⃣ Probar Mercado
          </div>
        </div>

        <div class="fsm-help-card">
          <h3>💡 Consejo</h3>
          <div>
            Si eres nuevo, empieza por FSM IA y después
            prueba Comparar y Plantilla.
          </div>
        </div>
      `,

      cuenta: `
        <div class="fsm-help-card">

          <h3>📝 Crear cuenta</h3>

          <p>
            Ve a Mi cuenta → CREAR CUENTA →
            introduce correo y contraseña →
            confirma tu correo → vuelve a FSM →
            ENTRAR.
          </p>

        </div>

        <div class="fsm-help-card">

          <h3>❓ Problemas frecuentes</h3>

          ${faq(
            "No me llega el correo",
            "Revisa Spam, Promociones y Correo no deseado. Evita solicitar muchos correos seguidos."
          )}

          ${faq(
            "El enlace ha caducado",
            "Solicita un correo nuevo y utiliza únicamente el enlace más reciente."
          )}

          ${faq(
            "No puedo entrar",
            "Comprueba que el correo y la contraseña sean correctos y que la cuenta esté confirmada."
          )}

        </div>
      `,

      jugadores: `
        <div class="fsm-help-card">

          <h3>🔎 Buscar jugadores</h3>

          <p>
            Puedes buscar por nombre, club, posición,
            liga o programa.
          </p>

          <p>
            Ejemplo:
            <strong>Mbappé</strong>,
            <strong>ST</strong> o
            <strong>Real Madrid</strong>.
          </p>

        </div>
      `,

      ia: `
        <div class="fsm-help-card">

          <h3>🤖 Cómo usar FSM IA</h3>

          <p>
            1. Inicia sesión.<br>
            2. Introduce tu presupuesto.<br>
            3. Elige posición.<br>
            4. Elige prioridad.<br>
            5. Pulsa USAR 1 ANÁLISIS.
          </p>

        </div>

        <div class="fsm-help-card">

          <h3>💡 Consejo</h3>

          <p>
            Usa calidad/precio para buscar opciones
            equilibradas y GRL cuando quieras priorizar
            el nivel general.
          </p>

        </div>
      `,

      comparador: `
        <div class="fsm-help-card">

          <h3>⚖️ Comparar dos jugadores</h3>

          <p>
            Selecciona Jugador A y Jugador B y pulsa
            COMPARAR.
          </p>

          <p>
            FSM compara GRL, ritmo, tiro, pase,
            regate, defensa y físico.
          </p>

        </div>
      `,

      plantilla: `
        <div class="fsm-help-card">

          <h3>📋 Crear plantilla</h3>

          <p>
            Selecciona jugadores en las diferentes posiciones
            y pulsa GUARDAR Y ANALIZAR.
          </p>

          <p>
            El sistema calcula GRL medio,
            ataque y defensa.
          </p>

        </div>

        <div class="fsm-help-card">

          <h3>⚠️ Importante</h3>

          <p>
            Estamos mejorando la validación de posiciones
            para evitar colocar jugadores en posiciones
            incompatibles.
          </p>

        </div>
      `,

      mercado: `
        <div class="fsm-help-card">

          <h3>📈 Analizar un precio</h3>

          <p>
            Selecciona un jugador, escribe un precio
            y pulsa ANALIZAR PRECIO.
          </p>

          <p>
            🟢 Buena compra<br>
            🟡 Precio normal<br>
            🔴 Caro
          </p>

        </div>

        <div class="fsm-help-card">

          <h3>⚠️ Fuente de precios</h3>

          <p>
            Hasta conectar una fuente externa real,
            algunos precios pueden ser de demostración.
          </p>

        </div>
      `,

      pro: `
        <div class="fsm-help-card">

          <h3>⭐ FSM PRO</h3>

          <p>
            PRO está preparado para funciones avanzadas,
            análisis ilimitados y herramientas premium.
          </p>

        </div>

        <div class="fsm-help-card">

          <h3>💳 Pagos</h3>

          <p>
            El sistema de cobro real todavía no está
            activado.
          </p>

        </div>
      `,

      seguridad: `
        <div class="fsm-help-card">

          <h3>🔐 Protege tu cuenta</h3>

          <p>
            • Nunca compartas tu contraseña.<br>
            • No compartas códigos de confirmación.<br>
            • No compartas claves privadas de Supabase.<br>
            • Usa una contraseña diferente a la de otras webs.<br>
            • Informa al soporte de cualquier comportamiento extraño.
          </p>

        </div>
      `
    };

    body.innerHTML =
      sections[key] ||
      sections.inicio;

    body
      .querySelectorAll(
        ".fsm-help-faq button"
      )
      .forEach(
        (button) => {

          button.onclick =
            () => {

              button.parentElement
                .classList.toggle(
                  "open"
                );

            };

        }
      );
  }

  function faq(
    question,
    answer
  ) {
    return `
      <div class="fsm-help-faq">

        <button
          type="button"
        >
          ${escapeHtml(question)}
        </button>

        <div
          class="fsm-help-faq-answer"
        >
          ${escapeHtml(answer)}
        </div>

      </div>
    `;
  }

  function searchGuide() {
    const query =
      $("fsmHelpSearch")
        ?.value
        .trim()
        .toLowerCase();

    if (!query) {
      renderGuide("inicio");
      return;
    }

    const matches =
      Object.entries(
        GUIDE
      ).filter(
        ([, item]) => {

          return `
            ${item.title}
            ${item.text}
          `
            .toLowerCase()
            .includes(query);

        }
      );

    if (!matches.length) {

      $("fsmHelpBody").innerHTML = `
        <div class="fsm-help-card">

          <h3>
            🔎 No hemos encontrado esa ayuda
          </h3>

          <p>
            Prueba con:
            cuenta, correo, IA, jugadores,
            plantilla, mercado, contraseña o error.
          </p>

        </div>
      `;

      return;
    }

    renderGuide(
      matches[0][0]
    );
  }

  function openGuide() {
    $("fsmHelpOverlay")
      ?.classList.add(
        "open"
      );
  }

  function closeGuide() {
    $("fsmHelpOverlay")
      ?.classList.remove(
        "open"
      );
  }

  /* =========================================================
     BOTÓN GUÍA
     ========================================================= */

  function addGuideButton() {
    if ($("fsmGuideButton")) {
      return;
    }

    const actions =
      document.querySelector(
        ".top-actions"
      );

    if (!actions) {
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
      openGuide;

    actions.prepend(
      button
    );
  }

  /* =========================================================
     CHAT
     ========================================================= */

  function createChat() {
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
              Ayuda, preguntas e incidencias
            </div>

          </div>

          <button
            id="fsmSupportClose"
            class="fsm-support-close"
          >
            ✕
          </button>

        </div>

        <div
          id="fsmSupportMessages"
          class="fsm-support-messages"
        >

          <div
            class="fsm-support-message bot"
          >
            👋 Hola. Soy el soporte de FSM.
            Puedes preguntarme algo o abrir
            una incidencia.
          </div>

        </div>

        <div class="fsm-support-quick">

          <button data-topic="cuenta">
            👤 Cuenta
          </button>

          <button data-topic="ia">
            🤖 IA
          </button>

          <button data-topic="jugadores">
            👥 Jugadores
          </button>

          <button data-topic="plantilla">
            📋 Plantilla
          </button>

          <button data-topic="mercado">
            📈 Mercado
          </button>

          <button data-topic="error">
            🛠️ Error
          </button>

        </div>

        <div class="fsm-support-form">

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:7px;
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
            >
              Enviar
            </button>

          </div>

        </div>

        <div
          id="fsmSupportStatus"
          class="fsm-support-status"
        >
          Preparado.
        </div>

      </div>

      <button
        id="fsmSupportOpen"
        class="fsm-support-button"
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
          ?.classList.add(
            "open"
          );

      };

    $("fsmSupportClose").onclick =
      () => {

        $("fsmSupportWindow")
          ?.classList.remove(
            "open"
          );

      };

    $("fsmSupportSend").onclick =
      submitSupport;

    $("fsmSupportInput").addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          submitSupport();

        }

      }
    );

    root
      .querySelectorAll(
        "[data-topic]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () => {

              answerFAQ(
                button.dataset.topic
              );

            };

        }
      );
  }

  /* =========================================================
     FAQ DEL CHAT
     ========================================================= */

  function answerFAQ(
    topic
  ) {
    let best =
      null;

    for (
      const item
      of FAQ
    ) {

      const found =
        item.keys.some(
          (key) =>
            key
              .toLowerCase()
              .includes(
                topic
              )
        ) ||
        item.title
          .toLowerCase()
          .includes(
            topic
          );

      if (found) {
        best = item;
        break;
      }

    }

    if (!best) {
      best = {
        title:
          "Ayuda",
        answer:
          "Abre la 📘 Guía para consultar todas las instrucciones de FSM."
      };
    }

    addChatMessage(
      best.title,
      "user"
    );

    addChatMessage(
      best.answer,
      "bot"
    );
  }

  /* =========================================================
     ENVÍO DE SOPORTE
     ========================================================= */

  async function submitSupport() {
    const input =
      $("fsmSupportInput");

    const send =
      $("fsmSupportSend");

    const status =
      $("fsmSupportStatus");

    const text =
      input.value.trim();

    if (!text) {
      status.textContent =
        "Escribe primero tu problema.";

      return;
    }

    addChatMessage(
      text,
      "user"
    );

    input.value =
      "";

    send.disabled =
      true;

    status.textContent =
      "Comprobando sesión...";

    try {

      if (!supabaseClient) {
        throw new Error(
          "SUPABASE_NOT_AVAILABLE"
        );
      }

      const {
        data: {
          session
        }
      } =
        await supabaseClient.auth.getSession();

      if (
        !session?.user
      ) {

        throw new Error(
          "NO_SESSION"
        );

      }

      const category =
        $("fsmSupportCategory")
          ?.value ||
        "general";

      const priority =
        $("fsmSupportPriority")
          ?.value ||
        "normal";

      const subject =
        `[${category}] ${text.slice(
          0,
          90
        )}`;

      status.textContent =
        "Creando incidencia...";

      const ticketResult =
        await supabaseClient
          .from(
            "support_tickets"
          )
          .insert({
            user_id:
              session.user.id,

            subject:
              subject,

            status:
              "open"
          })
          .select(
            "id"
          )
          .single();

      if (
        ticketResult.error
      ) {
        throw ticketResult.error;
      }

      currentTicketId =
        ticketResult
          .data
          .id;

      status.textContent =
        "Guardando mensaje...";

      const messageResult =
        await supabaseClient
          .from(
            "support_messages"
          )
          .insert({
            ticket_id:
              currentTicketId,

            user_id:
              session.user.id,

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

      status.textContent =
        "✅ Incidencia enviada.";

      addChatMessage(
        `✅ Incidencia creada correctamente.\nID: ${currentTicketId}`,
        "bot"
      );

      addChatMessage(
        "Puedes guardar ese ID si necesitas consultar esta incidencia con soporte.",
        "system"
      );

    } catch (
      error
    ) {

      console.error(
        "FSM SUPPORT:",
        error
      );

      if (
        error.message ===
        "NO_SESSION"
      ) {

        addChatMessage(
          "🔐 Necesitas iniciar sesión para enviar una incidencia.",
          "bot"
        );

        status.textContent =
          "Inicia sesión primero.";

      } else if (
        error.message ===
        "SUPABASE_NOT_AVAILABLE"
      ) {

        addChatMessage(
          "❌ No se pudo conectar con Supabase.",
          "bot"
        );

        status.textContent =
          "Supabase no disponible.";

      } else {

        addChatMessage(
          "❌ No se pudo guardar la incidencia. Prueba otra vez.",
          "bot"
        );

        status.textContent =
          "Error al guardar.";

      }

    } finally {

      send.disabled =
        false;

    }
  }

  /* =========================================================
     MENSAJES
     ========================================================= */

  function addChatMessage(
    text,
    type
  ) {
    const box =
      $("fsmSupportMessages");

    if (!box) {
      return;
    }

    const div =
      document.createElement(
        "div"
      );

    div.className =
      `fsm-support-message ${type}`;

    div.textContent =
      text;

    box.appendChild(
      div
    );

    box.scrollTop =
      box.scrollHeight;
  }

  /* =========================================================
     SEGURIDAD
     ========================================================= */

  function escapeHtml(
    value
  ) {
    return String(
      value ?? ""
    )
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

  /* =========================================================
     INICIO
     ========================================================= */

  function init() {

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
      (event) => {

        const tag =
          document.activeElement
            ?.tagName;

        const typing =
          [
            "INPUT",
            "TEXTAREA",
            "SELECT"
          ].includes(
            tag
          );

        if (
          event.key === "?" &&
          !typing
        ) {
          openGuide();
        }

        if (
          event.key === "Escape"
        ) {
          closeGuide();

          $("fsmSupportWindow")
            ?.classList.remove(
              "open"
            );
        }

      }
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
