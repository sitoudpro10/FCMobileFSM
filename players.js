/*
  FC MOBILE FSM — players.js
  CATÁLOGO GRANDE + SUPABASE + REFERENCIA FC26

  IMPORTANTE:
  - public.players = catálogo FSM principal.
  - Si Supabase tiene suficientes jugadores, se usa Supabase.
  - Si Supabase está vacío o tiene pocos jugadores, se carga también
    una base pública de referencia de EA Sports FC 26.
  - Esos registros de referencia NO son cartas oficiales de FC Mobile.
  - Sus precios se dejan a 0 para no fingir precios del mercado FC Mobile.
*/

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  /*
    Dataset público de referencia FC26.
  */
  const REFERENCE_CSV_URL =
    "https://raw.githubusercontent.com/preetiravikiran/FIFA2026/main/fifa26_player_data.csv";

  const CACHE_KEY =
    "fsm_players_catalog_v3";

  const CACHE_META_KEY =
    "fsm_players_catalog_meta_v3";

  const CACHE_TTL =
    30 * 60 * 1000;

  const SUPABASE_MIN_COUNT = 100;

  const PAGE_SIZE = 1000;

  const FALLBACK = [
    {
      id: 1,
      name: "Kylian Mbappé",
      club: "Real Madrid",
      league: "La Liga",
      country: "France",
      pos: "ST",
      ovr: 122,
      price: 650000000,
      pace: 99,
      shoot: 97,
      pass: 85,
      dribble: 98,
      def: 45,
      phys: 90,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 2,
      name: "Erling Haaland",
      club: "Manchester City",
      league: "Premier League",
      country: "Norway",
      pos: "ST",
      ovr: 121,
      price: 620000000,
      pace: 98,
      shoot: 99,
      pass: 75,
      dribble: 90,
      def: 50,
      phys: 97,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 3,
      name: "Vinícius Jr.",
      club: "Real Madrid",
      league: "La Liga",
      country: "Brazil",
      pos: "LW",
      ovr: 122,
      price: 600000000,
      pace: 99,
      shoot: 96,
      pass: 88,
      dribble: 98,
      def: 40,
      phys: 85,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 4,
      name: "Rodri",
      club: "Manchester City",
      league: "Premier League",
      country: "Spain",
      pos: "CDM",
      ovr: 121,
      price: 550000000,
      pace: 85,
      shoot: 80,
      pass: 92,
      dribble: 86,
      def: 96,
      phys: 92,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 5,
      name: "Mohamed Salah",
      club: "Liverpool",
      league: "Premier League",
      country: "Egypt",
      pos: "RW",
      ovr: 120,
      price: 520000000,
      pace: 97,
      shoot: 96,
      pass: 88,
      dribble: 97,
      def: 50,
      phys: 85,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 6,
      name: "Jude Bellingham",
      club: "Real Madrid",
      league: "La Liga",
      country: "England",
      pos: "CAM",
      ovr: 121,
      price: 410000000,
      pace: 89,
      shoot: 90,
      pass: 94,
      dribble: 95,
      def: 84,
      phys: 91,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 7,
      name: "Ousmane Dembélé",
      club: "PSG",
      league: "Ligue 1",
      country: "France",
      pos: "RW",
      ovr: 120,
      price: 340000000,
      pace: 98,
      shoot: 89,
      pass: 91,
      dribble: 98,
      def: 38,
      phys: 78,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 8,
      name: "Cole Palmer",
      club: "Chelsea",
      league: "Premier League",
      country: "England",
      pos: "CAM",
      ovr: 118,
      price: 180000000,
      pace: 86,
      shoot: 91,
      pass: 96,
      dribble: 95,
      def: 52,
      phys: 74,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 9,
      name: "Virgil van Dijk",
      club: "Liverpool",
      league: "Premier League",
      country: "Netherlands",
      pos: "CB",
      ovr: 117,
      price: 150000000,
      pace: 88,
      shoot: 53,
      pass: 84,
      dribble: 72,
      def: 98,
      phys: 96,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 10,
      name: "Nuno Mendes",
      club: "PSG",
      league: "Ligue 1",
      country: "Portugal",
      pos: "LB",
      ovr: 120,
      price: 210000000,
      pace: 97,
      shoot: 70,
      pass: 88,
      dribble: 91,
      def: 86,
      phys: 84,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 11,
      name: "Trent Alexander-Arnold",
      club: "Real Madrid",
      league: "La Liga",
      country: "England",
      pos: "RB",
      ovr: 119,
      price: 185000000,
      pace: 91,
      shoot: 72,
      pass: 99,
      dribble: 88,
      def: 78,
      phys: 80,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 12,
      name: "Alisson",
      club: "Liverpool",
      league: "Premier League",
      country: "Brazil",
      pos: "GK",
      ovr: 116,
      price: 120000000,
      pace: 70,
      shoot: 30,
      pass: 90,
      dribble: 55,
      def: 95,
      phys: 84,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 13,
      name: "Harry Kane",
      club: "Bayern München",
      league: "Bundesliga",
      country: "England",
      pos: "ST",
      ovr: 119,
      price: 240000000,
      pace: 87,
      shoot: 98,
      pass: 91,
      dribble: 88,
      def: 45,
      phys: 91,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 14,
      name: "Kevin De Bruyne",
      club: "Napoli",
      league: "Serie A",
      country: "Belgium",
      pos: "CM",
      ovr: 118,
      price: 190000000,
      pace: 79,
      shoot: 88,
      pass: 99,
      dribble: 90,
      def: 55,
      phys: 78,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 15,
      name: "Achraf Hakimi",
      club: "PSG",
      league: "Ligue 1",
      country: "Morocco",
      pos: "RB",
      ovr: 118,
      price: 230000000,
      pace: 98,
      shoot: 78,
      pass: 90,
      dribble: 91,
      def: 84,
      phys: 87,
      program: "FSM Demo",
      source: "fsm_demo"
    },
    {
      id: 16,
      name: "Thibaut Courtois",
      club: "Real Madrid",
      league: "La Liga",
      country: "Belgium",
      pos: "GK",
      ovr: 117,
      price: 170000000,
      pace: 65,
      shoot: 25,
      pass: 82,
      dribble: 40,
      def: 98,
      phys: 90,
      program: "FSM Demo",
      source: "fsm_demo"
    }
  ];

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

  function number(value, fallback = 0) {
    const n = Number(value);

    return Number.isFinite(n)
      ? n
      : fallback;
  }

  function normalizeSupabase(row) {
    return {
      id: number(row.id),
      name: row.name || "",
      club: row.club || "",
      league: row.league || "",
      country: row.country || "",
      pos: row.pos || "",
      ovr: number(row.ovr),
      price: number(row.price),
      pace: number(row.pace),
      shoot: number(row.shoot),
      pass: number(row.pass),
      dribble: number(row.dribble),
      def: number(row.def),
      phys: number(row.phys),
      program: row.program || "",
      auctionable: row.auctionable ?? null,
      source: row.source || "supabase",
      updated_at: row.updated_at || null,
      source_type: "fsm"
    };
  }

  function parseCSVLine(line) {
    const out = [];
    let current = "";
    let quoted = false;

    for (
      let i = 0;
      i < line.length;
      i++
    ) {
      const char =
        line[i];

      if (char === '"') {
        if (
          quoted &&
          line[i + 1] === '"'
        ) {
          current += '"';
          i++;
        } else {
          quoted = !quoted;
        }

        continue;
      }

      if (
        char === "," &&
        !quoted
      ) {
        out.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    out.push(current);

    return out;
  }

  function parseCSV(text) {
    const lines =
      text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    const headers =
      parseCSVLine(lines[0]);

    const index = {};

    headers.forEach(
      (header, i) => {
        index[header] = i;
      }
    );

    const players = [];

    for (
      let rowIndex = 1;
      rowIndex < lines.length;
      rowIndex++
    ) {
      const values =
        parseCSVLine(
          lines[rowIndex]
        );

      const get = key =>
        values[
          index[key]
        ] ?? "";

      const positions =
        String(
          get("player_positions")
        )
          .split(",")
          .map(
            p =>
              p.trim()
          )
          .filter(Boolean);

      const primary =
        positions[0] ||
        "CM";

      const ovr =
        number(
          get("overall")
        );

      const pace =
        number(
          get("pace")
        );

      const shoot =
        number(
          get("shooting")
        );

      const pass =
        number(
          get("passing")
        );

      const dribble =
        number(
          get("dribbling")
        );

      const def =
        number(
          get("defending")
        );

      const phys =
        number(
          get("physic")
        );

      if (
        !get("short_name") &&
        !get("long_name")
      ) {
        continue;
      }

      const id =
        -1000000 -
        rowIndex;

      players.push({
        id,

        name:
          get("short_name") ||
          get("long_name"),

        full_name:
          get("long_name"),

        club:
          get("club_name"),

        league:
          get("league_name"),

        country:
          get("nationality_name"),

        pos:
          primary,

        positions,

        ovr,

        price:
          0,

        pace,

        shoot,

        pass,

        dribble,

        def,

        phys,

        program:
          "FC26 Reference",

        auctionable:
          null,

        source:
          "fc26_reference_csv",

        source_type:
          "reference",

        preferred_foot:
          get("preferred_foot"),

        weak_foot:
          number(
            get("weak_foot")
          ),

        skill_moves:
          number(
            get("skill_moves")
          ),

        potential:
          number(
            get("potential")
          )
      });
    }

    return players;
  }

  function cacheGet() {
    try {
      const savedAt =
        number(
          localStorage.getItem(
            CACHE_META_KEY
          )
        );

      if (
        !savedAt ||
        Date.now() -
          savedAt >
          CACHE_TTL
      ) {
        return null;
      }

      const raw =
        localStorage.getItem(
          CACHE_KEY
        );

      if (!raw) {
        return null;
      }

      const parsed =
        JSON.parse(raw);

      return Array.isArray(
        parsed
      )
        ? parsed
        : null;

    } catch {
      return null;
    }
  }

  function cacheSet(
    players
  ) {
    try {
      const safe =
        players.slice(
          0,
          20000
        );

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(
          safe
        )
      );

      localStorage.setItem(
        CACHE_META_KEY,
        String(
          Date.now()
        )
      );

    } catch {
      /* cache opcional */
    }
  }

  async function loadSupabasePlayers() {
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
        const to =
          from +
          PAGE_SIZE -
          1;

        const {
          data,
          error
        } =
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
                ascending:
                  true
              }
            )
            .range(
              from,
              to
            );

        if (error) {
          console.warn(
            "FSM Supabase:",
            error
          );

          return [];
        }

        if (
          !data ||
          !data.length
        ) {
          break;
        }

        all.push(
          ...data.map(
            normalizeSupabase
          )
        );

        if (
          data.length <
          PAGE_SIZE
        ) {
          break;
        }
      }

      return all;

    } catch (error) {
      console.warn(
        "FSM Supabase catalog error:",
        error
      );

      return [];
    }
  }

  async function loadReferenceCSV() {
    try {
      const response =
        await fetch(
          REFERENCE_CSV_URL,
          {
            method:
              "GET",
            cache:
              "no-store"
          }
        );

      if (!response.ok) {
        throw new Error(
          `CSV HTTP ${response.status}`
        );
      }

      const text =
        await response.text();

      return parseCSV(text);

    } catch (error) {
      console.warn(
        "FSM FC26 reference unavailable:",
        error
      );

      return [];
    }
  }

  function mergePlayers(
    primary,
    reference
  ) {
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

  async function loadPlayers() {
    const cached =
      cacheGet();

    if (
      cached &&
      cached.length >
        1000
    ) {
      window.FSM_PLAYERS =
        cached;

      window.FSM_PLAYERS_SOURCE =
        "cache";

      window.FSM_PLAYERS_META =
        {
          total:
            cached.length,

          fsm:
            cached.filter(
              p =>
                p.source_type ===
                "fsm"
            ).length,

          reference:
            cached.filter(
              p =>
                p.source_type ===
                "reference"
            ).length
        };

      dispatchReady(
        cached,
        "cache"
      );

      void refreshPlayers();

      return cached;
    }

    const supabasePlayers =
      await loadSupabasePlayers();

    let referencePlayers =
      [];

    if (
      supabasePlayers.length <
      SUPABASE_MIN_COUNT
    ) {
      referencePlayers =
        await loadReferenceCSV();
    }

    const merged =
      mergePlayers(
        supabasePlayers,
        referencePlayers
      );

    const players =
      merged.length
        ? merged
        : FALLBACK.slice();

    window.FSM_PLAYERS =
      players;

    window.FSM_PLAYERS_SOURCE =
      merged.length
        ? referencePlayers.length
          ? "supabase+fc26-reference"
          : "supabase"
        : "fallback";

    window.FSM_PLAYERS_META =
      {
        total:
          players.length,

        fsm:
          players.filter(
            p =>
              p.source_type !==
              "reference"
          ).length,

        reference:
          players.filter(
            p =>
              p.source_type ===
              "reference"
          ).length
      };

    cacheSet(
      players
    );

    dispatchReady(
      players,
      window.FSM_PLAYERS_SOURCE
    );

    return players;
  }

  async function refreshPlayers() {
    const supabasePlayers =
      await loadSupabasePlayers();

    let referencePlayers =
      [];

    if (
      supabasePlayers.length <
      SUPABASE_MIN_COUNT
    ) {
      referencePlayers =
        await loadReferenceCSV();
    }

    const merged =
      mergePlayers(
        supabasePlayers,
        referencePlayers
      );

    if (
      merged.length
    ) {
      window.FSM_PLAYERS =
        merged;

      window.FSM_PLAYERS_SOURCE =
        referencePlayers.length
          ? "supabase+fc26-reference"
          : "supabase";

      window.FSM_PLAYERS_META =
        {
          total:
            merged.length,

          fsm:
            supabasePlayers.length,

          reference:
            referencePlayers.length
        };

      cacheSet(
        merged
      );

      dispatchReady(
        merged,
        window.FSM_PLAYERS_SOURCE
      );
    }

    return merged;
  }

  function dispatchReady(
    players,
    source
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "fsm:players-ready",
        {
          detail: {
            players,
            source,
            total:
              players.length
          }
        }
      )
    );
  }

  window.FSM_PLAYERS_REFRESH =
    refreshPlayers;

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

  window.FSM_PLAYERS_META =
    {
      total:
        FALLBACK.length,
      fsm:
        FALLBACK.length,
      reference:
        0
    };

  dispatchReady(
    window.FSM_PLAYERS,
    "fallback"
  );

  void loadPlayers();

})();
