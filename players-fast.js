(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const INITIAL_LIMIT = 80;

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
    ["Alisson","Liverpool","Premier League","Brazil","GK",116,70,30,90,55,95,84]
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
    source: "fallback",
    source_type: "fsm"
  }));

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

  function publish(list, source) {
    const safe =
      Array.isArray(list) && list.length
        ? list
        : FALLBACK.slice();

    window.FSM_PLAYERS = safe;
    window.FSM_PLAYERS_SOURCE =
      source || "fallback";

    window.FSM_PLAYERS_META = {
      total: safe.length,
      source: window.FSM_PLAYERS_SOURCE
    };

    window.dispatchEvent(
      new CustomEvent(
        "fsm:players-ready",
        {
          detail: {
            players: safe,
            source: window.FSM_PLAYERS_SOURCE,
            total: safe.length
          }
        }
      )
    );
  }

  function createClient() {
    if (
      !window.supabase ||
      typeof window.supabase.createClient !==
        "function"
    ) {
      return null;
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }

  async function loadInitialPlayers() {
    const client =
      createClient();

    if (!client) {
      return [];
    }

    try {
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
            "ovr",
            {
              ascending: false
            }
          )
          .range(
            0,
            INITIAL_LIMIT - 1
          );

      if (error) {
        console.warn(
          "FSM players Supabase:",
          error
        );

        return [];
      }

      return Array.isArray(data)
        ? data.map(normalize)
        : [];

    } catch (error) {

      console.warn(
        "FSM players initial load:",
        error
      );

      return [];
    }
  }

  window.FSM_PLAYERS_REFRESH =
    async () => {

      const fresh =
        await loadInitialPlayers();

      if (fresh.length) {
        publish(
          fresh,
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
   * Carga inmediata.
   */
  publish(
    FALLBACK.slice(),
    "fallback"
  );

  /*
   * Supabase NO bloquea el arranque.
   * Solo obtiene 80 jugadores.
   */
  const startBackground =
    () => {

      setTimeout(
        async () => {

          const fresh =
            await loadInitialPlayers();

          if (
            fresh.length
          ) {

            publish(
              fresh,
              "supabase"
            );

          }

        },
        1800
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
