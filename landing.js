/* ──────────────────────────────────────────────────────────
   landing.js — interactions for KIMHYEYEON portfolio
   ────────────────────────────────────────────────────────── */

/* 1. Fade-out navigation ─────────────────────────────────── */
function navigateTo(href) {
  if (!href || href.startsWith('mailto:')) {
    window.location.href = href;
    return;
  }
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = href; }, 300);
}

/* 2. List items — hover hold-to-navigate ─────────────────── */
function initListItems() {
  const items = document.querySelectorAll('.list-item');
  if (!items.length) return;

  const HOLD_MS = 600; // ms to hold before navigating

  items.forEach(item => {
    const progress = item.querySelector('.list-item-progress');
    const href = item.getAttribute('data-href') || item.getAttribute('href');
    let timer = null;
    let startTime = null;
    let rafId = null;

    function startHold() {
      startTime = performance.now();
      item.style.cursor = 'pointer';

      function animate(now) {
        const elapsed = now - startTime;
        const ratio = Math.min(elapsed / HOLD_MS, 1);
        if (progress) progress.style.width = (ratio * 100) + '%';
        if (ratio < 1) {
          rafId = requestAnimationFrame(animate);
        } else {
          navigateTo(href);
        }
      }
      rafId = requestAnimationFrame(animate);
    }

    function cancelHold() {
      if (rafId) cancelAnimationFrame(rafId);
      if (progress) {
        progress.style.transition = 'width 0.2s ease';
        progress.style.width = '0';
        setTimeout(() => { progress.style.transition = ''; }, 200);
      }
      startTime = null;
    }

    item.addEventListener('mouseenter', startHold);
    item.addEventListener('mouseleave', cancelHold);

    // Also allow normal click
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(href);
    });
  });
}

/* 3. Nav links — fade transition ────────────────────────── */
function initNavLinks() {
  document.querySelectorAll('.nav-link, .site-logo-wrap').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('#')) return;
      e.preventDefault();
      navigateTo(href);
    });
  });
}

/* 4. Scroll-reveal for section blocks ───────────────────── */
function initScrollReveal() {
  const blocks = document.querySelectorAll('.section-block');
  if (!blocks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger each block slightly
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  blocks.forEach(block => observer.observe(block));
}

/* 5. Header shrink on scroll ────────────────────────────── */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      header.style.boxShadow = '0 1px 0 rgba(37,37,30,0.15)';
    } else {
      header.style.boxShadow = '';
    }
    lastY = y;
  }, { passive: true });
}

/* 6. Intro rows — stagger fade-in ──────────────────────── */
function initIntroRows() {
  const rows = document.querySelectorAll('.intro-top, .intro-row, .intro-rows');
  rows.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease ${0.1 + i * 0.1}s, transform 0.5s ease ${0.1 + i * 0.1}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
}

/* 7. List logo — subtle float animation ─────────────────── */
function initLogoFloat() {
  const logo = document.querySelector('.list-logo');
  if (!logo) return;
  logo.style.animation = 'logoFloat 4s ease-in-out infinite';
  const style = document.createElement('style');
  style.textContent = `
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-4px); }
    }
  `;
  document.head.appendChild(style);
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initListItems();
  initNavLinks();
  initScrollReveal();
  initHeaderScroll();
  initIntroRows();
  initLogoFloat();
});
