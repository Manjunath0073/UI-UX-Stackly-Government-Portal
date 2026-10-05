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
          const nativeLabel = selectedLanguage === "Tamil" ? "(தமிழ்)" : "(हिन्दी)";
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

    /* ===== GRIEVANCE — HERO ===== */
    const gheroLeft = document.querySelector(".ghero__left");
    const gheroPanel = document.querySelector(".ghero__panel");
    const gheroRevealTargets = [gheroLeft, gheroPanel].filter(Boolean);

    const revealGhero = function () {
      gheroRevealTargets.forEach(function (target) {
        target.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealGhero();
    } else {
      const gheroObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      gheroRevealTargets.forEach(function (target) {
        gheroObserver.observe(target);
      });
    }

    const formatCounter = function (value, decimals) {
      return value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    };

    const gheroCounters = document.querySelectorAll(".ghero__stat .counter");

    const finishGheroCounter = function (counter) {
      const target = Number(counter.dataset.target || 0);
      const decimals = Number(counter.dataset.decimals || 0);
      counter.textContent = formatCounter(target, decimals);
      counter.dataset.counted = "true";
    };

    const countUpGhero = function (counter) {
      if (counter.dataset.counted === "true") return;
      const target = Number(counter.dataset.target || 0);
      const decimals = Number(counter.dataset.decimals || 0);

      if (reduceMotion) {
        finishGheroCounter(counter);
        return;
      }

      const start = performance.now();
      const duration = 1200;
      counter.textContent = formatCounter(0, decimals);

      const tick = function (now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = formatCounter(target * eased, decimals);
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          finishGheroCounter(counter);
        }
      };

      window.requestAnimationFrame(tick);
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      gheroCounters.forEach(finishGheroCounter);
    } else {
      const gheroCounterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUpGhero(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      gheroCounters.forEach(function (counter) {
        gheroCounterObserver.observe(counter);
      });
    }

    /* ===== GRIEVANCE — ACTION CARDS ===== */
    const gactionCards = Array.from(document.querySelectorAll(".gactions .gcard"));

    const revealGactions = function () {
      gactionCards.forEach(function (card) {
        card.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealGactions();
    } else {
      const gactionsObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      gactionCards.forEach(function (card) {
        gactionsObserver.observe(card);
      });
    }

    document.querySelectorAll(".gchip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        chip.classList.toggle("is-active");
      });
    });

    document.querySelectorAll(".gcard button").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });

    /* ===== GRIEVANCE — LIFECYCLE ===== */
    const lifecycleCard = document.querySelector(".lifecycle__card");
    const lifecycleRevealTargets = [lifecycleCard].filter(Boolean);

    const revealLifecycle = function () {
      lifecycleRevealTargets.forEach(function (target) {
        target.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealLifecycle();
    } else {
      const lifecycleObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      lifecycleRevealTargets.forEach(function (target) {
        lifecycleObserver.observe(target);
      });
    }

    /* ===== GRIEVANCE — TRACKER TABLE ===== */
    const trackerCard = document.querySelector(".tracker__card");

    const revealTracker = function () {
      if (trackerCard) trackerCard.classList.add("is-inview");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealTracker();
    } else {
      const trackerObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      if (trackerCard) trackerObserver.observe(trackerCard);
    }

    const exportCsvButton = document.querySelector("[data-export-csv]");
    const trackerTable = document.querySelector(".tracker__table");

    const buildCsv = function () {
      if (!trackerTable) return "";
      const rows = Array.from(trackerTable.querySelectorAll("thead tr, tbody tr"));
      const lines = rows.map(function (row) {
        const cells = Array.from(row.querySelectorAll("th, td"));
        return cells.map(function (cell) {
          const text = (cell.textContent || "").replace(/\s+/g, " ").trim().replace(/"/g, '""');
          return '"' + text + '"';
        }).join(",");
      });
      return lines.join("\r\n");
    };

    if (exportCsvButton && trackerTable) {
      exportCsvButton.addEventListener("click", function () {
        const csv = buildCsv();
        if (!csv) return;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "cpgrams-grievances.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }

    const statusFilter = document.querySelector("[data-status-filter]");
    if (statusFilter) {
      statusFilter.addEventListener("click", function () {
        statusFilter.classList.toggle("is-open");
        statusFilter.setAttribute("aria-expanded", String(statusFilter.classList.contains("is-open")));
      });
    }

    /* ===== GRIEVANCE — STATUTORY NOTE ===== */
    const legalCard = document.querySelector(".legal__card");

    const revealLegal = function () {
      if (legalCard) legalCard.classList.add("is-inview");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealLegal();
    } else {
      const legalObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      if (legalCard) legalObserver.observe(legalCard);
    }
  });
})();