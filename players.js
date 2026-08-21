/*
  FC Mobile FSM — players.js
  --------------------------
  Carga el catálogo de jugadores/cartas desde Supabase.

  Tabla esperada:
  public.players

  Columnas:
  id
  name
  club
  league
  country
  pos
  ovr
  price
  pace
  shoot
  pass
  dribble
  def
  phys
  program
  auctionable
  updated_at
*/

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://jshevgjyweoianpbbjdl.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TQzyNZ62wl2-r1F64-WuKA_6UTaFORK";

  const CACHE_KEY = "fsm_players_catalog_v1";
  const CACHE_AT_KEY = "fsm_players_catalog_updated_v1";

  // Tiempo que mantenemos la copia local antes de actualizar.
  const CACHE_TTL = 10 * 60 * 1000;

  // Cantidad máxima de jugadores que pedimos por página.
  const PAGE_SIZE = 1000;

  /*
    RESPALDO
    --------
    Si Supabase todavía no tiene jugadores,
    FSM seguirá funcionando con estos jugadores.
  */

  const FALLBACK = [
    {
      id: 1,
      name: "Kylian Mbappé",
      club: "Real Madrid",
      country: "🇫🇷",
      pos: "ST",
      ovr: 122,
      price: 650000000,
      pace: 99,
      shoot: 97,
      pass: 85,
      dribble: 98,
      def: 45,
      phys: 90
    },

    {
      id: 2,
      name: "Erling Haaland",
      club: "Manchester City",
      country: "🇳🇴",
      pos: "ST",
      ovr: 121,
      price: 620000000,
      pace: 98,
      shoot: 99,
      pass: 75,
      dribble: 90,
      def: 50,
      phys: 97
    },

    {
      id: 3,
      name: "Vinícius Jr.",
      club: "Real Madrid",
      country: "🇧🇷",
      pos: "LW",
      ovr: 122,
      price: 600000000,
      pace: 99,
      shoot: 96,
      pass: 88,
      dribble: 98,
      def: 40,
      phys: 85
    },

    {
      id: 4,
      name: "Rodri",
      club: "Manchester City",
      country: "🇪🇸",
      pos: "CDM",
      ovr: 121,
      price: 550000000,
      pace: 85,
      shoot: 80,
      pass: 92,
      dribble: 86,
      def: 96,
      phys: 92
    },

    {
      id: 5,
      name: "Mohamed Salah",
      club: "Liverpool",
      country: "🇪🇬",
      pos: "RW",
      ovr: 120,
      price: 520000000,
      pace: 97,
      shoot: 96,
      pass: 88,
      dribble: 97,
      def: 50,
      phys: 85
    },

    {
      id: 6,
      name: "Jude Bellingham",
      club: "Real Madrid",
      country: "🇬🇧",
      pos: "CM",
      ovr: 121,
      price: 410000000,
      pace: 89,
      shoot: 90,
      pass: 94,
      dribble: 95,
      def: 84,
      phys: 91
    },

    {
      id: 7,
      name: "Ousmane Dembélé",
      club: "PSG",
      country: "🇫🇷",
      pos: "RW",
      ovr: 120,
      price: 340000000,
      pace: 98,
      shoot: 89,
      pass: 91,
      dribble: 98,
      def: 38,
      phys: 78
    },

    {
      id: 8,
      name: "Cole Palmer",
      club: "Chelsea",
      country: "🇬🇧",
      pos: "CAM",
      ovr: 118,
      price: 180000000,
      pace: 86,
      shoot: 91,
      pass: 96,
      dribble: 95,
      def: 52,
      phys: 74
    },

    {
      id: 9,
      name: "Virgil van Dijk",
      club: "Liverpool",
      country: "🇳🇱",
      pos: "CB",
      ovr: 117,
      price: 150000000,
      pace: 88,
      shoot: 53,
      pass: 84,
      dribble: 72,
      def: 98,
      phys: 96
    },

    {
      id: 10,
      name: "Nuno Mendes",
      club: "PSG",
      country: "🇵🇹",
      pos: "LB",
      ovr: 120,
      price: 210000000,
      pace: 97,
      shoot: 70,
      pass: 88,
      dribble: 91,
      def: 86,
      phys: 84
    },

    {
      id: 11,
      name: "Trent Alexander-Arnold",
      club: "Real Madrid",
      country: "🇬🇧",
      pos: "RB",
      ovr: 119,
      price: 185000000,
      pace: 91,
      shoot: 72,
      pass: 99,
      dribble: 88,
      def: 78,
      phys: 80
    },

    {
      id: 12,
      name: "Alisson",
      club: "Liverpool",
      country: "🇧🇷",
      pos: "GK",
      ovr: 116,
      price: 120000000,
      pace: 70,
      shoot: 30,
      pass: 90,
      dribble: 55,
      def: 95,
      phys: 84
    },

    {
      id: 13,
      name: "Harry Kane",
      club: "Bayern Munich",
      country: "🇬🇧",
      pos: "ST",
      ovr: 119,
      price: 240000000,
      pace: 87,
      shoot: 98,
      pass: 91,
      dribble: 88,
      def: 45,
      phys: 91
    },

    {
      id: 14,
      name: "Kevin De Bruyne",
      club: "Napoli",
      country: "🇧🇪",
      pos: "CM",
      ovr: 118,
      price: 190000000,
      pace: 79,
      shoot: 88,
      pass: 99,
      dribble: 90,
      def: 55,
      phys: 78
    },

    {
      id: 15,
      name: "Achraf Hakimi",
      club: "PSG",
      country: "🇲🇦",
      pos: "RB",
      ovr: 118,
      price: 230000000,
      pace: 98,
      shoot: 78,
      pass: 90,
      dribble: 91,
      def: 84,
      phys: 87
    },

    {
      id: 16,
      name: "Thibaut Courtois",
      club: "Real Madrid",
      country: "🇧🇪",
      pos: "GK",
      ovr: 117,
      price: 170000000,
      pace: 65,
      shoot: 25,
      pass: 82,
      dribble: 40,
      def: 98,
      phys: 90
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

  function normalize(row) {
    return {
      id: row.id,

      name: row.name || "",

      club: row.club || "",

      league: row.league || "",

      country: row.country || "",

      pos: row.pos || "",

      ovr: Number(row.ovr || 0),

      price: Number(row.price || 0),

      pace: Number(row.pace || 0),

      shoot: Number(row.shoot || 0),

      pass: Number(row.pass || 0),

      dribble: Number(row.dribble || 0),

      def: Number(row.def || 0),

      phys: Number(row.phys || 0),

      program: row.program || "",

      auctionable: row.auctionable ?? null,

      updated_at: row.updated_at || null
    };
  }

  /*
    CARGAR CACHE
  */

  function cacheGet() {
    try {
      const updated =
        Number(
          localStorage.getItem(
            CACHE_AT_KEY
          ) || 0
        );

      if (!updated) {
        return null;
      }

      const age =
        Date.now() - updated;

      if (age > CACHE_TTL) {
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

      return Array.isArray(parsed)
        ? parsed
        : null;

    } catch {
      return null;
    }
  }

  /*
    GUARDAR CACHE
  */

  function cacheSet(players) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(players)
      );

      localStorage.setItem(
        CACHE_AT_KEY,
        String(Date.now())
      );

    } catch {
      /*
        Si el almacenamiento está lleno
        no hacemos fallar la web.
      */
    }
  }

  /*
    CARGAR DESDE SUPABASE
  */

  async function loadFromSupabase() {

    if (!client) {
      throw new Error(
        "Supabase client unavailable"
      );
    }

    const all = [];

    for (
      let from = 0;
      ;
      from += PAGE_SIZE
    ) {

      const to =
        from + PAGE_SIZE - 1;

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
              "updated_at"
            ].join(",")
          )
          .order(
            "id",
            {
              ascending: true
            }
          )
          .range(
            from,
            to
          );

      if (error) {
        throw error;
      }

      if (
        !data ||
        data.length === 0
      ) {
        break;
      }

      for (const row of data) {
        all.push(
          normalize(row)
        );
      }

      if (
        data.length <
        PAGE_SIZE
      ) {
        break;
      }
    }

    return all;
  }

  /*
    ACTUALIZAR JUGADORES
  */

  async function refreshPlayers() {

    try {

      const players =
        await loadFromSupabase();

      if (
        players.length > 0
      ) {

        cacheSet(
          players
        );

        window.FSM_PLAYERS =
          players;

        window.dispatchEvent(
          new CustomEvent(
            "fsm:players-ready",
            {
              detail: {
                players,
                source:
                  "supabase"
              }
            }
          )
        );
      }

      return players;

    } catch (error) {

      console.warn(
        "FSM: no se pudo actualizar el catálogo.",
        error
      );

      return [];
    }
  }

  /*
    CARGAR JUGADORES
  */

  async function loadPlayers() {

    const cached =
      cacheGet();

    if (
      cached &&
      cached.length
    ) {

      window.FSM_PLAYERS =
        cached;

      window.dispatchEvent(
        new CustomEvent(
          "fsm:players-ready",
          {
            detail: {
              players: cached,
              source: "cache"
            }
          }
        )
      );

      /*
        Actualización en segundo plano.
      */

      void refreshPlayers();

      return cached;
    }

    const players =
      await refreshPlayers();

    if (
      players.length
    ) {
      return players;
    }

    /*
      Si Supabase todavía está vacío,
      usamos el respaldo.
    */

    window.FSM_PLAYERS =
      FALLBACK.slice();

    window.dispatchEvent(
      new CustomEvent(
        "fsm:players-ready",
        {
          detail: {
            players:
              window.FSM_PLAYERS,
            source:
              "fallback"
          }
        }
      )
    );

    return window.FSM_PLAYERS;
  }

  /*
    FUNCIONES PÚBLICAS
  */

  window.FSM_PLAYERS_REFRESH =
    refreshPlayers;

  window.FSM_PLAYERS_INFO =
    function () {

      return {
        count:
          Array.isArray(
            window.FSM_PLAYERS
          )
            ? window.FSM_PLAYERS.length
            : 0,

        cacheTtlMs:
          CACHE_TTL,

        source:
          "Supabase public.players + local cache"
      };

    };

  /*
    Ponemos los datos de respaldo
    inmediatamente para evitar una
    pantalla vacía al arrancar.
  */

  window.FSM_PLAYERS =
    FALLBACK.slice();

  /*
    Después intentamos cargar
    el catálogo completo.
  */

  void loadPlayers();

})();
