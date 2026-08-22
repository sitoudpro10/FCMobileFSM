const IMAGE_CACHE_KEY = "fsm_player_images_v1";

function loadImageCache() {
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    const data = raw ? JSON.parse(raw) : {};

    return data && typeof data === "object"
      ? data
      : {};
  } catch {
    return {};
  }
}

const imageCache = loadImageCache();

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
    String(player.id ?? player.name ?? "") +
    "|" +
    String(player.name ?? "")
  );
}

function getStoredImage(player) {
  return (
    player.image ||
    player.photo ||
    imageCache[imageKey(player)] ||
    ""
  );
}

async function resolvePlayerImage(player) {
  const stored = getStoredImage(player);

  if (stored) {
    return stored;
  }

  const name = String(
    player.full_name ||
    player.name ||
    ""
  ).trim();

  if (!name) {
    return "";
  }

  const key = imageKey(player);

  if (imageCache[key] === "__NONE__") {
    return "";
  }

  try {
    const url =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      imageCache[key] = "__NONE__";
      saveImageCache();
      return "";
    }

    const data = await response.json();

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
    imageCache[key] = "__NONE__";
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

  const id = String(
    player.id ?? ""
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

      picture.src = image;
      picture.style.display = "block";

      picture.onload = () => {
        if (fallback) {
          fallback.style.display = "none";
        }
      };

      picture.onerror = () => {
        picture.style.display = "none";

        if (fallback) {
          fallback.style.display = "grid";
        }
      };
    }
  );
}

function requestVisibleImages(players) {
  players
    .slice(0, 10)
    .forEach((player) => {
      if (getStoredImage(player)) {
        return;
      }

      void resolvePlayerImage(player);
    });
}

function addImageStyles() {
  if ($("fsmPlayerImageStyles")) {
    return;
  }

  const style =
    document.createElement("style");

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

  document.head.appendChild(style);
}
