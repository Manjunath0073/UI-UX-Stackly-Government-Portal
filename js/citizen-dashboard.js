(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const onReady = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(function () {
    /* =========================================================
       header.js
       ========================================================= */
    const header = document.querySelector("#site-header");
    const primaryNav = document.querySelector("#primary-nav");
    const menuToggle = document.querySelector(".header-menu-toggle");
    const drawerBackdrop = document.querySelector(".header-drawer-backdrop");
    const drawerClose = document.querySelector(".header-drawer-close");
    const languageSelector = document.querySelector("#language-selector");
    const languageMenu = document.querySelector("#language-menu");
    const languageCopy = languageSelector ? languageSelector.querySelector(".language-copy") : null;
    const fontSizeButtons = document.querySelectorAll("[data-font-size]");
    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    let previousFocus = null;
    let drawerCloseTimer = null;

    const getFocusable = function (element) {
      if (!element) return [];
      return Array.from(element.querySelectorAll(focusableSelector));
    };

    const closeLanguageMenu = function () {
      if (!languageSelector || !languageMenu) return;
      languageSelector.setAttribute("aria-expanded", "false");
      languageMenu.hidden = true;
    };

    const toggleLanguageMenu = function () {
      if (!languageSelector || !languageMenu) return;
      const shouldOpen = languageMenu.hidden;
      languageSelector.setAttribute("aria-expanded", String(shouldOpen));
      languageMenu.hidden = !shouldOpen;
    };

    const closeDrawer = function (restoreFocus) {
      if (!primaryNav || !primaryNav.classList.contains("is-open")) return;
      primaryNav.classList.remove("is-open");
      document.body.classList.remove("header-drawer-open");
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open primary navigation");
      }
      if (drawerBackdrop) {
        drawerBackdrop.classList.remove("is-open");
        window.clearTimeout(drawerCloseTimer);
        drawerCloseTimer = window.setTimeout(function () {
          if (!primaryNav.classList.contains("is-open")) drawerBackdrop.hidden = true;
        }, 300);
      }
      if (restoreFocus && previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    };

    const openDrawer = function () {
      if (!primaryNav) return;
      previousFocus = document.activeElement;
      window.clearTimeout(drawerCloseTimer);
      if (drawerBackdrop) {
        drawerBackdrop.hidden = false;
        window.requestAnimationFrame(function () {
          drawerBackdrop.classList.add("is-open");
        });
      }
      primaryNav.classList.add("is-open");
      document.body.classList.add("header-drawer-open");
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close primary navigation");
      }
      const focusable = getFocusable(primaryNav);
      if (focusable[0]) focusable[0].focus();
    };

    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        if (primaryNav && primaryNav.classList.contains("is-open")) {
          closeDrawer(true);
        } else {
          openDrawer();
        }
      });
    }

    if (drawerClose) drawerClose.addEventListener("click", function () { closeDrawer(true); });
    if (drawerBackdrop) drawerBackdrop.addEventListener("click", function () { closeDrawer(true); });

    if (primaryNav) {
      primaryNav.querySelectorAll(".nav-item, .drawer-login").forEach(function (link) {
        link.addEventListener("click", function () {
          closeDrawer(false);
        });
      });
    }

    if (languageSelector) {
      languageSelector.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleLanguageMenu();
      });
    }

    if (languageMenu) {
      languageMenu.querySelectorAll("[data-language]").forEach(function (option) {
        option.addEventListener("click", function () {
          const selectedLanguage = option.dataset.language || "English";
          const nativeLabel = selectedLanguage === "Tamil" ? "(\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD)" : "(\u0939\u093F\u0928\u094D\u0926\u0940)";
          if (languageCopy) {
            languageCopy.children[0].textContent = "Language: " + selectedLanguage;
            languageCopy.children[1].textContent = nativeLabel;
          }
          languageMenu.querySelectorAll("[data-language]").forEach(function (item) {
            item.setAttribute("aria-selected", String(item === option));
          });
          closeLanguageMenu();
          languageSelector.focus();
        });
      });
    }

    const applyFontSize = function (size) {
      const validSizes = ["sm", "md", "lg"];
      const nextSize = validSizes.includes(size) ? size : "md";
      document.documentElement.classList.remove("fs-sm", "fs-md", "fs-lg");
      document.documentElement.classList.add("fs-" + nextSize);
      try {
        window.localStorage.setItem("stackly-font-size", nextSize);
      } catch (error) {
        // Local storage can be unavailable for file:// documents.
      }
    };

    let savedFontSize = "md";
    try {
      savedFontSize = window.localStorage.getItem("stackly-font-size") || "md";
    } catch (error) {
      savedFontSize = "md";
    }
    applyFontSize(savedFontSize);

    fontSizeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFontSize(button.dataset.fontSize);
      });
    });

    const updateHeader = function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
    };

    document.addEventListener("click", function (event) {
      if (languageMenu && !event.target.closest(".language-control")) closeLanguageMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeLanguageMenu();
        closeDrawer(true);
      }

      if (event.key === "Tab" && primaryNav && primaryNav.classList.contains("is-open")) {
        const focusable = getFocusable(primaryNav);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    /* =========================================================
       main.js
       ========================================================= */
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const backToTop = document.querySelector("#back-to-top");
    const main = document.querySelector("#main-content");

    if (main) main.setAttribute("tabindex", "-1");

    const updateBackToTop = function () {
      if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 560);
    };

    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }

    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();

    document.querySelectorAll('a[href="#main-content"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        if (main) {
          main.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
          window.setTimeout(function () {
            main.focus({ preventScroll: true });
          }, reduceMotion ? 0 : 450);
        }
      });
    });

    /* =========================================================
       accessibility controls
       ========================================================= */
    const a11yPanel = document.querySelector("#a11y-panel");
    const a11yTriggers = document.querySelectorAll("[data-a11y-trigger]");
    const setA11yState = function (isOpen) {
      if (a11yPanel) a11yPanel.hidden = !isOpen;
      a11yTriggers.forEach(function (trigger) {
        trigger.setAttribute("aria-expanded", String(isOpen));
        if (!trigger.hasAttribute("aria-controls")) trigger.setAttribute("aria-controls", "a11y-panel");
      });
    };

    a11yTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        const shouldOpen = a11yPanel ? a11yPanel.hidden : false;
        setA11yState(shouldOpen);
      });
    });

    document.querySelectorAll("[data-a11y-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        const action = button.dataset.a11yAction;
        if (action === "contrast") document.body.classList.toggle("is-contrast");
        if (action === "text") document.body.classList.toggle("is-large-text");
        if (action === "reset") document.body.classList.remove("is-contrast", "is-large-text");
      });
    });

    document.addEventListener("click", function (event) {
      if (a11yPanel && !event.target.closest(".accessibility-tools")) {
        setA11yState(false);
      }
    });

    /* ===== CITIZEN DASHBOARD (SPA) ===== */
    const STORE_KEY = "stackly_user";
    const getUser = function () {
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    };
    const setUser = function (object) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(object));
      } catch (error) {
        // localStorage may be unavailable for file:// documents.
      }
    };
    const clearUser = function () {
      try {
        window.localStorage.removeItem(STORE_KEY);
      } catch (error) {
        // ignore
      }
    };

    const DEFAULT_USER = {
      name: "Rohit Kumar",
      role: "citizen",
      aadhaarLast4: "9021",
      abhaId: "91-4820-1928-33",
      state: "Delhi NCT",
      category: "General Citizen",
      email: "",
      loggedInAt: Date.now()
    };

    const currentUser = getUser() || DEFAULT_USER;

    const initialsOf = function (name) {
      const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return "RK";
      const first = parts[0].charAt(0);
      const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
      return (first + last).toUpperCase();
    };
    const roleLabelOf = function (role) {
      return role === "official" ? "Government Official" : "Citizen";
    };
    const maskAadhaar = function (last4) {
      return "XXXX-XXXX-" + String(last4 || "0000");
    };
    const setText = function (id, value) {
      const node = document.getElementById(id);
      if (node && value != null) node.textContent = value;
    };

    const fullName = currentUser.name || DEFAULT_USER.name;
    setText("topName", fullName);
    setText("topRole", roleLabelOf(currentUser.role));
    setText("topAvatar", initialsOf(fullName));
    setText("welcomeName", fullName);
    setText("welcomeRole", roleLabelOf(currentUser.role));
    setText("profInitials", initialsOf(fullName));
    setText("profName", fullName);
    setText("profState", currentUser.state || DEFAULT_USER.state);
    setText("profAadhaar", maskAadhaar(currentUser.aadhaarLast4));
    setText("profAbha", currentUser.abhaId || DEFAULT_USER.abhaId);

    const dateNode = document.getElementById("welcomeDate");
    if (dateNode) {
      try {
        dateNode.textContent = new Date().toLocaleDateString("en-IN", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
      } catch (error) {
        // keep default
      }
    }

    const pfName = document.getElementById("pfName");
    if (pfName) pfName.value = fullName;
    const pfState = document.getElementById("pfState");
    if (pfState && currentUser.state) pfState.value = currentUser.state;
    const pfCategory = document.getElementById("pfCategory");
    if (pfCategory && currentUser.category) pfCategory.value = currentUser.category;
    const pfAbha = document.getElementById("pfAbha");
    if (pfAbha) pfAbha.value = currentUser.abhaId || DEFAULT_USER.abhaId;
    const pfAadhaar = document.getElementById("pfAadhaar");
    if (pfAadhaar) pfAadhaar.value = maskAadhaar(currentUser.aadhaarLast4);

    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const next = getUser() || Object.assign({}, DEFAULT_USER);
        next.name = document.getElementById("pfName").value || next.name;
        next.state = document.getElementById("pfState").value || next.state;
        next.category = document.getElementById("pfCategory").value || next.category;
        next.abhaId = document.getElementById("pfAbha").value || next.abhaId;
        next.role = next.role || "citizen";
        next.loggedInAt = next.loggedInAt || Date.now();
        setUser(next);
        const saved = document.getElementById("profileSaved");
        if (saved) {
          saved.hidden = false;
          window.setTimeout(function () { saved.hidden = true; }, 2600);
        }
        setText("topName", next.name);
        setText("welcomeName", next.name);
        setText("profName", next.name);
        setText("topAvatar", initialsOf(next.name));
        setText("profInitials", initialsOf(next.name));
      });
    }

    const doLogout = function () {
      clearUser();
      window.location.href = "login.html";
    };
    ["logout", "settingsLogout"].forEach(function (id) {
      const node = document.getElementById(id);
      if (node) {
        node.addEventListener("click", function (event) {
          event.preventDefault();
          doLogout();
        });
      }
    });

    const side = document.getElementById("side");
    const burger = document.getElementById("burger");
    const overlay = document.getElementById("dashOverlay");
    const closeSide = function () {
      if (side) side.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    };
    const openSide = function () {
      if (side) side.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      if (burger) burger.setAttribute("aria-expanded", "true");
    };
    if (burger) {
      burger.addEventListener("click", function () {
        if (side && side.classList.contains("is-open")) closeSide(); else openSide();
      });
    }
    if (overlay) overlay.addEventListener("click", closeSide);

    /* ---------- chart utilities ---------- */
    const SVGNS = "http://www.w3.org/2000/svg";
    const svgTag = function (tag, attrs) {
      const node = document.createElementNS(SVGNS, tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
      }
      return node;
    };
    const chartJobs = [];
    const registerChart = function (fn) { chartJobs.push(fn); };
    const drawAll = function () {
      chartJobs.forEach(function (fn) { try { fn(); } catch (error) { /* noop */ } });
    };
    const attachTip = function (container, selector, restore) {
      const tip = document.createElement("div");
      tip.className = "chart-tip";
      container.appendChild(tip);
      container.querySelectorAll(selector).forEach(function (node) {
        node.addEventListener("mouseenter", function () {
          tip.textContent = node.dataset.label || "";
          tip.classList.add("is-on");
        });
        node.addEventListener("mousemove", function (event) {
          const rect = container.getBoundingClientRect();
          tip.style.left = (event.clientX - rect.left) + "px";
          tip.style.top = (event.clientY - rect.top) + "px";
        });
        node.addEventListener("mouseleave", function () {
          tip.classList.remove("is-on");
          if (restore) node.style.fill = restore;
        });
      });
    };

    const renderAreaChart = function (container, data, opts) {
      if (!container) return;
      opts = opts || {};
      const W = Math.max(320, container.clientWidth || 600);
      const H = opts.height || 260;
      const pad = { t: 18, r: 18, b: 34, l: 42 };
      const maxV = Math.max.apply(null, data.map(function (d) { return d.v; }));
      const yMax = Math.max(1, Math.ceil(maxV * 1.2));
      const innerW = W - pad.l - pad.r;
      const innerH = H - pad.t - pad.b;
      const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
      const xAt = function (i) { return pad.l + i * stepX; };
      const yAt = function (v) { return pad.t + innerH - (v / yMax) * innerH; };
      const line = data.map(function (d, i) {
        return (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + " " + yAt(d.v).toFixed(1);
      }).join(" ");
      const area = line + " L" + xAt(data.length - 1).toFixed(1) + " " + (pad.t + innerH) +
        " L" + xAt(0).toFixed(1) + " " + (pad.t + innerH) + " Z";
      const gid = "areaGrad" + Math.random().toString(36).slice(2, 8);
      const svg = svgTag("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", height: H });
      const defs = svgTag("defs");
      const grad = svgTag("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" });
      grad.appendChild(svgTag("stop", { offset: "0%", "stop-color": "#1D4ED8", "stop-opacity": ".32" }));
      grad.appendChild(svgTag("stop", { offset: "100%", "stop-color": "#1D4ED8", "stop-opacity": "0" }));
      defs.appendChild(grad);
      svg.appendChild(defs);
      for (let i = 0; i <= 4; i += 1) {
        const value = yMax * (i / 4);
        const y = yAt(value);
        svg.appendChild(svgTag("line", { x1: pad.l, y1: y, x2: W - pad.r, y2: y, stroke: "#EEF0F3", "stroke-width": "1" }));
        const tick = svgTag("text", { x: pad.l - 10, y: y + 4, "text-anchor": "end", fill: "#94A3B8", "font-size": "11", "font-weight": "700" });
        tick.textContent = String(Math.round(value));
        svg.appendChild(tick);
      }
      svg.appendChild(svgTag("path", { d: area, fill: "url(#" + gid + ")", class: "chart-area" }));
      svg.appendChild(svgTag("path", { d: line, fill: "none", stroke: "#1D4ED8", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: "1", class: "chart-line" }));
      data.forEach(function (d, i) {
        const cx = xAt(i);
        const cy = yAt(d.v);
        const dot = svgTag("circle", { cx: cx, cy: cy, r: "5", fill: "#fff", stroke: "#1D4ED8", "stroke-width": "3", class: "chart-point" });
        dot.dataset.label = d.m + " · " + d.v + " applications";
        svg.appendChild(dot);
        const label = svgTag("text", { x: cx, y: H - 10, "text-anchor": "middle", fill: "#6B7280", "font-size": "11", "font-weight": "700" });
        label.textContent = d.m;
        svg.appendChild(label);
      });
      container.innerHTML = "";
      container.appendChild(svg);
      attachTip(container, ".chart-point");
    };

    const renderDonut = function (container, segments, opts) {
      if (!container) return;
      opts = opts || {};
      const size = opts.size || 200;
      const sw = 26;
      const r = 70;
      const cx = size / 2;
      const cy = size / 2;
      const circ = 2 * Math.PI * r;
      const total = segments.reduce(function (sum, seg) { return sum + seg.v; }, 0) || 1;
      const svg = svgTag("svg", { viewBox: "0 0 " + size + " " + size, width: "100%", height: size });
      let offset = 0;
      segments.forEach(function (seg) {
        const len = (seg.v / total) * circ;
        svg.appendChild(svgTag("circle", {
          cx: cx, cy: cy, r: r, fill: "none", stroke: seg.color, "stroke-width": sw,
          "stroke-dasharray": len + " " + (circ - len), "stroke-dashoffset": (-offset),
          transform: "rotate(-90 " + cx + " " + cy + ")", class: "chart-donut-seg"
        }));
        offset += len;
      });
      const t1 = svgTag("text", { x: cx, y: cy - 2, "text-anchor": "middle", fill: "#0B1B33", "font-size": "26", "font-weight": "800" });
      t1.textContent = opts.centerValue != null ? opts.centerValue : String(total);
      const t2 = svgTag("text", { x: cx, y: cy + 20, "text-anchor": "middle", fill: "#6B7280", "font-size": "12", "font-weight": "700" });
      t2.textContent = opts.centerLabel || "Total";
      svg.appendChild(t1);
      svg.appendChild(t2);
      container.innerHTML = "";
      container.appendChild(svg);
      if (opts.legend) {
        const legend = typeof opts.legend === "string" ? document.getElementById(opts.legend) : opts.legend;
        if (legend) {
          legend.innerHTML = segments.map(function (seg) {
            return '<div class="chart-legend__row"><i style="background:' + seg.color + '"></i>' +
              seg.label + "<strong>" + seg.v + "%</strong></div>";
          }).join("");
        }
      }
    };

    const renderBars = function (container, data, opts) {
      if (!container) return;
      opts = opts || {};
      const W = Math.max(320, container.clientWidth || 600);
      const H = opts.height || 260;
      const pad = { t: 18, r: 18, b: 40, l: 42 };
      const maxV = Math.max.apply(null, data.map(function (d) { return d.v; }));
      const yMax = Math.max(1, Math.ceil(maxV * 1.2));
      const innerW = W - pad.l - pad.r;
      const innerH = H - pad.t - pad.b;
      const slot = innerW / data.length;
      const bw = Math.min(52, slot * 0.55);
      const yAt = function (v) { return pad.t + innerH - (v / yMax) * innerH; };
      const baseColor = opts.color || "#0A1A33";
      const svg = svgTag("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", height: H });
      for (let i = 0; i <= 4; i += 1) {
        const value = yMax * (i / 4);
        const y = yAt(value);
        svg.appendChild(svgTag("line", { x1: pad.l, y1: y, x2: W - pad.r, y2: y, stroke: "#EEF0F3", "stroke-width": "1" }));
        const tick = svgTag("text", { x: pad.l - 10, y: y + 4, "text-anchor": "end", fill: "#94A3B8", "font-size": "11", "font-weight": "700" });
        tick.textContent = String(Math.round(value));
        svg.appendChild(tick);
      }
      data.forEach(function (d, i) {
        const cx = pad.l + slot * i + slot / 2;
        const y = yAt(d.v);
        const h = pad.t + innerH - y;
        const rect = svgTag("rect", { x: cx - bw / 2, y: y, width: bw, height: h, rx: "6", fill: baseColor, class: "chart-bar" });
        rect.dataset.label = d.label + " · " + d.v;
        svg.appendChild(rect);
        const valueLabel = svgTag("text", { x: cx, y: y - 8, "text-anchor": "middle", fill: "#0B1B33", "font-size": "12", "font-weight": "800" });
        valueLabel.textContent = String(d.v);
        svg.appendChild(valueLabel);
        const axisLabel = svgTag("text", { x: cx, y: H - 12, "text-anchor": "middle", fill: "#6B7280", "font-size": "11", "font-weight": "700" });
        axisLabel.textContent = d.label;
        svg.appendChild(axisLabel);
      });
      container.innerHTML = "";
      container.appendChild(svg);
      container.querySelectorAll(".chart-bar").forEach(function (rect) {
        rect.addEventListener("mouseenter", function () { rect.style.fill = opts.hover || "#1D4ED8"; });
      });
      attachTip(container, ".chart-bar", baseColor);
    };

    const renderRing = function (container, pct, color, label) {
      if (!container) return;
      const size = 132;
      const sw = 14;
      const r = (size - sw) / 2 - 4;
      const cx = size / 2;
      const cy = size / 2;
      const svg = svgTag("svg", { viewBox: "0 0 " + size + " " + size, width: "100%", height: size });
      svg.appendChild(svgTag("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: "#EEF0FB", "stroke-width": sw }));
      svg.appendChild(svgTag("circle", {
        cx: cx, cy: cy, r: r, fill: "none", stroke: color, "stroke-width": sw, "stroke-linecap": "round",
        "stroke-dasharray": (pct / 100) + " 1", pathLength: "1",
        transform: "rotate(-90 " + cx + " " + cy + ")", class: "chart-ring-seg"
      }));
      const t1 = svgTag("text", { x: cx, y: cy - 2, "text-anchor": "middle", fill: "#0B1B33", "font-size": "26", "font-weight": "800" });
      t1.textContent = pct + "%";
      svg.appendChild(t1);
      if (label) {
        const t2 = svgTag("text", { x: cx, y: cy + 20, "text-anchor": "middle", fill: "#6B7280", "font-size": "12", "font-weight": "700" });
        t2.textContent = label;
        svg.appendChild(t2);
      }
      container.innerHTML = "";
      container.appendChild(svg);
    };

    const renderSparkline = function (container, values) {
      if (!container || !values.length) return;
      const W = Math.max(80, container.clientWidth || 200);
      const H = 40;
      const pad = 4;
      const maxV = Math.max.apply(null, values);
      const minV = Math.min.apply(null, values);
      const range = (maxV - minV) || 1;
      const stepX = values.length > 1 ? (W - pad * 2) / (values.length - 1) : 0;
      const yAt = function (v) { return pad + (H - pad * 2) - ((v - minV) / range) * (H - pad * 2); };
      const points = values.map(function (v, i) {
        return (pad + i * stepX).toFixed(1) + "," + yAt(v).toFixed(1);
      }).join(" ");
      const svg = svgTag("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", height: H });
      svg.appendChild(svgTag("polyline", { points: points, fill: "none", stroke: "#1D4ED8", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: "1", class: "chart-spark" }));
      container.innerHTML = "";
      container.appendChild(svg);
    };

    const countUp = function (node) {
      const target = parseFloat(node.dataset.target || node.textContent) || 0;
      if (reduceMotion) { node.textContent = String(target); return; }
      const duration = 900;
      const start = performance.now();
      const step = function (now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = String(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    /* ---------- view data ---------- */
    const activityData = [
      { m: "May", v: 4 }, { m: "Jun", v: 6 }, { m: "Jul", v: 5 },
      { m: "Aug", v: 9 }, { m: "Sep", v: 7 }, { m: "Oct", v: 11 }
    ];
    const statusSegments = [
      { label: "Approved", v: 62, color: "#16A34A" },
      { label: "Pending", v: 28, color: "#B45309" },
      { label: "Rejected", v: 10, color: "#DC2626" }
    ];
    const docData = [
      { label: "Aadhaar", v: 6 }, { label: "PAN", v: 5 }, { label: "DL", v: 3 },
      { label: "Degree", v: 2 }, { label: "RC", v: 2 }, { label: "Others", v: 4 }
    ];
    const vaultSegments = [
      { label: "Verified", v: 83, color: "#16A34A" },
      { label: "Pending", v: 17, color: "#B45309" }
    ];
    const spendData = [
      { label: "Jul", v: 500 }, { label: "Aug", v: 750 },
      { label: "Sep", v: 800 }, { label: "Oct", v: 1200 }
    ];
    const payMixSegments = [
      { label: "Fees", v: 46, color: "#1D4ED8" },
      { label: "Taxes", v: 37, color: "#0A1A33" },
      { label: "Other", v: 17, color: "#B45309" }
    ];

    const initView = function (name) {
      if (name === "overview") {
        const area = function () { renderAreaChart(document.getElementById("chartActivity"), activityData); };
        const donut = function () { renderDonut(document.getElementById("chartStatus"), statusSegments, { legend: "legendStatus", centerValue: "42", centerLabel: "Total" }); };
        const bars = function () { renderBars(document.getElementById("chartDocs"), docData, { color: "#0A1A33", hover: "#1D4ED8" }); };
        area(); donut(); bars();
        renderRing(document.getElementById("ringProfile"), 95, "#16A34A", "Complete");
        renderRing(document.getElementById("ringScheme"), 78, "#1D4ED8", "Matched");
        document.querySelectorAll("#view-overview .stat-card__spark").forEach(function (node) {
          renderSparkline(node, String(node.dataset.spark || "").split(",").map(Number));
        });
        document.querySelectorAll("#view-overview .counter").forEach(countUp);
        registerChart(area);
        registerChart(donut);
        registerChart(bars);
      } else if (name === "documents") {
        const vault = function () { renderDonut(document.getElementById("chartVault"), vaultSegments, { legend: "legendVault", centerValue: "83%", centerLabel: "Health" }); };
        vault();
        registerChart(vault);
      } else if (name === "payments") {
        const spend = function () { renderBars(document.getElementById("chartSpend"), spendData, { color: "#0A1A33", hover: "#1D4ED8", height: 240 }); };
        const mix = function () { renderDonut(document.getElementById("chartPayMix"), payMixSegments, { legend: "legendPayMix", centerValue: "₹3.2k", centerLabel: "Total" }); };
        spend(); mix();
        registerChart(spend);
        registerChart(mix);
      } else if (name === "profile") {
        renderRing(document.getElementById("ringProfileBig"), 95, "#16A34A", "Complete");
      }
    };

    /* ---------- hash router ---------- */
    const views = Array.prototype.slice.call(document.querySelectorAll(".view"));
    const navLinks = Array.prototype.slice.call(document.querySelectorAll(".dnav"));
    const viewTitles = {
      overview: "Overview", documents: "My Documents", applications: "Applications",
      schemes: "Eligible Schemes", grievances: "Grievances", appointments: "Appointments",
      payments: "Payments", profile: "Profile", settings: "Settings"
    };
    const initedViews = {};
    const viewsRoot = document.getElementById("views");

    const activateView = function (requested, skipScroll) {
      const valid = views.some(function (view) { return view.dataset.view === requested; });
      const target = valid ? requested : "overview";
      views.forEach(function (view) { view.classList.toggle("is-active", view.dataset.view === target); });
      navLinks.forEach(function (link) { link.classList.toggle("is-active", link.dataset.view === target); });
      document.title = (viewTitles[target] || "Dashboard") + " | Stackly MeriPehchaan";
      if (!skipScroll && viewsRoot) {
        const top = viewsRoot.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
      }
      if (!initedViews[target]) {
        initedViews[target] = true;
        initView(target);
      }
    };

    const route = function (skipScroll) {
      const name = (window.location.hash || "#overview").replace("#", "");
      activateView(name, skipScroll);
    };

    window.addEventListener("hashchange", function () { route(false); });
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () { closeSide(); });
    });

    let resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(drawAll, 200);
    });

    route(true);
  });
})();
