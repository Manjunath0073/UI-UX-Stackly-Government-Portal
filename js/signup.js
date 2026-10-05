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

    /* ===== SIGNUP — AUTH LAYOUT ===== */
    const sx = document.querySelector(".sx");
    if (sx) {
      const setSingleActive = function (buttons, activeButton, stateAttribute) {
        buttons.forEach(function (button) {
          const isActive = button === activeButton;
          button.classList.toggle("is-active", isActive);
          if (stateAttribute) button.setAttribute(stateAttribute, String(isActive));
        });
      };

      const roleButtons = Array.prototype.slice.call(sx.querySelectorAll(".role"));
      roleButtons.forEach(function (role) {
        role.addEventListener("click", function () {
          setSingleActive(roleButtons, role, "aria-selected");
        });
      });

      const genderButtons = Array.prototype.slice.call(sx.querySelectorAll(".gender__btn"));
      genderButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          setSingleActive(genderButtons, button, "aria-pressed");
        });
      });

      sx.querySelectorAll(".mpin input").forEach(function (input) {
        input.addEventListener("input", function () {
          input.value = input.value.replace(/\D/g, "").slice(0, 6);
        });
        input.addEventListener("keydown", function (event) {
          if (event.key.length === 1 && !/\d/.test(event.key) && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
          }
        });
      });

      const revealItems = Array.prototype.slice.call(
        sx.querySelectorAll(".sx__left > *, .sx__right > *")
      );
      revealItems.forEach(function (item) { item.classList.add("sx-reveal"); });

      if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const target = entry.target;
            const order = revealItems.indexOf(target);
            target.style.transitionDelay = (Math.max(0, order) * 60) + "ms";
            target.classList.add("is-in");
            revealObserver.unobserve(target);
          });
        }, { threshold: 0.15 });
        revealItems.forEach(function (item) { revealObserver.observe(item); });
      } else {
        revealItems.forEach(function (item) { item.classList.add("is-in"); });
      }

      /* ---- validation helpers + persistence ---- */
      const fieldError = function (container, message) {
        if (!container) return;
        container.classList.add("is-error");
        const slot = container.querySelector(".sfield__error");
        if (slot) slot.textContent = message;
      };
      const fieldClear = function (container) {
        if (!container) return;
        container.classList.remove("is-error");
        const slot = container.querySelector(".sfield__error");
        if (slot) slot.textContent = "";
      };
      const nameIsValid = function (value) {
        return /^[A-Za-z][A-Za-z .'-]{2,59}$/.test(String(value || "").trim());
      };
      const dobIsValid = function (value) {
        const m = String(value || "").trim().match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/);
        if (!m) return false;
        const d = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10);
        const y = parseInt(m[3], 10);
        if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
        const date = new Date(y, mo - 1, d);
        if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return false;
        return y >= 1900 && date <= new Date();
      };
      const setUser = function (object) {
        try {
          window.localStorage.setItem("stackly_user", JSON.stringify(object));
        } catch (error) {
          // localStorage may be unavailable for file:// documents.
        }
      };

      const aadhaarInput = sx.querySelector('input[aria-label="Aadhaar number"]');
      const nameInput = sx.querySelector('input[aria-label="Full name"]');
      const dobInput = sx.querySelector('input[aria-label="Date of birth"]');
      const categorySelect = sx.querySelector('select[aria-label="Citizen category"]');
      const mpinInput = sx.querySelector('input[aria-label="Set MPIN"]');
      const mpinConfirm = sx.querySelector('input[aria-label="Confirm MPIN"]');
      const aadhaarField = aadhaarInput ? aadhaarInput.closest(".sfield") : null;
      const nameField = nameInput ? nameInput.closest(".sfield") : null;
      const dobField = dobInput ? dobInput.closest(".sfield") : null;
      const mpinField = mpinInput ? mpinInput.closest(".sfield") : null;
      const mpinConfirmField = mpinConfirm ? mpinConfirm.closest(".sfield") : null;
      const consents = Array.prototype.slice.call(sx.querySelectorAll(".scheck input"));

      sx.addEventListener("input", function (event) {
        const container = event.target.closest(".sfield");
        if (container) fieldClear(container);
      });
      sx.addEventListener("change", function (event) {
        const container = event.target.closest(".scheck");
        if (container) container.classList.remove("is-error");
      });

      const submitButton = sx.querySelector(".signup__submit");
      if (submitButton) {
        submitButton.addEventListener("click", function () {
          [aadhaarField, nameField, dobField, mpinField, mpinConfirmField].forEach(fieldClear);
          consents.forEach(function (c) {
            const label = c.closest(".scheck");
            if (label) label.classList.remove("is-error");
          });
          let firstInvalid = null;

          const aadhaarDigits = aadhaarInput ? aadhaarInput.value.replace(/\D/g, "") : "";
          if (!aadhaarDigits) {
            fieldError(aadhaarField, "Enter your 12-digit Aadhaar number.");
            firstInvalid = firstInvalid || aadhaarInput;
          } else if (!/^[2-9]\d{11}$/.test(aadhaarDigits)) {
            fieldError(aadhaarField, "Aadhaar must be 12 digits and cannot start with 0 or 1.");
            firstInvalid = firstInvalid || aadhaarInput;
          }

          const nameValue = nameInput ? nameInput.value.trim() : "";
          if (!nameValue) {
            fieldError(nameField, "Please enter your full name.");
            firstInvalid = firstInvalid || nameInput;
          } else if (!nameIsValid(nameValue)) {
            fieldError(nameField, "Name can contain only alphabets and spaces.");
            firstInvalid = firstInvalid || nameInput;
          }

          const dobValue = dobInput ? dobInput.value : "";
          if (!dobValue.trim()) {
            fieldError(dobField, "Enter your date of birth.");
            firstInvalid = firstInvalid || dobInput;
          } else if (!dobIsValid(dobValue)) {
            fieldError(dobField, "Use DD / MM / YYYY with a valid date.");
            firstInvalid = firstInvalid || dobInput;
          }

          const mpinValue = mpinInput ? mpinInput.value : "";
          if (!/^\d{6}$/.test(mpinValue)) {
            fieldError(mpinField, "MPIN must be exactly 6 digits.");
            firstInvalid = firstInvalid || mpinInput;
          }

          const mpinConfirmValue = mpinConfirm ? mpinConfirm.value : "";
          if (!mpinConfirmValue) {
            fieldError(mpinConfirmField, "Re-enter your MPIN.");
            firstInvalid = firstInvalid || mpinConfirm;
          } else if (mpinConfirmValue !== mpinValue) {
            fieldError(mpinConfirmField, "MPIN does not match.");
            firstInvalid = firstInvalid || mpinConfirm;
          }

          consents.forEach(function (c) {
            if (!c.checked) {
              const label = c.closest(".scheck");
              if (label) label.classList.add("is-error");
              firstInvalid = firstInvalid || c;
            }
          });

          if (firstInvalid) {
            if (typeof firstInvalid.focus === "function") firstInvalid.focus();
            return;
          }

          const activeRole = sx.querySelector(".role.is-active");
          const roleText = activeRole ? activeRole.textContent.trim() : "Citizen";
          const role = /Government/i.test(roleText) ? "official" : "citizen";
          const genderActive = sx.querySelector(".gender__btn.is-active");
          const gender = genderActive ? genderActive.textContent.trim() : "Male";

          if (role === "official") {
            setUser({
              name: nameValue,
              role: "official",
              designation: "Joint Commissioner (Grievance)",
              department: "Central Board of Direct Taxes",
              employeeId: "GOI-IRS-2291",
              state: "Delhi NCT",
              dob: dobValue.trim(),
              gender: gender,
              loggedInAt: Date.now()
            });
            window.location.href = "government-dashboard.html";
          } else {
            setUser({
              name: nameValue,
              role: "citizen",
              aadhaarLast4: aadhaarDigits.slice(-4) || "9021",
              abhaId: "91-4820-1928-33",
              state: "Delhi NCT",
              category: categorySelect && categorySelect.value ? categorySelect.value : "General Citizen",
              dob: dobValue.trim(),
              gender: gender,
              email: "",
              loggedInAt: Date.now()
            });
            window.location.href = "citizen-dashboard.html";
          }
        });
      }
    }
  });
})();
