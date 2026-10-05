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

    /* ===== DIGILOCKER HERO ===== */
    const diliOpen = document.querySelector(".btn-dili");
    if (diliOpen) {
      diliOpen.addEventListener("click", function () {
        document.documentElement.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    }

    /* ===== MY ISSUED DOCUMENTS ===== */
    const docFilter = document.querySelector("#mydocs-filter");
    const docCards = Array.from(document.querySelectorAll(".doc-card"));

    const applyDocFilter = function () {
      const term = (docFilter.value || "").trim().toLowerCase();
      docCards.forEach(function (card) {
        const haystack = (card.textContent || "").toLowerCase();
        card.style.display = !term || haystack.indexOf(term) !== -1 ? "" : "none";
      });
    };

    if (docFilter) {
      docFilter.addEventListener("input", applyDocFilter);
    }

    /* ===== DIGILOCKER DRIVE ===== */
    const driveDrop = document.querySelector(".drive__drop");
    const driveInput = driveDrop ? driveDrop.querySelector("input[type='file']") : null;
    const driveList = document.querySelector(".drive__files");

    const formatFileSize = function (bytes) {
      if (!bytes) return "0 KB";
      if (bytes < 1024 * 1024) {
        return Math.max(1, Math.round(bytes / 1024)) + " KB";
      }
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const appendFileRow = function (file) {
      if (!driveList) return;
      const name = file.name || "Uploaded_document.pdf";
      const extension = (name.split(".").pop() || "pdf").toLowerCase();
      const isImage = extension === "jpg" || extension === "jpeg" || extension === "png";
      const size = formatFileSize(file.size || 0);

      const row = document.createElement("li");
      row.className = "file-row";
      row.innerHTML =
        '<span class="file-row__icon ' + (isImage ? "is-jpg" : "is-pdf") + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 15h.01M12 15h.01M15 15h.01M9 18h.01M15 18h.01" /></svg>' +
        "</span>" +
        '<div class="file-row__info">' +
          '<span class="file-row__name"></span>' +
          '<span class="file-row__meta"></span>' +
        "</div>" +
        '<div class="file-row__actions">' +
          '<button class="file-btn" type="button" aria-label="Download"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 19h16" /></svg></button>' +
          '<button class="file-btn" type="button" aria-label="Rename"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" /></svg></button>' +
          '<button class="file-btn" type="button" aria-label="Delete"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg></button>' +
        "</div>";

      row.querySelector(".file-row__name").textContent = name;
      row.querySelector(".file-row__meta").textContent =
        "Uploaded Today \u2022 " + size + " \u2022 Encrypted Vault";

      driveList.appendChild(row);
    };

    if (driveDrop && driveInput) {
      driveDrop.addEventListener("click", function () {
        driveInput.click();
      });

      driveInput.addEventListener("change", function () {
        Array.from(driveInput.files || []).forEach(appendFileRow);
        driveInput.value = "";
      });

      driveDrop.addEventListener("dragover", function (event) {
        event.preventDefault();
        driveDrop.style.borderColor = "#0B1B33";
      });

      driveDrop.addEventListener("dragleave", function () {
        driveDrop.style.borderColor = "";
      });

      driveDrop.addEventListener("drop", function (event) {
        event.preventDefault();
        driveDrop.style.borderColor = "";
        Array.from(event.dataTransfer.files || []).forEach(appendFileRow);
      });
    }

    if (driveList) {
      driveList.addEventListener("click", function (event) {
        const button = event.target.closest(".file-btn[aria-label='Delete']");
        if (!button) return;
        const row = button.closest(".file-row");
        if (!row) return;
        if (reduceMotion || window.confirm("Delete this uploaded document from your DigiLocker Drive?")) {
          row.remove();
        }
      });
    }

    /* ===== CONSENT VERIFICATION WORKFLOW ===== */
    const consentHead = document.querySelector(".consent__head");
    const consentFlow = document.querySelector(".consent .flow");
    const gateCards = Array.from(document.querySelectorAll(".gate-card"));
    const consentRevealTargets = [consentHead, consentFlow].concat(gateCards).filter(Boolean);

    const revealConsent = function () {
      consentRevealTargets.forEach(function (target) {
        target.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealConsent();
    } else {
      const consentObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      consentRevealTargets.forEach(function (target) {
        consentObserver.observe(target);
      });
    }

    /* ===== ISSUERS DIRECTORY ===== */
    const issuersHead = document.querySelector(".issuers__head");
    const issuerCards = Array.from(document.querySelectorAll(".issuer-card"));
    const issuerRevealTargets = [issuersHead].concat(issuerCards).filter(Boolean);

    const revealIssuers = function () {
      issuerRevealTargets.forEach(function (target) {
        target.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealIssuers();
    } else {
      const issuersObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      issuerRevealTargets.forEach(function (target) {
        issuersObserver.observe(target);
      });
    }

    /* ===== TRUST STANDARDS ===== */
    const trustCards = Array.from(document.querySelectorAll(".trust-card"));

    const revealTrust = function () {
      trustCards.forEach(function (card) {
        card.classList.add("is-inview");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealTrust();
    } else {
      const trustObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      trustCards.forEach(function (card) {
        trustObserver.observe(card);
      });
    }
  });
})();