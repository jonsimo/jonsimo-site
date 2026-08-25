# jonsimo.com — session handover

## What this is
Personal landing page for **jonsimo.com** — Jon Simo (filmmaker + game/tool dev).
Static site, no build step, no framework. Deployed by **GitHub Pages** from `main`
of repo **jonsimo/jonsimo-site** (local: `/Users/jonsimo/Movies/CODING/jonsimo-site`).
Aesthetic: black CRT terminal, phosphor cyan, pixel/VT220 type — matches his three
project sites (vectordrift.io, alpha.vectordrift.io, codexjr.com).

## DNS / deploy (important)
- Domain registered at GoDaddy but **DNS is on Cloudflare** (`kiki/wells.ns.cloudflare.com`).
- Apex A → GitHub Pages IPs, `www` CNAME → jonsimo.github.io, records **unproxied (grey cloud)**.
  Proxying breaks the Pages cert. Cert already issued; HTTPS live.
- Push to `main` = deploy. Commits authored `jonsimo <jonsimo@rogers.com>`, co-author
  `Claude Opus 4.8 <noreply@anthropic.com>`.

## Files
- `index.html` — one page. Hero (`.stage`, 100svh) + showcase (`#work`, `.showcase`).
- `styles.css` — all styling. Brand lanes via `[data-brand="cj|vd|at"]` and `[data-net]`
  custom props (`--c`, `--c-rgb`, `--mark-h`, `--type-h`).
- `main.js` — one IIFE. Progressive enhancement; page works without it. Contains: typed
  tagline, tilt, VD shooter sim, AT console appender, showcase facades, screensaver.
- `assets/` — brand marks (webp, luminance-keyed), `sim-player/sim-grunt.png` (VD sprites),
  `work-japan/car/bugs.webp` (video posters), `ig/1..9.webp` (IG grid), fonts
  (`pressstart2p-subset.woff2`, `glasstty.woff2`), icons, og-image.
- `favicon.svg` = pixel "JS" in corner brackets; `icon-64/180/512.png` match it (linked `?v=3`).

## Layout model (READ before touching layout)
- **Hero**: `.stage` flex column, `justify-content:flex-start` (top-anchored), 100svh.
  Order: header (JON SIMO in Glass TTY) → `.channels` (3 project boxes) → `.seework`
  ("SEE MY WORK ▼", Glass TTY, smooth-scrolls to #work) → `.foot` (socials + colophon).
- **Project boxes** (`.tile[data-brand]`): brand-tinted uniform box. **COLLAPSED by default**
  (wordmark only) under `@media (hover:hover) and (pointer:fine)`; **expand on hover/focus**
  — icon slides in, caption drops, box grows. Sizes driven by CSS vars `--type-h-shown`
  / `--mark-h-shown` (collapsed caps → full on hover). Touch devices stay full/open.
- `.lock` is `display:flex` row (icon + wordmark side by side). **If icon stacks ON TOP
  of wordmark, `.lock` lost display:flex — check for a CSS syntax error / brace imbalance
  above it.** (That exact bug happened: an orphaned `to{top:108%}}` broke the parse.)
- **Showcase** `z-index:70` so it sits ABOVE the fixed CRT overlays (`.crt-*` are
  `position:fixed z-index:60` over the whole viewport — they'll dim scrolled content otherwise).

## Per-brand effects (on hover)
- **VD (Vector Drift)**: canvas `.sim` = ambient vector shooter (real game sprites
  `sim-player`/`sim-grunt`, cyan). Starfield + descending grunts + player firing up.
- **CJ (Codex Jr)**: wizard sprite stepped bob + gold rim; wordmark saturates.
- **AT (Alpha Tracker)**: `.console` = dim dev boot-log; JS **writes lines in at the
  bottom, stack steps up** (not smooth scroll). Runs only while tile open. Sits behind
  the gamepad+wordmark (`[data-brand="at"] .lock/.meta` are z-index:1 above `.fx`).

## Scan sweeps (JON SIMO name hover)
- Name hover → phosphor green + a **color-dodge** scan line (NOT screen; screen showed a
  grey bar over black). color-dodge = invisible over near-black, flashes the neon letters.
  Slow/thick/soft. Same technique was used on AT before it became the console.

## Showcase / RECENT WORK
- Top: 3 **click-to-play facades** (`.facade`): local poster + neon play button, no YT
  chrome. YT plays inline (autoplay iframe, youtube-nocookie). CSP `frame-src` allows
  youtube-nocookie + vimeo. Cards: Japan in 360, Dancing Bugs (Instagram — opens the reel,
  bug poster + IG badge), Cinematic Car Spot.
- Below: **FROM INSTAGRAM** — 3×3 grid `.ig-feed` (full width, matches video row), 9
  **curated** reel stills (`assets/ig/1..9.webp`, from his Dropbox SOCIAL CONTENT/REELS),
  all link to instagram.com/jonsimo. + "SEE MORE ON INSTAGRAM →". NOT a live feed —
  IG has no free public API. User chose curated (not LightWidget auto).

## Easter eggs
- Idle 12s → DVD-style screensaver bouncing a hand-built **SIMO** mark (not JS); corner
  hits are deliberately aimed with a sampled miss (~1 perfect/5min).
- Click the blinking cursor → CRT power-cycle (degauss).
- (Vectorscope green mode was REMOVED per user.)

## SEO
Title "Jon Simo — Indie Games & Developer Tools", full meta description, keywords,
OG/Twitter cards, JSON-LD (Person + ItemList of 3 projects). Sitemap + robots present.
**Recrawl** needs the user to do Google Search Console (add property + Request Indexing);
I can add a DNS TXT verify record to Cloudflare if he pastes the token.

## How I work / verify (do this)
- Serve locally: `python3 -m http.server 8777` in the repo; open with `open -a Safari`.
- Screenshot via headless Chrome:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu
   --hide-scrollbars --force-device-scale-factor=1 --window-size=1280,820 --virtual-time-budget=2000
   --screenshot=out.png http://127.0.0.1:8777/` then Read the png. Use `magick` to crop.
- To see the showcase (below 100svh hero) in one shot: copy repo to a scratch dir, append
  `.stage{min-height:auto!important} .showcase{min-height:auto!important}` to styles.css.
- To see collapsed boxes expanded: force `[data-brand="X"] .mark{width:var(--icon-w)!important;
  opacity:1!important}` + `--type-h-shown/--mark-h-shown` + `.meta{max-height:5em!important}`
  and dispatch `pointerenter`.
- Headless doesn't advance rAF/transition loops or lazy-load below-fold reliably — trust
  the code for motion; verify static frames. Scratchpad for temp files.
- **CSP is strict**: `default-src 'self'`, `connect-src 'none'`, no inline styles/scripts
  (no `style=""` attrs, no inline event handlers). frame-src = youtube-nocookie + vimeo.
- Editing pattern: I edit via python `str.replace` with asserts. Watch brace balance in
  styles.css (`c.count('{')==c.count('}')`).

## Style/comms preferences
Caveman-lite mode (terse). User is picky about polish; iterate with screenshots, don't
claim done without looking. He's given lots of micro-feedback on the AT effect, scan
blend modes, sizing, spacing — read the effect intent, verify visually.

## Open / possible next
- IG feed is curated stills (not live) — offer LightWidget if he wants auto-latest.
- IG "Dancing Bugs" card links out (no clean dark IG embed).
- He may keep refining effects/spacing — always screenshot to confirm.
