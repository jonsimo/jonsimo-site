# jonsimo-site

Landing page for **jonsimo.com** — the root console the three project sites boot from.

Static, zero dependencies, zero build step. Deployed by GitHub Pages from `main`.

## Design

Shared DNA lifted from the three live sites: black ground, phosphor glow, pixel/mono
type, CRT chrome (grid + scanlines + vignette + flicker).

Each channel keeps its **own** brand colour so the page reads as a colour-coded
switchboard rather than one flat list:

| Channel | `--c` | `--c2` | Source |
| --- | --- | --- | --- |
| Codex Jr | `#1986ff` | `#f7d507` | codexjr.com |
| Vector Drift | `#4ef1cc` | `#7ef7e0` | vectordrift.io |
| Alpha Tracker | `#11cab8` | `#f7a08a` | alpha.vectordrift.io |

### Marks

The projects' **real** logos, cut from source art:

| Mark | Source |
| --- | --- |
| `vd-wordmark` | the in-game main-menu framegrab |
| `vd-icon` | `vector_drift_icon.png` |
| `at-icon` | `alpha_tracker_controller_icon_web.png` — ships pre-keyed, so it only needs an alpha lift |
| `at-wordmark` | `vector_drift_installer_win_bg.png` — the filename lies, it is the Alpha Tracker lockup |
| `cj-wordmark` | `CODEX_TITLE_LOGO_v2.png` |
| `cj-wizard` | `wizard_base_high_res.png`, point-filtered so the pixel edges stay hard |

The neon marks were painted on black. Rather than matte them by hand or lean on
`mix-blend-mode: screen` — which lifts the crop rectangle into a visible box against a
tile that is near-black but not black — their **alpha is derived from luminance** at
build time:

```sh
magick src.png -crop WxH+X+Y +repage -level 8%,88% \
  \( +clone -colorspace Gray -level 5%,62% \) \
  -alpha off -compose CopyOpacity -composite  keyed.png
```

**Then crop to the ink, and measure the ink with a threshold.** A soft glow makes alpha
non-zero across the whole canvas, so `-format %@` reports the full canvas and reports it
confidently. Threshold the alpha first:

```sh
BB=$(magick keyed.png -alpha extract -threshold 15% -format %@ info:)
magick keyed.png -crop "$BB" +repage ...      # not -trim: it premultiplies
```

Skip this and every mark ships with asymmetric transparent padding baked in — Alpha
Tracker's wordmark carried 35px of dead space above and 2px below, Codex Jr's 25px left
and 0 right. The boxes then centre perfectly while the artwork visibly does not, which
looks like sloppy layout and is impossible to fix in CSS. Every mark here is cropped so
its ink exactly fills its canvas.

### Lockup

One centred group per channel — icon, wordmark, caption directly beneath — with the
whole group centred in its row. The lock box **hugs its content** (`height:auto`) rather
than filling a fixed band: with a fixed band, a mark that does not fill it leaves dead
air and the caption drifts away from the logo on some rows but not others.

Marks are sized from a shared `--band` token, tuned per aspect ratio rather than set to
one number — an 11:1 wordmark and a 0.74:1 sprite need very different heights to carry
the same optical weight. The per-channel heights also keep the three lockups within
~80px of each other in width, so their edges read as deliberate.

The column is 940px, not 1180px. With the content around 450px wide, the wider column
made the space read as slack rather than as composition.

### Hover

Each channel gets the effect its own product would have:

| Channel | Effect |
| --- | --- |
| Codex Jr | wizard sparks drifting up off the mark, in gold / magenta / mint |
| Vector Drift | a starfield streaking past, the way the shooter scrolls |
| Alpha Tracker | fixed scan rules plus a bar travelling down the readout |

Plus, on every tile: wordmarks strike like a neon tube — a *stepped* flicker, then
settle, because a smooth ease-in reads as a dimmer rather than as ignition — corner
brackets snap outward, border and bloom ignite, and the tile tilts toward the pointer.

The particle animations move their **inset** (`bottom`, `right`), not a percentage
`transform`: a percentage translate resolves against the element's own 3px box, so
`translateY(-108%)` moves a spark three pixels. Inset percentages resolve against the
containing block, which is the tile. Everything is `animation-play-state: paused` until
hover and removed entirely under `prefers-reduced-motion`.

**These cannot be verified from a headless screenshot.** Under
`--virtual-time-budget` no CSS animation advances — every one reads back pinned to its
0% keyframe, which looks exactly like a broken effect. Check them in a real browser;
a headless capture will only tell you whether the keyframes *parse*.

### Socials

A **fourth row**, not a footnote — same border, ground and weight as a project channel.
Each network carries its own `--c` and ignites on hover.

## Easter eggs

Every egg is either **passive** (it happens to you) or **clickable** (you find it by
poking something). Nothing is on a key combo — nobody discovers a key combo.

| Trigger | Effect |
| --- | --- |
| Idle 12s | **The screensaver** (below) |

| Click the `>` prompt glyph | CRT power-cycle — collapse to a line, degauss, snap back |
| Click the name | Phosphor-green **vectorscope mode** |

There is no blinking block cursor. It read as a text field you could type into, and the
page has nothing to type into; the bare `>` makes no such promise.

### The screensaver

A DVD bounce carrying Jon's own **SIMO VIDEO** mark (`assets/simo_video.png`). Painted through a CSS `mask` with `background: currentColor`
rather than dropped in as an `<img>`, so it still recolours on every bounce. Only the
alpha matters for a mask, so it is stored as gray+alpha (27 KB).

This replaced a hand-drawn SVG imitation, after three rounds of redrawing never got
there. The real mark's `M` drives its vertex clean through the disc to the centre hole,
and its letters are *drawn* — they are not constructible from strokes and arcs at any
weight. If the actual artwork exists, use the actual artwork.

The corner hit is the entire reason anyone watches one of these, so it is not left to
chance. On ~38% of wall bounces the logo genuinely **aims at a corner** — a straight
line to a corner is always a legal path immediately after a bounce — and misses by a
sampled margin:

| Probability | Miss | Reads as |
| --- | --- | --- |
| 5% | 0 px | a perfect corner |
| ~9% | 2–10 px | kisses it |
| ~88% | 12–67 px | a visible near miss |

That works out to roughly **one perfect corner per five minutes**, with near misses
throughout (verified by simulating 5 minutes of the physics offline).

Every heading is forced at least ~17° off both axes. Without that clamp a corner run
that starts near a wall leaves the logo with a near-zero vertical component, and it
spends the rest of the session tracking left-right along a single line — which is
exactly what happened. A corner attempt whose geometry would be that shallow is refused
outright and the bounce reflects normally instead.

Motion is delta-timed and clamped, so a backgrounded tab does not teleport the logo
across the screen on return.

## Files

```
index.html    markup
styles.css    all styling; brand lanes are custom props on [data-brand] / [data-net]
main.js       typed line, tilt, easter eggs. Page is fully usable without it.
CNAME         jonsimo.com
assets/       the five project marks (WebP, luminance-keyed), the SIMO mask,
              PressStart2P subset (1.9 KB, printable ASCII), icons, OG image
```

## Notes

- **No external requests.** No CDN, no analytics, no hosted fonts. CSP in `<head>` is
  `default-src 'self'` with `connect-src 'none'`.
- `prefers-reduced-motion` kills every animation; `prefers-contrast: more` lifts the
  dim tiers.
- The page degrades to a plain, fully-usable link list if `main.js` never runs.
- `.nojekyll` so Pages serves the tree verbatim.
- DNS for jonsimo.com is served by **Cloudflare**, not GoDaddy. Keep the GitHub
  records unproxied (grey cloud) or the Pages certificate will never issue.

## Local

```sh
python3 -m http.server 8777   # then open http://localhost:8777
```
