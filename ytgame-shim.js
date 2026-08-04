// Thin wrapper around the YouTube Playables SDK (window.ytgame).
// Inside YouTube the real SDK is used; anywhere else (local dev, itch.io,
// Poki, your own site) it falls back to localStorage so the game still works.

const STORAGE_KEY = 'rolling-rush-save';

// Storage handle. The Playables SDK nulls window.localStorage inside ANY iframe,
// so index.html captures a live reference before the SDK loads; that reference
// keeps working even once the window property is nulled. Falls back to the
// normal property when the capture is unavailable (e.g. the artifact build).
function store() {
  try {
    return (typeof window !== 'undefined' && window.__rrStore) || window.localStorage;
  } catch {
    return null;
  }
}

// Is this REALLY the YouTube Playables environment?
//
// Two traps, both of which silently destroyed saves off-platform:
//   1. The SDK script self-installs window.ytgame on any origin it loads from,
//      so "the object exists" means nothing.
//   2. ytgame.IN_PLAYABLES_ENV is true inside ANY iframe — it effectively only
//      reports "am I framed". itch.io frames the game, so it read as true there
//      while saveData() resolved without storing anything.
// The ancestor origin chain is the only trustworthy signal.
const YT_HOST = /(^|\.)youtube\.com$/;

function hasYouTubeAncestor() {
  try {
    if (window.top === window.self) return false;      // top-level: never Playables
    const anc = location.ancestorOrigins;
    if (anc && anc.length) {
      for (let i = 0; i < anc.length; i++) {
        if (YT_HOST.test(new URL(anc[i]).hostname)) return true;
      }
      return false;
    }
    // Firefox has no ancestorOrigins; the referrer is the next best signal.
    return Boolean(document.referrer) && YT_HOST.test(new URL(document.referrer).hostname);
  } catch {
    return false;
  }
}

function sdk() {
  const yt = typeof window !== 'undefined' ? window.ytgame : undefined;
  return yt && yt.IN_PLAYABLES_ENV && hasYouTubeAncestor() ? yt : undefined;
}

export const inYouTube = () => Boolean(sdk());

// Wait for the SDK to install itself before anything asks "are we on YouTube?".
//
// The SDK <script> is deferred, but the single-file dist build inlines the game
// bundle as a CLASSIC script, which runs during parsing — i.e. BEFORE the
// deferred SDK. Booting without this wait made the game read the wrong save
// store and left the coin-pack section visible on YouTube, which bans
// third-party payments. Off-YouTube it resolves immediately and costs nothing.
export function sdkReady(timeoutMs = 3000) {
  if (!hasYouTubeAncestor()) return Promise.resolve(false);
  if (window.ytgame) return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const poll = setInterval(() => {
      if (window.ytgame || Date.now() - started > timeoutMs) {
        clearInterval(poll);
        resolve(Boolean(window.ytgame));
      }
    }, 30);
  });
}

// Tell YouTube the first frame is visible (dismisses the loading screen).
export function firstFrameReady() {
  try { sdk()?.game.firstFrameReady(); } catch { /* non-fatal */ }
}

// Tell YouTube the game is interactive.
export function gameReady() {
  try { sdk()?.game.gameReady(); } catch { /* non-fatal */ }
}

// Report a score for leaderboards / recommendations.
export function sendScore(value) {
  try { sdk()?.engagement.sendScore({ value: Math.floor(value) }); } catch { /* non-fatal */ }
}

export async function loadSave() {
  const yt = sdk();
  try {
    const raw = yt ? await yt.game.loadData() : store()?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveSave(data) {
  const raw = JSON.stringify(data);
  const yt = sdk();
  try {
    if (yt) await yt.game.saveData(raw);
    else store()?.setItem(STORAGE_KEY, raw);
  } catch { /* non-fatal */ }
}

// Register pause/resume callbacks requested by the YouTube app
// (e.g. the user opens the video description over the game).
export function onSystemPause(pause, resume) {
  const yt = sdk();
  if (!yt) return;
  try {
    yt.system.onPause(pause);
    yt.system.onResume(resume);
  } catch { /* non-fatal */ }
}
