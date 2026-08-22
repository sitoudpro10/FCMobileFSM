/*
  FC MOBILE FSM — players.js
  CATÁLOGO GRANDE CON CARGA RÁPIDA

  Estrategia:
  1) Arranque inmediato con Supabase/FALLBACK.
  2) El catálogo externo FC26 NO bloquea la primera pantalla.
  3) Se descarga en segundo plano cuando el navegador está libre.
  4) No se guarda el catálogo completo en localStorage.
  5) Cuando llega el catálogo grande, se actualiza la web sin recargar.
*/

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const REFERENCE_CSV_URL =
    "https://raw.githubusercontent.com/preetiravikiran/FIFA2026/main/fifa26_player_data.csv";

  const PAGE_SIZE = 1000;
  const REFERENCE_DELAY = 1800;

  const FALLBACK = [
    ["Kylian Mbappé","Real Madrid","La Liga","France","ST",122,99,97,85,98,45,90],
    ["Erling Haaland","Manchester City","Premier League","Norway","ST",121,98,99,75,90,50,97],
    ["Vinícius Jr.","Real Madrid","La Liga","Brazil","LW",122,99,96,88,98,40,85],
    ["Rodri","Manchester City","Premier League","Spain","CDM",121,85,80,92,86,96,92],
    ["Mohamed Salah","Liverpool","Premier League","Egypt","RW",120,97,96,88,97,50,85],
    ["Jude Bellingham","Real Madrid","La Liga","England","CAM",121,89,90,94,95,84,91],
    ["Ousmane Dembélé","PSG","Ligue 1","France","RW",120,98,89,91,98,38,78],
    ["Cole Palmer","Chelsea","Premier League","England","CAM",118,86,91,96,95,52,74],
    ["Virgil van Dijk","Liverpool","Premier League","Netherlands","CB",117,88,53,84,72,98,96],
    ["Nuno Mendes","PSG","Ligue 1","Portugal","LB",120,97,70,88,91,86,84],
    ["Trent Alexander-Arnold","Real Madrid","La Liga","England","RB",119,91,72,99,88,78,80],
    ["Alisson","Liverpool","Premier League","Brazil","GK",116,70,30,90,55,95,84],
    ["Harry Kane","Bayern München","Bundesliga","England","ST",119,87,98,91,88,45,91],
    ["Kevin De Bruyne","Napoli","Serie A","Belgium","CM",118,79,88,99,90,55,78],
    ["Achraf Hakimi","PSG","Ligue 1","Morocco","RB",118,98,78,90,91,84,87],
    ["Thibaut Courtois","Real Madrid","La Liga","Belgium","GK",117,65,25,82,40,98,90]
  ].map((p, i) => ({
    id: i + 1,
    name: p[0],
    club: p[1],
    league: p[2],
    country: p[3],
    pos: p[4],
    ovr: p[5],
    price: 0,
    pace: p[6],
    shoot: p[7],
    pass: p[8],
    dribble: p[9],
    def: p[10],
    phys: p[11],
    program: "FSM Demo",
    source: "fsm_demo",
    source_type: "fsm"
  }));

  function createClient() {
    if (!window.supabase?.createClient) {
      return null;
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
  }

  const client = createClient();

  function n(value, fallback = 0) {
    const x = Number(value);
    return Number.isFinite(x) ? x : fallback;
  }

  function normalize(row) {
    return {
      id: n(row.id),
      name: row.name || "",
      club: row.club || "",
      league: row.league || "",
      country: row.country || "",
      pos: row.pos || "",
      ovr: n(row.ovr),
      price: n(row.price),
      pace: n(row.pace),
      shoot: n(row.shoot),
      pass: n(row.pass),
      dribble: n(row.dribble),
      def: n(row.def),
      phys: n(row.phys),
      program: row.program || "",
      auctionable: row.auctionable ?? null,
      source: row.source || "supabase",
      updated_at: row.updated_at || null,
      source_type: "fsm"
    };
  }

  function publish(players, source) {
    window.FSM_PLAYERS =
      Array.isArray(players)
        ? players
        : FALLBACK.slice();

    window.FSM_PLAYERS_SOURCE =
      source || "fallback";

    window.FSM_PLAYERS_META = {
      total:
        window.FSM_PLAYERS.length,
      source:
        window.FSM_PLAYERS_SOURCE
    };

    window.dispatchEvent(
      new CustomEvent(
        "fsm:players-ready",
        {
          detail: {
            players:
              window.FSM_PLAYERS,
            source:
              window.FSM_PLAYERS_SOURCE,
            total:
              window.FSM_PLAYERS.length
          }
        }
      )
    );
  }

  async function loadSupabase() {
    if (!client) {
      return [];
    }

    try {
      const all = [];

      for (
        let from = 0;
        ;
        from += PAGE_SIZE
      ) {
        const { data, error } =
          await client
            .from("players")
            .select(
              [
                "id",
                "name",
                "club",
                "league",
                "country",
                "pos",
                "ovr",
                "price",
                "pace",
                "shoot",
                "pass",
                "dribble",
                "def",
                "phys",
                "program",
                "auctionable",
                "updated_at",
                "source"
              ].join(",")
            )
            .eq(
              "is_active",
              true
            )
            .order(
              "id",
              {
                ascending: true
              }
            )
            .range(
              from,
              from + PAGE_SIZE - 1
            );

        if (error) {
          console.warn(
            "FSM players Supabase:",
            error
          );
          return [];
        }

        if (!data?.length) {
          break;
        }

        all.push(
          ...data.map(
            normalize
          )
        );

        if (
          data.length <
          PAGE_SIZE
        ) {
          break;
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              0
            )
        );
      }

      return all;
    } catch (error) {
      console.warn(
        "FSM players load:",
        error
      );
      return [];
    }
  }

  function parseCSVLine(line) {
    const result = [];
    let value = "";
    let quoted = false;

    for (
      let i = 0;
      i < line.length;
      i++
    ) {
      const c = line[i];

      if (c === '"') {
        if (
          quoted &&
          line[i + 1] === '"'
        ) {
          value += '"';
          i++;
        } else {
          quoted = !quoted;
        }
        continue;
      }

      if (
        c === "," &&
        !quoted
      ) {
        result.push(value);
        value = "";
      } else {
        value += c;
      }
    }

    result.push(value);
    return result;
  }

  function csvValue(
    values,
    index,
    key
  ) {
    return (
      values[
        index[key]
      ] ?? ""
    );
  }

  async function parseReferenceCSV(
    text
  ) {
    const lines =
      text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    const headers =
      parseCSVLine(
        lines[0]
      );

    const index = {};

    headers.forEach(
      (header, i) => {
        index[header] = i;
      }
    );

    const output = [];

    const block = 300;

    for (
      let start = 1;
      start < lines.length;
      start += block
    ) {
      const end =
        Math.min(
          start + block,
          lines.length
        );

      for (
        let row = start;
        row < end;
        row++
      ) {
        const values =
          parseCSVLine(
            lines[row]
          );

        const name =
          csvValue(
            values,
            index,
            "short_name"
          ) ||
          csvValue(
            values,
            index,
            "long_name"
          );

        if (!name) {
          continue;
        }

        const positions =
          String(
            csvValue(
              values,
              index,
              "player_positions"
            )
          )
            .split(",")
            .map(
              p =>
                p.trim()
            )
            .filter(Boolean);

        output.push({
          id:
            -1000000 -
            row,

          name,

          full_name:
            csvValue(
              values,
              index,
              "long_name"
            ),

          club:
            csvValue(
              values,
              index,
              "club_name"
            ),

          league:
            csvValue(
              values,
              index,
              "league_name"
            ),

          country:
            csvValue(
              values,
              index,
              "nationality_name"
            ),

          pos:
            positions[0] ||
            "CM",

          positions,

          ovr:
            n(
              csvValue(
                values,
                index,
                "overall"
              )
            ),

          price: 0,

          pace:
            n(
              csvValue(
                values,
                index,
                "pace"
              )
            ),

          shoot:
            n(
              csvValue(
                values,
                index,
                "shooting"
              )
            ),

          pass:
            n(
              csvValue(
                values,
                index,
                "passing"
              )
            ),

          dribble:
            n(
              csvValue(
                values,
                index,
                "dribbling"
              )
            ),

          def:
            n(
              csvValue(
                values,
                index,
                "defending"
              )
            ),

          phys:
            n(
              csvValue(
                values,
                index,
                "physic"
              )
            ),

          program:
            "FC26 Reference",

          auctionable:
            null,

          source:
            "fc26_reference_csv",

          source_type:
            "reference"
        });
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            0
          )
      );
    }

    return output;
  }

  async function loadReference() {
    try {
      const response =
        await fetch(
          REFERENCE_CSV_URL,
          {
            cache:
              "force-cache"
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const text =
        await response.text();

      return await parseReferenceCSV(
        text
      );
    } catch (error) {
      console.warn(
        "FSM FC26 reference unavailable:",
        error
      );
      return [];
    }
  }

  function merge(primary, reference) {
    const map =
      new Map();

    for (
      const player of primary
    ) {
      const key =
        `${player.name}|${player.club}|${player.pos}`
          .toLowerCase();

      map.set(
        key,
        player
      );
    }

    for (
      const player of reference
    ) {
      const key =
        `${player.name}|${player.club}|${player.pos}`
          .toLowerCase();

      if (
        !map.has(key)
      ) {
        map.set(
          key,
          player
        );
      }
    }

    return Array.from(
      map.values()
    );
  }

  function idle(
    callback,
    delay = 0
  ) {
    if (
      "requestIdleCallback" in
      window
    ) {
      window.requestIdleCallback(
        callback,
        {
          timeout:
            2500
        }
      );
      return;
    }

    setTimeout(
      callback,
      delay
    );
  }

  async function bootstrap() {
    publish(
      FALLBACK.slice(),
      "fallback"
    );

    const supabasePlayers =
      await loadSupabase();

    if (
      supabasePlayers.length
    ) {
      publish(
        supabasePlayers,
        "supabase"
      );
    }

    idle(
      async () => {
        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              REFERENCE_DELAY
            )
        );

        const reference =
          await loadReference();

        const primary =
          supabasePlayers.length
            ? supabasePlayers
            : FALLBACK;

        const merged =
          merge(
            primary,
            reference
          );

        if (
          merged.length >
          primary.length
        ) {
          publish(
            merged,
            supabasePlayers.length
              ? "supabase+fc26-reference"
              : "fallback+fc26-reference"
          );
        }
      }
    );
  }

  window.FSM_PLAYERS_REFRESH =
    async () => {
      const primary =
        await loadSupabase();

      const reference =
        await loadReference();

      const merged =
        merge(
          primary.length
            ? primary
            : FALLBACK,
          reference
        );

      publish(
        merged,
        primary.length
          ? "supabase+fc26-reference"
          : "fallback+fc26-reference"
      );

      return merged;
    };

  window.FSM_PLAYERS_INFO =
    () => ({
      total:
        Array.isArray(
          window.FSM_PLAYERS
        )
          ? window.FSM_PLAYERS.length
          : 0,

      source:
        window.FSM_PLAYERS_SOURCE ||
        "unknown",

      meta:
        window.FSM_PLAYERS_META ||
        {}
    });

  window.FSM_PLAYERS =
    FALLBACK.slice();

  window.FSM_PLAYERS_SOURCE =
    "fallback";

  window.FSM_PLAYERS_META = {
    total:
      FALLBACK.length,
    source:
      "fallback"
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      bootstrap,
      {
        once: true
      }
    );
  } else {
    void bootstrap();
  }
})();
