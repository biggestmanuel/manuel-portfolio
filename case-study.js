/**
 * Biggest Manuel — Case Study Renderer & Interactive Engine
 * Apple Liquid Glass (VisionOS / iOS Fluid Glass Aesthetic)
 * Theme Sync, Dynamic Next/Prev Navigation, Image Lightbox & Specular Tracking
 */

(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'biggestmanuel_theme';

  const CASE_STUDIES = {
    kindoku: {
      id: "kindoku",
      title: "Kindoku",
      tag: "AI / Web App",
      status: "Live & Deployed",
      image: "img/kindoku.png",
      liveUrl: "https://kindoku.vercel.app",
      stack: ["JavaScript", "Groq AI API", "AniList GraphQL", "PWA", "Vercel"],
      type: "own",
      problem: "Readers hunting for manga, manhwa, manhua, or light novels face two constant frustrations: generic recommendations that don't match what they actually like, and read links that lead to dead pages or sketchy, ad-riddled sites.",
      approach: "Kindoku pairs an AI recommendation engine (Groq, with a fallback chain so results stay reliable even when a model call fails) with real metadata and cover art pulled live from AniList's GraphQL API. For read links, several sites were tested directly instead of trusting the first result. MangaBuddy for manga and FreeWebNovel for light novels proved most consistently reliable. The whole platform is installable as a PWA, so it behaves like a native app on mobile and desktop.",
      gallery: [
        { label: "Desktop Application View", src: "img/kindoku.png", mode: "desktop" },
        { label: "Mobile Responsive Layout", src: "img/kindoku_mobile.png", mode: "mobile" }
      ]
    },

    qerad: {
      id: "qerad",
      title: "Qerad",
      tag: "Product Platform",
      status: "In Active Development",
      image: "img/qerad.png",
      liveUrl: "https://qerad.vercel.app",
      stack: ["JavaScript", "Supabase", "Serverless Functions", "Tailwind CSS", "Vercel"],
      type: "own",
      problem: "Starting a business requires piecing together market research, budgeting, branding, and a roadmap, then separately hunting down trustworthy electricians, carpenters, and other professionals to actually execute it. Planning and execution live in two disconnected worlds.",
      approach: "Qerad closes that gap with two unified entry points on one platform. Personal Mode is for finding and hiring verified trade professionals directly. Business Mode turns an idea into a full launch plan (budget, branding, roadmap) built on real pricing instead of generic estimates. The moment a plan is generated, the platform surfaces exactly who's needed to build it inside the same app. The live coming-soon site features a working waitlist with Supabase integration and full dark/light theme support.",
      gallery: [
        { label: "Light Desktop Interface", src: "img/qerad_light.png", mode: "desktop" },
        { label: "Dark Mobile Interface", src: "img/qerad_mobile.png", mode: "mobile" }
      ]
    },

    "flugos-logistics": {
      id: "flugos-logistics",
      title: "Flugos Logistics",
      tag: "Client Website",
      status: "Delivered",
      image: "img/flugos-logistics.jpeg",
      liveUrl: "https://flugos-logistics.vercel.app",
      stack: ["React", "Tailwind CSS", "Vercel"],
      type: "client",
      whyItWasBuilt: "Flugos Logistics needed a web presence that could compete with established players in international freight and import-export, communicating precision and reliability at a glance rather than looking like a generic template. The build focused on a confident, high-contrast visual identity and clear service structure, giving the brand real credibility and seamless lead generation in a crowded space.",
      gallery: [
        { label: "Desktop Freight Portal", src: "img/flugos-logistics.jpeg", mode: "desktop" },
        { label: "Mobile Tracking View", src: "img/flugos-logistics_mobile.png", mode: "mobile" }
      ]
    },

    "the-cosmetics-company-store": {
      id: "the-cosmetics-company-store",
      title: "The Cosmetics Company Store",
      tag: "E-Commerce",
      status: "Delivered",
      image: "img/thecosmeticscompany.jpeg",
      liveUrl: "https://the-cosmetics-company.vercel.app",
      stack: ["React", "Tailwind CSS", "Vercel"],
      type: "client",
      whyItWasBuilt: "The brief was to make luxury feel accessible — a store that showcases prestige beauty brands at outlet pricing without looking discount or downmarket. The build leaned into an editorial, high-end visual style paired with a straightforward shopping flow, so the 'luxury at outlet prices' positioning came through in the design itself, not just the copy.",
      gallery: [
        { label: "Desktop Storefront View", src: "img/thecosmeticscompany.jpeg", mode: "desktop" },
        { label: "Mobile Browsing Experience", src: "img/thecosmeticscompany_mobile.png", mode: "mobile" }
      ]
    }
  };

  const projectKeys = Object.keys(CASE_STUDIES);

  const escapeHtml = (val) =>
    String(val).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));

  // =========================================================================
  // Theme Toggle on Case Study Page
  // =========================================================================
  const caseThemeBtn = document.getElementById("caseThemeToggle");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark", isDark);
    if (caseThemeBtn) {
      caseThemeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      caseThemeBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }

  if (caseThemeBtn) {
    caseThemeBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  const savedTheme = (function () {
    try {
      const s = localStorage.getItem(THEME_STORAGE_KEY);
      if (s) return s;
    } catch {}
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemPrefersDark ? "dark" : "dark";
  })();

  applyTheme(savedTheme);

  // =========================================================================
  // Specular Cursor Tracking for Case Study Cards
  // =========================================================================
  function attachSpecularListeners() {
    const elements = document.querySelectorAll('.case-topbar, .case-card, .case-page-btn, .case-featured-img-wrap');
    elements.forEach(el => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.removeProperty('--mouse-x');
        el.style.removeProperty('--mouse-y');
      });
    });
  }

  // =========================================================================
  // Render Case Study Content
  // =========================================================================
  const root = document.getElementById("caseStudyRoot");
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("project") || "kindoku";
  const project = CASE_STUDIES[requestedId];

  if (!project) {
    if (root) {
      root.innerHTML = `
        <div class="case-card" style="text-align: center; padding: 60px 20px;">
          <h2 class="case-title">Case study not found</h2>
          <p style="margin-bottom: 24px;">The case study you requested does not exist or has been moved.</p>
          <a href="index.html#projects" class="case-hero-cta">Return to Projects</a>
        </div>
      `;
    }
  } else {
    document.title = `${project.title} — Case Study | Biggest Manuel`;

    const currentIndex = projectKeys.indexOf(requestedId);
    const prevKey = currentIndex > 0 ? projectKeys[currentIndex - 1] : null;
    const nextKey = currentIndex < projectKeys.length - 1 ? projectKeys[currentIndex + 1] : null;

    let html = `
      <section class="case-hero">
        <div class="case-badges-row">
          <span class="case-pill">${escapeHtml(project.tag)}</span>
          <span class="case-pill status">${escapeHtml(project.status)}</span>
        </div>
        <h1 class="case-title">${escapeHtml(project.title)}</h1>
        ${
          project.liveUrl
            ? `<a class="case-hero-cta" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer">
                <span>Visit Live Platform</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>`
            : ""
        }
      </section>

      <div class="case-featured-img-wrap">
        <img class="case-featured-img" src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} Hero Preview" />
      </div>
    `;

    if (project.type === "own") {
      html += `
        <article class="case-card">
          <h3>The Challenge & Context</h3>
          <p>${escapeHtml(project.problem)}</p>
        </article>

        <article class="case-card">
          <h3>Architecture & Engineering Approach</h3>
          <p>${escapeHtml(project.approach)}</p>
        </article>
      `;
    } else {
      html += `
        <article class="case-card">
          <h3>Why It Was Built & Project Scope</h3>
          <p>${escapeHtml(project.whyItWasBuilt)}</p>
        </article>
      `;
    }

    if (project.stack && project.stack.length) {
      html += `
        <article class="case-card">
          <h3>Core Technologies</h3>
          <div class="case-stack-list">
            ${project.stack.map(s => `<span class="case-stack-item">${escapeHtml(s)}</span>`).join("")}
          </div>
        </article>
      `;
    }

    if (project.gallery && project.gallery.length) {
      html += `
        <article class="case-card">
          <h3>Interface & Experience Gallery</h3>
          <div class="case-gallery-grid">
            ${project.gallery
              .map(
                (item) => `
                <div class="case-gallery-card ${item.mode === "mobile" ? "mobile-shot" : ""}" data-src="${escapeHtml(item.src)}" data-caption="${escapeHtml(item.label)}">
                  <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.label)}" loading="lazy" />
                  <div class="case-gallery-caption">${escapeHtml(item.label)}</div>
                </div>
              `
              )
              .join("")}
          </div>
        </article>
      `;
    }

    // Pagination
    html += `
      <div class="case-pagination">
        ${
          prevKey
            ? `<a href="case-study.html?project=${prevKey}" class="case-page-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                <span>${escapeHtml(CASE_STUDIES[prevKey].title)}</span>
              </a>`
            : `<div></div>`
        }
        ${
          nextKey
            ? `<a href="case-study.html?project=${nextKey}" class="case-page-btn">
                <span>${escapeHtml(CASE_STUDIES[nextKey].title)}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>`
            : `<div></div>`
        }
      </div>
    `;

    if (root) {
      root.innerHTML = html;
      attachSpecularListeners();
    }
  }

  // =========================================================================
  // Image Lightbox Modal
  // =========================================================================
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("closeLightboxBtn");

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightbox.classList.add("active");
    lightbox.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (lightboxImg) lightboxImg.src = "";
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".case-gallery-card");
    if (card) {
      const src = card.getAttribute("data-src");
      const caption = card.getAttribute("data-caption");
      if (src) openLightbox(src, caption);
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.querySelector(".lightbox-backdrop")?.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && !lightbox.hasAttribute("hidden")) {
      closeLightbox();
    }
  });

})();
