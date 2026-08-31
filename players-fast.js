/* =========================================================
   FC MOBILE FSM — PLAYERS FAST
   Carga rápida del catálogo de jugadores

   Objetivo:
   - Mostrar jugadores inmediatamente.
   - No bloquear la primera carga.
   - Cargar Supabase después en segundo plano.
   - No descargar el CSV externo al arrancar.
   ========================================================= */

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const PAGE_SIZE = 300;

  const FALLBACK = [
    {
      id: 1,
      name: "Kylian Mbappé",
      club: "Real Madrid",
      league: "La Liga",
      country: "France",
      pos: "ST",
      ovr: 122,
      price: 0,
      pace: 99,
      shoot: 97,
      pass: 85,
      dribble: 98,
      def: 45,
      phys: 90,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 2,
      name: "Erling Haaland",
      club: "Manchester City",
      league: "Premier League",
      country: "Norway",
      pos: "ST",
      ovr: 121,
      price: 0,
      pace: 98,
      shoot: 99,
      pass: 75,
      dribble: 90,
      def: 50,
      phys: 97,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 3,
      name: "Vinícius Jr.",
      club: "Real Madrid",
      league: "La Liga",
      country: "Brazil",
      pos: "LW",
      ovr: 122,
      price: 0,
      pace: 99,
      shoot: 96,
      pass: 88,
      dribble: 98,
      def: 40,
      phys: 85,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 4,
      name: "Rodri",
      club: "Manchester City",
      league: "Premier League",
      country: "Spain",
      pos: "CDM",
      ovr: 121,
      price: 0,
      pace: 85,
      shoot: 80,
      pass: 92,
      dribble: 86,
      def: 96,
      phys: 92,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 5,
      name: "Mohamed Salah",
      club: "Liverpool",
      league: "Premier League",
      country: "Egypt",
      pos: "RW",
      ovr: 120,
      price: 0,
      pace: 97,
      shoot: 96,
      pass: 88,
      dribble: 97,
      def: 50,
      phys: 85,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 6,
      name: "Jude Bellingham",
      club: "Real Madrid",
      league: "La Liga",
      country: "England",
      pos: "CAM",
      ovr: 121,
      price: 0,
      pace: 89,
      shoot: 90,
      pass: 94,
      dribble: 95,
      def: 84,
      phys: 91,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 7,
      name: "Ousmane Dembélé",
      club: "PSG",
      league: "Ligue 1",
      country: "France",
      pos: "RW",
      ovr: 120,
      price: 0,
      pace: 98,
      shoot: 89,
      pass: 91,
      dribble: 98,
      def: 38,
      phys: 78,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 8,
      name: "Cole Palmer",
      club: "Chelsea",
      league: "Premier League",
      country: "England",
      pos: "CAM",
      ovr: 118,
      price: 0,
      pace: 86,
      shoot: 91,
      pass: 96,
      dribble: 95,
      def: 52,
      phys: 74,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 9,
      name: "Virgil van Dijk",
      club: "Liverpool",
      league: "Premier League",
      country: "Netherlands",
      pos: "CB",
      ovr: 117,
      price: 0,
      pace: 88,
      shoot: 53,
      pass: 84,
      dribble: 72,
      def: 98,
      phys: 96,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 10,
      name: "Nuno Mendes",
      club: "PSG",
      league: "Ligue 1",
      country: "Portugal",
      pos: "LB",
      ovr: 120,
      price: 0,
      pace: 97,
      shoot: 70,
      pass: 88,
      dribble: 91,
      def: 86,
      phys: 84,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 11,
      name: "Trent Alexander-Arnold",
      club: "Real Madrid",
      league: "La Liga",
      country: "England",
      pos: "RB",
      ovr: 119,
      price: 0,
      pace: 91,
      shoot: 72,
      pass: 99,
      dribble: 88,
      def: 78,
      phys: 80,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    },
    {
      id: 12,
      name: "Alisson",
      club: "Liverpool",
      league: "Premier League",
      country: "Brazil",
      pos: "GK",
      ovr: 116,
      price: 0,
      pace: 70,
      shoot: 30,
      pass: 90,
      dribble: 55,
      def: 95,
      phys: 84,
      program: "FSM Demo",
      source: "fallback",
      source_type: "fsm"
    }
  ];

  function createClient() {
    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      return null;
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }

  function normalize(player) {
    return {
      id: player?.id,
      name: String(player?.name || "Jugador"),
      club: String(player?.club || "Sin club"),
      league: String(player?.league || ""),
      country: String(player?.country || ""),
      pos: String(player?.pos || ""),
      ovr: Number(player?.ovr || 0),
      price: Number(player?.price || 0),
      pace: Number(player?.pace || 0),
      shoot: Number(player?.shoot || 0),
      pass: Number(player?.pass || 0),
      dribble: Number(player?.dribble || 0),
      def: Number(player?.def || 0),
      phys: Number(player?.phys || 0),
      program: String(player?.program || ""),
      auctionable: player?.auctionable ?? null,
      source: String(player?.source || "supabase"),
      updated_at: player?.updated_at || null,
      source_type: "fsm"
    };
  }

  function publish(players, source) {
    const safePlayers =
      Array.isArray(players) && players.length
        ? players
        : FALLBACK.slice();

    window.FSM_PLAYERS = safePlayers;
    window.FSM_PLAYERS_SOURCE = source || "fallback";

    window.FSM_PLAYERS_META = {
      total: safePlayers.length,
      source: window.FSM_PLAYERS_SOURCE
    };

    window.dispatchEvent(
      new CustomEvent(
        "fsm:players-ready",
        {
          detail: {
            players: safePlayers,
            source: window.FSM_PLAYERS_SOURCE,
            total: safePlayers.length
          }
        }
      )
    );
  }

  async function loadSupabasePlayers() {
    const client = createClient();

    if (!client) {
      return [];
    }

    try {
      const rows = [];

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

        if (!Array.isArray(data) || !data.length) {
          break;
        }

        rows.push(
          ...data.map(normalize)
        );

        if (
          data.length <
          PAGE_SIZE
        ) {
          break;
        }

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              0
            )
        );
      }

      return rows;
    } catch (error) {
      console.warn(
        "FSM players load:",
        error
      );

      return [];
    }
  }

  function mergePlayers(
    primary,
    secondary
  ) {
    const map =
      new Map();

    for (
      const player of primary
    ) {
      const key =
        `${String(player.name).toLowerCase()}|` +
        `${String(player.club).toLowerCase()}|` +
        `${String(player.pos).toLowerCase()}`;

      map.set(
        key,
        player
      );
    }

    for (
      const player of secondary
    ) {
      const key =
        `${String(player.name).toLowerCase()}|` +
        `${String(player.club).toLowerCase()}|` +
        `${String(player.pos).toLowerCase()}`;

      if (!map.has(key)) {
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

  async function backgroundLoad() {
    const supabasePlayers =
      await loadSupabasePlayers();

    if (
      supabasePlayers.length
    ) {
      const current =
        Array.isArray(
          window.FSM_PLAYERS
        )
          ? window.FSM_PLAYERS
          : FALLBACK.slice();

      const merged =
        mergePlayers(
          current,
          supabasePlayers
        );

      publish(
        merged,
        "supabase"
      );
    }
  }

  window.FSM_PLAYERS_REFRESH =
    async () => {
      const players =
        await loadSupabasePlayers();

      if (
        players.length
      ) {
        publish(
          players,
          "supabase"
        );
      }

      return window.FSM_PLAYERS;
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

  /*
    IMPORTANTE:
    Publicamos inmediatamente los jugadores.
    No esperamos a Supabase.
  */
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

  /*
    Lanzamos el evento inmediatamente.
  */
  window.dispatchEvent(
    new CustomEvent(
      "fsm:players-ready",
      {
        detail: {
          players:
            window.FSM_PLAYERS,
          source:
            "fallback",
          total:
            window.FSM_PLAYERS.length
        }
      }
    )
  );

  /*
    Cargamos Supabase sin bloquear
    la primera pantalla.
  */
  const startBackground =
    () => {

      setTimeout(
        () => {
          void backgroundLoad();
        },
        1200
      );

    };

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      startBackground,
      {
        once: true
      }
    );

  } else {

    startBackground();

  }

})();
