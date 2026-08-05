// Ball sizes (v18) — one physical property, three real strategies.
//
// Size is a separate axis from skin: any skin can be rolled at any size, so
// sizes multiply the collection instead of adding to it. Every size effect is
// read through sizeEffects() so game.js never inspects ids directly.

export const SIZES = [
  {
    id: 'marble',
    icon: '⚪',
    name: 'Marble',
    radius: 0.28,
    steer: 1.18,        // small and nimble
    pickup: 0.72,       // ...but a shorter reach for coins
    price: 700,
    perk: 'Rolls clean under low bars that stop everything else',
    cost: 'Smaller coin pickup radius',
  },
  {
    id: 'standard',
    icon: '⚫',
    name: 'Standard',
    radius: 0.42,
    steer: 1,
    pickup: 1,
    price: 0,
    perk: 'The balanced default',
    cost: '—',
  },
  {
    id: 'boulder',
    icon: '🟤',
    name: 'Boulder',
    radius: 0.62,
    steer: 0.78,        // heavy, slow to change lanes
    pickup: 1.3,        // but sweeps up coins from further out
    price: 700,
    perk: 'Smashes rolling boulders and rock piles outright (+8 coins each)',
    cost: 'Too wide for a single-lane ledge — it will drop through',
  },
];

export const DEFAULT_SIZE = 'standard';

export function sizeDef(id) {
  return SIZES.find((s) => s.id === id) || SIZES.find((s) => s.id === DEFAULT_SIZE);
}

export function sizeEffects(save) {
  const def = sizeDef(save?.size || DEFAULT_SIZE);
  return {
    id: def.id,
    radius: def.radius,
    steer: def.steer,
    pickup: def.pickup,
    // Only the Boulder smashes things, and only the Boulder is too wide for a
    // lone ledge. Naming them here keeps the rules out of the physics code.
    smashes: def.id === 'boulder',
    tooWideForSingleLane: def.id === 'boulder',
    fitsUnderBars: def.id === 'marble',
  };
}
