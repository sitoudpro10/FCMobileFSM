(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const SUPABASE_URL = "https://jshevgjyweoianpbbjdl.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";
  const FSM_AI_URL = `${SUPABASE_URL}/functions/v1/fsm-ai-secure`;
  const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  const state = {
    players: Array.isArray(window.FSM_PLAYERS) ? window.FSM_PLAYERS : [],
    uses: 0,
    pro: false,
    squad: []
  };

  let currentUser = null;
  let searchQuery = "";

  function esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function money(v) {
    const n = Number(v) || 0;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${Math.round(n / 1e6)}M`;
    return new Intl.NumberFormat("es-ES").format(n);
  }

  function toast(message) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 2800);
  }

  function go(id) {
    const page = $(id);
    if (!page) return;

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    page.classList.add("active");

    document.querySelectorAll("[data-page]").forEach(b => {
      b.classList.toggle("active", b.dataset.page === id);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function players() {
    return Array.isArray(window.FSM_PLAYERS)
      ? window.FSM_PLAYERS
      : state.players;
  }

  function card(p) {
    return `
      <article class="card">
        <div class="art">
          <div class="ovr">${esc(p.ovr)}</div>
          <div class="pos">${esc(p.pos)}</div>
          <div class="crest">${esc(String(p.club || "").slice(0, 2).toUpperCase())}</div>
          <div class="face">${esc(p.country || "")}</div>
          <div class="flag">${esc(p.country || "")}</div>
        </div>

        <h3>${esc(p.name)}</h3>

        <p class="sub">
          ${esc(p.club || "Sin club")}
        </p>

        <div class="stats">
          <span>RIT ${esc(p.pace)}</span>
          <span>TIR ${esc(p.shoot)}</span>
          <span>PAS ${esc(p.pass)}</span>
          <span>REG ${esc(p.dribble)}</span>
          <span>DEF ${esc(p.def)}</span>
          <span>FIS ${esc(p.phys)}</span>
        </div>

        <div class="price">
          🪙 ${money(p.price)}
        </div>
      </article>
    `;
  }

  function optionHtml() {
    return `<option value="">Seleccionar...</option>` +
      players()
        .map(p =>
          `<option value="${esc(p.id)}">
            ${esc(p.name)} · ${esc(p.pos)}
          </option>`
        )
        .join("");
  }

  function renderPlayers() {
    state.players = players();

    const q = searchQuery.trim().toLowerCase();

    const filtered = q
      ? state.players.filter(p =>
          `${p.name}
           ${p.club || ""}
           ${p.pos || ""}
           ${p.league || ""}
           ${p.program || ""}`
            .toLowerCase()
            .includes(q)
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
        `<div class="notice">No hay resultados.</div>`;
    }

    const opts = optionHtml();

    for (const id of [
      "playerA",
      "playerB",
      "marketPlayer"
    ]) {
      const el = $(id);
      if (el) el.innerHTML = opts;
    }
  }

  function setAuthUi() {
    if ($("authBox")) {
      $("authBox").style.display =
        currentUser ? "none" : "";
    }

    if ($("loggedBox")) {
      $("loggedBox").style.display =
        currentUser ? "block" : "none";
    }

    if ($("accountBtn")) {
      $("accountBtn").textContent =
        currentUser
          ? `👤 ${(currentUser.email || "").split("@")[0]}`
          : "👤 Cuenta";
    }

    if ($("userEmail") && currentUser) {
      $("userEmail").textContent =
        currentUser.email || "";
    }

    if ($("planText")) {
      $("planText").textContent =
        state.pro ? "FSM PRO" : "FREE";
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
              Math.min(100, state.uses * 50)
            )}%`;
    }
  }

  async function loadProfile(user) {
    currentUser = user || null;

    if (!currentUser) {
      state.uses = 0;
      state.pro = false;
      setAuthUi();
      return;
    }

    try {
      const { data, error } =
        await supabaseClient
          .from("profiles")
          .select("free_uses,is_pro")
          .eq("id", currentUser.id)
          .maybeSingle();

      if (error) throw error;

      state.uses =
        Number(data?.free_uses ?? 0);

      state.pro =
        Boolean(data?.is_pro);

    } catch (error) {
      console.error(
        "FSM perfil:",
        error
      );

      state.uses = 0;
      state.pro = false;
    }

    setAuthUi();
  }

  function authError(message) {
    const text =
      String(message || "").toLowerCase();

    if (text.includes("rate limit")) {
      return "Supabase ha limitado temporalmente los correos. Espera un poco.";
    }

    if (text.includes("email not confirmed")) {
      return "Tu correo todavía no está confirmado. Revisa tu email.";
    }

    if (text.includes("invalid login credentials")) {
      return "Ese correo o contraseña no son correctos.";
    }

    if (text.includes("password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    return (
      message ||
      "No se pudo completar la operación."
    );
  }

  async function auth() {
    if (!supabaseClient) {
      return toast(
        "Supabase no está disponible."
      );
    }

    const email =
      ($("email")?.value || "")
        .trim()
        .toLowerCase();

    const password =
      $("password")?.value || "";

    const button =
      $("authSubmit");

    if (!email || !password) {
      return toast(
        "Completa el email y la contraseña."
      );
    }

    if (password.length < 6) {
      return toast(
        "La contraseña debe tener al menos 6 caracteres."
      );
    }

    if (button) {
      button.disabled = true;
      button.textContent =
        "CONECTANDO...";
    }

    try {
      const signup =
        await supabaseClient.auth.signUp({
          email,
          password
        });

      if (!signup.error) {
        if (
          signup.data?.session &&
          signup.data?.user
        ) {
          await loadProfile(
            signup.data.user
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

        return;
      }

      const m =
        String(
          signup.error.message || ""
        ).toLowerCase();

      const exists =
        m.includes("already registered") ||
        m.includes("user already exists") ||
        m.includes("already been registered");

      if (!exists) {
        return toast(
          authError(
            signup.error.message
          )
        );
      }

      const login =
        await supabaseClient.auth
          .signInWithPassword({
            email,
            password
          });

      if (login.error) {
        return toast(
          authError(
            login.error.message
          )
        );
      }

      await loadProfile(
        login.data.user
      );

      toast("Sesión iniciada.");

      go("account");

    } catch (error) {
      console.error(
        "FSM Auth:",
        error
      );

      toast(
        "Error al conectar con la autenticación."
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "CREAR / ENTRAR";
      }
    }
  }

  async function logout() {
    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      return toast(
        "No se pudo cerrar la sesión."
      );
    }

    await loadProfile(null);

    toast("Sesión cerrada.");

    go("home");
  }

  function compare() {
    const all = players();

    const a =
      all.find(
        p =>
          String(p.id) ===
          String(
            $("playerA")?.value
          )
      );

    const b =
      all.find(
        p =>
          String(p.id) ===
          String(
            $("playerB")?.value
          )
      );

    if (!a || !b) {
      $("compareOut").innerHTML =
        `<div class="notice">
          Selecciona dos jugadores.
        </div>`;

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

    const box = p => `
      <div class="panel">

        <h2>
          ${esc(p.country || "")}
          ${esc(p.name)}
        </h2>

        ${rows.map(
          ([label, key]) => `
            <div class="metric">
              <span class="muted">
                ${label}
              </span>

              <b>
                ${esc(
                  p[key] ?? "-"
                )}
              </b>
            </div>
          `
        ).join("")}

        <p class="price">
          🪙 ${money(p.price)}
        </p>

      </div>
    `;

    $("compareOut").innerHTML =
      `<div class="compare">
        ${box(a)}
        ${box(b)}
      </div>`;
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

    $("formation").innerHTML =
      positions
        .map(
          pos => `
            <div class="spot ${pos}">

              <select data-slot>
                ${optionHtml()}
              </select>

              <span>
                ${pos.toUpperCase()}
              </span>

            </div>
          `
        )
        .join("");

    document
      .querySelectorAll(
        "[data-slot]"
      )
      .forEach(
        (el, i) => {
          el.value =
            state.squad[i] || "";
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
        el => el.value
      );

    const selected =
      state.squad
        .map(
          id =>
            players().find(
              p =>
                String(p.id) ===
                String(id)
            )
        )
        .filter(Boolean);

    if (!selected.length) {
      $("squadSummary").innerHTML =
        `<div class="notice">
          Selecciona jugadores antes de analizar.
        </div>`;

      return;
    }

    const avg =
      selected.reduce(
        (s, p) =>
          s +
          Number(
            p.ovr || 0
          ),
        0
      ) /
      selected.length;

    const attack =
      selected.reduce(
        (s, p) =>
          s +
          (
            (
              Number(p.pace || 0) +
              Number(p.shoot || 0) +
              Number(p.dribble || 0)
            ) / 3
          ),
        0
      ) /
      selected.length;

    const defense =
      selected.reduce(
        (s, p) =>
          s +
          Number(
            p.def || 0
          ),
        0
      ) /
      selected.length;

    $("squadSummary").innerHTML = `
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
            ${avg.toFixed(1)}
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

  function market() {
    const p =
      players().find(
        x =>
          String(x.id) ===
          String(
            $("marketPlayer")
              ?.value
          )
      );

    const value =
      Number(
        $("marketPrice")
          ?.value || 0
      );

    if (!p || value <= 0) {
      $("marketOut").innerHTML =
        `<div class="notice">
          Selecciona jugador y precio.
        </div>`;

      return;
    }

    const ratio =
      value /
      Math.max(
        Number(p.price || 1),
        1
      );

    const label =
      ratio < 0.9
        ? "🟢 BUENA COMPRA"
        : ratio < 1.08
          ? "🟡 PRECIO NORMAL"
          : "🔴 CARO";

    $("marketOut").innerHTML = `
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
            🪙 ${money(p.price)}
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

    const pos =
      $("recPos")?.value || "";

    const priority =
      $("priority")?.value ||
      "value";

    const button =
      $("recommend");

    if (budget <= 0) {
      return toast(
        "Escribe un presupuesto válido."
      );
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
        return toast(
          "Tu sesión ha caducado. Inicia sesión otra vez."
        );
      }

      const candidates =
        players()
          .filter(
            p =>
              Number(p.price) <=
                budget &&
              p.pos === pos
          )
          .sort(
            (a, b) => {

              const av =
                priority === "value"
                  ? Number(a.ovr || 0) /
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

              const bv =
                priority === "value"
                  ? Number(b.ovr || 0) /
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

              return bv - av;
            }
          )
          .slice(0, 11);

      if (!candidates.length) {
        $("results").innerHTML =
          `<div class="notice">
            No hay jugadores que cumplan esos filtros.
          </div>`;

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
                position:
                  pos,
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
        return toast(
          authError(
            payload.error ||
              "No se pudo realizar el análisis."
          )
        );
      }

      state.uses =
        Number(
          payload
            .usage
            ?.remaining ??
          state.uses
        );

      state.pro =
        Boolean(
          payload
            .usage
            ?.pro ??
          state.pro
        );

      setAuthUi();

      const result =
        payload.result ||
        {};

      const advice =
        Array.isArray(
          result.advice
        )
          ? result.advice
          : [];

      $("resultTitle").textContent =
        state.pro
          ? "Resultado FSM PRO"
          : "Resultado FSM";

      $("results").innerHTML = `
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
              x =>
                `<p class="muted">
                  💡 ${esc(x)}
                </p>`
            )
            .join("")}

        </div>
      `;

    } catch (error) {

      console.error(
        "FSM IA:",
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
      ?.classList.add(
        "show"
      );
  }

  function closePro() {
    $("modal")
      ?.classList.remove(
        "show"
      );
  }

  function bindEvents() {

    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(
        b =>
          b.onclick =
            () =>
              go(
                b.dataset.page
              )
      );

    document
      .querySelectorAll(
        "[data-go]"
      )
      .forEach(
        b =>
          b.onclick =
            () =>
              go(
                b.dataset.go
              )
      );

    $("playerSearch")
      ?.addEventListener(
        "input",
        e => {

          searchQuery =
            e.target.value ||
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
        compare
      );

    $("marketBtn")
      ?.addEventListener(
        "click",
        market
      );

    $("saveSquad")
      ?.addEventListener(
        "click",
        saveSquad
      );

    $("accountBtn")
      ?.addEventListener(
        "click",
        () =>
          go("account")
      );

    $("authSubmit")
      ?.addEventListener(
        "click",
        auth
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

    bindEvents();

    setAuthUi();

    window.addEventListener(
      "fsm:players-ready",
      event => {

        state.players =
          Array.isArray(
            event.detail?.players
          )
            ? event.detail.players
            : players();

        renderPlayers();

        if ($("formation")) {
          buildSquad();
        }

        console.info(
          `FSM: catálogo actualizado (${state.players.length} jugadores) desde ${event.detail?.source || "unknown"}.`
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
          console.error
        );
    }
  }

  window.addEventListener(
    "DOMContentLoaded",
    init
  );

})();
