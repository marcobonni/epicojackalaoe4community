export type Locale = "it" | "en" | "fr" | "de" | "pl";

export type Dictionary = {
  metadata: {
    siteTitle: string;
    siteDescription: string;
    homeTitle: string;
    homeDescription: string;
    loginTitle: string;
    registerTitle: string;
    tournamentsTitle: string;
  };
  languageSwitcher: {
    label: string;
    shortLabel: string;
  };
  common: {
    new: string;
    live: string;
    offline: string;
    open: string;
    loading: string;
    viewerCount: string;
    noData: string;
  };
  home: {
    hero: {
      badge: string;
      title: string;
      description: string;
      ctaJoin: string;
      ctaItalianLeaderboard: string;
      ctaNorthLeaderboard: string;
      ctaCenterLeaderboard: string;
      ctaSouthLeaderboard: string;
      ctaQuiz: string;
      ctaMatchmaking: string;
      ctaTournaments: string;
      ctaPortal: string;
      statsHeading: string;
      stats: Array<{ value: string; label: string }>;
    };
    liveStats: [string, string, string];
    twitch: {
      badge: string;
      title: string;
      description: string;
      featured: string;
      secondaryBadge: string;
      secondaryTitle: string;
      open: string;
      empty: string;
    };
    playerLookup: {
      compactBadge: string;
      compactTitle: string;
      defaultBadge: string;
      title: string;
      description: string;
      chipSearch: string;
      chipDashboard: string;
      label: string;
      compactPlaceholder: string;
      defaultPlaceholder: string;
      submit: string;
      submitPending: string;
      suggestionOpen: string;
      suggestionEmptyPrefix: string;
      helper: string;
      lookupErrors: {
        emptySearch: string;
        searchUnavailable: string;
        noPlayer: string;
        openPlayer: string;
        generic: string;
      };
    };
    features: {
      badge: string;
      title: string;
      items: Array<{ title: string; desc: string }>;
    };
    discord: {
      liveBadge: string;
      liveDescription: string;
      open: string;
      selectedRoom: string;
      serverBadge: string;
      serverTitle: string;
      serverDescription: string;
      presenceTitle: string;
      presenceText: string;
    };
    coaching: {
      badge: string;
      title: string;
      description: string;
      available: string;
      focus: string;
      price: string;
      availability: string;
      contact: string;
      profile: string;
      empty: string;
      scrollLeft: string;
      scrollRight: string;
      coaches: Record<
        string,
        {
          badge: string;
          role: string;
          description: string;
          specialty: string;
          availability: string;
        }
      >;
    };
    events: {
      badge: string;
      title: string;
      description: string;
      cta: string;
      timePrefix: string;
      items: Array<{
        day: string;
        title: string;
        time: string;
        type: string;
        desc: string;
      }>;
    };
    join: {
      listBadge: string;
      items: string[];
      cardBadge: string;
      title: string;
      description: string;
      cta: string;
    };
    footer: string;
  };
  portalShell: {
    tagline: string;
    tournaments: string;
    clanWars: string;
    dashboard: string;
    admin: string;
    register: string;
    login: string;
  };
  auth: {
    email: string;
    password: string;
    accountEmail: string;
    steamName: string;
    discordName: string;
    passwordRequirementsPrefix: string;
    loginSubmit: string;
    loginPending: string;
    loginGenericError: string;
    registerSubmit: string;
    registerPending: string;
    registerGenericError: string;
    registerSuccess: string;
    registerSuccessTitle: string;
    registerSteps: string[];
    recoverySubmit: string;
    recoveryPending: string;
    recoveryGenericError: string;
    recoverySuccess: string;
    recoverySuccessTitle: string;
    recoverySteps: string[];
    signOut: string;
    signOutPending: string;
  };
  loginPage: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; text: string }>;
    formTitle: string;
    formDescription: string;
    forgotPassword: string;
    forgotDescription: string;
    missingConfig: string;
    registerPrompt: string;
    registerCta: string;
    callbackHelp: string;
    errors: {
      supabaseEnv: string;
      authCallback: string;
    };
    infos: {
      passwordUpdated: string;
    };
  };
  registerPage: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    formTitle: string;
    formDescription: string;
    missingConfig: string;
    loginPrompt: string;
    loginCta: string;
  };
  tournamentsPage: {
    eyebrow: string;
    title: string;
    description: string;
    serviceUnavailable: string;
    serviceDescription: string;
    openTournament: string;
    alreadyJoined: string;
    pendingApproval: string;
    joinPending: string;
    noDescription: string;
    participants: string;
    rules: string;
    emptyTitle: string;
    emptyDescription: string;
    joinLabels: {
      approval: string;
      hybrid: string;
      default: string;
    };
    formatLabels: Record<string, string>;
    tournamentStatuses: Record<string, string>;
    matchStatuses: Record<string, string>;
  };
};
