(() => {
  "use strict";

  /*
    FC MOBILE FSM — APP.JS OPTIMIZADO
    --------------------------------
    Objetivo principal:
    - Mantener miles de jugadores disponibles.
    - Renderizar solo una pequeña ventana de resultados.
    - Evitar crear 10.000+ tarjetas HTML a la vez.
    - Evitar crear 10.000+ <option> en los selects.
    - Búsqueda con debounce.
    - "Cargar más" para ampliar resultados.
    - Mantener Auth, IA, Comparador, Plantilla y Mercado.
  */

  const $ = (id) =>
    document.getElementById(id);

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

  const CONFIG = {
    initialRender: 40,
    renderStep: 40,
    searchRenderLimit: 80,
    pickerLimit: 150,
    searchDebounce: 140,
    playerIndexChunk: 1500
  };

  const state = {
    players: [],
    uses: 0,
    pro: false,
    squad: Array(11).fill(""),
    renderedCount: CONFIG.initialRender,
    filteredPlayers: [],
    searchIndex: [],
    searchQuery: "",
    searchTimer: null,
    aiBusy: false
  };

  let currentUser = null;

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

    if (!n) {
      return "—";
    }

    if (n >= 1e9) {
      return `${(n / 1e9).toFixed(1)}B`;
    }

    if (n >= 1e6) {
      return `${Math.round(n / 1e6)}M`;
    }

    return new Intl.NumberFormat(
      "es-ES"
    ).format(n);
  }

  function toast(message) {
    const element = $("toast");

    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(element._timer);

    element._timer =
      setTimeout(() => {
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

    if (id === "players") {
      renderPlayers();
    }
  }

  function getPlayers() {
    return Array.isArray(window.FSM_PLAYERS)
      ? window.FSM_PLAYERS
      : state.players;
  }

  function normalizePlayer(player) {
    return {
      ...player,
      id: player.id,
      name: String(player.name || "Jugador"),
      club: String(player.club || "Sin club"),
      league: String(player.league || ""),
      country: String(player.country || ""),
      pos: String(player.pos || ""),
      program: String(player.program || ""),
      ovr: Number(player.ovr || 0),
      pace: Number(player.pace || 0),
      shoot: Number(player.shoot || 0),
      pass: Number(player.pass || 0),
      dribble: Number(player.dribble || 0),
      def: Number(player.def || 0),
      phys: Number(player.phys || 0),
      price: Number(player.price || 0)
    };
  }

  function buildSearchIndex() {
    const source = getPlayers();

    state.players =
      Array.isArray(source)
        ? source.map(normalizePlayer)
        : [];

    state.searchIndex =
      state.players.map((player, index) => ({
        index,
        text:
          `${player.name} ${player.club} ${player.league} ${player.country} ${player.pos} ${player.program}`
            .toLowerCase()
      }));

    state.filteredPlayers =
      state.players;

    state.renderedCount =
      CONFIG.initialRender;
  }
const IMAGE_CACHE_KEY = "fsm_player_images_v1";

function loadImageCache() {
  try {
    const raw =
      localStorage.getItem(
        IMAGE_CACHE_KEY
      );

    const data =
      raw
        ? JSON.parse(raw)
        : {};

    return data &&
      typeof data === "object"
      ? data
      : {};
  } catch {
    return {};
  }
}

const imageCache =
  loadImageCache();

function saveImageCache() {
  try {
    localStorage.setItem(
      IMAGE_CACHE_KEY,
      JSON.stringify(imageCache)
    );
  } catch {
    // La caché es opcional
  }
}

function imageKey(player) {
  return (
    String(
      player.id ??
      player.name ??
      ""
    ) +
    "|" +
    String(
      player.name ??
      ""
    )
  );
}

function getStoredImage(player) {
  return (
    player.image ||
    player.photo ||
    imageCache[
      imageKey(player)
    ] ||
    ""
  );
}

async function resolvePlayerImage(player) {
  const stored =
    getStoredImage(player);

  if (stored) {
    return stored;
  }

  const name =
    String(
      player.full_name ||
      player.name ||
      ""
    ).trim();

  if (!name) {
    return "";
  }

  const key =
    imageKey(player);

  if (
    imageCache[key] ===
    "__NONE__"
  ) {
    return "";
  }

  try {
    const url =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;

    const response =
      await fetch(
        url,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json"
          }
        }
      );

    if (!response.ok) {
      imageCache[key] =
        "__NONE__";

      saveImageCache();

      return "";
    }

    const data =
      await response.json();

    const image =
      data?.thumbnail?.source ||
      data?.originalimage?.source ||
      "";

    imageCache[key] =
      image || "__NONE__";

    saveImageCache();

    updateVisiblePlayerImage(
      player,
      image
    );

    return image;

  } catch {
    imageCache[key] =
      "__NONE__";

    saveImageCache();

    return "";
  }
}

function updateVisiblePlayerImage(
  player,
  image
) {
  if (!image) {
    return;
  }

  const id =
    String(
      player.id ??
      ""
    );

  const escapedId =
    window.CSS?.escape
      ? CSS.escape(id)
      : id.replace(
          /[^a-zA-Z0-9_-]/g,
          "\\$&"
        );

  const elements =
    document.querySelectorAll(
      `[data-player-id="${escapedId}"]`
    );

  elements.forEach(
    (cardElement) => {
      const picture =
        cardElement.querySelector(
          ".fsm-player-photo"
        );

      const fallback =
        cardElement.querySelector(
          ".fsm-player-photo-fallback"
        );

      if (!picture) {
        return;
      }

      picture.src =
        image;

      picture.style.display =
        "block";

      picture.onload =
        () => {
          if (fallback) {
            fallback.style.display =
              "none";
          }
        };

      picture.onerror =
        () => {
          picture.style.display =
            "none";

          if (fallback) {
            fallback.style.display =
              "grid";
          }
        };
    }
  );
}

function requestVisibleImages(
  players
) {
  players
    .slice(0, 10)
    .forEach(
      (player) => {
        if (
          getStoredImage(
            player
          )
        ) {
          return;
        }

        void resolvePlayerImage(
          player
        );
      }
    );
}

function addImageStyles() {
  if ($("fsmPlayerImageStyles")) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "fsmPlayerImageStyles";

  style.textContent = `
    .card .art {
      position: relative;
      overflow: hidden;
    }

    .fsm-player-photo {
      z-index: 3;
    }

    .fsm-player-photo-fallback {
      position: absolute;
      inset: 0;
      z-index: 2;
    }

    .card .ovr,
    .card .pos,
    .card .crest,
    .card .flag {
      z-index: 4;
    }
  `;

  document.head.appendChild(
    style
  );
}
 function card(player) {
  const image =
    getStoredImage(player);

  const initials =
    String(
      player.name || "?"
    )
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        part =>
          part[0] || ""
      )
      .join("")
      .toUpperCase();

  return `
    <article
      class="card"
      data-player-id="${esc(player.id)}"
    >

      <div class="art">

        <div class="ovr">
          ${esc(
            player.ovr ||
            "—"
          )}
        </div>

        <div class="pos">
          ${esc(
            player.pos
          )}
        </div>

        <div class="crest">
          ${esc(
            String(
              player.club ||
              ""
            )
              .slice(0, 2)
              .toUpperCase()
          )}
        </div>

        <div
          class="fsm-player-photo-fallback"
          style="
            position:absolute;
            inset:0;
            display:grid;
            place-items:center;
            font-weight:900;
            font-size:28px;
            color:#fff;
          "
        >
          ${esc(initials)}
        </div>

        <img
          class="fsm-player-photo"
          ${
            image
              ? `src="${esc(image)}"`
              : ""
          }
          alt="${esc(
            player.name
          )}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          style="
            position:absolute;
            inset:8px;
            width:calc(100% - 16px);
            height:calc(100% - 16px);
            object-fit:contain;
            display:${
              image
                ? "block"
                : "none"
            };
            pointer-events:none;
          "
        />

        <div class="flag">
          ${esc(
            player.country ||
            ""
          )}
        </div>

      </div>

      <h3>
        ${esc(
          player.name
        )}
      </h3>

      <p class="sub">
        ${esc(
          player.club ||
          "Sin club"
        )}
      </p>

      <div class="stats">

        <span>
          RIT ${esc(
            player.pace
          )}
        </span>

        <span>
          TIR ${esc(
            player.shoot
          )}
        </span>

        <span>
          PAS ${esc(
            player.pass
          )}
        </span>

        <span>
          REG ${esc(
            player.dribble
          )}
        </span>

        <span>
          DEF ${esc(
            player.def
          )}
        </span>

        <span>
          FIS ${esc(
            player.phys
          )}
        </span>

      </div>

      <div class="price">
        🪙 ${money(
          player.price
        )}
      </div>

    </article>
  `;
}

  function renderFeatured() {
    const element = $("featured");

    if (!element) {
      return;
    }

    const featured =
      state.players
        .slice()
        .sort(
          (a, b) =>
            Number(b.ovr) -
            Number(a.ovr)
        )
        .slice(0, 5);

    element.innerHTML =
      featured
        .map(card)
        .join("");

    requestVisibleImages(
  featured
);
  }

  function renderPlayers() {
    const element =
      $("allPlayers");

    if (!element) {
      return;
    }

    const query =
      state.searchQuery.trim();

    if (!query) {
      state.renderedCount =
        Math.max(
          state.renderedCount,
          CONFIG.initialRender
        );
    }

    const visibleCount =
      query
        ? Math.min(
            state.renderedCount,
            CONFIG.searchRenderLimit
          )
        : state.renderedCount;

    const visible =
      state.filteredPlayers
        .slice(
          0,
          visibleCount
        );

    const html =
      visible
        .map(card)
        .join("");

    const remaining =
      state.filteredPlayers.length -
      visible.length;

    const footer =
      remaining > 0
        ? `
          <div
            style="
              width:100%;
              padding:16px 0;
              display:flex;
              flex-direction:column;
              gap:8px;
              align-items:center;
            "
          >

            <small class="muted">
              Mostrando
              ${visible.length}
              de
              ${state.filteredPlayers.length}
            </small>

            <button
              id="loadMorePlayers"
              class="btn"
              type="button"
            >
              Cargar más
            </button>

          </div>
        `
        : `
          <div
            style="
              width:100%;
              padding:16px 0;
              text-align:center;
            "
          >
            <small class="muted">
              ${visible.length}
              resultado(s)
            </small>
          </div>
        `;

    element.innerHTML =
      html ||
      `
        <div class="notice">
          No hay resultados.
        </div>
      `;

    element.insertAdjacentHTML(
      "beforeend",
      footer
    );

    $("loadMorePlayers")?.addEventListener(
      "click",
      () => {
        state.renderedCount +=
          CONFIG.renderStep;

        requestAnimationFrame(
          renderPlayers
        );
      }
    );
  }
  requestVisibleImages(
  visible
);

  function filterPlayers(query) {
    state.searchQuery =
      query
        .trim()
        .toLowerCase();

    if (!state.searchQuery) {
      state.filteredPlayers =
        state.players;

      state.renderedCount =
        CONFIG.initialRender;

      renderPlayers();
      return;
    }

    const results = [];

    for (
      let i = 0;
      i < state.searchIndex.length;
      i++
    ) {
      const entry =
        state.searchIndex[i];

      if (
        entry.text.includes(
          state.searchQuery
        )
      ) {
        results.push(
          state.players[
            entry.index
          ]
        );
      }
    }

    state.filteredPlayers =
      results;

    state.renderedCount =
      Math.min(
        CONFIG.initialRender,
        results.length
      );

    renderPlayers();
  }

  function handlePlayerSearch(value) {
    clearTimeout(
      state.searchTimer
    );

    state.searchTimer =
      setTimeout(() => {
        filterPlayers(value);
      }, CONFIG.searchDebounce);
  }

  function topPickerPlayers() {
    return state.players
      .slice()
      .sort(
        (a, b) =>
          Number(b.ovr) -
          Number(a.ovr)
      )
      .slice(
        0,
        CONFIG.pickerLimit
      );
  }

  function playerOptions(
    includeBlank = true
  ) {
    const players =
      topPickerPlayers();

    const first =
      includeBlank
        ? `<option value="">Seleccionar...</option>`
        : "";

    return (
      first +
      players
        .map(
          (player) => `
            <option value="${esc(
              player.id
            )}">
              ${esc(
                player.name
              )} · ${esc(
                player.pos
              )} · GRL ${esc(
                player.ovr
              )}
            </option>
          `
        )
        .join("")
    );
  }

  function refreshPickers() {
    const options =
      playerOptions();

    [
      "playerA",
      "playerB",
      "marketPlayer"
    ].forEach((id) => {
      const element = $(id);

      if (!element) {
        return;
      }

      const previous =
        element.value;

      element.innerHTML =
        options;

      if (
        [...element.options]
          .some(
            (option) =>
              option.value ===
              previous
          )
      ) {
        element.value =
          previous;
      }
    });
  }

  function updateCatalog() {
    buildSearchIndex();
    renderFeatured();
    renderPlayers();
    refreshPickers();
  }

  function updateAuthUI() {
    if ($("authBox")) {
      $("authBox").style.display =
        currentUser
          ? "none"
          : "";
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
    currentUser =
      user || null;

    if (!currentUser) {
      state.uses = 0;
      state.pro = false;
      updateAuthUI();
      return;
    }

    try {
      if (!supabaseClient) {
        throw new Error(
          "Supabase unavailable"
        );
      }

      const {
        data,
        error
      } =
        await supabaseClient
          .from("profiles")
          .select(
            "free_uses,is_pro"
          )
          .eq(
            "id",
            currentUser.id
          )
          .maybeSingle();

      if (error) {
        throw error;
      }

      state.uses =
        Number(
          data?.free_uses ??
          0
        );

      state.pro =
        Boolean(
          data?.is_pro
        );

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

  function friendlyAuthError(
    message
  ) {
    const text =
      String(
        message || ""
      )
        .toLowerCase();

    if (
      text.includes(
        "rate limit"
      )
    ) {
      return "Supabase ha limitado temporalmente los correos. Espera unos minutos.";
    }

    if (
      text.includes(
        "email not confirmed"
      )
    ) {
      return "Tu correo todavía no está confirmado. Revisa tu email.";
    }

    if (
      text.includes(
        "invalid login credentials"
      )
    ) {
      return "El correo o la contraseña no son correctos.";
    }

    if (
      text.includes(
        "already registered"
      ) ||
      text.includes(
        "user already exists"
      ) ||
      text.includes(
        "already been registered"
      )
    ) {
      return "Ese correo ya tiene una cuenta. Pulsa ENTRAR.";
    }

    if (
      text.includes(
        "password should be at least"
      )
    ) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    return (
      message ||
      "No se pudo completar la operación."
    );
  }

  function ensureAuthButtons() {
    const box =
      $("authBox");

    if (!box) {
      return;
    }

    const oldButton =
      $("authSubmit");

    if (oldButton) {
      oldButton.style.display =
        "none";
    }

    if ($("authLogin") && $("authCreate")) {
      return;
    }

    const container =
      document.createElement(
        "div"
      );

    container.id =
      "fsmAuthButtons";

    container.style.display =
      "grid";

    container.style.gridTemplateColumns =
      "1fr 1fr";

    container.style.gap =
      "8px";

    container.style.marginTop =
      "12px";

    container.innerHTML = `
      <button
        id="authLogin"
        class="btn primary"
        type="button"
      >
        ENTRAR
      </button>

      <button
        id="authCreate"
        class="btn"
        type="button"
      >
        CREAR CUENTA
      </button>
    `;

    box.appendChild(
      container
    );

    $("authLogin").onclick =
      loginAccount;

    $("authCreate").onclick =
      registerAccount;
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

    if (
      password.length <
      6
    ) {
      toast(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (button) {
      button.disabled =
        true;
      button.textContent =
        "CREANDO...";
    }

    try {
      const result =
        await supabaseClient.auth.signUp(
          {
            email,
            password,
            options: {
              emailRedirectTo:
                SITE_URL
            }
          }
        );

      if (
        result.error
      ) {
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
        button.disabled =
          false;

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
      button.disabled =
        true;
      button.textContent =
        "ENTRANDO...";
    }

    try {
      const result =
        await supabaseClient.auth.signInWithPassword(
          {
            email,
            password
          }
        );

      if (
        result.error
      ) {
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
        button.disabled =
          false;

        button.textContent =
          "ENTRAR";
      }
    }
  }

  async function logout() {
    if (!supabaseClient) {
      return;
    }

    const {
      error
    } =
      await supabaseClient.auth.signOut();

    if (error) {
      toast(
        "No se pudo cerrar la sesión."
      );
      return;
    }

    await loadProfile(
      null
    );

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
          String(
            player.id
          ) ===
          String(
            $("playerA")?.value
          )
      );

    const playerB =
      all.find(
        (player) =>
          String(
            player.id
          ) ===
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
            ${esc(
              player.country || ""
            )}
            ${esc(
              player.name
            )}
          </h2>

          ${rows
            .map(
              ([label, key]) => `
                <div
                  class="metric"
                >

                  <span class="muted">
                    ${label}
                  </span>

                  <b>
                    ${esc(
                      player[key] ??
                      "-"
                    )}
                  </b>

                </div>
              `
            )
            .join("")}

          <p class="price">
            🪙 ${money(
              player.price
            )}
          </p>

        </div>
      `;

    $("compareOut").innerHTML =
      `
        <div class="compare">

          ${renderBox(
            playerA
          )}

          ${renderBox(
            playerB
          )}

        </div>
      `;
  }

  function renderSquad() {
    const formation =
      $("formation");

    if (!formation) {
      return;
    }

    const positions = [
      "GK",
      "LB",
      "CB",
      "CB",
      "RB",
      "CDM",
      "CM",
      "CAM",
      "LW",
      "RW",
      "ST"
    ];

    const players =
      topPickerPlayers();

    const options =
      `
        <option value="">
          Seleccionar...
        </option>
      ` +
      players
        .map(
          (player) => `
            <option value="${esc(
              player.id
            )}">
              ${esc(
                player.name
              )} · ${esc(
                player.pos
              )} · ${esc(
                player.ovr
              )}
            </option>
          `
        )
        .join("");

    formation.innerHTML =
      `
        <div
          class="form2"
        >

          ${positions
            .map(
              (
                position,
                index
              ) => `
                <div
                  class="field"
                >

                  <label>
                    ${index + 1}.
                    ${position}
                  </label>

                  <select
                    data-squad-index="${index}"
                  >
                    ${options}
                  </select>

                </div>
              `
            )
            .join("")}

        </div>
      `;

    formation
      .querySelectorAll(
        "[data-squad-index]"
      )
      .forEach(
        (select) => {

          const index =
            Number(
              select.dataset
                .squadIndex
            );

          select.value =
            state.squad[index] ||
            "";

          select.onchange =
            () => {
              state.squad[index] =
                select.value;
            };
        }
      );
  }

  async function saveSquad() {
    const ids =
      state.squad.filter(Boolean);

    if (!currentUser) {
      toast(
        "Inicia sesión para guardar y analizar la plantilla."
      );
      return;
    }

    if (
      ids.length !==
      11
    ) {
      toast(
        "Selecciona los 11 jugadores."
      );
      return;
    }

    const playerMap =
      new Map(
        getPlayers().map(
          (player) => [
            String(
              player.id
            ),
            player
          ]
        )
      );

    const selected =
      ids
        .map(
          (id) =>
            playerMap.get(
              String(id)
            )
        )
        .filter(Boolean);

    if (
      selected.length !==
      11
    ) {
      toast(
        "No se pudieron identificar todos los jugadores."
      );
      return;
    }

    const avg = (key) =>
      selected.reduce(
        (sum, player) =>
          sum +
          Number(
            player[key] ||
            0
          ),
        0
      ) /
      selected.length;

    $("squadSummary").innerHTML =
      `
        <div
          class="notice"
        >
          <b>
            Plantilla guardada
          </b>
          · GRL medio:
          ${avg("ovr").toFixed(1)}
          · Ataque:
          ${(
            (
              avg("pace") +
              avg("shoot") +
              avg("dribble")
            ) / 3
          ).toFixed(1)}
          · Pase:
          ${avg("pass").toFixed(1)}
          · Defensa:
          ${avg("def").toFixed(1)}
          · Físico:
          ${avg("phys").toFixed(1)}
        </div>
      `;

    try {
      await supabaseClient
        ?.from(
          "user_settings"
        )
        .upsert({
          user_id:
            currentUser.id,
          display_name:
            currentUser.email || "",
          favorite_position:
            "4-3-3"
        });

      toast(
        "✅ Plantilla guardada."
      );

    } catch (error) {
      console.warn(
        "FSM squad save:",
        error
      );
    }
  }

  function localRecommendation(
    budget,
    position,
    priority
  ) {
    const candidates =
      getPlayers()
        .filter(
          (player) =>
            (!position ||
              player.pos ===
                position) &&
            (!budget ||
              !player.price ||
              player.price <=
                budget)
        )
        .slice();

    if (!candidates.length) {
      return null;
    }

    candidates.sort(
      (a, b) => {

        if (
          priority ===
          "ovr"
        ) {
          return (
            b.ovr -
            a.ovr
          );
        }

        if (
          priority ===
          "pace"
        ) {
          return (
            b.pace -
            a.pace
          );
        }

        if (
          priority ===
          "shoot"
        ) {
          return (
            b.shoot -
            a.shoot
          );
        }

        if (
          priority ===
          "dribble"
        ) {
          return (
            b.dribble -
            a.dribble
          );
        }

        if (
          priority ===
          "def"
        ) {
          return (
            b.def -
            a.def
          );
        }

        const valueA =
          (a.ovr * 2) /
          Math.max(
            1,
            a.price ||
              1
          );

        const valueB =
          (b.ovr * 2) /
          Math.max(
            1,
            b.price ||
              1
          );

        return (
          valueB -
          valueA
        );
      }
    );

    return candidates.slice(
      0,
      8
    );
  }

  function renderRecommendations(
    players,
    title
  ) {
    if (!players?.length) {
      $("results").innerHTML =
        `
          <div class="notice">
            No encontramos jugadores con esos criterios.
          </div>
        `;
      return;
    }

    $("resultTitle").textContent =
      title ||
      "Resultado FSM";

    $("results").innerHTML =
      `
        <div class="cards">

          ${players
            .slice(
              0,
              8
            )
            .map(card)
            .join("")}

        </div>
      `;
  }

  async function runAI() {
    if (state.aiBusy) {
      return;
    }

    if (!currentUser) {
      toast(
        "Inicia sesión para usar FSM IA."
      );
      return;
    }

    if (
      !state.pro &&
      state.uses <=
        0
    ) {
      toast(
        "No te quedan análisis gratuitos."
      );
      return;
    }

    const budget =
      Number(
        $("budget")?.value ||
        0
      );

    const position =
      $("recPos")?.value ||
      "ST";

    const priority =
      $("priority")?.value ||
      "value";

    const local =
      localRecommendation(
        budget,
        position,
        priority
      );

    if (local) {
      renderRecommendations(
        local,
        "Recomendación FSM"
      );
    }

    state.aiBusy =
      true;

    const button =
      $("recommend");

    if (button) {
      button.disabled =
        true;
      button.textContent =
        "ANALIZANDO...";
    }

    try {
      if (!supabaseClient) {
        throw new Error(
          "Supabase no disponible."
        );
      }

      const {
        data: sessionData
      } =
        await supabaseClient.auth.getSession();

      const token =
        sessionData?.session
          ?.access_token;

      if (!token) {
        throw new Error(
          "Sesión no válida."
        );
      }

      const candidates =
        local?.slice(
          0,
          11
        ) ||
        [];

      const response =
        await fetch(
          FSM_AI_URL,
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              apikey:
                SUPABASE_PUBLISHABLE_KEY,

              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                budget:
                  budget ||
                  undefined,

                position,

                priority,

                players:
                  candidates
              })
          }
        );

      const payload =
        await response.json()
          .catch(() => null);

      if (
        !response.ok ||
        !payload?.ok
      ) {
        throw new Error(
          payload?.error ||
          "FSM IA no pudo completar el análisis."
        );
      }

      const result =
        payload.result;

      if (result) {
        $("results").innerHTML =
          `
            <div
              class="panel"
            >

              <h3>
                🤖 FSM IA
              </h3>

              <p>
                Puntuación:
                <b>
                  ${esc(
                    result.score
                  )}
                </b>
              </p>

              <p>
                Prioridad detectada:
                <b>
                  ${esc(
                    result.priority
                  )}
                </b>
              </p>

              ${
                Array.isArray(
                  result.advice
                )
                  ? `
                      <ul>
                        ${result.advice
                          .map(
                            (text) =>
                              `<li>${esc(
                                text
                              )}</li>`
                          )
                          .join("")}
                      </ul>
                    `
                  : ""
              }

            </div>

            <div
              class="cards"
              style="margin-top:12px"
            >
              ${
                local
                  ?.slice(0, 8)
                  .map(card)
                  .join("") ||
                ""
              }
            </div>
          `;
      }

      if (
        payload.usage &&
        !payload.usage.pro &&
        payload.usage.remaining !==
          null
      ) {
        state.uses =
          Number(
            payload.usage.remaining
          );

        updateAuthUI();
      }

    } catch (error) {
      console.error(
        "FSM IA:",
        error
      );

      if (!local) {
        $("results").innerHTML =
          `
            <div class="notice">
              ${esc(
                error.message ||
                "No se pudo completar el análisis."
              )}
            </div>
          `;
      }

    } finally {
      state.aiBusy =
        false;

      if (button) {
        button.disabled =
          false;
        button.textContent =
          "🔎 USAR 1 ANÁLISIS";
      }
    }
  }

  function analyzeMarket() {
    const id =
      $("marketPlayer")
        ?.value;

    const price =
      Number(
        $("marketPrice")
          ?.value ||
        0
      );

    const player =
      getPlayers().find(
        (item) =>
          String(
            item.id
          ) ===
          String(id)
      );

    if (!player) {
      $("marketOut").innerHTML =
        `
          <div class="notice">
            Selecciona un jugador.
          </div>
        `;
      return;
    }

    if (!price) {
      $("marketOut").innerHTML =
        `
          <div class="notice">
            Introduce un precio.
          </div>
        `;
      return;
    }

    const reference =
      Number(
        player.price ||
        0
      );

    let message =
      "No hay precio de referencia real disponible.";

    if (reference > 0) {
      const diff =
        ((price -
          reference) /
          reference) *
        100;

      message =
        diff <= -10
          ? "🟢 Parece una compra interesante frente a la referencia."
          : diff >= 10
            ? "🔴 Está por encima de la referencia."
            : "🟡 El precio está cerca de la referencia.";
    }

    $("marketOut").innerHTML =
      `
        <div class="notice">

          <b>
            ${esc(
              player.name
            )}
          </b>

          · Precio:
          🪙 ${money(
            price
          )}

          <br>

          ${message}

        </div>
      `;
  }

  function openPro() {
    $("modal")
      ?.classList.add(
        "open"
      );
  }

  function closePro() {
    $("modal")
      ?.classList.remove(
        "open"
      );
  }

  function activateProDemo() {
    state.pro =
      true;

    updateAuthUI();
    closePro();

    toast(
      "⭐ PRO activado en modo DEMO."
    );
  }

  function wireNavigation() {
    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(
        (button) => {
          button.addEventListener(
            "click",
            () =>
              go(
                button.dataset.page
              )
          );
        }
      );

    document
      .querySelectorAll(
        "[data-go]"
      )
      .forEach(
        (button) => {
          button.addEventListener(
            "click",
            () =>
              go(
                button.dataset.go
              )
          );
        }
      );

    $("accountBtn")?.addEventListener(
      "click",
      () => go("account")
    );

    $("proBtn")?.addEventListener(
      "click",
      openPro
    );

    $("homePro")?.addEventListener(
      "click",
      openPro
    );

    $("accountPro")?.addEventListener(
      "click",
      openPro
    );

    $("modalClose")?.addEventListener(
      "click",
      closePro
    );

    $("activate")?.addEventListener(
      "click",
      activateProDemo
    );

    $("modal")?.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          $("modal")
        ) {
          closePro();
        }
      }
    );

    $("compareBtn")?.addEventListener(
      "click",
      comparePlayers
    );

    $("saveSquad")?.addEventListener(
      "click",
      saveSquad
    );

    $("marketBtn")?.addEventListener(
      "click",
      analyzeMarket
    );

    $("recommend")?.addEventListener(
      "click",
      runAI
    );

    $("logout")?.addEventListener(
      "click",
      logout
    );

    const search =
      $("playerSearch");

    if (search) {
      search.addEventListener(
        "input",
        () =>
          handlePlayerSearch(
            search.value
          )
      );
    }
  }

  function listenPlayers() {
    window.addEventListener(
      "fsm:players-ready",
      () => {
        requestAnimationFrame(
          () => {
            updateCatalog();
            renderSquad();
          }
        );
      }
    );
  }

  async function initAuth() {
    if (!supabaseClient) {
      updateAuthUI();
      return;
    }

    const {
      data
    } =
      await supabaseClient.auth.getSession();

    await loadProfile(
      data?.session?.user ||
        null
    );

    supabaseClient.auth.onAuthStateChange(
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
  }

  function firstPaint() {
    buildSearchIndex();

    renderFeatured();
    renderPlayers();
    refreshPickers();
    renderSquad();
  }

  function init() {
    wireNavigation();
    listenPlayers();
    ensureAuthButtons();
    firstPaint();
    updateAuthUI();

    void initAuth();

    setTimeout(
      () => {
        if (
          getPlayers().length !==
          state.players.length
        ) {
          updateCatalog();
          renderSquad();
        }
      },
      1200
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }
})();
