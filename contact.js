/* port0r.com/contact (16/10/2026, Guillaume: « une page contact protégée contre le spam, qui lie vers contact@port0r.com,
   quelque chose de moderne »). No captcha and no third party: while the visitor writes, a worker proves the browser is not a
   robot (2^18 SHA-256 on average against a challenge from the server, port0r-bot/contact.py), a field nobody sees catches
   form-filling robots, and the address itself is never in the page: it is put together on a real click (isTrusted). */
(() => {
  const API = "https://alloxr.info/port0r/api";
  const $ = (s, r = document) => r.querySelector(s);
  const form = $("#cform");
  if (!form) return;
  const opened = performance.now();
  const ADDR = "3935342e3b392e1a2a35282e6a2874393537";   // the address, each byte XOR 90
  const address = () => ADDR.match(/../g).map((x) => String.fromCharCode(parseInt(x, 16) ^ 90)).join("");

  // ---- the proof of work, in a worker (a plain SHA-256: SubtleCrypto's per-call cost is 20 times the hash) ----
  const WORKER = `
const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,
0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,
0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,
0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,
0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,
0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
const W = new Uint32Array(64);
// the first 32 bits of SHA-256 of the padded message already in dv (nb blocks)
function first32(dv, nb) {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (let o = 0; o < nb * 64; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const x = W[i - 15], y = W[i - 2];
      W[i] = (W[i - 16] + (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + W[i - 7]
        + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10))) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
      const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return h0 >>> 0;
}
// one buffer for every try: the prefix once, the nonce's digits written over it (no allocation in the loop)
function solve(c, bits) {
  const pre = new TextEncoder().encode("p0c:" + c + ":"), m = new Uint8Array(256), dv = new DataView(m.buffer), shift = 32 - bits;
  m.set(pre);
  for (let n = 0; ; n++) {
    const ds = String(n); let l = pre.length;
    for (let i = 0; i < ds.length; i++) m[l++] = ds.charCodeAt(i);
    const nb = (l + 9 + 63) >> 6;
    m.fill(0, l, nb * 64); m[l] = 0x80; dv.setUint32(nb * 64 - 4, l * 8);
    if ((first32(dv, nb) >>> shift) === 0) return String(n);
  }
}
onmessage = (ev) => { const t0 = performance.now(), nonce = solve(ev.data.c, ev.data.bits); postMessage({ nonce, ms: performance.now() - t0 }); };`;
  const led = $(".c-led"), proofText = $("#proof");
  function setProof(state, text) {
    led.className = "c-led " + state;
    proofText.textContent = text;
  }
  let proof = null;
  function prove() {
    setProof("work", "Your browser is proving it is not a robot. No captcha, no tracker.");
    proof = fetch(API + "/contact/challenge", { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("challenge " + r.status); return r.json(); })
      .then(({ c, bits }) => new Promise((resolve, reject) => {
        const url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
        const w = new Worker(url);
        w.onmessage = (e) => { w.terminate(); URL.revokeObjectURL(url); resolve({ c, nonce: e.data.nonce, ms: e.data.ms }); };
        w.onerror = (e) => { w.terminate(); reject(e); };
        w.postMessage({ c, bits });
      }));
    proof.then((p) => setProof("ok", `Proof done in ${p.ms < 1000 ? Math.max(1, Math.round(p.ms)) + " ms" : (p.ms / 1000).toFixed(1) + " s"}. No captcha, no tracker.`),
      () => setProof("", "No captcha, no tracker."));
    return proof;
  }
  // it starts with the first sign of a person (a few hundred milliseconds of work, done before the message is)
  const start = () => { if (!proof) prove(); };
  ["pointerdown", "focusin", "keydown"].forEach((t) => form.addEventListener(t, start, { once: true, passive: true }));

  // ---- the topic: its colour, its help, its placeholder; from the address (contact/#bug) when a link chose it ----
  const HELP = {
    bug: { ph: "Which game and version, which device, what happened, and how to make it happen again.", hint: "bug" },
    wish: { ph: "Which arcade game you would love to stand inside, and why.", hint: "wish" },
    press: { ph: "Who you write or make videos for, and what you need: footage, captures, an interview.", hint: "press" },
    partner: { ph: "Who you are and what you have in mind.", hint: "" },
    other: { ph: "Anything at all.", hint: "" },
  };
  const msg = form.elements.message;
  function topic() { return (form.elements.topic.value || "other"); }
  function showTopic() {
    const t = topic();
    msg.placeholder = HELP[t].ph;
    document.querySelectorAll(".c-hint").forEach((h) => { h.hidden = h.dataset.hint !== HELP[t].hint; });
  }
  const fromHash = location.hash.slice(1);
  if (HELP[fromHash]) form.querySelector(`input[name=topic][value="${fromHash}"]`).checked = true;
  form.addEventListener("change", (e) => { if (e.target.name === "topic") { showTopic(); save(); } });

  // ---- the draft survives a closed tab (this browser only) ----
  const KEY = "port0r-contact-draft";
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ name: form.elements.name.value, email: form.elements.email.value,
        game: form.elements.game.value, message: msg.value, topic: topic() }));
    } catch (_) {}
  }
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (d) {
      for (const k of ["name", "email", "game", "message"]) if (d[k] && !form.elements[k].value) form.elements[k].value = d[k];
      if (d.topic && HELP[d.topic] && !HELP[fromHash]) form.querySelector(`input[name=topic][value="${d.topic}"]`).checked = true;
    }
  } catch (_) {}
  showTopic();
  const count = $(".c-count");
  const counted = () => { count.textContent = `${msg.value.length.toLocaleString("en")} / 5,000`; count.classList.toggle("near", msg.value.length > 4600); };
  counted();
  form.addEventListener("input", (e) => { if (e.target === msg) counted(); e.target.closest(".c-field")?.classList.remove("bad"); save(); });

  // ---- sending ----
  const status = $(".c-status"), go = $(".c-go"), goLabel = go.querySelector("span");
  const EMAIL = /^[^\s@<>"(),;:]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
  function bad(name, text) {
    const f = form.elements[name].closest(".c-field");
    f.classList.add("bad");
    f.querySelector(".c-err").textContent = text;
  }
  function check() {
    form.querySelectorAll(".c-field.bad").forEach((f) => f.classList.remove("bad"));
    const v = (n) => form.elements[n].value.trim();
    const errs = [];
    if (!v("name")) errs.push(["name", "Your name, or what we should call you."]);
    if (!EMAIL.test(v("email"))) errs.push(["email", "An e-mail address we can answer."]);
    if (v("message").length < 10) errs.push(["message", "A few words more, please (10 characters at least)."]);
    errs.forEach(([n, t]) => bad(n, t));
    if (errs.length) form.elements[errs[0][0]].focus();
    return !errs.length;
  }
  function busy(on, label) {
    go.setAttribute("aria-busy", on ? "true" : "false");
    goLabel.textContent = label;
  }
  async function send(retry) {
    const p = await (proof || prove());
    const body = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), topic: topic(),
      game: form.elements.game.value, message: msg.value.trim(), hp: form.elements.website.value,
      ms: Math.round(performance.now() - opened), pow: { c: p.c, nonce: p.nonce } };
    const r = await fetch(API + "/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 409 && !retry) { proof = null; return send(true); }   // the challenge expired or served: a fresh one
    proof = null;
    return { status: r.status, ...j };
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    if (!check()) return;
    busy(true, "Sending");
    try {
      const res = await send(false);
      if (res.ok) return done(res.ref);
      if (res.field) bad(res.field, res.error === "links" ? "Five links at most, please." : "Please check this.");
      status.textContent = res.status === 429 ? "Many messages left from here in the last hour. Try again a little later, or write from your mail app."
        : res.error === "too fast" ? "That was very fast. Take a second, then send again."
        : res.field ? "" : "Something went wrong. Try again, or write from your mail app.";
    } catch (_) {
      status.textContent = "The server could not be reached. Your message is still here: try again, or write from your mail app.";
    } finally {
      busy(false, "Send the message");
    }
  });
  function done(ref) {
    try { localStorage.removeItem(KEY); } catch (_) {}
    const name = form.elements.name.value.trim().split(" ")[0];
    const box = $("#cdone");
    box.querySelector(".ref").textContent = ref;
    box.querySelector(".who").textContent = name ? `Thank you, ${name}.` : "Thank you.";
    form.hidden = true;
    box.hidden = false;
    box.querySelector("h2").focus();
    box.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }
  $("#again").addEventListener("click", () => {
    form.reset(); counted(); showTopic(); setProof("", "No captcha, no tracker.");
    $("#cdone").hidden = true; form.hidden = false; form.elements.name.focus();
  });

  // ---- the address: put together on a real click only ----
  const addr = $(".c-addr"), acts = $(".c-acts");
  $("#reveal").addEventListener("click", (e) => {
    if (!e.isTrusted) return;
    const a = address();
    addr.innerHTML = "";
    const s = document.createElement("span");
    s.className = "on"; s.textContent = a;
    addr.append(s);
    acts.innerHTML = `<button class="btn yellow sm" type="button" id="copy"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span>Copy</span></button>`
      + `<button class="btn white sm" type="button" id="write"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg><span>Open my mail app</span></button>`;
    $("#copy").addEventListener("click", async (ev) => {
      const b = ev.currentTarget;
      try { await navigator.clipboard.writeText(a); } catch (_) {
        const r = document.createRange(); r.selectNodeContents(s); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      }
      b.querySelector("span").textContent = "Copied";
      b.classList.add("copied");
      setTimeout(() => { b.querySelector("span").textContent = "Copy"; b.classList.remove("copied"); }, 2200);
    });
    $("#write").addEventListener("click", (ev) => {
      if (!ev.isTrusted) return;
      const subject = { bug: "Bug report", wish: "Game wish", press: "Press", partner: "Partnership", other: "Hello" }[topic()];
      const game = form.elements.game.value ? form.elements.game.selectedOptions[0].text : "";
      location.href = `mailto:${a}?subject=${encodeURIComponent(`${subject}${game ? " · " + game : ""}`)}${msg.value.trim() ? "&body=" + encodeURIComponent(msg.value.trim()) : ""}`;
    });
    $("#copy").focus();
  });

  // ---- the Discord count, live (the same numbers as the home page) ----
  fetch("/stats/live.json", { cache: "no-store" }).then((r) => r.json()).then((d) => {
    const n = d && d.totals && d.totals.discord;
    if (n) $("#dcount").textContent = `${n.toLocaleString("en")} players`;
  }).catch(() => {});
})();
