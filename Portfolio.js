/**
 * Biggest Manuel — Personal Portfolio
 * Vanilla JS engine: theme switching, pill navigation, accordion, code icon
 * field, clipboard + toasts, Web3Forms submission, scroll reveals.
 */

(function () {
  'use strict';

  const EMAIL_ADDRESS = 'emmanuelnwuba1@gmail.com';

  document.documentElement.classList.add('js-reveal');

  /* =======================================================================
     Theme switching
     The inline script in <head> has already put data-theme on <html>, so
     this only has to wire up the button. A visitor's explicit choice is
     remembered; otherwise the OS preference still wins.
     ======================================================================= */
  (function initThemeToggle() {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (theme) => {
      root.setAttribute('data-theme', theme);
      // Only an explicit choice is stored. With nothing stored the OS keeps
      // deciding, so a visitor who flips their system setting is followed.
      if (btn) {
        const toDark = theme === 'light';
        btn.setAttribute('aria-label', toDark ? 'Switch to dark theme' : 'Switch to light theme');
        btn.setAttribute('title', toDark ? 'Switch to dark theme' : 'Switch to light theme');
      }
    };

    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    if (!btn) return;

    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch (e) { /* private mode: the choice just won't persist */ }
      apply(next);
    });

    // Only follow the OS while the visitor has not expressed a preference.
    const onSystemChange = (e) => {
      let stored = null;
      try {
        stored = localStorage.getItem('theme');
      } catch (err) { /* ignore */ }
      if (stored !== 'light' && stored !== 'dark') apply(e.matches ? 'dark' : 'light');
    };
    if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemChange);
    else if (systemDark.addListener) systemDark.addListener(onSystemChange);
  })();

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
        showToast(`Copy failed. Email is ${EMAIL_ADDRESS}`, 'error');
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
        // The theme toggle is pinned to the top-right corner, so the centred
        // pill has to leave room for it: 1.5rem offset + 2.4rem button + gap.
        const TOGGLE_ZONE = 82;
        const maxWidth = Math.min(
          window.innerWidth * 0.8,
          1024,
          window.innerWidth - TOGGLE_ZONE * 2
        );
        mainNav.style.width = scrolled
          ? `${Math.max(MIN_WIDTH, maxWidth - (maxWidth - MIN_WIDTH) * eased)}px`
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

    // Without this the inline width written on scroll goes stale when the
    // window is resized, so the pill keeps the width it had at the old size.
    window.addEventListener('resize', () => {
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
            formStatus.textContent = data.message || 'Thank you! Your message has been sent. I will get back to you soon.';
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