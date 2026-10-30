// port0r.com, the pages' behaviour (16/10/2026, third draft). Everything here reads public files only:
//   - the live numbers and the players' comments: live.json, next to the public stats page (tools/port0r_public.py writes it
//     after each reading, every 30 minutes);
//   - the leaderboards: the bot's public boards (alloxr.info/port0r/api/board/<game>.json), live.
// Each block shows its own state when a file cannot be read: nothing is left silently empty.
(() => {
  // the live numbers: next to the site on port0r.com (same origin), else the repository's own address (a preview elsewhere)
  const LIVE = ["/stats/live.json", "https://jacquesdupontd.github.io/port0r/stats/live.json"];
  const BOARDS = "https://alloxr.info/port0r/api/board/";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NBSP = " ";
  const full = (n) => Math.round(n).toLocaleString("en-US").replace(/,/g, NBSP);
  const short = (n) => n >= 100000 ? (n / 1000).toFixed(0) + "K" : n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : full(n);
  const time = (s) => { const cs = Math.round(s * 100); return `${Math.floor(cs / 6000)}'${String(Math.floor(cs / 100) % 60).padStart(2, "0")}"${String(cs % 100).padStart(2, "0")}`; };

  // Display preferences are local to this browser and shared by every page.
  const root = document.documentElement;
  const readPref = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } };
  const savePref = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const applyTheme = (value) => {
    if (value === "system") delete root.dataset.theme;
    else root.dataset.theme = value === "dark" ? "dark" : "light";
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue("--paper").trim();
  };
  const syncIntroPreference = () => $$("[data-intro-enabled]").forEach((el) => { el.checked = readPref("port0r-intro", "on") !== "off"; });
  const nav = $("#top nav");
  let preferences, preferenceSummary;
  if (nav) {
    const discord = $(".btn", nav);
    if (discord) {
      discord.setAttribute("aria-label", "Discord");
      discord.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg><span class="nav-discord-label">Discord</span>';
    }
    preferences = document.createElement("details");
    preferences.className = "site-preferences";
    preferences.innerHTML = `<summary aria-label="Display preferences"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 2v14a7 7 0 0 1 0-14Z"/></svg><span class="preferences-label">Display</span></summary>
      <div class="preferences-panel"><label>Appearance<select aria-label="Appearance"><option value="light">Light</option><option value="dark">Dark</option><option value="system">Use device setting</option></select></label>
      <label class="intro-preference"><input type="checkbox" data-intro-enabled checked>Play intro on visits</label><button type="button" data-replay-intro>Replay intro</button></div>`;
    nav.append(preferences);
    preferenceSummary = $("summary", preferences);
    const select = $("select", preferences);
    select.value = readPref("port0r-theme", "light");
    select.addEventListener("change", () => { savePref("port0r-theme", select.value); applyTheme(select.value); });
    $("[data-replay-intro]", preferences).addEventListener("click", () => {
      preferences.open = false;
      if ($("#brand-intro")) startIntro(preferenceSummary);
      else {
        const url = new URL($("#top .mark").href);
        url.searchParams.set("intro", "play");
        location.href = url;
      }
    });
    document.addEventListener("pointerdown", (e) => { if (!preferences.contains(e.target)) preferences.open = false; });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && preferences.open) { preferences.open = false; preferenceSummary.focus(); } });
  }
  syncIntroPreference();
  $$("[data-intro-enabled]").forEach((el) => el.addEventListener("change", () => {
    savePref("port0r-intro", el.checked ? "on" : "off"); syncIntroPreference();
  }));
  applyTheme(readPref("port0r-theme", "light"));
  addEventListener("storage", (e) => {
    if (e.key === "port0r-theme") { applyTheme(readPref(e.key, "light")); if (preferences) $("select", preferences).value = readPref(e.key, "light"); }
    if (e.key === "port0r-intro") syncIntroPreference();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (readPref("port0r-theme", "light") === "system") applyTheme("system");
  });

  // The logo and the support message occupy one screen and one timeline.
  const intro = $("#brand-intro");
  let introRunning = false, introFrame = 0, introTimers = [], introReturnFocus;
  const finishIntro = (immediate = false) => {
    if (!introRunning) return;
    introRunning = false;
    cancelAnimationFrame(introFrame);
    introTimers.forEach(clearTimeout); introTimers = [];
    $("video", intro).pause();
    intro.classList.add("leaving");
    const close = () => {
      intro.close(); root.classList.remove("intro-pending");
      clearTimeout(window.port0rIntroFallback);
      document.dispatchEvent(new Event("port0r-intro-ended"));
      if (introReturnFocus) introReturnFocus.focus({ preventScroll: true });
    };
    if (immediate || still) close(); else introTimers.push(setTimeout(close, 340));
  };
  function startIntro(returnFocus) {
    if (!intro || introRunning) return;
    introTimers.forEach(clearTimeout); introTimers = [];
    clearTimeout(window.port0rIntroFallback);
    introRunning = true; introReturnFocus = returnFocus;
    root.classList.add("intro-pending");
    intro.classList.remove("leaving", "thanking");
    intro.dataset.phase = "logo";
    const video = $("video", intro), sound = $("[data-intro-sound]", intro), heart = $(".intro-heart", intro);
    const said = $(".ask-in p");
    const head = $("b", said).textContent.trim(), rest = said.textContent.trim().slice(head.length).trim();
    $(".intro-message", intro).setAttribute("aria-label", head + " " + rest);
    let next = 180;
    const parts = [[".intro-title", head, 140], [".intro-text", rest, 70]];
    const words = parts.flatMap(([selector, text, step]) => {
      const el = $(selector, intro); el.replaceChildren();
      return text.split(/\s+/).map((word) => {
        const span = document.createElement("span"); span.className = "intro-word"; span.textContent = word;
        el.append(span, " "); const result = { span, at: next }; next += step; return result;
      });
    });
    video.currentTime = 0; video.preload = "auto";
    const soundLabel = () => { sound.setAttribute("aria-pressed", String(!video.muted)); $("span", sound).textContent = video.muted ? "Sound off" : "Sound on"; };
    let videoFailed = false;
    const play = () => {
      video.play().catch(() => { video.muted = true; soundLabel(); video.play().catch(() => { videoFailed = true; }); });
    };
    soundLabel();
    try { intro.showModal(); } catch (_) { introRunning = false; root.classList.remove("intro-pending"); return; }
    $("[data-intro-skip]", intro).focus({ preventScroll: true });
    if (!document.hidden) play();
    const visible = () => { last = 0; if (document.hidden) video.pause(); else if (introRunning && !video.ended) play(); };
    document.addEventListener("visibilitychange", visible);
    const cleanupVisibility = () => document.removeEventListener("visibilitychange", visible);
    intro.addEventListener("close", cleanupVisibility, { once: true });
    let elapsed = 0, last = 0, wordIndex = 0, thanksAt = null, beatIndex = -1;
    const colors = getComputedStyle(root).getPropertyValue("--brand-cycle").trim().split(/\s*,\s*/);
    const durations = still ? colors.map(() => 225) : [420, 350, 290, 240, 200, 165, 135, 110, 90];
    const beats = durations.map((duration, i) => ({ duration, at: durations.slice(0, i).reduce((a, b) => a + b, 0) }));
    const thanksLength = durations.reduce((a, b) => a + b, 0) + 160;
    const tick = (now) => {
      if (!introRunning) return;
      if (!document.hidden && last) elapsed += now - last;
      last = now;
      while (wordIndex < words.length && elapsed >= words[wordIndex].at) words[wordIndex++].span.classList.add("on");
      if (thanksAt === null && elapsed >= 3600 && (video.ended || videoFailed || elapsed >= 4500)) {
        thanksAt = elapsed; intro.classList.add("thanking"); intro.dataset.phase = "thanks";
      }
      if (thanksAt !== null) {
        const t = elapsed - thanksAt;
        let index = 0; while (index + 1 < beats.length && t >= beats[index + 1].at) index++;
        if (index !== beatIndex) {
          beatIndex = index; heart.style.color = colors[index % colors.length];
          if (!still) heart.animate([{ transform: "scale(1)" }, { transform: "scale(1.24)", offset: .3 }, { transform: "scale(1)" }], { duration: beats[index].duration, easing: "ease-out" });
        }
        if (t >= thanksLength) { finishIntro(); return; }
      }
      introFrame = requestAnimationFrame(tick);
    };
    introFrame = requestAnimationFrame(tick);
    introTimers.push(setTimeout(() => { if (!document.hidden) finishIntro(true); }, 10000));
  }
  if (intro) {
    $("[data-intro-skip]", intro).addEventListener("click", () => finishIntro());
    $("[data-intro-sound]", intro).addEventListener("click", (e) => {
      const video = $("video", intro); video.muted = !video.muted;
      e.currentTarget.setAttribute("aria-pressed", String(!video.muted));
      $("span", e.currentTarget).textContent = video.muted ? "Sound off" : "Sound on";
    });
    intro.addEventListener("cancel", (e) => { e.preventDefault(); finishIntro(); });
    intro.addEventListener("close", () => { if (introRunning) finishIntro(true); });
    if (root.classList.contains("intro-pending")) startIntro();
    const url = new URL(location.href);
    if (url.searchParams.get("intro") === "play") { url.searchParams.delete("intro"); history.replaceState(null, "", url); }
  }

  // The race behind the title keeps its existing stereo opening.
  const hero = $("#hero");
  if (hero) {
    const vid = $("video", hero);
    const tall = matchMedia("(max-aspect-ratio: 4/5)").matches;
    const poster = tall ? vid.dataset.tallPoster : vid.dataset.widePoster;
    vid.poster = poster;
    hero.style.setProperty("--focus-y", "58%");
    const eyes = $$(".hero-eyes .eye", hero);
    eyes.forEach((e) => { e.src = poster; });
    vid.src = tall ? vid.dataset.tall : vid.dataset.wide;
    const play = () => { const p = vid.play(); if (p) p.catch(() => {}); };
    if (still) play();
    else Promise.all(eyes.map((e) => e.decode().catch(() => {}))).then(() => {
      hero.classList.add("intro");
      requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("fuse")));
      setTimeout(() => { play(); hero.classList.add("fused"); }, 1200);
    });
  }

  // ---- THE FIRST SCREEN, WHOLE, on any screen (21/10/2026) ----
  // Guillaume, after the intro card was seen cut at the bottom of a phone: « pareil pour le header et les boutons qui
  // apparaissent ensuite », « il faut penser tout le site avec cette logique ». A page's header shows its essentials -- the
  // band, the title, its text, its buttons -- inside the window a phone shows with its bars out (100svh), whatever the phone
  // or the window. When they would not fit, its type and spacing shrink by one factor (--hfit, never under .72, the buttons
  // keep their size), measured on the layout boxes (offsets: the entrances' transforms aside) at load, once the fonts are
  // in, and on every resize. What follows (the dock, the live numbers) may continue below.
  const head = $(".hero") || $(".page-head .game");   // the home page's header, or a game page's head
  if (head) {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none";
    document.body.append(probe);
    const y = (el) => { let v = 0; for (let e = el; e; e = e.offsetParent) v += e.offsetTop; return v; };
    const fitHead = () => {
      const row = $(".row", head), btns = row ? $$(".btn", row) : [];   // its buttons; a link that wraps under them may follow
      const last = btns.length ? btns[btns.length - 1] : row || $(".lead", head) || $("h1", head);
      if (!last) return;
      head.style.setProperty("--hfit", "1");
      const H = probe.offsetHeight || innerHeight;
      let k = 1;
      for (let i = 0; i < 8; i++) {
        const need = y(last) + last.offsetHeight + 12;   // from the page's top: the first screen
        if (need <= H) break;
        const next = Math.max(H < 500 ? .62 : .72, k * Math.max(.9, H / need));   // a phone on its side may go a step further
        if (next >= k) break;
        k = next;
        head.style.setProperty("--hfit", k.toFixed(3));
      }
    };
    fitHead();
    if (document.fonts) document.fonts.ready.then(fitHead);
    let pending = 0;
    addEventListener("resize", () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(fitHead); });
  }

  // ---- the top bar: light over the header, paper below it (always paper on a page without a header video) ----
  const top = $("#top");
  if (top && hero) {
    new IntersectionObserver(([e]) => {
      top.classList.toggle("over", e.isIntersecting);
      top.classList.toggle("solid", !e.isIntersecting);
    // paper as soon as the header's last band is under the bar: a link to #games stops 76 px under the top (scroll-padding),
    // and at -68 px the bar stayed clear over the live numbers' labels (21/10/2026, seen on the fit bench's screenshots)
    }, { rootMargin: "-84px 0px 0px 0px", threshold: 0 }).observe(hero);
  }

  // ---- the clips recorded in the headset: loaded and played only while on screen ----
  // ALWAYS, reduced motion or not (17/10/2026, Guillaume: « les "in the headset" tournent bien sur le mobile mais sur PC desktop
  // je vois pas l'animation donc on comprend pas »): they are the point of the page, small and muted. A desktop browser that
  // refuses autoplay until the visitor does something (Brave) gets them started at the first click, wheel, key or hover.
  {
    const shown = new Set();
    const start = (v) => { const p = v.play(); if (p) p.catch(() => v.closest(".pip")?.classList.add("blocked")); };
    const io = new IntersectionObserver((list) => {
      for (const e of list) {
        const v = e.target;
        if (e.isIntersecting) { shown.add(v); if (!v.src) v.src = v.dataset.src; start(v); }
        else { shown.delete(v); if (!v.paused) v.pause(); }
      }
    }, { threshold: 0.3 });
    $$("video.clip").forEach((v) => {
      io.observe(v);
      v.closest(".pip")?.addEventListener("pointerenter", () => { if (!v.src) v.src = v.dataset.src; start(v); });
      v.addEventListener("playing", () => v.closest(".pip")?.classList.remove("blocked"));
    });
    const retry = () => shown.forEach((v) => { if (v.paused) start(v); });
    for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"]) addEventListener(ev, retry, { passive: true });
  }

  // ---- our videos, played right here: the thumbnail we made first, YouTube's player on a click ----
  const player = (id) => `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1&modestbranding=1" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  document.addEventListener("click", (ev) => {
    const yt = ev.target.closest(".yt[data-id]");
    if (yt && !yt.classList.contains("on")) {
      yt.classList.add("on");
      yt.insertAdjacentHTML("beforeend", player(yt.dataset.id));
      return;
    }
    const w = ev.target.closest("[data-watch]");
    const dlg = $("#watch");
    if (w && dlg) {
      $(".watch-frame", dlg).innerHTML = player(w.dataset.watch);
      dlg.showModal();
      return;
    }
    if (dlg && dlg.open && (ev.target.closest("[data-close]") || ev.target === dlg)) dlg.close();
  });
  const dlg = $("#watch");
  if (dlg) dlg.addEventListener("close", () => { $(".watch-frame", dlg).innerHTML = ""; });

  // ---- the numbers, counted up to their new value ----
  const shown = new WeakMap();
  function count(el, to, fmt) {
    const from = shown.has(el) ? shown.get(el) : 0;
    shown.set(el, to);
    if (still || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = from ? 900 : 1400;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function spark(svg, pts) {
    if (!svg || !pts || pts.length < 2) return;
    const lo = Math.min(...pts), hi = Math.max(...pts), span = hi - lo || 1;
    const xy = pts.map((v, i) => [i * 100 / (pts.length - 1), 28 - (v - lo) / span * 26]);
    const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
    svg.innerHTML = `<path class="area" d="${d} L100 30 L0 30 Z"/><path class="line" d="${d}"/>`;
  }

  // ---- the players' words ----
  const WHERE = { reddit: "Reddit", youtube: "YouTube", facebook: "Facebook" };
  const GAMES = { daytona: "Daytona USA VR", dirtdash: "Dirt Dash VR", pc: "PC", android_daytona: "Daytona USA · Android", android_dirtdash: "Dirt Dash · Android", timecrs2: "Time Crisis II VR", hotd: "House of the Dead VR", rally: "Rally VR", cop: "Cop VR", timecris: "Time Crisis VR", switch: "Switch", android: "Android", linux: "Steam Deck & Linux", mac: "Mac" };
  const cite = (c) => c.platform === "reddit" ? `u/${c.author} · ${c.place}` : c.platform === "youtube" ? `${c.author} · YouTube`
                    : c.platform === "facebook" ? `${c.author} · Facebook` : c.author;
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  let voices = null;
  function setupVoices(comments) {
    const box = $("#quote");
    if (!box || voices) { if (voices) voices.all = comments; return; }
    const only = box.dataset.only;   // a game's own page: its players' words only, no filters
    const all = shuffle(comments.filter((c) => !only || c.game === only));
    if (!all.length) { $("#q-text").textContent = "No comment yet."; return; }
    const st = { all, list: all, i: 0, t0: performance.now(), paused: false, hold: false, game: "all", all_: all };
    voices = st;
    const counts = {};
    all.forEach((c) => { counts[c.game] = (counts[c.game] || 0) + 1; });
    if ($("#filters")) $("#filters").innerHTML = [["all", "All", all.length], ...Object.keys(GAMES).filter((k) => counts[k]).map((k) => [k, GAMES[k], counts[k]])]
      .map(([k, l, n]) => `<button type="button" data-f="${k}" data-game="${k}" aria-pressed="${k === "all"}">${esc(l)}<small>${n}</small></button>`).join("");
    const show = (dir = 1) => {
      const c = st.list[st.i];
      if (!c) return;
      box.classList.add("out");
      setTimeout(() => {
        const q = $("#q-text");
        q.textContent = c.text;
        q.classList.toggle("long", c.text.length > 150);
        const link = c.url ? `<a href="${esc(c.url)}">${esc(cite(c))}</a>` : esc(cite(c));
        $("#q-who").innerHTML = `<span>${link}</span><span class="chip" data-game="${esc(c.game)}">${esc(GAMES[c.game] || "Port0r")}</span>` +
          (c.score > 1 ? `<span class="chip on-dark">${c.score} upvotes</span>` : "");
        $("#q-count").textContent = `${st.i + 1} / ${st.list.length}`;
        box.classList.remove("out");
      }, still ? 0 : 240);
      st.t0 = performance.now();
    };
    const go = (d) => { st.i = (st.i + d + st.list.length) % st.list.length; show(d); };
    if ($("#filters")) $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-f]");
      if (!b) return;
      $$("#filters button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      st.game = b.dataset.f;
      st.list = st.game === "all" ? st.all : st.all.filter((c) => c.game === st.game);
      st.i = 0; show();
    });
    $("#q-next").addEventListener("click", () => go(1));
    $("#q-prev").addEventListener("click", () => go(-1));
    const pauseBtn = $("#q-pause");
    const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
    const PAUSE = pauseBtn.innerHTML;
    pauseBtn.addEventListener("click", () => {
      st.paused = !st.paused;
      pauseBtn.innerHTML = st.paused ? PLAY : PAUSE;
      pauseBtn.setAttribute("aria-label", st.paused ? "Play" : "Pause");
      st.t0 = performance.now() - (st.elapsed || 0);
    });
    // no pause on hover (16/10/2026, Guillaume: « le lecteur de commentaires se bloque tout seul dans le loading »: the
    // mouse resting on the big blue band froze it); the pause button stays, a comment every 6 s
    const DUR = 6000;
    const tick = (t) => {
      if (st.paused || st.hold || document.hidden) st.t0 = t - (st.elapsed || 0);
      st.elapsed = t - st.t0;
      $("#q-track").style.setProperty("--p", Math.min(1, st.elapsed / DUR).toFixed(4));
      if (st.elapsed >= DUR) go(1);
      requestAnimationFrame(tick);
    };
    show();
    requestAnimationFrame(tick);
  }
  // one game's words, in its own block, turning every 7 s (each block a little out of step with the others)
  const said = new Map();
  function setupSaid(comments) {
    $$("[data-said]").forEach((fig, n) => {
      const list = shuffle(comments.filter((c) => c.game === fig.dataset.said && c.text.length <= 220));
      if (!list.length) { fig.hidden = true; return; }
      fig.hidden = false;
      if (said.has(fig)) { said.get(fig).list = list; return; }
      const st = { list, i: 0 };
      said.set(fig, st);
      const put = () => {
        const c = st.list[st.i % st.list.length];
        fig.classList.add("out");
        setTimeout(() => {
          $("q", fig).textContent = c.text;
          $("cite", fig).textContent = cite(c);
          fig.classList.remove("out");
        }, still ? 0 : 350);
      };
      put();
      setTimeout(() => setInterval(() => { if (!document.hidden) { st.i++; put(); } }, 7000), n * 1100);
    });
  }

  // ---- the live numbers ----
  function render(L) {
    const T = L.totals || {}, A = L.day_ago || {}, S = L.series || {}, G = L.games || {};
    $$("[data-n]").forEach((el) => { const v = T[el.dataset.n]; if (v != null) count(el, v, el.closest(".strip") ? short : full); });
    $$(".stat[data-stat]").forEach((box) => {
      const k = box.dataset.stat, v = T[k];
      if (v == null) return;
      count($(".big", box), v, k === "reddit_views" ? short : full);
      const d = v - (A[k] ?? v);
      $(".delta", box).textContent = d > 0 ? `+${full(d)} in 24 h` : "";
      spark($(".spark", box), S[k]);
    });
    $$("[data-g]").forEach((el) => {
      const g = G[el.dataset.g];
      if (!g) return;
      const val = { downloads: g.downloads, views: (g.youtube_views || 0) + (g.reddit_views || 0), comments: g.comments };
      const cells = el.dataset.k ? [el] : $$("[data-k]", el);
      cells.forEach((c) => { const v = val[c.dataset.k]; if (v != null) count(c, v, short); });
    });
    const views = {};
    Object.values(G).forEach((g) => (g.videos || []).forEach((v) => { views[v.id] = v.views; }));
    $$("[data-views]").forEach((el) => { const v = views[el.dataset.views]; el.textContent = v ? `${short(v)} views` : ""; });
    const note = $("#live-note");
    if (note) {
      const when = new Date((L.updated || 0) * 1000);
      note.innerHTML = `Last reading <b>${when.toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</b>, the next one within 30 minutes. ` +
        `Every number per post and per platform: <a class="link" href="/stats/">the stats page</a>.`;
    }
    const comments = (L.comments || []).filter((c) => c.text);
    if (comments.length) { setupVoices(comments); setupSaid(comments); }
    else if ($("#players")) $("#q-text").textContent = "The comments cannot be read right now.";
  }
  function loadLive() {
    if (!$("[data-n], .stat, [data-g], [data-said], #quote")) return;
    (async () => {
      for (const u of LIVE) {
        try { const r = await fetch(u + "?t=" + Date.now(), { cache: "no-store" }); if (r.ok) return await r.json(); } catch (e) { /* the next one */ }
      }
      throw new Error("live.json unreachable");
    })().then(render).catch(() => {
      const note = $("#live-note");
      if (note) note.textContent = "The live numbers cannot be read right now. They come back by themselves.";
    });
  }
  loadLive();
  setInterval(() => { if (!document.hidden) loadLive(); }, 60000);

  // ---- the leaderboards ----
  const row = (rk, nm, sc) => `<li><span class="rk">${rk}</span><span class="nm">${esc(nm)}</span><span class="sc">${sc}</span></li>`;
  const list = (rows, empty) => rows && rows.length ? `<ol>${rows.join("")}</ol>` : `<ol><li class="empty">${esc(empty)}</li></ol>`;
  function boardHtml(d, n) {
    if (d.boards) {   // a race against the clock: Sega Rally's courses, Time Crisis's stages
      const main = d.boards.filter((b) => b.category === (d.boards[0] || {}).category);
      const blocks = main.map((b) => `<div class="tbl"><h4>${esc(b.course)}${b.category && d.game === "srallyc" ? "" : ""}</h4>${list(b.rows.slice(0, n).map((r, i) => row(i + 1, r.name, time(r.seconds))), "No time yet")}</div>`);
      let prize = "";
      if (d.prize) {
        const p = d.prize, ends = new Date(Date.parse(p.first_week_ends) - 1000);
        prize = p.bar ? `<p class="rule">Beat <b>${time(p.bar)}</b> on ${esc(p.course)}${p.category ? ` (${esc(p.category)})` : ""} and the hidden gun is yours.</p>`
          : `<p class="rule">The best ${esc(p.course)} time${p.category ? ` (${esc(p.category)})` : ""} of the week ending <b>${ends.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</b> wins the hidden gun, then whoever beats it.</p>`;
      }
      return prize + (blocks.length ? blocks.join("") : `<div class="tbl">${list([], "No time yet. Be the first.")}</div>`);
    }
    // a score (the gun games): all time, and the hidden gun's rule
    const prize = d.bar ? `<p class="rule">Beat <b>${full(d.bar)}</b> and the hidden gun is yours.</p>`
      : `<p class="rule">The best score of the first week wins the hidden gun, then whoever beats it.</p>`;
    return prize + `<div class="tbl"><h4>All time</h4>${list((d.all_time || []).slice(0, n).map((r, i) => row(i + 1, r.name, full(r.score))), "No score yet")}</div>`;
  }
  function loadBoards() {
    $$(".lbs .lb[data-game]").forEach((box) => {   // the home page's teaser (the leaderboard page draws its own)
      const n = +(box.dataset.top || 3);
      fetch(BOARDS + box.dataset.game + ".json", { cache: "no-store" }).then((r) => r.json()).then((d) => {
        $(".tbls", box).innerHTML = boardHtml(d, n);
      }).catch(() => { $(".tbls", box).innerHTML = `<p class="rule">The board cannot be reached right now.</p>`; });
    });
  }
  // the cards themselves from the bot's index (21/10/2026: a game the bot keeps a board for shows here by itself); the cards
  // written in the page stay if the index cannot be read
  async function boardCards() {
    try {
      const d = await (await fetch(BOARDS + "index.json", { cache: "no-store" })).json();
      const games = (d.games || []).filter((g) => g.publishing);
      if (games.length) $("#lbs").innerHTML = games.map((g) => `<article class="lb" data-game="${esc(g.game)}"><h3>${esc(g.name)}</h3>`
        + `${g.about ? `<p class="rule">${esc(g.about)}</p>` : ""}<div class="tbls"></div></article>`).join("");
    } catch (e) { /* the cards written in the page stay */ }
    loadBoards();
  }
  if ($("#lbs")) { boardCards(); setInterval(() => { if (!document.hidden) loadBoards(); }, 60000); }
})();

// THE HERO'S TEXTS, one after the other over the race (22/10/2026, Guillaume: « un slider avec les dernières news ... à
// la place du texte sur la vidéo de Sega Rally », the news first): every 6.5 s, paused under the pointer or the keyboard and
// while the tab is hidden; still for reduced motion
(() => {
  const box = document.querySelector(".hero .slides");
  if (!box) return;
  const items = [...box.children];
  if (items.length < 2) return;
  let i = 0, timer = null;
  // not while the help card covers the hero (27/10/2026: the slides turned under it, and the first one -- the day's news, the
  // Scud Race beta -- was never seen on a first visit): the first slide waits, the turns start when the card has flown away
  const asking = () => document.documentElement.classList.contains("intro-pending");
  const go = () => { items[i].classList.remove("on"); i = (i + 1) % items.length; items[i].classList.add("on"); };
  const start = () => { if (!timer && !asking() && !matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(go, 6500); };
  const stop = () => { clearInterval(timer); timer = null; };
  box.addEventListener("mouseenter", stop); box.addEventListener("mouseleave", start);
  box.addEventListener("focusin", stop); box.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  if (asking()) {
    const mo = new MutationObserver(() => {
      if (asking()) return;
      mo.disconnect();
      items[i].classList.remove("on"); i = 0; items[0].classList.add("on");
      start();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }
  start();
})();
