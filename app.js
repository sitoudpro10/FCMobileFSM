const P = window.FSM_PLAYERS || [];
const $ = id => document.getElementById(id);

const money = n =>
  n >= 1e9
    ? (n / 1e9).toFixed(1) + "B"
    : n >= 1e6
      ? Math.round(n / 1e6) + "M"
      : new Intl.NumberFormat("es-ES").format(n);

const initials = s =>
  String(s || "")
    .split(/\s+/)
    .map(x => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const SUPABASE_URL = "https://jshevgjyweoianpbbjdl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

const FSM_AI_URL = `${SUPABASE_URL}/functions/v1/fsm-ai-secure`;

const supabaseClient =
  window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

const state = {
  email: null,
  uses: 0,
  pro: false,
  squad: []
};

let currentUser = null;

function card(p) {
  return `
    <article class="card">
      <div class="art">
        <div class="ovr">${p.ovr}</div>
        <div class="pos">${p.pos}</div>
        <div class="crest">${initials(p.club)}</div>
        <div class="face">${p.country || ""}</div>
        <div class="flag">${p.country || ""}</div>
      </div>

      <h3>${p.name}</h3>
      <p class="sub">${p.club}</p>

      <div class="stats">
        <span>RIT ${p.pace}</span>
        <span>TIR ${p.shoot}</span>
        <span>PAS ${p.pass}</span>
        <span>REG ${p.dribble}</span>
        <span>DEF ${p.def}</span>
        <span>FIS ${p.phys}</span>
      </div>

      <div class="price">🪙 ${money(p.price)}</div>
    </article>
  `;
}

function options() {
  return (
    `<option value="">Seleccionar...</option>` +
    P.map(
      p =>
        `<option value="${p.id}">${p.name} · ${p.pos}</option>`
    ).join("")
  );
}

function go(id) {
  const page = $(id);
  if (!page) return;

  document
    .querySelectorAll(".page")
    .forEach(x => x.classList.remove("active"));

  page.classList.add("active");

  document
    .querySelectorAll("[data-page]")
    .forEach(x =>
      x.classList.toggle("active", x.dataset.page === id)
    );

  scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function updateHeader() {
  const usage = $("usage");

  if (usage) {
    usage.textContent = state.pro
      ? "⭐ PRO · ∞"
      : `🎟️ ${state.uses}/2`;
  }

  const accountBtn = $("accountBtn");

  if (accountBtn) {
    accountBtn.textContent = currentUser
      ? `👤 ${(currentUser.email || "").split("@")[0]}`
      : "👤 Cuenta";
  }

  const planText = $("planText");

  if (planText) {
    planText.textContent = state.pro ? "FSM PRO" : "FREE";
  }

  const remaining = $("loggedBox")?.querySelector("#remaining");

  if (remaining) {
    remaining.textContent = state.pro
      ? "Ilimitados"
      : String(state.uses);
  }

  const bar = $("bar");

  if (bar) {
    bar.style.width = state.pro
      ? "100%"
      : `${Math.max(
          0,
          Math.min(100, state.uses * 50)
        )}%`;
  }

  const logout = $("logout");

  if (logout) {
    logout.style.display = currentUser
      ? "inline-block"
      : "none";
  }

  const authBox = $("authBox");

  if (authBox) {
    authBox.style.display = currentUser
      ? "none"
      : "block";
  }

  const loggedBox = $("loggedBox");

  if (loggedBox) {
    loggedBox.style.display = currentUser
      ? "block"
      : "none";
  }

  const userEmail = $("userEmail");

  if (userEmail && currentUser) {
    userEmail.textContent =
      currentUser.email || "";
  }
}

function syncAiUsage() {
  const remaining = $("ai")?.querySelector("#remaining");

  if (remaining) {
    remaining.textContent = state.pro
      ? "Análisis ilimitados"
      : `${state.uses} análisis restantes`;
  }

  const bar = $("bar");

  if (bar) {
    bar.style.width = state.pro
      ? "100%"
      : `${Math.max(
          0,
          Math.min(100, state.uses * 50)
        )}%`;
  }
}

function toast(msg) {
  const t = $("toast");

  if (!t) return;

  t.textContent = msg;
  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2400);
}

function openPro() {
  $("modal")?.classList.add("show");
}

function closePro() {
  $("modal")?.classList.remove("show");
}

async function loadProfile(user) {
  currentUser = user || null;

  if (!user) {
    state.email = null;
    state.uses = 0;
    state.pro = false;

    updateHeader();
    syncAiUsage();
    return;
  }

  const { data: profile, error } =
    await supabaseClient
      .from("profiles")
      .select("free_uses,is_pro")
      .eq("id", user.id)
      .maybeSingle();

  if (error || !profile) {
    console.error(
      "FSM - Error cargando perfil:",
      error
    );

    state.email = user.email || null;
    state.uses = 0;
    state.pro = false;

    updateHeader();
    syncAiUsage();
    return;
  }

  state.email = user.email || null;
  state.uses = Number(
    profile.free_uses ?? 0
  );
  state.pro = Boolean(profile.is_pro);

  updateHeader();
  syncAiUsage();
}

async function auth() {
  const emailInput = $("email");
  const passwordInput = $("password");
  const btn = $("authSubmit");

  const email = emailInput?.value.trim().toLowerCase();
  const pass = passwordInput?.value || "";

  if (!email || !pass) {
    toast("Completa el email y la contraseña.");
    return;
  }

  if (pass.length < 6) {
    toast("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (!supabaseClient) {
    toast("Error: Supabase no está conectado.");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "CONECTANDO...";
  }

  try {
    // 1. Intentamos CREAR la cuenta
    const {
      data: signUpData,
      error: signUpError
    } = await supabaseClient.auth.signUp({
      email,
      password: pass
    });

    // 2. Cuenta creada correctamente
    if (!signUpError) {
      if (signUpData?.user) {
        // Si Supabase devuelve sesión, podemos entrar directamente
        if (signUpData.session) {
          await loadProfile(signUpData.user);

          toast("Cuenta creada correctamente.");

          go("account");
        } else {
          // Confirmación de email activada
          toast(
            "Cuenta creada. Revisa tu correo para confirmar la cuenta."
          );
        }
      } else {
        toast(
          "No se pudo crear la cuenta. Inténtalo de nuevo."
        );
      }

      return;
    }

    // 3. Si el correo ya está registrado,
    // intentamos iniciar sesión
    const signupMessage = String(
      signUpError.message || ""
    ).toLowerCase();

    const alreadyExists =
      signupMessage.includes("already registered") ||
      signupMessage.includes("user already exists") ||
      signupMessage.includes("already been registered");

    if (!alreadyExists) {
      // MOSTRAMOS EL ERROR REAL DEL REGISTRO
      console.error(
        "FSM - Error real de registro:",
        signUpError
      );

      toast(
        "No se pudo crear la cuenta: " +
        signUpError.message
      );

      return;
    }

    // 4. La cuenta ya existe → intentamos iniciar sesión
    const {
      data: loginData,
      error: loginError
    } = await supabaseClient.auth.signInWithPassword({
      email,
      password: pass
    });

    if (loginError) {
      console.error(
        "FSM - Error real de inicio de sesión:",
        loginError
      );

      toast(
        "No se pudo iniciar sesión: " +
        loginError.message
      );

      return;
    }

    if (!loginData?.user) {
      toast(
        "No se pudo recuperar tu usuario."
      );

      return;
    }

    // 5. Sesión correcta
    await loadProfile(loginData.user);

    toast("Sesión iniciada correctamente.");

    go("account");

  } catch (error) {
    console.error(
      "FSM - Error inesperado de autenticación:",
      error
    );

    toast(
      "Ha ocurrido un error al conectar con Supabase."
    );

  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "CREAR / ENTRAR";
    }
  }
}

async function logout() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    toast(
      "No se pudo cerrar la sesión."
    );
    return;
  }

  await loadProfile(null);

  toast("Sesión cerrada.");

  go("home");
}

async function recommend() {
  const budget = +$("budget")?.value;
  const pos = $("recPos")?.value;
  const key = $("priority")?.value;

  if (!budget) {
    toast("Escribe un presupuesto.");
    return;
  }

  if (!currentUser) {
    toast(
      "Inicia sesión para usar FSM IA."
    );

    go("account");
    return;
  }

  const btn = $("recommend");

  if (btn) {
    btn.disabled = true;
    btn.textContent = "🤖 ANALIZANDO...";
  }

  try {
    const {
      data: { session }
    } =
      await supabaseClient.auth.getSession();

    if (!session) {
      toast(
        "Tu sesión ha caducado. Inicia sesión de nuevo."
      );
      return;
    }

    const candidates = P.filter(
      p =>
        p.price <= budget &&
        p.pos === pos
    )
      .sort(
        (a, b) =>
          (b[key] || b.ovr) -
          (a[key] || a.ovr)
      )
      .slice(0, 11);

    if (!candidates.length) {
      $("results").innerHTML = `
        <div class="notice">
          No hay jugadores que cumplan esos filtros.
        </div>
      `;

      return;
    }

    const response = await fetch(
      FSM_AI_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          players: candidates,
          budget
        })
      }
    );

    const json = await response.json();

    if (!response.ok || !json.ok) {
      toast(
        json.error ||
          "No se pudo realizar el análisis."
      );
      return;
    }

    state.uses =
      json.usage?.remaining ??
      state.uses;

    state.pro = Boolean(
      json.usage?.pro
    );

    updateHeader();
    syncAiUsage();

    const result = json.result;

    $("resultTitle").textContent =
      state.pro
        ? "Resultado FSM PRO"
        : "Resultado FSM";

    $("results").innerHTML = `
      <div class="pro">
        <h3>
          🧠 FSM-AI ${result.version}
        </h3>

        <p>
          Puntuación FSM:
          <b>${result.score}</b>
        </p>

        <p>
          GRL:
          <b>${result.metrics.overall}</b>
          · Ataque:
          <b>${result.metrics.attack}</b>
          · Pase:
          <b>${result.metrics.passing}</b>
          · Defensa:
          <b>${result.metrics.defending}</b>
          · Físico:
          <b>${result.metrics.physical}</b>
        </p>

        <p>
          Prioridad:
          <b>${result.priority}</b>
        </p>

        ${(result.advice || [])
          .map(
            x =>
              `<p class="muted">💡 ${x}</p>`
          )
          .join("")}
      </div>
    `;
  } catch (e) {
    console.error(e);

    toast(
      "Error al conectar con FSM IA."
    );
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent =
        "🔎 USAR 1 ANÁLISIS";
    }
  }
}

function compare() {
  const a = P.find(
    p => p.id == $("playerA")?.value
  );

  const b = P.find(
    p => p.id == $("playerB")?.value
  );

  if (!a || !b) {
    $("compareOut").innerHTML = `
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

  const box = p => `
    <div class="panel">
      <h2>
        ${p.country || ""}
        ${p.name}
      </h2>

      ${rows
        .map(
          r => `
            <div class="metric">
              <span class="muted">
                ${r[0]}
              </span>

              <b>
                ${p[r[1]]}
              </b>
            </div>
          `
        )
        .join("")}

      <p class="price">
        🪙 ${money(p.price)}
      </p>
    </div>
  `;

  $("compareOut").innerHTML = `
    <div class="compare">
      ${box(a)}
      ${box(b)}
    </div>
  `;
}

function buildSquad() {
  const saved = state.squad || [];

  $("formation").innerHTML = `
    <div class="spot gk">
      <select data-slot>${options()}</select>
      <span>GK</span>
    </div>

    <div class="spot lb">
      <select data-slot>${options()}</select>
      <span>LB</span>
    </div>

    <div class="spot cb1">
      <select data-slot>${options()}</select>
      <span>CB</span>
    </div>

    <div class="spot cb2">
      <select data-slot>${options()}</select>
      <span>CB</span>
    </div>

    <div class="spot rb">
      <select data-slot>${options()}</select>
      <span>RB</span>
    </div>

    <div class="spot cm1">
      <select data-slot>${options()}</select>
      <span>CM</span>
    </div>

    <div class="spot cm2">
      <select data-slot>${options()}</select>
      <span>CM</span>
    </div>

    <div class="spot cam">
      <select data-slot>${options()}</select>
      <span>CAM</span>
    </div>

    <div class="spot lw">
      <select data-slot>${options()}</select>
      <span>LW</span>
    </div>

    <div class="spot rw">
      <select data-slot>${options()}</select>
      <span>RW</span>
    </div>

    <div class="spot st">
      <select data-slot>${options()}</select>
      <span>ST</span>
    </div>

    <div
      class="circle"
      style="
        position:absolute;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        width:75px;
        height:75px;
        border:2px solid #ffffff75;
        border-radius:50%
      "
    ></div>
  `;

  document
    .querySelectorAll("[data-slot]")
    .forEach(
      (s, i) =>
        (s.value = saved[i] || "")
    );
}

function saveSquad() {
  state.squad = [
    ...document.querySelectorAll(
      "[data-slot]"
    )
  ].map(s => s.value);

  const arr = state.squad
    .map(id =>
      P.find(p => p.id == id)
    )
    .filter(Boolean);

  $("squadSummary").innerHTML = `
    <b>✅ Plantilla guardada</b>

    <p class="muted">
      ${arr.length}/11 jugadores seleccionados.
    </p>
  `;
}

function analyzeSquad() {
  const arr = state.squad
    .map(id =>
      P.find(p => p.id == id)
    )
    .filter(Boolean);

  if (!arr.length) {
    $("squadSummary").innerHTML = `
      <div class="notice">
        Selecciona jugadores y guarda la plantilla.
      </div>
    `;

    return;
  }

  const avg =
    arr.reduce(
      (s, p) => s + p.ovr,
      0
    ) / arr.length;

  const att =
    arr.reduce(
      (s, p) =>
        s +
        (p.pace +
          p.shoot +
          p.dribble) /
          3,
      0
    ) / arr.length;

  const def =
    arr.reduce(
      (s, p) => s + p.def,
      0
    ) / arr.length;

  $("squadSummary").innerHTML = `
    <div class="pro">
      <h3>🧠 Análisis de plantilla</h3>

      <p>
        GRL medio:
        <b>${avg.toFixed(1)}</b>
      </p>

      <p>
        Ataque:
        <b>${att.toFixed(1)}</b>
        · Defensa:
        <b>${def.toFixed(1)}</b>
      </p>

      <p class="muted">
        ${
          def < 75
            ? "Tu mayor prioridad es reforzar la defensa."
            : att < 82
              ? "Te falta potencia ofensiva."
              : "Plantilla equilibrada."
        }
      </p>
    </div>
  `;
}

function market() {
  const p = P.find(
    x => x.id == $("marketPlayer")?.value
  );

  const v = +$("marketPrice")?.value;

  if (!p || !v) {
    $("marketOut").innerHTML = `
      <div class="notice">
        Selecciona jugador y precio.
      </div>
    `;

    return;
  }

  const r = v / p.price;

  const label =
    r < 0.9
      ? "🟢 BUENA COMPRA"
      : r < 1.08
        ? "🟡 PRECIO NORMAL"
        : "🔴 CARO";

  $("marketOut").innerHTML = `
    <div class="pro">
      <h2>${label}</h2>

      <p>
        Precio introducido:
        <b>🪙 ${money(v)}</b>
      </p>

      <p>
        Referencia FSM DEMO:
        <b>🪙 ${money(p.price)}</b>
      </p>

      <p class="muted">
        Los precios son de demostración.
      </p>
    </div>
  `;
}

function activateDemo() {
  toast(
    "El pago real se habilitará en FSM PRO."
  );

  closePro();
}

function init() {
  $("featured").innerHTML = P
    .slice(0, 5)
    .map(card)
    .join("");

  $("allPlayers").innerHTML = P
    .map(card)
    .join("");

  $("playerA").innerHTML = options();
  $("playerB").innerHTML = options();
  $("marketPlayer").innerHTML = options();

  buildSquad();

  document
    .querySelectorAll("[data-page]")
    .forEach(
      b =>
        (b.onclick = () =>
          go(b.dataset.page))
    );

  document
    .querySelectorAll("[data-go]")
    .forEach(
      b =>
        (b.onclick = () =>
          go(b.dataset.go))
    );

  const search = $("search");

  if (search) {
    search.oninput = e => {
      go("players");
      filterPlayers(e.target.value);
    };
  }

  const playerSearch = $("playerSearch");

  if (playerSearch) {
    playerSearch.oninput = e =>
      filterPlayers(e.target.value);
  }

  $("recommend").onclick = recommend;
  $("compareBtn").onclick = compare;
  $("marketBtn").onclick = market;

  $("saveSquad").onclick = () => {
    saveSquad();
    analyzeSquad();
  };

  $("accountBtn").onclick = () =>
    go("account");

  $("proBtn").onclick = openPro;

  $("modalClose").onclick = closePro;

  $("activate").onclick =
    activateDemo;

  $("authSubmit").onclick = auth;
  $("logout").onclick = logout;

  document
    .getElementById("homePro")
    ?.addEventListener(
      "click",
      openPro
    );

  document
    .getElementById("accountPro")
    ?.addEventListener(
      "click",
      openPro
    );

  updateHeader();
  syncAiUsage();

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(
          () =>
            loadProfile(
              session?.user || null
            ),
          0
        );
      }
    );

    supabaseClient.auth
      .getSession()
      .then(({ data }) =>
        loadProfile(
          data.session?.user || null
        )
      )
      .catch(console.error);
  }
}

function filterPlayers(q) {
  q = String(q || "").toLowerCase();

  $("allPlayers").innerHTML = P
    .filter(p =>
      (
        p.name +
        " " +
        p.club +
        " " +
        p.pos
      )
        .toLowerCase()
        .includes(q)
    )
    .map(card)
    .join("") ||
    `
      <div class="notice">
        No hay resultados.
      </div>
    `;
}

window.addEventListener(
  "DOMContentLoaded",
  init
);
