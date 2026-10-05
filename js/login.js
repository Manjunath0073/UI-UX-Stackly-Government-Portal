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

    /* ===== LOGIN — SSO HERO ===== */
    // Reveal-on-load is handled by the js-ready CSS animations.

    /* ===== LOGIN — AUTH LAYOUT ===== */
    const authx = document.querySelector(".authx");
    if (authx) {
      const roleButtons = Array.prototype.slice.call(authx.querySelectorAll(".role"));
      roleButtons.forEach(function (role) {
        role.addEventListener("click", function () {
          roleButtons.forEach(function (item) {
            const isActive = item === role;
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-selected", String(isActive));
          });
        });
      });

      const otpInputs = Array.prototype.slice.call(authx.querySelectorAll(".otp__inputs input"));
      otpInputs.forEach(function (input, index) {
        input.addEventListener("input", function () {
          input.value = input.value.replace(/\D/g, "").slice(-1);
          if (input.value && otpInputs[index + 1]) otpInputs[index + 1].focus();
        });
        input.addEventListener("keydown", function (event) {
          if (event.key === "Backspace" && !input.value && otpInputs[index - 1]) {
            otpInputs[index - 1].focus();
          } else if (event.key === "ArrowLeft" && otpInputs[index - 1]) {
            otpInputs[index - 1].focus();
          } else if (event.key === "ArrowRight" && otpInputs[index + 1]) {
            otpInputs[index + 1].focus();
          }
        });
        input.addEventListener("paste", function (event) {
          const clipboard = event.clipboardData || window.clipboardData;
          const text = clipboard ? clipboard.getData("text").replace(/\D/g, "") : "";
          if (!text) return;
          event.preventDefault();
          otpInputs.forEach(function (box, i) {
            if (text[i]) box.value = text[i];
          });
          const last = Math.min(text.length, otpInputs.length) - 1;
          if (otpInputs[last]) otpInputs[last].focus();
        });
      });

      const captchaCode = authx.querySelector(".captcha__code");
      const captchaTools = authx.querySelectorAll(".captcha__tools svg");
      const captchaRefresh = captchaTools[captchaTools.length - 1];
      const randomCaptcha = function () {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const parts = [];
        for (let i = 0; i < 5; i += 1) {
          parts.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        return parts.join(" ");
      };
      if (captchaCode && captchaRefresh) {
        captchaRefresh.addEventListener("click", function () {
          captchaCode.textContent = randomCaptcha();
        });
      }

      const resend = authx.querySelector(".otp__resend");
      if (resend) {
        let seconds = 28;
        let resendTimer = null;
        const renderResend = function () {
          if (seconds > 0) {
            resend.textContent = "Resend OTP in " + seconds + "s";
            resend.classList.remove("is-ready");
          } else {
            resend.textContent = "Resend OTP";
            resend.classList.add("is-ready");
          }
        };
        const startCountdown = function () {
          seconds = 28;
          renderResend();
          window.clearInterval(resendTimer);
          resendTimer = window.setInterval(function () {
            seconds -= 1;
            renderResend();
            if (seconds <= 0) window.clearInterval(resendTimer);
          }, 1000);
        };
        renderResend();
        resendTimer = window.setInterval(function () {
          seconds -= 1;
          renderResend();
          if (seconds <= 0) window.clearInterval(resendTimer);
        }, 1000);
        resend.addEventListener("click", function () {
          if (seconds <= 0) startCountdown();
        });
      }

      const revealItems = Array.prototype.slice.call(
        authx.querySelectorAll(".authx__left > *, .authx__right > *")
      );
      revealItems.forEach(function (item) { item.classList.add("authx-reveal"); });

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

      /* ---- persist session to localStorage ---- */
      const getUser = function () {
        try {
          const raw = window.localStorage.getItem("stackly_user");
          return raw ? JSON.parse(raw) : null;
        } catch (error) {
          return null;
        }
      };
      const setUser = function (object) {
        try {
          window.localStorage.setItem("stackly_user", JSON.stringify(object));
        } catch (error) {
          // localStorage may be unavailable for file:// documents.
        }
      };

      /* ---- validation helpers ---- */
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

      const nameInput = authx.querySelector('input[aria-label="Full name"]');
      const mobileInput = authx.querySelector(".sfield__group input");
      const captchaInput = authx.querySelector(".captcha__input");
      const consentInput = authx.querySelector(".scheck input");
      const nameField = nameInput ? nameInput.closest(".sfield") : null;
      const mobileField = mobileInput ? mobileInput.closest(".sfield") : null;
      const otpBox = authx.querySelector(".otp");
      const captchaBox = authx.querySelector(".captcha");
      const consentLabel = consentInput ? consentInput.closest(".scheck") : null;

      authx.addEventListener("input", function (event) {
        const container = event.target.closest(".sfield, .otp, .captcha");
        if (container) fieldClear(container);
      });
      authx.addEventListener("change", function (event) {
        const container = event.target.closest(".scheck");
        if (container) container.classList.remove("is-error");
      });

      const submitButton = authx.querySelector(".signin__submit");
      if (submitButton) {
        submitButton.addEventListener("click", function () {
          [nameField, mobileField, otpBox, captchaBox].forEach(fieldClear);
          if (consentLabel) consentLabel.classList.remove("is-error");
          let firstInvalid = null;

          const nameValue = nameInput ? nameInput.value.trim() : "";
          if (!nameValue) {
            fieldError(nameField, "Please enter your full name.");
            firstInvalid = firstInvalid || nameInput;
          } else if (!nameIsValid(nameValue)) {
            fieldError(nameField, "Name can contain only alphabets and spaces.");
            firstInvalid = firstInvalid || nameInput;
          }

          const digits = mobileInput ? mobileInput.value.replace(/\D/g, "") : "";
          const isMobile = /^[6-9]\d{9}$/.test(digits);
          const isAadhaar = /^\d{12}$/.test(digits);
          if (!digits) {
            fieldError(mobileField, "Enter your registered mobile or Aadhaar number.");
            firstInvalid = firstInvalid || mobileInput;
          } else if (!isMobile && !isAadhaar) {
            fieldError(mobileField, "Enter a valid 10-digit mobile or 12-digit Aadhaar number.");
            firstInvalid = firstInvalid || mobileInput;
          }

          const otpValue = otpInputs.map(function (box) { return box.value; }).join("");
          if (!/^\d{6}$/.test(otpValue)) {
            fieldError(otpBox, "Enter the complete 6-digit OTP.");
            firstInvalid = firstInvalid || otpInputs[0];
          }

          const captchaEntered = captchaInput ? captchaInput.value.replace(/\s/g, "").toUpperCase() : "";
          const captchaExpected = captchaCode ? captchaCode.textContent.replace(/\s/g, "").toUpperCase() : "";
          if (!captchaEntered) {
            fieldError(captchaBox, "Enter the characters shown above.");
            firstInvalid = firstInvalid || captchaInput;
          } else if (captchaEntered !== captchaExpected) {
            fieldError(captchaBox, "Captcha does not match. Please try again.");
            firstInvalid = firstInvalid || captchaInput;
          }

          if (consentInput && !consentInput.checked) {
            if (consentLabel) consentLabel.classList.add("is-error");
            firstInvalid = firstInvalid || consentInput;
          }

          if (firstInvalid) {
            if (typeof firstInvalid.focus === "function") firstInvalid.focus();
            return;
          }

          const activeRole = authx.querySelector(".role.is-active");
          const roleText = activeRole ? activeRole.textContent.trim() : "Citizen";
          const role = /Government/i.test(roleText) ? "official" : "citizen";
          const existing = getUser();
          if (role === "official") {
            setUser({
              name: nameValue,
              role: "official",
              designation: existing && existing.role === "official" && existing.designation ? existing.designation : "Joint Commissioner (Grievance)",
              department: existing && existing.role === "official" && existing.department ? existing.department : "Central Board of Direct Taxes",
              employeeId: existing && existing.role === "official" && existing.employeeId ? existing.employeeId : "GOI-IRS-2291",
              state: existing && existing.state ? existing.state : "Delhi NCT",
              loggedInAt: Date.now()
            });
            window.location.href = "government-dashboard.html";
          } else {
            setUser({
              name: nameValue,
              role: "citizen",
              aadhaarLast4: digits.slice(-4) || "9021",
              abhaId: existing && existing.abhaId ? existing.abhaId : "91-4820-1928-33",
              state: existing && existing.state ? existing.state : "Delhi NCT",
              category: existing && existing.category ? existing.category : "General Citizen",
              email: existing && existing.email ? existing.email : "",
              loggedInAt: Date.now()
            });
            window.location.href = "citizen-dashboard.html";
          }
        });
      }
    }
  });
})();