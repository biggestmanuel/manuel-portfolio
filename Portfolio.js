// ── Hamburger Menu ─────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("navLinks");

if (hamburger && mobileNav) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileNav.classList.toggle("open");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileNav.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove("open");
      mobileNav.classList.remove("open");
    }
  });
}

// ── Contact Form (Web3Forms) ───────────────────────────────
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        formStatus.textContent = "Message sent! I'll get back to you soon.";
        formStatus.className = "form-status success";
        contactForm.reset();
      } else {
        formStatus.textContent = "Error: " + (data.message || "Something went wrong.");
        formStatus.className = "form-status error";
      }
    } catch (err) {
      formStatus.textContent = "Network error. Please email me directly at emmanuelnwuba1@gmail.com";
      formStatus.className = "form-status error";
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ── Scroll Reveal (one-shot, smooth) — desktop only ────────
if (window.innerWidth > 768) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
  });
}

// ── Active Nav Highlight on Scroll ────────────────────────
const sections = document.querySelectorAll("section, .skills-section, .contact-section");
const navHighlightLinks = document.querySelectorAll(".nav-links a");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navHighlightLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((sec) => navObserver.observe(sec));

// ── Nav Shadow on Scroll ───────────────────────────────────
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 20) {
    nav.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
  } else {
    nav.style.boxShadow = "none";
  }
});