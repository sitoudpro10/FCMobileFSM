(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const URL = "https://jshevgjyweoianpbbjdl.supabase.co";
  const KEY = "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";
  const AI_URL = `${URL}/functions/v1/fsm-ai-secure`;
  const client = window.supabase?.createClient?.(URL, KEY) || null;

  const state = {
    players: [],
    filtered: [],
    index: [],
    top: [],
    count: 40,
    query: "",
    searchTimer: null,
    uses: 0,
    pro: false,
    user: null,
    aiBusy: false,
    catalogStamp: ""
  };

  const esc = v => String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const money = v => {
    const n = Number(v) || 0;

    if (!n) return "—";

    if (n >= 1e9) {
      return `${(n / 1e9).toFixed(1)}B`;
    }

    if (n >= 1e6) {
      return `${Math.round(n / 1e6)}M`;
    }

    return new Intl.NumberFormat(
      "es-ES"
    ).format(n);
  };

  function toast(msg) {
    const e = $("toast");

    if (!e) return;

    e.textContent = msg;
    e.classList.add("show");

    clearTimeout(e._t);

    e._t = setTimeout(
      () => e.classList.remove("show"),
      2600
    );
  }

  function players() {
    return Array.isArray(
      window.FSM_PLAYERS
    )
      ? window.FSM_PLAYERS
      : [];
  }

  function normalize(p) {
    return {
      ...p,
      id: p.id,

      name:
        String(
          p.name ||
          "Jugador"
        ),

      club:
        String(
          p.club ||
          "Sin club"
        ),

      league:
        String(
          p.league ||
          ""
        ),

      country:
        String(
          p.country ||
          ""
        ),

      pos:
        String(
          p.pos ||
          ""
        ),

      program:
        String(
          p.program ||
          ""
        ),

      ovr:
        Number(
          p.ovr ||
          0
        ),

      price:
        Number(
          p.price ||
          0
        ),

      pace:
        Number(
          p.pace ||
          0
        ),

      shoot:
        Number(
          p.shoot ||
          0
        ),

      pass:
        Number(
          p.pass ||
          0
        ),

      dribble:
        Number(
          p.dribble ||
          0
        ),

      def:
        Number(
          p.def ||
          0
        ),

      phys:
        Number(
          p.phys ||
          0
        )
    };
  }

  function rebuild() {
    const raw =
      players();

    const stamp =
      `${window.FSM_PLAYERS_SOURCE || ""}:` +
      `${raw.length}:` +
      `${raw[0]?.id || ""}:` +
      `${raw[raw.length - 1]?.id || ""}`;

    if (
      stamp ===
      state.catalogStamp
    ) {
      return;
    }

    state.catalogStamp =
      stamp;

    state.players =
      raw.map(
        normalize
      );

    state.filtered =
      state.players;

    state.index =
      state.players.map(
        (
          p,
          i
        ) => ({
          i,

          text:
            `${p.name} ${p.club} ${p.league} ${p.country} ${p.pos} ${p.program}`
              .toLowerCase()
        })
      );

    state.top =
      state.players
        .slice()
        .sort(
          (a, b) =>
            b.ovr -
            a.ovr
        )
        .slice(
          0,
          150
        );

    state.count =
      40;

    renderAll();
  }

  function card(p) {
    const initials =
      String(
        p.name ||
        "?"
      )
        .trim()
        .split(/\s+/)
        .slice(
          0,
          2
        )
        .map(
          x =>
            x[0] ||
            ""
        )
        .join("")
        .toUpperCase();

    return `
      <article
        class="card"
        data-player-id="${esc(
          p.id
        )}"
      >

        <div class="art">

          <div class="ovr">
            ${esc(
              p.ovr ||
              "—"
            )}
          </div>

          <div class="pos">
            ${esc(
              p.pos
            )}
          </div>

          <div class="crest">
            ${esc(
              (
                p.club ||
                ""
              )
                .slice(
                  0,
                  2
                )
                .toUpperCase()
            )}
          </div>

          <div class="face">
            ${esc(
              initials
            )}
          </div>

          <div class="flag">
            ${esc(
              p.country
            )}
          </div>

        </div>

        <h3>
          ${esc(
            p.name
          )}
        </h3>

        <p class="sub">
          ${esc(
            p.club
          )}
        </p>

        <div class="stats">

          <span>
            RIT ${esc(
              p.pace
            )}
          </span>

          <span>
            TIR ${esc(
              p.shoot
            )}
          </span>

          <span>
            PAS ${esc(
              p.pass
            )}
          </span>

          <span>
            REG ${esc(
              p.dribble
            )}
          </span>

          <span>
            DEF ${esc(
              p.def
            )}
          </span>

          <span>
            FIS ${esc(
              p.phys
            )}
          </span>

        </div>

        <div class="price">
          🪙 ${money(
            p.price
          )}
        </div>

      </article>
    `;
  }

  function renderPlayers() {
    const box =
      $("allPlayers");

    if (!box) {
      return;
    }

    const list =
      state.filtered.slice(
        0,
        state.count
      );

    const more =
      state.filtered.length >
      list.length;

    box.innerHTML =
      list
        .map(card)
        .join("") +

      (
        more
          ? `
            <div
              style="
                grid-column:1/-1;
                text-align:center;
                padding:16px
              "
            >

              <small class="muted">
                Mostrando
                ${list.length}
                de
                ${state.filtered.length}
              </small>

              <br><br>

              <button
                id="fsmLoadMore"
                class="btn"
                type="button"
              >
                Cargar más
              </button>

            </div>
          `
          : ""
      );

    $(
      "fsmLoadMore"
    )?.addEventListener(
      "click",
      () => {

        state.count +=
          40;

        renderPlayers();
      }
    );
  }

  function renderFeatured() {
    const box =
      $("featured");

    if (!box) {
      return;
    }

    box.innerHTML =
      state.top
        .slice(
          0,
          5
        )
        .map(card)
        .join("");
  }

  function pickerOptions() {
    return (
      `<option value="">
        Seleccionar...
      </option>` +

      state.top
        .map(
          p =>
            `<option value="${esc(
              p.id
            )}">
              ${esc(
                p.name
              )}
              ·
              ${esc(
                p.pos
              )}
              · GRL
              ${esc(
                p.ovr
              )}
            </option>`
        )
        .join("")
    );
  }

  function refreshPickers() {
    const html =
      pickerOptions();

    [
      "playerA",
      "playerB",
      "marketPlayer"
    ].forEach(
      id => {

        const e =
          $(id);

        if (!e) {
          return;
        }

        const old =
          e.value;

        e.innerHTML =
          html;

        e.value =
          old;
      }
    );
  }

function renderSquad(){
  const box = $("formation");

  if (!box) {
    return;
  }

  const positions = [
    ["GK", "gk"],
    ["LB", "lb"],
    ["CB", "cb1"],
    ["CB", "cb2"],
    ["RB", "rb"],
    ["CDM", "cm1"],
    ["CM", "cm2"],
    ["CAM", "cam"],
    ["LW", "lw"],
    ["RW", "rw"],
    ["ST", "st"]
  ];

  const opts = pickerOptions();

  box.innerHTML =
    positions
      .map(
        ([position, cssClass], index) => `
          <div class="spot ${cssClass}">
            <select
              data-squad="${index}"
              aria-label="${esc(position)}"
            >
              ${opts}
            </select>

            <span>
              ${esc(position)}
            </span>
          </div>
        `
      )
      .join("");
}
  function renderAll() {
    renderFeatured();
    renderPlayers();
    refreshPickers();
    renderSquad();
    updateAuthUI();
  }

  function go(id) {
    document
      .querySelectorAll(
        ".page"
      )
      .forEach(
        e =>
          e.classList.remove(
            "active"
          )
      );

    $(
      id
    )?.classList.add(
      "active"
    );

    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(
        b =>
          b.classList.toggle(
            "active",
            b.dataset.page ===
              id
          )
      );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (
      id ===
      "players"
    ) {
      if (
        window.FSM_PLAYERS_LOAD_REFERENCE
      ) {
        void window.FSM_PLAYERS_LOAD_REFERENCE();
      }

      renderPlayers();
    }
  }

  function filter(q) {
    state.query =
      q
        .trim()
        .toLowerCase();

    if (
      !state.query
    ) {
      state.filtered =
        state.players;

    } else {

      state.filtered =
        [];

      for (
        const entry
        of state.index
      ) {

        if (
          entry.text.includes(
            state.query
          )
        ) {

          state.filtered.push(
            state.players[
              entry.i
            ]
          );
        }
      }
    }

    state.count =
      40;

    renderPlayers();
  }

  function setupNav() {

    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(
        b =>
          b.addEventListener(
            "click",
            () =>
              go(
                b.dataset.page
              )
          )
      );

    document
      .querySelectorAll(
        "[data-go]"
      )
      .forEach(
        b =>
          b.addEventListener(
            "click",
            () =>
              go(
                b.dataset.go
              )
          )
      );

    $(
      "accountBtn"
    )?.addEventListener(
      "click",
      () =>
        go(
          "account"
        )
    );

    $(
      "playerSearch"
    )?.addEventListener(
      "input",
      e => {

        clearTimeout(
          state.searchTimer
        );

        if (
          window.FSM_PLAYERS_LOAD_REFERENCE
        ) {
          void window.FSM_PLAYERS_LOAD_REFERENCE();
        }

        state.searchTimer =
          setTimeout(
            () =>
              filter(
                e.target.value
              ),
            140
          );
      }
    );

    $(
      "compareBtn"
    )?.addEventListener(
      "click",
      compare
    );

    $(
      "marketBtn"
    )?.addEventListener(
      "click",
      market
    );

    $(
      "saveSquad"
    )?.addEventListener(
      "click",
      saveSquad
    );

    $(
      "recommend"
    )?.addEventListener(
      "click",
      runAI
    );

    $(
      "logout"
    )?.addEventListener(
      "click",
      logout
    );

    $(
      "proBtn"
    )?.addEventListener(
      "click",
      () =>
        showModal(
          true
        )
    );

    $(
      "homePro"
    )?.addEventListener(
      "click",
      () =>
        showModal(
          true
        )
    );

    $(
      "accountPro"
    )?.addEventListener(
      "click",
      () =>
        showModal(
          true
        )
    );

    $(
      "modalClose"
    )?.addEventListener(
      "click",
      () =>
        showModal(
          false
        )
    );

    $(
      "activate"
    )?.addEventListener(
      "click",
      () => {

        state.pro =
          true;

        updateAuthUI();

        showModal(
          false
        );

        toast(
          "⭐ PRO activado en DEMO"
        );
      }
    );
  }

  function showModal(
    show
  ) {

    $(
      "modal"
    )?.classList.toggle(
      "show",
      show
    );

    $(
      "modal"
    )?.classList.toggle(
      "open",
      show
    );
  }

  function updateAuthUI() {

    if (
      $("usage")
    ) {
      $("usage").textContent =
        state.pro
          ? "⭐ PRO · ilimitado"
          : `🎟️ ${state.uses}/2`;
    }

    if (
      $("remaining")
    ) {
      $("remaining").textContent =
        state.pro
          ? "Análisis ilimitados"
          : `${state.uses} análisis restantes`;
    }

    if (
      $("remainingAccount")
    ) {
      $("remainingAccount").textContent =
        state.pro
          ? "Ilimitado"
          : String(
              state.uses
            );
    }

    if (
      $("planText")
    ) {
      $("planText").textContent =
        state.pro
          ? "FSM PRO"
          : "FREE";
    }

    if (
      $("userEmail") &&
      state.user
    ) {
      $("userEmail").textContent =
        state.user.email ||
        "";
    }

    if (
      $("authBox")
    ) {
      $("authBox").style.display =
        state.user
          ? "none"
          : "";
    }

    if (
      $("loggedBox")
    ) {
      $("loggedBox").style.display =
        state.user
          ? "block"
          : "none";
    }
  }

  async function loadProfile(
    user
  ) {

    state.user =
      user ||
      null;

    if (!user) {

      state.uses =
        0;

      state.pro =
        false;

      updateAuthUI();

      return;
    }

    try {

      const {
        data,
        error
      } =
        await client
          .from(
            "profiles"
          )
          .select(
            "free_uses,is_pro"
          )
          .eq(
            "id",
            user.id
          )
          .maybeSingle();

      if (
        error
      ) {
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

    } catch (
      e
    ) {

      console.warn(
        "FSM profile",
        e
      );
    }

    updateAuthUI();
  }

  async function auth(
    mode
  ) {

    if (!client) {

      toast(
        "Supabase no está disponible."
      );

      return;
    }

    const email =
      (
        $(
          "email"
        )?.value ||
        ""
      )
        .trim()
        .toLowerCase();

    const password =
      $(
        "password"
      )?.value ||
      "";

    if (
      !email ||
      !password
    ) {

      toast(
        "Completa email y contraseña."
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

    try {

      const r =
        mode ===
        "login"

          ? await client
              .auth
              .signInWithPassword({
                email,
                password
              })

          : await client
              .auth
              .signUp({
                email,
                password,
                options: {
                  emailRedirectTo:
                    location.origin
                }
              });

      if (
        r.error
      ) {

        toast(
          r.error.message
        );

        return;
      }

      if (
        r.data?.user
      ) {

        await loadProfile(
          r.data.user
        );

        toast(
          mode ===
            "login"
            ? "Sesión iniciada."
            : "Cuenta creada."
        );

        go(
          "account"
        );
      }

    } catch (
      e
    ) {

      console.error(
        e
      );

      toast(
        "No se pudo completar la operación."
      );
    }
  }

  function ensureAuthButtons() {

    const box =
      $("authBox");

    if (!box) {
      return;
    }

    const old =
      $("authSubmit");

    if (
      old
    ) {
      old.style.display =
        "none";
    }

    if (
      $("authLogin") &&
      $("authCreate")
    ) {
      return;
    }

    const wrap =
      document.createElement(
        "div"
      );

    wrap.style.display =
      "grid";

    wrap.style.gridTemplateColumns =
      "1fr 1fr";

    wrap.style.gap =
      "8px";

    wrap.style.marginTop =
      "12px";

    wrap.innerHTML =
      `
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
      wrap
    );

    $(
      "authLogin"
    ).onclick =
      () =>
        auth(
          "login"
        );

    $(
      "authCreate"
    ).onclick =
      () =>
        auth(
          "register"
        );
  }

  async function logout() {

    if (
      client
    ) {
      await client
        .auth
        .signOut();
    }

    await loadProfile(
      null
    );

    go(
      "home"
    );

    toast(
      "Sesión cerrada."
    );
  }

  function compare() {

    const all =
      players();

    const a =
      all.find(
        p =>
          String(
            p.id
          ) ===
          String(
            $("playerA")
              ?.value
          )
      );

    const b =
      all.find(
        p =>
          String(
            p.id
          ) ===
          String(
            $("playerB")
              ?.value
          )
      );

    if (
      !a ||
      !b
    ) {

      $("compareOut").innerHTML =
        `
          <div class="notice">
            Selecciona dos jugadores.
          </div>
        `;

      return;
    }

    const rows = [
      [
        "GRL",
        "ovr"
      ],
      [
        "Ritmo",
        "pace"
      ],
      [
        "Tiro",
        "shoot"
      ],
      [
        "Pase",
        "pass"
      ],
      [
        "Regate",
        "dribble"
      ],
      [
        "Defensa",
        "def"
      ],
      [
        "Físico",
        "phys"
      ]
    ];

    const box =
      p =>
        `
          <div class="panel">

            <h2>
              ${esc(
                p.name
              )}
            </h2>

            ${
              rows
                .map(
                  (
                    [
                      label,
                      key
                    ]
                  ) =>
                    `
                      <div class="metric">

                        <span class="muted">
                          ${label}
                        </span>

                        <b>
                          ${esc(
                            p[key]
                          )}
                        </b>

                      </div>
                    `
                )
                .join("")
            }

            <p class="price">
              🪙 ${money(
                p.price
              )}
            </p>

          </div>
        `;

    $("compareOut").innerHTML =
      `
        <div class="compare">

          ${box(a)}
          ${box(b)}

        </div>
      `;
  }

  function market() {

    const p =
      players().find(
        x =>
          String(
            x.id
          ) ===
          String(
            $("marketPlayer")
              ?.value
          )
      );

    const price =
      Number(
        $("marketPrice")
          ?.value ||
        0
      );

    if (!p) {

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

    const ref =
      Number(
        p.price ||
        0
      );

    let msg =
      "No hay referencia real.";

    if (
      ref
    ) {

      const difference =
        (
          (
            price -
            ref
          ) /
          ref
        ) *
        100;

      msg =
        difference <= -10
          ? "🟢 Buen precio."
          : difference >= 10
            ? "🔴 Precio alto."
            : "🟡 Precio cercano a la referencia.";
    }

    $("marketOut").innerHTML =
      `
        <div class="notice">

          <b>
            ${esc(
              p.name
            )}
          </b>

          · 🪙
          ${money(
            price
          )}

          <br>

          ${msg}

        </div>
      `;
  }

  function saveSquad() {

    if (
      !state.user
    ) {

      toast(
        "Inicia sesión primero."
      );

      return;
    }

    const selects =
      [
        ...
        document.querySelectorAll(
          "[data-squad]"
        )
      ];

    const ids =
      selects
        .map(
          s =>
            s.value
        )
        .filter(
          Boolean
        );

    if (
      ids.length !==
      11
    ) {

      toast(
        "Selecciona los 11 jugadores."
      );

      return;
    }

    const map =
      new Map(
        players().map(
          p =>
            [
              String(
                p.id
              ),
              p
            ]
        )
      );

    const sel =
      ids
        .map(
          id =>
            map.get(
              String(
                id
              )
            )
        )
        .filter(
          Boolean
        );

    const avg =
      k =>
        sel.reduce(
          (
            s,
            p
          ) =>
            s +
            (
              Number(
                p[k]
              ) ||
              0
            ),
          0
        ) /
        sel.length;

    $("squadSummary").innerHTML =
      `
        <div class="notice">

          <b>
            Plantilla analizada
          </b>

          · GRL
          ${avg(
            "ovr"
          ).toFixed(1)}

          · Pase
          ${avg(
            "pass"
          ).toFixed(1)}

          · Defensa
          ${avg(
            "def"
          ).toFixed(1)}

        </div>
      `;

    toast(
      "✅ Plantilla analizada."
    );
  }

  function localRec(
    budget,
    pos,
    priority
  ) {

    const list =
      players().filter(
        p =>
          (
            !pos ||
            p.pos ===
              pos
          ) &&
          (
            !budget ||
            !p.price ||
            p.price <=
              budget
          )
      );

    if (
      !list.length
    ) {
      return [];
    }

    list.sort(
      (
        a,
        b
      ) => {

        const key =
          {
            ovr:
              "ovr",
            pace:
              "pace",
            shoot:
              "shoot",
            dribble:
              "dribble",
            def:
              "def"
          }[
            priority
          ];

        if (
          key
        ) {
          return (
            b[key] -
            a[key]
          );
        }

        return (
          (
            (
              b.ovr ||
              0
            ) /
            Math.max(
              1,
              b.price ||
                1
            )
          ) -
          (
            (
              a.ovr ||
              0
            ) /
            Math.max(
              1,
              a.price ||
                1
            )
          )
        );
      }
    );

    return list.slice(
      0,
      8
    );
  }

  async function runAI() {

    if (
      state.aiBusy
    ) {
      return;
    }

    if (
      !state.user
    ) {

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
        $("budget")
          ?.value ||
        0
      );

    const pos =
      $("recPos")
        ?.value ||
      "ST";

    const priority =
      $("priority")
        ?.value ||
      "value";

    const local =
      localRec(
        budget,
        pos,
        priority
      );

    $("results").innerHTML =
      local.length

        ? `
          <div class="cards">

            ${local
              .slice(
                0,
                8
              )
              .map(card)
              .join("")}

          </div>
        `

        : `
          <div class="notice">
            No hay candidatos.
          </div>
        `;

    state.aiBusy =
      true;

    $(
      "recommend"
    )?.setAttribute(
      "disabled",
      "true"
    );

    try {

      const {
        data
      } =
        await client
          .auth
          .getSession();

      const token =
        data
          ?.session
          ?.access_token;

      if (
        !token
      ) {
        throw new Error(
          "Sesión no válida."
        );
      }

      const r =
        await fetch(
          AI_URL,
          {
            method:
              "POST",

            headers: {

              Authorization:
                `Bearer ${token}`,

              apikey:
                KEY,

              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                {
                  budget:
                    budget ||
                    undefined,

                  position:
                    pos,

                  priority,

                  players:
                    local.slice(
                      0,
                      11
                    )
                }
              )
          }
        );

      const payload =
        await r
          .json()
          .catch(
            () =>
              null
          );

      if (
        !r.ok ||
        !payload?.ok
      ) {

        throw new Error(
          payload?.error ||
          "Error de FSM IA."
        );
      }

      const result =
        payload.result;

      if (
        result
      ) {

        $("results")
          .insertAdjacentHTML(
            "afterbegin",
            `
              <div class="panel">

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
                  Prioridad:
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

                        ${
                          result.advice
                            .map(
                              x =>
                                `<li>${esc(
                                  x
                                )}</li>`
                            )
                            .join("")
                        }

                      </ul>
                    `
                    : ""
                }

              </div>
            `
          );
      }

      if (
        payload.usage &&
        !payload.usage.pro &&
        payload.usage.remaining !=
          null
      ) {

        state.uses =
          Number(
            payload
              .usage
              .remaining
          );

        updateAuthUI();
      }

    } catch (
      e
    ) {

      console.error(
        "FSM IA",
        e
      );

      if (
        !local.length
      ) {

        toast(
          e.message ||
          "No se pudo completar el análisis."
        );
      }

    } finally {

      state.aiBusy =
        false;

      $(
        "recommend"
      )?.removeAttribute(
        "disabled"
      );
    }
  }

  function init() {

    setupNav();

    ensureAuthButtons();

    rebuild();

    window.addEventListener(
      "fsm:players-ready",
      rebuild
    );

    if (
      client
    ) {

      client
        .auth
        .getSession()
        .then(
          ({
            data
          }) =>
            loadProfile(
              data
                ?.session
                ?.user ||
              null
            )
        );

      client
        .auth
        .onAuthStateChange(
          (
            _e,
            s
          ) =>
            setTimeout(
              () =>
                loadProfile(
                  s?.user ||
                  null
                ),
              0
            )
        );
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:
          true
      }
    );

  } else {

    init();
  }

})();
