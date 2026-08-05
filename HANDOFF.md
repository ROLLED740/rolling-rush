# Rolling Rush — Handoff

Paste this at the start of a new chat to bring Claude fully up to speed.

---

## What this is

**Rolling Rush** — a 3D rolling-ball endless runner (Going Balls-style), built as a
self-contained HTML5 game. Live, playable, monetized-ready.

- **Live site:** https://rollingrush.app (GitHub Pages, HTTPS working)
- **itch.io:** https://rolled740.itch.io/rolling-rush
- **Repo:** https://github.com/ROLLED740/rolling-rush (public, `main` branch, serves from `/` root)
- **Roadmap artifact:** https://claude.ai/code/artifact/71ea21a2-392d-4200-9cf7-a37f20a47fe0
- **Playable demo artifact:** https://claude.ai/code/artifact/10f2145a-fd8b-49f1-ae50-9dc82da18c5a

## Current version: v18

### Gameplay
- Drag to steer; drag up = accelerate, down = brake (arrows/WASD on keyboard)
- Holes, full-width gaps, ramps (jump), loop-the-loops, green boost pads,
  rolling boulders (colored, varied sizes)
- 8 worlds cycling every 400 m: Jungle, Mountains, Snow, Ice, Waterworld,
  Junkyard, Pyramids, World Landmarks
- Snow & Ice are **slippery** (steering lags; Ice slides more than Snow)
- Wood-plank track with hazard-striped rails; speed trail when boosting

### Balls — 42 total (33 skins + 9 power balls)
- 5 gradients (Sunset free, Ocean, Candy, Lime, Galaxy)
- Sports: soccer, basketball, tennis, bowling
- Billiards: cue + balls 1–15
- Characters (original, copyright-safe): Smiley, Robo, Ninja, Alien, Pirate, Skull
- **Perk balls:** 🔥 Flame (torches boulders +5 coins each, +1 per coin) ·
  😇 Angel (3D flapping wings, glides over holes)
- All textures drawn procedurally on canvas at runtime — zero image assets

### Economy
- Coins from pickups + 1 per 60 m survived
- **Coin tiers:** bronze 1 (safe lines) - silver 3 (lane bordering a hole) -
  gem 6 (airborne: mid-jump over a gap, or a loop's apex). Gem heights are
  parked onto the ball's real trajectory at launch/loop-entry. The Coin Magnet
  ignores airborne gems on purpose.
- Shop: skins 30–400 coins; boosts Head Start 15, Shield 25, Coin Doubler 20, Slow-Mo 18
- Boosts armed via ON/OFF chips on **start screen and game-over screen**
- **Continue the run (v15):** dying offers a revive that keeps your distance,
  level and run coins. 50 banked coins, **doubling each continue in the same
  run** (cap 5). 10-second countdown ring auto-declines.
- **Permanent upgrades (v15):** 5 branches, bought once, never expire —
  **8,000 coins to max** (~150 runs for a strong player). Coin Magnet, Boost Duration, Shield Slots,
  Running Start, Revive Discount. Levels sync across devices.
- Coin packs wired to Stripe but **not yet enabled** (no payment links configured)

### Other
- Pause button in HUD → pause screen → shop
- itch.io tip button (gold) on start + game-over screens
- Admin mode: `?admin=rolled740` — unlocks everything, 999999 coins, all upgrades
  maxed, world-jump 1–8
- Dev params: `?demo` (autopilot), `?start=N`, `?levellen=N`, `?loops`, `?coins=N`, `?debug`

## Architecture

| File | Purpose |
|---|---|
| `index.html` | Page shell, HUD, all screens (start/over/pause/revive/shop/account/leaderboard) |
| `game.js` | Track generation, physics, levels, boulders, wings, audio, revive flow, admin |
| `balls.js` | All 42 procedural balls (33 skins + 9 power balls) + thumbnails |
| `sizes.js` | Marble / Standard / Boulder radii and their trade-offs |
| `themes.js` | The 8 world themes + scenery builders (`slippery` property on Snow/Ice) |
| `shop.js` | Shop UI, boost arming, upgrade cards, coin packs |
| `upgrades.js` | Permanent upgrade tree: definitions, costs, and `upgradeEffects()` |
| `cloud.js` | Supabase auth, cloud saves, leaderboard |
| `payments.js` | Stripe Payment Link handoff (stub until links configured) |
| `config.js` | Supabase URL + anon key, Stripe links |
| `ytgame-shim.js` | YouTube Playables SDK wrapper w/ localStorage fallback |
| `vendor/` | three.module.min.js, supabase.module.js (vendored, no CDN) |
| `dist/` | Single-file builds: `index.html` (standalone), `artifact.html`, itch zip |
| `supabase/` | `schema.sql` + `functions/stripe-webhook/` |

**Build:**
```bash
npx esbuild game.js --bundle --minify --format=iife \
  --alias:three=./vendor/three.module.min.js \
  --alias:@supabase/supabase-js=./vendor/supabase.module.js \
  --outfile=/tmp/rr-bundle.js
node build.mjs /tmp/rr-bundle.js
cd dist && zip rolling-rush-itch.zip index.html CNAME
```

Note: `build.mjs` must use **replacer functions** in `String.replace` — the minified
bundle contains `$&` sequences that would otherwise corrupt the output.

## Backend

- **Supabase** project `dnugwyvptzjkzblaffrw` — schema applied (profiles, coin_credits,
  `claim_coin_credits()`, `get_leaderboard()`), email auth on, RLS enforced
- Accounts, cross-device cloud saves, and global leaderboard are **live**
- `mergeSaves()` in `cloud.js` is a **field whitelist** — any new save field must
  be added there or it is silently dropped on sync. (`upgrades` is handled.)
- Cloud features auto-disable when `window.__RR_NO_CLOUD` is set (artifact builds,
  since that sandbox blocks external network calls)

## Not done yet

- **Stripe coin packs** — the plan of record (the itch.io tip button is itch's
  own PayPal flow and needs nothing from this codebase). Needs 3 Payment Links (with `coins` metadata) in `config.js`
  and the `stripe-webhook` edge function deployed. Full walkthrough in `SETUP-CLOUD.md`.
- **YouTube Playables** — interest form submitted, awaiting approval (months-long).
  Playables **bans third-party payments**; coin packs already auto-hide there.
- **www.rollingrush.app** — apex works; www CNAME may need re-adding in Namecheap
  (`www` → `rolled740.github.io`). Keep all Namecheap **HTTPS toggles OFF** — that
  SSL-proxy feature previously deleted DNS records and broke the site.

## Marketing assets (already produced)

Real MP4s (H.264): landscape trailer + 3 vertical Shorts (flame-boulders,
angel-wings, robot-snow), a phone-playable montage GIF, itch cover 630×500, and
screenshots. Written copy exists for: itch description + tags + metadata, YouTube
channel About, video titles/descriptions, TikTok/Reels captions, hashtag sets.

## Working agreements learned the hard way

- Claude **cannot push** to `rolling-rush` (session repo scope) — it can *read* the
  repo via the git proxy, so it can diff and verify, but delivery is by file/zip that
  the user uploads.
- **Never send two files with the same name** — a game `index.html` and a redirect
  `index.html` got swapped and broke the site. Name files by destination.
- Uploading a file that already exists in Downloads makes the browser save it as
  `index (1).html` → GitHub gets a duplicate, not a replacement. **Edit files in the
  GitHub web editor instead of uploading.**
- Verify visually before shipping — an angel-wing rotation sign error made the wings
  look like pincers and it shipped into a video.
- **The Playables SDK is booby-trapped off-platform** (all three fixed in v15,
  don't reintroduce any of them):
  - `window.ytgame` existing does **not** mean you are on YouTube — the script
    self-installs on any origin it loads from.
  - `ytgame.IN_PLAYABLES_ENV` is **not** a YouTube check either; it is true in
    *any* iframe, including itch.io's.
  - Inside any iframe the SDK **nulls `window.localStorage`/`sessionStorage`**.
    `index.html` captures a live `Storage` reference before the SDK tag for this
    reason — keep that inline script first.
  The only trustworthy signal is a `youtube.com` entry in
  `location.ancestorOrigins` (referrer fallback for Firefox).
- **The `dist` build changes script ordering.** `build.mjs` inlines the bundle as
  a classic script, so it runs *before* the deferred SDK — the opposite of the
  source build, where `game.js` is a deferred module. Anything that depends on
  the SDK must `await sdkReady()` first.

## Next up (see roadmap artifact for detail)

v15 is done. Remaining roadmap:
Timewarp world-select (v16) → 4 new worlds (v17) → ball sizes + power balls +
mystery crate (v18) → remaining worlds + streaks (v19).
