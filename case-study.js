const CASE_STUDIES = {
  kindoku: {
    title: "Kindoku",
    tag: "AI / Web App",
    status: "Built",
    image: "img/kindoku.png",
    liveUrl: "https://kindoku.vercel.app",
    stack: ["JavaScript", "Groq API", "AniList GraphQL", "Vercel"],
    type: "own",
    problem: "Readers hunting for manga, manhwa, manhua, or light novels face two constant frustrations: generic recommendations that don't match what they actually like, and read links that lead to dead pages or sketchy, ad-riddled sites.",
    approach: "Kindoku pairs an AI recommendation engine (Groq, with a fallback chain so results stay reliable even when a model call fails) with real metadata and cover art pulled live from AniList's GraphQL API. For read links, several sites were tested directly instead of trusting the first result. MangaFire, MangaDex, and NovelUpdates were all ruled out, landing on MangaBuddy for manga and FreeWebNovel for light novels as the most consistently reliable. The whole thing is also installable as a PWA, so it behaves like a real app rather than just another browser tab.",
    gallery: [
      { label: "Desktop view", src: "img/kindoku.png", mode: "desktop" },
      { label: "Mobile view", src: "img/kindoku_mobile.png", mode: "mobile" }
    ]
  },

  qerad: {
    title: "Qerad",
    tag: "Product Platform",
    status: "Currently building",
    image: "img/qerad.png",
    liveUrl: "https://qerad.vercel.app",
    stack: ["JavaScript", "Supabase", "Vercel"],
    type: "own",
    problem: "Starting a business means piecing together market research, budgeting, branding, and a roadmap, then separately hunting down trustworthy electricians, carpenters, and other professionals to actually execute it. Planning and execution live in two disconnected worlds.",
    approach: "Qerad closes that gap with two entry points on one platform. Personal Mode is for finding and hiring verified professionals directly. Business Mode turns an idea into a full launch plan (budget, branding, roadmap) built on real pricing instead of generic estimates. The moment a plan is generated, the platform surfaces exactly who's needed to build it, inside the same app. The coming-soon site is live with a working waitlist end to end, using a Vercel serverless function and Supabase, including full light and dark theme support.",
    gallery: [
      { label: "Desktop view", src: "img/qerad.png", mode: "desktop" },
      { label: "Mobile view", src: "img/qerad_mobile.png", mode: "mobile" }
    ]
  },

  "flugos-logistics": {
    title: "Flugos Logistics",
    tag: "Website",
    status: "Client work",
    image: "img/flugos-logistics.jpeg",
    liveUrl: "https://flugos-logistics.vercel.app",
    stack: ["React", "Tailwind CSS"],
    type: "client",
    whyItWasBuilt: "Flugos Logistics needed a web presence that could compete with established players in international freight and import-export, a site that communicated precision and reliability at a glance, not just another generic logistics template. The build focused on a confident, high-contrast visual identity and clear service structure, aimed at giving the brand real credibility in a crowded space.",
    gallery: [
      { label: "Desktop view", src: "img/flugos-logistics.jpeg", mode: "desktop" },
      { label: "Mobile view", src: "img/flugos-logistics_mobile.png", mode: "mobile" }
    ]
  },

  "the-cosmetics-company-store": {
    title: "The Cosmetics Company Store",
    tag: "Website",
    status: "Client work",
    image: "img/thecosmeticscompany.jpeg",
    liveUrl: "https://the-cosmetics-company.vercel.app",
    stack: ["React", "Tailwind CSS"],
    type: "client",
    whyItWasBuilt: "The brief was to make luxury feel accessible, a store that could showcase prestige beauty brands at outlet pricing without looking discount or downmarket. The build leaned into an editorial, high-end visual style paired with a straightforward shopping flow, so the \"luxury at outlet prices\" positioning came through in the design itself, not just the copy.",
    gallery: [
      { label: "Desktop view", src: "img/thecosmeticscompany.jpeg", mode: "desktop" },
      { label: "Mobile view", src: "img/thecosmeticscompany_mobile.png", mode: "mobile" }
    ]
  }
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));

const getProjectKey = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("project") || "kindoku";
};

const renderCaseStudy = () => {
  const key = getProjectKey();
  const project = CASE_STUDIES[key];
  const root = document.getElementById("caseStudyRoot");

  if (!project || !root) {
    document.title = "Case Study Not Found | Biggest Manuel";
    root.innerHTML = `
      <section class="case-error">
        <p class="case-eyebrow">Case study</p>
        <h1>Project not found</h1>
        <p>The project you requested is not available.</p>
        <a class="case-btn case-btn-outline" href="index.html#projects">Back to projects</a>
      </section>
    `;
    return;
  }

  const contentBlock = project.type === "own"
    ? `
      <section class="case-copy-grid">
        <article class="case-copy-card">
          <p class="case-eyebrow">Problem</p>
          <h2>The problem</h2>
          <p>${escapeHtml(project.problem)}</p>
        </article>
        <article class="case-copy-card">
          <p class="case-eyebrow">Approach</p>
          <h2>The approach</h2>
          <p>${escapeHtml(project.approach)}</p>
        </article>
      </section>
    `
    : `
      <section class="case-copy-grid">
        <article class="case-copy-card case-copy-card-wide">
          <p class="case-eyebrow">Why It Was Built</p>
          <h2>Why it was built</h2>
          <p>${escapeHtml(project.whyItWasBuilt)}</p>
        </article>
      </section>
    `;

  const stack = project.stack.map((item) => `<span class="case-stack-pill">${escapeHtml(item)}</span>`).join("");

  const gallery = project.gallery.map((item) => `
    <figure class="case-gallery-item ${item.mode === "mobile" ? "is-mobile" : "is-desktop"}">
      <div class="case-gallery-frame">
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(project.title)} ${escapeHtml(item.label)}" loading="lazy" />
      </div>
      <figcaption>${escapeHtml(item.label)}</figcaption>
    </figure>
  `).join("");

  root.innerHTML = `
    <section class="case-hero">
      <div class="case-hero-copy">
        <div class="case-meta-row">
          <span class="case-tag">${escapeHtml(project.tag)}</span>
          <span class="case-status">${escapeHtml(project.status)}</span>
        </div>

        <h1>${escapeHtml(project.title)}</h1>

        <div class="case-stack">${stack}</div>

        <div class="case-hero-actions">
          <a class="case-btn case-btn-primary" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer">
            Visit live site
          </a>
          <a class="case-btn case-btn-outline" href="index.html#projects">Back to projects</a>
        </div>
      </div>

      <div class="case-hero-shot">
        <div class="case-shot-window">
          <div class="case-window-bar">
            <span></span><span></span><span></span>
          </div>
          <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} desktop screenshot" />
        </div>
      </div>
    </section>

    ${contentBlock}

    <section class="case-gallery">
      <div class="case-section-heading">
        <p class="case-eyebrow">Visuals</p>
        <h2>Project views</h2>
        <p>A closer look at the interface across larger and smaller layouts.</p>
      </div>
      <div class="case-gallery-grid">
        ${gallery}
      </div>
    </section>

    <section class="case-final-cta">
      <p class="case-eyebrow">See it live</p>
      <h2>${escapeHtml(project.title)}</h2>
      <a class="case-btn case-btn-primary" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Visit live site</a>
    </section>
  `;

  document.title = `${project.title} Case Study | Biggest Manuel`;
};

document.addEventListener("DOMContentLoaded", renderCaseStudy);
