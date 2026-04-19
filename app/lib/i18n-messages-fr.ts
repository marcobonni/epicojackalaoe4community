import { enMessages } from "@/app/lib/i18n-messages-en";
import type { Dictionary } from "@/app/lib/i18n-schema";

export const frMessages: Dictionary = {
  ...enMessages,
  metadata: {
    siteTitle: "Aoe4 Community - Classements, Quiz et Matchmaking",
    siteDescription:
      "Une communaute Age of Empires 4 avec classements, quiz competitifs et matchmaking equilibre.",
    homeTitle: "Aoe4 Community - Classements, Streams et Quiz",
    homeDescription:
      "Rejoignez la communaute AoE4 pour les classements, les quiz et le matchmaking automatique.",
    loginTitle: "Connexion Tournois | AoE4 Community",
    registerTitle: "Inscription Tournois | AoE4 Community",
    tournamentsTitle: "Tournois | AoE4 Community",
  },
  languageSwitcher: { label: "Langue du site", shortLabel: "Langue" },
  common: {
    ...enMessages.common,
    open: "Ouvrir",
    loading: "Chargement...",
    viewerCount: "spectateurs",
  },
  home: {
    ...enMessages.home,
    hero: {
      ...enMessages.home.hero,
      statsHeading: "Hub communaute AoE4",
      title: "Votre communaute Discord pour vivre Age of Empires chaque jour",
      description:
        "Un serveur pense pour les fans de Age of Empires : parties, evenements, tournois, conseils strategiques et une vraie communaute avec qui jouer.",
      ctaJoin: "Rejoindre Discord",
      ctaItalianLeaderboard: "Classement italien",
      ctaNorthLeaderboard: "Classement nord",
      ctaCenterLeaderboard: "Classement centre",
      ctaSouthLeaderboard: "Classement sud",
      ctaTournaments: "Tournois",
      ctaPortal: "Espace joueur/admin",
      stats: [
        { value: "24/7", label: "Communaute active" },
        { value: "AoE", label: "Focus total" },
        { value: "Events", label: "Chaque semaine" },
      ],
    },
    liveStats: ["Utilisateurs visibles", "En ligne", "Canaux visibles"],
    twitch: {
      ...enMessages.home.twitch,
      badge: "En direct sur Twitch",
      title: "Streamers de la communaute",
      description: "",
      featured: "Streamer mis en avant",
      secondaryBadge: "Autres streamers",
      secondaryTitle: "Autres chaines de la communaute",
      open: "Ouvrir sur Twitch",
      empty: "Aucun streamer configure.",
    },
    playerLookup: {
      ...enMessages.home.playerLookup,
      compactBadge: "Recherche rapide",
      compactTitle: "Rechercher un autre joueur",
      title: "Trouvez le bon profil et ouvrez la fiche complete du joueur",
      description:
        "Apres les streams de la communaute, passez directement a l'analyse individuelle : recherchez un nom Steam et ouvrez immediatement la page du joueur.",
      chipSearch: "Recherche AoE4World",
      chipDashboard: "Acces direct au tableau de bord",
      label: "Nom Steam du joueur",
      compactPlaceholder: "Rechercher un autre joueur...",
      submit: "Ouvrir le joueur",
      submitPending: "Recherche...",
      suggestionOpen: "Ouvrir",
      suggestionEmptyPrefix: "Aucune suggestion trouvee pour",
      helper:
        "Saisissez le nom Steam exact ou le resultat le plus proche : le site trouve le profil et vous emmene directement vers la page d'analyse.",
      lookupErrors: {
        emptySearch: "Saisissez un nom Steam pour rechercher un joueur.",
        searchUnavailable:
          "La recherche de joueur n'est pas disponible pour le moment.",
        noPlayer: "Aucun joueur trouve avec ce nom Steam.",
        openPlayer: "Saisissez un nom Steam pour ouvrir la page du joueur.",
        generic: "Une erreur est survenue pendant la recherche du joueur.",
      },
    },
    features: {
      ...enMessages.home.features,
      badge: "Pourquoi nous rejoindre",
      title: "Un serveur Discord concu pour ceux qui aiment vraiment Age of Empires",
      items: [
        {
          title: "Parties et matchmaking",
          desc: "Trouvez des joueurs pour les ranked, les parties personnalisees, les team games et les soirees detendues de la communaute.",
        },
        {
          title: "Tournois et evenements",
          desc: "Organisez ou suivez des tournois, des defis et des community nights autour de Age of Empires.",
        },
        {
          title: "Guides et strategie",
          desc: "Partagez build orders, conseils, replays et discussions sur les civilisations avec d'autres passionnes.",
        },
        {
          title: "Coeur de la communaute italienne",
          desc: "Un point de rencontre pour jouer, discuter et progresser ensemble dans la scene italienne.",
        },
      ],
    },
    discord: {
      ...enMessages.home.discord,
      liveBadge: "Discord en direct",
      liveDescription: "Les donnees ci-dessous proviennent des joueurs de notre communaute.",
      open: "Ouvrir Discord",
      selectedRoom: "Joueurs dans le salon vocal selectionne",
      serverBadge: "Etat du serveur",
      serverTitle: "Des chiffres qui inspirent confiance",
      serverDescription: "Voici un apercu en direct de la communaute sur Discord.",
      presenceTitle: "Presence en direct",
      presenceText: "membres en ligne en ce moment.",
    },
    coaching: {
      ...enMessages.home.coaching,
      title: "Entrainez-vous avec des joueurs de la communaute",
      description:
        "Cette section met en avant les membres disponibles pour du coaching, avec specialites, tarifs et lien de contact direct.",
      available: "Coach disponible",
      price: "Prix",
      availability: "Disponibilite",
      contact: "Contacter",
      profile: "Profil",
      empty: "Aucun coach configure pour le moment.",
      scrollLeft: "Defiler vers la gauche",
      scrollRight: "Defiler vers la droite",
    },
    events: {
      ...enMessages.home.events,
      badge: "Evenements AoE",
      title: "Prochains rendez-vous de la communaute",
      description:
        "Tournois, soirees team game et sessions de coaching organises directement par la communaute.",
      cta: "Participer aux evenements",
      timePrefix: "Heure",
      items: [
        {
          day: "12 MAR",
          title: "Soiree Team Game 4v4",
          time: "21:30",
          type: "Community Night",
          desc: "Une soiree ouverte a tous avec des lobbys equilibres et des salons vocaux dedies.",
        },
        {
          day: "15 MAR",
          title: "Tournoi Bo3 du week-end",
          time: "18:00",
          type: "Tournoi",
          desc: "Un mini tournoi a bracket rapide pour les membres de la communaute.",
        },
        {
          day: "18 MAR",
          title: "Coaching et Replay Review",
          time: "20:45",
          type: "Strategie",
          desc: "Analyse de replays, build orders et conseils pratiques sur les civilisations.",
        },
      ],
    },
    join: {
      ...enMessages.home.join,
      listBadge: "Ce que vous trouverez",
      items: [
        "Des salons dedies aux civilisations, aux strategies et aux replays",
        "Des evenements communautaires pour jouer ensemble et rencontrer de nouveaux joueurs",
        "Un espace pour les createurs, les clips, les memes et les discussions competitives",
        "Une organisation simple pour les tournois, team games et soirees speciales",
      ],
      cardBadge: "Rejoindre",
      title: "Faites passer votre gameplay au niveau superieur",
      description: "Cliquez ici et commencez a jouer tout de suite.",
      cta: "Aller sur Discord !",
    },
    footer:
      "Produced by EpicoJackal, tous droits reserves. Toute ressemblance avec des personnes reelles est purement fortuite.",
  },
  portalShell: {
    tagline:
      "Suivez les tournois, vos matchs et restez au coeur de la communaute.",
    tournaments: "Tournois",
    clanWars: "Carte Clan Wars",
    dashboard: "Tableau de bord",
    admin: "Admin",
    register: "S'inscrire",
    login: "Connexion",
  },
  auth: {
    ...enMessages.auth,
    accountEmail: "Email du compte",
    steamName: "Nom Steam",
    discordName: "Nom Discord",
    passwordRequirementsPrefix: "Exigences du mot de passe",
    loginSubmit: "Se connecter avec email et mot de passe",
    loginPending: "Connexion...",
    loginGenericError: "Connexion impossible. Reessayez.",
    registerSubmit: "Creer un compte",
    registerPending: "Creation du compte...",
    registerGenericError: "Inscription impossible. Reessayez.",
    registerSuccess:
      "Inscription terminee. Verifiez votre email et cliquez sur le lien de confirmation pour entrer dans le tableau de bord.",
    registerSuccessTitle: "Email de confirmation envoye",
    registerSteps: [
      "Ouvrez votre boite mail.",
      "Cherchez l'email de confirmation.",
      "Cliquez sur le lien et vous serez redirige vers le tableau de bord.",
    ],
    recoverySubmit: "Envoyer le lien de recuperation",
    recoveryPending: "Envoi du lien...",
    recoveryGenericError:
      "L'envoi du lien de recuperation a echoue. Reessayez.",
    recoverySuccess:
      "Nous vous avons envoye un email avec le lien de reinitialisation du mot de passe.",
    recoverySuccessTitle: "Lien de recuperation envoye",
    recoverySteps: [
      "Ouvrez votre boite mail.",
      "Cherchez le message contenant le lien de recuperation du mot de passe.",
      "Ouvrez le lien et definissez votre nouveau mot de passe.",
    ],
    signOut: "Se deconnecter",
    signOutPending: "Deconnexion...",
  },
  loginPage: {
    ...enMessages.loginPage,
    eyebrow: "Acces tournois",
    title: "Accedez a votre espace tournois",
    description:
      "Connectez-vous avec votre email et votre mot de passe pour voir les tournois, suivre le bracket et consulter vos prochains matchs.",
    cards: [
      {
        title: "Verification email",
        text: "L'acces est active apres confirmation de l'adresse email.",
      },
      {
        title: "Tableau de bord joueur",
        text: "Votre prochain adversaire, l'etat du match et le bracket mis a jour.",
      },
      {
        title: "Espace organisation",
        text: "Gerez les tournois, les inscriptions et les resultats depuis un seul endroit.",
      },
    ],
    formTitle: "Entrer dans le portail",
    formDescription:
      "Saisissez vos identifiants. Si vous n'avez pas encore de profil, creez-en un en quelques instants.",
    forgotPassword: "Mot de passe oublie ?",
    forgotDescription:
      "Saisissez votre email et nous vous enverrons un lien pour reinitialiser votre mot de passe.",
    registerPrompt: "Besoin d'un compte ?",
    registerCta: "Aller a l'inscription",
    callbackHelp:
      "Si vous venez de confirmer votre email et que l'acces ne fonctionne pas encore, essayez d'ouvrir de nouveau le lien recu.",
  },
  registerPage: {
    ...enMessages.registerPage,
    eyebrow: "Inscription utilisateur",
    title: "Creez votre compte communaute",
    description:
      "Creez votre compte pour rejoindre les tournois, suivre vos matchs et garder votre profil joueur a jour.",
    bullets: [
      "Connexion rapide avec email et mot de passe",
      "Profil joueur avec nom Steam et nom Discord",
      "Confirmation email avant le premier acces",
    ],
    formTitle: "Creer un compte",
    formDescription:
      "Utilisez des informations claires et reconnaissables pour etre retrouve plus facilement dans les tournois et les validations de matchs.",
    loginPrompt: "Vous avez deja un compte ?",
    loginCta: "Aller a la connexion",
  },
  tournamentsPage: {
    ...enMessages.tournamentsPage,
    eyebrow: "Tournois de la communaute",
    title: "Tournois ouverts de la communaute",
    description:
      "Decouvrez les tournois disponibles, consultez le format et les regles, puis rejoignez-les lorsque les inscriptions sont ouvertes.",
    serviceUnavailable: "Les tournois sont temporairement indisponibles",
    serviceDescription:
      "Nous ne pouvons pas charger la liste des tournois pour le moment. Reessayez dans un instant.",
    openTournament: "Ouvrir le tournoi",
    alreadyJoined: "Deja inscrit",
    pendingApproval: "Demande en attente d'approbation",
    joinPending: "Inscription en cours...",
    noDescription: "Aucune description pour le moment.",
    participants: "Participants",
    rules: "Regles",
    emptyTitle: "Aucun tournoi disponible",
    emptyDescription:
      "Lorsque de nouveaux evenements seront disponibles, vous les trouverez ici avec toutes les informations pour participer.",
    joinLabels: {
      approval: "Envoyer une demande",
      hybrid: "Rejoindre / demander une place",
      default: "S'inscrire",
    },
    formatLabels: {
      single_elimination: "Elimination simple",
      double_elimination: "Double elimination",
      round_robin: "Round robin",
      championship: "Championnat",
      swiss: "Suisse",
      groups_playoff: "Groupes + playoffs",
      international_style: "Style international",
      league_season: "Saison de ligue",
      ladder: "Ladder",
      king_of_the_hill: "King of the hill",
      gsl_group: "Groupe GSL",
    },
    tournamentStatuses: {
      draft: "Brouillon",
      registration_open: "Inscriptions ouvertes",
      check_in: "Check-in",
      seeding: "Seeding",
      live: "En direct",
      paused: "En pause",
      completed: "Termine",
      cancelled: "Annule",
    },
    matchStatuses: {
      pending: "En attente",
      ready: "Pret",
      awaiting_confirmation: "En attente de confirmation",
      disputed: "Conteste",
      admin_review: "Revision admin",
      completed: "Termine",
      forfeited: "Forfait",
      cancelled: "Annule",
    },
  },
};
