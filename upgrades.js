// Permanent upgrade tree — the infinite coin sink.
//
// Unlike BOOSTS (consumable, armed per run), upgrades are bought once and
// never expire. Levels live in save.upgrades = { id: level }. Every effect is
// read through upgradeEffects() so the game never inspects levels directly.
//
// Total cost to max every branch: 8,000 coins. (Was 22,000, which measured out
// at ~2,200 runs to max against the real earn rate — a wall, not a sink.)

// Effect tables are indexed by level, so index 0 is always the "unowned" value.
const MAGNET_RADIUS = [0, 1.2, 2.0, 2.8, 3.6, 4.5];   // metres coins are pulled from
const BOOST_BONUS = [0, 0.35, 0.7, 1.05, 1.4, 1.75];  // extra seconds of pad boost
const SHIELD_SLOTS = [0, 1, 2, 3];                    // free shields at run start
const RUN_START_M = [0, 40, 80, 120, 160, 200];       // free metres at run start
const REVIVE_BASE = [50, 40, 32, 25, 20];             // first-continue price

export const UPGRADES = [
  {
    id: 'magnet',
    icon: '🧲',
    name: 'Coin Magnet',
    costs: [60, 130, 300, 600, 910],                     // 2,000 to max
    effect: (lvl) => (lvl === 0
      ? 'Coins must be driven over'
      : `Pulls coins in from ${MAGNET_RADIUS[lvl].toFixed(1)} m away`),
  },
  {
    id: 'boostdur',
    icon: '⚡',
    name: 'Boost Duration',
    costs: [50, 110, 240, 480, 720],                     // 1,600 to max
    effect: (lvl) => `Boost pads last ${(1.3 + BOOST_BONUS[lvl]).toFixed(2)}s`,
  },
  {
    id: 'shieldslot',
    icon: '🛡️',
    name: 'Shield Slots',
    costs: [180, 500, 1120],                     // 1,800 to max
    effect: (lvl) => (lvl === 0
      ? 'No free shields — buy them as boosts'
      : `Start every run with ${lvl} free shield${lvl > 1 ? 's' : ''}`),
  },
  {
    id: 'runstart',
    icon: '🚀',
    name: 'Running Start',
    costs: [40, 90, 200, 400, 570],                     // 1,300 to max
    effect: (lvl) => (lvl === 0
      ? 'Runs begin at 0 m'
      : `Every run begins ${RUN_START_M[lvl]} m in`),
  },
  {
    id: 'revive',
    icon: '💗',
    name: 'Revive Discount',
    costs: [70, 180, 400, 650],                     // 1,300 to max
    effect: (lvl) => `First continue costs ${REVIVE_BASE[lvl]} coins`,
  },
];

export function maxLevel(def) { return def.costs.length; }

export function levelOf(save, id) {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return 0;
  // Clamp: a save edited by hand (or written by a newer build) must never
  // index past the effect tables.
  return Math.max(0, Math.min(maxLevel(def), Math.floor(save?.upgrades?.[id] || 0)));
}

// Cost of the NEXT level, or null when the branch is maxed.
export function nextCost(save, id) {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return null;
  const lvl = levelOf(save, id);
  return lvl >= maxLevel(def) ? null : def.costs[lvl];
}

// Every gameplay number the upgrades affect, resolved in one place.
export function upgradeEffects(save) {
  return {
    magnetRadius: MAGNET_RADIUS[levelOf(save, 'magnet')],
    boostBonus: BOOST_BONUS[levelOf(save, 'boostdur')],
    shieldSlots: SHIELD_SLOTS[levelOf(save, 'shieldslot')],
    runStartM: RUN_START_M[levelOf(save, 'runstart')],
    reviveBase: REVIVE_BASE[levelOf(save, 'revive')],
  };
}
