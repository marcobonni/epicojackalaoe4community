import { enMessages } from "@/app/lib/i18n-messages-en";
import type { Dictionary } from "@/app/lib/i18n-schema";

export const deMessages: Dictionary = {
  ...enMessages,
  metadata: {
    siteTitle: "Aoe4 Community - Ranglisten, Quiz und Matchmaking",
    siteDescription:
      "Eine Age of Empires 4 Community mit Ranglisten, kompetitiven Quiz und ausgeglichenem Matchmaking.",
    homeTitle: "Aoe4 Community - Ranglisten, Streams und Quiz",
    homeDescription:
      "Tritt der AoE4 Community fur Ranglisten, Quiz und automatisches Matchmaking bei.",
    loginTitle: "Turnier Login | AoE4 Community",
    registerTitle: "Turnier Registrierung | AoE4 Community",
    tournamentsTitle: "Turniere | AoE4 Community",
  },
  languageSwitcher: { label: "Seitensprache", shortLabel: "Sprache" },
  common: {
    ...enMessages.common,
    open: "Offnen",
    loading: "Wird geladen...",
    viewerCount: "Zuschauer",
  },
  home: {
    ...enMessages.home,
    hero: {
      ...enMessages.home.hero,
      statsHeading: "AoE4 Community Hub",
      title: "Deine Discord-Community fur Age of Empires an jedem Tag",
      description:
        "Ein Server fur Age of Empires Fans: Spiele, Events, Turniere, Strategietipps und eine echte Community zum gemeinsamen Spielen.",
      ctaJoin: "Discord beitreten",
      ctaItalianLeaderboard: "Italienische Rangliste",
      ctaNorthLeaderboard: "Nord Rangliste",
      ctaCenterLeaderboard: "Zentral Rangliste",
      ctaSouthLeaderboard: "Sud Rangliste",
      ctaTournaments: "Turniere",
      ctaPortal: "Spieler/Admin Bereich",
      stats: [
        { value: "24/7", label: "Aktive Community" },
        { value: "AoE", label: "Voller Fokus" },
        { value: "Events", label: "Jede Woche" },
      ],
    },
    liveStats: ["Sichtbare Widget-Nutzer", "Jetzt online", "Sichtbare Kanale"],
    twitch: {
      ...enMessages.home.twitch,
      badge: "Live auf Twitch",
      title: "Streamer der Community",
      description: "",
      featured: "Hauptstreamer",
      secondaryBadge: "Andere Streamer",
      secondaryTitle: "Andere Community-Kanale",
      open: "Auf Twitch offnen",
      empty: "Keine Streamer konfiguriert.",
    },
    playerLookup: {
      ...enMessages.home.playerLookup,
      compactBadge: "Schnellsuche",
      compactTitle: "Anderen Spieler suchen",
      title: "Finde das richtige Profil und offne die komplette Spieler-Seite",
      description:
        "Nach den Community-Streams kannst du hier direkt zur Einzelanalyse wechseln: Suche nach einem Steam-Namen und offne sofort die Spieler-Seite.",
      chipSearch: "AoE4World Suche",
      chipDashboard: "Direkter Dashboard-Zugang",
      label: "Steam-Name des Spielers",
      compactPlaceholder: "Anderen Spieler suchen...",
      submit: "Spieler offnen",
      submitPending: "Suche...",
      suggestionOpen: "Offnen",
      suggestionEmptyPrefix: "Keine Vorschlage gefunden fur",
      helper:
        "Gib den genauen Steam-Namen oder das passendste Ergebnis ein: Die Seite lost das Profil auf und bringt dich direkt zur Analyse-Seite.",
      lookupErrors: {
        emptySearch: "Gib einen Steam-Namen ein, um einen Spieler zu suchen.",
        searchUnavailable:
          "Die Spielersuche ist momentan nicht verfugbar.",
        noPlayer: "Kein Spieler mit diesem Steam-Namen gefunden.",
        openPlayer: "Gib einen Steam-Namen ein, um die Spieler-Seite zu offnen.",
        generic: "Bei der Spielersuche ist ein Fehler aufgetreten.",
      },
    },
    features: {
      ...enMessages.home.features,
      badge: "Warum beitreten",
      title: "Ein Discord-Server fur Menschen, die Age of Empires wirklich lieben",
      items: [
        {
          title: "Spiele und Matchmaking",
          desc: "Finde Spieler fur Ranked, Custom Games, Team Games und lockere Community-Abende.",
        },
        {
          title: "Turniere und Events",
          desc: "Organisiere oder verfolge Turniere, Challenges und Community Nights rund um Age of Empires.",
        },
        {
          title: "Guides und Strategie",
          desc: "Teile Build Orders, Tipps, Replays und Diskussionen uber Zivilisationen mit anderen Fans.",
        },
        {
          title: "Kern der italienischen Community",
          desc: "Ein Treffpunkt fur Spieler, die zusammen spielen, reden und in der italienischen Szene wachsen wollen.",
        },
      ],
    },
    discord: {
      ...enMessages.home.discord,
      liveBadge: "Discord live",
      liveDescription: "Die folgenden Daten stammen von Spielern unserer Community.",
      open: "Discord offnen",
      selectedRoom: "Spieler im ausgewahlten Sprachkanal",
      serverBadge: "Serverstatus",
      serverTitle: "Zahlen, die Vertrauen schaffen",
      serverDescription: "Die folgenden Daten stammen aus dem offentlichen Server-Widget.",
      presenceTitle: "Live-Prasenz",
      presenceText: "Mitglieder sind gerade online.",
    },
    coaching: {
      ...enMessages.home.coaching,
      title: "Trainiere mit Spielern aus der Community",
      description:
        "Dieser Bereich zeigt Mitglieder, die Coaching anbieten, mit Spezialisierungen, Preisen und direktem Kontaktlink.",
      available: "Verfugbarer Coach",
      price: "Preis",
      availability: "Verfugbarkeit",
      contact: "Kontakt",
      profile: "Profil",
      empty: "Aktuell sind keine Coaches konfiguriert.",
      scrollLeft: "Nach links scrollen",
      scrollRight: "Nach rechts scrollen",
    },
    events: {
      ...enMessages.home.events,
      badge: "AoE Events",
      title: "Kommende Community-Termine",
      description:
        "Turniere, Team-Game-Abende und Coaching-Sessions direkt aus der Community.",
      cta: "An Events teilnehmen",
      timePrefix: "Zeit",
      items: [
        {
          day: "12 MAR",
          title: "4v4 Team Game Night",
          time: "21:30",
          type: "Community Night",
          desc: "Ein offener Abend fur alle mit ausgeglichenen Lobbys und eigenen Sprachkanalen.",
        },
        {
          day: "15 MAR",
          title: "Wochenend-Bo3-Turnier",
          time: "18:00",
          type: "Turnier",
          desc: "Ein kleines Turnier mit schnellem Bracket fur Community-Mitglieder.",
        },
        {
          day: "18 MAR",
          title: "Coaching und Replay Review",
          time: "20:45",
          type: "Strategie",
          desc: "Replay-Analyse, Build Orders und praktische Tipps zu Zivilisationen.",
        },
      ],
    },
    join: {
      ...enMessages.home.join,
      listBadge: "Was du im Server findest",
      items: [
        "Kanale fur Zivilisationen, Strategien und Replays",
        "Community-Events zum Zusammenspielen und Kennenlernen neuer Spieler",
        "Platz fur Creator, Clips, Memes und kompetitive Diskussionen",
        "Einfache Organisation fur Turniere, Team Games und besondere Abende",
      ],
      cardBadge: "Jetzt beitreten",
      title: "Bring dein Gameplay auf das nachste Level",
      description: "Klicke hier und fang sofort an zu spielen.",
      cta: "Zu Discord!",
    },
    footer:
      "Produced by EpicoJackal, alle Rechte vorbehalten. Jede Ahnlichkeit mit realen Personen ist rein zufallig.",
  },
  portalShell: {
    tagline:
      "Turnierportal mit Login, automatischen Brackets und Ergebnisverwaltung.",
    tournaments: "Turniere",
    clanWars: "Clan Wars Karte",
    dashboard: "Dashboard",
    admin: "Admin",
    register: "Registrieren",
    login: "Login",
  },
  auth: {
    ...enMessages.auth,
    accountEmail: "Konto E-Mail",
    steamName: "Steam-Name",
    discordName: "Discord-Name",
    passwordRequirementsPrefix: "Passwort-Anforderungen",
    loginSubmit: "Mit E-Mail und Passwort anmelden",
    loginPending: "Anmeldung...",
    loginGenericError: "Anmeldung fehlgeschlagen. Bitte versuche es erneut.",
    registerSubmit: "Konto erstellen",
    registerPending: "Konto wird erstellt...",
    registerGenericError: "Registrierung fehlgeschlagen. Bitte versuche es erneut.",
    registerSuccess:
      "Registrierung abgeschlossen. Prufe deine E-Mail und klicke auf den Bestatigungslink, um ins Dashboard zu gelangen.",
    registerSuccessTitle: "Bestatigungs-E-Mail gesendet",
    registerSteps: [
      "Offne dein E-Mail-Postfach.",
      "Suche die Bestatigungsnachricht von Supabase.",
      "Klicke auf den Link und du wirst zum Dashboard weitergeleitet.",
    ],
    recoverySubmit: "Wiederherstellungslink senden",
    recoveryPending: "Link wird gesendet...",
    recoveryGenericError:
      "Der Versand des Wiederherstellungslinks ist fehlgeschlagen. Bitte versuche es erneut.",
    recoverySuccess:
      "Wir haben dir eine E-Mail mit dem Link zum Zurucksetzen des Passworts gesendet.",
    recoverySuccessTitle: "Wiederherstellungslink gesendet",
    recoverySteps: [
      "Offne dein E-Mail-Postfach.",
      "Suche die Nachricht mit dem Link zur Passwort-Wiederherstellung.",
      "Offne den Link und setze dein neues Passwort.",
    ],
    signOut: "Abmelden",
    signOutPending: "Abmeldung...",
  },
  loginPage: {
    ...enMessages.loginPage,
    eyebrow: "Turnierzugang",
    title: "E-Mail- und Passwort-Login, einfach und passend zum Turnier-Backend.",
    description:
      "Das Portal nutzt standardmassige Supabase-Sessions mit E-Mail und Passwort. Nutzer registrieren sich mit E-Mail, Passwort, Steam-Namen und Discord-Namen, bestatigen ihre E-Mail und gelangen dann direkt ins Dashboard.",
    cards: [
      {
        title: "E-Mail-Bestatigung",
        text: "Der Zugang wird nach Bestatigung der E-Mail-Adresse aktiviert.",
      },
      {
        title: "Spieler-Dashboard",
        text: "Dein nachster Gegner, Match-Status und das aktualisierte Bracket.",
      },
      {
        title: "Admin-Konsole",
        text: "Turniererstellung, manuelles Roster, Freigaben und Ergebnisanpassungen.",
      },
    ],
    formTitle: "Portal betreten",
    formDescription:
      "Gib deine Zugangsdaten ein. Falls du noch kein Profil hast, schliesse zuerst die Registrierung ab.",
    forgotPassword: "Passwort vergessen?",
    forgotDescription:
      "Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurucksetzen deines Passworts.",
    registerPrompt: "Noch kein Konto?",
    registerCta: "Zur Registrierung",
    callbackHelp:
      "Konfiguriere in Supabase `URL Configuration` den Pfad /auth/callback sowohl fur die Live-Domain als auch fur `localhost`.",
  },
  registerPage: {
    ...enMessages.registerPage,
    eyebrow: "Benutzerregistrierung",
    title: "Erstelle dein Turnierkonto mit E-Mail, Passwort, Steam und Discord.",
    description:
      "Nach der Registrierung erhaltst du eine Bestatigungs-E-Mail. Sobald die E-Mail bestatigt ist, fuhrt dich der Callback zum Benutzer-Dashboard.",
    bullets: [
      "E-Mail und Passwort fur den normalen Login",
      "Steam-Name und Discord-Name werden im Turnierprofil gespeichert",
      "E-Mail-Bestatigung vor vollem Zugriff erforderlich",
    ],
    formTitle: "Konto erstellen",
    formDescription:
      "Verwende echte oder zumindest stabile Angaben, damit Admins dich in Turnieren und Match-Bestatigungen erkennen konnen.",
    loginPrompt: "Hast du schon ein Konto?",
    loginCta: "Zum Login",
  },
  tournamentsPage: {
    ...enMessages.tournamentsPage,
    eyebrow: "Community-Turniere",
    title: "Turnierliste mit Verbindung zum Live-Backend.",
    description:
      "Hier kannst du offenen Turnieren beitreten, das vom Admin gewahlte Format sehen und das komplette Bracket offnen. Registrierungen und dein personlicher Status kommen direkt aus dem Express-Service.",
    serviceUnavailable: "Turnierdienst nicht verfugbar",
    serviceDescription:
      "Das Frontend hat das Backend erreicht, aber die Turnier-Route hat einen Fehler zuruckgegeben. Lokal passiert das oft, wenn das Supabase-Schema fehlt oder das Backend die Turniertabellen nicht lesen kann.",
    openTournament: "Turnier offnen",
    alreadyJoined: "Bereits teilnehmend",
    pendingApproval: "Anfrage wartet auf Freigabe",
    joinPending: "Anmeldung wird gesendet...",
    noDescription: "Noch keine Beschreibung.",
    participants: "Teilnehmer",
    rules: "Regeln",
    emptyTitle: "Keine Turniere verfugbar",
    emptyDescription:
      "Sobald ein Admin das erste Turnier erstellt, erscheint es hier mit Format, Status und Anmeldebutton.",
    joinLabels: {
      approval: "Anfrage senden",
      hybrid: "Beitreten / Slot anfragen",
      default: "Beitreten",
    },
    formatLabels: {
      single_elimination: "Einfaches K.-o.",
      double_elimination: "Doppeltes K.-o.",
      round_robin: "Round robin",
      championship: "Meisterschaft",
      swiss: "Schweizer System",
      groups_playoff: "Gruppen + Playoffs",
      international_style: "Internationaler Stil",
      league_season: "Liga-Saison",
      ladder: "Ladder",
      king_of_the_hill: "King of the hill",
      gsl_group: "GSL-Gruppe",
    },
    tournamentStatuses: {
      draft: "Entwurf",
      registration_open: "Anmeldung offen",
      check_in: "Check-in",
      seeding: "Seeding",
      live: "Live",
      paused: "Pausiert",
      completed: "Abgeschlossen",
      cancelled: "Abgebrochen",
    },
    matchStatuses: {
      pending: "Ausstehend",
      ready: "Bereit",
      awaiting_confirmation: "Wartet auf Bestatigung",
      disputed: "Umstritten",
      admin_review: "Admin-Prufung",
      completed: "Abgeschlossen",
      forfeited: "Forfeit",
      cancelled: "Abgebrochen",
    },
  },
};
