(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const SITE_URL =
    "https://fc-mobile-fsm.vercel.app/";

  const FSM_AI_URL =
    `${SUPABASE_URL}/functions/v1/fsm-ai-secure`;

  const supabaseClient =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

  const state = {
    players: Array.isArray(window.FSM_PLAYERS)
      ? window.FSM_PLAYERS
      : [],
    uses: 0,
    pro: false,
    squad: []
  };

  let currentUser = null;
  let searchQuery = "";

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function money(value) {
    const n = Number(value) || 0;

    if (n >= 1e9) {
      return `${(n / 1e9).toFixed(1)}B`;
    }

    if (n >= 1e6) {
      return `${Math.round(n / 1e6)}M`;
    }

    return new Intl.NumberFormat("es-ES").format(n);
  }

  function toast(message) {
    const element = $("toast");

    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(element._timer);

    element._timer = setTimeout(() => {
      element.classList.remove("show");
    }, 3000);
  }

  function go(id) {
    const page = $(id);

    if (!page) {
      return;
    }

    document
      .querySelectorAll(".page")
      .forEach((element) => {
        element.classList.remove("active");
      });

    page.classList.add("active");

    document
      .querySelectorAll("[data-page]")
      .forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.page === id
        );
      });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function getPlayers() {
    if (Array.isArray(window.FSM_PLAYERS)) {
      return window.FSM_PLAYERS;
    }

    return state.players;
  }

  function card(player) {
    return `
      <article class="card">

        <div class="art">
          <div class="ovr">${esc(player.ovr)}</div>
          <div class="pos">${esc(player.pos)}</div>
          <div class="crest">
            ${esc(
              String(player.club || "")
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>
          <div class="face">
            ${esc(player.country || "")}
          </div>
          <div class="flag">
            ${esc(player.country || "")}
          </div>
        </div>

        <h3>${esc(player.name)}</h3>

        <p class="sub">
          ${esc(player.club || "Sin club")}
        </p>

        <div class="stats">
          <span>RIT ${esc(player.pace)}</span>
          <span>TIR ${esc(player.shoot)}</span>
          <span>PAS ${esc(player.pass)}</span>
          <span>REG ${esc(player.dribble)}</span>
          <span>DEF ${esc(player.def)}</span>
          <span>FIS ${esc(player.phys)}</span>
        </div>

        <div class="price">
          🪙 ${money(player.price)}
        </div>

      </article>
    `;
  }

  function playerOptions() {
    return (
      `<option value="">Seleccionar...</option>` +
      getPlayers()
        .map(
          (player) => `
            <option value="${esc(player.id)}">
              ${esc(player.name)} · ${esc(player.pos)}
            </option>
          `
        )
        .join("")
    );
  }

  function renderPlayers() {
    state.players = getPlayers();

    const query =
      searchQuery
        .trim()
        .toLowerCase();

    const filtered = query
      ? state.players.filter((player) =>
          `
            ${player.name || ""}
            ${player.club || ""}
            ${player.pos || ""}
            ${player.league || ""}
            ${player.program || ""}
          `
            .toLowerCase()
            .includes(query)
        )
      : state.players;

    if ($("featured")) {
      $("featured").innerHTML =
        state.players
          .slice(0, 5)
          .map(card)
          .join("");
    }

    if ($("allPlayers")) {
      $("allPlayers").innerHTML =
        filtered.map(card).join("") ||
        `
          <div class="notice">
            No hay resultados.
          </div>
        `;
    }

    const options = playerOptions();

    [
      "playerA",
      "playerB",
      "marketPlayer"
    ].forEach((id) => {
      const element = $(id);

      if (element) {
        element.innerHTML = options;
      }
    });
  }

  function updateAuthUI() {
    if ($("authBox")) {
      $("authBox").style.display =
        currentUser ? "none" : "";
    }

    if ($("loggedBox")) {
      $("loggedBox").style.display =
        currentUser
          ? "block"
          : "none";
    }

    if ($("accountBtn")) {
      $("accountBtn").textContent =
        currentUser
          ? `👤 ${
              (currentUser.email || "")
                .split("@")[0]
            }`
          : "👤 Cuenta";
    }

    if ($("userEmail") && currentUser) {
      $("userEmail").textContent =
        currentUser.email || "";
    }

    if ($("planText")) {
      $("planText").textContent =
        state.pro
          ? "FSM PRO"
          : "FREE";
    }

    if ($("remainingAccount")) {
      $("remainingAccount").textContent =
        state.pro
          ? "Ilimitado"
          : String(state.uses);
    }

    if ($("usage")) {
      $("usage").textContent =
        state.pro
          ? "⭐ PRO · ilimitado"
          : `🎟️ ${state.uses}/2`;
    }

    if ($("remaining")) {
      $("remaining").textContent =
        state.pro
          ? "Análisis ilimitados"
          : `${state.uses} análisis restantes`;
    }

    if ($("bar")) {
      $("bar").style.width =
        state.pro
          ? "100%"
          : `${Math.max(
              0,
              Math.min(
                100,
                state.uses * 50
              )
            )}%`;
    }
  }

  async function loadProfile(user) {
    currentUser = user || null;

    if (!currentUser) {
      state.uses = 0;
      state.pro = false;
      updateAuthUI();
      return;
    }

    try {
      const { data, error } =
        await supabaseClient
          .from("profiles")
          .select("free_uses,is_pro")
          .eq("id", currentUser.id)
          .maybeSingle();

      if (error) {
        throw error;
      }

      state.uses =
        Number(data?.free_uses ?? 0);

      state.pro =
        Boolean(data?.is_pro);

    } catch (error) {
      console.error(
        "FSM - Error cargando perfil:",
        error
      );

      state.uses = 0;
      state.pro = false;
    }

    updateAuthUI();
  }

  function friendlyAuthError(message) {
    const text =
      String(message || "")
        .toLowerCase();

    if (text.includes("rate limit")) {
      return "Supabase ha limitado temporalmente los correos. Espera unos minutos.";
    }

    if (text.includes("email not confirmed")) {
      return "Tu correo todavía no está confirmado. Revisa tu email.";
    }

    if (text.includes("invalid login credentials")) {
      return "El correo o la contraseña no son correctos.";
    }

    if (
      text.includes("already registered") ||
      text.includes("user already exists") ||
      text.includes("already been registered")
    ) {
      return "Ese correo ya tiene una cuenta. Pulsa ENTRAR.";
    }

    if (
      text.includes("password should be at least")
    ) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    return (
      message ||
      "No se pudo completar la operación."
    );
  }

  async function registerAccount() {
    if (!supabaseClient) {
      toast(
        "Supabase no está disponible."
      );
      return;
    }

    const email =
      ($("email")?.value || "")
        .trim()
        .toLowerCase();

    const password =
      $("password")?.value || "";

    const button =
      $("authCreate");

    if (!email || !password) {
      toast(
        "Completa el email y la contraseña."
      );
      return;
    }

    if (password.length < 6) {
      toast(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent =
        "CREANDO...";
    }

    try {
      const result =
        await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: SITE_URL
          }
        });

      if (result.error) {
        toast(
          friendlyAuthError(
            result.error.message
          )
        );
        return;
      }

      if (
        result.data?.session &&
        result.data?.user
      ) {
        await loadProfile(
          result.data.user
        );

        toast(
          "Cuenta creada correctamente."
        );

        go("account");
      } else {
        toast(
          "Cuenta creada. Revisa tu correo para confirmar la cuenta."
        );
      }

    } catch (error) {
      console.error(
        "FSM - Registro:",
        error
      );

      toast(
        "Error al crear la cuenta."
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "CREAR CUENTA";
      }
    }
  }

  async function loginAccount() {
    if (!supabaseClient) {
      toast(
        "Supabase no está disponible."
      );
      return;
    }

    const email =
      ($("email")?.value || "")
        .trim()
        .toLowerCase();

    const password =
      $("password")?.value || "";

    const button =
      $("authLogin");

    if (!email || !password) {
      toast(
        "Completa el email y la contraseña."
      );
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent =
        "ENTRANDO...";
    }

    try {
      const result =
        await supabaseClient.auth
          .signInWithPassword({
            email,
            password
          });

      if (result.error) {
        toast(
          friendlyAuthError(
            result.error.message
          )
        );
        return;
      }

      await loadProfile(
        result.data.user
      );

      toast(
        "Sesión iniciada."
      );

      go("account");

    } catch (error) {
      console.error(
        "FSM - Login:",
        error
      );

      toast(
        "Error al iniciar sesión."
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "ENTRAR";
      }
    }
  }

  async function logout() {
    if (!supabaseClient) {
      return;
    }

    const { error } =
      await supabaseClient.auth
        .signOut();

    if (error) {
      toast(
        "No se pudo cerrar la sesión."
      );
      return;
    }

    await loadProfile(null);

    toast(
      "Sesión cerrada."
    );

    go("home");
  }

  function comparePlayers() {
    const all =
      getPlayers();

    const playerA =
      all.find(
        (player) =>
          String(player.id) ===
          String(
            $("playerA")?.value
          )
      );

    const playerB =
      all.find(
        (player) =>
          String(player.id) ===
          String(
            $("playerB")?.value
          )
      );

    if (!playerA || !playerB) {
      $("compareOut").innerHTML =
        `
          <div class="notice">
            Selecciona dos jugadores.
          </div>
        `;

      return;
    }

    const rows = [
      ["GRL", "ovr"],
      ["Ritmo", "pace"],
      ["Tiro", "shoot"],
      ["Pase", "pass"],
      ["Regate", "dribble"],
      ["Defensa", "def"],
      ["Físico", "phys"]
    ];

    const renderBox =
      (player) => `
        <div class="panel">

          <h2>
            ${esc(player.country || "")}
            ${esc(player.name)}
          </h2>

          ${rows
            .map(
              ([label, key]) => `
                <div class="metric">
                  <span class="muted">
                    ${label}
                  </span>

                  <b>
                    ${esc(
                      player[key] ?? "-"
                    )}
                  </b>
                </div>
              `
            )
            .join("")}

          <p class="price">
            🪙 ${money(player.price)}
          </p>

        </div>
      `;

    $("compareOut").innerHTML =
      `
        <div class="compare">
          ${renderBox(playerA)}
          ${renderBox(playerB)}
        </div>
      `;
  }

  function buildSquad() {
    const positions = [
      "gk",
      "lb",
      "cb1",
      "cb2",
      "rb",
      "cm1",
      "cm2",
      "cam",
      "lw",
      "rw",
      "st"
    ];

    const formation =
      $("formation");

    if (!formation) {
      return;
    }

    formation.innerHTML =
      positions
        .map(
          (position) => `
            <div class="spot ${position}">

              <select data-slot>
                ${playerOptions()}
              </select>

              <span>
                ${position.toUpperCase()}
              </span>

            </div>
          `
        )
        .join("");

    document
      .querySelectorAll("[data-slot]")
      .forEach(
        (element, index) => {
          element.value =
            state.squad[index] || "";
        }
      );
  }

  function saveSquad() {
    state.squad =
      [
        ...document
          .querySelectorAll(
            "[data-slot]"
          )
      ].map(
        (element) =>
          element.value
      );

    const selected =
      state.squad
        .map(
          (id) =>
            getPlayers().find(
              (player) =>
                String(player.id) ===
                String(id)
            )
        )
        .filter(Boolean);

    if (!selected.length) {
      $("squadSummary").innerHTML =
        `
          <div class="notice">
            Selecciona jugadores antes de analizar.
          </div>
        `;

      return;
    }

    const average =
      selected.reduce(
        (sum, player) =>
          sum +
          Number(
            player.ovr || 0
          ),
        0
      ) / selected.length;

    const attack =
      selected.reduce(
        (sum, player) =>
          sum +
          (
            (
              Number(
                player.pace || 0
              ) +
              Number(
                player.shoot || 0
              ) +
              Number(
                player.dribble || 0
              )
            ) / 3
          ),
        0
      ) / selected.length;

    const defense =
      selected.reduce(
        (sum, player) =>
          sum +
          Number(
            player.def || 0
          ),
        0
      ) / selected.length;

    $("squadSummary").innerHTML =
      `
        <div
          class="pro"
          style="padding:14px;border-radius:12px"
        >

          <h3>
            🧠 Análisis de plantilla
          </h3>

          <p>
            GRL medio:
            <b>
              ${average.toFixed(1)}
            </b>
          </p>

          <p>
            Ataque:
            <b>
              ${attack.toFixed(1)}
            </b>

            · Defensa:
            <b>
              ${defense.toFixed(1)}
            </b>
          </p>

          <p class="muted">
            ${
              defense < 75
                ? "Prioridad: reforzar la defensa."
                : attack < 82
                  ? "Prioridad: mejorar el ataque."
                  : "Plantilla bastante equilibrada."
            }
          </p>

        </div>
      `;
  }

  function analyzeMarket() {
    const player =
      getPlayers().find(
        (item) =>
          String(item.id) ===
          String(
            $("marketPlayer")?.value
          )
      );

    const value =
      Number(
        $("marketPrice")?.value || 0
      );

    if (!player || value <= 0) {
      $("marketOut").innerHTML =
        `
          <div class="notice">
            Selecciona jugador y precio.
          </div>
        `;

      return;
    }

    const ratio =
      value /
      Math.max(
        Number(
          player.price || 1
        ),
        1
      );

    const label =
      ratio < 0.9
        ? "🟢 BUENA COMPRA"
        : ratio < 1.08
          ? "🟡 PRECIO NORMAL"
          : "🔴 CARO";

    $("marketOut").innerHTML =
      `
        <div
          class="pro"
          style="padding:14px;border-radius:12px"
        >

          <h2>
            ${label}
          </h2>

          <p>
            Precio introducido:
            <b>
              🪙 ${money(value)}
            </b>
          </p>

          <p>
            Referencia:
            <b>
              🪙 ${money(player.price)}
            </b>
          </p>

          <p class="muted">
            El precio de referencia es de demostración
            hasta conectar la fuente real.
          </p>

        </div>
      `;
  }

  async function recommend() {
    if (!currentUser) {
      toast(
        "Inicia sesión para usar FSM IA."
      );

      go("account");

      return;
    }

    const budget =
      Number(
        $("budget")?.value || 0
      );

    const position =
      $("recPos")?.value || "";

    const priority =
      $("priority")?.value ||
      "value";

    const button =
      $("recommend");

    if (budget <= 0) {
      toast(
        "Escribe un presupuesto válido."
      );

      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent =
        "🤖 ANALIZANDO...";
    }

    try {
      const { data } =
        await supabaseClient.auth
          .getSession();

      const session =
        data?.session;

      if (!session) {
        toast(
          "Tu sesión ha caducado. Inicia sesión otra vez."
        );

        return;
      }

      const candidates =
        getPlayers()
          .filter(
            (player) =>
              Number(
                player.price
              ) <= budget &&
              player.pos === position
          )
          .sort(
            (a, b) => {

              const scoreA =
                priority === "value"
                  ? Number(
                      a.ovr || 0
                    ) /
                    Math.max(
                      Number(
                        a.price || 1
                      ),
                      1
                    )
                  : Number(
                      a[priority] ||
                      a.ovr ||
                      0
                    );

              const scoreB =
                priority === "value"
                  ? Number(
                      b.ovr || 0
                    ) /
                    Math.max(
                      Number(
                        b.price || 1
                      ),
                      1
                    )
                  : Number(
                      b[priority] ||
                      b.ovr ||
                      0
                    );

              return (
                scoreB -
                scoreA
              );
            }
          )
          .slice(0, 11);

      if (!candidates.length) {
        $("results").innerHTML =
          `
            <div class="notice">
              No hay jugadores que cumplan esos filtros.
            </div>
          `;

        return;
      }

      const response =
        await fetch(
          FSM_AI_URL,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,

              apikey:
                SUPABASE_PUBLISHABLE_KEY,

              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                players:
                  candidates,
                budget,
                position,
                priority
              })
          }
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        !response.ok ||
        !payload.ok
      ) {
        toast(
          friendlyAuthError(
            payload.error ||
              "No se pudo realizar el análisis."
          )
        );

        return;
      }

      state.uses =
        Number(
          payload.usage?.remaining ??
            state.uses
        );

      state.pro =
        Boolean(
          payload.usage?.pro ??
            state.pro
        );

      updateAuthUI();

      const result =
        payload.result || {};

      const advice =
        Array.isArray(
          result.advice
        )
          ? result.advice
          : [];

      if ($("resultTitle")) {
        $("resultTitle").textContent =
          state.pro
            ? "Resultado FSM PRO"
            : "Resultado FSM";
      }

      $("results").innerHTML =
        `
          <div
            class="pro"
            style="padding:14px;border-radius:12px"
          >

            <h3>
              🧠 FSM-AI
              ${esc(
                result.version ||
                  "1.0"
              )}
            </h3>

            <p>
              Puntuación FSM:
              <b>
                ${esc(
                  result.score ??
                    "-"
                )}
              </b>
            </p>

            <p>
              GRL:
              <b>
                ${esc(
                  result.metrics
                    ?.overall ??
                    "-"
                )}
              </b>

              · Ataque:
              <b>
                ${esc(
                  result.metrics
                    ?.attack ??
                    "-"
                )}
              </b>

              · Pase:
              <b>
                ${esc(
                  result.metrics
                    ?.passing ??
                    "-"
                )}
              </b>

              · Defensa:
              <b>
                ${esc(
                  result.metrics
                    ?.defending ??
                    "-"
                )}
              </b>

              · Físico:
              <b>
                ${esc(
                  result.metrics
                    ?.physical ??
                    "-"
                )}
              </b>
            </p>

            <p>
              Prioridad:
              <b>
                ${esc(
                  result.priority ??
                    "-"
                )}
              </b>
            </p>

            ${advice
              .map(
                (item) => `
                  <p class="muted">
                    💡 ${esc(item)}
                  </p>
                `
              )
              .join("")}

          </div>
        `;

    } catch (error) {
      console.error(
        "FSM - IA:",
        error
      );

      toast(
        "No se pudo conectar con FSM IA."
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "🔎 USAR 1 ANÁLISIS";
      }
    }
  }

  function openPro() {
    $("modal")
      ?.classList.add("show");
  }

  function closePro() {
    $("modal")
      ?.classList.remove("show");
  }

  function createSeparatedAuthButtons() {
    const oldButton =
      $("authSubmit");

    if (!oldButton) {
      return;
    }

    if (
      $("authCreate") ||
      $("authLogin")
    ) {
      return;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "auth-actions";

    wrapper.style.display =
      "grid";

    wrapper.style.gridTemplateColumns =
      "1fr 1fr";

    wrapper.style.gap =
      "12px";

    wrapper.style.marginTop =
      "12px";

    const createButton =
      document.createElement(
        "button"
      );

    createButton.id =
      "authCreate";

    createButton.type =
      "button";

    createButton.className =
      "btn primary";

    createButton.textContent =
      "CREAR CUENTA";

    createButton.addEventListener(
      "click",
      registerAccount
    );

    const loginButton =
      document.createElement(
        "button"
      );

    loginButton.id =
      "authLogin";

    loginButton.type =
      "button";

    loginButton.className =
      "btn";

    loginButton.textContent =
      "ENTRAR";

    loginButton.addEventListener(
      "click",
      loginAccount
    );

    wrapper.append(
      createButton,
      loginButton
    );

    oldButton.replaceWith(
      wrapper
    );
  }

  function handleAuthCallback() {
    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    const params =
      new URLSearchParams(
        hash.replace(/^#/, "")
      );

    const errorCode =
      params.get(
        "error_code"
      );

    const description =
      params.get(
        "error_description"
      );

    if (
      !errorCode &&
      !description
    ) {
      return;
    }

    const text =
      String(
        description || ""
      ).replaceAll(
        "+",
        " "
      );

    if (
      errorCode ===
        "otp_expired" ||
      /invalid|expired/i.test(
        text
      )
    ) {
      toast(
        "El enlace de confirmación ha caducado o ya fue utilizado. Solicita un correo nuevo."
      );
    } else {
      toast(
        text ||
          "No se pudo completar la confirmación."
      );
    }

    history.replaceState(
      {},
      document.title,
      window.location.pathname +
        window.location.search
    );
  }

  function bindEvents() {
    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () =>
              go(
                button.dataset.page
              );
        }
      );

    document
      .querySelectorAll(
        "[data-go]"
      )
      .forEach(
        (button) => {

          button.onclick =
            () =>
              go(
                button.dataset.go
              );
        }
      );

    $("playerSearch")
      ?.addEventListener(
        "input",
        (event) => {

          searchQuery =
            event.target.value ||
            "";

          go("players");

          renderPlayers();
        }
      );

    $("recommend")
      ?.addEventListener(
        "click",
        recommend
      );

    $("compareBtn")
      ?.addEventListener(
        "click",
        comparePlayers
      );

    $("marketBtn")
      ?.addEventListener(
        "click",
        analyzeMarket
      );

    $("saveSquad")
      ?.addEventListener(
        "click",
        saveSquad
      );

    $("accountBtn")
      ?.addEventListener(
        "click",
        () => go("account")
      );

    $("logout")
      ?.addEventListener(
        "click",
        logout
      );

    $("proBtn")
      ?.addEventListener(
        "click",
        openPro
      );

    $("homePro")
      ?.addEventListener(
        "click",
        openPro
      );

    $("accountPro")
      ?.addEventListener(
        "click",
        openPro
      );

    $("modalClose")
      ?.addEventListener(
        "click",
        closePro
      );

    $("activate")
      ?.addEventListener(
        "click",
        () => {

          toast(
            "El pago real se añadirá en la Fase 6."
          );

          closePro();
        }
      );
  }

  function init() {
    renderPlayers();

    if ($("formation")) {
      buildSquad();
    }

    createSeparatedAuthButtons();

    bindEvents();

    handleAuthCallback();

    updateAuthUI();

    window.addEventListener(
      "fsm:players-ready",
      (event) => {

        state.players =
          Array.isArray(
            event.detail?.players
          )
            ? event.detail.players
            : getPlayers();

        renderPlayers();

        if ($("formation")) {
          buildSquad();
        }

        console.info(
          `FSM: catálogo actualizado (${state.players.length} jugadores).`
        );
      }
    );

    if (supabaseClient) {

      supabaseClient.auth
        .onAuthStateChange(
          (_event, session) => {

            setTimeout(
              () =>
                loadProfile(
                  session?.user ||
                    null
                ),
              0
            );
          }
        );

      supabaseClient.auth
        .getSession()
        .then(
          ({ data }) =>
            loadProfile(
              data.session
                ?.user ||
                null
            )
        )
        .catch(
          (error) =>
            console.error(
              "FSM - getSession:",
              error
            )
        );
    }
  }

  window.addEventListener(
    "DOMContentLoaded",
    init
  );

})();
