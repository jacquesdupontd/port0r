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

  // ---- the header: its video cut for the screen's shape, and the two eyes converging at load ----
  const hero = $("#hero");
  if (hero) {
    const vid = $("video", hero);
    const tall = matchMedia("(max-aspect-ratio: 4/5)").matches;
    const poster = tall ? vid.dataset.tallPoster : vid.dataset.widePoster;
    vid.poster = poster;
    hero.style.setProperty("--focus-y", "58%");   // where the car is, measured on the clip (tools/make_clips.sh)
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

    // ---- the ask, big over the race first (21/10/2026, Guillaume: « en gros dans le header écrit en streaming pour qu'on
    // ne voie que ça, et qui ensuite via une belle animation va se caler là-haut dans le bandeau jaune pour laisser place à
    // la phrase actuelle »): the band's own words stream into a big yellow card, word by word behind a caret, over a dimmed
    // race, the top bar faded; the card then flies into the band and the title comes in.
    // Shown to EVERY visitor, streamed and flown (21/10, Guillaume could not see the first version in his Brave): a page
    // opened in a background tab waits until it is seen; only a click or tap, Escape, or a real scroll down ends it early (the wheel and the touch ended it before, and a
    // trackpad's inertia or a Magic Mouse touched in passing is enough to fire those). Skipped only for a link to an anchor.
    const band = $(".ask-in", hero), big = $(".ask-big", hero);
    if (!(band && big && !location.hash)) document.documentElement.classList.remove("ask-pre");
    if (band && big && !location.hash) {
      const card = $(".ask-card", big), said = $("p", band), head = $("b", said).textContent.trim();
      const rest = said.textContent.trim().slice(head.length).trim();
      const caret = document.createElement("i");
      caret.className = "caret";
      const words = (el, text) => text.split(/\s+/).map((w) => {
        const s = document.createElement("span");
        s.className = "w"; s.textContent = w; el.append(s, " ");
        return s;
      });
      const first = words($(".ask-big-1", big), head), second = words($(".ask-big-2", big), rest);
      first[0].before(caret);
      first[first.length - 1].classList.add("st");
      const thanks = document.createElement("div");
      thanks.className = "ask-thanks";
      thanks.innerHTML = '<b>Thank you</b><svg class="ask-heart" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"/></svg>';
      card.append(thanks);
      const heart = $(".ask-heart", thanks);
      hero.classList.add("asking");
      document.documentElement.classList.add("asking");
      // the card whole in the window, whatever its size (21/10/2026, a phone where it sat at the bottom, cut): every word
      // is laid out from the start (hidden), so the card already has its final size; taller or wider than the window, it
      // shrinks by one factor (--fit, its type and padding), measured again after the reflow, and again on a resize
      const fit = () => {
        big.style.setProperty("--fit", "1");
        const cs = getComputedStyle(big);
        const h = big.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const w = big.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        let k = 1;
        for (let i = 0; i < 6 && (card.offsetHeight > h || card.offsetWidth > w); i++) {   // offset sizes: its entrance's scale aside
          k *= Math.max(.3, Math.min(h / card.offsetHeight, w / card.offsetWidth) * .97);
          big.style.setProperty("--fit", k.toFixed(3));
        }
      };
      fit();
      addEventListener("resize", fit);
      const timers = [], at = (ms, f) => timers.push(setTimeout(f, ms));
      let over = false;
      const onKey = (e) => { if (e.key === "Escape") finish(); };
      const onScroll = () => { if (scrollY > 160) finish(); };
      const finish = () => {
        if (over) return;
        over = true;
        timers.forEach(clearTimeout);
        removeEventListener("pointerdown", finish, true);
        removeEventListener("keydown", onKey, true);
        removeEventListener("scroll", onScroll);
        removeEventListener("resize", fit);
        big.remove();
        hero.classList.replace("asking", "asked");
        document.documentElement.classList.remove("asking", "ask-pre");
      };
      addEventListener("pointerdown", finish, { capture: true, passive: true });
      addEventListener("keydown", onKey, true);
      addEventListener("scroll", onScroll, { passive: true });
      // A browser that asks for reduced motion (Guillaume's own Brave on his desk: « un panneau en gros d'un coup sans aucune
      // animation et il devient la barre en haut d'un coup ») gets the SAME stream and flight, the words only fading in
      // (no blur, no slide, no stereo): the message is the point of the page, and it is one short move.
      const run = () => {
        let t = 450;   // the title's words slower, the sentence's like text arriving
        [...first.map((w) => [w, 190]), ...second.map((w) => [w, 80])].forEach(([w, step]) => {
          at(t, () => { w.classList.add("on"); w.after(caret); });
          t += step;
        });
        t += 1700;   // the whole sentence, held: time to read it
        // then a big THANK YOU, its heart beating faster and faster (Guillaume, 21/10: « ensuite je veux un gros Thank you
        // avec un cœur qui flash de plus en plus vite et là, ça disparaît là-haut »), and at the fastest beat, the flight
        at(t, () => { caret.remove(); card.classList.add("thanks"); });
        t += 420;
        for (const d of [560, 470, 390, 320, 260, 210, 170, 140, 115, 95, 80]) {
          at(t, () => {
            heart.style.setProperty("--beat", d + "ms");
            heart.classList.remove("beat");
            void heart.getBoundingClientRect();   // the same animation, started again
            heart.classList.add("beat");
          });
          t += d;
        }
        at(t, () => {   // the flight: from the card's box to the band's
          const a = card.getBoundingClientRect(), b = band.getBoundingClientRect(), bs = getComputedStyle(band);
          Object.assign(card.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
          card.classList.add("fly");
          card.getBoundingClientRect();   // the start box laid out before the move
          Object.assign(card.style, { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px",
            borderRadius: bs.borderRadius, padding: "0", boxShadow: bs.boxShadow });
        });
        at(t + 820, finish);
      };
      if (!document.hidden) run();
      else document.addEventListener("visibilitychange", function seen() {
        if (document.hidden) return;
        document.removeEventListener("visibilitychange", seen);
        run();
      });
    }
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
  const GAMES = { timecrs2: "Time Crisis II VR", hotd: "House of the Dead VR", rally: "Rally VR", cop: "Cop VR", timecris: "Time Crisis VR", switch: "Switch", android: "Android", linux: "Steam Deck & Linux", mac: "Mac" };
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
      .map(([k, l, n]) => `<button type="button" data-f="${k}" aria-pressed="${k === "all"}">${esc(l)}<small>${n}</small></button>`).join("");
    const show = (dir = 1) => {
      const c = st.list[st.i];
      if (!c) return;
      box.classList.add("out");
      setTimeout(() => {
        const q = $("#q-text");
        q.textContent = c.text;
        q.classList.toggle("long", c.text.length > 150);
        const link = c.url ? `<a href="${esc(c.url)}">${esc(cite(c))}</a>` : esc(cite(c));
        $("#q-who").innerHTML = `<span>${link}</span><span class="chip" style="background:var(--yellow);color:var(--ink)">${esc(GAMES[c.game] || "")}</span>` +
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
  const asking = () => document.documentElement.classList.contains("asking") || document.documentElement.classList.contains("ask-pre");
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
