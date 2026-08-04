# Changelog

## [v15] - 2026-08-03

### Features

- **Continue the run.** Falling now offers a revive instead of ending the run
  outright. The offer keeps your distance, level and collected coins, costs 50
  banked coins the first time, and **doubles with every continue in the same
  run** (50 → 100 → 200 → 400 → 800, capped at 5). A 10-second countdown ring
  auto-declines, so the run never sits open forever. Space/Enter accepts,
  Escape declines.
- **Permanent upgrade tree.** Five branches in the shop, bought once and never
  expiring — **22,000 coins to max everything**, the infinite coin sink:

  | Upgrade | Levels | Cost to max | Effect at max |
  |---|---|---|---|
  | 🧲 Coin Magnet | 5 | 5,500 | Pulls coins in from 4.5 m |
  | ⚡ Boost Duration | 5 | 4,500 | Boost pads last 3.05 s (from 1.30 s) |
  | 🛡️ Shield Slots | 3 | 5,000 | Start every run with 3 free shields |
  | 🚀 Running Start | 5 | 3,500 | Every run begins 200 m in |
  | 💗 Revive Discount | 4 | 3,500 | First continue costs 20 instead of 50 |

- Upgrade levels sync across devices (merged by highest level, so a sync can
  never demote a branch you already bought).
- Admin mode (`?admin=rolled740`) now also maxes every upgrade branch.

### Fixes

- **Saves were being silently discarded everywhere except YouTube.** Three
  compounding faults in the Playables SDK integration:
  1. The SDK script **self-installs `window.ytgame` on any origin** it loads
     from, and the shim treated "the object exists" as "we are on YouTube".
     Off-platform `game.saveData()` resolves without storing anything and
     `loadData()` returns `''`, so the shim's `try/catch` never fired.
  2. **`ytgame.IN_PLAYABLES_ENV` is not a YouTube check** — it is true inside
     *any* iframe. itch.io frames the game, so it read as `true` there.
  3. Inside any iframe the SDK **nulls `window.localStorage` and
     `window.sessionStorage`**, so there was no fallback left either.

  Net effect: coins, skins and best distance were lost on every reload of
  rollingrush.app *and* itch.io. Fixed by verifying a real `youtube.com`
  ancestor via `location.ancestorOrigins` (referrer fallback for Firefox), and
  by capturing a live `Storage` reference in `index.html` **before** the SDK
  loads — nulling the window property does not invalidate a held reference.
- Same root cause hid the **Coin Packs** section everywhere, not just on
  YouTube. It is visible again off-platform.
- **Coin packs were visible on YouTube in the `dist` build**, which violates the
  Playables ban on third-party payments. `build.mjs` inlines the bundle as a
  *classic* script, so it ran before the deferred SDK and the environment check
  came back false. Boot now awaits `sdkReady()` before reading the save or
  deciding the environment. Same race also meant the YouTube build loaded its
  save from the wrong store.
- Respawning (shield **or** continue) now clears boulders within 18 m of the
  landing point. Being dropped straight onto a boulder was an unavoidable
  second death.
- A respawn now cancels an in-progress loop-the-loop instead of letting the
  scripted loop physics fight the new position.

### Design Rationale

- **Why doubling revive pricing:** it keeps the first continue an easy yes
  (50 coins ≈ one good run's pickups) while making a deep run's fourth
  continue a real decision. It also self-limits without needing a hard cap —
  the `MAX_REVIVES = 5` constant is a backstop, not the balancing mechanism.
- **Why coins are not banked until the run truly ends:** `endRun()` is the
  only place that credits the run's coins, so a continue simply doesn't reach
  it. This means a continue is paid from the *bank* while the run's winnings
  stay at risk — the tension the mechanic depends on.
- **Why a separate `upgrades.js`:** every gameplay number the tree affects is
  resolved through one `upgradeEffects(save)` call, so `game.js` never reads
  upgrade levels directly and the effect tables stay in one auditable place.
- **Why the magnet moves coins instead of widening the pickup test:** the pull
  is visible, which is most of the perceived value of the upgrade.

### Notes & Caveats

- Effect tables are indexed by level and `levelOf()` clamps to the table
  length, so a hand-edited or newer-build save can never index past the end.
- The coin-pickup scan widens with magnet radius (`magnetSpan`), because at
  Lv 5 the radius (4.5 m) exceeds one segment (4 m).
- Post-respawn invulnerability (1.4 s) applies to **boulders only** — falling
  is still fatal, so grace can't be used to float over a gap.
- Existing saves need no migration: `save.upgrades` defaults to `{}` and every
  branch reads as level 0.
