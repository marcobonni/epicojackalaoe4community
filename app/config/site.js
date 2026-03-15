export const TARGET_VOICE_CHANNEL_ID = 'VOCALE_ZOZZA_CHANNEL_ID';

export const TWITCH_PARENT_DOMAINS = [
  'aoe4community.vercel.app',
  'localhost',
  '127.0.0.1'
];

export const TWITCH_STREAMER_PRIORITY = [
  'ScapoloCaldo667',
  'Taffuz_Gg',
  'IKasiya',
  'RaionOn',
  'FRADIBIS',
  'EpicoJackal'
];

export const TWITCH_STREAMERS = TWITCH_STREAMER_PRIORITY.map((name) => ({
  name
}));

export const SERVER_CONFIG = {
  name: "EpicoJackal's Aoe4 Community",
  inviteUrl: 'https://discord.gg/pjAakCz9',
  widgetServerId: '470883209614458881',
};

export const FEATURES = [
  {
    title: 'Partite e matchmaking',
    desc: 'Trova giocatori per ranked, custom, team game e serate casual nella community.',
  },
  {
    title: 'Tornei ed eventi',
    desc: 'Organizza o segui tornei, challenge e community night dedicate ad Age of Empires.',
  },
  {
    title: 'Guide e strategia',
    desc: 'Condividi build order, consigli, replay e discussioni sulle civiltà con altri appassionati.',
  },
  {
    title: 'Community italiana',
    desc: 'Un punto di ritrovo per chi vuole giocare, chiacchierare e crescere insieme nella scena italiana.',
  },
];

export const HERO_STATS = [
  { value: '24/7', label: 'Community attiva' },
  { value: 'AoE', label: 'Focus totale' },
  { value: 'Eventi', label: 'Ogni settimana' },
];

export const UPCOMING_EVENTS = [
  {
    day: '12 MAR',
    title: 'Team Game Night 4v4',
    time: '21:30',
    type: 'Community Night',
    desc: 'Serata aperta a tutti con lobby bilanciate e voice channels dedicati.',
  },
  {
    day: '15 MAR',
    title: 'Torneo Weekend Bo3',
    time: '18:00',
    type: 'Torneo',
    desc: 'Mini torneo con bracket rapido per i membri della community.',
  },
  {
    day: '18 MAR',
    title: 'Coaching & Replay Review',
    time: '20:45',
    type: 'Strategia',
    desc: 'Analisi replay, build order e consigli pratici sulle civiltà.',
  },
];
export const COACHES = [
  {
    name: "EpicoJackal",
    badge: "AoE4 Coach",
    role: "Coaching 1v1 e teamgame",
    description:
      "Sessioni dedicate a macro, build order, scouting e decision making.",
    specialty:
      "Ottimizzazione build, review replay, mindset competitivo",
    price: null,
    availability: "Sera e weekend",
    contactUrl: "https://discord.com/users/240210612582481922",
    profileUrl: "https://www.twitch.tv/epicojackal",
  },

  {
    name: "Taffuz",
    badge: "Top Ladder",
    role: "Coaching competitivo AoE4",
    description:
      "Allenamenti focalizzati su macro avanzata, timing push e gestione delle civiltà meta.",
    specialty:
      "Strategie meta, timing attack, decision making mid game",
    price: null,
    availability: "Weekend",
    contactUrl: "https://discord.com/users/702542802432688270",
    profileUrl: "https://www.twitch.tv/taffuz_gg",
  },

  {
    name: "Kasiya",
    badge: "Strategy Coach",
    role: "Analisi replay e miglioramento decision making",
    description:
      "Sessioni di analisi replay per migliorare macro, scouting e adattamento strategico.",
    specialty:
      "Replay analysis, macro management, map control",
    price: null,
    availability: "Sera",
    contactUrl: "https://discord.com/users/725895228531146794",
    profileUrl: "https://www.twitch.tv/IKasiya",
  },
];