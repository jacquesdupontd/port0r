// port0r.com, the visit counter (21/10/2026). Each page tells Port0r's server it was seen (port0r-bot/visits.py): the page,
// where the visitor came from, the kind of device, how long the page was on screen, and which outside link or video was
// opened. No cookie and nothing stored on the device: the page view's id lives in this page's memory only, and the server
// never writes the IP. What is kept is written out on port0r.com/privacy/ -- change both together.
(() => {
  const API = "https://alloxr.info/port0r/api/hit";
  if (!navigator.sendBeacon) return;
  const q = new URLSearchParams(location.search);
  const base = {
    v: Math.random().toString(36).slice(2, 12),
    p: location.pathname,
    r: document.referrer,
    u: [q.get("utm_source") || (q.has("fbclid") ? "facebook" : ""), q.get("utm_medium") || "", q.get("utm_campaign") || ""].join("|"),
    w: innerWidth,
    l: navigator.language || "",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  };
  const send = (o) => { try { navigator.sendBeacon(API, JSON.stringify({ ...base, ...o })); } catch (e) { /* counting never breaks a page */ } };
  send({ e: "view" });
  // the time on screen: summed while the page is visible, sent each time it is hidden (tab change, app change, closing)
  let since = document.hidden ? 0 : Date.now(), seen = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (since) seen += Date.now() - since;
      since = 0;
      send({ e: "leave", d: Math.round(seen / 1000) });
    } else since = Date.now();
  });
  document.addEventListener("click", (ev) => {
    const t = ev.target instanceof Element ? ev.target : null;
    if (!t) return;
    const a = t.closest("a[href]");
    if (a && a.host && a.host !== location.host) { send({ e: "click", to: a.href }); return; }
    const v = t.closest(".yt[data-id], [data-watch]");
    if (v) send({ e: "play", to: v.dataset.id || v.dataset.watch });
  }, true);
})();
