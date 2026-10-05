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

    /* ===== GOVERNMENT OFFICIAL DASHBOARD (SPA) ===== */
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

    const DEFAULT_OFFICIAL = {
      name: "Shri V. Sridhar, IRS",
      role: "official",
      designation: "Joint Commissioner (Grievance)",
      department: "Central Board of Direct Taxes",
      employeeId: "GOI-IRS-2291",
      state: "Delhi NCT",
      loggedInAt: Date.now()
    };

    const storedUser = getUser();
    const currentUser = storedUser && storedUser.role === "official" ? storedUser : DEFAULT_OFFICIAL;

    const initialsOf = function (name) {
      const cleaned = String(name || "").replace(/[,.]/g, " ");
      const parts = cleaned.trim().split(/\s+/).filter(function (part) {
        return part.length > 1 || /[A-Za-z]/.test(part);
      });
      if (!parts.length) return "VS";
      const first = parts[0].charAt(0);
      const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
      return (first + last).toUpperCase();
    };
    const setText = function (id, value) {
      const node = document.getElementById(id);
      if (node && value != null) node.textContent = value;
    };

    const fullName = currentUser.name || DEFAULT_OFFICIAL.name;
    setText("topName", fullName);
    setText("topRole", currentUser.designation || DEFAULT_OFFICIAL.designation);
    setText("topAvatar", initialsOf(fullName));
    setText("welcomeName", fullName);
    setText("welcomeRole", currentUser.designation || DEFAULT_OFFICIAL.designation);
    setText("welcomeDept", currentUser.department || DEFAULT_OFFICIAL.department);

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

    const ofName = document.getElementById("ofName");
    if (ofName) ofName.value = fullName;
    const ofDesignation = document.getElementById("ofDesignation");
    if (ofDesignation) ofDesignation.value = currentUser.designation || DEFAULT_OFFICIAL.designation;
    const ofDepartment = document.getElementById("ofDepartment");
    if (ofDepartment) ofDepartment.value = currentUser.department || DEFAULT_OFFICIAL.department;
    const ofEmployee = document.getElementById("ofEmployee");
    if (ofEmployee) ofEmployee.value = currentUser.employeeId || DEFAULT_OFFICIAL.employeeId;
    const ofState = document.getElementById("ofState");
    if (ofState) ofState.value = currentUser.state || DEFAULT_OFFICIAL.state;

    const officialForm = document.getElementById("officialForm");
    if (officialForm) {
      officialForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const base = getUser() && getUser().role === "official" ? getUser() : Object.assign({}, DEFAULT_OFFICIAL);
        base.name = document.getElementById("ofName").value || base.name;
        base.designation = document.getElementById("ofDesignation").value || base.designation;
        base.department = document.getElementById("ofDepartment").value || base.department;
        base.employeeId = document.getElementById("ofEmployee").value || base.employeeId;
        base.state = document.getElementById("ofState").value || base.state;
        base.role = "official";
        base.loggedInAt = base.loggedInAt || Date.now();
        setUser(base);
        const saved = document.getElementById("officialSaved");
        if (saved) {
          saved.hidden = false;
          window.setTimeout(function () { saved.hidden = true; }, 2600);
        }
        setText("topName", base.name);
        setText("topRole", base.designation);
        setText("topAvatar", initialsOf(base.name));
        setText("welcomeName", base.name);
        setText("welcomeRole", base.designation);
        setText("welcomeDept", base.department);
      });
    }

    const doLogout = function () {
      clearUser();
      window.location.href = "login.html";
    };
    ["logout"].forEach(function (id) {
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

    /* ---------- demo table actions ---------- */
    document.querySelectorAll(".dash [data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        const action = button.dataset.action;
        const row = button.closest("tr");
        if (row && row.cells[4]) {
          const pill = row.cells[4].querySelector(".pill");
          if (pill) {
            if (action === "approve") { pill.className = "pill is-green"; pill.textContent = "Approved"; }
            else if (action === "reject") { pill.className = "pill is-red"; pill.textContent = "Rejected"; }
            else if (action === "return") { pill.className = "pill is-amber"; pill.textContent = "Returned"; }
            else if (action === "escalate") { pill.className = "pill is-red"; pill.textContent = "Escalated"; }
            else if (action === "atr") { pill.className = "pill is-green"; pill.textContent = "ATR Issued"; }
          }
        }
        if (action === "approve") { button.classList.add("is-navy"); button.textContent = "Approved"; }
        if (action === "reject") { button.textContent = "Rejected"; }
      });
    });

    const markAllRead = document.getElementById("markAllRead");
    if (markAllRead) {
      markAllRead.addEventListener("click", function () {
        document.querySelectorAll("#view-notifications .notif").forEach(function (item) {
          item.classList.add("is-read");
        });
      });
    }

    document.querySelectorAll("[data-export]").forEach(function (button) {
      button.addEventListener("click", function () {
        const original = button.textContent;
        button.textContent = "Preparing…";
        window.setTimeout(function () { button.textContent = original; }, 1200);
      });
    });

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
    const hexToRgb = function (hex) {
      const value = hex.replace("#", "");
      return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
      };
    };
    const mixColor = function (a, b, t) {
      const ca = hexToRgb(a);
      const cb = hexToRgb(b);
      const r = Math.round(ca.r + (cb.r - ca.r) * t);
      const g = Math.round(ca.g + (cb.g - ca.g) * t);
      const bl = Math.round(ca.b + (cb.b - ca.b) * t);
      return "rgb(" + r + "," + g + "," + bl + ")";
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

    const renderLineChart = function (container, series, opts) {
      if (!container) return;
      opts = opts || {};
      const W = Math.max(320, container.clientWidth || 600);
      const H = opts.height || 280;
      const pad = { t: 18, r: 18, b: 34, l: 46 };
      const labels = series[0].data.map(function (d) { return d.m; });
      const values = [];
      series.forEach(function (s) { s.data.forEach(function (d) { values.push(d.v); }); });
      const maxV = Math.max.apply(null, values);
      const yMax = Math.max(10, Math.ceil((maxV * 1.15) / 10) * 10);
      const innerW = W - pad.l - pad.r;
      const innerH = H - pad.t - pad.b;
      const stepX = labels.length > 1 ? innerW / (labels.length - 1) : 0;
      const xAt = function (i) { return pad.l + i * stepX; };
      const yAt = function (v) { return pad.t + innerH - (v / yMax) * innerH; };
      const svg = svgTag("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", height: H });
      for (let i = 0; i <= 4; i += 1) {
        const value = yMax * (i / 4);
        const y = yAt(value);
        svg.appendChild(svgTag("line", { x1: pad.l, y1: y, x2: W - pad.r, y2: y, stroke: "#EEF0F3", "stroke-width": "1" }));
        const tick = svgTag("text", { x: pad.l - 10, y: y + 4, "text-anchor": "end", fill: "#94A3B8", "font-size": "11", "font-weight": "700" });
        tick.textContent = String(Math.round(value));
        svg.appendChild(tick);
      }
      series.forEach(function (s) {
        const d = s.data.map(function (pt, i) {
          return (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + " " + yAt(pt.v).toFixed(1);
        }).join(" ");
        svg.appendChild(svgTag("path", { d: d, fill: "none", stroke: s.color, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: "1", class: "chart-line" }));
        s.data.forEach(function (pt, i) {
          svg.appendChild(svgTag("circle", { cx: xAt(i), cy: yAt(pt.v), r: "4", fill: "#fff", stroke: s.color, "stroke-width": "2.5" }));
        });
      });
      labels.forEach(function (label, i) {
        const text = svgTag("text", { x: xAt(i), y: H - 10, "text-anchor": "middle", fill: "#6B7280", "font-size": "11", "font-weight": "700" });
        text.textContent = label;
        svg.appendChild(text);
      });
      labels.forEach(function (label, i) {
        const hit = svgTag("rect", { x: (xAt(i) - stepX / 2).toFixed(1), y: pad.t, width: stepX.toFixed(1), height: innerH, fill: "transparent", class: "chart-hit" });
        hit.dataset.label = label + " · " + series.map(function (s) {
          return s.name + " " + s.data[i].v;
        }).join(" · ");
        svg.appendChild(hit);
      });
      container.innerHTML = "";
      container.appendChild(svg);
      attachTip(container, ".chart-hit");
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
      const pad = { t: 18, r: 18, b: 40, l: 52 };
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
        tick.textContent = opts.format ? opts.format(Math.round(value)) : String(Math.round(value));
        svg.appendChild(tick);
      }
      data.forEach(function (d, i) {
        const cx = pad.l + slot * i + slot / 2;
        const y = yAt(d.v);
        const h = pad.t + innerH - y;
        const rect = svgTag("rect", { x: cx - bw / 2, y: y, width: bw, height: h, rx: "6", fill: baseColor, class: "chart-bar" });
        rect.dataset.label = d.label + " · " + (opts.format ? opts.format(d.v) : d.v);
        svg.appendChild(rect);
        const valueLabel = svgTag("text", { x: cx, y: y - 8, "text-anchor": "middle", fill: "#0B1B33", "font-size": "12", "font-weight": "800" });
        valueLabel.textContent = opts.format ? opts.format(d.v) : String(d.v);
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

    const renderBarsH = function (container, data, opts) {
      if (!container) return;
      opts = opts || {};
      const W = Math.max(320, container.clientWidth || 600);
      const rowH = 42;
      const H = data.length * rowH + 12;
      const labelW = opts.labelW || 128;
      const valueW = 48;
      const trackX = labelW;
      const trackW = W - labelW - valueW;
      const maxV = Math.max.apply(null, data.map(function (d) { return d.v; }));
      const svg = svgTag("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", height: H });
      data.forEach(function (d, i) {
        const cy = 18 + i * rowH;
        const label = svgTag("text", { x: 0, y: cy + 4, fill: "#0B1B33", "font-size": "13", "font-weight": "700" });
        label.textContent = d.label;
        svg.appendChild(label);
        svg.appendChild(svgTag("rect", { x: trackX, y: cy - 7, width: trackW, height: 14, rx: "7", fill: "#EEF0FB" }));
        const t = data.length > 1 ? i / (data.length - 1) : 0;
        const color = mixColor(opts.from || "#B45309", opts.to || "#0A1A33", t);
        const bar = svgTag("rect", { x: trackX, y: cy - 7, width: Math.max(2, (d.v / maxV) * trackW), height: 14, rx: "7", fill: color, class: "chart-hbar-fill" });
        bar.dataset.label = d.label + " · " + d.v;
        svg.appendChild(bar);
        const value = svgTag("text", { x: W - 4, y: cy + 4, "text-anchor": "end", fill: "#0B1B33", "font-size": "13", "font-weight": "800" });
        value.textContent = String(d.v);
        svg.appendChild(value);
      });
      container.innerHTML = "";
      container.appendChild(svg);
      attachTip(container, ".chart-hbar-fill");
    };

    const renderRing = function (container, pct, color, label, size) {
      if (!container) return;
      const dim = size || 132;
      const sw = Math.max(6, dim * 0.11);
      const r = (dim - sw) / 2 - 2;
      const cx = dim / 2;
      const cy = dim / 2;
      const svg = svgTag("svg", { viewBox: "0 0 " + dim + " " + dim, width: dim, height: dim });
      svg.appendChild(svgTag("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: "#EEF0FB", "stroke-width": sw }));
      svg.appendChild(svgTag("circle", {
        cx: cx, cy: cy, r: r, fill: "none", stroke: color, "stroke-width": sw, "stroke-linecap": "round",
        "stroke-dasharray": (pct / 100) + " 1", pathLength: "1",
        transform: "rotate(-90 " + cx + " " + cy + ")", class: "chart-ring-seg"
      }));
      const t1 = svgTag("text", { x: cx, y: cy - 2, "text-anchor": "middle", fill: "#0B1B33", "font-size": String(Math.round(dim * 0.2)), "font-weight": "800" });
      t1.textContent = pct + "%";
      svg.appendChild(t1);
      if (label) {
        const t2 = svgTag("text", { x: cx, y: cy + Math.round(dim * 0.15), "text-anchor": "middle", fill: "#6B7280", "font-size": "12", "font-weight": "700" });
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
      const decimals = parseInt(node.dataset.decimals || "0", 10);
      if (reduceMotion) { node.textContent = target.toFixed(decimals); return; }
      const duration = 900;
      const start = performance.now();
      const step = function (now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    /* ---------- view data ---------- */
    const inflowSeries = [
      { name: "Inflow", color: "#B45309", data: [
        { m: "May", v: 120 }, { m: "Jun", v: 138 }, { m: "Jul", v: 126 },
        { m: "Aug", v: 160 }, { m: "Sep", v: 142 }, { m: "Oct", v: 171 }
      ] },
      { name: "Resolved", color: "#16A34A", data: [
        { m: "May", v: 104 }, { m: "Jun", v: 126 }, { m: "Jul", v: 118 },
        { m: "Aug", v: 149 }, { m: "Sep", v: 135 }, { m: "Oct", v: 158 }
      ] }
    ];
    const monthlySeries = [
      { name: "Volume", color: "#1D4ED8", data: [
        { m: "May", v: 120 }, { m: "Jun", v: 138 }, { m: "Jul", v: 126 },
        { m: "Aug", v: 160 }, { m: "Sep", v: 142 }, { m: "Oct", v: 171 }
      ] }
    ];
    const statusSegments = [
      { label: "Resolved", v: 58, color: "#16A34A" },
      { label: "Under Review", v: 22, color: "#B45309" },
      { label: "In-Progress", v: 14, color: "#1D4ED8" },
      { label: "Escalated", v: 6, color: "#DC2626" }
    ];
    const weekData = [
      { label: "Mon", v: 24 }, { label: "Tue", v: 31 }, { label: "Wed", v: 18 },
      { label: "Thu", v: 27 }, { label: "Fri", v: 33 }, { label: "Sat", v: 12 }
    ];
    const deptData = [
      { label: "Railways", v: 42 }, { label: "Direct Taxes", v: 36 }, { label: "Posts", v: 28 },
      { label: "Telecom", v: 22 }, { label: "Agriculture", v: 18 }
    ];
    const approvalSegments = [
      { label: "Approved", v: 87, color: "#16A34A" },
      { label: "Rejected", v: 13, color: "#DC2626" }
    ];
    const enrollData = [
      { label: "Ayushman", v: 48210 }, { label: "Surya Ghar", v: 19640 },
      { label: "NAPS", v: 12905 }, { label: "PM Kisan", v: 33120 }
    ];
    const deptShareSegments = [
      { label: "Direct Taxes", v: 34, color: "#0A1A33" },
      { label: "Railways", v: 26, color: "#B45309" },
      { label: "Posts", v: 20, color: "#1D4ED8" },
      { label: "Telecom", v: 12, color: "#16A34A" },
      { label: "Agriculture", v: 8, color: "#7C3AED" }
    ];
    const compact = function (value) {
      return value >= 1000 ? (value / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(value);
    };

    const initView = function (name) {
      if (name === "overview") {
        const line = function () { renderLineChart(document.getElementById("chartInflow"), inflowSeries, { height: 280 }); };
        const donut = function () { renderDonut(document.getElementById("chartStatus"), statusSegments, { legend: "legendStatus", centerValue: "312", centerLabel: "Total" }); };
        const bars = function () { renderBars(document.getElementById("chartWeek"), weekData, { color: "#0A1A33", hover: "#1D4ED8" }); };
        const barsH = function () { renderBarsH(document.getElementById("chartDept"), deptData, { from: "#B45309", to: "#0A1A33" }); };
        line(); donut(); bars(); barsH();
        renderRing(document.getElementById("kpiRing"), 94, "#16A34A", "", 56);
        document.querySelectorAll("#view-overview .stat-card__spark").forEach(function (node) {
          renderSparkline(node, String(node.dataset.spark || "").split(",").map(Number));
        });
        document.querySelectorAll("#view-overview .counter").forEach(countUp);
        registerChart(line);
        registerChart(donut);
        registerChart(bars);
        registerChart(barsH);
      } else if (name === "verification") {
        const approval = function () { renderDonut(document.getElementById("chartApproval"), approvalSegments, { legend: "legendApproval", centerValue: "87%", centerLabel: "Approved" }); };
        approval();
        registerChart(approval);
      } else if (name === "enrollments") {
        const enroll = function () { renderBars(document.getElementById("chartEnroll"), enrollData, { color: "#0A1A33", hover: "#1D4ED8", format: compact }); };
        enroll();
        registerChart(enroll);
      } else if (name === "reports") {
        const monthly = function () { renderLineChart(document.getElementById("chartMonthly"), monthlySeries, { height: 280 }); };
        const share = function () { renderDonut(document.getElementById("chartDeptShare"), deptShareSegments, { legend: "legendDeptShare", centerValue: "312", centerLabel: "Cases" }); };
        monthly(); share();
        document.querySelectorAll("#view-reports .counter").forEach(countUp);
        registerChart(monthly);
        registerChart(share);
      }
    };

    /* ---------- hash router ---------- */
    const views = Array.prototype.slice.call(document.querySelectorAll(".view"));
    const navLinks = Array.prototype.slice.call(document.querySelectorAll(".dnav"));
    const viewTitles = {
      overview: "Overview", verification: "Verification Queue", grievances: "Grievance Desk",
      applications: "Application Review", records: "Citizen Records", enrollments: "Scheme Enrollments",
      reports: "Reports & Analytics", notifications: "Notifications", profile: "Profile", settings: "Settings"
    };
    const initedViews = {};
    const viewsRoot = document.getElementById("views");

    const activateView = function (requested, skipScroll) {
      const valid = views.some(function (view) { return view.dataset.view === requested; });
      const target = valid ? requested : "overview";
      views.forEach(function (view) { view.classList.toggle("is-active", view.dataset.view === target); });
      navLinks.forEach(function (link) { link.classList.toggle("is-active", link.dataset.view === target); });
      document.title = (viewTitles[target] || "Official Console") + " | Stackly MeriPehchaan";
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
