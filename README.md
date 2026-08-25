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

Marks are sized by **height** into a shared lockup band (`.lock`), never by width —
a 2.5:1 wordmark and a square pixel sprite only read as siblings on a common baseline.

### Hover

- SVG marks re-draw themselves stroke-by-stroke (`pathLength="1"` stamped by JS, so one
  `stroke-dashoffset` rule works on any path regardless of its real length; `--i` staggers them)
- Codex Jr's mark is raster pixel art, so it gets a *stepped* bob + gold rim instead of a
  smooth vector redraw
- Corner brackets snap outward, a scanline sweeps the tile, the border and bloom ignite
- Subtle pointer-tracked tilt

## Easter eggs

| Trigger | Effect |
| --- | --- |
| `/` or `~` | Hidden console. `help`, `ls`, `open <vd\|alpha\|cj\|ig\|yt\|tt\|li\|mail>`, `whoami`, `sudo`, `vectorscope`, `degauss`, `snake`, `clear`, `exit` |
| ↑ ↑ ↓ ↓ ← → ← → B A | **Vectorscope mode** — everything drops to phosphor green, the tube warps |
| Click the blinking cursor ×3 | CRT power-cycle (collapse to a line, degauss, snap back) |
| Idle 60s | DVD-bounce screensaver |
| Open devtools | ASCII banner |

## Files

```
index.html    markup + inlined SVG marks (Vector Drift's real vector logo, hand-traced gamepad)
styles.css    all styling; brand lanes are CSS custom props on [data-brand]
main.js       typed line, stroke-draw prep, tilt, easter eggs. Page is fully usable without it.
CNAME         jonsimo.com
assets/       pixel wizard, PressStart2P subset (1.9 KB, printable ASCII), icons, OG image
```

## Notes

- **No external requests.** No CDN, no analytics, no hosted fonts. CSP in `<head>` is
  `default-src 'self'` with `connect-src 'none'`.
- `prefers-reduced-motion` kills every animation; `prefers-contrast: more` lifts the dim tiers.
- The page degrades to a plain, fully-usable link list if `main.js` never runs.
- `.nojekyll` so Pages serves the tree verbatim.

## Local

```sh
python3 -m http.server 8777   # then open http://localhost:8777
```
