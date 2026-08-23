(() => {
  "use strict";

  /*
    FSM PLAYER IMAGES
    -----------------
    - No bloquea la carga inicial.
    - Solo procesa tarjetas visibles.
    - Máximo 4 peticiones de imagen a la vez.
    - Usa caché del navegador.
    - Si no existe foto, mantiene la carta funcionando.
    - No modifica players.js ni app.js.
  */

  const CACHE_KEY =
    "fsm_player_image_urls_v1";

  const MAX_CONCURRENT = 4;
  const LOOKUP_DELAY = 80;

  const cache = loadCache();
  const pending = new Map();
  const queue = [];
  let active = 0;

  function loadCache() {
    try {
      const raw =
        localStorage.getItem(
          CACHE_KEY
        );

      const parsed =
        raw
          ? JSON.parse(raw)
          : {};

      return parsed &&
        typeof parsed === "object"
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  function saveCache() {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(cache)
      );
    } catch {
      // La caché es opcional.
    }
  }

  function getPlayers() {
    return Array.isArray(
      window.FSM_PLAYERS
    )
      ? window.FSM_PLAYERS
      : [];
  }

  function getPlayerById(id) {
    const key =
      String(
        id ?? ""
      );

    return (
      getPlayers().find(
        player =>
          String(
            player?.id ?? ""
          ) === key
      ) || null
    );
  }

  function getPlayerName(
    player
  ) {
    return String(
      player?.full_name ||
      player?.name ||
      ""
    ).trim();
  }

  function escapeHtml(
    value
  ) {
    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }

  function imageKey(
    player
  ) {
    return String(
      player?.id ??
      getPlayerName(
        player
      ) ??
      ""
    );
  }

  function addStyles() {
    if (
      document.getElementById(
        "fsmPlayerImagesStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "fsmPlayerImagesStyles";

    style.textContent = `
      .fsm-photo-wrap {
        position: absolute;
        inset: 18px 10px 8px 10px;
        display: grid;
        place-items: center;
        z-index: 1;
        pointer-events: none;
      }

      .fsm-player-photo {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        opacity: 0;
        transition: opacity .18s ease;
        filter: drop-shadow(
          0 6px 10px rgba(0,0,0,.28)
        );
      }

      .fsm-player-photo.is-loaded {
        opacity: 1;
      }

      .fsm-photo-fallback {
        font-size: 48px;
        font-weight: 900;
        opacity: .7;
        color: #fff;
        text-align: center;
      }

      .card .ovr,
      .card .pos,
      .card .crest,
      .card .flag,
      .card .fsm-fav-btn {
        z-index: 4;
      }
    `;

    document.head.appendChild(
      style
    );
  }

  function getInitials(
    name
  ) {
    return String(
      name || "?"
    )
      .trim()
      .split(
        /\s+/
      )
      .slice(
        0,
        2
      )
      .map(
        part =>
          part[0] || ""
      )
      .join("")
      .toUpperCase();
  }

  function ensureImageElement(
    card,
    player
  ) {
    if (
      !card ||
      !player
    ) {
      return null;
    }

    const art =
      card.querySelector(
        ".art"
      );

    if (!art) {
      return null;
    }

    let wrap =
      art.querySelector(
        ".fsm-photo-wrap"
      );

    if (wrap) {
      return wrap.querySelector(
        ".fsm-player-photo"
      );
    }

    wrap =
      document.createElement(
        "div"
      );

    wrap.className =
      "fsm-photo-wrap";

    const img =
      document.createElement(
        "img"
      );

    img.className =
      "fsm-player-photo";

    img.alt =
      escapeHtml(
        getPlayerName(
          player
        )
      );

    img.loading =
      "lazy";

    img.decoding =
      "async";

    img.referrerPolicy =
      "no-referrer";

    img.setAttribute(
      "aria-hidden",
      "true"
    );

    const fallback =
      document.createElement(
        "div"
      );

    fallback.className =
      "fsm-photo-fallback";

    fallback.textContent =
      getInitials(
        getPlayerName(
          player
        )
      );

    wrap.appendChild(
      fallback
    );

    wrap.appendChild(
      img
    );

    art.appendChild(
      wrap
    );

    img.addEventListener(
      "load",
      () => {
        img.classList.add(
          "is-loaded"
        );

        fallback.style.display =
          "none";
      },
      {
        once: true
      }
    );

    img.addEventListener(
      "error",
      () => {
        img.removeAttribute(
          "src"
        );

        img.classList.remove(
          "is-loaded"
        );

        img.style.display =
          "none";

        fallback.style.display =
          "grid";
      },
      {
        once: true
      }
    );

    return img;
  }

  function wikipediaUrl(
    name
  ) {
    const safeName =
      encodeURIComponent(
        name
          .replace(
            /\s+/g,
            " "
          )
          .trim()
      );

    return (
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      safeName
    );
  }

  async function resolveImage(
    player
  ) {
    const key =
      imageKey(
        player
      );

    if (!key) {
      return "";
    }

    if (
      cache[key] ===
      "__NONE__"
    ) {
      return "";
    }

    if (
      typeof cache[key] ===
        "string" &&
      cache[key]
    ) {
      return cache[key];
    }

    if (
      pending.has(key)
    ) {
      return pending.get(
        key
      );
    }

    const name =
      getPlayerName(
        player
      );

    if (!name) {
      cache[key] =
        "__NONE__";

      saveCache();

      return "";
    }

    const promise =
      (async () => {
        try {
          const response =
            await fetch(
              wikipediaUrl(
                name
              ),
              {
                method:
                  "GET",

                cache:
                  "force-cache",

                headers: {
                  Accept:
                    "application/json"
                }
              }
            );

          if (
            !response.ok
          ) {
            cache[key] =
              "__NONE__";

            saveCache();

            return "";
          }

          const data =
            await response.json();

          const image =
            data?.thumbnail?.source ||
            data?.originalimage?.source ||
            "";

          cache[key] =
            image ||
            "__NONE__";

          saveCache();

          return image;
        } catch {
          cache[key] =
            "__NONE__";

          saveCache();

          return "";
        } finally {
          pending.delete(
            key
          );
        }
      })();

    pending.set(
      key,
      promise
    );

    return promise;
  }

  function enqueue(
    card
  ) {
    if (!card) {
      return;
    }

    if (
      card.dataset
        .fsmImageQueued ===
      "1"
    ) {
      return;
    }

    card.dataset
      .fsmImageQueued =
      "1";

    queue.push(
      card
    );

    pump();
  }

  async function pump() {
    if (
      active >=
        MAX_CONCURRENT ||
      queue.length ===
        0
    ) {
      return;
    }

    active +=
      1;

    const card =
      queue.shift();

    try {
      const id =
        card?.dataset
          ?.playerId;

      const player =
        getPlayerById(
          id
        );

      if (!player) {
        return;
      }

      const img =
        ensureImageElement(
          card,
          player
        );

      if (!img) {
        return;
      }

      const image =
        await resolveImage(
          player
        );

      if (
        image &&
        img.isConnected
      ) {
        img.src =
          image;

        return;
      }

      if (
        !image &&
        img.isConnected
      ) {
        img.style.display =
          "none";

        const fallback =
          img.parentElement?.querySelector(
            ".fsm-photo-fallback"
          );

        if (fallback) {
          fallback.style.display =
            "grid";
        }
      }
    } finally {
      active -=
        1;

      setTimeout(
        pump,
        LOOKUP_DELAY
      );

      pump();
    }
  }

  function scanVisibleCards(
    root = document
  ) {
    const cards =
      root.querySelectorAll(
        ".card[data-player-id]"
      );

    for (
      const card of cards
    ) {
      enqueue(
        card
      );
    }
  }

  function startObserver() {
    if (
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      scanVisibleCards();

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          for (
            const entry of entries
          ) {
            if (
              !entry.isIntersecting
            ) {
              continue;
            }

            enqueue(
              entry.target
            );

            observer.unobserve(
              entry.target
            );
          }
        },
        {
          root: null,
          rootMargin:
            "250px 0px",
          threshold:
            0.01
        }
      );

    const observeCards =
      () => {
        document
          .querySelectorAll(
            ".card[data-player-id]"
          )
          .forEach(
            card =>
              observer.observe(
                card
              )
          );
      };

    observeCards();

    const root =
      document.getElementById(
        "allPlayers"
      );

    if (
      root &&
      "MutationObserver" in
        window
    ) {
      const mutationObserver =
        new MutationObserver(
          () => {
            observeCards();
          }
        );

      mutationObserver.observe(
        root,
        {
          childList:
            true,
          subtree:
            true
        }
      );
    }
  }

  function start() {
    addStyles();

    /*
      Esperamos un poco para no competir
      con la primera pintura de la aplicación.
    */
    setTimeout(
      () => {
        startObserver();
      },
      700
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      {
        once: true
      }
    );
  } else {
    start();
  }
})();
