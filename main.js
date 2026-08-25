/* jonsimo.com — root console.
   No dependencies, no network calls. Everything degrades to a plain,
   fully-usable link page if this file never runs. */
(function () {
  "use strict";

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── year ─────────────────────────────────────────────────────── */
  var yr = $("#yr");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ── stroke-draw prep ─────────────────────────────────────────────
     Stamp pathLength="1" on every stroked child so a single CSS rule
     (dashoffset 1 → 0) re-draws any mark, whatever its real length,
     and stagger them with --i so the logo assembles rather than blinks. */
  $$(".vd-logo, .at-logo").forEach(function (svg) {
    $$("polyline, path, circle, line, polygon, rect", svg).forEach(function (el, i) {
      el.setAttribute("pathLength", "1");
      el.setAttribute("data-draw", "");
      el.style.setProperty("--i", i);
    });
  });

  /* ── typed tagline ────────────────────────────────────────────── */
  var LINE = "active projects — select a channel";
  var typed = $("#typed");
  if (typed) {
    if (reduced) {
      typed.textContent = LINE;
    } else {
      var i = 0;
      (function tick() {
        typed.textContent = LINE.slice(0, i++);
        if (i <= LINE.length) setTimeout(tick, 34);
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

  /* ═══ EASTER EGG 1 — Konami → VECTORSCOPE MODE ═══════════════════ */
  var KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  var kp = 0;
  function vectorscope(on) {
    var next = on === undefined ? !document.body.classList.contains("vectorscope") : on;
    document.body.classList.toggle("vectorscope", next);
    return next;
  }

  /* ═══ EASTER EGG 2 — CRT power-cycle (click the cursor 3×) ═══════ */
  var clicks = 0, clickTimer = null;
  var cursorEl = $("#cursor");
  if (cursorEl) {
    cursorEl.addEventListener("click", function () {
      clicks++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clicks = 0; }, 700);
      if (clicks >= 3) {
        clicks = 0;
        degauss();
      }
    });
  }
  function degauss() {
    if (reduced) return;
    document.body.classList.remove("degauss");
    void document.body.offsetWidth;               // restart the animation
    document.body.classList.add("degauss");
    setTimeout(function () { document.body.classList.remove("degauss"); }, 950);
  }

  /* ═══ EASTER EGG 3 — hidden console (/ or ~) ═════════════════════ */
  var box = $("#console"), out = $("#console-out"), form = $("#console-form"), input = $("#console-in");
  var hint = $("#hint");

  var LINKS = {
    vd:    ["Vector Drift",   "https://vectordrift.io"],
    alpha: ["Alpha Tracker",  "https://alpha.vectordrift.io"],
    cj:    ["Codex Jr",       "https://codexjr.com"],
    ig:    ["Instagram",      "https://www.instagram.com/jonsimo/"],
    yt:    ["YouTube",        "https://www.youtube.com/@jonsimo"],
    tt:    ["TikTok",         "https://www.tiktok.com/@jonsimo"],
    li:    ["LinkedIn",       "https://ca.linkedin.com/in/jonsimo"],
    mail:  ["Email",          "mailto:yo@jonsimo.com"]
  };
  var ALIAS = {
    "vector drift":"vd", vectordrift:"vd", drift:"vd",
    "alpha tracker":"alpha", at:"alpha", tracker:"alpha",
    "codex jr":"cj", codexjr:"cj", codex:"cj", jr:"cj",
    instagram:"ig", insta:"ig",
    youtube:"yt", tiktok:"tt", tik:"tt",
    linkedin:"li", email:"mail", contact:"mail", mailto:"mail"
  };

  function say(text, cls) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }

  function openConsole() {
    if (!box || !box.hidden) return;
    box.hidden = false;
    if (!out.childElementCount) {
      say("jonsimo.sys // root console");
      say("type `help` for commands, `exit` to close.");
      say("");
    }
    input.focus();
    if (hint) hint.style.opacity = ".35";
  }
  function closeConsole() {
    if (!box || box.hidden) return;
    box.hidden = true;
    input.blur();
    if (hint) hint.style.opacity = "";
  }

  var HELP = [
    "  help              this list",
    "  ls                list channels",
    "  open <name>       open a channel  (vd | alpha | cj | ig | yt | tt | li | mail)",
    "  whoami            who is running this",
    "  contact           email address",
    "  vectorscope       toggle the green mode",
    "  degauss           power-cycle the tube",
    "  snake             ...not here",
    "  clear             wipe the scrollback",
    "  exit              close the console"
  ];

  function run(raw) {
    var line = raw.trim();
    if (!line) return;
    say("jonsimo:~$ " + line, "cmd");
    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(" ").toLowerCase();

    switch (cmd) {
      case "help": case "?": case "man":
        HELP.forEach(function (l) { say(l); }); break;

      case "ls": case "dir":
        say("  vd     vectordrift.io          retro vector space shooter");
        say("  alpha  alpha.vectordrift.io    game dev project management");
        say("  cj     codexjr.com             a magic: the gathering life tracker");
        break;

      case "whoami":
        say("jon simo — builds games and tools.");
        say("three channels live. more in the dark.");
        break;

      case "contact": case "email": case "mail":
        say("yo@jonsimo.com");
        window.open("mailto:yo@jonsimo.com", "_self");
        break;

      case "open": case "cd": case "goto": case "launch": {
        var key = ALIAS[arg] || arg;
        var hit = LINKS[key];
        if (!hit) { say("no such channel: " + (arg || "(nothing)"), "err"); say("try `ls`."); break; }
        say("opening " + hit[0] + " …");
        window.open(hit[1], hit[1].indexOf("mailto:") === 0 ? "_self" : "_blank", "noopener");
        break;
      }

      case "vectorscope": case "green":
        say(vectorscope() ? "vectorscope mode: ON" : "vectorscope mode: OFF"); break;

      case "degauss": case "reboot":
        say("power-cycling…"); degauss(); break;

      case "snake":
        say("not on this box. the shooter has one:");
        say("  vectordrift.io → type `snake`");
        break;

      case "sudo":
        say("nice try.", "err"); break;

      case "clear": case "cls":
        out.textContent = ""; break;

      case "exit": case "quit": case "q":
        closeConsole(); break;

      case "konami":
        say("↑ ↑ ↓ ↓ ← → ← → b a"); break;

      default:
        say("command not found: " + cmd, "err");
        say("type `help`.");
    }
    say("");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = "";
      run(v);
    });
  }

  /* ═══ keyboard router ════════════════════════════════════════════ */
  document.addEventListener("keydown", function (e) {
    var typing = box && !box.hidden && document.activeElement === input;

    if (e.key === "Escape" && typing) { closeConsole(); return; }

    if (!typing) {
      if ((e.key === "/" || e.key === "~" || e.key === "`") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openConsole();
        return;
      }
      // Konami — only tracked outside the console.
      if (e.key.toLowerCase() === KONAMI[kp].toLowerCase() || e.key === KONAMI[kp]) {
        kp++;
        if (kp === KONAMI.length) {
          kp = 0;
          var on = vectorscope();
          degauss();
          if (box && !box.hidden) say(on ? "vectorscope mode: ON" : "vectorscope mode: OFF");
        }
      } else {
        kp = (e.key === KONAMI[0]) ? 1 : 0;
      }
    }
  });

  /* ═══ EASTER EGG 4 — idle screensaver ════════════════════════════ */
  var saver = $("#saver"), mark = $("#saver-mark");
  var idleTimer = null, raf = null;
  var IDLE_MS = 60000;

  function stopSaver() {
    if (!saver || saver.hidden) return;
    saver.hidden = true;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function startSaver() {
    if (reduced || !saver || !saver.hidden) return;
    if (box && !box.hidden) return;
    saver.hidden = false;
    var x = 40, y = 40, vx = 1.7, vy = 1.35;
    var hues = ["#4ef1cc", "#11cab8", "#1986ff", "#f7d507", "#ff6fc8"];
    var h = 0;
    (function step() {
      var w = saver.clientWidth  - mark.offsetWidth;
      var hgt = saver.clientHeight - mark.offsetHeight;
      x += vx; y += vy;
      if (x <= 0 || x >= w) { vx = -vx; x = Math.max(0, Math.min(x, w)); h = (h + 1) % hues.length; mark.style.color = hues[h]; }
      if (y <= 0 || y >= hgt) { vy = -vy; y = Math.max(0, Math.min(y, hgt)); h = (h + 1) % hues.length; mark.style.color = hues[h]; }
      mark.style.transform = "translate(" + x + "px," + y + "px)";
      raf = requestAnimationFrame(step);
    })();
  }

  function poke() {
    stopSaver();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startSaver, IDLE_MS);
  }
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "focusin"]
    .forEach(function (ev) { addEventListener(ev, poke, { passive: true }); });
  poke();

  /* ═══ EASTER EGG 5 — devtools ════════════════════════════════════ */
  try {
    console.log(
      "%c\n" +
      "   ┌───────────────────────────────┐\n" +
      "   │  J O N   S I M O              │\n" +
      "   │  root console                 │\n" +
      "   └───────────────────────────────┘\n" +
      "   press / on the page for the real one.\n" +
      "   ↑ ↑ ↓ ↓ ← → ← → b a still works.\n",
      "color:#4ef1cc;font-family:monospace;font-size:12px"
    );
  } catch (_) {}
})();
