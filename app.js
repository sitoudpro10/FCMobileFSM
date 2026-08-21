(() => {
  "use strict";

  const P = window.FSM_PLAYERS || [];
  const $ = (id) => document.getElementById(id);

  const SUPABASE_URL = "https://jshevgjyweoianpbbjdl.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";
  const FSM_AI_URL =
    `${SUPABASE_URL}/functions/v1/fsm-ai-secure`;

  const supabaseClient =
    window.supabase?.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

  const state = {
    uses: 0,
    pro: false,
    squad: []
  };

  let currentUser = null;

  function money(n) {
    const value = Number(n) || 0;
    if (value >= 1e9) return (value / 1e9).toFixed(1) + "B";
    if (value >= 1e6) return Math.round(value / 1e6) + "M";
    return new Intl.NumberFormat("es-ES").format(value);
  }

  function initials(s) {
    return String(s || "")
      .split(/\s+/)
      .map(x => x[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function toast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 2800);
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
    return `<option value="">Seleccionar...</option>` +
      P.map(p => `<option value="${p.id}">${p.name} · ${p.pos}</option>`).join("");
  }

  function setAuthUi() {
    const authBox = $("authBox");
    const loggedBox = $("loggedBox");
    const accountBtn = $("accountBtn");
    const planText = $("planText");
    const accountRemaining = $("remainingAccount");
    const usage = $("usage");
    const aiRemaining = $("remaining");
    const bar = $("bar");
    const logout = $("logout");
    const userEmail = $("userEmail");

    if (accountBtn) {
      accountBtn.textContent = currentUser
        ? `👤 ${(currentUser.email || "").split("@")[0]}`
        : "👤 Cuenta";
    }

    if (authBox) authBox.style.display = currentUser ? "none" : "";
    if (loggedBox) loggedBox.style.display = currentUser ? "block" : "none";
    if (logout) logout.style.display = currentUser ? "inline-block" : "none";

    if (currentUser && userEmail) userEmail.textContent = currentUser.email || "";

    if (planText) planText.textContent = state.pro ? "FSM PRO" : "FREE";
    if (accountRemaining) accountRemaining.textContent = state.pro ? "Ilimitado" : String(state.uses);

    if (usage) usage.textContent = state.pro ? "⭐ PRO · ilimitado" : `🎟️ ${state.uses}/2`;
    if (aiRemaining) aiRemaining.textContent = state.pro ? "Análisis ilimitados" : `${state.uses} análisis restantes`;
    if (bar) bar.style.width = state.pro ? "100%" : `${Math.max(0, Math.min(100, state.uses * 50))}%`;
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
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("free_uses,is_pro")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("FSM - Error cargando perfil:", error);
        state.uses = 0;
        state.pro = false;
      } else if (data) {
        state.uses = Number(data.free_uses ?? 0);
        state.pro = Boolean(data.is_pro);
      } else {
        state.uses = 0;
        state.pro = false;
      }
    } catch (err) {
      console.error("FSM - Error cargando perfil:", err);
      state.uses = 0;
      state.pro = false;
    }

    setAuthUi();
  }

  function friendlyAuthError(message) {
    const m = String(message || "").toLowerCase();

    if (m.includes("rate limit")) {
      return "Supabase ha limitado temporalmente los correos. Espera un poco antes de volver a probar.";
    }
    if (m.includes("email not confirmed")) {
      return "Tu correo todavía no está confirmado. Revisa tu email.";
    }
    if (m.includes("invalid login credentials")) {
      return "Ese correo o contraseña no son correctos.";
    }
    if (m.includes("password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    return message || "No se pudo completar la operación.";
  }

  async function auth() {
    if (!supabaseClient) {
      toast("Supabase no está disponible.");
      return;
    }

    const emailInput = $("email");
    const passwordInput = $("password");
    const btn = $("authSubmit");

    const email = (emailInput?.value || "").trim().toLowerCase();
    const password = passwordInput?.value || "";

    if (!email || !password) {
      toast("Completa el email y la contraseña.");
      return;
    }

    if (password.length < 6) {
      toast("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "CONECTANDO...";
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
      });

      if (!error) {
        if (data?.session && data?.user) {
          await loadProfile(data.user);
          toast("Cuenta creada correctamente.");
          go("account");
        } else {
          toast("Cuenta creada. Revisa tu correo para confirmar la cuenta.");
        }
        return;
      }

      const msg = String(error.message || "").toLowerCase();

      const alreadyExists =
        msg.includes("already registered") ||
        msg.includes("user already exists") ||
        msg.includes("already been registered");

      if (!alreadyExists) {
        console.error("FSM - Registro:", error);
        toast(friendlyAuthError(error.message));
        return;
      }

      const login = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (login.error) {
        console.error("FSM - Login:", login.error);
        toast(friendlyAuthError(login.error.message));
        return;
      }

      await loadProfile(login.data.user);
      toast("Sesión iniciada.");
      go("account");
    } catch (err) {
      console.error("FSM - Auth:", err);
      toast("Error al conectar con la autenticación.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "CREAR / ENTRAR";
      }
    }
  }

  async function logout() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      toast("No se pudo cerrar la sesión.");
      return;
    }
    await loadProfile(null);
    toast("Sesión cerrada.");
    go("home");
  }

  function filterPlayers(q) {
    const query = String(q || "").toLowerCase().trim();
    const container = $("allPlayers");
    if (!container) return;

    const filtered = P.filter(p =>
      `${p.name} ${p.club} ${p.pos}`.toLowerCase().includes(query)
    );

    container.innerHTML = filtered.map(card).join("") ||
      `<div class="notice">No hay resultados.</div>`;
  }

  async function recommend() {
    if (!currentUser) {
      toast("Inicia sesión para usar FSM IA.");
      go("account");
      return;
    }

    const budget = Number($("budget")?.value || 0);
    const pos = $("recPos")?.value || "";
    const key = $("priority")?.value || "value";
    const btn = $("recommend");

    if (budget <= 0) {
      toast("Escribe un presupuesto válido.");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "🤖 ANALIZANDO...";
    }

    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        toast("Tu sesión ha caducado. Inicia sesión otra vez.");
        return;
      }

      const candidates = P
        .filter(p => p.price <= budget && p.pos === pos)
        .sort((a, b) => {
          const av = key === "value" ? (a.ovr / Math.max(a.price, 1)) : (a[key] || a.ovr);
          const bv = key === "value" ? (b.ovr / Math.max(b.price, 1)) : (b[key] || b.ovr);
          return bv - av;
        })
        .slice(0, 11);

      if (!candidates.length) {
        $("results").innerHTML = `<div class="notice">No hay jugadores que cumplan esos filtros.</div>`;
        return;
      }

      const response = await fetch(FSM_AI_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          players: candidates,
          budget,
          position: pos,
          priority: key
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        toast(friendlyAuthError(payload.error || "No se pudo realizar el análisis."));
        return;
      }

      state.uses = Number(payload.usage?.remaining ?? state.uses);
      state.pro = Boolean(payload.usage?.pro ?? state.pro);
      setAuthUi();

      const result = payload.result || {};
      $("resultTitle").textContent = state.pro ? "Resultado FSM PRO" : "Resultado FSM";

      const advice = Array.isArray(result.advice) ? result.advice : [];

      $("results").innerHTML = `
        <div class="pro" style="padding:14px;border-radius:12px">
          <h3>🧠 FSM-AI ${result.version || "1.0"}</h3>
          <p>Puntuación FSM: <b>${result.score ?? "-"}</b></p>
          <p>
            GRL: <b>${result.metrics?.overall ?? "-"}</b> ·
            Ataque: <b>${result.metrics?.attack ?? "-"}</b> ·
            Pase: <b>${result.metrics?.passing ?? "-"}</b> ·
            Defensa: <b>${result.metrics?.defending ?? "-"}</b> ·
            Físico: <b>${result.metrics?.physical ?? "-"}</b>
          </p>
          <p>Prioridad: <b>${result.priority ?? "-"}</b></p>
          ${advice.map(x => `<p class="muted">💡 ${String(x)}</p>`).join("")}
        </div>
      `;
    } catch (err) {
      console.error("FSM - IA:", err);
      toast("No se pudo conectar con FSM IA.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "🔎 USAR 1 ANÁLISIS";
      }
    }
  }

  function compare() {
    const a = P.find(p => p.id == $("playerA")?.value);
    const b = P.find(p => p.id == $("playerB")?.value);

    if (!a || !b) {
      $("compareOut").innerHTML = `<div class="notice">Selecciona dos jugadores.</div>`;
      return;
    }

    const rows = [
      ["GRL", "ovr"], ["Ritmo", "pace"], ["Tiro", "shoot"],
      ["Pase", "pass"], ["Regate", "dribble"], ["Defensa", "def"], ["Físico", "phys"]
    ];

    const box = p => `
      <div class="panel">
        <h2>${p.country || ""} ${p.name}</h2>
        ${rows.map(([label, key]) => `
          <div class="metric">
            <span class="muted">${label}</span>
            <b>${p[key] ?? "-"}</b>
          </div>
        `).join("")}
        <p class="price">🪙 ${money(p.price)}</p>
      </div>`;

    $("compareOut").innerHTML = `<div class="compare">${box(a)}${box(b)}</div>`;
  }

  function buildSquad() {
    const positions = ["gk","lb","cb1","cb2","rb","cm1","cm2","cam","lw","rw","st"];
    $("formation").innerHTML = positions.map(pos => `
      <div class="spot ${pos}">
        <select data-slot>${options()}</select>
        <span>${pos.toUpperCase()}</span>
      </div>
    `).join("");

    document.querySelectorAll("[data-slot]").forEach((el, i) => {
      el.value = state.squad[i] || "";
    });
  }

  function saveAndAnalyzeSquad() {
    state.squad = [...document.querySelectorAll("[data-slot]")].map(el => el.value);

    const players = state.squad.map(id => P.find(p => p.id == id)).filter(Boolean);

    if (!players.length) {
      $("squadSummary").innerHTML = `<div class="notice">Selecciona jugadores antes de analizar.</div>`;
      return;
    }

    const avg = players.reduce((s, p) => s + Number(p.ovr || 0), 0) / players.length;
    const attack = players.reduce((s, p) => s + ((p.pace + p.shoot + p.dribble) / 3), 0) / players.length;
    const defense = players.reduce((s, p) => s + Number(p.def || 0), 0) / players.length;

    $("squadSummary").innerHTML = `
      <div class="pro" style="padding:14px;border-radius:12px">
        <h3>🧠 Análisis de plantilla</h3>
        <p>GRL medio: <b>${avg.toFixed(1)}</b></p>
        <p>Ataque: <b>${attack.toFixed(1)}</b> · Defensa: <b>${defense.toFixed(1)}</b></p>
        <p class="muted">${
          defense < 75
            ? "Prioridad: reforzar la defensa."
            : attack < 82
              ? "Prioridad: mejorar el ataque."
              : "Plantilla bastante equilibrada."
        }</p>
      </div>`;
  }

  function market() {
    const p = P.find(x => x.id == $("marketPlayer")?.value);
    const value = Number($("marketPrice")?.value || 0);

    if (!p || value <= 0) {
      $("marketOut").innerHTML = `<div class="notice">Selecciona jugador y precio.</div>`;
      return;
    }

    const ratio = value / Math.max(Number(p.price || 1), 1);
    const label =
      ratio < 0.90 ? "🟢 BUENA COMPRA" :
      ratio < 1.08 ? "🟡 PRECIO NORMAL" :
      "🔴 CARO";

    $("marketOut").innerHTML = `
      <div class="pro" style="padding:14px;border-radius:12px">
        <h2>${label}</h2>
        <p>Precio introducido: <b>🪙 ${money(value)}</b></p>
        <p>Referencia demo: <b>🪙 ${money(p.price)}</b></p>
        <p class="muted">En esta fase el precio de referencia es de demostración.</p>
      </div>`;
  }

  function openPro() {
    $("modal")?.classList.add("show");
  }

  function closePro() {
    $("modal")?.classList.remove("show");
  }

  function init() {
    if (!supabaseClient) {
      console.error("FSM: Supabase client no disponible.");
    }

    if ($("featured")) $("featured").innerHTML = P.slice(0, 5).map(card).join("");
    if ($("allPlayers")) $("allPlayers").innerHTML = P.map(card).join("");

    if ($("playerA")) $("playerA").innerHTML = options();
    if ($("playerB")) $("playerB").innerHTML = options();
    if ($("marketPlayer")) $("marketPlayer").innerHTML = options();

    if ($("formation")) buildSquad();

    document.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => go(btn.dataset.page));
    });

    document.querySelectorAll("[data-go]").forEach(btn => {
      btn.addEventListener("click", () => go(btn.dataset.go));
    });

    $("playerSearch")?.addEventListener("input", e => {
      go("players");
      filterPlayers(e.target.value);
    });

    $("recommend")?.addEventListener("click", recommend);
    $("compareBtn")?.addEventListener("click", compare);
    $("marketBtn")?.addEventListener("click", market);
    $("saveSquad")?.addEventListener("click", saveAndAnalyzeSquad);
    $("accountBtn")?.addEventListener("click", () => go("account"));
    $("authSubmit")?.addEventListener("click", auth);
    $("logout")?.addEventListener("click", logout);

    $("proBtn")?.addEventListener("click", openPro);
    $("homePro")?.addEventListener("click", openPro);
    $("accountPro")?.addEventListener("click", openPro);
    $("modalClose")?.addEventListener("click", closePro);

    $("activate")?.addEventListener("click", () => {
      toast("El pago real se añadirá en la Fase 6.");
      closePro();
    });

    setAuthUi();

    if (supabaseClient) {
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        setTimeout(() => loadProfile(session?.user || null), 0);
      });

      supabaseClient.auth.getSession()
        .then(({ data }) => loadProfile(data.session?.user || null))
        .catch(err => console.error("FSM - getSession:", err));
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
