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
       animations.js
       ========================================================= */
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroTitle = document.querySelector(".hero-title");
    const revealElements = document.querySelectorAll(".reveal");

    const showElement = function (element) {
      element.classList.add("is-visible");
    };

    if (heroTitle) {
      window.requestAnimationFrame(function () {
        heroTitle.classList.add("is-visible");
      });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach(showElement);
      document.querySelectorAll("[data-stepper]").forEach(showElement);
    } else {
      const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            showElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

      revealElements.forEach(function (element) {
        revealObserver.observe(element);
      });
    }

    /* =========================================================
       counters.js
       ========================================================= */
    const counters = document.querySelectorAll(".counter");

    const formatCounter = function (value, decimals) {
      return value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    };

    const finishCounter = function (counter) {
      const target = Number(counter.dataset.target || 0);
      const decimals = Number(counter.dataset.decimals || 0);
      counter.textContent = formatCounter(target, decimals);
      counter.dataset.counted = "true";
    };

    const countUp = function (counter) {
      if (counter.dataset.counted === "true") return;
      const target = Number(counter.dataset.target || 0);
      const decimals = Number(counter.dataset.decimals || 0);

      if (reduceMotion) {
        finishCounter(counter);
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
          finishCounter(counter);
        }
      };

      window.requestAnimationFrame(tick);
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(finishCounter);
    } else {
      const counterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.45 });

      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    }

    /* =========================================================
       filters.js
       ========================================================= */
    const serviceGrid = document.querySelector("#services-grid");
    const serviceEmpty = document.querySelector("#service-empty");
    const serviceStatus = document.querySelector("#service-filter-status");

    const applyServiceFilter = function (filter, selectedButton) {
      const cards = serviceGrid ? Array.from(serviceGrid.querySelectorAll(".service-card")) : [];
      let visibleCount = 0;

      document.querySelectorAll("[data-filter]").forEach(function (button) {
        const isSelected = button === selectedButton;
        button.classList.toggle("is-active", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });

      cards.forEach(function (card) {
        const categories = (card.dataset.category || "").split(" ");
        const isVisible = filter === "all" || categories.includes(filter);
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (serviceEmpty) serviceEmpty.hidden = visibleCount !== 0;
      if (serviceStatus) {
        const label = selectedButton ? selectedButton.textContent.trim() : "all featured services";
        serviceStatus.textContent = visibleCount + " services shown for " + label;
      }
    };

    const initialFilterButton = document.querySelector("[data-filter].is-active") || document.querySelector("[data-filter]");
    if (initialFilterButton) applyServiceFilter(initialFilterButton.dataset.filter, initialFilterButton);

    const updateTabs = function (tab) {
      const tabName = tab.dataset.updateTab;
      document.querySelectorAll("[data-update-tab]").forEach(function (button) {
        const selected = button === tab;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });

      document.querySelectorAll("[data-update-panel]").forEach(function (panel) {
        const selected = panel.dataset.updatePanel === tabName;
        panel.classList.toggle("is-active", selected);
        panel.hidden = !selected;
      });
    };

    document.addEventListener("click", function (event) {
      const filterButton = event.target.closest("[data-filter]");
      if (filterButton) {
        applyServiceFilter(filterButton.dataset.filter, filterButton);
        return;
      }

      const updateTab = event.target.closest("[data-update-tab]");
      if (updateTab) {
        updateTabs(updateTab);
      }
    });

    const initialUpdateTab = document.querySelector("[data-update-tab].is-active") || document.querySelector("[data-update-tab]");
    if (initialUpdateTab) updateTabs(initialUpdateTab);

    document.addEventListener("keydown", function (event) {
      const currentTab = event.target.closest("[data-update-tab]");
      if (!currentTab || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      const tabs = Array.from(document.querySelectorAll("[data-update-tab]"));
      const currentIndex = tabs.indexOf(currentTab);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;

      event.preventDefault();
      tabs[nextIndex].focus();
      updateTabs(tabs[nextIndex]);
    });

    /* =========================================================
       main.js
       ========================================================= */
    const backToTop = document.querySelector("#back-to-top");
    const main = document.querySelector("#main-content");
    const currentYear = document.querySelector("#current-year");
    const heroSearch = document.querySelector("#hero-service-search") || document.querySelector("#hero-search-input");

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

    if (currentYear) currentYear.textContent = String(new Date().getFullYear());

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

    document.querySelectorAll("[data-focus-search]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (heroSearch) {
          heroSearch.focus();
          heroSearch.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
      });
    });

    document.querySelectorAll("[data-search]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        if (heroSearch) {
          heroSearch.value = chip.dataset.search || "";
          heroSearch.focus();
        }
      });
    });

    const heroForm = document.querySelector(".hero__search") || document.querySelector(".hero-search");
    if (heroForm) {
      heroForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const services = document.querySelector("#featured-services");
        if (services) services.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    }

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

    /* ===== HERO ===== */
    const heroTitleElement = document.querySelector(".hero__title");
    const heroSequence = [
      [document.querySelector(".hero__badge"), 0],
      [heroTitleElement, 80],
      [document.querySelector(".hero__sub"), 520],
      [document.querySelector(".hero__search"), 680],
      [document.querySelector(".hero__popular"), 840]
    ];

    if (heroTitleElement) {
      const words = heroTitleElement.textContent.trim().split(/\s+/);
      heroTitleElement.textContent = "";
      words.forEach(function (word, index) {
        const wordElement = document.createElement("span");
        wordElement.className = "hero-word";
        wordElement.textContent = word;
        wordElement.style.transitionDelay = (index * 40) + "ms";
        heroTitleElement.appendChild(wordElement);
        if (index < words.length - 1) heroTitleElement.appendChild(document.createTextNode(" "));
      });

      if (reduceMotion) {
        heroSequence.forEach(function (entry) {
          if (entry[0]) entry[0].classList.add("is-visible");
        });
      } else {
        heroSequence.forEach(function (entry) {
          if (!entry[0]) return;
          window.setTimeout(function () {
            entry[0].classList.add("is-visible");
          }, entry[1]);
        });
      }
    }

    /* ===== TRACK APPLICATION ===== */
    const trackForm = document.querySelector(".track__form");
    const trackField = document.querySelector(".track__field");
    const trackInput = document.querySelector("#track-ref-input");
    const trackRef = document.querySelector(".track__ref");
    const trackBtn = document.querySelector(".btn-track");

    if (trackForm) {
      trackForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const value = trackInput ? trackInput.value.trim() : "";
        if (!value) {
          if (trackField) trackField.classList.add("is-error");
          if (trackInput) trackInput.focus();
          window.setTimeout(function () {
            if (trackField) trackField.classList.remove("is-error");
          }, 600);
          return;
        }
        if (trackField) trackField.classList.remove("is-error");
        if (trackRef) trackRef.textContent = value;
        if (trackBtn) trackBtn.classList.add("is-loading");
        window.setTimeout(function () {
          if (trackBtn) trackBtn.classList.remove("is-loading");
        }, 900);
      });
    }

    /* ===== FEATURED CITIZEN SERVICES ===== */
    const servicesTabs = document.querySelector(".services__tabs");
    const servicesGridEl = document.querySelector("#servicesGrid");
    const servicesCards = servicesGridEl ? Array.from(servicesGridEl.querySelectorAll(".service-card")) : [];

    const showServiceCards = function (cards) {
      cards.forEach(function (card) {
        card.hidden = false;
        card.classList.remove("is-fading", "is-showing");
        void card.offsetWidth;
        card.classList.add("is-showing");
      });
    };

    const hideServiceCards = function (cards) {
      cards.forEach(function (card) {
        card.classList.add("is-fading");
        window.setTimeout(function () {
          if (card.classList.contains("is-fading")) {
            card.hidden = true;
            card.classList.remove("is-fading");
          }
        }, 220);
      });
    };

    const handleServiceTab = function (tab) {
      const category = tab.dataset.category || "";
      if (servicesTabs) {
        servicesTabs.querySelectorAll(".tab").forEach(function (button) {
          const isActive = button === tab;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-selected", String(isActive));
        });
      }

      const matching = servicesCards.filter(function (card) {
        return (card.dataset.category || "").split(" ").indexOf(category) !== -1;
      });
      const visible = matching.length ? matching : servicesCards;
      const hidden = servicesCards.filter(function (card) {
        return visible.indexOf(card) === -1;
      });

      showServiceCards(visible);
      hideServiceCards(hidden);
    };

    if (servicesTabs) {
      servicesTabs.addEventListener("click", function (event) {
        const tab = event.target.closest(".tab");
        if (tab) handleServiceTab(tab);
      });
    }

    /* ===== STATE SERVICES ===== */
    const stateSelect = document.querySelector(".states__select select");
    const stateCards = document.querySelectorAll(".state-card");

    if (stateSelect) {
      stateSelect.addEventListener("change", function () {
        const value = stateSelect.value;
        const target = Array.from(stateCards).find(function (card) {
          return card.dataset.state === value;
        });
        if (target) {
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
      });
    }

    /* ===== IMPORTANT UPDATES ===== */
    const updatesTabs = document.querySelector(".updates__tabs");
    const updatesListEl = document.querySelector(".updates__list");
    const updateRows = updatesListEl ? Array.from(updatesListEl.querySelectorAll(".update-row")) : [];

    const handleUpdateTab = function (tab) {
      const category = tab.dataset.category || "all";
      if (updatesTabs) {
        updatesTabs.querySelectorAll(".utab").forEach(function (button) {
          const isActive = button === tab;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-selected", String(isActive));
        });
      }

      updateRows.forEach(function (row) {
        const matches = category === "all" || row.dataset.category === category;
        if (matches) {
          row.hidden = false;
          row.classList.remove("is-fading", "is-showing");
          void row.offsetWidth;
          row.classList.add("is-showing");
        } else {
          row.classList.add("is-fading");
          window.setTimeout(function () {
            if (row.classList.contains("is-fading")) {
              row.hidden = true;
              row.classList.remove("is-fading");
            }
          }, 200);
        }
      });
    };

    if (updatesTabs) {
      updatesTabs.addEventListener("click", function (event) {
        const tab = event.target.closest(".utab");
        if (tab) handleUpdateTab(tab);
      });
    }

    /* ===== DPI STATS ===== */
    const dpiRefreshText = document.querySelector(".dpi__refresh-text");
    if (dpiRefreshText) {
      let dpiSeconds = 15;
      window.setInterval(function () {
        dpiSeconds += 1;
        dpiRefreshText.textContent = "Refreshed: " + dpiSeconds + " Seconds ago (Live Data Stream)";
      }, 1000);
    }
  });
})();
