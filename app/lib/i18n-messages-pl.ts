import { enMessages } from "@/app/lib/i18n-messages-en";
import type { Dictionary } from "@/app/lib/i18n-schema";

export const plMessages: Dictionary = {
  ...enMessages,
  metadata: {
    siteTitle: "Aoe4 Community - Rankingi, Quiz i Matchmaking",
    siteDescription:
      "Spolecznosc Age of Empires 4 z rankingami, quizami i wywazonym matchmakingiem.",
    homeTitle: "Aoe4 Community - Rankingi, Streamy i Quiz",
    homeDescription:
      "Dolacz do spolecznosci AoE4 po rankingi, quiz i automatyczny matchmaking.",
    loginTitle: "Logowanie Turniejowe | AoE4 Community",
    registerTitle: "Rejestracja Turniejowa | AoE4 Community",
    tournamentsTitle: "Turnieje | AoE4 Community",
  },
  languageSwitcher: { label: "Jezyk strony", shortLabel: "Jezyk" },
  common: {
    ...enMessages.common,
    open: "Otworz",
    loading: "Ladowanie...",
    viewerCount: "widzow",
  },
  home: {
    ...enMessages.home,
    hero: {
      ...enMessages.home.hero,
      title: "Twoja spolecznosc Discord do Age of Empires na co dzien",
      description:
        "Serwer stworzony dla fanow Age of Empires: mecze, wydarzenia, turnieje, porady strategiczne i prawdziwa spolecznosc do wspolnej gry.",
      ctaJoin: "Dolacz do serwera",
      ctaItalianLeaderboard: "Ranking wloski",
      ctaNorthLeaderboard: "Ranking polnoc",
      ctaCenterLeaderboard: "Ranking centrum",
      ctaSouthLeaderboard: "Ranking poludnie",
      ctaTournaments: "Turnieje",
      ctaPortal: "Strefa gracz/admin",
      stats: [
        { value: "24/7", label: "Aktywna spolecznosc" },
        { value: "AoE", label: "Pelny fokus" },
        { value: "Events", label: "Co tydzien" },
      ],
    },
    liveStats: ["Widoczni uzytkownicy", "Online teraz", "Widoczne kanaly"],
    twitch: {
      ...enMessages.home.twitch,
      badge: "Na zywo na Twitchu",
      title: "Wyroznieni streamerzy i dodatkowe kanaly",
      description:
        "Glowny streamer jest wybierany automatycznie sposrod tych, ktorzy sa na zywo, z priorytetem dla najwyzszej liczby widzow. Jesli nikt nie jest online, pokazujemy streamera rezerwowego.",
      featured: "Wyrozniony streamer",
      secondaryBadge: "Dodatkowi streamerzy",
      secondaryTitle: "Inne kanaly spolecznosci",
      open: "Otworz na Twitchu",
      empty: "Brak skonfigurowanych streamerow.",
    },
    playerLookup: {
      ...enMessages.home.playerLookup,
      compactBadge: "Szybkie wyszukiwanie",
      compactTitle: "Szukaj innego gracza",
      title: "Znajdz odpowiedni profil i otworz pelna strone gracza",
      description:
        "Po streamach spolecznosci mozesz od razu przejsc do analizy pojedynczego gracza: wyszukaj nazwe Steam i przejdz prosto do jego strony.",
      chipSearch: "Wyszukiwanie AoE4World",
      chipDashboard: "Bezposredni dostep do panelu",
      label: "Nazwa Steam gracza",
      compactPlaceholder: "Szukaj innego gracza...",
      submit: "Otworz gracza",
      submitPending: "Szukanie...",
      suggestionOpen: "Otworz",
      suggestionEmptyPrefix: "Brak podpowiedzi dla",
      helper:
        "Wpisz dokladna nazwe Steam albo najblizszy wynik: strona odnajdzie profil i przeniesie cie bezposrednio do analizy.",
      lookupErrors: {
        emptySearch: "Wpisz nazwe Steam, aby wyszukac gracza.",
        searchUnavailable: "Wyszukiwanie graczy jest teraz niedostepne.",
        noPlayer: "Nie znaleziono gracza o tej nazwie Steam.",
        openPlayer: "Wpisz nazwe Steam, aby otworzyc strone gracza.",
        generic: "Wystapil blad podczas wyszukiwania gracza.",
      },
    },
    features: {
      ...enMessages.home.features,
      badge: "Dlaczego warto dolaczyc",
      title: "Serwer Discord zbudowany dla ludzi, ktorzy naprawde kochaja Age of Empires",
      items: [
        {
          title: "Gry i matchmaking",
          desc: "Znajdz graczy do rankedow, customow, team game'ow i luznych wieczorow w spolecznosci.",
        },
        {
          title: "Turnieje i wydarzenia",
          desc: "Organizuj lub sledz turnieje, wyzwania i community nights zwiazane z Age of Empires.",
        },
        {
          title: "Poradniki i strategia",
          desc: "Dziel sie build orderami, poradami, replayami i dyskusjami o cywilizacjach z innymi pasjonatami.",
        },
        {
          title: "Rdzen wloskiej spolecznosci",
          desc: "Miejsce dla graczy, ktorzy chca grac, rozmawiac i rozwijac sie razem na wloskiej scenie.",
        },
      ],
    },
    discord: {
      ...enMessages.home.discord,
      liveBadge: "Discord na zywo",
      liveDescription: "Ponizsze dane pochodza od graczy z naszej spolecznosci.",
      open: "Otworz Discord",
      selectedRoom: "Gracze w wybranym kanale glosowym",
      serverBadge: "Status serwera",
      serverTitle: "Liczby, ktore buduja zaufanie",
      serverDescription: "Ponizsze dane pochodza z publicznego widgetu serwera.",
      presenceTitle: "Obecnosc na zywo",
      presenceText: "czlonkow jest teraz online.",
    },
    coaching: {
      ...enMessages.home.coaching,
      title: "Trenuj z graczami ze spolecznosci",
      description:
        "Ta sekcja pokazuje osoby dostepne do coachingu, wraz ze specjalizacjami, cena i bezposrednim kontaktem.",
      available: "Dostepny coach",
      price: "Cena",
      availability: "Dostepnosc",
      contact: "Kontakt",
      profile: "Profil",
      empty: "Brak skonfigurowanych coachow.",
      scrollLeft: "Przewin w lewo",
      scrollRight: "Przewin w prawo",
    },
    events: {
      ...enMessages.home.events,
      badge: "Wydarzenia AoE",
      title: "Nadchodzace wydarzenia spolecznosci",
      description:
        "Turnieje, wieczory team game i sesje coachingowe organizowane bezposrednio przez spolecznosc.",
      cta: "Dolacz do wydarzen",
      timePrefix: "Godzina",
      items: [
        {
          day: "12 MAR",
          title: "Wieczor Team Game 4v4",
          time: "21:30",
          type: "Community Night",
          desc: "Otwarty wieczor dla wszystkich z wywazonymi lobby i dedykowanymi kanalami glosowymi.",
        },
        {
          day: "15 MAR",
          title: "Weekendowy turniej Bo3",
          time: "18:00",
          type: "Turniej",
          desc: "Maly turniej z szybkim bracketem dla czlonkow spolecznosci.",
        },
        {
          day: "18 MAR",
          title: "Coaching i Replay Review",
          time: "20:45",
          type: "Strategia",
          desc: "Analiza replayow, build ordery i praktyczne porady dotyczace cywilizacji.",
        },
      ],
    },
    join: {
      ...enMessages.home.join,
      listBadge: "Co znajdziesz w srodku",
      items: [
        "Kanaly poswiecone cywilizacjom, strategiom i replayom",
        "Wydarzenia spolecznosci, by grac razem i poznawac nowych graczy",
        "Miejsce dla tworcow, clipow, memow i dyskusji turniejowych",
        "Prosta organizacja turniejow, team game'ow i specjalnych wieczorow",
      ],
      cardBadge: "Dolacz teraz",
      title: "Wynies swoj gameplay na wyzszy poziom",
      description: "Kliknij tutaj i zacznij grac od razu.",
      cta: "Przejdz do Discorda!",
    },
    footer:
      "Produced by EpicoJackal, wszelkie prawa zastrzezone. Wszelkie podobienstwo do prawdziwych osob jest przypadkowe.",
  },
  portalShell: {
    tagline:
      "Portal turniejowy z logowaniem, automatycznymi bracketami i obsluga wynikow.",
    tournaments: "Turnieje",
    clanWars: "Mapa Clan Wars",
    dashboard: "Panel",
    admin: "Admin",
    register: "Rejestracja",
    login: "Logowanie",
  },
  auth: {
    ...enMessages.auth,
    accountEmail: "Email konta",
    steamName: "Nazwa Steam",
    discordName: "Nazwa Discord",
    passwordRequirementsPrefix: "Wymagania hasla",
    loginSubmit: "Zaloguj przez email i haslo",
    loginPending: "Logowanie...",
    loginGenericError: "Logowanie nie powiodlo sie. Sprobuj ponownie.",
    registerSubmit: "Utworz konto",
    registerPending: "Tworzenie konta...",
    registerGenericError: "Rejestracja nie powiodla sie. Sprobuj ponownie.",
    registerSuccess:
      "Rejestracja zakonczona. Sprawdz email i kliknij link potwierdzajacy, aby wejsc do panelu.",
    registerSuccessTitle: "Wyslano email potwierdzajacy",
    registerSteps: [
      "Otworz swoja skrzynke email.",
      "Znajdz wiadomosc potwierdzajaca od Supabase.",
      "Kliknij link i zostaniesz przeniesiony do panelu.",
    ],
    recoverySubmit: "Wyslij link odzyskiwania",
    recoveryPending: "Wysylanie linku...",
    recoveryGenericError:
      "Nie udalo sie wyslac linku odzyskiwania. Sprobuj ponownie.",
    recoverySuccess:
      "Wyslalismy email z linkiem do resetowania hasla.",
    recoverySuccessTitle: "Link odzyskiwania wyslany",
    recoverySteps: [
      "Otworz swoja skrzynke email.",
      "Znajdz wiadomosc z linkiem do odzyskania hasla.",
      "Otworz link i ustaw nowe haslo.",
    ],
    signOut: "Wyloguj",
    signOutPending: "Wylogowywanie...",
  },
  loginPage: {
    ...enMessages.loginPage,
    eyebrow: "Dostep do turniejow",
    title: "Logowanie emailem i haslem, proste i zgodne z backendem turniejowym.",
    description:
      "Portal uzywa standardowych sesji Supabase z emailem i haslem. Uzytkownicy rejestruja sie przez email, haslo, nazwe Steam i nazwe Discord, potwierdzaja email i trafiaja prosto do panelu.",
    cards: [
      {
        title: "Weryfikacja email",
        text: "Dostep jest aktywowany po potwierdzeniu adresu email.",
      },
      {
        title: "Panel gracza",
        text: "Twoj nastepny przeciwnik, status meczu i zaktualizowany bracket.",
      },
      {
        title: "Konsola admina",
        text: "Tworzenie turniejow, reczne roster'y, akceptacje i poprawki wynikow.",
      },
    ],
    formTitle: "Wejdz do portalu",
    formDescription:
      "Wpisz dane swojego konta. Jesli nie masz jeszcze profilu, najpierw dokoncz rejestracje.",
    forgotPassword: "Zapomniales hasla?",
    forgotDescription:
      "Wpisz swoj email, a wyslemy ci link do zresetowania hasla.",
    registerPrompt: "Potrzebujesz konta?",
    registerCta: "Przejdz do rejestracji",
    callbackHelp:
      "Skonfiguruj w Supabase `URL Configuration` ze sciezka /auth/callback dla domeny live oraz `localhost`.",
  },
  registerPage: {
    ...enMessages.registerPage,
    eyebrow: "Rejestracja uzytkownika",
    title: "Utworz konto turniejowe przez email, haslo, Steam i Discord.",
    description:
      "Po rejestracji otrzymasz email potwierdzajacy. Gdy email zostanie zweryfikowany, callback przeniesie cie do panelu uzytkownika.",
    bullets: [
      "Email i haslo do standardowego logowania",
      "Nazwa Steam i Discord zapisywane w profilu turniejowym",
      "Potwierdzenie email wymagane przed pelnym dostepem",
    ],
    formTitle: "Utworz konto",
    formDescription:
      "Uzywaj prawdziwych lub stabilnych danych, aby admini mogli rozpoznac cie w turniejach i potwierdzeniach meczow.",
    loginPrompt: "Masz juz konto?",
    loginCta: "Przejdz do logowania",
  },
  tournamentsPage: {
    ...enMessages.tournamentsPage,
    eyebrow: "Turnieje spolecznosci",
    title: "Lista turniejow polaczona z prawdziwym backendem.",
    description:
      "Tutaj mozesz dolaczac do otwartych turniejow, zobaczyc format wybrany przez admina i otworzyc pelny bracket. Rejestracje i twoj status osobisty pochodza bezposrednio z serwisu Express.",
    serviceUnavailable: "Usluga turniejowa niedostepna",
    serviceDescription:
      "Frontend polaczyl sie z backendem, ale trasa turniejowa zwrocila blad. Lokalnie czesto dzieje sie tak, gdy brakuje schematu Supabase albo backend nie moze odczytac tabel turniejowych.",
    openTournament: "Otworz turniej",
    alreadyJoined: "Juz bierzesz udzial",
    pendingApproval: "Prosba czeka na akceptacje",
    joinPending: "Wysylanie zapisu...",
    noDescription: "Brak opisu.",
    participants: "Uczestnicy",
    rules: "Zasady",
    emptyTitle: "Brak dostepnych turniejow",
    emptyDescription:
      "Gdy admin utworzy pierwszy turniej, pojawi sie tutaj wraz z formatem, statusem i przyciskiem zapisu.",
    joinLabels: {
      approval: "Wyslij prosbe",
      hybrid: "Dolacz / popros o slot",
      default: "Dolacz",
    },
    formatLabels: {
      single_elimination: "Pojedyncza eliminacja",
      double_elimination: "Podwojna eliminacja",
      round_robin: "Round robin",
      championship: "Mistrzostwa",
      swiss: "System szwajcarski",
      groups_playoff: "Grupy + playoff",
      international_style: "Styl miedzynarodowy",
      league_season: "Sezon ligowy",
      ladder: "Ladder",
      king_of_the_hill: "King of the hill",
      gsl_group: "Grupa GSL",
    },
    tournamentStatuses: {
      draft: "Szkic",
      registration_open: "Zapisy otwarte",
      check_in: "Check-in",
      seeding: "Seeding",
      live: "Na zywo",
      paused: "Wstrzymany",
      completed: "Zakonczony",
      cancelled: "Anulowany",
    },
    matchStatuses: {
      pending: "Oczekuje",
      ready: "Gotowy",
      awaiting_confirmation: "Oczekuje na potwierdzenie",
      disputed: "Sporny",
      admin_review: "Weryfikacja admina",
      completed: "Zakonczony",
      forfeited: "Walkower",
      cancelled: "Anulowany",
    },
  },
};
