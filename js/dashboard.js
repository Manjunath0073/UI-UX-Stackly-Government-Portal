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

    /* ===== DASHBOARD — PROFILE BANNER ===== */
    const dprofileCard = document.querySelector(".dprofile__card");
    const dprofileRing = document.querySelector(".dprofile__ring");
    const ringTarget = Number((dprofileRing && dprofileRing.dataset.pct) || 95);

    const revealDprofile = function () {
      if (dprofileCard) dprofileCard.classList.add("is-inview");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealDprofile();
      if (dprofileRing) dprofileRing.style.setProperty("--pct", String(ringTarget));
    } else {
      const dprofileObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      if (dprofileCard) dprofileObserver.observe(dprofileCard);

      if (dprofileRing) {
        const setPct = function (value) {
          dprofileRing.style.setProperty("--pct", String(value));
        };

        const animateRing = function () {
          const start = performance.now();
          const duration = 1200;
          setPct(0);

          const tick = function (now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setPct(ringTarget * eased);
            if (progress < 1) {
              window.requestAnimationFrame(tick);
            }
          };

          window.requestAnimationFrame(tick);
        };

        const ringObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateRing();
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.4 });

        ringObserver.observe(dprofileRing);
      }
    }

    /* ===== DASHBOARD — STAT CARDS ===== */
    const statCards = Array.from(document.querySelectorAll(".stat-card"));

    const revealStatCards = function () {
      statCards.forEach(function (card) {
        card.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealStatCards();
    } else {
      const statCardsObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      statCards.forEach(function (card) {
        statCardsObserver.observe(card);
      });
    }

    const formatCounter = function (value, decimals) {
      return value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    };

    const statCounters = Array.from(document.querySelectorAll(".stat-card__value .counter"));

    const finishStatCounter = function (counter) {
      const target = Number(counter.dataset.target || 0);
      const decimals = Number(counter.dataset.decimals || 0);
      counter.textContent = formatCounter(target, decimals);
      counter.dataset.counted = "true";
    };

    const countUpStat = function (counter) {
      if (counter.dataset.counted === "true") return;
      const target = Number(counter.dataset.target || 0);
      const decimals = Number(counter.dataset.decimals || 0);

      if (reduceMotion) {
        finishStatCounter(counter);
        return;
      }

      const start = performance.now();
      const duration = 900;
      counter.textContent = formatCounter(0, decimals);

      const tick = function (now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = formatCounter(target * eased, decimals);
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          finishStatCounter(counter);
        }
      };

      window.requestAnimationFrame(tick);
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      statCounters.forEach(finishStatCounter);
    } else {
      const statCounterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUpStat(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      statCounters.forEach(function (counter) {
        statCounterObserver.observe(counter);
      });
    }

    /* ===== DASHBOARD — TRACKING TIMELINE ===== */
    const trackingCards = Array.from(document.querySelectorAll(".tracking .tcard"));
    const trackingBars = Array.from(document.querySelectorAll(".tracking .tcard__bar-fill"));

    if (!reduceMotion) {
      trackingBars.forEach(function (bar) {
        bar.style.width = "0";
      });
    }

    const revealTracking = function () {
      trackingCards.forEach(function (card) {
        card.classList.add("is-inview");
        const bar = card.querySelector(".tcard__bar-fill");
        if (bar && bar.dataset.width) {
          bar.style.width = bar.dataset.width + "%";
        }
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealTracking();
    } else {
      const trackingObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const card = entry.target;
            card.classList.add("is-inview");
            const bar = card.querySelector(".tcard__bar-fill");
            if (bar && bar.dataset.width) {
              bar.style.width = bar.dataset.width + "%";
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      trackingCards.forEach(function (card) {
        trackingObserver.observe(card);
      });
    }

    document.querySelectorAll(".tcard [data-copy]").forEach(function (button) {
      button.addEventListener("click", function () {
        const text = button.dataset.copy || "";
        const showCopied = function () {
          button.classList.add("is-copied");
          button.setAttribute("aria-label", "Copied");
          window.setTimeout(function () {
            button.classList.remove("is-copied");
            button.setAttribute("aria-label", "Copy tracking number");
          }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(showCopied).catch(showCopied);
        } else {
          showCopied();
        }
      });
    });

    document.querySelectorAll(".tcard__btn").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });

    /* ===== DASHBOARD — SCHEME RECOMMENDATIONS ===== */
    const schemeCards = Array.from(document.querySelectorAll(".scard"));

    const revealSchemes = function () {
      schemeCards.forEach(function (card) {
        card.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealSchemes();
    } else {
      const schemesObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      schemeCards.forEach(function (card) {
        schemesObserver.observe(card);
      });
    }

    document.querySelectorAll(".scard__btn").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });

    /* ===== DASHBOARD — APPOINTMENTS & QUICK ACTIONS ===== */
    const civicRevealTargets = Array.from(document.querySelectorAll(".civic .appt-card, .civic .qaction"));

    const revealCivic = function () {
      civicRevealTargets.forEach(function (target) {
        target.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealCivic();
    } else {
      const civicObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      civicRevealTargets.forEach(function (target) {
        civicObserver.observe(target);
      });
    }

    document.querySelectorAll(".civic .appt-btn, .civic .qaction, .civic .civic__sync").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });

    /* ===== DASHBOARD — DIGILOCKER PULL BANNER ===== */
    const pullBannerCard = document.querySelector(".pullbanner__card");

    const revealPullBanner = function () {
      if (pullBannerCard) pullBannerCard.classList.add("is-inview");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealPullBanner();
    } else {
      const pullBannerObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      if (pullBannerCard) pullBannerObserver.observe(pullBannerCard);
    }

    const pullBannerButton = document.querySelector(".pullbanner__btn");
    if (pullBannerButton) {
      pullBannerButton.addEventListener("click", function (event) {
        event.preventDefault();
      });
    }
  });
})();