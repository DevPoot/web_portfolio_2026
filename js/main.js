/* ═══════════════════════════════════════════════════════════════
   main.js — Portfolio interactivity
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── DOM references ──────────────────────────────────────────
  const body       = document.body;
  const themeBtn   = document.getElementById('theme-toggle');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  const header     = document.getElementById('site-header');
  const allLinks   = document.querySelectorAll('.nav__link');

  // ── 1. Dark / Light mode toggle ────────────────────────────
  const STORAGE_KEY = 'portfolio-theme';

  // Restore saved preference (or default to dark)
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === 'dark' || (!savedTheme)) {
    body.classList.add('dark');
  }

  themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem(
      STORAGE_KEY,
      body.classList.contains('dark') ? 'dark' : 'light'
    );
  });

  // ── 2. Mobile hamburger menu ───────────────────────────────
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ── 3. Shrink header on scroll ─────────────────────────────
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.style.boxShadow = y > 50
      ? '0 4px 30px rgba(0,0,0,.08)'
      : 'none';
    lastScroll = y;
  }, { passive: true });

  // ── 4. Reveal-on-scroll (Intersection Observer) ────────────
  const revealEls = document.querySelectorAll(
    '.skill-card, .project-card, .stat-card, .contact-link'
  );

  // Add initial hidden state
  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));

  // ── 5. Spotify music player toggle ─────────────────────────
  const musicBtn    = document.getElementById('music-toggle');
  const spotifyPlayer = document.getElementById('spotify-player');

  musicBtn.addEventListener('click', () => {
    musicBtn.classList.toggle('active');
    spotifyPlayer.classList.toggle('open');
  });

  // ── 6. Section navigation behavior ──────────────────────────
  const pageSections = document.querySelectorAll('.page-section');

  const setActiveSection = (sectionId) => {
    pageSections.forEach(section => {
      const isActive = section.id === sectionId;
      section.classList.toggle('active', isActive);
      if (isActive) {
        section.querySelectorAll('.skill-card, .project-card, .stat-card, .contact-link').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      }
    });
  };

  setActiveSection('inicio');

  allLinks.forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const targetId = href.substring(1);

      if (targetId === 'contacto') {
        event.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
      }

      event.preventDefault();
      setActiveSection(targetId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ── 7. Custom cursor + background motion effect ──────────────
  const customCursor = document.createElement('div');
  customCursor.id = 'custom-cursor';
  body.appendChild(customCursor);

  const hoverTargets = [
    'a',
    'button',
    '.btn',
    '.nav__link',
    '.contact-link',
    '.music-toggle',
    '.theme-toggle',
    '.hamburger'
  ].join(',');

  document.addEventListener('mousemove', event => {
    const x = event.clientX;
    const y = event.clientY;

    customCursor.style.left = `${x}px`;
    customCursor.style.top = `${y}px`;

    const offsetX = 35 + (x / window.innerWidth) * 30;
    const offsetY = 20 + (y / window.innerHeight) * 25;
    document.documentElement.style.setProperty('--bg-offset-x', `${offsetX}%`);
    document.documentElement.style.setProperty('--bg-offset-y', `${offsetY}%`);
  });

  document.addEventListener('mousedown', () => customCursor.classList.add('cursor-active'));
  document.addEventListener('mouseup', () => customCursor.classList.remove('cursor-active'));
  document.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-hover', 'cursor-active'));

  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-hover'));
  });

  document.addEventListener('selectionchange', () => {
    const selection = document.getSelection();
    if (selection && selection.toString().length) {
      customCursor.classList.add('cursor-active');
    } else {
      customCursor.classList.remove('cursor-active');
    }
  });

})();
