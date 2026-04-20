import type { Dictionary } from "@/app/lib/i18n-schema";

export const enMessages: Dictionary = {
  metadata: {
    siteTitle: "Aoe4 Community - Rankings, Quiz and Matchmaking",
    siteDescription:
      "An Age of Empires 4 community with rankings, competitive quiz content and balanced matchmaking.",
    homeTitle: "Aoe4 Community - Rankings, Streams and Quiz",
    homeDescription:
      "Join the AoE4 community for rankings, quiz content and automatic matchmaking.",
    loginTitle: "Tournament Login | AoE4 Community",
    registerTitle: "Tournament Registration | AoE4 Community",
    tournamentsTitle: "Tournaments | AoE4 Community",
  },
  languageSwitcher: { label: "Site language", shortLabel: "Language" },
  common: {
    new: "NEW",
    live: "Live",
    offline: "Offline",
    open: "Open",
    loading: "Loading...",
    viewerCount: "viewers",
    noData: "—",
  },
  home: {
    hero: {
      badge: "Age of Empires Community Discord",
      title: "Your Discord community for Age of Empires every single day",
      description:
        "A server built for Age of Empires fans: games, events, tournaments, strategy advice and a real community to queue up with.",
      statsHeading: "AoE4 Community Hub",
      ctaJoin: "Join Discord",
      ctaItalianLeaderboard: "Italian leaderboard",
      ctaNorthLeaderboard: "North leaderboard",
      ctaCenterLeaderboard: "Center leaderboard",
      ctaSouthLeaderboard: "South leaderboard",
      ctaQuiz: "Quiz",
      ctaMatchmaking: "Matchmaking",
      ctaTournaments: "Tournaments",
      ctaPortal: "Player/admin area",
      stats: [
        { value: "24/7", label: "Active community" },
        { value: "AoE", label: "Full focus" },
        { value: "Events", label: "Every week" },
      ],
    },
    liveStats: ["Visible widget users", "Online now", "Visible channels"],
    twitch: {
      badge: "Live on Twitch",
      title: "Community streamers",
      description: "",
      featured: "Featured streamer",
      secondaryBadge: "More streamers",
      secondaryTitle: "More community channels",
      open: "Open on Twitch",
      empty: "No configured streamers.",
    },
    playerLookup: {
      compactBadge: "Quick Search",
      compactTitle: "Search another player",
      defaultBadge: "Player Analysis",
      title: "Find the right profile and open the full player page",
      description:
        "Right after community streams, jump into individual analysis here: search a Steam name and go straight to the player's page on the site.",
      chipSearch: "AoE4World search",
      chipDashboard: "Direct dashboard access",
      label: "Player Steam name",
      compactPlaceholder: "Search another player...",
      defaultPlaceholder: "Ex. MarineLorD, Beastyqt, Demu",
      submit: "Open player",
      submitPending: "Searching...",
      suggestionOpen: "Open",
      suggestionEmptyPrefix: "No suggestions found for",
      helper:
        "Enter the exact Steam name or the closest result: the site resolves the profile and takes you straight to the analysis page.",
      lookupErrors: {
        emptySearch: "Enter a Steam name to search for a player.",
        searchUnavailable: "Player search is not available right now.",
        noPlayer: "No player found with that Steam name.",
        openPlayer: "Enter a Steam name to open the player page.",
        generic: "There was an error while searching for the player.",
      },
    },
    features: {
      badge: "Why join",
      title: "A Discord server built for people who truly love Age of Empires",
      items: [
        {
          title: "Games and matchmaking",
          desc: "Find players for ranked, custom matches, team games and casual nights inside the community.",
        },
        {
          title: "Tournaments and events",
          desc: "Organize or follow tournaments, challenges and community nights built around Age of Empires.",
        },
        {
          title: "Guides and strategy",
          desc: "Share build orders, advice, replays and civilization discussions with other passionate players.",
        },
        {
          title: "Italian community core",
          desc: "A home base for players who want to play, chat and grow together in the Italian scene.",
        },
      ],
    },
    discord: {
      liveBadge: "Discord live",
      liveDescription: "The data below comes from players in our community.",
      open: "Open Discord",
      selectedRoom: "Players in the selected voice room",
      serverBadge: "Server status",
      serverTitle: "Numbers that build trust",
      serverDescription: "Here is a live snapshot of the community on Discord.",
      presenceTitle: "Live presence",
      presenceText: "members online right now.",
    },
    coaching: {
      badge: "Coaching",
      title: "Practice with community players",
      description:
        "This section highlights members available for coaching, with specialties, pricing and a direct contact link.",
      available: "Available coach",
      focus: "Focus",
      price: "Price",
      availability: "Availability",
      contact: "Contact",
      profile: "Profile",
      empty: "No coaches configured right now.",
      scrollLeft: "Scroll left",
      scrollRight: "Scroll right",
      coaches: {
        EpicoJackal: {
          badge: "AoE4 Coach",
          role: "1v1 and teamgame coaching",
          description:
            "Sessions focused on macro, build orders, scouting and decision making.",
          specialty: "Build optimization, replay reviews, competitive mindset",
          availability: "Evenings and weekends",
        },
        Daddu23: {
          badge: "AoE4 Coach",
          role: "Existential coaching",
          description:
            "Sessions dedicated to understanding who you are and what you want to become in the game.",
          specialty:
            "Game fundamentals, finding your favorite civilization, tactics for different situations",
          availability: "Evenings and afternoons",
        },
        Taffuz: {
          badge: "Top Ladder",
          role: "Competitive AoE4 coaching",
          description:
            "Training focused on advanced macro, timing pushes and meta civilization management.",
          specialty: "Meta strategy, timing attacks, mid game decision making",
          availability: "Weekends",
        },
        Kasiya: {
          badge: "Strategy Coach",
          role: "Replay analysis and decision making improvement",
          description:
            "Replay analysis sessions to improve macro, scouting and strategic adaptation.",
          specialty: "Replay analysis, macro management, map control",
          availability: "Evenings",
        },
        Scapolocaldo667: {
          badge: "Strategy Coach",
          role: "Replay analysis and decision making improvement",
          description:
            "Personalized sessions on build orders, macro and micro management, map control and scouting.",
          specialty: "Macro management and map control",
          availability: "Evenings",
        },
      },
    },
    events: {
      badge: "AoE events",
      title: "Upcoming community sessions",
      description:
        "Tournaments, team game nights and coaching sessions organized directly by the community.",
      cta: "Join the events",
      timePrefix: "Time",
      items: [
        {
          day: "12 MAR",
          title: "4v4 Team Game Night",
          time: "21:30",
          type: "Community Night",
          desc: "An open evening for everyone with balanced lobbies and dedicated voice channels.",
        },
        {
          day: "15 MAR",
          title: "Weekend Bo3 Tournament",
          time: "18:00",
          type: "Tournament",
          desc: "A mini bracket tournament for community members.",
        },
        {
          day: "18 MAR",
          title: "Coaching & Replay Review",
          time: "20:45",
          type: "Strategy",
          desc: "Replay analysis, build orders and practical civilization advice.",
        },
      ],
    },
    join: {
      listBadge: "What you will find inside",
      items: [
        "Channels dedicated to civilizations, strategies and replays",
        "Community events to play together and meet new players",
        "Space for creators, clips, memes and competitive discussion",
        "Simple organization for tournaments, team games and special nights",
      ],
      cardBadge: "Join now",
      title: "Take your gameplay to the next level",
      description: "Click here and start playing right away.",
      cta: "Go to Discord!",
    },
    footer:
      "Produced by EpicoJackal, all rights reserved. Any resemblance to real people is purely coincidental.",
  },
  portalShell: {
    tagline: "Follow tournaments, track your matches and stay close to the community.",
    tournaments: "Tournaments",
    clanWars: "Clan Wars map",
    dashboard: "Dashboard",
    admin: "Admin",
    register: "Register",
    login: "Login",
  },
  auth: {
    email: "Email",
    password: "Password",
    accountEmail: "Account email",
    steamName: "Steam name",
    discordName: "Discord name",
    passwordRequirementsPrefix: "Password requirements",
    loginSubmit: "Sign in with email and password",
    loginPending: "Signing in...",
    loginGenericError: "Sign in failed. Please try again.",
    registerSubmit: "Create account",
    registerPending: "Creating account...",
    registerGenericError: "Registration failed. Please try again.",
    registerSuccess:
      "Registration completed. Check your email and click the confirmation link to enter the dashboard.",
    registerSuccessTitle: "Confirmation email sent",
    registerSteps: [
      "Open your email inbox.",
      "Look for the confirmation email.",
      "Click the link and you will be redirected to the dashboard.",
    ],
    recoverySubmit: "Send recovery link",
    recoveryPending: "Sending link...",
    recoveryGenericError: "Sending the recovery link failed. Please try again.",
    recoverySuccess: "We sent you an email with the password reset link.",
    recoverySuccessTitle: "Recovery link sent",
    recoverySteps: [
      "Open your email inbox.",
      "Look for the message with the password recovery link.",
      "Open the link and set your new password.",
    ],
    signOut: "Sign out",
    signOutPending: "Signing out...",
  },
  loginPage: {
    eyebrow: "Tournament access",
    title: "Sign in to your tournament space",
    description:
      "Sign in with your email and password to view tournaments, follow the bracket and check your upcoming matches.",
    cards: [
      {
        title: "Email verification",
        text: "Access is enabled after confirming the email address.",
      },
      {
        title: "Player dashboard",
        text: "Your next opponent, match status and updated bracket.",
      },
      {
        title: "Organizer area",
        text: "Manage tournaments, signups and results in one place.",
      },
    ],
    formTitle: "Enter the portal",
    formDescription:
      "Enter your account details. If you do not have a profile yet, create one in a few moments.",
    forgotPassword: "Forgot your password?",
    forgotDescription:
      "Enter your email and we will send you a link to reset your password.",
    missingConfig:
      "Sign in is not available right now. Please try again shortly.",
    registerPrompt: "Need an account?",
    registerCta: "Go to registration",
    callbackHelp:
      "If you just confirmed your email and still cannot sign in, try opening the link again.",
    errors: {
      supabaseEnv: "Sign in is not available right now. Please try again shortly.",
      authCallback:
        "Email confirmation did not complete successfully. Try opening the link again.",
    },
    infos: {
      passwordUpdated:
        "Password updated. You can now sign in with your new credentials.",
    },
  },
  registerPage: {
    eyebrow: "User registration",
    title: "Create your community account",
    description:
      "Create your account to join tournaments, follow your matches and keep your player profile updated.",
    bullets: [
      "Quick sign in with email and password",
      "Player profile with Steam and Discord names",
      "Email confirmation before your first access",
    ],
    formTitle: "Create account",
    formDescription:
      "Use clear, recognizable details so it is easier to identify you in tournaments and match confirmations.",
    missingConfig:
      "Registration is not available right now. Please try again shortly.",
    loginPrompt: "Already have an account?",
    loginCta: "Go to login",
  },
  tournamentsPage: {
    eyebrow: "Community tournaments",
    title: "Open community tournaments",
    description:
      "Explore available tournaments, check the format and rules, and join when registration is open.",
    serviceUnavailable: "Tournaments are temporarily unavailable",
    serviceDescription:
      "We could not load the tournament list right now. Please try again shortly.",
    openTournament: "Open tournament",
    alreadyJoined: "Already participating",
    pendingApproval: "Request pending approval",
    joinPending: "Submitting registration...",
    noDescription: "No description yet.",
    participants: "Participants",
    rules: "Rules",
    emptyTitle: "No tournaments available",
    emptyDescription:
      "When new events are available, you will find them here with everything you need to join.",
    joinLabels: {
      approval: "Request access",
      hybrid: "Join / request slot",
      default: "Join",
    },
    formatLabels: {
      single_elimination: "Single elimination",
      double_elimination: "Double elimination",
      round_robin: "Round robin",
      championship: "Championship",
      swiss: "Swiss",
      groups_playoff: "Groups + playoff",
      international_style: "International style",
      league_season: "League season",
      ladder: "Ladder",
      king_of_the_hill: "King of the hill",
      gsl_group: "GSL group",
    },
    tournamentStatuses: {
      draft: "Draft",
      registration_open: "Registration open",
      check_in: "Check-in",
      seeding: "Seeding",
      live: "Live",
      paused: "Paused",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    matchStatuses: {
      pending: "Pending",
      ready: "Ready",
      awaiting_confirmation: "Awaiting confirmation",
      disputed: "Disputed",
      admin_review: "Admin review",
      completed: "Completed",
      forfeited: "Forfeit",
      cancelled: "Cancelled",
    },
  },
};
