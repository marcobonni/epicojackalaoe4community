import type { Dictionary } from "@/app/lib/i18n-schema";

export const itMessages: Dictionary = {
  metadata: {
    siteTitle: "Aoe4 Community Italia - Classifica, Quiz e Matchmaking",
    siteDescription:
      "La community italiana di Age of Empires 4. Classifica aggiornata, quiz competitivi e matchmaking bilanciato per giocatori italiani.",
    homeTitle: "Aoe4 Italia - Community, Classifica e Quiz",
    homeDescription:
      "Unisciti alla community italiana AoE4. Classifica aggiornata, quiz e matchmaking automatico.",
    loginTitle: "Login tornei | AoE4 Community Italia",
    registerTitle: "Registrazione tornei | AoE4 Community Italia",
    tournamentsTitle: "Tornei | AoE4 Community Italia",
  },
  languageSwitcher: { label: "Lingua del sito", shortLabel: "Lingua" },
  common: {
    new: "NEW",
    live: "Live",
    offline: "Offline",
    open: "Apri",
    loading: "Caricamento...",
    viewerCount: "spettatori",
    noData: "—",
  },
  home: {
    hero: {
      badge: "Age of Empires Community Discord",
      title: "La tua community Discord per vivere Age of Empires ogni giorno",
      description:
        "Un server pensato per appassionati di Age of Empires: partite, eventi, tornei, consigli strategici e una community con cui giocare davvero.",
      statsHeading: "Community AoE4 Italia",
      ctaJoin: "Entra nel Discord",
      ctaItalianLeaderboard: "Classifica italiana",
      ctaNorthLeaderboard: "Classifica Nord",
      ctaCenterLeaderboard: "Classifica Centro",
      ctaSouthLeaderboard: "Classifica Sud",
      ctaQuiz: "Quiz",
      ctaMatchmaking: "Matchmaking",
      ctaTournaments: "Tornei",
      ctaPortal: "Area player/admin",
      stats: [
        { value: "24/7", label: "Community attiva" },
        { value: "AoE", label: "Focus totale" },
        { value: "Eventi", label: "Ogni settimana" },
      ],
    },
    liveStats: [
      "Utenti visibili nel widget",
      "Online ora",
      "Canali visibili",
    ],
    twitch: {
      badge: "Live su Twitch",
      title: "Streamers della community",
      description: "",
      featured: "Streamer in evidenza",
      secondaryBadge: "Altri streamer",
      secondaryTitle: "Altri canali della community",
      open: "Apri su Twitch",
      empty: "Nessuno streamer configurato.",
    },
    playerLookup: {
      compactBadge: "Ricerca rapida",
      compactTitle: "Cerca un altro player",
      defaultBadge: "Player Analysis",
      title: "Trova il profilo giusto e apri la scheda completa del player",
      description:
        "Dopo gli stream della community, qui puoi passare subito all'analisi individuale: cerca un nome Steam e vai direttamente alla pagina player del sito.",
      chipSearch: "Ricerca AoE4World",
      chipDashboard: "Accesso diretto alla dashboard",
      label: "Nome Steam del giocatore",
      compactPlaceholder: "Cerca un altro player...",
      defaultPlaceholder: "Es. MarineLorD, Beastyqt, Demu",
      submit: "Apri player",
      submitPending: "Cerco...",
      suggestionOpen: "Apri",
      suggestionEmptyPrefix: "Nessun suggerimento trovato per",
      helper:
        "Inserisci il nome Steam esatto o il risultato piu vicino: il sito risolve il profilo e ti porta direttamente alla sua pagina analisi.",
      lookupErrors: {
        emptySearch: "Inserisci un nome Steam per cercare il giocatore.",
        searchUnavailable: "La ricerca del giocatore non e disponibile al momento.",
        noPlayer: "Nessun giocatore trovato con questo nome Steam.",
        openPlayer: "Inserisci un nome Steam per aprire la pagina player.",
        generic: "Errore durante la ricerca del giocatore.",
      },
    },
    features: {
      badge: "Perche unirti",
      title: "Un server Discord costruito per chi ama davvero Age of Empires",
      items: [
        {
          title: "Partite e matchmaking",
          desc: "Trova giocatori per ranked, custom, team game e serate casual nella community.",
        },
        {
          title: "Tornei ed eventi",
          desc: "Organizza o segui tornei, challenge e community night dedicate ad Age of Empires.",
        },
        {
          title: "Guide e strategia",
          desc: "Condividi build order, consigli, replay e discussioni sulle civilta con altri appassionati.",
        },
        {
          title: "Community italiana",
          desc: "Un punto di ritrovo per chi vuole giocare, chiacchierare e crescere insieme nella scena italiana.",
        },
      ],
    },
    discord: {
      liveBadge: "Live del Discord",
      liveDescription: "I dati qui sotto sono dei giocatori della nostra community!",
      open: "Apri Discord",
      selectedRoom: "Giocatori nella stanza selezionata",
      serverBadge: "Stato del server",
      serverTitle: "Numeri che danno fiducia",
      serverDescription: "Qui trovi una panoramica live della community su Discord.",
      presenceTitle: "Presenza live",
      presenceText: "membri online in questo momento.",
    },
    coaching: {
      badge: "Coaching",
      title: "Allenati con player della community",
      description:
        "In questa sezione puoi mostrare i membri disponibili a fare coaching, con specializzazione, prezzo e link diretto per essere contattati.",
      available: "Coach disponibile",
      focus: "Focus",
      price: "Prezzo",
      availability: "Disponibilita",
      contact: "Contatta",
      profile: "Profilo",
      empty: "Nessun coach configurato al momento.",
      scrollLeft: "Scorri a sinistra",
      scrollRight: "Scorri a destra",
      coaches: {
        EpicoJackal: {
          badge: "AoE4 Coach",
          role: "Coaching 1v1 e teamgame",
          description:
            "Sessioni dedicate a macro, build order, scouting e decision making.",
          specialty:
            "Ottimizzazione build, review replay, mindset competitivo",
          availability: "Sera e weekend",
        },
        Daddu23: {
          badge: "AoE4 Coach",
          role: "Coaching esistenziale",
          description:
            "Sessioni dedicate a capire chi sei e cosa vuoi diventare nel gioco.",
          specialty:
            "Capire i fondamentali, trovare la civilta che piace, tattiche in diverse situazioni",
          availability: "Sera e pomeriggi",
        },
        Taffuz: {
          badge: "Top Ladder",
          role: "Coaching competitivo AoE4",
          description:
            "Allenamenti focalizzati su macro avanzata, timing push e gestione delle civilta meta.",
          specialty: "Strategie meta, timing attack, decision making mid game",
          availability: "Weekend",
        },
        Kasiya: {
          badge: "Strategy Coach",
          role: "Analisi replay e miglioramento decision making",
          description:
            "Sessioni di analisi replay per migliorare macro, scouting e adattamento strategico.",
          specialty: "Replay analysis, macro management, map control",
          availability: "Sera",
        },
        Scapolocaldo667: {
          badge: "Strategy Coach",
          role: "Analisi replay e miglioramento decision making",
          description:
            "Sessione personalizzata su build order, gestione di macro e micro, controllo mappa e scout.",
          specialty: "Gestione della macro e controllo della mappa",
          availability: "Sera",
        },
      },
    },
    events: {
      badge: "Eventi AoE",
      title: "Prossimi appuntamenti della community",
      description:
        "Tornei, serate team game e sessioni di coaching organizzate direttamente dalla community.",
      cta: "Partecipa agli eventi",
      timePrefix: "Ore",
      items: [
        {
          day: "12 MAR",
          title: "Team Game Night 4v4",
          time: "21:30",
          type: "Community Night",
          desc: "Serata aperta a tutti con lobby bilanciate e voice channels dedicati.",
        },
        {
          day: "15 MAR",
          title: "Torneo Weekend Bo3",
          time: "18:00",
          type: "Torneo",
          desc: "Mini torneo con bracket rapido per i membri della community.",
        },
        {
          day: "18 MAR",
          title: "Coaching & Replay Review",
          time: "20:45",
          type: "Strategia",
          desc: "Analisi replay, build order e consigli pratici sulle civilta.",
        },
      ],
    },
    join: {
      listBadge: "Cosa trovi dentro",
      items: [
        "Canali dedicati alle civilta, alle strategie e ai replay",
        "Eventi community per giocare insieme e conoscere nuovi player",
        "Spazio per creator, clip, meme e discussioni competitive",
        "Organizzazione semplice per tornei, team game e serate speciali",
      ],
      cardBadge: "Unisciti ora",
      title: "Porta il tuo gameplay al livello successivo",
      description: "Clicca qui e inizia a giocare subito!",
      cta: "Vai al Discord!",
    },
    footer:
      "Produced by EpicoJackal, all rights reserved. Ogni riferimento a persone reali e puramente casuale.",
  },
  portalShell: {
    tagline: "Segui i tornei, controlla i match e resta dentro l'azione della community.",
    tournaments: "Tornei",
    clanWars: "Mappa Clan Wars",
    dashboard: "Dashboard",
    admin: "Admin",
    register: "Registrati",
    login: "Login",
  },
  auth: {
    email: "Email",
    password: "Password",
    accountEmail: "Email account",
    steamName: "Nome Steam",
    discordName: "Nome Discord",
    passwordRequirementsPrefix: "Requisiti password",
    loginSubmit: "Accedi con email e password",
    loginPending: "Accesso in corso...",
    loginGenericError: "Accesso non riuscito. Riprova.",
    registerSubmit: "Crea account",
    registerPending: "Registrazione in corso...",
    registerGenericError: "Registrazione non riuscita. Riprova.",
    registerSuccess:
      "Registrazione completata. Controlla la tua email e clicca il link di conferma per entrare nella dashboard.",
    registerSuccessTitle: "Email di conferma inviata",
    registerSteps: [
      "Apri la tua casella email.",
      "Cerca l'email di conferma.",
      "Clicca il link e verrai mandato alla dashboard.",
    ],
    recoverySubmit: "Invia link di recupero",
    recoveryPending: "Invio link in corso...",
    recoveryGenericError: "Invio del link di recupero non riuscito. Riprova.",
    recoverySuccess:
      "Ti abbiamo inviato una mail con il link per reimpostare la password.",
    recoverySuccessTitle: "Link di recupero inviato",
    recoverySteps: [
      "Apri la tua casella email.",
      "Cerca il messaggio con il link di recupero password.",
      "Apri il link e imposta la nuova password.",
    ],
    signOut: "Logout",
    signOutPending: "Logout in corso...",
  },
  loginPage: {
    eyebrow: "Accesso tornei",
    title: "Accedi al tuo spazio tornei",
    description:
      "Entra con email e password per vedere i tuoi tornei, seguire il bracket e controllare i prossimi match.",
    cards: [
      {
        title: "Verifica email",
        text: "L'accesso viene abilitato dopo la conferma dell'indirizzo email.",
      },
      {
        title: "Dashboard player",
        text: "Prossimo avversario, stato match e bracket aggiornato.",
      },
      {
        title: "Area organizzazione",
        text: "Gestisci tornei, iscrizioni e risultati in un unico spazio.",
      },
    ],
    formTitle: "Entra nel portale",
    formDescription:
      "Inserisci le credenziali del tuo account. Se non hai ancora un profilo, registrati in pochi istanti.",
    forgotPassword: "Password dimenticata?",
    forgotDescription:
      "Inserisci la tua email e ti mandiamo un link per reimpostare la password.",
    missingConfig:
      "L'accesso non e disponibile in questo momento. Riprova tra poco.",
    registerPrompt: "Registrazione account:",
    registerCta: "Vai alla pagina registrazione",
    callbackHelp:
      "Se hai appena confermato l'email ma non riesci a entrare, prova ad aprire di nuovo il link ricevuto.",
    errors: {
      supabaseEnv: "L'accesso non e disponibile in questo momento. Riprova tra poco.",
      authCallback:
        "La conferma email non e andata a buon fine. Riprova ad aprire il link ricevuto.",
    },
    infos: {
      passwordUpdated:
        "Password aggiornata. Ora puoi accedere con le nuove credenziali.",
    },
  },
  registerPage: {
    eyebrow: "Registrazione utente",
    title: "Crea il tuo account community",
    description:
      "Registrati per partecipare ai tornei, seguire i tuoi match e tenere aggiornato il tuo profilo giocatore.",
    bullets: [
      "Accesso rapido con email e password",
      "Profilo con nome Steam e nome Discord",
      "Conferma email prima del primo accesso",
    ],
    formTitle: "Crea account",
    formDescription:
      "Usa dati chiari e riconoscibili, cosi sara piu facile trovarti nei tornei e nelle conferme match.",
    missingConfig:
      "La registrazione non e disponibile in questo momento. Riprova tra poco.",
    loginPrompt: "Hai gia un account?",
    loginCta: "Vai al login",
  },
  tournamentsPage: {
    eyebrow: "Tornei community",
    title: "Tornei aperti della community",
    description:
      "Scopri i tornei disponibili, controlla formato e regole e iscriviti quando le registrazioni sono aperte.",
    serviceUnavailable: "Tornei temporaneamente non disponibili",
    serviceDescription:
      "Non riusciamo a caricare l'elenco dei tornei in questo momento. Riprova tra poco.",
    openTournament: "Apri torneo",
    alreadyJoined: "Gia partecipante",
    pendingApproval: "Richiesta in approvazione",
    joinPending: "Iscrizione in corso...",
    noDescription: "Nessuna descrizione ancora inserita.",
    participants: "Partecipanti",
    rules: "Regole",
    emptyTitle: "Nessun torneo disponibile",
    emptyDescription:
      "Quando saranno disponibili nuovi eventi, li troverai qui con tutti i dettagli per partecipare.",
    joinLabels: {
      approval: "Invia richiesta",
      hybrid: "Entra / richiedi slot",
      default: "Iscriviti",
    },
    formatLabels: {
      single_elimination: "Single elimination",
      double_elimination: "Double elimination",
      round_robin: "Round robin",
      championship: "Campionato",
      swiss: "Swiss",
      groups_playoff: "Groups + playoff",
      international_style: "International style",
      league_season: "League season",
      ladder: "Ladder",
      king_of_the_hill: "King of the hill",
      gsl_group: "GSL group",
    },
    tournamentStatuses: {
      draft: "Bozza",
      registration_open: "Iscrizioni aperte",
      check_in: "Check-in",
      seeding: "Seeding",
      live: "Live",
      paused: "In pausa",
      completed: "Concluso",
      cancelled: "Annullato",
    },
    matchStatuses: {
      pending: "In attesa",
      ready: "Da giocare",
      awaiting_confirmation: "In attesa di conferma",
      disputed: "Contestata",
      admin_review: "Revisione admin",
      completed: "Completata",
      forfeited: "Forfeit",
      cancelled: "Annullata",
    },
  },
};
