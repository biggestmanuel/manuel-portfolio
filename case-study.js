/**
 * Biggest Manuel — Case Study Data & Interactive Engine
 *
 * CASE_STUDIES below is the single source of truth for the project content.
 * The four public pages (case-study-<id>.html) are pre-rendered from it by
 *
 *     node tools/generate-case-studies.js
 *
 * so search engines and anyone with JavaScript disabled get real static HTML.
 * Re-run that script after editing anything in this file. Everything below
 * the data block is progressive enhancement only: the gallery lightbox.
 */

/**
 * Biggest Manuel — Case Study Renderer & Interactive Engine
 * Dark-minimal theme.
 */

(function () {
  'use strict';


  const CASE_STUDIES = {
    kindoku: {
      id: "kindoku",
      title: "Kindoku",
      tag: "AI / Web App",
      status: "Live & Deployed",
      image: "img/kindoku.webp",
      liveUrl: "https://kindoku.vercel.app",
      stack: ["JavaScript", "Groq AI API", "AniList GraphQL", "PWA", "Vercel"],
      type: "own",
      problem: "Readers hunting for manga, manhwa, manhua, or light novels face two constant frustrations: generic recommendations that don't match what they actually like, and read links that lead to dead pages or sketchy, ad-riddled sites.",
      approach: "Kindoku pairs an AI recommendation engine (Groq, with a fallback chain so results stay reliable even when a model call fails) with real metadata and cover art pulled live from AniList's GraphQL API. For read links, several sites were tested directly instead of trusting the first result. MangaBuddy for manga and FreeWebNovel for light novels proved most consistently reliable. The whole platform is installable as a PWA, so it behaves like a native app on mobile and desktop.",
      gallery: [
        { label: "Desktop Application View", src: "img/kindoku.webp", mode: "desktop" },
        { label: "Mobile Responsive Layout", src: "img/kindoku_mobile.webp", mode: "mobile" }
      ]
    },

    qerad: {
      id: "qerad",
      title: "Qerad",
      tag: "Product Platform",
      status: "In Active Development",
      image: "img/qerad.webp",
      liveUrl: "https://qerad.vercel.app",
      stack: ["JavaScript", "Supabase", "Serverless Functions", "Tailwind CSS", "Vercel"],
      type: "own",
      problem: "Starting a business requires piecing together market research, budgeting, branding, and a roadmap, then separately hunting down trustworthy electricians, carpenters, and other professionals to actually execute it. Planning and execution live in two disconnected worlds.",
      approach: "Qerad closes that gap with two unified entry points on one platform. Personal Mode is for finding and hiring verified trade professionals directly. Business Mode turns an idea into a full launch plan (budget, branding, roadmap) built on real pricing instead of generic estimates. The moment a plan is generated, the platform surfaces exactly who's needed to build it inside the same app. The live coming-soon site features a working waitlist with Supabase integration and full dark/light theme support.",
      gallery: [
        { label: "Light Desktop Interface", src: "img/qerad_light.webp", mode: "desktop" },
        { label: "Dark Mobile Interface", src: "img/qerad_mobile.webp", mode: "mobile" }
      ]
    },

    "flugos-logistics": {
      id: "flugos-logistics",
      title: "Flugos Logistics",
      tag: "Client Website",
      status: "Delivered",
      image: "img/flugos-logistics.webp",
      liveUrl: "https://flugos-logistics.vercel.app",
      stack: ["React", "Tailwind CSS", "Vercel"],
      type: "client",
      whyItWasBuilt: "Flugos Logistics needed a web presence that could compete with established players in international freight and import-export, communicating precision and reliability at a glance rather than looking like a generic template. The build focused on a confident, high-contrast visual identity and clear service structure, giving the brand real credibility and seamless lead generation in a crowded space.",
      gallery: [
        { label: "Desktop Freight Portal", src: "img/flugos-logistics.webp", mode: "desktop" },
        { label: "Mobile Tracking View", src: "img/flugos-logistics_mobile.webp", mode: "mobile" }
      ]
    },

    "the-cosmetics-company-store": {
      id: "the-cosmetics-company-store",
      title: "The Cosmetics Company Store",
      tag: "E-Commerce",
      status: "Delivered",
      image: "img/thecosmeticscompany.webp",
      liveUrl: "https://the-cosmetics-company.vercel.app",
      stack: ["React", "Tailwind CSS", "Vercel"],
      type: "client",
      whyItWasBuilt: "The brief was to make luxury feel accessible: a store that showcases prestige beauty brands at outlet pricing without looking discount or downmarket. The build leaned into an editorial, high-end visual style paired with a straightforward shopping flow, so the 'luxury at outlet prices' positioning came through in the design itself, not just the copy.",
      gallery: [
        { label: "Desktop Storefront View", src: "img/thecosmeticscompany.webp", mode: "desktop" },
        { label: "Mobile Browsing Experience", src: "img/thecosmeticscompany_mobile.webp", mode: "mobile" }
      ]
    }
  };

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
