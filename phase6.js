;(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6TMaFORK";

  const sb =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  const $ = (id) =>
    document.getElementById(id);

  let currentUser = null;
  let profile = null;
  let selectedSection = "overview";
  let currentFavoriteIds = new Set();
  let currentAlerts = [];
  let fetchRecorderInstalled = false;

  function addStyles() {
    if ($("fsmPhase6Styles")) return;

    const style = document.createElement("style");
    style.id = "fsmPhase6Styles";

    style.textContent = `
      .fsm6-nav-btn{
        border:1px solid #ffffff18;
        background:#ffffff08;
        color:#fff;
        border-radius:10px;
        padding:9px 12px;
        cursor:pointer;
        font-weight:800;
        font-size:12px
      }

      .fsm6-nav-btn:hover{
        background:#ffffff14
      }

      .fsm6-overlay{
        display:none;
        position:fixed;
        inset:0;
        z-index:99990;
        background:#000c;
        backdrop-filter:blur(10px);
        align-items:center;
        justify-content:center;
        padding:14px
      }

      .fsm6-overlay.open{
        display:flex
      }

      .fsm6-window{
        width:min(1100px,100%);
        max-height:92vh;
        overflow:hidden;
        display:grid;
        grid-template-columns:250px 1fr;
        background:#0f1521;
        border:1px solid #ffffff15;
        border-radius:20px;
        box-shadow:0 25px 90px #000b
      }

      .fsm6-sidebar{
        padding:18px;
        border-right:1px solid #ffffff10;
        background:linear-gradient(180deg,#151126,#101622);
        overflow:auto
      }

      .fsm6-brand{
        color:#bcaeff;
        font-size:11px;
        font-weight:900;
        letter-spacing:1.5px
      }

      .fsm6-sidebar h2{
        color:#fff;
        margin:6px 0 15px
      }

      .fsm6-menu{
        display:grid;
        gap:7px
      }

      .fsm6-menu button{
        text-align:left;
        border:1px solid transparent;
        background:transparent;
        color:#aeb5c5;
        border-radius:10px;
        padding:11px;
        cursor:pointer
      }

      .fsm6-menu button.active,
      .fsm6-menu button:hover{
        background:#ffffff09;
        color:#fff;
        border-color:#ffffff10
      }

      .fsm6-content{
        min-width:0;
        overflow:auto;
        padding:22px
      }

      .fsm6-top{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px
      }

      .fsm6-title{
        margin:0;
        color:#fff;
        font-size:28px
      }

      .fsm6-sub{
        margin:5px 0 18px;
        color:#929caf;
        line-height:1.5
      }

      .fsm6-grid{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:12px
      }

      .fsm6-card{
        background:#ffffff04;
        border:1px solid #ffffff10;
        border-radius:15px;
        padding:15px
      }

      .fsm6-card h3{
        margin:0 0 8px;
        color:#fff;
        font-size:14px
      }

      .fsm6-card p{
        margin:0;
        color:#929caf;
        font-size:12px;
        line-height:1.55
      }

      .fsm6-stat{
        font-size:26px;
        color:#fff;
        font-weight:950
      }

      .fsm6-list{
        display:grid;
        gap:9px
      }

      .fsm6-list-item{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:11px 12px;
        border-radius:12px;
        background:#ffffff05;
        border:1px solid #ffffff0c
      }

      .fsm6-list-item strong{
        color:#fff;
        font-size:12px;
        display:block
      }

      .fsm6-list-item small{
        color:#929caf;
        display:block;
        margin-top:3px
      }

      .fsm6-btn{
        border:1px solid #ffffff15;
        background:#ffffff08;
        color:#fff;
        border-radius:9px;
        padding:8px 10px;
        cursor:pointer;
        font-weight:800;
        font-size:11px
      }

      .fsm6-btn.primary{
        background:#7c5cff;
        border-color:transparent
      }

      .fsm6-btn.danger{
        background:#ff526622;
        border-color:#ff526644
      }

      .fsm6-form{
        display:grid;
        gap:10px
      }

      .fsm6-form input,
      .fsm6-form select{
        width:100%;
        box-sizing:border-box;
        border:1px solid #ffffff12;
        background:#080c13;
        color:#fff;
        border-radius:9px;
        padding:10px;
        outline:none
      }

      .fsm6-form input:focus,
      .fsm6-form select:focus{
        border-color:#7c5cff
      }

      .fsm6-empty{
        border:1px dashed #ffffff15;
        border-radius:14px;
        padding:22px;
        text-align:center;
        color:#929caf
      }

      .fsm6-favorite{
        position:absolute;
        z-index:20;
        top:8px;
        right:8px;
        width:34px;
        height:34px;
        border-radius:50%;
        border:1px solid #ffffff18;
        background:#0008;
        color:#fff;
        cursor:pointer
      }

      .fsm6-favorite.active{
        color:#ffd166;
        background:#7c5cff33
      }

      .fsm6-toast{
        position:fixed;
        left:50%;
        bottom:24px;
        transform:translateX(-50%);
        z-index:100000;
        background:#121927;
        color:#fff;
        border:1px solid #ffffff14;
        border-radius:11px;
        padding:10px 14px;
        display:none;
        box-shadow:0 20px 60px #0008;
        font-size:12px
      }

      .fsm6-toast.show{
        display:block
      }

      @media(max-width:850px){
        .fsm6-window{
          grid-template-columns:1fr
        }

        .fsm6-sidebar{
          border-right:0;
          border-bottom:1px solid #ffffff10;
          max-height:220px
        }

        .fsm6-menu{
          grid-template-columns:repeat(2,1fr)
        }

        .fsm6-grid{
          grid-template-columns:1fr
        }
      }

      @media(max-width:600px){
        .fsm6-content{
          padding:15px
        }

        .fsm6-title{
          font-size:23px
        }
      }
    `;

    document.head.appendChild(style);
  }

  function addToast() {
    if ($("fsm6Toast")) return;

    const toastElement =
      document.createElement("div");

    toastElement.id =
      "fsm6Toast";

    toastElement.className =
      "fsm6-toast";

    document.body.appendChild(
      toastElement
    );
  }

  function toast(message) {
    const element =
      $("fsm6Toast");

    if (!element) return;

    element.textContent =
      message;

    element.classList.add(
      "show"
    );

    clearTimeout(
      element._timer
    );

    element._timer =
      setTimeout(
        () =>
          element.classList.remove(
            "show"
          ),
        2800
      );
  }

  function addOpenButton() {
    if ($("fsm6Open")) return;

    const actions =
      document.querySelector(
        ".top-actions"
      );

    if (!actions) return;

    const button =
      document.createElement(
        "button"
      );

    button.id = "fsm6Open";
    button.className =
      "fsm6-nav-btn";
    button.type = "button";
    button.textContent =
      "⭐ Mi espacio";

    button.onclick =
      openPanel;

    actions.prepend(
      button
    );
  }

  function createPanel() {
    if ($("fsm6Overlay")) return;

    const overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "fsm6Overlay";

    overlay.className =
      "fsm6-overlay";

    overlay.innerHTML = `
      <div class="fsm6-window">

        <aside class="fsm6-sidebar">

          <div class="fsm6-brand">
            FC MOBILE FSM
          </div>

          <h2>
            Mi espacio
          </h2>

          <div class="fsm6-menu">

            <button
              data-section="overview"
              type="button"
            >
              🏠 Resumen
            </button>

            <button
              data-section="favorites"
              type="button"
            >
              ⭐ Favoritos
            </button>

            <button
              data-section="history"
              type="button"
            >
              🧠 Historial IA
            </button>

            <button
              data-section="alerts"
              type="button"
            >
              🔔 Alertas
            </button>

            <button
              data-section="tickets"
              type="button"
            >
              🎫 Soporte
            </button>

            <button
              data-section="settings"
              type="button"
            >
              ⚙️ Ajustes
            </button>

          </div>

        </aside>

        <main class="fsm6-content">

          <div class="fsm6-top">

            <div>
              <h1
                id="fsm6Title"
                class="fsm6-title"
              >
                Mi espacio
              </h1>

              <p
                id="fsm6Sub"
                class="fsm6-sub"
              >
                Tu centro personal de FSM.
              </p>
            </div>

            <button
              id="fsm6Close"
              class="fsm6-btn"
              type="button"
            >
              Cerrar
            </button>

          </div>

          <div id="fsm6Body"></div>

        </main>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    overlay.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          overlay
        ) {
          closePanel();
        }
      }
    );

    $("fsm6Close").onclick =
      closePanel;

    overlay
      .querySelectorAll(
        "[data-section]"
      )
      .forEach(
        (button) => {
          button.onclick =
            () =>
              renderSection(
                button.dataset.section
              );
        }
      );
  }

  async function openPanel() {
    if (!currentUser) {
      toast(
        "Inicia sesión para abrir Mi espacio."
      );
      return;
    }

    $("fsm6Overlay")
      ?.classList.add(
        "open"
      );

    await loadUserData();

    await renderSection(
      "overview"
    );
  }

  function closePanel() {
    $("fsm6Overlay")
      ?.classList.remove(
        "open"
      );
  }

  async function loadUser() {
    if (!sb) return;

    const {
      data: {
        session
      }
    } =
      await sb.auth.getSession();

    currentUser =
      session?.user ||
      null;

    if (!currentUser) {
      profile = null;
      return;
    }

    const result =
      await sb
        .from("profiles")
        .select(
          "email,free_uses,is_pro,created_at"
        )
        .eq(
          "id",
          currentUser.id
        )
        .maybeSingle();

    profile =
      result.data ||
      null;
  }

  async function loadSummary() {
    if (!currentUser) {
      return {
        favorites: 0,
        analyses: 0,
        tickets: 0,
        alerts: 0
      };
    }

    const [
      favorites,
      analyses,
      tickets,
      alerts
    ] =
      await Promise.all([
        sb
          .from(
            "player_favorites"
          )
          .select(
            "player_id",
            {
              count:"exact",
              head:true
            }
          )
          .eq(
            "user_id",
            currentUser.id
          ),

        sb
          .from(
            "ai_analysis_history"
          )
          .select(
            "id",
            {
              count:"exact",
              head:true
            }
          )
          .eq(
            "user_id",
            currentUser.id
          ),

        sb
          .from(
            "support_tickets"
          )
          .select(
            "id",
            {
              count:"exact",
              head:true
            }
          )
          .eq(
            "user_id",
            currentUser.id
          ),

        sb
          .from(
            "price_alerts"
          )
          .select(
            "id",
            {
              count:"exact",
              head:true
            }
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .eq(
            "is_active",
            true
          )
      ]);

    return {
      favorites:
        favorites.count ||
        0,

      analyses:
        analyses.count ||
        0,

      tickets:
        tickets.count ||
        0,

      alerts:
        alerts.count ||
        0
    };
  }

  async function renderOverview() {
    const summary =
      await loadSummary();

    $("fsm6Body").innerHTML = `
      <div class="fsm6-grid">

        <div class="fsm6-card">
          <h3>⭐ Favoritos</h3>
          <div class="fsm6-stat">
            ${summary.favorites}
          </div>
          <p>
            Jugadores guardados.
          </p>
        </div>

        <div class="fsm6-card">
          <h3>🧠 Análisis</h3>
          <div class="fsm6-stat">
            ${summary.analyses}
          </div>
          <p>
            Análisis de FSM IA guardados.
          </p>
        </div>

        <div class="fsm6-card">
          <h3>🔔 Alertas</h3>
          <div class="fsm6-stat">
            ${summary.alerts}
          </div>
          <p>
            Alertas activas.
          </p>
        </div>

        <div class="fsm6-card">
          <h3>🎫 Soporte</h3>
          <div class="fsm6-stat">
            ${summary.tickets}
          </div>
          <p>
            Incidencias creadas.
          </p>
        </div>

        <div class="fsm6-card">
          <h3>⭐ Plan</h3>
          <div class="fsm6-stat">
            ${
              profile?.is_pro
                ? "PRO"
                : "FREE"
            }
          </div>
          <p>
            ${
              profile?.is_pro
                ? "Análisis ilimitados."
                : `${profile?.free_uses ?? 0} análisis disponibles.`
            }
          </p>
        </div>

        <div class="fsm6-card">
          <h3>👤 Cuenta</h3>
          <p>
            ${escapeHtml(
              profile?.email ||
              currentUser?.email ||
              ""
            )}
          </p>

          <button
            class="fsm6-btn primary"
            data-goto="settings"
            style="margin-top:10px"
            type="button"
          >
            Abrir ajustes
          </button>
        </div>

      </div>

      <div
        class="fsm6-card"
        style="margin-top:12px"
      >
        <h3>🚀 Recomendado</h3>

        <p>
          Guarda tus jugadores favoritos,
          revisa tus análisis y configura
          alertas para tener FSM organizado
          en un solo lugar.
        </p>
      </div>
    `;

    $("fsm6Body")
      .querySelectorAll(
        "[data-goto]"
      )
      .forEach(
        (button) => {
          button.onclick =
            () =>
              renderSection(
                button.dataset.goto
              );
        }
      );
  }

  async function loadFavorites() {
    if (!currentUser) {
      return [];
    }

    const result =
      await sb
        .from(
          "player_favorites"
        )
        .select(
          "player_id,created_at,players(*)"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        );

    return (
      result.data ||
      []
    );
  }

  async function renderFavorites() {
    const data =
      await loadFavorites();

    if (!data.length) {
      $("fsm6Body").innerHTML = `
        <div class="fsm6-empty">

          <div style="font-size:34px">
            ⭐
          </div>

          <h3 style="color:#fff">
            No tienes favoritos todavía
          </h3>

          <p>
            Guarda jugadores desde Jugadores
            para tenerlos aquí.
          </p>

        </div>
      `;

      return;
    }

    $("fsm6Body").innerHTML = `
      <div class="fsm6-list">

        ${data
          .map(
            (item) => {

              const player =
                item.players;

              return `
                <div class="fsm6-list-item">

                  <div>
                    <strong>
                      ${escapeHtml(
                        player?.name ||
                        "Jugador"
                      )}
                    </strong>

                    <small>
                      ${escapeHtml(
                        player?.pos ||
                        ""
                      )}
                      · OVR
                      ${escapeHtml(
                        player?.ovr ??
                        "-"
                      )}
                    </small>
                  </div>

                  <button
                    class="fsm6-btn danger"
                    data-remove-favorite="${escapeAttr(
                      item.player_id
                    )}"
                    type="button"
                  >
                    Quitar
                  </button>

                </div>
              `;
            }
          )
          .join("")}

      </div>
    `;

    $("fsm6Body")
      .querySelectorAll(
        "[data-remove-favorite]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () =>
              removeFavorite(
                Number(
                  button.dataset
                    .removeFavorite
                )
              );
        }
      );
  }

  async function addFavorite(
    playerId
  ) {
    if (!currentUser) {
      toast(
        "Inicia sesión para guardar favoritos."
      );

      return false;
    }

    const result =
      await sb
        .from(
          "player_favorites"
        )
        .upsert({
          user_id:
            currentUser.id,

          player_id:
            playerId
        });

    if (result.error) {
      console.error(
        result.error
      );

      toast(
        "No se pudo guardar el favorito."
      );

      return false;
    }

    currentFavoriteIds.add(
      Number(
        playerId
      )
    );

    toast(
      "⭐ Jugador guardado en favoritos."
    );

    return true;
  }

  async function removeFavorite(
    playerId
  ) {
    if (!currentUser) return;

    const result =
      await sb
        .from(
          "player_favorites"
        )
        .delete()
        .eq(
          "user_id",
          currentUser.id
        )
        .eq(
          "player_id",
          playerId
        );

    if (result.error) {
      toast(
        "No se pudo quitar el favorito."
      );

      return;
    }

    currentFavoriteIds.delete(
      Number(
        playerId
      )
    );

    toast(
      "Favorito eliminado."
    );

    if (
      selectedSection ===
      "favorites"
    ) {
      await renderFavorites();
    }

    refreshFavoriteButtons();
  }

  async function loadFavoriteIds() {
    currentFavoriteIds =
      new Set();

    if (!currentUser) {
      return;
    }

    const result =
      await sb
        .from(
          "player_favorites"
        )
        .select(
          "player_id"
        )
        .eq(
          "user_id",
          currentUser.id
        );

    (
      result.data ||
      []
    ).forEach(
      (row) =>
        currentFavoriteIds.add(
          Number(
            row.player_id
          )
        )
    );
  }

  function refreshFavoriteButtons() {
    const players =
      Array.isArray(
        window.FSM_PLAYERS
      )
        ? window.FSM_PLAYERS
        : [];

    if (!players.length) {
      return;
    }

    document
      .querySelectorAll(
        ".card"
      )
      .forEach(
        (card) => {

          if (
            card.querySelector(
              ".fsm6-favorite"
            )
          ) {
            return;
          }

          const name =
            card.querySelector(
              "h3"
            )?.textContent
              ?.trim();

          if (!name) {
            return;
          }

          const player =
            players.find(
              (item) =>
                String(
                  item.name
                ).toLowerCase() ===
                name.toLowerCase()
            );

          if (!player) {
            return;
          }

          if (
            getComputedStyle(
              card
            ).position ===
            "static"
          ) {
            card.style.position =
              "relative";
          }

          const button =
            document.createElement(
              "button"
            );

          button.type =
            "button";

          button.className =
            "fsm6-favorite";

          button.dataset.playerId =
            player.id;

          const isFavorite =
            currentFavoriteIds.has(
              Number(
                player.id
              )
            );

          button.textContent =
            isFavorite
              ? "★"
              : "☆";

          if (
            isFavorite
          ) {
            button.classList.add(
              "active"
            );
          }

          button.title =
            isFavorite
              ? "Quitar de favoritos"
              : "Añadir a favoritos";

          button.onclick =
            async (event) => {

              event.stopPropagation();

              const id =
                Number(
                  player.id
                );

              if (
                currentFavoriteIds.has(
                  id
                )
              ) {
                await removeFavorite(
                  id
                );
              } else {
                await addFavorite(
                  id
                );
              }

              refreshFavoriteButtons();
            };

          card.appendChild(
            button
          );
        }
      );
  }

  async function renderHistory() {
    if (!currentUser) {
      return;
    }

    const result =
      await sb
        .from(
          "ai_analysis_history"
        )
        .select(
          "id,request,result,created_at"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        )
        .limit(
          50
        );

    const rows =
      result.data ||
      [];

    if (!rows.length) {
      $("fsm6Body").innerHTML = `
        <div class="fsm6-empty">

          <div style="font-size:34px">
            🧠
          </div>

          <h3 style="color:#fff">
            No hay análisis guardados
          </h3>

          <p>
            Tus próximos análisis de FSM IA
            aparecerán aquí automáticamente.
          </p>

        </div>
      `;

      return;
    }

    $("fsm6Body").innerHTML = `
      <div class="fsm6-list">

        ${rows
          .map(
            (row) => {

              const request =
                row.request ||
                {};

              const result =
                row.result ||
                {};

              return `
                <div class="fsm6-list-item">

                  <div>

                    <strong>
                      ${escapeHtml(
                        request.position ||
                        "Análisis"
                      )}

                      ·

                      ${escapeHtml(
                        request.budget ||
                        ""
                      )}
                    </strong>

                    <small>
                      Puntuación:
                      ${escapeHtml(
                        result.score ??
                        "-"
                      )}

                      ·

                      ${new Date(
                        row.created_at
                      ).toLocaleString(
                        "es-ES"
                      )}
                    </small>

                  </div>

                </div>
              `;
            }
          )
          .join("")}

      </div>
    `;
  }

  async function renderSettings() {
    if (!currentUser) {
      return;
    }

    const result =
      await sb
        .from(
          "user_settings"
        )
        .select(
          "*"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .maybeSingle();

    const settings =
      result.data ||
      {
        display_name:"",
        favorite_position:"",
        language:"es",
        notifications_enabled:true
      };

    $("fsm6Body").innerHTML = `
      <div class="fsm6-card">

        <h3>
          ⚙️ Preferencias
        </h3>

        <div class="fsm6-form">

          <label style="
            color:#929caf;
            font-size:11px
          ">
            Nombre visible
          </label>

          <input
            id="fsm6DisplayName"
            value="${escapeAttr(
              settings.display_name ||
              ""
            )}"
            maxlength="40"
            placeholder="Tu nombre"
          >

          <label style="
            color:#929caf;
            font-size:11px
          ">
            Posición favorita
          </label>

          <select
            id="fsm6Position"
          >
            ${[
              "",
              "GK",
              "LB",
              "CB",
              "RB",
              "CDM",
              "CM",
              "CAM",
              "LW",
              "RW",
              "ST"
            ]
              .map(
                (position) =>
                  `
                    <option
                      value="${escapeAttr(
                        position
                      )}"
                      ${
                        settings.favorite_position ===
                        position
                          ? "selected"
                          : ""
                      }
                    >
                      ${
                        position ||
                        "Sin preferencia"
                      }
                    </option>
                  `
              )
              .join("")}
          </select>

          <label style="
            color:#929caf;
            font-size:11px
          ">
            Idioma
          </label>

          <select
            id="fsm6Language"
          >
            <option
              value="es"
              ${
                settings.language ===
                "es"
                  ? "selected"
                  : ""
              }
            >
              Español
            </option>

            <option
              value="en"
              ${
                settings.language ===
                "en"
                  ? "selected"
                  : ""
              }
            >
              English
            </option>
          </select>

          <label style="
            color:#fff;
            display:flex;
            gap:8px;
            align-items:center;
            font-size:12px;
          ">

            <input
              id="fsm6Notifications"
              type="checkbox"
              ${
                settings.notifications_enabled !==
                false
                  ? "checked"
                  : ""
              }
            >

            Activar notificaciones

          </label>

          <button
            id="fsm6SaveSettings"
            class="fsm6-btn primary"
            type="button"
          >
            Guardar ajustes
          </button>

        </div>

      </div>

      <div class="fsm6-card">

        <h3>
          🔐 Seguridad
        </h3>

        <p>
          Nunca compartas tu contraseña, códigos
          de confirmación ni claves privadas.
        </p>

      </div>
    `;

    $("fsm6SaveSettings").onclick =
      saveSettings;
  }

  async function saveSettings() {
    const payload = {
      user_id:
        currentUser.id,

      display_name:
        $("fsm6DisplayName")
          .value
          .trim(),

      favorite_position:
        $("fsm6Position")
          .value,

      language:
        $("fsm6Language")
          .value,

      notifications_enabled:
        $("fsm6Notifications")
          .checked
    };

    const result =
      await sb
        .from(
          "user_settings"
        )
        .upsert(
          payload
        );

    if (result.error) {
      console.error(
        result.error
      );

      toast(
        "No se pudieron guardar los ajustes."
      );

      return;
    }

    toast(
      "✅ Ajustes guardados."
    );
  }

  async function renderAlerts() {
    if (!currentUser) {
      return;
    }

    const result =
      await sb
        .from(
          "price_alerts"
        )
        .select(
          "id,player_id,target_price,condition,is_active,created_at,players(name,ovr,pos,price)"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        );

    currentAlerts =
      result.data ||
      [];

    $("fsm6Body").innerHTML = `
      <div class="fsm6-card">

        <h3>
          🔔 Nueva alerta
        </h3>

        <div class="fsm6-form">

          <select
            id="fsm6AlertPlayer"
          >
            <option value="">
              Seleccionar jugador...
            </option>

            ${
              Array.isArray(
                window.FSM_PLAYERS
              )
                ? window.FSM_PLAYERS
                    .map(
                      (player) =>
                        `
                          <option
                            value="${escapeAttr(
                              player.id
                            )}"
                          >
                            ${escapeHtml(
                              player.name
                            )}
                            ·
                            ${escapeHtml(
                              player.pos
                            )}
                            · OVR
                            ${escapeHtml(
                              player.ovr
                            )}
                          </option>
                        `
                    )
                    .join("")
                : ""
            }
          </select>

          <input
            id="fsm6AlertPrice"
            type="number"
            min="1"
            placeholder="Precio objetivo"
          >

          <select
            id="fsm6AlertCondition"
          >
            <option value="below">
              Avisar cuando sea igual o menor
            </option>

            <option value="above">
              Avisar cuando sea igual o mayor
            </option>
          </select>

          <button
            id="fsm6CreateAlert"
            class="fsm6-btn primary"
            type="button"
          >
            🔔 Crear alerta
          </button>

        </div>

      </div>

      <div class="fsm6-card">

        <h3>
          📋 Mis alertas
        </h3>

        ${
          currentAlerts.length
            ? `
              <div class="fsm6-list">

                ${currentAlerts
                  .map(
                    (alert) =>
                      `
                        <div class="fsm6-list-item">

                          <div>

                            <strong>
                              ${escapeHtml(
                                alert.players?.name ||
                                "Jugador"
                              )}
                            </strong>

                            <small>
                              ${
                                alert.condition ===
                                "below"
                                  ? "≤"
                                  : "≥"
                              }

                              ${escapeHtml(
                                alert.target_price
                              )}
                            </small>

                          </div>

                          <button
                            class="fsm6-btn danger"
                            data-delete-alert="${escapeAttr(
                              alert.id
                            )}"
                            type="button"
                          >
                            Eliminar
                          </button>

                        </div>
                      `
                  )
                  .join("")}

              </div>
            `
            : `
              <div class="fsm6-empty">
                Todavía no tienes alertas.
              </div>
            `
        }

      </div>
    `;

    $("fsm6CreateAlert").onclick =
      createAlert;

    $("fsm6Body")
      .querySelectorAll(
        "[data-delete-alert]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () =>
              deleteAlert(
                button.dataset
                  .deleteAlert
              );
        }
      );
  }

  async function createAlert() {
    const playerId =
      Number(
        $("fsm6AlertPlayer")
          .value
      );

    const targetPrice =
      Number(
        $("fsm6AlertPrice")
          .value
      );

    const condition =
      $("fsm6AlertCondition")
        .value;

    if (
      !playerId ||
      !targetPrice
    ) {
      toast(
        "Selecciona jugador y precio."
      );

      return;
    }

    const result =
      await sb
        .from(
          "price_alerts"
        )
        .insert({
          user_id:
            currentUser.id,

          player_id:
            playerId,

          target_price:
            targetPrice,

          condition,

          is_active:
            true
        });

    if (result.error) {
      console.error(
        result.error
      );

      toast(
        "No se pudo crear la alerta."
      );

      return;
    }

    toast(
      "🔔 Alerta creada."
    );

    await renderAlerts();
  }

  async function deleteAlert(
    id
  ) {
    const result =
      await sb
        .from(
          "price_alerts"
        )
        .delete()
        .eq(
          "id",
          id
        )
        .eq(
          "user_id",
          currentUser.id
        );

    if (result.error) {
      toast(
        "No se pudo eliminar la alerta."
      );

      return;
    }

    toast(
      "Alerta eliminada."
    );

    await renderAlerts();
  }

  async function renderTickets() {
    if (!currentUser) {
      return;
    }

    const result =
      await sb
        .from(
          "support_tickets"
        )
        .select(
          "id,subject,status,priority,category,created_at,updated_at"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        )
        .limit(
          50
        );

    const tickets =
      result.data ||
      [];

    if (!tickets.length) {
      $("fsm6Body").innerHTML = `
        <div class="fsm6-empty">

          <div style="font-size:34px">
            🎫
          </div>

          <h3 style="color:#fff">
            No tienes incidencias
          </h3>

          <p>
            Cuando envíes un problema desde el chat
            aparecerá aquí.
          </p>

        </div>
      `;

      return;
    }

    $("fsm6Body").innerHTML = `
      <div class="fsm6-list">

        ${tickets
          .map(
            (ticket) =>
              `
                <div class="fsm6-list-item">

                  <div>

                    <strong>
                      ${escapeHtml(
                        ticket.subject
                      )}
                    </strong>

                    <small>
                      ${escapeHtml(
                        ticket.status ||
                        "open"
                      )}

                      ·

                      ${
                        ticket.priority
                          ? escapeHtml(
                              ticket.priority
                            )
                          : "normal"
                      }

                      ·

                      ${new Date(
                        ticket.created_at
                      ).toLocaleString(
                        "es-ES"
                      )}
                    </small>

                  </div>

                </div>
              `
          )
          .join("")}

      </div>
    `;
  }

  function installFetchRecorder() {
    if (
      fetchRecorderInstalled
    ) {
      return;
    }

    fetchRecorderInstalled =
      true;

    const originalFetch =
      window.fetch.bind(
        window
      );

    window.fetch =
      async (...args) => {

        const response =
          await originalFetch(
            ...args
          );

        try {

          const url =
            typeof args[0] ===
            "string"
              ? args[0]
              : args[0]?.url ||
                "";

          if (
            url.includes(
              "/functions/v1/fsm-ai-secure"
            ) &&
            response.ok &&
            currentUser
          ) {

            const request =
              parseFetchBody(
                args[1]
              );

            const copy =
              response.clone();

            copy
              .json()
              .then(
                async (
                  payload
                ) => {

                  if (
                    !payload?.ok
                  ) {
                    return;
                  }

                  try {

                    await sb
                      .from(
                        "ai_analysis_history"
                      )
                      .insert({
                        user_id:
                          currentUser.id,

                        request:
                          sanitizeRequest(
                            request
                          ),

                        result:
                          payload.result ||
                          {}
                      });

                  } catch (
                    error
                  ) {
                    console.warn(
                      "FSM: no se pudo guardar historial IA",
                      error
                    );
                  }
                }
              )
              .catch(
                () => {}
              );
          }

        } catch (
          error
        ) {
          console.warn(
            "FSM recorder:",
            error
          );
        }

        return response;
      };
  }

  function parseFetchBody(
    options
  ) {
    try {

      if (
        !options?.body
      ) {
        return {};
      }

      if (
        typeof options.body !==
        "string"
      ) {
        return {};
      }

      return JSON.parse(
        options.body
      );

    } catch (
      error
    ) {
      return {};
    }
  }

  function sanitizeRequest(
    request
  ) {
    if (!request) {
      return {};
    }

    return {
      budget:
        request.budget ??
        null,

      position:
        request.position ??
        null,

      priority:
        request.priority ??
        null
    };
  }

  async function renderSection(
    section
  ) {
    selectedSection =
      section;

    document
      .querySelectorAll(
        ".fsm6-menu button"
      )
      .forEach(
        (button) => {

          button.classList.toggle(
            "active",
            button.dataset.section ===
              section
          );
        }
      );

    const titles = {
      overview: [
        "🏠 Mi resumen",
        "Tu actividad y estado de FSM."
      ],

      favorites: [
        "⭐ Mis favoritos",
        "Jugadores que has guardado."
      ],

      history: [
        "🧠 Historial IA",
        "Tus análisis anteriores."
      ],

      alerts: [
        "🔔 Alertas de mercado",
        "Avisos de precio que has creado."
      ],

      tickets: [
        "🎫 Mis incidencias",
        "Historial de soporte."
      ],

      settings: [
        "⚙️ Ajustes",
        "Personaliza tu experiencia."
      ]
    };

    const info =
      titles[section] ||
      titles.overview;

    $("fsm6Title").textContent =
      info[0];

    $("fsm6Sub").textContent =
      info[1];

    if (
      section ===
      "overview"
    ) {
      await renderOverview();

    } else if (
      section ===
      "favorites"
    ) {
      await renderFavorites();

    } else if (
      section ===
      "history"
    ) {
      await renderHistory();

    } else if (
      section ===
      "alerts"
    ) {
      await renderAlerts();

    } else if (
      section ===
      "tickets"
    ) {
      await renderTickets();

    } else if (
      section ===
      "settings"
    ) {
      await renderSettings();
    }
  }

  async function loadUserData() {
    await loadUser();

    if (!currentUser) {
      return;
    }

    await loadFavoriteIds();

    refreshFavoriteButtons();
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
      console.error(
        "FSM Fase 6: Supabase no disponible."
      );

      return;
    }

    addStyles();
    addToast();
    createPanel();
    addOpenButton();

    await loadUser();

    installFetchRecorder();

    sb.auth.onAuthStateChange(
      () => {

        setTimeout(
          async () => {

            await loadUser();
            await loadFavoriteIds();
            refreshFavoriteButtons();

          },
          0
        );
      }
    );

    const observer =
      new MutationObserver(
        () => {
          refreshFavoriteButtons();
        }
      );

    observer.observe(
      document.body,
      {
        childList:
          true,
        subtree:
          true
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
