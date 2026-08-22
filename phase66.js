/* =========================================================
   FC MOBILE FSM - FASE 6.6
   PANEL DE ADMINISTRACIÓN / SOPORTE / OPERACIONES
   ========================================================= */

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const sb =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  const $ = (id) =>
    document.getElementById(id);

  let adminUser = null;

  function styles() {
    if ($("fsm66Styles")) return;

    const s = document.createElement("style");
    s.id = "fsm66Styles";

    s.textContent = `
      .fsm66-btn{
        border:1px solid #ffffff14;
        background:#ffffff08;
        color:#fff;
        border-radius:9px;
        padding:8px 11px;
        cursor:pointer;
        font-weight:800;
        font-size:11px
      }

      .fsm66-btn:hover{
        background:#ffffff12;
      }

      .fsm66-btn.primary{
        background:#7c5cff;
        border-color:transparent
      }

      .fsm66-btn.danger{
        background:#ff526622;
        border-color:#ff526644
      }

      .fsm66-overlay{
        display:none;
        position:fixed;
        inset:0;
        z-index:99997;
        background:#000d;
        backdrop-filter:blur(10px);
        align-items:center;
        justify-content:center;
        padding:14px
      }

      .fsm66-overlay.open{
        display:flex
      }

      .fsm66-window{
        width:min(1200px,100%);
        max-height:92vh;
        overflow:hidden;
        display:grid;
        grid-template-columns:250px 1fr;
        background:#0e141f;
        border:1px solid #ffffff16;
        border-radius:20px;
        box-shadow:0 30px 100px #000b
      }

      .fsm66-side{
        padding:18px;
        overflow:auto;
        border-right:1px solid #ffffff0e;
        background:linear-gradient(180deg,#17122b,#0f1520)
      }

      .fsm66-side h2{
        color:#fff;
        margin:6px 0 16px
      }

      .fsm66-brand{
        color:#bcaeff;
        font-size:10px;
        font-weight:900;
        letter-spacing:1.4px
      }

      .fsm66-nav{
        display:grid;
        gap:6px
      }

      .fsm66-nav button{
        width:100%;
        text-align:left;
        border:1px solid transparent;
        background:transparent;
        color:#aeb5c5;
        border-radius:9px;
        padding:10px;
        cursor:pointer
      }

      .fsm66-nav button.active,
      .fsm66-nav button:hover{
        background:#ffffff09;
        color:#fff;
        border-color:#ffffff10
      }

      .fsm66-main{
        min-width:0;
        overflow:auto;
        padding:20px
      }

      .fsm66-top{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px
      }

      .fsm66-title{
        color:#fff;
        font-size:27px;
        margin:0
      }

      .fsm66-sub{
        color:#929caf;
        font-size:12px;
        margin:6px 0 18px
      }

      .fsm66-grid{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:10px
      }

      .fsm66-card{
        background:#ffffff04;
        border:1px solid #ffffff10;
        border-radius:14px;
        padding:14px;
      }

      .fsm66-card h3{
        margin:0 0 8px;
        color:#fff;
        font-size:13px
      }

      .fsm66-number{
        color:#fff;
        font-size:26px;
        font-weight:950
      }

      .fsm66-muted{
        color:#929caf;
        font-size:11px
      }

      .fsm66-list{
        display:grid;
        gap:8px;
        margin-top:12px
      }

      .fsm66-row{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:center;
        padding:11px 12px;
        border:1px solid #ffffff0c;
        background:#ffffff04;
        border-radius:11px
      }

      .fsm66-row strong{
        display:block;
        color:#fff;
        font-size:12px
      }

      .fsm66-row small{
        display:block;
        margin-top:3px;
        color:#929caf;
        font-size:10px
      }

      .fsm66-msg{
        border:1px solid #ffffff10;
        border-radius:12px;
        padding:11px;
        margin:7px 0
      }

      .fsm66-msg.admin{
        border-color:#7c5cff44;
        background:#7c5cff0c
      }

      .fsm66-msg.user{
        background:#ffffff04
      }

      .fsm66-msg b{
        color:#fff;
        font-size:11px
      }

      .fsm66-msg p{
        margin:6px 0 0;
        color:#d2d6df;
        font-size:12px;
        line-height:1.45;
        white-space:pre-wrap
      }

      .fsm66-editor{
        margin-top:10px;
        display:flex;
        gap:7px
      }

      .fsm66-editor textarea{
        flex:1;
        min-height:70px;
        resize:vertical;
        border:1px solid #ffffff12;
        background:#080c13;
        color:#fff;
        border-radius:9px;
        padding:9px;
        font:inherit;
        outline:none
      }

      .fsm66-empty{
        padding:22px;
        text-align:center;
        border:1px dashed #ffffff12;
        border-radius:13px;
        color:#929caf
      }

      @media(max-width:900px){
        .fsm66-window{
          grid-template-columns:1fr
        }

        .fsm66-side{
          border-right:0;
          border-bottom:1px solid #ffffff0e;
          max-height:220px
        }

        .fsm66-nav{
          grid-template-columns:repeat(2,1fr);
        }

        .fsm66-grid{
          grid-template-columns:repeat(2,minmax(0,1fr))
        }
      }

      @media(max-width:600px){
        .fsm66-main{
          padding:14px
        }

        .fsm66-grid{
          grid-template-columns:1fr
        }

        .fsm66-editor{
          flex-direction:column
        }
      }
    `;

    document.head.appendChild(s);
  }

  async function isAdmin() {
    if (!sb) return false;

    const {
      data: { session },
      error: sessionError
    } = await sb.auth.getSession();

    if (sessionError) {
      console.error(
        "FSM 6.6 session:",
        sessionError
      );
      return false;
    }

    adminUser =
      session?.user || null;

    if (!adminUser) {
      return false;
    }

    const {
      data,
      error
    } =
      await sb
        .from("profiles")
        .select("is_admin")
        .eq(
          "id",
          adminUser.id
        )
        .maybeSingle();

    if (error) {
      console.error(
        "FSM 6.6 admin check:",
        error
      );
      return false;
    }

    return data?.is_admin === true;
  }

  function addButton() {
    if ($("fsm66Open")) return;

    const actions =
      document.querySelector(
        ".top-actions"
      );

    if (!actions) return;

    const button =
      document.createElement(
        "button"
      );

    button.id =
      "fsm66Open";

    button.className =
      "fsm66-btn";

    button.type =
      "button";

    button.textContent =
      "🛡️ Admin";

    button.onclick =
      open;

    actions.appendChild(
      button
    );
  }

  function createPanel() {
    if ($("fsm66Overlay")) return;

    const overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "fsm66Overlay";

    overlay.className =
      "fsm66-overlay";

    overlay.innerHTML = `
      <div class="fsm66-window">

        <aside class="fsm66-side">

          <div class="fsm66-brand">
            FC MOBILE FSM
          </div>

          <h2>
            Panel Admin
          </h2>

          <div class="fsm66-nav">

            <button
              data-tab="overview"
              type="button"
            >
              📊 Resumen
            </button>

            <button
              data-tab="tickets"
              type="button"
            >
              🎫 Soporte
            </button>

            <button
              data-tab="users"
              type="button"
            >
              👥 Usuarios
            </button>

            <button
              data-tab="security"
              type="button"
            >
              🔐 Seguridad
            </button>

          </div>

        </aside>

        <main class="fsm66-main">

          <div class="fsm66-top">

            <div>

              <h1
                id="fsm66Title"
                class="fsm66-title"
              >
                Panel Admin
              </h1>

              <p
                id="fsm66Sub"
                class="fsm66-sub"
              >
                Centro privado de operaciones.
              </p>

            </div>

            <button
              id="fsm66Close"
              class="fsm66-btn"
              type="button"
            >
              Cerrar
            </button>

          </div>

          <div id="fsm66Body"></div>

        </main>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    $("fsm66Close").onclick =
      close;

    overlay.addEventListener(
      "click",
      (event) => {
        if (
          event.target === overlay
        ) {
          close();
        }
      }
    );

    overlay
      .querySelectorAll(
        "[data-tab]"
      )
      .forEach(
        (button) => {
          button.onclick =
            () =>
              render(
                button.dataset.tab
              );
        }
      );
  }

  async function open() {
    const ok =
      await isAdmin();

    if (!ok) {
      alert(
        "No tienes permisos de administrador."
      );
      return;
    }

    $("fsm66Overlay")
      ?.classList.add(
        "open"
      );

    await render(
      "overview"
    );
  }

  function close() {
    $("fsm66Overlay")
      ?.classList.remove(
        "open"
      );
  }

  async function render(
    tab
  ) {

    document
      .querySelectorAll(
        ".fsm66-nav button"
      )
      .forEach(
        (button) => {
          button.classList.toggle(
            "active",
            button.dataset.tab ===
              tab
          );
        }
      );

    if (
      tab ===
      "overview"
    ) {
      await overview();

    } else if (
      tab ===
      "tickets"
    ) {
      await tickets();

    } else if (
      tab ===
      "users"
    ) {
      await users();

    } else if (
      tab ===
      "security"
    ) {
      await security();
    }
  }

  async function overview() {

    const [
      usersResult,
      playersResult,
      ticketsResult,
      alertsResult
    ] =
      await Promise.all([
        sb
          .from("profiles")
          .select(
            "id",
            {
              count:
                "exact",
              head:
                true
            }
          ),

        sb
          .from("players")
          .select(
            "id",
            {
              count:
                "exact",
              head:
                true
            }
          ),

        sb
          .from("support_tickets")
          .select(
            "id",
            {
              count:
                "exact",
              head:
                true
            }
          ),

        sb
          .from("price_alerts")
          .select(
            "id",
            {
              count:
                "exact",
              head:
                true
            }
          )
          .eq(
            "is_active",
            true
          )
      ]);

    $("fsm66Title").textContent =
      "📊 Resumen";

    $("fsm66Sub").textContent =
      "Vista general de tu plataforma FSM.";

    $("fsm66Body").innerHTML = `
      <div class="fsm66-grid">

        <div class="fsm66-card">

          <h3>
            👥 Usuarios
          </h3>

          <div class="fsm66-number">
            ${usersResult.count || 0}
          </div>

          <div class="fsm66-muted">
            Perfiles registrados
          </div>

        </div>

        <div class="fsm66-card">

          <h3>
            👤 Jugadores
          </h3>

          <div class="fsm66-number">
            ${playersResult.count || 0}
          </div>

          <div class="fsm66-muted">
            Jugadores del catálogo
          </div>

        </div>

        <div class="fsm66-card">

          <h3>
            🎫 Tickets
          </h3>

          <div class="fsm66-number">
            ${ticketsResult.count || 0}
          </div>

          <div class="fsm66-muted">
            Incidencias
          </div>

        </div>

        <div class="fsm66-card">

          <h3>
            🔔 Alertas
          </h3>

          <div class="fsm66-number">
            ${alertsResult.count || 0}
          </div>

          <div class="fsm66-muted">
            Alertas activas
          </div>

        </div>

      </div>

      <div
        class="fsm66-card"
        style="margin-top:12px"
      >

        <h3>
          🧭 Operación
        </h3>

        <p class="fsm66-muted">
          Este panel es privado y está destinado
          exclusivamente a administradores.
        </p>

      </div>
    `;
  }

  async function tickets() {

    const result =
      await sb
        .from(
          "support_tickets"
        )
        .select(
          "id,user_id,subject,status,priority,category,created_at,updated_at"
        )
        .order(
          "updated_at",
          {
            ascending:
              false
          }
        )
        .limit(
          100
        );

    if (result.error) {

      $("fsm66Body").innerHTML = `
        <div class="fsm66-empty">
          No se pudieron cargar los tickets.
        </div>
      `;

      return;
    }

    const rows =
      result.data ||
      [];

    $("fsm66Title").textContent =
      "🎫 Soporte";

    $("fsm66Sub").textContent =
      "Gestiona las incidencias de los usuarios.";

    if (!rows.length) {

      $("fsm66Body").innerHTML = `
        <div class="fsm66-empty">

          <div
            style="font-size:34px"
          >
            🎫
          </div>

          <h3
            style="color:#fff"
          >
            No hay incidencias
          </h3>

          <p>
            Todavía no se han creado tickets.
          </p>

        </div>
      `;

      return;
    }

    $("fsm66Body").innerHTML = `
      <div class="fsm66-card">

        <h3>
          🎫 Incidencias
        </h3>

        <div class="fsm66-list">

          ${rows
            .map(
              (row) => `
                <div
                  class="fsm66-row"
                >

                  <div>

                    <strong>
                      ${escapeHtml(
                        row.subject
                      )}
                    </strong>

                    <small>
                      ${escapeHtml(
                        row.category ||
                        "general"
                      )}

                      ·

                      ${escapeHtml(
                        row.priority ||
                        "normal"
                      )}

                      ·

                      ${escapeHtml(
                        row.status ||
                        "open"
                      )}

                      ·

                      ${new Date(
                        row.updated_at ||
                        row.created_at
                      ).toLocaleString(
                        "es-ES"
                      )}
                    </small>

                  </div>

                  <button
                    class="fsm66-btn primary"
                    data-ticket="${escapeAttr(
                      row.id
                    )}"
                    type="button"
                  >
                    Abrir
                  </button>

                </div>
              `
            )
            .join("")}

        </div>

      </div>
    `;

    $("fsm66Body")
      .querySelectorAll(
        "[data-ticket]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () =>
              openTicket(
                button.dataset.ticket
              );

        }
      );
  }

  async function openTicket(
    ticketId
  ) {

    const ticketResult =
      await sb
        .from(
          "support_tickets"
        )
        .select(
          "id,user_id,subject,status,priority,category,created_at,updated_at"
        )
        .eq(
          "id",
          ticketId
        )
        .single();

    if (
      ticketResult.error
    ) {

      alert(
        "No se pudo abrir el ticket."
      );

      return;
    }

    const messagesResult =
      await sb
        .from(
          "support_messages"
        )
        .select(
          "id,user_id,body,sender_type,created_at"
        )
        .eq(
          "ticket_id",
          ticketId
        )
        .order(
          "created_at",
          {
            ascending:
              true
          }
        );

    const ticket =
      ticketResult.data;

    const messages =
      messagesResult.data ||
      [];

    $("fsm66Title").textContent =
      "🎫 Incidencia";

    $("fsm66Sub").textContent =
      "Conversación con el usuario.";

    $("fsm66Body").innerHTML = `
      <div class="fsm66-card">

        <div
          style="
            display:flex;
            justify-content:space-between;
            gap:10px;
            align-items:center;
          "
        >

          <div>

            <h3>
              ${escapeHtml(
                ticket.subject
              )}
            </h3>

            <div
              class="fsm66-muted"
            >
              Categoría:
              ${escapeHtml(
                ticket.category ||
                "general"
              )}
              · Prioridad:
              ${escapeHtml(
                ticket.priority ||
                "normal"
              )}
              · Estado:
              ${escapeHtml(
                ticket.status ||
                "open"
              )}
            </div>

          </div>

          <button
            id="fsm66BackTickets"
            class="fsm66-btn"
            type="button"
          >
            Volver
          </button>

        </div>

        <div
          class="fsm66-list"
          style="margin-top:14px"
        >

          ${
            messages.length
              ? messages
                  .map(
                    (message) =>
                      `
                        <div
                          class="
                            fsm66-msg
                            ${
                              message.sender_type ===
                              "support"
                                ? "admin"
                                : "user"
                            }
                          "
                        >

                          <b>
                            ${
                              message.sender_type ===
                              "support"
                                ? "🛡️ Soporte FSM"
                                : "👤 Usuario"
                            }
                          </b>

                          <p>
                            ${escapeHtml(
                              message.body
                            )}
                          </p>

                          <small
                            class="fsm66-muted"
                          >
                            ${new Date(
                              message.created_at
                            ).toLocaleString(
                              "es-ES"
                            )}
                          </small>

                        </div>
                      `
                  )
                  .join("")
              : `
                  <div class="fsm66-empty">
                    Todavía no hay mensajes.
                  </div>
                `
          }

        </div>

        <div
          class="fsm66-editor"
        >

          <textarea
            id="fsm66Reply"
            placeholder="Escribe una respuesta para el usuario..."
            maxlength="3000"
          ></textarea>

          <button
            id="fsm66SendReply"
            class="fsm66-btn primary"
            type="button"
          >
            Responder
          </button>

        </div>

        <div
          style="
            display:flex;
            gap:7px;
            flex-wrap:wrap;
            margin-top:9px;
          "
        >

          <button
            class="fsm66-btn"
            data-status="open"
            type="button"
          >
            Abierto
          </button>

          <button
            class="fsm66-btn"
            data-status="pending"
            type="button"
          >
            Pendiente
          </button>

          <button
            class="fsm66-btn"
            data-status="closed"
            type="button"
          >
            Cerrado
          </button>

        </div>

      </div>
    `;

    $("fsm66BackTickets").onclick =
      tickets;

    $("fsm66SendReply").onclick =
      () =>
        sendReply(
          ticketId
        );

    $("fsm66Body")
      .querySelectorAll(
        "[data-status]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () =>
              updateTicketStatus(
                ticketId,
                button.dataset.status
              );

        }
      );
  }

  async function sendReply(
    ticketId
  ) {

    if (!adminUser) {
      alert(
        "Sesión de administrador no encontrada."
      );
      return;
    }

    const input =
      $("fsm66Reply");

    const text =
      input?.value.trim();

    if (!text) {
      return;
    }

    const result =
      await sb
        .from(
          "support_messages"
        )
        .insert({
          ticket_id:
            ticketId,

          user_id:
            adminUser.id,

          body:
            text,

          sender_type:
            "support"
        });

    if (result.error) {

      console.error(
        "FSM66 reply:",
        result.error
      );

      alert(
        "No se pudo enviar la respuesta."
      );

      return;
    }

    input.value =
      "";

    await openTicket(
      ticketId
    );
  }

  async function updateTicketStatus(
    ticketId,
    status
  ) {

    const result =
      await sb
        .from(
          "support_tickets"
        )
        .update({
          status
        })
        .eq(
          "id",
          ticketId
        );

    if (result.error) {

      console.error(
        "FSM66 status:",
        result.error
      );

      alert(
        "No se pudo actualizar el estado."
      );

      return;
    }

    await openTicket(
      ticketId
    );
  }

  async function users() {

    const result =
      await sb
        .from(
          "profiles"
        )
        .select(
          "id,email,free_uses,is_pro,is_admin,created_at"
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        )
        .limit(
          100
        );

    if (
      result.error
    ) {

      $("fsm66Body").innerHTML = `
        <div class="fsm66-empty">
          No se pudieron cargar los usuarios.
        </div>
      `;

      return;
    }

    const rows =
      result.data ||
      [];

    $("fsm66Title").textContent =
      "👥 Usuarios";

    $("fsm66Sub").textContent =
      "Usuarios registrados en FSM.";

    $("fsm66Body").innerHTML = `
      <div class="fsm66-card">

        <h3>
          👥 Usuarios
        </h3>

        <div
          class="fsm66-list"
        >

          ${
            rows.length
              ? rows
                  .map(
                    (user) =>
                      `
                        <div
                          class="fsm66-row"
                        >

                          <div>

                            <strong>
                              ${escapeHtml(
                                user.email ||
                                "Usuario"
                              )}
                            </strong>

                            <small>
                              ${
                                user.is_pro
                                  ? "⭐ PRO"
                                  : "FREE"
                              }

                              ·

                              ${
                                user.is_admin
                                  ? "🛡️ ADMIN"
                                  : "USER"
                              }

                              ·

                              ${user.free_uses ??
                                0}
                              análisis disponibles
                            </small>

                          </div>

                        </div>
                      `
                  )
                  .join("")
              : `
                  <div class="fsm66-empty">
                    No hay usuarios.
                  </div>
                `
          }

        </div>

      </div>
    `;
  }

  async function security() {

    $("fsm66Title").textContent =
      "🔐 Seguridad";

    $("fsm66Sub").textContent =
      "Estado de las protecciones administrativas.";

    $("fsm66Body").innerHTML = `
      <div class="fsm66-grid">

        <div class="fsm66-card">

          <h3>
            🔐 RLS
          </h3>

          <div
            class="fsm66-number"
          >
            ACTIVO
          </div>

          <div
            class="fsm66-muted"
          >
            Las tablas utilizan políticas
            de acceso.
          </div>

        </div>

        <div class="fsm66-card">

          <h3>
            🛡️ Admin
          </h3>

          <div
            class="fsm66-number"
          >
            PRIVADO
          </div>

          <div
            class="fsm66-muted"
          >
            Solo perfiles con is_admin=true
            pueden utilizar el panel.
          </div>

        </div>

        <div class="fsm66-card">

          <h3>
            🎫 Soporte
          </h3>

          <div
            class="fsm66-number"
          >
            PROTEGIDO
          </div>

          <div
            class="fsm66-muted"
          >
            Los mensajes están restringidos
            mediante políticas.
          </div>

        </div>

      </div>

      <div
        class="fsm66-card"
        style="margin-top:12px"
      >

        <h3>
          ⚠️ Regla de seguridad
        </h3>

        <p class="fsm66-muted">
          Nunca coloques una service_role key
          dentro de index.html, app.js,
          support.js, phase6.js o phase66.js.
        </p>

      </div>
    `;
  }

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

  function escapeAttr(
    value
  ) {
    return escapeHtml(
      value
    );
  }

  async function init() {

    if (!sb) {
      console.warn(
        "FSM 6.6: Supabase no disponible."
      );
      return;
    }

    styles();

    createPanel();

    const allowed =
      await isAdmin();

    if (allowed) {
      addButton();
    }

    sb.auth.onAuthStateChange(
      () => {

        setTimeout(
          async () => {

            const isAllowed =
              await isAdmin();

            if (
              isAllowed &&
              !$("fsm66Open")
            ) {
              addButton();
            }

            if (
              !isAllowed &&
              $("fsm66Open")
            ) {
              $("fsm66Open")
                .remove();
            }

          },
          0
        );
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
