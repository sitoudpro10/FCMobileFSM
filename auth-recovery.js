(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const RESET_PATH =
    "/#account";

  function qs(id) {
    return document.getElementById(id);
  }

  function toast(message) {
    const el =
      qs("toast");

    if (!el) {
      window.alert(
        message
      );
      return;
    }

    el.textContent =
      message;

    el.classList.add(
      "show"
    );

    clearTimeout(
      el._fsmRecoveryTimer
    );

    el._fsmRecoveryTimer =
      setTimeout(
        () =>
          el.classList.remove(
            "show"
          ),
        3500
      );
  }

  function getClient() {
    if (
      !window.supabase?.createClient
    ) {
      toast(
        "Supabase todavía no está cargado. Recarga la página."
      );

      return null;
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }

  function addStyles() {
    if (
      document.getElementById(
        "fsmRecoveryStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "fsmRecoveryStyles";

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
        width:min(460px,100%);
        background:#101722;
        border:1px solid #ffffff16;
        border-radius:16px;
        padding:20px;
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

      .fsm-recovery-box input{
        width:100%;
        box-sizing:border-box;
        margin-top:8px;
        padding:11px 12px;
        border-radius:10px;
        border:1px solid #ffffff16;
        background:#080c13;
        color:#fff;
        outline:none;
      }

      .fsm-recovery-actions{
        display:flex;
        gap:8px;
        margin-top:12px;
      }

      .fsm-recovery-actions button{
        flex:1;
        border:0;
        border-radius:10px;
        padding:11px 12px;
        font-weight:800;
        cursor:pointer;
      }

      .fsm-recovery-send{
        background:#7c5cff;
        color:#fff;
      }

      .fsm-recovery-cancel{
        background:#ffffff0a;
        color:#fff;
        border:1px solid #ffffff12 !important;
      }
    `;

    document.head.appendChild(
      style
    );
  }

  function createModal() {
    if (
      qs(
        "fsmRecoveryOverlay"
      )
    ) {
      return;
    }

    const overlay =
      document.createElement(
        "div"
      );

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

        <h2
          id="fsmRecoveryTitle"
        >
          Recuperar contraseña
        </h2>

        <p>
          Escribe tu correo y te enviaremos
          un enlace para crear una nueva contraseña.
        </p>

        <input
          id="fsmRecoveryEmail"
          type="email"
          autocomplete="email"
          placeholder="tu@email.com"
        >

        <div class="fsm-recovery-actions">

          <button
            id="fsmRecoveryCancel"
            type="button"
            class="fsm-recovery-cancel"
          >
            Cancelar
          </button>

          <button
            id="fsmRecoverySend"
            type="button"
            class="fsm-recovery-send"
          >
            Enviar enlace
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    qs(
      "fsmRecoveryCancel"
    ).addEventListener(
      "click",
      closeModal
    );

    overlay.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          overlay
        ) {
          closeModal();
        }
      }
    );

    qs(
      "fsmRecoverySend"
    ).addEventListener(
      "click",
      sendRecovery
    );

    qs(
      "fsmRecoveryEmail"
    ).addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {
          sendRecovery();
        }

        if (
          event.key ===
          "Escape"
        ) {
          closeModal();
        }
      }
    );
  }

  function openModal() {
    const modal =
      qs(
        "fsmRecoveryOverlay"
      );

    if (!modal) {
      return;
    }

    modal.classList.add(
      "open"
    );

    const input =
      qs(
        "fsmRecoveryEmail"
      );

    const accountEmail =
      qs(
        "email"
      )?.value?.trim() ||
      "";

    if (
      input &&
      !input.value &&
      accountEmail
    ) {
      input.value =
        accountEmail;
    }

    setTimeout(
      () =>
        input?.focus(),
      0
    );
  }

  function closeModal() {
    qs(
      "fsmRecoveryOverlay"
    )?.classList.remove(
      "open"
    );
  }

  async function sendRecovery() {
    const client =
      getClient();

    if (!client) {
      return;
    }

    const input =
      qs(
        "fsmRecoveryEmail"
      );

    const email =
      String(
        input?.value ||
        ""
      )
        .trim()
        .toLowerCase();

    if (!email) {
      toast(
        "Escribe tu correo electrónico."
      );

      input?.focus();

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      toast(
        "Escribe un correo electrónico válido."
      );

      input?.focus();

      return;
    }

    const button =
      qs(
        "fsmRecoverySend"
      );

    if (button) {
      button.disabled =
        true;

      button.textContent =
        "Enviando...";
    }

    try {

      const redirectTo =
        `${window.location.origin}${RESET_PATH}`;

      const {
        error
      } =
        await client.auth.resetPasswordForEmail(
          email,
          {
            redirectTo
          }
        );

      if (error) {
        throw error;
      }

      closeModal();

      toast(
        "✅ Te hemos enviado el enlace de recuperación."
      );

    } catch (
      error
    ) {

      console.error(
        "FSM password recovery:",
        error
      );

      toast(
        error?.message ||
        "No se pudo enviar el correo de recuperación."
      );

    } finally {

      if (button) {
        button.disabled =
          false;

        button.textContent =
          "Enviar enlace";
      }
    }
  }

  function addRecoveryLink() {
    if (
      qs(
        "fsmRecoveryLink"
      )
    ) {
      return;
    }

    const authBox =
      qs(
        "authBox"
      );

    if (!authBox) {
      return;
    }

    const link =
      document.createElement(
        "button"
      );

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
      openModal
    );

    authBox.appendChild(
      link
    );
  }

  async function handleRecoveryCallback() {

    const client =
      getClient();

    if (!client) {
      return;
    }

    try {

      const {
        data: {
          session
        }
      } =
        await client.auth.getSession();

      const isRecovery =
        window.location.hash.includes(
          "type=recovery"
        );

      if (
        isRecovery &&
        session?.user
      ) {

        const password =
          window.prompt(
            "Introduce tu nueva contraseña (mínimo 6 caracteres):"
          );

        if (
          !password
        ) {
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

        const {
          error
        } =
          await client.auth.updateUser(
            {
              password
            }
          );

        if (error) {
          throw error;
        }

        toast(
          "✅ Contraseña actualizada correctamente."
        );

        history.replaceState(
          null,
          "",
          window.location.pathname +
          window.location.search
        );
      }

    } catch (
      error
    ) {

      console.error(
        "FSM recovery callback:",
        error
      );

      toast(
        error?.message ||
        "No se pudo completar la recuperación."
      );
    }
  }

  function init() {

    addStyles();

    createModal();

    addRecoveryLink();

    void handleRecoveryCallback();
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:true
      }
    );

  } else {

    init();
  }

})();
