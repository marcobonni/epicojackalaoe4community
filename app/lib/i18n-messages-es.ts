import { enMessages } from "@/app/lib/i18n-messages-en";
import type { Dictionary } from "@/app/lib/i18n-schema";

export const esMessages: Dictionary = {
  ...enMessages,
  metadata: {
    siteTitle: "Aoe4 Community - Rankings, Quiz y Matchmaking",
    siteDescription:
      "Una comunidad de Age of Empires 4 con rankings, quiz competitivos y matchmaking equilibrado.",
    homeTitle: "Aoe4 Community - Rankings, Streams y Quiz",
    homeDescription:
      "Unete a la comunidad de AoE4 para rankings, quiz y matchmaking automatico.",
    loginTitle: "Login de Torneos | AoE4 Community",
    registerTitle: "Registro de Torneos | AoE4 Community",
    tournamentsTitle: "Torneos | AoE4 Community",
  },
  languageSwitcher: { label: "Idioma del sitio", shortLabel: "Idioma" },
  common: {
    ...enMessages.common,
    open: "Abrir",
    loading: "Cargando...",
    viewerCount: "espectadores",
  },
  home: {
    ...enMessages.home,
    hero: {
      ...enMessages.home.hero,
      statsHeading: "Hub de la comunidad AoE4",
      title: "Tu comunidad de Discord para vivir Age of Empires cada dia",
      description:
        "Un servidor pensado para fans de Age of Empires: partidas, eventos, torneos, consejos estrategicos y una comunidad real con la que jugar.",
      ctaJoin: "Entrar al Discord",
      ctaItalianLeaderboard: "Ranking italiano",
      ctaNorthLeaderboard: "Ranking norte",
      ctaCenterLeaderboard: "Ranking centro",
      ctaSouthLeaderboard: "Ranking sur",
      ctaTournaments: "Torneos",
      ctaPortal: "Area de jugador/admin",
      stats: [
        { value: "24/7", label: "Comunidad activa" },
        { value: "AoE", label: "Foco total" },
        { value: "Events", label: "Cada semana" },
      ],
    },
    liveStats: ["Usuarios visibles", "En linea ahora", "Canales visibles"],
    twitch: {
      ...enMessages.home.twitch,
      badge: "En directo en Twitch",
      title: "Streamers de la comunidad",
      description: "",
      featured: "Streamer destacado",
      secondaryBadge: "Otros streamers",
      secondaryTitle: "Otros canales de la comunidad",
      open: "Abrir en Twitch",
      empty: "No hay streamers configurados.",
    },
    playerLookup: {
      ...enMessages.home.playerLookup,
      compactBadge: "Busqueda rapida",
      compactTitle: "Buscar otro jugador",
      title: "Encuentra el perfil correcto y abre la pagina completa del jugador",
      description:
        "Despues de los streams de la comunidad, puedes pasar directamente al analisis individual: busca un nombre de Steam y ve enseguida a la pagina del jugador.",
      chipSearch: "Busqueda AoE4World",
      chipDashboard: "Acceso directo al panel",
      label: "Nombre de Steam del jugador",
      compactPlaceholder: "Buscar otro jugador...",
      submit: "Abrir jugador",
      submitPending: "Buscando...",
      suggestionOpen: "Abrir",
      suggestionEmptyPrefix: "No se encontraron sugerencias para",
      helper:
        "Introduce el nombre exacto de Steam o el resultado mas cercano: el sitio resuelve el perfil y te lleva directamente a la pagina de analisis.",
      lookupErrors: {
        emptySearch: "Introduce un nombre de Steam para buscar un jugador.",
        searchUnavailable:
          "La busqueda de jugadores no esta disponible en este momento.",
        noPlayer: "No se encontro ningun jugador con ese nombre de Steam.",
        openPlayer:
          "Introduce un nombre de Steam para abrir la pagina del jugador.",
        generic: "Hubo un error durante la busqueda del jugador.",
      },
    },
    features: {
      ...enMessages.home.features,
      badge: "Por que unirte",
      title: "Un servidor de Discord construido para quienes aman de verdad Age of Empires",
      items: [
        {
          title: "Partidas y matchmaking",
          desc: "Encuentra jugadores para ranked, custom, team games y noches casuales dentro de la comunidad.",
        },
        {
          title: "Torneos y eventos",
          desc: "Organiza o sigue torneos, desafios y community nights centrados en Age of Empires.",
        },
        {
          title: "Guias y estrategia",
          desc: "Comparte build orders, consejos, replays y debates sobre civilizaciones con otros apasionados.",
        },
        {
          title: "Nucleo de la comunidad italiana",
          desc: "Un punto de encuentro para quienes quieren jugar, hablar y crecer juntos dentro de la escena italiana.",
        },
      ],
    },
    discord: {
      ...enMessages.home.discord,
      liveBadge: "Discord en directo",
      liveDescription: "Los datos de abajo vienen de jugadores de nuestra comunidad.",
      open: "Abrir Discord",
      selectedRoom: "Jugadores en la sala de voz seleccionada",
      serverBadge: "Estado del servidor",
      serverTitle: "Numeros que generan confianza",
      serverDescription: "Aqui tienes una vista en directo de la comunidad en Discord.",
      presenceTitle: "Presencia en vivo",
      presenceText: "miembros conectados en este momento.",
    },
    coaching: {
      ...enMessages.home.coaching,
      title: "Entrena con jugadores de la comunidad",
      description:
        "Esta seccion destaca a los miembros disponibles para coaching, con especialidades, precio y enlace directo de contacto.",
      available: "Coach disponible",
      price: "Precio",
      availability: "Disponibilidad",
      contact: "Contactar",
      profile: "Perfil",
      empty: "No hay coaches configurados ahora mismo.",
      scrollLeft: "Desplazar a la izquierda",
      scrollRight: "Desplazar a la derecha",
    },
    events: {
      ...enMessages.home.events,
      badge: "Eventos AoE",
      title: "Proximas citas de la comunidad",
      description:
        "Torneos, noches de team games y sesiones de coaching organizadas directamente por la comunidad.",
      cta: "Participar en los eventos",
      timePrefix: "Hora",
      items: [
        {
          day: "12 MAR",
          title: "Noche de Team Game 4v4",
          time: "21:30",
          type: "Community Night",
          desc: "Una noche abierta para todos con lobbies equilibrados y canales de voz dedicados.",
        },
        {
          day: "15 MAR",
          title: "Torneo de fin de semana Bo3",
          time: "18:00",
          type: "Torneo",
          desc: "Un mini torneo de bracket rapido para miembros de la comunidad.",
        },
        {
          day: "18 MAR",
          title: "Coaching y Replay Review",
          time: "20:45",
          type: "Estrategia",
          desc: "Analisis de replays, build orders y consejos practicos sobre civilizaciones.",
        },
      ],
    },
    join: {
      ...enMessages.home.join,
      listBadge: "Lo que encontraras dentro",
      items: [
        "Canales dedicados a civilizaciones, estrategias y replays",
        "Eventos de comunidad para jugar juntos y conocer nuevos jugadores",
        "Espacio para creadores, clips, memes y debate competitivo",
        "Organizacion sencilla para torneos, team games y noches especiales",
      ],
      cardBadge: "Unete ahora",
      title: "Lleva tu gameplay al siguiente nivel",
      description: "Haz clic aqui y empieza a jugar de inmediato.",
      cta: "Ir a Discord!",
    },
    footer:
      "Produced by EpicoJackal, todos los derechos reservados. Cualquier parecido con personas reales es pura coincidencia.",
  },
  portalShell: {
    tagline:
      "Sigue torneos, revisa tus partidas y mantente cerca de la comunidad.",
    tournaments: "Torneos",
    clanWars: "Mapa Clan Wars",
    dashboard: "Panel",
    admin: "Admin",
    register: "Registrarse",
    login: "Login",
  },
  auth: {
    ...enMessages.auth,
    accountEmail: "Email de la cuenta",
    steamName: "Nombre de Steam",
    discordName: "Nombre de Discord",
    passwordRequirementsPrefix: "Requisitos de la contrasena",
    loginSubmit: "Entrar con email y contrasena",
    loginPending: "Entrando...",
    loginGenericError: "No se pudo iniciar sesion. Intentalo de nuevo.",
    registerSubmit: "Crear cuenta",
    registerPending: "Creando cuenta...",
    registerGenericError: "No se pudo completar el registro. Intentalo de nuevo.",
    registerSuccess:
      "Registro completado. Revisa tu email y haz clic en el enlace de confirmacion para entrar al panel.",
    registerSuccessTitle: "Email de confirmacion enviado",
    registerSteps: [
      "Abre tu bandeja de entrada.",
      "Busca el correo de confirmacion.",
      "Haz clic en el enlace y seras redirigido al panel.",
    ],
    recoverySubmit: "Enviar enlace de recuperacion",
    recoveryPending: "Enviando enlace...",
    recoveryGenericError:
      "No se pudo enviar el enlace de recuperacion. Intentalo de nuevo.",
    recoverySuccess:
      "Te hemos enviado un email con el enlace para restablecer la contrasena.",
    recoverySuccessTitle: "Enlace de recuperacion enviado",
    recoverySteps: [
      "Abre tu bandeja de entrada.",
      "Busca el mensaje con el enlace de recuperacion de contrasena.",
      "Abre el enlace y establece tu nueva contrasena.",
    ],
    signOut: "Cerrar sesion",
    signOutPending: "Cerrando sesion...",
  },
  loginPage: {
    ...enMessages.loginPage,
    eyebrow: "Acceso a torneos",
    title: "Entra en tu espacio de torneos",
    description:
      "Entra con tu email y tu contrasena para ver torneos, seguir el bracket y revisar tus proximas partidas.",
    cards: [
      {
        title: "Verificacion de email",
        text: "El acceso se activa despues de confirmar la direccion de email.",
      },
      {
        title: "Panel del jugador",
        text: "Tu proximo rival, estado del match y bracket actualizado.",
      },
      {
        title: "Area de organizacion",
        text: "Gestiona torneos, inscripciones y resultados desde un solo lugar.",
      },
    ],
    formTitle: "Entrar al portal",
    formDescription:
      "Introduce los datos de tu cuenta. Si aun no tienes perfil, crealo en unos instantes.",
    forgotPassword: "Has olvidado tu contrasena?",
    forgotDescription:
      "Introduce tu email y te enviaremos un enlace para restablecer la contrasena.",
    registerPrompt: "Necesitas una cuenta?",
    registerCta: "Ir al registro",
    callbackHelp:
      "Si acabas de confirmar tu email y aun no puedes entrar, prueba a abrir otra vez el enlace recibido.",
  },
  registerPage: {
    ...enMessages.registerPage,
    eyebrow: "Registro de usuario",
    title: "Crea tu cuenta de la comunidad",
    description:
      "Crea tu cuenta para unirte a torneos, seguir tus partidas y mantener actualizado tu perfil de jugador.",
    bullets: [
      "Acceso rapido con email y contrasena",
      "Perfil de jugador con nombre de Steam y de Discord",
      "Confirmacion del email antes del primer acceso",
    ],
    formTitle: "Crear cuenta",
    formDescription:
      "Usa datos claros y reconocibles para que sea mas facil identificarte en torneos y confirmaciones de partidas.",
    loginPrompt: "Ya tienes una cuenta?",
    loginCta: "Ir al login",
  },
  tournamentsPage: {
    ...enMessages.tournamentsPage,
    eyebrow: "Torneos de la comunidad",
    title: "Torneos abiertos de la comunidad",
    description:
      "Descubre los torneos disponibles, revisa el formato y las reglas, e inscribete cuando el registro este abierto.",
    serviceUnavailable: "Los torneos no estan disponibles temporalmente",
    serviceDescription:
      "No hemos podido cargar la lista de torneos en este momento. Vuelve a intentarlo en breve.",
    openTournament: "Abrir torneo",
    alreadyJoined: "Ya participas",
    pendingApproval: "Solicitud pendiente de aprobacion",
    joinPending: "Enviando inscripcion...",
    noDescription: "Todavia no hay descripcion.",
    participants: "Participantes",
    rules: "Reglas",
    emptyTitle: "No hay torneos disponibles",
    emptyDescription:
      "Cuando haya nuevos eventos disponibles, los encontraras aqui con toda la informacion para participar.",
    joinLabels: {
      approval: "Enviar solicitud",
      hybrid: "Entrar / pedir plaza",
      default: "Unirse",
    },
    formatLabels: {
      single_elimination: "Eliminacion simple",
      double_elimination: "Doble eliminacion",
      round_robin: "Round robin",
      championship: "Campeonato",
      swiss: "Suizo",
      groups_playoff: "Grupos + playoff",
      international_style: "Estilo internacional",
      league_season: "Temporada de liga",
      ladder: "Ladder",
      king_of_the_hill: "King of the hill",
      gsl_group: "Grupo GSL",
    },
    tournamentStatuses: {
      draft: "Borrador",
      registration_open: "Registro abierto",
      check_in: "Check-in",
      seeding: "Seeding",
      live: "En vivo",
      paused: "Pausado",
      completed: "Completado",
      cancelled: "Cancelado",
    },
    matchStatuses: {
      pending: "Pendiente",
      ready: "Listo",
      awaiting_confirmation: "Esperando confirmacion",
      disputed: "Disputado",
      admin_review: "Revision admin",
      completed: "Completado",
      forfeited: "Forfeit",
      cancelled: "Cancelado",
    },
  },
};
