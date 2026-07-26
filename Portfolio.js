// Biggest Manuel Portfolio
// Premium JS Rewrite

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("navLinks");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const nav = document.querySelector("nav");
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section, .skills-section, .contact-section");

  const closeMobileNav = () => {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove("open");
    mobileNav.classList.remove("open");
  };

  // ── Hamburger Menu ───────────────────────────────────────
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      hamburger.classList.toggle("open");
      mobileNav.classList.toggle("open");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileNav();
      });
    });

    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        closeMobileNav();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMobileNav();
    });
  }

  // ── Contact Form (Web3Forms) ────────────────────────────
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalText = submitBtn?.textContent || "Send Message";

      if (submitBtn) {
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
      }

      if (formStatus) {
        formStatus.textContent = "";
        formStatus.className = "form-status";
      }

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: new FormData(contactForm),
        });

        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (response.ok) {
          if (formStatus) {
            formStatus.textContent =
              data?.message || "Message sent! I'll get back to you soon.";
            formStatus.className = "form-status success";
          }
          contactForm.reset();
        } else {
          if (formStatus) {
            formStatus.textContent =
              data?.message ||
              "Something went wrong. Please try again or email me directly.";
            formStatus.className = "form-status error";
          }
        }
      } catch (err) {
        if (formStatus) {
          formStatus.textContent =
            "Network error. Please try again or email me directly.";
          formStatus.className = "form-status error";
        }
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }

  // ── Scroll Reveal — desktop only ────────────────────────
  if (window.innerWidth > 768 && "IntersectionObserver" in window) {
    const revealItems = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          } else {
            entry.target.classList.remove("revealed");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("revealed");
    });
  }

  // ── Active Nav Highlight on Scroll ──────────────────────
  if ("IntersectionObserver" in window && navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      {
        threshold: 0.4,
        rootMargin: "-15% 0px -55% 0px",
      }
    );

    sections.forEach((sec) => {
      if (sec.id) navObserver.observe(sec);
    });
  }

  // ── Nav Shadow on Scroll ────────────────────────────────
  const updateNavShadow = () => {
    if (!nav) return;
    nav.style.boxShadow =
      window.scrollY > 20
        ? "0 10px 30px rgba(15, 23, 42, 0.10)"
        : "0 8px 24px rgba(15, 23, 42, 0.06)";
  };

  updateNavShadow();
  window.addEventListener("scroll", updateNavShadow, { passive: true });
});