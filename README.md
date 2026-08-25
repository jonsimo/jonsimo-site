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
| `at-icon` | `alpha_tracker_icon_v2.png` |
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

The glow then fades to nothing instead of ending at an edge, and the mark sits happily
on any background. Trim the empty margin with a **measured bbox**, never `-trim`:

```sh
BB=$(magick keyed.png -format %@ info:)      # measure
magick keyed.png -crop "$BB" +repage ...     # then crop
```

`-trim` associates the alpha and premultiplies the RGB, which crushes a
luminance-keyed neon mark to black. Ask how I know.

The two neon icons carry a faint reference grid in the source. Brightness alone will
not remove it — the rules that cross the mark's bloom are as bright as the mark — so the
alpha mask is opened morphologically (`-morphology Open Disk:2.5`), which deletes
anything thinner than the structuring element while leaving the fat strokes intact.

### Lockup

A fixed-width **two-column grid**, not a centred flex row. Centring each lockup
independently would put every icon at a different x, because the wordmarks are different
widths; a shared grid puts all three icons in one column down the page, and the caption
starts where the wordmark starts.

The row is `minmax(0,1fr)`, not `auto` — an auto row sizes to its content, so
`max-height:100%` on the images would have no definite height to resolve against and
they would overflow the band. On narrow screens the grid collapses to a centred stack
and each mark is capped by `max-height` with `height:auto`; those caps must be written
per-brand, because the desktop rules they override are `[data-brand=...]` scoped and a
media query adds no specificity.

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

### Socials

A **fourth row**, not a footnote — same border, ground and weight as a project channel.
Each network carries its own `--c` and ignites on hover.

## Easter eggs

Every egg is either **passive** (it happens to you) or **clickable** (you find it by
poking something). Nothing is on a key combo — nobody discovers a key combo.

| Trigger | Effect |
| --- | --- |
| Idle 20s | **The screensaver** (below) |

| Click the `>` prompt glyph | CRT power-cycle — collapse to a line, degauss, snap back |
| Click the name | Phosphor-green **vectorscope mode** |

There is no blinking block cursor. It read as a text field you could type into, and the
page has nothing to type into; the bare `>` makes no such promise.

### The screensaver

A DVD bounce, with `SIMO` set in the DVD wordmark's own geometry. Hand-built SVG, no
`VIDEO`, no `TM`. The proportions are measured off the real mark: letters nearly square
(the DVD `D` is 0.97:1, not the 0.67:1 a naive geometric letter lands on), stroke ≈32%
of cap height, letters touching, and a disc slightly **wider** than the wordmark whose
top edge just clips the baseline. Getting those four ratios wrong is what makes a
tribute look like clip art. The `S` is a stroked two-arc path because a blocky one reads
as a `5`.

The corner hit is the entire reason anyone watches one of these, so it is not left to
chance. On ~38% of wall bounces the logo genuinely **aims at a corner** — a straight
line to a corner is always a legal path immediately after a bounce — and misses by a
sampled margin:

| Probability | Miss | Reads as |
| --- | --- | --- |
| 2.5% | 0 px | a perfect corner |
| ~9% | 2–10 px | kisses it |
| ~88% | 12–67 px | a visible near miss |

That works out to roughly **one perfect corner per five minutes**, with near misses
throughout. Motion is delta-timed and clamped, so a backgrounded tab does not teleport
the logo across the screen on return.

## Files

```
index.html    markup; the SIMO screensaver mark is inlined SVG
styles.css    all styling; brand lanes are custom props on [data-brand] / [data-net]
main.js       typed line, tilt, easter eggs. Page is fully usable without it.
CNAME         jonsimo.com
assets/       the five project marks (WebP, luminance-keyed), PressStart2P subset
              (1.9 KB, printable ASCII), icons, OG image
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
