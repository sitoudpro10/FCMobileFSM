(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const CHECKOUT_URL =
    `${SUPABASE_URL}/functions/v1/create-fsm-checkout`;

  const $ = id => document.getElementById(id);

  const escapeHTML = value =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatMoney = value => {
    const n = Number(value) || 0;

    if (!n) return "—";
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${Math.round(n / 1e6)}M`;

    return new Intl.NumberFormat("es-ES").format(n);
  };

  const getPlayers = () =>
    Array.isArray(window.FSM_PLAYERS)
      ? window.FSM_PLAYERS
      : [];

  const getPlayer = id =>
    getPlayers().find(
      player =>
        String(player?.id ?? "") ===
        String(id ?? "")
    ) || null;

  function showToast(message) {
    const toast = $("toast");

    if (!toast) {
      alert(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toast._fsmTimer);

    toast._fsmTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  async function startStripeCheckout(button) {
    if (button.dataset.fsmCheckoutBusy === "true") {
      return;
    }

    button.dataset.fsmCheckoutBusy = "true";
    button.disabled = true;

    const originalText =
      button.textContent;

    button.textContent =
      "ABRIENDO STRIPE...";

    try {
      if (
        !window.supabase ||
        !window.supabase.createClient
      ) {
        throw new Error(
          "Supabase todavía no está cargado."
        );
      }

      const supabase =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );

      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session =
        sessionData?.session;

      if (!session?.access_token) {
        throw new Error(
          "Debes iniciar sesión antes de activar FSM PRO."
        );
      }

      const response =
        await fetch(
          CHECKOUT_URL,
          {
            method: "POST",

            headers: {
              "Authorization":
                `Bearer ${session.access_token}`,

              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              return_to:
                window.location.href
            })
          }
        );

      let result = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.error ||
          result?.message ||
          `Error de pago (${response.status}).`
        );
      }

      if (!result?.url) {
        throw new Error(
          "Stripe no devolvió la página de pago."
        );
      }

      window.location.href =
        result.url;

    } catch (error) {
      console.error(
        "FSM PRO checkout:",
        error
      );

      showToast(
        error?.message ||
        "No se pudo abrir el pago."
      );

      button.disabled = false;
      button.textContent =
        originalText;

      button.dataset.fsmCheckoutBusy =
        "false";
    }
  }

  function connectProButtons() {
    const buttonIds = [
      "activate",
      "homePro",
      "accountPro",
      "proBtn"
    ];

    buttonIds.forEach(id => {
      const button = $(id);

      if (!button) return;

      if (
        button.dataset.fsmCheckoutConnected ===
        "true"
      ) {
        return;
      }

      button.dataset.fsmCheckoutConnected =
        "true";

      button.addEventListener(
        "click",
        event => {
          event.preventDefault();
          event.stopPropagation();

          startStripeCheckout(
            button
          );
        },
        true
      );
    });

    const activate =
      $("activate");

    if (activate) {
      activate.textContent =
        "ACTIVAR PRO · 2,99 €/MES";
    }
  }

  function addStyles() {
    if (
      $("fsmPlayerDetailStyle")
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "fsmPlayerDetailStyle";

    style.textContent = `
      #fsmPlayerDetail {
        position: fixed;
        inset: 0;
        z-index: 120000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(0,0,0,.82);
        backdrop-filter: blur(10px);
      }

      #fsmPlayerDetail.open {
        display: flex;
      }

      .fsm-pd-box {
        width: min(780px,100%);
        max-height: 90vh;
        overflow: auto;
        background: #0f1520;
        border: 1px solid #ffffff14;
        border-radius: 20px;
        box-shadow: 0 30px 100px #000b;
      }

      .fsm-pd-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 18px;
        color: #fff;
        border-bottom: 1px solid #ffffff0d;
      }

      .fsm-pd-close {
        width: 38px;
        height: 38px;
        border: 1px solid #ffffff12;
        border-radius: 10px;
        background: #ffffff08;
        color: #fff;
        font-size: 22px;
        cursor: pointer;
      }

      .fsm-pd-main {
        display: grid;
        grid-template-columns: 270px 1fr;
        gap: 20px;
        padding: 20px;
      }

      .fsm-pd-visual {
        position: relative;
        min-height: 330px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border: 1px solid #ffffff10;
        border-radius: 16px;
        background:
          linear-gradient(
            160deg,
            #171326,
            #080c13
          );
      }

      .fsm-pd-visual img {
        width: 100%;
        height: 100%;
        max-height: 420px;
        object-fit: contain;
        padding: 12px;
        box-sizing: border-box;
      }

      .fsm-pd-initials {
        font-size: 76px;
        font-weight: 950;
        color: #fff;
      }

      .fsm-pd-ovr {
        position: absolute;
        top: 12px;
        left: 14px;
        z-index: 2;
        font-size: 36px;
        font-weight: 950;
        color: #fff;
      }

      .fsm-pd-pos {
        position: absolute;
        top: 56px;
        left: 16px;
        z-index: 2;
        color: #bcaeff;
        font-weight: 900;
      }

      .fsm-pd-info h2 {
        margin: 0;
        color: #fff;
        font-size: 30px;
      }

      .fsm-pd-meta {
        margin: 6px 0 14px;
        color: #929caf;
        font-size: 13px;
      }

      .fsm-pd-price {
        margin-bottom: 16px;
        color: #fff;
        font-size: 28px;
        font-weight: 950;
      }

      .fsm-pd-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      .fsm-pd-actions button {
        padding: 10px 13px;
        border-radius: 10px;
        font-weight: 800;
        cursor: pointer;
      }

      .fsm-pd-primary {
        border: 0;
        background: #7c5cff;
        color: #fff;
      }

      .fsm-pd-secondary {
        border: 1px solid #ffffff12;
        background: #ffffff08;
        color: #fff;
      }

      .fsm-pd-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .fsm-pd-stat {
        display: flex;
        justify-content: space-between;
        padding: 10px 12px;
        border: 1px solid #ffffff0c;
        border-radius: 10px;
        background: #ffffff04;
        color: #aeb5c5;
        font-size: 12px;
      }

      .fsm-pd-stat b {
        color: #fff;
      }

      button:disabled {
        cursor: wait;
        opacity: .7;
      }

      @media (max-width:700px) {
        .fsm-pd-main {
          grid-template-columns: 1fr;
        }

        .fsm-pd-visual {
          min-height: 250px;
        }

        .fsm-pd-stats {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createPlayerModal() {
    if ($("fsmPlayerDetail")) {
      return;
    }

    const modal =
      document.createElement("div");

    modal.id =
      "fsmPlayerDetail";

    modal.innerHTML = `
      <div class="fsm-pd-box">

        <div class="fsm-pd-head">
          <strong>
            Ficha del jugador
          </strong>

          <button
            id="fsmPdClose"
            class="fsm-pd-close"
            type="button"
          >
            ×
          </button>
        </div>

        <div id="fsmPdContent"></div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    const close = () => {
      modal.classList.remove(
        "open"
      );

      document.body.style.overflow =
        "";
    };

    $("fsmPdClose").onclick =
      close;

    modal.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          modal
        ) {
          close();
        }
      }
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key ===
          "Escape"
        ) {
          close();
        }
      }
    );
  }

  function openPlayer(player) {
    if (!player) {
      return;
    }

    addStyles();
    createPlayerModal();

    const card =
      document.querySelector(
        `.card[data-player-id="${CSS.escape(
          String(player.id)
        )}"]`
      );

    const image =
      card
        ?.querySelector("img")
        ?.getAttribute("src") ||
      "";

    let favorites =
      new Set();

    try {
      favorites =
        new Set(
          JSON.parse(
            localStorage.getItem(
              "fsm_favorites_v1"
            ) || "[]"
          ).map(String)
        );
    } catch {
      favorites =
        new Set();
    }

    const playerId =
      String(player.id);

    const isFavorite =
      favorites.has(
        playerId
      );

    const initials =
      String(
        player.name || "?"
      )
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
          x => x[0] || ""
        )
        .join("")
        .toUpperCase();

    const stat = (
      name,
      value
    ) => `
      <div class="fsm-pd-stat">
        <span>
          ${escapeHTML(name)}
        </span>

        <b>
          ${escapeHTML(
            value ?? "—"
          )}
        </b>
      </div>
    `;

    const content =
      $("fsmPdContent");

    if (!content) {
      return;
    }

    content.innerHTML = `
      <div class="fsm-pd-main">

        <div class="fsm-pd-visual">

          <div class="fsm-pd-ovr">
            ${escapeHTML(
              player.ovr
            )}
          </div>

          <div class="fsm-pd-pos">
            ${escapeHTML(
              player.pos
            )}
          </div>

          ${
            image
              ? `
                <img
                  src="${escapeHTML(
                    image
                  )}"
                  alt="${escapeHTML(
                    player.name
                  )}"
                  loading="eager"
                  decoding="async"
                >
              `
              : `
                <div class="fsm-pd-initials">
                  ${escapeHTML(
                    initials
                  )}
                </div>
              `
          }

        </div>

        <div class="fsm-pd-info">

          <h2>
            ${escapeHTML(
              player.name
            )}
          </h2>

          <div class="fsm-pd-meta">
            ${escapeHTML(
              player.club
            )}
            ·
            ${escapeHTML(
              player.league
            )}
            ·
            ${escapeHTML(
              player.country
            )}
          </div>

          <div class="fsm-pd-price">
            🪙
            ${formatMoney(
              player.price
            )}
          </div>

          <div class="fsm-pd-actions">

            <button
              id="fsmPdFav"
              class="fsm-pd-primary"
              type="button"
            >
              ${
                isFavorite
                  ? "★ Quitar favorito"
                  : "☆ Añadir favorito"
              }
            </button>

            <button
              id="fsmPdCompare"
              class="fsm-pd-secondary"
              type="button"
            >
              ⚖️ Comparar
            </button>

          </div>

          <div class="fsm-pd-stats">

            ${stat(
              "Ritmo",
              player.pace
            )}

            ${stat(
              "Tiro",
              player.shoot
            )}

            ${stat(
              "Pase",
              player.pass
            )}

            ${stat(
              "Regate",
              player.dribble
            )}

            ${stat(
              "Defensa",
              player.def
            )}

            ${stat(
              "Físico",
              player.phys
            )}

          </div>

        </div>

      </div>
    `;

    $("fsmPdFav").onclick = () => {
      if (
        favorites.has(
          playerId
        )
      ) {
        favorites.delete(
          playerId
        );
      } else {
        favorites.add(
          playerId
        );
      }

      localStorage.setItem(
        "fsm_favorites_v1",
        JSON.stringify(
          [...favorites]
        )
      );

      $("fsmPdFav").textContent =
        favorites.has(
          playerId
        )
          ? "★ Quitar favorito"
          : "☆ Añadir favorito";

      document.dispatchEvent(
        new CustomEvent(
          "fsm:favorites-changed"
        )
      );
    };

    $("fsmPdCompare").onclick =
      () => {

        closeModal();

        document
          .querySelector(
            '[data-page="compare"]'
          )
          ?.click();

        const select =
          $("playerA");

        if (select) {

          select.value =
            playerId;

          select.dispatchEvent(
            new Event(
              "change",
              {
                bubbles: true
              }
            )
          );
        }
      };

    $("fsmPlayerDetail")
      .classList.add(
        "open"
      );

    document.body.style.overflow =
      "hidden";
  }

  function closeModal() {
    $("fsmPlayerDetail")
      ?.classList.remove(
        "open"
      );

    document.body.style.overflow =
      "";
  }

  function connectPlayerCards() {
    document.addEventListener(
      "click",
      event => {

        if (
          event.target.closest(
            "[data-fav-player]"
          )
        ) {
          return;
        }

        if (
          event.target.closest(
            "button"
          )
        ) {
          return;
        }

        const card =
          event.target.closest(
            ".card[data-player-id]"
          );

        if (!card) {
          return;
        }

        const player =
          getPlayer(
            card.dataset.playerId
          );

        if (player) {
          openPlayer(
            player
          );
        }
      }
    );
  }

  function init() {
    addStyles();
    createPlayerModal();
    connectProButtons();
    connectPlayerCards();
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

  // En tu index.html algunos botones
  // pueden crearse después de cargar
  // app.js. Los conectamos también
  // con un pequeño observador.
  const observer =
    new MutationObserver(
      () => {
        connectProButtons();
      }
    );

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

})();
