/**
 * Biggest Manuel — Personal Portfolio Application Script
 * Apple Liquid Glass Interactive Engine (Performance-Tuned)
 */

(function () {
  'use strict';

  // --- Constants ---
  const EMAIL_ADDRESS = 'emmanuelnwuba1@gmail.com';

  // --- DOM Elements ---
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');

  const quickCopyEmailBtn = document.getElementById('quickCopyEmailBtn');
  const copyEmailLinkBtn = document.getElementById('copyEmailLinkBtn');
  const toastContainer = document.getElementById('toastContainer');

  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  const contactForm = document.getElementById('contactForm');
  const submitContactBtn = document.getElementById('submitContactBtn');
  const formStatus = document.getElementById('formStatus');

  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const progressCircle = document.querySelector('.progress-ring-circle');

  // =========================================================================
  // Dark Mode: Always On
  // =========================================================================
  document.body.classList.add('dark');


  // =========================================================================
  // Apple Liquid Glass: Pointer-Tracking (Desktop Only for Maximum Performance)
  // =========================================================================
  function initLiquidGlassTracking() {
    // Only track cursor on mouse/desktop devices (avoids lag on mobile touchscreens)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    const glassElements = document.querySelectorAll(
      '.project-card, .skill-card, .service-card, .stat-card, .tools-container, .contact-form-card, .about-bio-card, .contact-card-highlight, .contact-item, .nav-container'
    );

    glassElements.forEach((el) => {
      let isHovered = false;

      el.addEventListener('pointerenter', () => {
        isHovered = true;
      });

      el.addEventListener('pointermove', (e) => {
        if (!isHovered) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      });

      el.addEventListener('pointerleave', () => {
        isHovered = false;
        el.style.removeProperty('--mouse-x');
        el.style.removeProperty('--mouse-y');
      });
    });
  }

  initLiquidGlassTracking();

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconSvg = type === 'success'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 200);
    }, 2600);
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // =========================================================================
  // Clipboard Copy Actions
  // =========================================================================
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

  function handleEmailCopy(buttonElement, labelSelector) {
    if (!buttonElement) return;
    buttonElement.addEventListener('click', async () => {
      const success = await copyText(EMAIL_ADDRESS);
      if (success) {
        buttonElement.classList.add('copied');
        if (labelSelector) {
          const label = buttonElement.querySelector(labelSelector);
          if (label) label.textContent = 'Copied!';
        }
        showToast('Email copied to clipboard!', 'success');
        setTimeout(() => {
          buttonElement.classList.remove('copied');
          if (labelSelector) {
            const label = buttonElement.querySelector(labelSelector);
            if (label) label.textContent = 'Copy Email';
          }
        }, 2200);
      } else {
        showToast('Could not copy email', 'error');
      }
    });
  }

  handleEmailCopy(quickCopyEmailBtn, '.copy-btn-label');
  handleEmailCopy(copyEmailLinkBtn, null);

  // =========================================================================
  // Mobile Navigation Drawer
  // =========================================================================
  const closeMobileMenu = () => {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    navBackdrop?.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const openMobileMenu = () => {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    navBackdrop?.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = hamburger.classList.contains('open');
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });

    navBackdrop?.addEventListener('click', closeMobileMenu);

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  // =========================================================================
  // Scroll Spy & Navigation
  // =========================================================================
  const sections = document.querySelectorAll('header.hero, section.section');
  if ('IntersectionObserver' in window && navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      });
    }, {
      threshold: 0.35,
      rootMargin: '-15% 0px -50% 0px'
    });

    sections.forEach(sec => {
      if (sec.id) navObserver.observe(sec);
    });
  }

  // =========================================================================
  // Project Category Filters
  // =========================================================================
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
          const category = card.dataset.category;
          const match = filter === 'all' || category === filter;

          if (match) {
            card.style.display = 'flex';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.97)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 180);
          }
        });
      });
    });
  }

  // =========================================================================
  // Web3Forms AJAX Contact Form Submission
  // =========================================================================
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (submitContactBtn) {
        submitContactBtn.disabled = true;
        submitContactBtn.classList.add('loading');
      }

      if (formStatus) {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data?.success !== false) {
          if (formStatus) {
            formStatus.textContent = data?.message || 'Thank you! Your message has been sent successfully. I will get back to you soon.';
            formStatus.className = 'form-status success';
          }
          showToast('Message sent successfully!', 'success');
          contactForm.reset();
        } else {
          throw new Error(data?.message || 'Submission failed. Please try again.');
        }
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = err.message || 'Something went wrong. Please reach out to me directly at emmanuelnwuba1@gmail.com.';
          formStatus.className = 'form-status error';
        }
        showToast('Failed to send message', 'error');
      } finally {
        if (submitContactBtn) {
          submitContactBtn.disabled = false;
          submitContactBtn.classList.remove('loading');
        }
      }
    });
  }

  // =========================================================================
  // Scroll To Top & Circular Progress Ring
  // =========================================================================
  if (progressCircle) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;

    const updateScrollProgress = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollTotal > 0 ? window.scrollY / scrollTotal : 0;
      const offset = circumference - scrollProgress * circumference;
      progressCircle.style.strokeDashoffset = offset;

      if (scrollToTopBtn) {
        if (window.scrollY > 300) {
          scrollToTopBtn.classList.add('show');
        } else {
          scrollToTopBtn.classList.remove('show');
        }
      }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    scrollToTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // Scroll Reveal Animations
  // =========================================================================
  if ('IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  }

})();
