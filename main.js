/* jonsimo.com — root console.
   No dependencies, no network calls. The page is a complete, usable link
   list without this file; everything here is decoration or an easter egg.

   Easter-egg rule: every egg is either PASSIVE (it happens to you) or
   CLICKABLE (you find it by poking something). Nothing is on a key combo,
   because nobody discovers a key combo. */
(function () {
  "use strict";

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var yr = $("#yr");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ── typed tagline ────────────────────────────────────────────── */
  var LINE = "active projects — select a channel";
  var typed = $("#typed");
  if (typed) {
    if (reduced) {
      typed.textContent = LINE;
    } else {
      var ti = 0;
      (function tick() {
        typed.textContent = LINE.slice(0, ti++);
        if (ti <= LINE.length) setTimeout(tick, 34);
      })();
    }
  }

  /* ── pointer tilt on the tiles ────────────────────────────────── */
  if (!reduced && matchMedia("(hover: hover)").matches) {
    $$(".tile").forEach(function (tile) {
      tile.addEventListener("pointermove", function (e) {
        var r = tile.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        tile.style.transform =
          "translateY(-2px) perspective(900px) rotateX(" + (-dy * 2.2).toFixed(2) +
          "deg) rotateY(" + (dx * 2.6).toFixed(2) + "deg)";
      });
      tile.addEventListener("pointerleave", function () { tile.style.transform = ""; });
    });
  }

  /* ═══ EGG 1 (click) — the prompt glyph power-cycles the tube ═══════
     This used to be a blinking block cursor, which read as a text field
     you could type into. The bare ">" makes no such promise. */
  var prefixEl = $("#prefix");
  if (prefixEl) prefixEl.addEventListener("click", degauss);

  function degauss() {
    if (reduced) return;
    document.body.classList.remove("degauss");
    void document.body.offsetWidth;               // restart the animation
    document.body.classList.add("degauss");
    setTimeout(function () { document.body.classList.remove("degauss"); }, 950);
  }

  /* ═══ EGG 2 (click) — the name drops the page to phosphor green ═══ */
  var wordmark = $(".wordmark");
  if (wordmark) {
    wordmark.addEventListener("click", function () {
      document.body.classList.toggle("vectorscope");
      degauss();
    });
  }

  /* ═══ EGG 3 (passive) — the screensaver ══════════════════════════
     A DVD-bounce, but the corner hit is the whole point, so it is not
     left to chance: on some bounces the logo genuinely AIMS at a corner
     and misses by a sampled margin. Most attempts miss visibly, a few
     kiss the corner, and roughly one in forty lands it exactly — about
     one perfect corner per five minutes of watching. */
  var IDLE_MS   = 20000;   // 20s
  var SPEED     = 118;     // px/sec, roughly the pace of the real thing
  var ATTEMPT_P = 0.38;    // chance a bounce becomes a run at a corner
  var COLORS    = ["#4ef1cc", "#11cab8", "#1986ff", "#f7d507", "#ff6fc8", "#ff4d4d", "#7ef7e0"];

  var saver = $("#saver"), mark = $("#saver-mark");
  var idleTimer = null, raf = null, last = 0;
  var x = 0, y = 0, vx = 0, vy = 0, ci = 0;

  function bounds() {
    return {
      w: Math.max(1, saver.clientWidth  - mark.offsetWidth),
      h: Math.max(1, saver.clientHeight - mark.offsetHeight)
    };
  }

  function recolor() {
    ci = (ci + 1) % COLORS.length;
    mark.style.color = COLORS[ci];
  }

  /* Sampled miss distance, in px, for one corner attempt. */
  function missDistance() {
    var r = Math.random();
    if (r < 0.025) return 0;                    // dead on
    if (r < 0.12)  return 2 + Math.random() * 8;  // kisses it
    return 12 + Math.random() * 55;               // visible near miss
  }

  /* Point the logo at a corner, offset by `err` along the wall it will
     reach first. Called right after a wall bounce, so a straight line to
     any corner on the far side is always a legal path. */
  function aimAtCorner(b) {
    var cx = vx > 0 ? b.w : 0;
    var cy = vy > 0 ? b.h : 0;
    var err = missDistance();

    // Push the aim point off the corner along whichever edge keeps it inside.
    var tx = cx, ty = cy;
    if (Math.random() < 0.5) tx += (cx === 0 ? err : -err);
    else                     ty += (cy === 0 ? err : -err);

    var dx = tx - x, dy = ty - y;
    var len = Math.hypot(dx, dy) || 1;
    vx = (dx / len) * SPEED;
    vy = (dy / len) * SPEED;
  }

  function celebrate() {
    mark.classList.remove("corner");
    void mark.offsetWidth;
    mark.classList.add("corner");
    setTimeout(function () { mark.classList.remove("corner"); }, 1400);
  }

  function step(now) {
    if (!last) last = now;
    var dt = Math.min((now - last) / 1000, 0.05);   // clamp tab-switch jumps
    last = now;

    var b = bounds();
    x += vx * dt;
    y += vy * dt;

    var hitX = false, hitY = false;
    if (x <= 0)      { x = 0;   vx = Math.abs(vx);  hitX = true; }
    else if (x >= b.w) { x = b.w; vx = -Math.abs(vx); hitX = true; }
    if (y <= 0)      { y = 0;   vy = Math.abs(vy);  hitY = true; }
    else if (y >= b.h) { y = b.h; vy = -Math.abs(vy); hitY = true; }

    if (hitX || hitY) {
      recolor();
      if (hitX && hitY) celebrate();               // the corner
      else if (Math.random() < ATTEMPT_P) aimAtCorner(b);
    }

    mark.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    raf = requestAnimationFrame(step);
  }

  function startSaver() {
    if (reduced || !saver || !saver.hidden) return;
    saver.hidden = false;
    var b = bounds();
    x = 40 + Math.random() * Math.max(1, b.w - 80);
    y = 40 + Math.random() * Math.max(1, b.h - 80);
    var a = (Math.random() * 0.6 + 0.2) * Math.PI;   // never axis-aligned
    vx = Math.cos(a) * SPEED * (Math.random() < 0.5 ? -1 : 1);
    vy = Math.sin(a) * SPEED * (Math.random() < 0.5 ? -1 : 1);
    mark.style.color = COLORS[ci];
    last = 0;
    raf = requestAnimationFrame(step);
  }

  function stopSaver() {
    if (!saver || saver.hidden) return;
    saver.hidden = true;
    mark.classList.remove("corner");
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function poke() {
    stopSaver();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startSaver, IDLE_MS);
  }

  if (saver && mark) {
    ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "focusin"]
      .forEach(function (ev) { addEventListener(ev, poke, { passive: true }); });
    addEventListener("resize", function () {
      if (saver.hidden) return;
      var b = bounds();
      x = Math.min(x, b.w);
      y = Math.min(y, b.h);
    });
    poke();
  }
})();
