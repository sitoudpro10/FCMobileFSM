(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const RECOVERY_PENDING_KEY =
    "fsm_recovery_pending_v2";

  let supabaseClient = null;
  let recoveryReady = false;
  let modalCreated = false;

  const $ = id =>
    document.getElementById(id);

  function toast(message) {
    const el = $("toast");

    if (!el) {
      window.alert(message);
      return;
    }

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(el._fsmToastTimer);

    el._fsmToastTimer = setTimeout(
      () => el.classList.remove("show"),
      3500
    );
  }

  function getClient() {
    if (supabaseClient) {
      return supabaseClient;
    }

    if (!window.supabase?.createClient) {
      return null;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
          auth: {
            detectSessionInUrl: true,
            persistSession: true,
            autoRefreshToken: true
          }
        }
      );

    return supabaseClient;
  }

  function addStyles() {
    if ($("fsmRecoveryStyles")) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "fsmRecoveryStyles";

    style.textContent = `
      .fsm-recovery-link{
        display:inline-block;
        margin-top:10px;
        padding:0;
        border:0;
        background:none;
        color:#bcaeff;
        text-decoration:underline;
        cursor:pointer;
        font:inherit;
        font-size:12px;
      }

      .fsm-recovery-overlay{
        position:fixed;
        inset:0;
        z-index:99999;
        display:none;
        align-items:center;
        justify-content:center;
        padding:16px;
        background:rgba(0,0,0,.78);
        backdrop-filter:blur(8px);
      }

      .fsm-recovery-overlay.open{
        display:flex;
      }

      .fsm-recovery-box{
        width:min(470px,100%);
        box-sizing:border-box;
        padding:22px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:18px;
        background:#101722;
        box-shadow:0 30px 100px rgba(0,0,0,.65);
      }

      .fsm-recovery-box h2{
        margin:0 0 8px;
        color:#fff;
      }

      .fsm-recovery-box p{
        margin:0 0 12px;
        color:#929caf;
        font-size:12px;
        line-height:1.5;
      }

      .fsm-recovery-box label{
        display:block;
        margin:12px 0 6px;
        color:#c8ced9;
        font-size:12px;
        font-weight:700;
      }

      .fsm-recovery-box input{
        width:100%;
        box-sizing:border-box;
        padding:12px;
        border:1px solid rgba(255,255,255,.1);
        border-radius:10px;
        outline:none;
        background:#080c13;
        color:#fff;
      }

      .fsm-recovery-actions{
        display:flex;
        gap:8px;
        margin-top:14px;
      }

      .fsm-recovery-actions button{
        flex:1;
        padding:11px 12px;
        border-radius:10px;
        font-weight:800;
        cursor:pointer;
      }

      .fsm-recovery-save{
        border:0;
        background:#7c5cff;
        color:#fff;
      }

      .fsm-recovery-cancel{
        border:1px solid rgba(255,255,255,.1);
        background:rgba(255,255,255,.04);
        color:#fff;
      }

      .fsm-recovery-error{
        display:none;
        margin-top:10px;
        color:#ffb4b4;
        font-size:12px;
        line-height:1.4;
      }
    `;

    document.head.appendChild(style);
  }

  function createRecoveryModal() {
    if (modalCreated || $("fsmRecoveryOverlay")) {
      modalCreated = true;
      return;
    }

    const overlay =
      document.createElement("div");

    overlay.id =
      "fsmRecoveryOverlay";

    overlay.className =
      "fsm-recovery-overlay";

    overlay.innerHTML = `
      <div
        class="fsm-recovery-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fsmRecoveryTitle"
      >
        <h2 id="fsmRecoveryTitle">
          Crear nueva contraseña
        </h2>

        <p>
          Escribe una nueva contraseña para tu cuenta.
        </p>

        <label for="fsmRecoveryNew">
          Nueva contraseña
        </label>

        <input
          id="fsmRecoveryNew"
          type="password"
          minlength="6"
          autocomplete="new-password"
          placeholder="Mínimo 6 caracteres"
        >

        <label for="fsmRecoveryConfirm">
          Repite la contraseña
        </label>

        <input
          id="fsmRecoveryConfirm"
          type="password"
          minlength="6"
          autocomplete="new-password"
          placeholder="Repite la contraseña"
        >

        <div
          id="fsmRecoveryError"
          class="fsm-recovery-error"
        ></div>

        <div class="fsm-recovery-actions">
          <button
            id="fsmRecoveryCancel"
            type="button"
            class="fsm-recovery-cancel"
          >
            Cancelar
          </button>

          <button
            id="fsmRecoverySave"
            type="button"
            class="fsm-recovery-save"
          >
            Guardar contraseña
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    modalCreated = true;

    $("fsmRecoveryCancel")?.addEventListener(
      "click",
      () => closeRecoveryModal()
    );

    overlay.addEventListener(
      "click",
      event => {
        if (event.target === overlay) {
          closeRecoveryModal();
        }
      }
    );

    $("fsmRecoverySave")?.addEventListener(
      "click",
      () => updatePassword()
    );

    [
      "fsmRecoveryNew",
      "fsmRecoveryConfirm"
    ].forEach(id => {
      $(id)?.addEventListener(
        "keydown",
        event => {
          if (event.key === "Enter") {
            updatePassword();
          }
        }
      );
    });
  }

  function openRecoveryModal() {
    createRecoveryModal();

    $("fsmRecoveryError").style.display = "none";
    $("fsmRecoveryError").textContent = "";

    $("fsmRecoveryOverlay")
      ?.classList.add("open");

    $("fsmRecoveryNew")
      ?.focus();
  }

  function closeRecoveryModal() {
    $("fsmRecoveryOverlay")
      ?.classList.remove("open");
  }

  function showError(message) {
    const el =
      $("fsmRecoveryError");

    if (!el) {
      toast(message);
      return;
    }

    el.textContent = message;
    el.style.display = "block";
  }

  function markRecoveryPending() {
    try {
      localStorage.setItem(
        RECOVERY_PENDING_KEY,
        "1"
      );
    } catch {}
  }

  function consumeRecoveryPending() {
    try {
      const pending =
        localStorage.getItem(
          RECOVERY_PENDING_KEY
        ) === "1";

      localStorage.removeItem(
        RECOVERY_PENDING_KEY
      );

      return pending;
    } catch {
      return false;
    }
  }

  function addRecoveryLink() {
    if ($("fsmRecoveryLink")) {
      return;
    }

    const authBox =
      $("authBox");

    if (!authBox) {
      return;
    }

    const link =
      document.createElement("button");

    link.id =
      "fsmRecoveryLink";

    link.type =
      "button";

    link.className =
      "fsm-recovery-link";

    link.textContent =
      "¿Has olvidado tu contraseña?";

    link.addEventListener(
      "click",
      () => openRequestModal()
    );

    authBox.appendChild(link);
  }

  function openRequestModal() {
    let modal =
      $("fsmRequestRecoveryOverlay");

    if (!modal) {
      modal =
        document.createElement("div");

      modal.id =
        "fsmRequestRecoveryOverlay";

      modal.className =
        "fsm-recovery-overlay";

      modal.innerHTML = `
        <div class="fsm-recovery-box">
          <h2>
            Recuperar contraseña
          </h2>

          <p>
            Te enviaremos un enlace al correo de tu cuenta.
          </p>

          <label for="fsmRecoveryEmail">
            Correo electrónico
          </label>

          <input
            id="fsmRecoveryEmail"
            type="email"
            autocomplete="email"
            placeholder="tu@email.com"
          >

          <div class="fsm-recovery-actions">
            <button
              id="fsmRecoveryRequestCancel"
              type="button"
              class="fsm-recovery-cancel"
            >
              Cancelar
            </button>

            <button
              id="fsmRecoveryRequestSend"
              type="button"
              class="fsm-recovery-save"
            >
              Enviar enlace
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      $("fsmRecoveryRequestCancel")
        ?.addEventListener(
          "click",
          () =>
            modal.classList.remove(
              "open"
            )
        );

      modal.addEventListener(
        "click",
        event => {
          if (event.target === modal) {
            modal.classList.remove(
              "open"
            );
          }
        }
      );

      $("fsmRecoveryRequestSend")
        ?.addEventListener(
          "click",
          () => sendRecoveryEmail()
        );
    }

    const accountEmail =
      String(
        $("email")?.value || ""
      )
        .trim()
        .toLowerCase();

    if (
      accountEmail &&
      $("fsmRecoveryEmail")
    ) {
      $("fsmRecoveryEmail").value =
        accountEmail;
    }

    modal.classList.add("open");

    $("fsmRecoveryEmail")
      ?.focus();
  }

  async function sendRecoveryEmail() {
    const client =
      getClient();

    if (!client) {
      toast(
        "Supabase todavía no está listo. Recarga la página."
      );
      return;
    }

    const email =
      String(
        $("fsmRecoveryEmail")?.value ||
        $("email")?.value ||
        ""
      )
        .trim()
        .toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      toast(
        "Escribe un correo electrónico válido."
      );
      return;
    }

    const button =
      $("fsmRecoveryRequestSend");

    if (button) {
      button.disabled = true;
      button.textContent =
        "Enviando...";
    }

    try {
      markRecoveryPending();

      const {
        error
      } =
        await client.auth
          .resetPasswordForEmail(
            email,
            {
              redirectTo:
                `${window.location.origin}/#account`
            }
          );

      if (error) {
        throw error;
      }

      $("fsmRequestRecoveryOverlay")
        ?.classList.remove(
          "open"
        );

      toast(
        "✅ Hemos enviado el enlace de recuperación."
      );
    } catch (error) {
      console.error(
        "FSM recovery request:",
        error
      );

      try {
        localStorage.removeItem(
          RECOVERY_PENDING_KEY
        );
      } catch {}

      toast(
        error?.message ||
        "No se pudo enviar el enlace."
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "Enviar enlace";
      }
    }
  }

  async function updatePassword() {
    const client =
      getClient();

    if (!client) {
      return;
    }

    const password =
      $("fsmRecoveryNew")?.value ||
      "";

    const confirm =
      $("fsmRecoveryConfirm")?.value ||
      "";

    if (password.length < 6) {
      showError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (password !== confirm) {
      showError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    const button =
      $("fsmRecoverySave");

    if (button) {
      button.disabled = true;
      button.textContent =
        "Guardando...";
    }

    try {
      const {
        error
      } =
        await client.auth.updateUser({
          password
        });

      if (error) {
        throw error;
      }

      recoveryReady = false;

      closeRecoveryModal();

      try {
        localStorage.removeItem(
          RECOVERY_PENDING_KEY
        );
      } catch {}

      toast(
        "✅ Contraseña cambiada correctamente."
      );

      const email =
        $("email");

      const pass =
        $("password");

      if (pass) {
        pass.value = "";
      }

      setTimeout(
        () => {
          if (email) {
            email.focus();
          }

          window.location.hash =
            "account";
        },
        300
      );

      await client.auth.signOut();
    } catch (error) {
      console.error(
        "FSM recovery update:",
        error
      );

      showError(
        error?.message ||
        "No se pudo cambiar la contraseña."
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "Guardar contraseña";
      }
    }
  }

  async function init() {
    addStyles();
    createRecoveryModal();
    addRecoveryLink();

    const client =
      getClient();

    if (!client) {
      return;
    }

    /*
      MUY IMPORTANTE:
      registrar el listener ANTES de getSession()
      para no perder PASSWORD_RECOVERY.
    */
    client.auth.onAuthStateChange(
      (event, session) => {
        if (
          event ===
          "PASSWORD_RECOVERY"
        ) {
          recoveryReady = true;
          openRecoveryModal();
          return;
        }

        if (
          event === "SIGNED_IN" &&
          session?.user &&
          consumeRecoveryPending()
        ) {
          recoveryReady = true;
          openRecoveryModal();
        }
      }
    );

    /*
      Si el evento ya pasó antes de que
      termináramos de montar la interfaz,
      usamos la bandera guardada antes del envío.
    */
    const pending =
      consumeRecoveryPending();

    const {
      data: {
        session
      }
    } =
      await client.auth.getSession();

    if (
      session?.user &&
      (
        pending ||
        recoveryReady
      )
    ) {
      recoveryReady = true;
      openRecoveryModal();
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => void init(),
      { once: true }
    );
  } else {
    void init();
  }
})();
