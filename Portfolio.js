/**
 * Biggest Manuel — Personal Portfolio
 * Vanilla JS engine: pill navigation, accordion, code icon field,
 * clipboard + toasts, Web3Forms submission, scroll reveals.
 */

(function () {
  'use strict';

  const EMAIL_ADDRESS = 'emmanuelnwuba1@gmail.com';

  document.documentElement.classList.add('js-reveal');

  /* =======================================================================
     Scroll reveals
     Registered first so a later error can never leave content invisible.
     ======================================================================= */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  /* =======================================================================
     Toasts
     ======================================================================= */
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 220);
    }, 2600);
  }

  /* =======================================================================
     Clipboard
     ======================================================================= */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const res = document.execCommand('copy');
      ta.remove();
      return res;
    } catch {
      return false;
    }
  }

  function bindCopy(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const ok = await copyText(EMAIL_ADDRESS);
      if (!ok) {
        // Clipboard can be blocked (permissions, insecure context) — surface the
        // address so the visitor can still grab it manually.
        showToast(`Copy blocked — email is ${EMAIL_ADDRESS}`, 'error');
        return;
      }
      btn.classList.add('copied');
      showToast('Email copied to clipboard!', 'success');
      setTimeout(() => btn.classList.remove('copied'), 2200);
    });
  }

  bindCopy('quickCopyEmailBtn');
  bindCopy('copyEmailLinkBtn');

  /* =======================================================================
     Smooth anchor scrolling (offset-aware for the floating nav)
     ======================================================================= */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (history.replaceState) history.replaceState(null, '', `#${id}`);
    });
  });

  /* =======================================================================
     Pill navigation: shrink on scroll + active-section indicator
     ======================================================================= */
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('#main-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');

  /* Which section currently owns the middle of the viewport? Computed from
     live geometry rather than observer event order, so fast scrolls and
     jumps can never leave a stale item highlighted. */
  function activeSectionId() {
    const atBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (atBottom && sections.length) return sections[sections.length - 1].id;

    const band = window.innerHeight * 0.5;
    let current = null;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= band && rect.bottom > band) current = section.id;
    }

    return current;
  }

  function syncActiveNav() {
    if (!navLinks.length) return;
    const id = activeSectionId();
    if (!id) return;

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  }

  if (mainNav) {
    const MAX_SCROLL = 1000;
    const MIN_WIDTH = 528;
    let navRaf = null;

    const updateNav = () => {
      const scrolled = window.scrollY > 0;
      mainNav.classList.toggle('scrolling', scrolled);

      if (window.innerWidth >= 768) {
        const progress = Math.min(window.scrollY / MAX_SCROLL, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const maxWidth = Math.min(window.innerWidth * 0.8, 1024);
        mainNav.style.width = scrolled
          ? `${maxWidth - (maxWidth - MIN_WIDTH) * eased}px`
          : `${maxWidth}px`;
      } else {
        mainNav.style.width = '';
      }

      syncActiveNav();
      navRaf = null;
    };

    window.addEventListener('scroll', () => {
      if (!navRaf) navRaf = requestAnimationFrame(updateNav);
    }, { passive: true });

    window.addEventListener('resize', updateNav, { passive: true });
    updateNav();
  }

  /* =======================================================================
     Skills accordion (one open at a time)
     ======================================================================= */
  const skillsList = document.getElementById('skillsList');

  if (skillsList) {
    const items = Array.from(skillsList.querySelectorAll('.skills-item'));

    items.forEach((item) => {
      const trigger = item.querySelector('.skills-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        items.forEach((other) => {
          other.classList.remove('is-open');
          other.querySelector('.skills-trigger')?.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
  /* =======================================================================
     Code icon field
     VS Code style file chips that bob up and down in a scattered panel.
     ======================================================================= */
  (function initCodeField() {
    const stage = document.getElementById('codeStage');
    if (!stage) return;

    // VS Code / Seti file-type icons — the ones VS Code shows for a given
    // extension. Self-contained SVGs, each carrying its own fill, so they
    // render standalone on a light chip with no theming needed.
    // Source: Seti UI (MIT). Stored locally in img/fileicons/.
    const ICONS = [
      ['html', 'HTML'], ['css', 'CSS'], ['scss', 'SCSS'], ['less', 'Less'],
      ['styl', 'Stylus'], ['javascript', 'JavaScript'], ['jsx', 'JSX'],
      ['typescript', 'TypeScript'], ['json', 'JSON'], ['markdown', 'Markdown'],
      ['yaml', 'YAML'], ['xml', 'XML'], ['python', 'Python'], ['java', 'Java'],
      ['php', 'PHP'], ['go', 'Go'], ['rust', 'Rust'], ['ruby', 'Ruby'],
      ['lua', 'Lua'], ['c', 'C'], ['cpp', 'C++'], ['csharp', 'C#'],
      ['sql', 'SQL'], ['graphql', 'GraphQL'], ['shell', 'Shell'],
      ['powershell', 'PowerShell'], ['docker', 'Docker'], ['git', 'Git'],
      ['gitignore', 'Gitignore'], ['node', 'Node'], ['npm', 'npm'],
      ['lock', 'Lockfile'], ['config', 'Config'], ['vue', 'Vue'],
      ['svelte', 'Svelte'], ['kotlin', 'Kotlin']
    ].map(([file, name]) => ({ file, name }));

    const COLS = 6;
    const ROWS = 6;          // 36 slots, 36 icons — a full grid reads as a file tree
    const rand = (a, b) => a + Math.random() * (b - a);

    let tiles = [];
    let resizeTimer = null;

    // The icon field is tablet-and-up only. CSS keeps it hidden below 768px,
    // and this handle lets us skip building it there as well, so a phone never
    // fires the 36 requests. Re-checked on change so rotating a tablet or
    // dragging a window across the breakpoint fills or empties the panel.
    const wide = window.matchMedia('(min-width: 768px)');

    // Shuffle so any four slots being skipped are scattered, not a hole in a row.
    function shuffled(list) {
      const a = list.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function build() {
      const rect = stage.getBoundingClientRect();
      // Hidden below 768px, so the stage measures 0 and there is nothing to lay
      // out against. Without this the layout maths runs on a 1px box.
      if (!rect.width || !rect.height) return;
      const W = rect.width;
      const H = Math.max(1, rect.height);
      const cellW = W / COLS;
      const cellH = H / ROWS;

      // Shuffle all 36 slots, then place only as many as we have icons.
      const slots = shuffled(
        Array.from({ length: COLS * ROWS }, (_, i) => i)
      ).slice(0, ICONS.length);

      tiles = slots.map((slot, i) => {
        const icon = ICONS[i];
        const size = Math.min(cellW, cellH) * rand(0.62, 0.8);
        const col = slot % COLS;
        const row = (slot / COLS) | 0;

        // Centre the chip in its cell, then jitter inside the slack.
        const slackX = Math.max(0, cellW - size);
        const slackY = Math.max(0, cellH - size);
        const x = col * cellW + (slackX / 2) + rand(-0.35, 0.35) * slackX;
        const y = row * cellH + (slackY / 2) + rand(-0.35, 0.35) * slackY;

        return {
          icon,
          size: Math.round(size),
          x: Math.round(x),
          y: Math.round(y),
          lift: Math.round(rand(6, 13)),
          rot: rand(-5, 5).toFixed(1) + 'deg',
          dur: rand(2.4, 4.8).toFixed(2) + 's',
          delay: (-rand(0, 4.8)).toFixed(2) + 's'
        };
      });

      render();
    }

    function makeTile(t) {
      const el = document.createElement('div');
      el.className = 'code-file';
      el.style.setProperty('--size', t.size + 'px');
      el.style.setProperty('--x', t.x + 'px');
      el.style.setProperty('--y', t.y + 'px');
      el.style.setProperty('--lift', t.lift + 'px');
      el.style.setProperty('--r', t.rot);
      el.style.setProperty('--dur', t.dur);
      el.style.setProperty('--delay', t.delay);

      const img = document.createElement('img');
      img.src = 'img/fileicons/' + t.icon.file + '.svg';
      img.alt = '';
      img.decoding = 'async';

      el.appendChild(img);
      return el;
    }

    // Added a few at a time rather than all 36 at once: it keeps the request
    // burst small enough that no host drops any, and the field fills in
    // gradually instead of popping in as one block. setTimeout rather than
    // rAF because rAF is suspended in background tabs, which would leave the
    // panel empty until the tab was focused.
    const BATCH = 4;
    const BATCH_MS = 60;

    let renderTimer = null;

    function render() {
      stage.textContent = '';
      clearTimeout(renderTimer);
      let i = 0;

      const step = () => {
        const frag = document.createDocumentFragment();
        for (let n = 0; n < BATCH && i < tiles.length; n++, i++) {
          frag.appendChild(makeTile(tiles[i]));
        }
        stage.appendChild(frag);
        if (i < tiles.length) renderTimer = setTimeout(step, BATCH_MS);
      };

      renderTimer = setTimeout(step, 0);
    }

    if (wide.matches) build();

    wide.addEventListener('change', () => {
      if (wide.matches) {
        build();
      } else {
        clearTimeout(renderTimer);
        stage.textContent = '';
      }
    });

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    }, { passive: true });
  })();

  /* =======================================================================
     Web3Forms contact submission
     ======================================================================= */
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitContactBtn');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
      }
      if (formStatus) {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(contactForm)
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data && data.success !== false) {
          if (formStatus) {
            formStatus.textContent = data.message || 'Thank you! Your message has been sent — I will get back to you soon.';
            formStatus.className = 'form-status success';
          }
          showToast('Message sent successfully!', 'success');
          contactForm.reset();
        } else {
          throw new Error((data && data.message) || 'Submission failed. Please try again.');
        }
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = err.message || `Something went wrong. Reach me directly at ${EMAIL_ADDRESS}.`;
          formStatus.className = 'form-status error';
        }
        showToast('Failed to send message', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }
      }
    });
  }

})();