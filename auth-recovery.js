(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const RESET_PATH = "/#account";

  let supabaseClient = null;
  let recoveryReady = false;
  let exchangeStarted = false;

  function qs(id) {
    return document.getElementById(id);
  }

  function toast(message) {
    const el = qs("toast");

    if (!el) {
      window.alert(message);
      return;
    }

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(el._fsmRecoveryTimer);

    el._fsmRecoveryTimer = setTimeout(
      () => el.classList.remove("show"),
      3500
    );
  }

  function getClient() {
    if (supabaseClient) {
      return supabaseClient;
    }

    if (!window.supabase?.createClient) {
      toast(
        "Supabase todavía no está cargado. Recarga la página."
      );
      return null;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    return supabaseClient;
  }

  function addStyles() {
    if (qs("fsmRecoveryStyles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "fsmRecoveryStyles";

    style.textContent = `
      .fsm-recovery-link{
        display:inline-block;
        margin-top:10px;
        background:none;
        border:0;
        padding:0;
        color:#bcaeff;
        text-decoration:underline;
        cursor:pointer;
        font:inherit;
        font-size:12px;
      }

      .fsm-recovery-link:hover{
        color:#fff;
      }

      .fsm-recovery-overlay{
        position:fixed;
        inset:0;
        z-index:100000;
        display:none;
        align-items:center;
        justify-content:center;
        padding:16px;
        background:#000c;
        backdrop-filter:blur(8px);
      }

      .fsm-recovery-overlay.open{
        display:flex;
      }

      .fsm-recovery-box{
        width:min(470px,100%);
        background:#101722;
        border:1px solid #ffffff16;
        border-radius:18px;
        padding:22px;
        box-shadow:0 30px 100px #000b;
      }

      .fsm-recovery-box h2{
        margin:0;
        color:#fff;
      }

      .fsm-recovery-box p{
        color:#929caf;
        font-size:12px;
        line-height:1.5;
      }

      .fsm-recovery-box label{
        display:block;
        margin-top:12px;
        color:#c8ced9;
        font-size:12px;
        font-weight:700;
      }

      .fsm-recovery-box input{
        width:100%;
        box-sizing:border-box;
        margin-top:7px;
        padding:12px;
        border-radius:10px;
        border:1px solid #ffffff16;
        background:#080c13;
        color:#fff;
        outline:none;
      }

      .fsm-recovery-box input:focus{
        border-color:#7c5cff80;
        box-shadow:0 0 0 3px #7c5cff16;
      }

      .fsm-recovery-actions{
        display:flex;
        gap:8px;
        margin-top:14px;
      }

      .fsm-recovery-actions button{
        flex:1;
        border-radius:10px;
        padding:11px 12px;
        font-weight:800;
        cursor:pointer;
      }

      .fsm-recovery-save{
        border:0;
        background:#7c5cff;
        color:#fff;
      }

      .fsm-recovery-cancel{
        background:#ffffff0a;
        color:#fff;
        border:1px solid #ffffff12;
      }

      .fsm-recovery-error{
        display:none;
        margin-top:10px;
        color:#ffb4b4;
        font-size:12px;
        line-height:1.4;
      }

      .fsm-recovery-info{
        display:none;
        margin-top:10px;
        color:#bcaeff;
        font-size:12px;
      }
    `;

    document.head.appendChild(style);
  }

  function createRecoveryModal() {
    if (qs("fsmRecoveryOverlay")) {
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
          Recuperar contraseña
        </h2>

        <p id="fsmRecoveryDescription">
          Introduce tu nueva contraseña y confírmala.
        </p>

        <label for="fsmRecoveryNewPassword">
          Nueva contraseña
        </label>

        <input
          id="fsmRecoveryNewPassword"
          type="password"
          autocomplete="new-password"
          minlength="6"
          placeholder="Mínimo 6 caracteres"
        >

        <label for="fsmRecoveryConfirmPassword">
          Repite la contraseña
        </label>

        <input
          id="fsmRecoveryConfirmPassword"
          type="password"
          autocomplete="new-password"
          minlength="6"
          placeholder="Repite la contraseña"
        >

        <div
          id="fsmRecoveryError"
          class="fsm-recovery-error"
        ></div>

        <div
          id="fsmRecoveryInfo"
          class="fsm-recovery-info"
        >
          La contraseña se está actualizando...
        </div>

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

    qs("fsmRecoveryCancel")?.addEventListener(
      "click",
      closeRecoveryModal
    );

    overlay.addEventListener(
      "click",
      event => {
        if (event.target === overlay) {
          closeRecoveryModal();
        }
      }
    );

    qs("fsmRecoverySave")?.addEventListener(
      "click",
      updatePassword
    );

    [
      "fsmRecoveryNewPassword",
      "fsmRecoveryConfirmPassword"
    ].forEach(id => {
      qs(id)?.addEventListener(
        "keydown",
        event => {
          if (event.key === "Enter") {
            updatePassword();
          }

          if (event.key === "Escape") {
            closeRecoveryModal();
          }
        }
      );
    });
  }

  function showRecoveryModal() {
    recoveryReady = true;

    const modal =
      qs("fsmRecoveryOverlay");

    if (!modal) {
      return;
    }

    modal.classList.add("open");

    const error =
      qs("fsmRecoveryError");

    const info =
      qs("fsmRecoveryInfo");

    if (error) {
      error.style.display = "none";
      error.textContent = "";
    }

    if (info) {
      info.style.display = "none";
    }

    qs("fsmRecoveryNewPassword")?.focus();
  }

  function closeRecoveryModal() {
    qs("fsmRecoveryOverlay")?.classList.remove("open");
  }

  function showRecoveryError(message) {
    const el =
      qs("fsmRecoveryError");

    if (!el) {
      toast(message);
      return;
    }

    el.textContent = message;
    el.style.display = "block";
  }

  async function updatePassword() {
    const client = getClient();

    if (!client) {
      return;
    }

    const newPassword =
      qs("fsmRecoveryNewPassword")
        ?.value || "";

    const confirmPassword =
      qs("fsmRecoveryConfirmPassword")
        ?.value || "";

    if (newPassword.length < 6) {
      showRecoveryError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showRecoveryError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    const button =
      qs("fsmRecoverySave");

    const info =
      qs("fsmRecoveryInfo");

    if (button) {
      button.disabled = true;
      button.textContent = "Guardando...";
    }

    if (info) {
      info.style.display = "block";
    }

    const errorBox =
      qs("fsmRecoveryError");

    if (errorBox) {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }

    try {
      const {
        data: {
          session
        }
      } =
        await client.auth.getSession();

      if (!session?.user) {
        throw new Error(
          "El enlace de recuperación ha caducado. Solicita otro enlace."
        );
      }

      const {
        error
      } =
        await client.auth.updateUser({
          password: newPassword
        });

      if (error) {
        throw error;
      }

      await client.auth.signOut();

      closeRecoveryModal();

      toast(
        "✅ Contraseña actualizada. Ahora inicia sesión con tu nueva contraseña."
      );

      const cleanUrl =
        window.location.origin +
        window.location.pathname +
        window.location.search +
        "#account";

      history.replaceState(
        null,
        "",
        cleanUrl
      );

      setTimeout(
        () => {
          window.location.hash =
            "account";
        },
        100
      );

      const passwordInput =
        qs("password");

      if (passwordInput) {
        passwordInput.value = "";
      }

      if (qs("email")) {
        qs("email").focus();
      }
    } catch (error) {
      console.error(
        "FSM recovery update:",
        error
      );

      showRecoveryError(
        error?.message ||
        "No se pudo actualizar la contraseña."
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "Guardar contraseña";
      }

      if (info) {
        info.style.display = "none";
      }
    }
  }

  async function sendRecoveryEmail() {
    const client = getClient();

    if (!client) {
      return;
    }

    const emailInput =
      qs("email");

    const email =
      String(
        emailInput?.value || ""
      )
        .trim()
        .toLowerCase();

    if (!email) {
      showRecoveryRequestModal();
      return;
    }

    await sendRecoveryForEmail(email);
  }

  function createRequestModal() {
    if (qs("fsmRecoveryRequestOverlay")) {
      return;
    }

    const overlay =
      document.createElement("div");

    overlay.id =
      "fsmRecoveryRequestOverlay";

    overlay.className =
      "fsm-recovery-overlay";

    overlay.innerHTML = `
      <div
        class="fsm-recovery-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fsmRecoveryRequestTitle"
      >
        <h2 id="fsmRecoveryRequestTitle">
          Recuperar contraseña
        </h2>

        <p>
          Escribe tu correo y te enviaremos
          un enlace para crear una contraseña nueva.
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

    document.body.appendChild(overlay);

    qs("fsmRecoveryRequestCancel")?.addEventListener(
      "click",
      closeRequestModal
    );

    overlay.addEventListener(
      "click",
      event => {
        if (event.target === overlay) {
          closeRequestModal();
        }
      }
    );

    qs("fsmRecoveryRequestSend")?.addEventListener(
      "click",
      () => {
        const email =
          String(
            qs("fsmRecoveryEmail")?.value ||
            ""
          )
            .trim()
            .toLowerCase();

        if (!email) {
          toast(
            "Escribe tu correo electrónico."
          );
          return;
        }

        sendRecoveryForEmail(email);
      }
    );
  }

  function showRecoveryRequestModal() {
    createRequestModal();

    const modal =
      qs("fsmRecoveryRequestOverlay");

    const input =
      qs("fsmRecoveryEmail");

    const accountEmail =
      String(
        qs("email")?.value ||
        ""
      )
        .trim()
        .toLowerCase();

    if (
      input &&
      !input.value &&
      accountEmail
    ) {
      input.value = accountEmail;
    }

    modal?.classList.add("open");

    setTimeout(
      () => input?.focus(),
      0
    );
  }

  function closeRequestModal() {
    qs("fsmRecoveryRequestOverlay")
      ?.classList.remove("open");
  }

  async function sendRecoveryForEmail(email) {
    const client = getClient();

    if (!client) {
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      toast(
        "Escribe un correo electrónico válido."
      );
      return;
    }

    const button =
      qs("fsmRecoveryRequestSend");

    if (button) {
      button.disabled = true;
      button.textContent = "Enviando...";
    }

    try {
      const {
        error
      } =
        await client.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${window.location.origin}${RESET_PATH}`
          }
        );

      if (error) {
        throw error;
      }

      closeRequestModal();

      toast(
        "✅ Hemos enviado el enlace de recuperación a tu correo."
      );
    } catch (error) {
      console.error(
        "FSM password recovery request:",
        error
      );

      toast(
        error?.message ||
        "No se pudo enviar el correo de recuperación."
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Enviar enlace";
      }
    }
  }

  function addRecoveryLink() {
    if (qs("fsmRecoveryLink")) {
      return;
    }

    const authBox =
      qs("authBox");

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
      sendRecoveryEmail
    );

    authBox.appendChild(link);
  }

  function hasRecoveryHash() {
    return (
      window.location.hash.includes(
        "type=recovery"
      ) ||
      window.location.hash.includes(
        "access_token="
      ) ||
      window.location.hash.includes(
        "refresh_token="
      )
    );
  }

  function hasRecoveryCode() {
    return Boolean(
      new URLSearchParams(
        window.location.search
      ).get("code")
    );
  }

  async function exchangeRecoveryCode() {
    const client = getClient();

    if (
      !client ||
      exchangeStarted
    ) {
      return false;
    }

    const code =
      new URLSearchParams(
        window.location.search
      ).get("code");

    if (!code) {
      return false;
    }

    exchangeStarted = true;

    try {
      const {
        error
      } =
        await client.auth.exchangeCodeForSession(
          code
        );

      if (error) {
        throw error;
      }

      const clean =
        window.location.origin +
        window.location.pathname +
        "#account";

      history.replaceState(
        null,
        "",
        clean
      );

      return true;
    } catch (error) {
      console.error(
        "FSM recovery exchange:",
        error
      );

      toast(
        "El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo."
      );

      return false;
    }
  }

  async function prepareRecoveryFlow() {
    const client = getClient();

    if (!client) {
      return;
    }

    if (hasRecoveryCode()) {
      const exchanged =
        await exchangeRecoveryCode();

      if (!exchanged) {
        return;
      }
    }

    const {
      data: {
        session
      }
    } =
      await client.auth.getSession();

    if (
      session?.user &&
      (
        recoveryReady ||
        hasRecoveryHash()
      )
    ) {
      showRecoveryModal();
      return;
    }

    client.auth.onAuthStateChange(
      (event, nextSession) => {
        if (
          event ===
          "PASSWORD_RECOVERY"
        ) {
          recoveryReady = true;
          showRecoveryModal();
        } else if (
          event ===
          "SIGNED_IN" &&
          hasRecoveryHash()
        ) {
          recoveryReady = true;
          showRecoveryModal();
        }
      }
    );
  }

  function init() {
    addStyles();
    createRecoveryModal();
    createRequestModal();
    addRecoveryLink();

    setTimeout(
      () => {
        void prepareRecoveryFlow();
      },
      150
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
