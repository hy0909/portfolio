/* ──────────────────────────────────────────────────────────
   landing.js — interactions for KIMHYEYEON portfolio
   ────────────────────────────────────────────────────────── */

/* 0. Contact modal ──────────────────────────────────────── */
function getEmailFromHref(href) {
  if (!href || !href.startsWith('mailto:')) return '';
  return href.replace('mailto:', '').split('?')[0];
}

function createContactModal() {
  const existing = document.querySelector('.contact-modal-overlay');
  if (existing) return existing;

  const overlay = document.createElement('div');
  overlay.className = 'contact-modal-overlay';
  overlay.setAttribute('hidden', '');
  overlay.innerHTML = `
    <div class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <button class="contact-modal-close" type="button" aria-label="닫기">×</button>
      <p class="contact-modal-label">문의</p>
      <h2 class="contact-modal-title" id="contact-modal-title">이메일로 연락주세요</h2>
      <p class="contact-modal-email">kimhy0909@gmail.com</p>
      <a class="contact-modal-action" href="mailto:kimhy0909@gmail.com">메일 보내기</a>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function openContactModal(email) {
  const overlay = createContactModal();
  const emailNode = overlay.querySelector('.contact-modal-email');
  const actionNode = overlay.querySelector('.contact-modal-action');
  const closeNode = overlay.querySelector('.contact-modal-close');

  if (emailNode && email) emailNode.textContent = email;
  if (actionNode && email) actionNode.setAttribute('href', `mailto:${email}`);

  overlay.hidden = false;
  document.body.classList.add('contact-modal-open');
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
  });
  if (closeNode) closeNode.focus();
}

function closeContactModal() {
  const overlay = document.querySelector('.contact-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.classList.remove('contact-modal-open');
  setTimeout(() => {
    overlay.hidden = true;
  }, 180);
}

function initContactModal() {
  const overlay = createContactModal();

  document.querySelectorAll('a[href^="mailto:"], .list-item[data-href^="mailto:"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('data-href') || link.getAttribute('href');
      const email = getEmailFromHref(href);
      if (!email) return;
      e.preventDefault();
      openContactModal(email);
    });
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('.contact-modal-close')) {
      closeContactModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeContactModal();
    }
  });
}

/* 1. Fade-out navigation ─────────────────────────────────── */
function navigateTo(href) {
  if (!href) {
    window.location.href = href;
    return;
  }
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = href; }, 300);
}

/* 2. List items — click-to-navigate ──────────────────────── */
function initListItems() {
  const items = document.querySelectorAll('.list-item');
  if (!items.length) return;

  items.forEach(item => {
    const href = item.getAttribute('data-href') || item.getAttribute('href');

    item.style.cursor = 'pointer';
    item.addEventListener('click', e => {
      if (href && href.startsWith('mailto:')) return;
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

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initContactModal();
  initListItems();
  initNavLinks();
  initScrollReveal();
  initHeaderScroll();
  initIntroRows();
});
