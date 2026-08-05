# Changelog

## [v18] - 2026-08-04

### Features

- **Ball sizes.** Marble (r 0.28), Standard (0.42), Boulder (0.62) — a separate
  axis from skins, so any skin rolls at any size. Marble steers faster but has
  a shorter coin reach; Boulder smashes rolling boulders and rock piles (+8
  coins) but is slow to steer and drops through a lone single-lane ledge.
- **Two size-gated obstacles**, added because a size advantage needs something
  to be an advantage *over*:
  - **Low bars** — a red/white gate whose underside sits at 0.60 m. Only the
    Marble (top of ball 0.56 m) clears it; Standard (0.84) and Boulder (1.24)
    must change lane.
  - **Rock piles** — the Boulder ploughs straight through for +8 coins;
    everything else has to dodge.
- **Nine power balls**, at the roadmap's prices: ⏰ Timewarp 600 (rewinds 3 s
  once per run), 🧲 Magnet 450, 👻 Ghost 500 (phases 5 s after a hit),
  💎 Diamond 550 (indestructible for 200 m), ⚡ Storm 700, 🌀 Portal 650
  (teleports past holes and gaps), 🪙 Midas 800 (triple coins, no shields),
  🌈 Prism 900 (world mechanics off), 🕳️ Void 1200 (the track never opens).
- **Mystery crate**, 150 coins — always a cosmetic skin you don't own.

### Design Rationale

- **The crate is deliberately not a loot box.** No duplicates, and power balls
  are excluded from the pool: a 150-coin crate must never be a cheaper route to
  a 1,200-coin ball. That keeps it a discount rather than paid randomised
  reward, which is what the roadmap's own note asks for.
- **Storm gives 1.5× coins, not 1.5× distance.** Distance *is* the leaderboard
  score here, so multiplying it would corrupt the rankings. The speed increase
  raises distance honestly on its own.
- Gem heights and the Timewarp rewind both work off real trajectory/state
  rather than fixed values — `ensureTrack` now keeps 18 segments behind while
  the Timewarp ball is equipped so the rewind lands on the original track.
- `demoSteer` treats bars and rock piles as lane hazards, so `?demo` attract
  mode and trailer capture don't walk straight into the new obstacles.

### Notes & Caveats

- `save.size` / `save.sizesOwned` are merged in `cloud.js` like every other
  field — a sync can't demote them.
- Ball geometry is still built once at the Standard radius; other sizes scale
  the mesh, so there is no per-size geometry cost.

## [v15.1] - 2026-08-04

### Features

- **Coin tiers.** Payout now follows the risk of the spot:
  bronze (1) on safe coin lines, **silver (3)** in a lane that survives but
  borders a hole so you have to thread it, and **gems (6)** that are airborne —
  only reachable mid-jump over a gap or at the apex of a loop.
- Gem heights are parked onto the ball's **actual trajectory** at the moment of
  launch (or loop entry), so a gem rewards committing to the jump rather than
  guessing whether a hard-coded height matches your current speed.
- The Coin Magnet deliberately ignores airborne gems; hoovering them off the
  ground would erase the risk they are paid for.
- Coin income buffed ~5x overall (denser lines, +1 per 60 m instead of per
  100 m, plus the new tiers), and the upgrade tree cut from 22,000 to **8,000**.

### Design Rationale

- The original 22,000 came straight from the roadmap and was never checked
  against real earnings. Measured over autopilot runs it was **10 coins/run,
  i.e. ~2,200 runs to max** — a wall, not a sink, and unreachable on YouTube
  where coin packs are banned outright. Now ~53 coins/run and ~150 runs to max
  for a strong player; a typical run lands well short of that, so the tree is
  still a long-term goal.
- Coin pickup switched to true 3D distance. The old test required the ball to
  be near ground level, which would have made every airborne gem uncollectable.

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
