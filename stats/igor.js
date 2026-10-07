/* ═══════════════════════════════════════════════════════════════
   IGOR — Shared JS Framework
   Theme bridge, toast, font loader, utilities.
   All iframe pages import this via <script src="/static/igor.js">
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── THEME BRIDGE ─── */

  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '0,0,0';
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return parseInt(hex.substring(0,2),16) + ',' +
           parseInt(hex.substring(2,4),16) + ',' +
           parseInt(hex.substring(4,6),16);
  }

  // ── Ornements du thème : ne jamais écraser ceux de la page (29/09) ──────────────────────────
  // `[data-part="title"]::before` devient `[data-part="title"]:not([data-pseudo~="before"],
  // [data-pseudo-scan])::before` : l'ornement va seulement là où la page n'en a pas (data-pseudo
  // est mesuré par le vocabulaire des parties, sans le thème). Vécu : un point posé devant chaque
  // titre de section, y compris ceux qui avaient déjà leur icône ou leur propre ::before.
  function gardePseudo(css) {
    return String(css).replace(/(\[data-part\s*[~|^$*]?=\s*["']?[\w-]+["']?\s*\])((?:(?!::?(?:before|after))[^\s,{>+~()])*)(::?)(before|after)\b/g,
      function (m, part, suite, deux, ps) {
        if (/data-pseudo/.test(suite)) return m;
        return part + suite + ':not([data-pseudo~="' + ps + '"],[data-pseudo-scan]' + (ps === 'before' ? ',[data-lead]' : '') + ')' + deux + ps;
      });
  }

  // ── Habillage des composants : règles générées pour les SEULS jetons posés par le thème ────
  var ETAT = ':not(.sel,.selected,.active,.on,.lit,.hero,.open,.current,[aria-selected="true"])';
  var SURF = ':is([data-part="surface"],[data-part="stat"])[data-bg]';
  var HABIT = [
    // [famille, jeton, sélecteur (& = <html> du thème), déclaration]
    ['pages', '--page-bg', '&,& body', 'background:var(--page-bg)!important'],
    ['frame', '--bar-bg', '& [data-part="bar"][data-bg]', 'background-color:var(--bar-bg)'],
    ['frame', '--bar-radius', '& [data-part="bar"][data-bg]', 'border-radius:var(--bar-radius)'],
    ['frame', '--bar-shadow', '& [data-part="bar"][data-bg]', 'box-shadow:var(--bar-shadow)'],
    ['frame', '--bar-backdrop', '& [data-part="bar"][data-bg]', '-webkit-backdrop-filter:var(--bar-backdrop);backdrop-filter:var(--bar-backdrop)'],
    ['frame', '--side-bg', '& [data-part="side"][data-bg]', 'background-color:var(--side-bg)'],
    ['frame', '--side-radius', '& [data-part="side"][data-bg]', 'border-radius:var(--side-radius)'],
    ['surfaces', '--surface-bg', '& [data-part="surface"][data-bg]' + ETAT, 'background-color:var(--surface-bg)'],
    ['surfaces', '--surface-bg-nested', '& [data-part="surface"] [data-part="surface"][data-bg]' + ETAT, 'background-color:var(--surface-bg-nested)'],
    ['surfaces', '--surface-radius', '& ' + SURF, 'border-radius:var(--surface-radius)'],
    ['surfaces', '--surface-shadow', '& ' + SURF, 'box-shadow:var(--surface-shadow);transition:box-shadow .25s ease,transform .25s ease'],
    ['surfaces', '--surface-shadow-hover', '& ' + SURF + ':hover', 'box-shadow:var(--surface-shadow-hover)'],
    ['surfaces', '--surface-backdrop', '& ' + SURF, '-webkit-backdrop-filter:var(--surface-backdrop);backdrop-filter:var(--surface-backdrop)'],
    ['surfaces', '--surface-hover-lift', '&[data-hover="lift"] ' + SURF + ':hover', 'transform:translateY(calc(-1 * max(var(--surface-hover-lift), calc(-1 * var(--surface-hover-lift)))))'],
    ['surfaces', '--row-radius', '& [data-part="row"]', 'border-radius:var(--row-radius)'],
    ['surfaces', '--row-bg-hover', '& [data-part="row"]' + ETAT + ':hover', 'background-color:var(--row-bg-hover)'],
    ['surfaces', '--modal-radius', '& [data-part="modal"]', 'border-radius:var(--modal-radius)'],
    ['surfaces', '--bubble-radius', '& [data-part="bubble"]', 'border-radius:var(--bubble-radius)'],
    ['titles', '--title-font', '& [data-part="title"]', 'font-family:var(--title-font)'],
    ['titles', '--title-weight', '& [data-part="title"]', 'font-weight:var(--title-weight)'],
    ['titles', '--title-case', '& [data-part="title"]', 'text-transform:var(--title-case)'],
    ['titles', '--title-tracking', '& [data-part="title"]', 'letter-spacing:var(--title-tracking)'],
    ['titles', '--title-color', '& [data-part="title"]', 'color:var(--title-color)'],
    ['buttons', '--btn-radius', '& :is([data-part="btn"],[data-part="iconbtn"],[data-part="tab"])', 'border-radius:var(--btn-radius)'],
    ['buttons', '--btn-weight', '& :is([data-part="btn"],[data-part="tab"])', 'font-weight:var(--btn-weight)'],
    ['buttons', '--btn-case', '& :is([data-part="btn"],[data-part="tab"])', 'text-transform:var(--btn-case)'],
    ['buttons', '--btn-tracking', '& :is([data-part="btn"],[data-part="tab"])', 'letter-spacing:var(--btn-tracking)'],
    ['chips', '--chip-radius', '& [data-part="chip"]', 'border-radius:var(--chip-radius)'],
    ['chips', '--chip-case', '& [data-part="chip"]', 'text-transform:var(--chip-case)'],
    ['chips', '--chip-tracking', '& [data-part="chip"]', 'letter-spacing:var(--chip-tracking)'],
    ['chips', '--chip-weight', '& [data-part="chip"]', 'font-weight:var(--chip-weight)'],
    ['fields', '--field-radius', '& [data-part="field"]', 'border-radius:var(--field-radius)'],
    ['fields', '--field-bg', '& [data-part="field"]:not(:focus)', 'background-color:var(--field-bg)'],
    ['icons', '--icon-fill|--icon-weight|--icon-grade', '& .material-symbols-outlined', "font-variation-settings:'FILL' var(--icon-fill,0),'wght' var(--icon-weight,400),'GRAD' var(--icon-grade,0),'opsz' 24"],
    ['media', '--media-radius', '& [data-part="media"]', 'border-radius:var(--media-radius);overflow:hidden'],
    ['media', '--media-filter', '& [data-part="media"]', 'filter:var(--media-filter)'],
    ['motion', '--enter-animation', '@media (prefers-reduced-motion:no-preference){& [data-in]:is([data-part="surface"],[data-part="row"],[data-part="stat"],[data-part="chip"])', 'animation:var(--enter-animation) var(--enter-duration,.55s) var(--enter-ease,cubic-bezier(.2,.8,.2,1)) both;animation-delay:calc(min(var(--i,0),16) * var(--enter-stagger,38ms))']
  ];
  function habillage(poses) {
    if (!poses || !poses.length) return '';
    var ens = {}; poses.forEach(function (k) { ens[k] = 1; });
    var out = ['/* généré par igor.js à partir des jetons `components` du thème */'];
    HABIT.forEach(function (h) {
      if (!h[1].split('|').some(function (k) { return ens[k]; })) return;
      var pre = 'html[data-skin~="' + h[0] + '"]:not([data-tether-island])';
      var media = h[2].indexOf('@media') === 0;
      var sel = media ? h[2].slice(h[2].indexOf('{') + 1) : h[2];
      sel = sel.replace(/&/g, pre);   // pas de split sur ',' : :is(…,…) en contient
      out.push((media ? h[2].slice(0, h[2].indexOf('{') + 1) : '') + sel + '{' + h[3] + '}' + (media ? '}' : ''));
    });
    return out.join('\n');
  }

  function applyThemeBridge(theme, root) {
    if (!theme || !theme.colors) return;
    root = root || document.documentElement;

    var c = theme.colors || {};
    var t = theme.typography || {};
    var br = theme.border_radius || {};
    var bo = theme.borders || {};
    var sh = theme.shadows || {};
    var ef = theme.effects || {};

    var map = {
      // Backgrounds
      '--bg': c['--bg-primary'],
      '--bg-input': c['--bg-primary'],
      '--bg-card': c['--bg-card'],
      '--bg-card-hover': c['--bg-card-hover'],
      '--bg-elevated': c['--bg-elevated'],
      '--bg-secondary': c['--bg-secondary'],
      '--bg-tertiary': c['--bg-tertiary'],
      '--bg-chrome': c['--bg-chrome'],
      '--bg-code': c['--bg-code'],

      // Borders
      '--border': c['--border-color'],
      '--border-color': c['--border-color'],
      '--border-hover': c['--accent-hover'] || c['--accent'],
      '--border-color-hover': c['--border-color-hover'],

      // Text
      '--text': c['--text-primary'],
      '--text-primary': c['--text-primary'],
      '--heading': c['--text-primary'],
      '--text-dim': c['--text-secondary'],
      '--text-secondary': c['--text-secondary'],
      '--subtle': c['--text-muted'],
      '--text-muted': c['--text-muted'],

      // Accent
      '--accent': c['--accent'],
      '--accent-hover': c['--accent-hover'],
      '--accent-bg': c['--accent-bg'],
      '--accent-glow': c['--accent-glow'],
      '--accent2': c['--accent-hover'] || c['--accent'],
      '--green': c['--success'] || c['--accent-hover'] || c['--accent'],

      // Semantic
      '--danger': c['--danger'],
      '--red': c['--danger'],
      '--danger-bg': c['--danger-bg'] || (c['--danger'] ? 'rgba(' + hexToRgb(c['--danger']) + ',0.12)' : null),
      '--warning': c['--warning'],
      '--orange': c['--warning'],
      '--yellow': c['--warning'],
      '--warning-bg': c['--warning-bg'] || (c['--warning'] ? 'rgba(' + hexToRgb(c['--warning']) + ',0.12)' : null),
      '--info': c['--info'],
      '--cyan': c['--info'],
      '--info-bg': c['--info-bg'] || (c['--info'] ? 'rgba(' + hexToRgb(c['--info']) + ',0.12)' : null),
      '--success': c['--success'],

      // Shadows
      '--shadow-sm': sh['--shadow-sm'],
      '--shadow-md': sh['--shadow-md'],
      '--shadow-lg': sh['--shadow-lg'],
      '--shadow-glow': sh['--shadow-glow'],

      // Radius
      '--radius-sm': br['--radius-sm'],
      '--radius-md': br['--radius-md'],
      '--radius-lg': br['--radius-lg'],
      '--radius': br['--radius-md'],

      // Typography
      '--font-family-primary': t['--font-family-primary'],
      '--font-family-mono': t['--font-family-mono'],

      // Transitions / Effects
      '--transition-speed': ef['--transition-speed'],
      '--transition-duration': ef['--transition-speed'],
      '--transition-easing': ef['--transition-easing'],
      '--backdrop-blur': ef['--backdrop-blur'],
      '--card-backdrop': ef['--card-backdrop'],

      // Borders
      '--border-style': bo['--border-style'],
      '--border-width': bo['--border-width'],

      // Primary gradient (buttons) — solid accent, no gradient
      '--primary-gradient': c['--accent'] || null
    };

    // RGB computed values for rgba() usage in templates
    if (c['--bg-primary']) { map['--bg-rgb'] = hexToRgb(c['--bg-primary']); map['--bg-primary-rgb'] = hexToRgb(c['--bg-primary']); }
    if (c['--bg-card']) map['--card-bg-rgb'] = hexToRgb(c['--bg-card']);
    if (c['--accent']) { map['--primary-rgb'] = hexToRgb(c['--accent']); map['--accent-rgb'] = hexToRgb(c['--accent']); }
    if (c['--success']) { map['--secondary-rgb'] = hexToRgb(c['--success']); map['--success-rgb'] = hexToRgb(c['--success']); }
    else if (c['--accent']) map['--secondary-rgb'] = hexToRgb(c['--accent']);
    if (c['--danger']) map['--danger-rgb'] = hexToRgb(c['--danger']);
    if (c['--warning']) map['--warning-rgb'] = hexToRgb(c['--warning']);
    if (c['--info']) map['--info-rgb'] = hexToRgb(c['--info']);

    // Status semantic RGB computations (for rgba() usage in templates)
    var sRun = c['--status-running-color'] || c['--accent'];
    var sDone = c['--status-done-color'] || c['--success'];
    var sErr = c['--status-error-color'] || c['--danger'];
    var sStop = c['--status-stopped-color'] || c['--warning'];
    if (sRun) map['--status-running-rgb'] = hexToRgb(sRun);
    if (sDone) map['--status-done-rgb'] = hexToRgb(sDone);
    if (sErr) map['--status-error-rgb'] = hexToRgb(sErr);
    if (sStop) map['--status-stopped-rgb'] = hexToRgb(sStop);

    // Apply all mapped aliases
    Object.keys(map).forEach(function (k) {
      if (map[k] != null) root.style.setProperty(k, map[k]);
    });

    // Apply ALL raw theme color keys (catches computed vars like --btn-primary-text, --toggle-*, --input-*, etc.)
    Object.keys(c).forEach(function (k) {
      if (c[k] != null) root.style.setProperty(k, c[k]);
    });

    // Auto-detect light/dark from bg-primary luminance and notify Android
    var bgHex = c['--bg-primary'] || c['--bg-card'] || '#000000';
    var bgRgb = hexToRgb(bgHex);
    if (bgRgb) {
      var parts = bgRgb.split(',');
      var r = parseInt(parts[0]) / 255, g = parseInt(parts[1]) / 255, b = parseInt(parts[2]) / 255;
      var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      var isLight = lum > 0.4;
      root.setAttribute('data-theme', isLight ? 'light' : 'dark');
      if (window.IgorNative && window.IgorNative.setThemeMode) {
        window.IgorNative.setThemeMode(isLight ? 'light' : 'dark');
      }
    }

    // Apply ALL typography, border_radius, borders, shadows, effects keys directly
    // + `components` (29/09) : jetons des composants de page (--surface-*, --title-*, --btn-*,
    //   --chip-*, --field-*, --icon-*, --enter-*…), consommés par igor.css « COMPOSANTS THÉMABLES ».
    //   Les jetons du thème précédent sont retirés d'abord (sinon ils survivent au changement).
    (root.getAttribute('data-theme-components') || '').split(' ').forEach(function (k) {
      if (k && k.indexOf('--') === 0) root.style.removeProperty(k);
    });
    var comp = (theme.components && typeof theme.components === 'object') ? theme.components : {};
    var compPoses = Object.keys(comp).filter(function (k) { return k.indexOf('--') === 0 && comp[k] != null; });
    root.setAttribute('data-theme-components', compPoses.join(' '));
    [t, br, bo, sh, ef, comp].forEach(function (section) {
      Object.keys(section).forEach(function (k) {
        if (section[k] != null) root.style.setProperty(k, section[k]);
      });
    });

    // Dynamic font loading
    if (t['--font-family-primary']) loadThemeFont(t['--font-family-primary']);
    if (t['--font-family-mono']) loadThemeFont(t['--font-family-mono']);

    // Îlot Tether (Chat, Fichiers… affichés dans Tether avec ?island=1) : la couche décor et les
    // variantes de mise en page du thème DASHBOARD n'y entrent pas — Tether a son propre thème
    // (palette dérivée + couche css). Vécu 29/09 : 12 ko de décor Studio dans le Chat de Tether.
    var ilotTether = document.documentElement.hasAttribute('data-tether-island') ||
      document.documentElement.classList.contains('tether-mac-island');

    // Custom CSS injection
    var cse = document.getElementById('theme-custom-css');
    if (theme.custom_css && !ilotTether) {
      if (!cse) {
        cse = document.createElement('style');
        cse.id = 'theme-custom-css';
        document.head.appendChild(cse);
      }
      cse.textContent = gardePseudo(theme.custom_css);
    } else if (cse) {
      cse.remove();
    }

    // Habillage des composants (29/09) : une règle n'existe que pour un jeton que le thème POSE ;
    // tout le reste garde le dessin de la page (avant : des valeurs par défaut écrasaient tout).
    var ske = document.getElementById('theme-skin-css');
    var skinTxt = ilotTether ? '' : habillage(compPoses);
    if (skinTxt) {
      if (!ske) { ske = document.createElement('style'); ske.id = 'theme-skin-css'; document.head.appendChild(ske); }
      ske.textContent = skinTxt;
    } else if (ske) { ske.remove(); }

    // States (contrat v2.1) : {"data-density":"compact","data-tasks-layout":"board",...}
    // Les attributs posés par le thème PRÉCÉDENT sont retirés d'abord (29/09) : sans ça, un thème
    // sans variante héritait de la mise en page du thème d'avant.
    var html = document.documentElement;
    (html.getAttribute('data-theme-states') || '').split(' ').forEach(function (k) {
      if (k && /^data-[a-z-]+$/.test(k)) html.removeAttribute(k);
    });
    var poses = [];
    if (theme.states && typeof theme.states === 'object' && !ilotTether) {
      Object.keys(theme.states).forEach(function (k) {
        var v = theme.states[k];
        if (/^data-[a-z-]+$/.test(k) && k !== 'data-theme' && k !== 'data-theme-states') {
          if (v === null || v === false || v === '') html.removeAttribute(k);
          else { html.setAttribute(k, String(v)); poses.push(k); }
        }
      });
    }
    html.setAttribute('data-theme-states', poses.join(' '));

    // Icon library CDN (for non-Material Symbols libraries: fontawesome, phosphor, lucide…)
    var iconLib = theme.icon_library || {};
    if (iconLib.cdn) {
      var existingCdn = document.getElementById('theme-icon-cdn');
      if (!existingCdn) {
        existingCdn = document.createElement('link');
        existingCdn.id = 'theme-icon-cdn';
        existingCdn.rel = 'stylesheet';
        document.head.appendChild(existingCdn);
      }
      existingCdn.href = iconLib.cdn;
    }

    // Icon style (Material Symbols) — support both old `theme.icon_style` and new `theme.icon_library.style`
    var iconStyle = theme.icon_style || iconLib.style;
    if (iconStyle) {
      var link = document.querySelector('link[href*="Material+Symbols"]');
      if (!link && iconStyle !== 'outlined') {
        // Pages iframe : la fonte Outlined vient d'un @import igor.css (pas de <link>).
        // Pour rounded/sharp il faut créer le <link> sinon la famille n'est jamais chargée
        // et les ligatures s'affichent en texte brut.
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'theme-icon-style';
        document.head.appendChild(link);
      }
      if (link) {
        var familyMap = { outlined: 'Material+Symbols+Outlined', rounded: 'Material+Symbols+Rounded', sharp: 'Material+Symbols+Sharp' };
        var newFamily = familyMap[iconStyle] || familyMap.rounded;
        if (!link.href.includes(newFamily)) {
          link.href = 'https://fonts.googleapis.com/css2?family=' + newFamily + ':opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
        }
      }
      root.style.setProperty('--icon-font', iconStyle === 'rounded' ? "'Material Symbols Rounded'" : iconStyle === 'sharp' ? "'Material Symbols Sharp'" : "'Material Symbols Outlined'");
    }

    // Apply layout, textures, animations, effects_3d CSS vars for iframe pages
    var ly = theme.layout || {};
    ['textures', 'animations', 'effects_3d'].forEach(function (section) {
      var s = theme[section] || {};
      Object.keys(s).forEach(function (k) {
        if (s[k] != null) root.style.setProperty(k, s[k]);
      });
    });
    Object.keys(ly).forEach(function (k) {
      if (ly[k] != null) root.style.setProperty(k, ly[k]);
    });

    // Apply content max-width directly on body.style (inline style overrides any hardcoded stylesheet value)
    // Garde document.body : un broadcast theme-weaver-apply peut arriver AVANT que le <body> de
    // l'iframe existe → sinon TypeError (null.style) qui avortait la fin de la fonction (igor-theme-ready).
    var cmw = ly['--content-max-width'];
    if (cmw && document.body) {
      document.body.style.maxWidth = cmw;
      document.body.style.marginLeft = 'auto';
      document.body.style.marginRight = 'auto';
    }

    // Store current theme for later use (includes task_icons)
    window.__igorTheme = theme;

    // Notify pages that need to re-render icons/layout after theme applies
    window.dispatchEvent(new CustomEvent('igor-theme-ready', { detail: theme }));
  }

  /* ─── DYNAMIC FONT LOADER ─── */

  var _loadedFonts = {};

  function loadThemeFont(fontValue) {
    if (!fontValue) return;
    // Extract first font name from CSS font-family string
    var match = fontValue.match(/['"]?([^'",]+)['"]?/);
    if (!match) return;
    var fontName = match[1].trim();

    // Skip system/generic fonts
    var skip = ['system-ui','-apple-system','sans-serif','serif','monospace',
                'Inter','cursive','fantasy','inherit','initial','unset'];
    if (skip.indexOf(fontName) !== -1) return;
    if (_loadedFonts[fontName]) return;
    _loadedFonts[fontName] = true;

    // Build Google Fonts URL
    var url = 'https://fonts.googleapis.com/css2?family=' +
              encodeURIComponent(fontName).replace(/%20/g, '+') +
              ':wght@300;400;500;600;700&display=swap';

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  /* ─── TOAST NOTIFICATIONS ─── */

  function _getToastContainer() {
    var c = document.getElementById('igor-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'igor-toast-container';
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;

    var container = _getToastContainer();
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;

    // Icon per type
    var icons = {
      success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
      error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
      info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };

    toast.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    // Auto-remove
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, duration);

    return toast;
  }

  /* ─── THEME INIT ─── */

  // Aperçu Theme Studio : un ancêtre porte ?tw_preview=<id> -> on affiche CE thème, pas l'actif.
  function _twPreviewId() {
    try {
      var w = window;
      for (var i = 0; i < 6 && w; i++) {
        var p = new URLSearchParams(w.location.search).get('tw_preview');
        if (p) return p;
        if (w === w.parent) break;
        w = w.parent;
      }
    } catch (e) {}
    return '';
  }

  function initTheme() {
    var pv = _twPreviewId();
    fetch(pv ? '/api/themes/' + encodeURIComponent(pv) : '/api/themes/active')
      .then(function (r) { return r.json(); })
      .then(function (theme) {
        if (theme && theme.colors) {
          applyThemeBridge(theme, document.documentElement);
        }
      })
      .catch(function () {});
  }

  // Listen for theme broadcasts from parent (dashboard shell)
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'theme-weaver-apply' && e.data.theme) {
      applyThemeBridge(e.data.theme, document.documentElement);
    }
  });

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  /* ─── CONFIRM DIALOG (replaces native confirm()) ─── */

  function showConfirm(message, onConfirm, onCancel) {
    var bg = document.createElement('div');
    bg.className = 'modal-bg open';
    bg.style.zIndex = '10000';
    bg.innerHTML =
      '<div class="modal" style="max-width:420px">' +
        '<div class="modal-header"><h2>Confirmation</h2></div>' +
        '<div class="modal-body"><p style="color:var(--text-dim);font-size:0.95rem">' + message + '</p></div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" id="_confirm-no">Annuler</button>' +
          '<button class="btn btn-danger" id="_confirm-yes">Confirmer</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bg);

    bg.querySelector('#_confirm-yes').onclick = function () {
      bg.remove();
      if (onConfirm) onConfirm();
    };
    bg.querySelector('#_confirm-no').onclick = function () {
      bg.remove();
      if (onCancel) onCancel();
    };
    bg.addEventListener('click', function (e) {
      if (e.target === bg) { bg.remove(); if (onCancel) onCancel(); }
    });
  }

  /* ─── UTILITIES ─── */

  // Format relative time (e.g. "il y a 3 min")
  function timeAgo(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var now = new Date();
    var sec = Math.floor((now - d) / 1000);
    if (sec < 60) return 'à l\'instant';
    var min = Math.floor(sec / 60);
    if (min < 60) return 'il y a ' + min + ' min';
    var hr = Math.floor(min / 60);
    if (hr < 24) return 'il y a ' + hr + 'h';
    var days = Math.floor(hr / 24);
    if (days < 7) return 'il y a ' + days + 'j';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Copy to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
      showToast('Copié !', 'success', 1500);
    }).catch(function () {
      showToast('Erreur de copie', 'error');
    });
  }

  /* ─── PROMPT ENHANCEMENT ─── */

  function _enhanceEscapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _showEnhancePreview(textarea, original, enhanced) {
    var existing = document.getElementById('enhance-preview-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'enhance-preview-overlay';
    overlay.className = 'enhance-overlay';
    overlay.innerHTML =
      '<div class="enhance-modal">' +
        '<div class="enhance-modal-header">' +
          '<span class="material-symbols-outlined" style="color:var(--accent);font-size:18px">auto_fix_high</span>' +
          '<strong>Prompt amélioré</strong>' +
          '<button class="enhance-close-btn" id="enh-close">✕</button>' +
        '</div>' +
        '<div class="enhance-modal-body">' +
          '<div class="enhance-col">' +
            '<div class="enhance-col-label">Original</div>' +
            '<div class="enhance-original">' + _enhanceEscapeHtml(original) + '</div>' +
          '</div>' +
          '<div class="enhance-col">' +
            '<div class="enhance-col-label">Amélioré — vous pouvez l\'éditer</div>' +
            '<textarea class="enhance-result" id="enh-result-text">' + _enhanceEscapeHtml(enhanced) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="enhance-modal-footer">' +
          '<button class="enhance-btn-cancel" id="enh-cancel">Garder l\'original</button>' +
          '<button class="enhance-btn-apply" id="enh-apply">Utiliser ce prompt ✓</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('enh-close').onclick = function() { overlay.remove(); };
    document.getElementById('enh-cancel').onclick = function() { overlay.remove(); };
    document.getElementById('enh-apply').onclick = function() {
      var result = document.getElementById('enh-result-text').value.trim();
      if (result) textarea.value = result;
      overlay.remove();
      showToast('Prompt mis à jour !', 'success', 1500);
    };
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  }

  // Populate .enhance-model selects dynamically from /api/providers
  // Shows providers as optgroups with their models as options
  var _enhanceProvidersCache = null;
  async function _ensureEnhanceProviders() {
    if (_enhanceProvidersCache) return _enhanceProvidersCache;
    try {
      var r = await fetch('/api/providers');
      var d = await r.json();
      _enhanceProvidersCache = d.providers || [];
      return _enhanceProvidersCache;
    } catch(e) { return []; }
  }

  async function _populateEnhanceSelect(sel) {
    if (sel.dataset.populated) return;
    var providers = await _ensureEnhanceProviders();
    var prev = sel.value;
    while (sel.options.length > 1) sel.remove(1);
    providers.forEach(function(p) {
      if (p.enabled === false) return;
      var models = p.models || [];
      if (models.length === 0) return;
      var grp = document.createElement('optgroup');
      grp.label = p.name || p.id;
      var pid = p.id;
      if (models.length === 1) {
        var o = document.createElement('option');
        o.value = pid;
        o.textContent = models[0].name || models[0].id;
        grp.appendChild(o);
      } else {
        models.forEach(function(m) {
          var o = document.createElement('option');
          o.value = pid + '/' + m.id;
          o.textContent = m.name || m.id;
          grp.appendChild(o);
        });
      }
      sel.appendChild(grp);
    });
    if (prev && Array.from(sel.options).some(function(o) { return o.value === prev; })) sel.value = prev;
    sel.dataset.populated = '1';
  }

  async function enhancePrompt(textareaId, context, btn) {
    var textarea = document.getElementById(textareaId);
    if (!textarea) return;
    var original = textarea.value.trim();
    if (!original) {
      showToast('Écris d\'abord un prompt à améliorer', 'warning');
      return;
    }

    // Find model selector in the same toolbar — value is "agent/model" or "agent" or "auto"
    var wrap = btn.closest('.enhance-toolbar') || btn.parentElement;
    var modelSel = wrap ? wrap.querySelector('.enhance-model') : null;
    var rawVal = modelSel ? modelSel.value : 'auto';
    var agent = rawVal, model = '';
    if (rawVal.indexOf('/') > 0) {
      agent = rawVal.split('/')[0];
      model = rawVal.substring(rawVal.indexOf('/') + 1);
    }

    btn.disabled = true;
    var icon = btn.querySelector('.material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp');
    var origIcon = icon ? icon.textContent : '';
    if (icon) icon.textContent = 'hourglass_top';

    try {
      var payload = {prompt: original, context: context, agent: agent};
      if (model) payload.model = model;
      var res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'amélioration');
      _showEnhancePreview(textarea, original, data.enhanced);
    } catch (err) {
      showToast('Erreur: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      if (icon) icon.textContent = origIcon || 'auto_fix_high';
    }
  }

  /* ─── EXPOSE GLOBALS ─── */

  window.Igor = {
    applyThemeBridge: applyThemeBridge,
    showToast: showToast,
    showConfirm: showConfirm,
    timeAgo: timeAgo,
    escapeHtml: escapeHtml,
    copyToClipboard: copyToClipboard,
    hexToRgb: hexToRgb,
    loadThemeFont: loadThemeFont,
    enhancePrompt: enhancePrompt
  };

  // Legacy compat — some pages call these directly
  window.applyThemeBridge = applyThemeBridge;
  window.hexToRgb = hexToRgb;
  window.showToast = showToast;
  window.enhancePrompt = enhancePrompt;

  // Auto-populate all .enhance-model selects on load
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('select.enhance-model').forEach(_populateEnhanceSelect);
  });
  // Also expose for dynamic content (e.g. task cards rendered after load)
  window._populateEnhanceSelect = _populateEnhanceSelect;

})();

/* ── Liens cliquables dans les rendus markdown (10/09/2026) ───────────────────
   Bug de Guillaume : « je veux pouvoir cliquer directement sur les liens et qu'ils
   s'ouvrent dans une fenêtre / nouvel onglet depuis la lecture de fichiers enrichis
   comme les .md dans notre outil Files, il faut que ça marche partout ».
   marked.parse rend des <a> nus : un lien externe QUITTAIT la page (et, dans l'îlot
   Tether qui affiche cette même page, faisait disparaître l'îlot), et un lien
   RELATIF (« docs/BASHING-SYSTEM.md ») visait la racine du serveur — 404 garanti.
   Ici on hydrate après rendu : externe -> nouvel onglet ; chemin local -> ouvre le
   fichier dans Files (?root=&open=) en nouvel onglet ; ancre -> défilement dans le
   conteneur, car marked ne pose plus d'id sur les titres depuis la v12. */
(function () {
  var RACINES = [ // même table que _CANDIDATE_ROOTS (bridge_mixins/api_files.py), plus long préfixe d'abord
    ['/home/ubuntu/.igor/workspace/media/files', 'media'],
    ['/mnt/storagor/Home_Server_Storage', 'storagor'],
    ['/mnt/storagor', 'storagor_root'],
    ['/var/www/alloxrinfo.mooo.com/nextcloud/data', 'nextcloud'],
    ['/var/www/alloxrinfo.mooo.com', 'web'],
    ['/home/ubuntu/.igor/workspace', 'workspace'],
    ['/home/ubuntu', 'home'],
  ];

  function slug(s) {
    return String(s).toLowerCase().trim()
      .replace(/[^\wÀ-ɏ\s-]/g, '').replace(/\s+/g, '-');
  }

  function normaliser(chemin) {
    var out = [];
    String(chemin).split('/').forEach(function (s) {
      if (!s || s === '.') return;
      if (s === '..') out.pop(); else out.push(s);
    });
    return out.join('/');
  }

  /* Resout un href de markdown en URL ouvrable. Rend '' pour ce qu'il ne faut pas toucher
     (ancre, mailto:, tel:, javascript:). ctx : {root:'workspace', dir:'docs'}. */
  window.resoudreLienMd = function (h, ctx) {
    h = String(h || ''); ctx = ctx || {};
    if (!h || h.charAt(0) === '#') return '';
    if (/^(mailto:|tel:|javascript:|data:)/i.test(h)) return '';
    if ((/^[a-z][a-z0-9+.-]*:\/\//i.test(h) || h.indexOf('//') === 0) && !/^file:\/\//i.test(h)) return h;

    var hash = h.indexOf('#') !== -1 ? h.slice(h.indexOf('#')) : '';
    var brut = h.replace(/^file:\/\//i, '').split('#')[0].split('?')[0];
    try { brut = decodeURIComponent(brut); } catch (err) {}
    if (!brut) return '';
    var root = ctx.root || 'workspace', chemin;
    if (brut.charAt(0) === '/') {
      root = 'rootfs'; chemin = brut.replace(/^\/+/, '');
      for (var k = 0; k < RACINES.length; k++) {
        var pre = RACINES[k][0];
        if (brut === pre || brut.indexOf(pre + '/') === 0) {
          root = RACINES[k][1]; chemin = brut.slice(pre.length).replace(/^\/+/, ''); break;
        }
      }
    } else {
      var dossier = (ctx.dir || '').replace(/\/+$/, '');
      chemin = (dossier ? dossier + '/' : '') + brut;
    }
    chemin = normaliser(chemin);
    if (!chemin) return '';
    return '/files?root=' + encodeURIComponent(root) + '&open=' + encodeURIComponent(chemin) + hash;
  };

  // ctx : {root: 'workspace', dir: 'docs'} — la racine et le dossier du fichier affiché
  window.hydraterLiensMd = function (racine, ctx) {
    if (!racine || !racine.querySelectorAll) return;
    ctx = ctx || {};
    var rootCourant = ctx.root || 'workspace';
    var dossier = (ctx.dir || '').replace(/\/+$/, '');

    racine.querySelectorAll('a[href]').forEach(function (a) {
      if (a.dataset.lienPret) return;
      a.dataset.lienPret = '1';
      var h = a.getAttribute('href') || '';
      if (!h) return;

      if (h.charAt(0) === '#') { // ancre : on défile DANS le conteneur
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var cible = h.slice(1), el = null;
          try { el = racine.querySelector('#' + CSS.escape(cible)); } catch (err) {}
          if (!el) {
            var titres = racine.querySelectorAll('h1,h2,h3,h4,h5,h6');
            for (var i = 0; i < titres.length; i++) {
              if (slug(titres[i].textContent) === slug(cible)) { el = titres[i]; break; }
            }
          }
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return;
      }

      var u = window.resoudreLienMd(h, { root: rootCourant, dir: dossier });
      if (!u) return;
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(u) || u.indexOf('//') === 0) { // externe
        a.target = '_blank'; a.rel = 'noopener noreferrer'; return;
      }
      a.href = u;
      a.target = '_blank'; a.rel = 'noopener';
    });
  };
})();

/* ══ VOCABULAIRE DES PARTIES — pages thémables à fond (29/09/2026) ══════════════════════════════
   Les pages n'ont presque aucune classe en commun (.card, .statcard, .panel2card, .memory-item…),
   donc un thème ne pouvait pas les atteindre de façon cohérente. Ce module pose sur chaque élément
   son RÔLE, déduit de son nom de classe ou de sa balise, sans toucher à son fonctionnement :
     data-part = surface | row | stat | chip | btn | iconbtn | tab | field | title | empty | modal
                 | icon | avatar | media            (contenu)
                 | bar | side | section | main      (charpente de la page : barres d'outils et
                                                     d'en-tête, panneaux latéraux, sections, zone
                                                     principale)
     Un data-part déjà posé par la page n'est jamais écrasé : c'est la voie normale pour les
     pages NEUVES (skill `igor-pages`). La déduction ci-dessous rattrape les pages existantes.
     <html data-page="tasks|chat|domotique|…">   pour cibler une page précise
     --i sur surfaces/lignes/stats/puces = rang parmi ses sœurs de même rôle (cascade d'animation)
     data-in = posé seulement pendant les ~1,5 s qui suivent l'ouverture de la page : l'animation
               d'entrée ne rejoue pas à chaque rafraîchissement d'une liste.
     data-pseudo = « before after » : ::before/::after que la PAGE utilise déjà sur cet élément.
     data-lead = l'élément commence déjà par un repère (icône, SVG, image) : pas d'ornement devant.
     data-bg = surface VISIBLE selon la page seule (fond propre, ou carte dessinée par son trait avec
               une marge intérieure) : le thème ne peint, n'ombre, ne vitrifie et n'arrondit
               qu'elles. data-frame="border" = carte que la page délimitait par un trait.
     page-head (bloc d'en-tête contenant le h1) et head (barre intérieure d'une carte) sont
     reconnus d'eux-mêmes.
   Les règles qui consomment ce vocabulaire sont dans igor.css (« COMPOSANTS THÉMABLES »).
   Ni dans l'îlot Tether (son propre thème), ni dans la coque du dashboard (contrat à part). */
(function () {
  var html = document.documentElement;
  if (html.hasAttribute('data-tether-island') || html.classList.contains('tether-mac-island') ||
      /[?&]island=1/.test(location.search)) return;
  var page = (location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || 'dashboard')
    .toLowerCase().replace(/[^a-z0-9_-]/g, '');
  html.setAttribute('data-page', page);
  if (page === 'dashboard' || page === '') return;

  var BOX_NON = /^(checkbox|inbox|sandbox|textbox|combobox|listbox|flexbox|bbox|lightbox-bg)$/;
  var ROW_NON = /^(input|form|button|btn|action|actions|tool|tools|flex|grid|mbrow|toolbar)-?row$/;
  var CHAMP = /^(text|search|number|email|password|url|tel|date|time|datetime-local|month|week)$/;
  var DEBUT = Date.now(), FENETRE = 1500;

  // Blocs des pages existantes dont le nom ne dit pas le rôle (mesuré le 29/09, page par page).
  var REGISTRE = {
    'agent-memory': { mem: 'surface' }, 'journal': { 'j-entry': 'surface' }, 'inbox': { it: 'row', sec: 'section' },
    'bugs': { carte: 'surface', vign: 'media', rech: 'field' }, 'vault': { rech: 'field', gauche: 'side' },
    'tasks': { detail: 'surface', recherche: 'field' }, 'sante': { resume: 'surface', trace: 'surface' },
    'domotique': { form: 'surface', scene: 'row', modeseg: 'bar' }, 'career': { go: 'section', pan: 'side' },
    'mission-control': { 'mc-sidebar': 'side' }, 'chat': { 'msg-bubble': 'bubble', 'input-bar': 'bar' }
  };
  var REG = REGISTRE[page] || {};
  function roleClasse(c) {
    if (REG[c]) return REG[c];
    if (/(^|-)empty(-state)?$/.test(c)) return 'empty';
    if (/^(stat|stats|kpi|metric)(-?(card|box|chip|pill|item|tile))?$/.test(c) || /-(stat|kpi|metric)$/.test(c)) return 'stat';
    if (/(modal|dialog|sheet|modalbox|popover|drawer)$/.test(c) && !/(bg|backdrop|overlay|wrap)$/.test(c)) return 'modal';
    if (/(top-?bar|tool-?bar|header|head|filters?-?bar|stats-?bar|tab-?bar|seg-?bar|bc-?bar|act-?bar|status-?bar|nav-?bar|topbar|tabs)$/.test(c) && !/^(card|panel|modal|table|th|col|sidebar)-?head(er)?$/.test(c)) return 'bar';
    if (/(^|-)(sidebar|side|aside)$/.test(c)) return 'side';
    if (/(card|panel|box|tile|carte|fiche|tuile|bloc|panneau)$/.test(c) && !BOX_NON.test(c)) return 'surface';
    if (/(thumb|thumbnail|vignette|preview-img|cover)$/.test(c)) return 'media';
    if (/(row|item|entry|ligne)$/.test(c) && !ROW_NON.test(c)) return 'row';
    if (/(^|-)(section|zone|group)$/.test(c)) return 'section';
    if (/(^|-)(main|main-area|content|contenu)$/.test(c)) return 'main';
    if (/(^|-)tab$/.test(c)) return 'tab';
    if (/(chip|badge|pill|tag|pastille|puce|etiquette)$/.test(c)) return 'chip';
    if (/avatar$/.test(c)) return 'avatar';
    if (/(^|-)(section|sec|zone|group|block)-?title$/.test(c)) return 'title';
    return null;
  }
  var TETE = /(^|-)(header|head|tete|top|top-?bar|topbar|bar|titlebar|title-bar|hdr)$/;
  function role(el) {
    var t = el.tagName;
    // Un bloc d'en-tête qui contient LE h1 de la page = l'en-tête de page, pas une barre d'outils
    // (vécu 29/09 : `.page-header` de Tasks lu comme « bar » -> un bandeau de fond derrière le titre).
    if ((t === 'HEADER' || [].some.call(el.classList, function (c) { return TETE.test(c.toLowerCase()); })) &&
        el.querySelector('h1') && !el.closest('[data-part="page-head"]')) return 'page-head';
    if (t === 'INPUT') return CHAMP.test(el.type || 'text') ? 'field' : null;
    if (t === 'SELECT' || t === 'TEXTAREA') return 'field';
    if (t === 'DIALOG') return 'modal';
    var cl = el.classList;
    if (cl.contains('material-symbols-outlined') || cl.contains('material-symbols-rounded') || cl.contains('material-icons')) return 'icon';
    if (el.getAttribute('role') === 'tab') return 'tab';
    for (var i = 0; i < cl.length; i++) {
      var r = roleClasse(cl[i].toLowerCase());
      if (r) return r;
    }
    if (t === 'BUTTON' || /(^|\s)(btn|button)(-|\s|$)|-(btn|button)(\s|$)/.test(el.className || '')) {
      var txt = (el.textContent || '').replace(/\s+/g, '');
      var ico = el.querySelector('.material-symbols-outlined,.material-icons,svg');
      return (ico && txt.length <= (ico.textContent || '').replace(/\s+/g, '').length + 1) ? 'iconbtn' : 'btn';
    }
    if (t === 'H2' || t === 'H3') return 'title';
    if (t === 'MAIN') return 'main';
    if (t === 'ASIDE') return 'side';
    if (t === 'SECTION') return 'section';
    if (t === 'HEADER') return 'bar';
    return null;
  }
  var RANG = { surface: 1, row: 1, stat: 1, chip: 1 };
  // Rôles sur lesquels un thème pose volontiers des ornements (::before / ::after). On note ceux
  // que la PAGE utilise déjà (data-pseudo="before after"), mesurés SANS le thème : igor.js
  // réécrit alors les ornements du thème pour qu'ils les évitent (voir gardePseudo).
  var ORNE = { surface: 1, row: 1, stat: 1, chip: 1, title: 1, bar: 1, head: 1, section: 1, 'page-head': 1, side: 1, tab: 1, btn: 1 };
  var aSonder = [];
  var FOND = { surface: 1, stat: 1, bar: 1, side: 1, 'page-head': 1, head: 1, section: 1 };
  function sonderPseudos() {
    var lot = aSonder; aSonder = [];
    if (!lot.length) return;
    // data-pseudo-scan exclut ces éléments des ornements du thème (sélecteurs réécrits) : on lit
    // donc ce que la page seule y met, sans toucher au style du reste du document.
    for (var i = 0; i < lot.length; i++) lot[i].setAttribute('data-pseudo-scan', '');
    for (var j = 0; j < lot.length; j++) {
      var el = lot[j], v = [];
      for (var k = 0; k < 2; k++) {
        var ps = k ? 'after' : 'before', c = getComputedStyle(el, '::' + ps).content;
        if (c && c !== 'none' && c !== 'normal') v.push(ps);
      }
      if (v.length) el.setAttribute('data-pseudo', v.join(' '));
      // déjà une SURFACE visible (fond ou image de fond, selon la page seule) -> data-bg. Le thème ne
      // donne fond, ombre, verre et coins qu'à celles-là : une enveloppe de mise en page
      // transparente, dessinée sans marge intérieure, n'est jamais transformée en boîte (vécu 29/09).
      if (FOND[el.getAttribute('data-part')]) {
        var cs = getComputedStyle(el), bg = cs.backgroundColor;
        var propre = (bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)) || cs.backgroundImage !== 'none';
        // Bordure DÉCLARÉE par la page (on remet un instant les jetons de bordure sur l'élément :
        // le thème ou le défaut de la maison les mettent à 0). Une carte dessinée seulement par
        // son trait n'a plus rien pour la délimiter sans bordure -> data-frame="border".
        var st = el.style, aW = st.getPropertyValue('--border-width'), aS = st.getPropertyValue('--border-style');
        var aT = st.getPropertyValue('transition'), aTP = st.getPropertyPriority('transition');
        st.setProperty('transition', 'none', 'important');   // sinon la bordure « s'anime » depuis 0 et se lit 0
        st.setProperty('--border-width', '1px'); st.setProperty('--border-style', 'solid');
        var cs2 = getComputedStyle(el);
        var trait = ['Top', 'Right', 'Bottom', 'Left'].filter(function (c) {
          return parseFloat(cs2['border' + c + 'Width']) > 0 && cs2['border' + c + 'Style'] !== 'none';
        }).length >= 3;
        if (aW) st.setProperty('--border-width', aW); else st.removeProperty('--border-width');
        if (aS) st.setProperty('--border-style', aS); else st.removeProperty('--border-style');
        if (aT) st.setProperty('transition', aT, aTP); else st.removeProperty('transition');
        var marge = parseFloat(cs.paddingLeft) >= 8 && parseFloat(cs.paddingRight) >= 8;
        if (propre || (trait && marge)) el.setAttribute('data-bg', '');
        if (trait && !propre && marge) el.setAttribute('data-frame', 'border');
      }
      // commence déjà par un repère visuel (icône, SVG, image, puce) -> data-lead
      var f = el.firstElementChild, avant = f ? '' : null;
      if (f) { for (var n = el.firstChild; n && n !== f; n = n.nextSibling) avant += n.textContent || ''; }
      if (f && !avant.trim() && (/material-(symbols|icons)|(^|\s)(ico|icon|dot|puce)(\s|$)/.test(f.className && f.className.baseVal !== undefined ? f.className.baseVal : f.className) || /^(SVG|IMG|svg|img)$/.test(f.tagName))) el.setAttribute('data-lead', '');
    }
    for (var m = 0; m < lot.length; m++) lot[m].removeAttribute('data-pseudo-scan');
  }
  function poser(el) {
    if (el.nodeType !== 1 || el.namespaceURI !== 'http://www.w3.org/1999/xhtml' || el.hasAttribute('data-part')) return;
    var r = role(el);
    if (!r) return;
    // Une « barre » DANS une carte, une ligne, une fenêtre ou un panneau = son en-tête intérieur :
    // rôle `head`, jamais habillé comme la charpente de la page.
    if (r === 'bar' && el.parentElement && el.parentElement.closest('[data-part="surface"],[data-part="row"],[data-part="modal"],[data-part="stat"],[data-part="side"]')) r = 'head';
    el.setAttribute('data-part', r);
    if (ORNE[r]) aSonder.push(el);
    if (RANG[r]) {
      var n = 0, s = el.previousElementSibling;
      while (s && n < 24) { if (s.getAttribute('data-part') === r) n++; s = s.previousElementSibling; }
      el.style.setProperty('--i', n);
      if (Date.now() - DEBUT < FENETRE) el.setAttribute('data-in', '');
    }
  }
  function balayer(racine) {
    if (!racine || racine.nodeType !== 1) return;
    poser(racine);
    var tous = racine.getElementsByTagName('*');
    for (var i = 0; i < tous.length; i++) poser(tous[i]);
    sonderPseudos();
    emplacementTete();
  }
  // Toute page a son emplacement d'illustration au-dessus de son en-tête, même si son markup ne
  // l'a pas prévu (bloc vide et caché tant qu'un thème ne l'habille pas) : sans lui, la signature
  // d'un thème (bandeau, frise) manquait sur Mémoire des agents, Settings… (29/09).
  function emplacementTete() {
    if (document.querySelector('[data-slot="page-hero"]')) return;
    var t = document.querySelector('[data-part="page-head"]');
    if (!t || !t.parentNode) return;
    var d = document.createElement('div');
    d.className = 'page-slot'; d.setAttribute('data-slot', 'page-hero'); d.setAttribute('data-auto', '');
    t.parentNode.insertBefore(d, t);
  }
  var file = [], prevu = false;
  function vider() {
    prevu = false;
    var lot = file; file = [];
    for (var i = 0; i < lot.length; i++) if (lot[i].isConnected) balayer(lot[i]);
  }
  function demarrer() {
    balayer(document.body);
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var a = muts[i].addedNodes;
        for (var j = 0; j < a.length; j++) if (a[j].nodeType === 1) file.push(a[j]);
      }
      if (file.length && !prevu) { prevu = true; requestAnimationFrame(vider); }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) demarrer(); else document.addEventListener('DOMContentLoaded', demarrer);
  window.IgorParts = { balayer: balayer, role: role };
})();
