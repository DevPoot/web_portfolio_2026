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

})();
