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


  /* ═══ EGG 3 (passive) — the screensaver ══════════════════════════
     A DVD-bounce, but the corner hit is the whole point, so it is not
     left to chance: on some bounces the logo genuinely AIMS at a corner
     and misses by a sampled margin. Most attempts miss visibly, a few
     kiss the corner, and roughly one in forty lands it exactly — about
     one perfect corner per five minutes of watching. */
  var IDLE_MS   = 12000;   // 12s
  var SPEED     = 118;     // px/sec, roughly the pace of the real thing
  var ATTEMPT_P = 0.38;    // chance a bounce becomes a run at a corner
  var COLORS    = ["#4ef1cc", "#11cab8", "#1986ff", "#f7d507", "#ff6fc8", "#ff4d4d", "#7ef7e0"];
  var MIN_ANGLE = 0.30;    // ~17deg — never let a path flatten onto an axis

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

  /* Force the heading back off the axes and re-normalise the speed. Without
     this the logo can end up with a near-zero vertical component and spend the
     rest of the session tracking left-right along one line. */
  function shape() {
    var sp = Math.hypot(vx, vy) || SPEED;
    var q  = Math.atan2(Math.abs(vy), Math.abs(vx));
    if (q < MIN_ANGLE)               q = MIN_ANGLE;
    if (q > Math.PI / 2 - MIN_ANGLE) q = Math.PI / 2 - MIN_ANGLE;
    vx = Math.cos(q) * sp * (vx < 0 ? -1 : 1);
    vy = Math.sin(q) * sp * (vy < 0 ? -1 : 1);
  }

  /* Sampled miss distance, in px, for one corner attempt. */
  function missDistance() {
    var r = Math.random();
    if (r < 0.05) return 0;                    // dead on
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
    var len = Math.hypot(dx, dy);
    if (!len) return false;

    // Refuse a run that would leave the logo crawling along a wall — those are
    // the paths that used to flatten the whole thing out.
    var q = Math.atan2(Math.abs(dy), Math.abs(dx));
    if (q < MIN_ANGLE || q > Math.PI / 2 - MIN_ANGLE) return false;

    vx = (dx / len) * SPEED;
    vy = (dy / len) * SPEED;
    return true;
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
      if (hitX && hitY) { celebrate(); shape(); }               // the corner
      else if (!(Math.random() < ATTEMPT_P && aimAtCorner(b))) shape();
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
    var a = (Math.random() * 0.5 + 0.25) * Math.PI;
    vx = Math.cos(a) * SPEED * (Math.random() < 0.5 ? -1 : 1);
    vy = Math.sin(a) * SPEED * (Math.random() < 0.5 ? -1 : 1);
    shape();                                        // guarantee a diagonal
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
  /* ═══ Vector Drift — ambient shooter sim ═════════════════════════
     Runs only while the VD tile is hovered/focused, and never under
     reduced motion. Purely decorative: no collisions, no score. */
  (function () {
    var tile = document.querySelector('.tile[data-brand="vd"]');
    if (!tile) return;
    var canvas = tile.querySelector('.sim');
    if (!canvas || reduced) return;
    var g = canvas.getContext('2d');
    var imgP = new Image(); imgP.src = 'assets/sim-player.png';
    var imgG = new Image(); imgG.src = 'assets/sim-grunt.png';

    var CY = '#4ef1cc', HOT = '#eafff8', FOE = 'rgba(126,247,224,.9)';
    var W = 0, H = 0, DPR = 1, raf = null, prev = 0;
    var stars = [], enemies = [], bullets = [], player = {};

    function size() {
      var r = tile.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function mkEnemy(i) {
      return {
        baseX: W * (0.26 + 0.24 * i), x: 0, y: -46 - i * 52,
        sway: Math.random() * 6, spd: 20 + Math.random() * 14,
        fire: 1 + Math.random() * 2, s: Math.max(34, W * 0.058)
      };
    }
    function reset() {
      stars = [];
      for (var i = 0; i < 46; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 0.8 + 0.2 });
      enemies = [mkEnemy(0), mkEnemy(1), mkEnemy(2)];
      bullets = [];
      player = { x: W / 2, y: H - 28, phase: Math.random() * 6, cool: 0, s: Math.max(36, W * 0.064) };
    }

    // Real Vector Drift sprites: the flown player ship and an axiom grunt,
    // drawn with a neon glow. Native colours — cyan player, green grunts.
    function sprite(img, x, y, h, glow, hue) {
      if (!img.complete || !img.naturalWidth) return;
      var w = h * img.naturalWidth / img.naturalHeight;
      g.save();
      g.shadowColor = hue; g.shadowBlur = glow;
      g.drawImage(img, x - w / 2, y - h / 2, w, h);
      // a second pass with no blur keeps the linework crisp over its own glow
      g.shadowBlur = 0; g.drawImage(img, x - w / 2, y - h / 2, w, h);
      g.restore();
    }

    function frame(ts) {
      if (!prev) prev = ts;
      var dt = Math.min(0.05, (ts - prev) / 1000); prev = ts;
      g.clearRect(0, 0, W, H);

      // starfield
      g.shadowBlur = 0;
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        st.y += (34 + st.z * 110) * dt;
        if (st.y > H) { st.y = 0; st.x = Math.random() * W; }
        g.strokeStyle = 'rgba(120,247,224,' + (0.12 + st.z * 0.5).toFixed(3) + ')';
        g.lineWidth = st.z * 1.4;
        g.beginPath(); g.moveTo(st.x, st.y); g.lineTo(st.x, st.y - (2 + st.z * 11)); g.stroke();
      }

      // enemies
      for (var e = 0; e < enemies.length; e++) {
        var en = enemies[e];
        en.y += en.spd * dt; en.sway += dt;
        en.x = en.baseX + Math.sin(en.sway * 1.3) * W * 0.07;
        if (en.y > H + 46) { en.y = -46; en.baseX = W * (0.18 + Math.random() * 0.64); }
        sprite(imgG, en.x, en.y, en.s, 9, CY);
        en.fire -= dt;
        if (en.fire <= 0) { en.fire = 1.4 + Math.random() * 2; bullets.push({ x: en.x, y: en.y + en.s * 0.4, foe: 1 }); }
      }

      // player
      player.phase += dt;
      player.x = W / 2 + Math.sin(player.phase * 0.9) * W * 0.30;
      sprite(imgP, player.x, player.y, player.s, 11, CY);
      // thruster flicker
      g.shadowColor = CY; g.shadowBlur = 8; g.strokeStyle = 'rgba(126,247,224,.6)';
      for (var f = 0; f < 3; f++) {
        g.globalAlpha = 0.5 - f * 0.14;
        g.beginPath(); g.moveTo(player.x, player.y + player.s * 0.42);
        g.lineTo(player.x, player.y + player.s * 0.42 + 10 + f * 7 + Math.random() * 6); g.stroke();
      }
      g.globalAlpha = 1;
      player.cool -= dt;
      if (player.cool <= 0) { player.cool = 0.24; bullets.push({ x: player.x, y: player.y - player.s * 0.5, foe: 0 }); }

      // bullets
      g.shadowBlur = 8;
      for (var b = bullets.length - 1; b >= 0; b--) {
        var bl = bullets[b];
        bl.y += (bl.foe ? 165 : -300) * dt;
        g.strokeStyle = bl.foe ? FOE : HOT; g.shadowColor = bl.foe ? CY : CY;
        g.lineWidth = bl.foe ? 1.5 : 2;
        g.beginPath(); g.moveTo(bl.x, bl.y); g.lineTo(bl.x, bl.y + (bl.foe ? 8 : -10)); g.stroke();
        if (bl.y < -14 || bl.y > H + 14) bullets.splice(b, 1);
      }

      raf = requestAnimationFrame(frame);
    }

    function start() { if (raf) return; tile.classList.add('playing'); size(); reset(); prev = 0; raf = requestAnimationFrame(frame); }
    function stop() { tile.classList.remove('playing'); if (raf) cancelAnimationFrame(raf); raf = null; if (g) g.clearRect(0, 0, W, H); }

    tile.addEventListener('pointerenter', start);
    tile.addEventListener('pointerleave', stop);
    tile.addEventListener('focus', start, true);
    tile.addEventListener('blur', stop, true);
    window.addEventListener('resize', function () { if (raf) size(); });
  })();

  /* ═══ Showcase facades — click a poster to load the video inline ═══ */
  $$(".facade[data-embed]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-embed");
      if (!src) return;
      var media = btn.closest(".media");
      var f = document.createElement("iframe");
      f.src = src;
      f.title = btn.getAttribute("aria-label") || "Video";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.setAttribute("allowfullscreen", "");
      f.referrerPolicy = "strict-origin-when-cross-origin";
      f.loading = "eager";
      media.innerHTML = "";
      media.appendChild(f);
    });
  });
  /* ═══ Alpha Tracker console — lines get WRITTEN in at the bottom, older
     lines step up, like a live command line. JS-driven, only while open. ═══ */
  (function () {
    var tile = document.querySelector('.tile[data-brand="at"]');
    var el = tile && tile.querySelector('.console');
    if (!el) return;
    var LINES = [
      ['c', '$ at sync --project vector-drift'],
      ['', '  pulling board · 142 tasks · 6 sprints'],
      ['k', '  ✓ indexed 142 tasks in 0.4s'],
      ['c', '$ at status'],
      ['', '  in-progress 18  ·  review 5  ·  done 119'],
      ['', '  [build] compiling shaders  ] 87%'],
      ['k', '  ✓ milestone "boss: broodmother" on track'],
      ['c', '$ git commit -m "wire pods + jaw rig"'],
      ['', '  4 files changed, 213 insertions(+)'],
      ['c', '$ at deploy --env staging'],
      ['', '  packaging build 0.9.14 ...'],
      ['', '  uploading  ] 100%  4.2 MB/s'],
      ['k', '  ✓ deployed to staging in 11.3s'],
      ['c', '$ at test --suite feel'],
      ['', '  running 64 checks ...'],
      ['k', '  ✓ 64 passed  ·  0 failed'],
      ['', '  [audio] normalizing 12 cues'],
      ['c', '$ at burndown --sprint 6'],
      ['', '  velocity 41 pts  ·  eta 3d'],
      ['k', '  ✓ no blockers detected'],
      ['c', '$ at watch --changes'],
      ['', '  fs event  boss_broodmother.svg'],
      ['', '  rebuild  ] tracing 388 segments'],
      ['k', '  ✓ sprite hot-reloaded']
    ];
    function mkLine(idx) {
      var r = LINES[idx % LINES.length];
      var s = document.createElement('span');
      if (r[0]) s.className = r[0];
      s.textContent = r[1];
      return s;
    }
    var ptr = 0, running = false, lh = 0, timer = null, onEnd = null;

    function fill() {           // prefill enough lines to cover the box
      el.style.transition = 'none';
      el.style.transform = 'translateY(0)';
      el.innerHTML = '';
      for (var i = 0; i < 22; i++) el.appendChild(mkLine(ptr++));
      lh = el.lastChild ? el.lastChild.offsetHeight : 16;
    }
    function step() {
      if (!running) return;
      el.appendChild(mkLine(ptr++));         // write the new line at the bottom
      el.style.transition = 'none';
      el.style.transform = 'translateY(0)';
      // next frame: slide the whole stack up by one line
      requestAnimationFrame(function () {
        if (!running) return;
        el.style.transition = 'transform .14s linear';
        el.style.transform = 'translateY(-' + lh + 'px)';
      });
    }
    onEnd = function (e) {
      if (e.propertyName !== 'transform') return;
      el.style.transition = 'none';
      if (el.firstChild) el.removeChild(el.firstChild);   // drop the top line
      el.style.transform = 'translateY(0)';
      if (running) timer = setTimeout(step, 150 + Math.random() * 220);
    };

    function start() {
      if (running || reduced) { if (reduced) fill(); return; }
      running = true; fill();
      el.addEventListener('transitionend', onEnd);
      timer = setTimeout(step, 200);
    }
    function stop() {
      running = false;
      clearTimeout(timer);
      el.removeEventListener('transitionend', onEnd);
    }
    tile.addEventListener('pointerenter', start);
    tile.addEventListener('pointerleave', stop);
    tile.addEventListener('focusin', start);
    tile.addEventListener('focusout', stop);
  })();
})();
