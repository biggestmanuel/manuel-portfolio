/**
 * Biggest Manuel — Case Study Renderer & Interactive Engine
 * Theme Sync, Dynamic Next/Prev Navigation, and Image Lightbox Modal
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
    try { return localStorage.getItem(THEME_STORAGE_KEY); } catch { return null; }
  })();
  applyTheme(savedTheme || "dark");

  // =========================================================================
  // Lightbox Modal
  // =========================================================================
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeLightboxBtn = document.getElementById("closeLightboxBtn");

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightbox.hidden = false;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
  }

  closeLightboxBtn?.addEventListener("click", closeLightbox);
  lightbox?.querySelector(".lightbox-backdrop")?.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // =========================================================================
  // Case Study Renderer
  // =========================================================================
  const getProjectKey = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("project") || "kindoku";
  };

  function renderCaseStudy() {
    const key = getProjectKey();
    const project = CASE_STUDIES[key];
    const root = document.getElementById("caseStudyRoot");

    if (!project || !root) {
      document.title = "Case Study Not Found | Biggest Manuel";
      if (root) {
        root.innerHTML = `
          <section class="case-error">
            <p class="case-eyebrow">Case Study</p>
            <h1>Project Not Found</h1>
            <p>The requested project case study could not be located.</p>
            <a class="case-btn case-btn-primary" href="index.html#projects">← Back to all projects</a>
          </section>
        `;
      }
      return;
    }

    const currentIndex = projectKeys.indexOf(key);
    const prevKey = projectKeys[(currentIndex - 1 + projectKeys.length) % projectKeys.length];
    const nextKey = projectKeys[(currentIndex + 1) % projectKeys.length];
    const prevProject = CASE_STUDIES[prevKey];
    const nextProject = CASE_STUDIES[nextKey];

    const contentBlock = project.type === "own"
      ? `
        <section class="case-copy-grid">
          <article class="case-copy-card">
            <p class="case-eyebrow">The Challenge</p>
            <h2>Problem Statement</h2>
            <p>${escapeHtml(project.problem)}</p>
          </article>

          <article class="case-copy-card">
            <p class="case-eyebrow">The Solution</p>
            <h2>Technical Approach</h2>
            <p>${escapeHtml(project.approach)}</p>
          </article>
        </section>
      `
      : `
        <section class="case-copy-grid">
          <article class="case-copy-card case-copy-card-wide">
            <p class="case-eyebrow">Client Context & Objectives</p>
            <h2>Why It Was Built</h2>
            <p>${escapeHtml(project.whyItWasBuilt)}</p>
          </article>
        </section>
      `;

    const stack = project.stack
      .map((item) => `<span class="case-stack-pill">${escapeHtml(item)}</span>`)
      .join("");

    const gallery = project.gallery
      .map((item) => `
        <figure class="case-gallery-item ${item.mode === "mobile" ? "is-mobile" : "is-desktop"}">
          <div class="case-gallery-frame" data-preview-src="${escapeHtml(item.src)}" data-preview-caption="${escapeHtml(project.title)} - ${escapeHtml(item.label)}">
            <img
              src="${escapeHtml(item.src)}"
              alt="${escapeHtml(project.title)} ${escapeHtml(item.label)}"
              loading="lazy"
            />
          </div>
          <figcaption>${escapeHtml(item.label)} (Click to expand)</figcaption>
        </figure>
      `)
      .join("");

    root.innerHTML = `
      <div class="case-breadcrumbs">
        <a href="index.html">Home</a>
        <span>/</span>
        <a href="index.html#projects">Projects</a>
        <span>/</span>
        <span>${escapeHtml(project.title)}</span>
      </div>

      <section class="case-hero">
        <div class="case-hero-copy">
          <div class="case-meta-row">
            <span class="case-tag">${escapeHtml(project.tag)}</span>
            <span class="case-status">${escapeHtml(project.status)}</span>
          </div>

          <h1>${escapeHtml(project.title)}</h1>

          <div class="case-stack">
            ${stack}
          </div>

          <div class="case-hero-actions">
            <a
              class="case-btn case-btn-primary"
              href="${escapeHtml(project.liveUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Visit Live Website</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>

            <a
              class="case-btn case-btn-outline"
              href="index.html#projects"
            >
              <span>Back to Projects</span>
            </a>
          </div>
        </div>

        <div class="case-hero-shot">
          <div class="case-shot-window" data-preview-src="${escapeHtml(project.image)}" data-preview-caption="${escapeHtml(project.title)} Desktop View">
            <div class="case-window-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <img
              src="${escapeHtml(project.image)}"
              alt="${escapeHtml(project.title)} desktop screenshot"
            />
          </div>
        </div>
      </section>

      ${contentBlock}

      <section class="case-gallery">
        <div class="case-section-heading">
          <p class="case-eyebrow">Visual Gallery</p>
          <h2>Project Views & UI Flows</h2>
          <p>A closer look at the user experience across desktop and mobile layouts.</p>
        </div>

        <div class="case-gallery-grid">
          ${gallery}
        </div>
      </section>

      <!-- Next / Prev Project Navigation -->
      <section class="case-project-nav">
        <a class="project-nav-card" href="case-study.html?project=${escapeHtml(prevProject.id)}">
          <span class="project-nav-label">← Previous Project</span>
          <span class="project-nav-title">${escapeHtml(prevProject.title)}</span>
        </a>
        <a class="project-nav-card" href="case-study.html?project=${escapeHtml(nextProject.id)}" style="text-align: right;">
          <span class="project-nav-label">Next Project →</span>
          <span class="project-nav-title">${escapeHtml(nextProject.title)}</span>
        </a>
      </section>

      <section class="case-final-cta">
        <p class="case-eyebrow">Experience the live product</p>
        <h2>${escapeHtml(project.title)}</h2>
        <a
          class="case-btn case-btn-primary"
          href="${escapeHtml(project.liveUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Open Live Site</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </section>
    `;

    document.title = `${project.title} Case Study | Biggest Manuel`;

    // Attach Lightbox Handlers
    root.querySelectorAll("[data-preview-src]").forEach((el) => {
      el.addEventListener("click", () => {
        openLightbox(el.dataset.previewSrc, el.dataset.previewCaption);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", renderCaseStudy);
})();