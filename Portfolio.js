// ── 3D Photo Tilt ──────────────────────────────────────────
const photo = document.querySelector(".photo-3d");
const container = document.querySelector(".photo-container");

if (container && photo) {
  container.addEventListener("mousemove", function (e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / rect.height) * 20;
    const rotateY = (x / rect.width) * 20;
    photo.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    photo.style.boxShadow = `0 30px 80px rgba(26, 115, 232, 0.5)`;
  });

  container.addEventListener("mouseleave", function () {
    photo.style.transform = "";
    photo.style.boxShadow = "";
  });
}

// ── Scroll Reveal ──────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        // Once revealed, stop watching it
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,      // trigger when 15% of element is visible
    rootMargin: "0px 0px -40px 0px", // slight offset from bottom of viewport
  }
);

// Observe every element with .reveal class
document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

// ── Active Nav Highlight on Scroll ────────────────────────
const sections = document.querySelectorAll("section, .skills-section, .contact-section");
const navLinks = document.querySelectorAll(".nav-links a");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
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
    nav.style.boxShadow = "0 4px 30px rgba(0,0,0,0.4)";
  } else {
    nav.style.boxShadow = "none";
  }
});