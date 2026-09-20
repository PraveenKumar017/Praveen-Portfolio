/* ============================================================
   Praveen Kumar S — Portfolio scripts (v2)
   Theme cross-fade + icon morph · spotlight cards · timeline draw
   reveal-on-scroll · scroll-spy · glass mobile menu · magnetic
   ============================================================ */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1. Theme toggle — 400ms cross-fade + icon morph ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var savedTheme = null;

  try {
    savedTheme = localStorage.getItem("theme");
  } catch (e) {
    savedTheme = null;
  }

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    document.documentElement.setAttribute("data-theme", "light");
  }

  var syncToggleAria = function () {
    var isLight = document.documentElement.getAttribute("data-theme") === "light";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    themeToggle.setAttribute("aria-pressed", String(isLight));
  };
  syncToggleAria();

  var applyTheme = function (next) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) { /* private mode */ }
    syncToggleAria();
  };

  themeToggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "dark" ? "light" : "dark";

    // Cross-fade overlay painted in the *new* theme color
    if (!prefersReducedMotion) {
      applyTheme(next);
      var overlay = document.createElement("div");
      overlay.className = "theme-fade-overlay";
      document.body.appendChild(overlay);
      var removeOverlay = function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        overlay.removeEventListener("animationend", removeOverlay);
      };
      overlay.addEventListener("animationend", removeOverlay);
    } else {
      applyTheme(next);
    }
  });

  /* ---------- 2. Header transparent-to-glass on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var onScrollHeader = function () {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- 3. Mobile glass overlay menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var mobileLinks = mobileMenu.querySelectorAll(".mobile-link");

  var setMenu = function (open) {
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  };

  menuToggle.addEventListener("click", function () {
    setMenu(!mobileMenu.classList.contains("is-open"));
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      setMenu(false);
    }
  });

  /* ---------- 4. Scroll-spy (active nav link) ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var mobileLinksArr = Array.prototype.slice.call(mobileLinks);

  var linksById = {};
  var sectionEls = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    var section = document.getElementById(id);
    if (section) sectionEls.push(section);
    linksById[id] = {
      nav: link,
      mobile: mobileLinksArr.find(function (l) {
        return l.getAttribute("href") === "#" + id;
      })
    };
  }, {});

var spyActive = null;

  var updateSpy = function () {
    var pos = window.scrollY + window.innerHeight * 0.32;
    var currentId = null;

    sectionEls.forEach(function (sec) {
      if (pos >= sec.offsetTop) {
        currentId = sec.id;
      }
    });

    if (currentId === spyActive) return;
    spyActive = currentId;

    navLinks.forEach(function (link) {
      link.classList.remove("is-active");
    });
    mobileLinks.forEach(function (link) {
      link.classList.remove("is-active");
    });

    if (currentId && linksById[currentId]) {
      linksById[currentId].nav.classList.add("is-active");
      if (linksById[currentId].mobile) {
        linksById[currentId].mobile.classList.add("is-active");
      }
    }
  };

  window.addEventListener("scroll", updateSpy, { passive: true });
  window.addEventListener("resize", updateSpy, { passive: true });
  updateSpy();

  /* ---------- 5. Reveal-on-scroll (staggered, IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  revealEls.forEach(function (el) {
    var siblings = el.parentElement ? el.parentElement.children : [];
    var index = Array.prototype.indexOf.call(siblings, el);
    var stagger = Math.min(index * 100, 500);
    el.style.setProperty("--delay", stagger + "ms");
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 6. Signature interaction: cursor-follow card spotlight ---------- */
  if (finePointer && !prefersReducedMotion) {
    var spotlightCards = document.querySelectorAll(".spotlight");

    spotlightCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        card.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  /* ---------- 7. Timeline self-drawing progress line ---------- */
  var timeline = document.getElementById("timeline");

  if (timeline) {
    var updateTimeline = function () {
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = Math.max(rect.height - vh, 1);
      var progress = (vh * 0.7 - rect.top) / total;
      progress = Math.max(0, Math.min(progress, 1));
      timeline.style.setProperty("--tl-progress", (progress * 100) + "%");
    };

    window.addEventListener("scroll", updateTimeline, { passive: true });
    window.addEventListener("resize", updateTimeline, { passive: true });
    updateTimeline();
  }

  /* ---------- 8. Contact form handling ---------- */
  var contactForm = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");

  var setStatus = function (message, isError) {
    formStatus.textContent = message;
    formStatus.classList.toggle("error", !!isError);
  };

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("formName").value.trim();
    var email = document.getElementById("formEmail").value.trim();
    var message = document.getElementById("formMessage").value.trim();

    if (!name || !email || !message) {
      setStatus("Please fill in all fields.", true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address.", true);
      return;
    }

    setStatus("Thanks, " + name + "! Your message is ready — I'll get back to you soon.");

    var subject = encodeURIComponent("Portfolio inquiry from " + name);
    var body = encodeURIComponent(message + "\n\n\u2014 " + name + " (" + email + ")");
    window.location.href = "mailto:praveenkumarsaravanan17@gmail.com?subject=" + subject + "&body=" + body;

    contactForm.reset();
  });

  /* ---------- 9. Cursor glow (desktop only) ---------- */
  var glow = document.querySelector(".cursor-glow");

  if (glow && finePointer && !prefersReducedMotion) {
    var ticking = false;

    window.addEventListener("mousemove", function (e) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
        ticking = false;
      });
    });

    setTimeout(function () {
      glow.classList.add("is-active");
    }, 60);

    document.addEventListener("mouseleave", function () {
      glow.classList.remove("is-active");
    });
    document.addEventListener("mouseenter", function () {
      glow.classList.add("is-active");
    });
  }

  /* ---------- 10. Magnetic buttons (desktop only) ---------- */
  if (finePointer && !prefersReducedMotion) {
    var magnets = document.querySelectorAll(".magnetic");

    magnets.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = "translate(" + (x * 0.2) + "px, " + (y * 0.3) + "px)";
      });

      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- 11. Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();