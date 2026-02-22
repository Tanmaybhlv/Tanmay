(() => {
  'use strict';

  const EASE = 'power3.out';
  const EASE_EXPO = 'expo.out';
  const EASE_BACK = 'back.out(1.2)';
  const DURATION = 0.75;

  gsap.registerPlugin(ScrollTrigger);

  // ==========================================
  // LENIS SMOOTH SCROLL + Scroll Velocity
  // ==========================================
  let lenis;
  let scrollVelocity = 0;

  function initLenis() {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Track scroll velocity for marquee speed modulation
    lenis.on('scroll', ({ velocity }) => {
      scrollVelocity = velocity;
    });

    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -80 });
          navMenu.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      });
    });
  }

  // ==========================================
  // CINEMATIC LOADER
  // ==========================================
  const loader = document.getElementById('loader');
  const loaderCounter = document.getElementById('loaderCounter');
  const loaderBarFill = document.getElementById('loaderBarFill');
  const loaderChars = document.querySelectorAll('.loader-char');

  function runLoader() {
    gsap.set(loaderChars, { opacity: 0, y: 20 });

    const loaderTL = gsap.timeline({
      onComplete: () => {
        const exitTL = gsap.timeline();
        exitTL
          .to('.loader-counter', { y: -40, opacity: 0, duration: 0.4, ease: EASE })
          .to('.loader-bar-track', { scaleX: 0, opacity: 0, duration: 0.3, ease: EASE }, '-=0.2')
          .to('.loader-char', { y: -30, opacity: 0, stagger: 0.03, duration: 0.3, ease: EASE }, '-=0.2')
          .to(loader, {
            clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)',
            duration: 1,
            ease: 'power4.inOut',
            onComplete: () => {
              loader.classList.add('loaded');
              loader.style.display = 'none';
              document.body.classList.add('ready');
              initLenis();
              initAllAnimations();
            }
          }, '-=0.1');
      }
    });

    const counter = { val: 0 };
    loaderTL.to(counter, {
      val: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(counter.val);
        loaderCounter.textContent = v;
        loaderBarFill.style.width = v + '%';
      }
    });

    loaderTL.to(loaderChars, {
      opacity: 1, y: 0,
      stagger: 0.06, duration: 0.5, ease: EASE_BACK,
    }, 0.3);
  }

  window.addEventListener('load', () => { runLoader(); });

  // ==========================================
  // SCROLL PROGRESS BAR
  // ==========================================
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    });
  }

  // ==========================================
  // PARTICLE CANVAS
  // ==========================================
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 50;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(67, 97, 238, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(67, 97, 238, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ==========================================
  // CUSTOM CURSOR
  // ==========================================
  const cursor = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.12;
      trailY += (mouseY - trailY) * 0.12;
      cursorTrail.style.transform = `translate(${trailX}px, ${trailY}px)`;
      requestAnimationFrame(animateTrail);
    }
    animateTrail();

    document.querySelectorAll('a, button, .project-card, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        cursorTrail.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        cursorTrail.classList.remove('cursor-hover');
      });
    });
  } else {
    cursor.style.display = 'none';
    cursorTrail.style.display = 'none';
  }

  // ==========================================
  // NAVIGATION
  // ==========================================
  const nav = document.getElementById('nav');
  const navMenu = document.getElementById('navMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('nav-scrolled', scrollY > 100);
    nav.classList.toggle('nav-hidden', scrollY > lastScroll && scrollY > 400);
    lastScroll = scrollY;
  });

  navMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
    if (lenis) {
      mobileMenu.classList.contains('active') ? lenis.stop() : lenis.start();
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
      if (lenis) lenis.start();
    });
  });

  // ==========================================
  // ACTIVE NAV LINK
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 200) {
        current = section.getAttribute('id');
      }
    });
    navLinksAll.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  });

  // ==========================================
  // ALL ANIMATIONS — master init
  // ==========================================
  function initAllAnimations() {
    initHeroAnimation();
    initSplitText();
    initSectionHeaders();
    initWordReveal();
    initPinnedPhoto();
    initFannedCards();
    initScrollVelocityMarquee();
    initContinuousParallax();
    initScrollReveals();
    initHorizontalScroll();
    initMarquee();
    initNavTheme();
    initSkillBars();
    initCounters();
    initContactAnimation();
  }

  // ==========================================
  // HERO — Photo-centered with scroll signature
  // ==========================================
  function initHeroAnimation() {
    const section     = document.getElementById('hero');
    const nameCorner  = document.getElementById('heroNameCorner');
    const photo       = document.getElementById('heroPhoto');
    const signature   = document.getElementById('signatureSVG');
    const label       = document.getElementById('heroLabel');
    const scroll      = document.getElementById('heroScroll');
    const heroImg     = document.getElementById('heroImg');
    const marqueeBg   = document.querySelector('.hero-marquee-bg');
    if (!section || !photo || !signature) return;

    // --- Entrance animation (no scroll, plays on load) ---
    gsap.set('.hero-name-first', { y: '120%', opacity: 0 });
    gsap.set('.hero-name-last', { y: '120%', opacity: 0 });
    gsap.set(scroll, { y: 30, opacity: 0 });
    gsap.set('.hero-grid-line', { opacity: 0 });
    gsap.set(photo, { scale: 1 });
    gsap.set(heroImg, { filter: 'grayscale(0%) brightness(1)' });
    gsap.set(signature, { autoAlpha: 0 });
    gsap.set(label, { opacity: 0, y: 10 });
    if (marqueeBg) gsap.set(marqueeBg, { opacity: 0 });

    const entranceTL = gsap.timeline({
      defaults: { ease: EASE_EXPO, duration: 1.2 }
    });

    entranceTL
      .to('.hero-name-first', { y: '0%', opacity: 1, duration: 1, ease: 'power4.out' })
      .to('.hero-name-last', { y: '0%', opacity: 1, duration: 1, ease: 'power4.out' }, '-=0.7')
      .to('.hero-grid-line', { opacity: 0.15, stagger: 0.08, duration: 0.6 }, '-=0.8')
      .to(scroll, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');

    // --- Scroll-driven timeline (section is 400vh, content is sticky) ---
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5
      }
    });

    // Phase 1 (0–20%): Name fades out, scroll indicator hides
    tl.to(nameCorner, { opacity: 0, y: -40, ease: 'none', duration: 0.2 }, 0);
    tl.to(scroll, { opacity: 0, ease: 'none', duration: 0.1 }, 0);

    // Phase 2 (20–50%): Container scales down, image goes greyscale
    tl.to(photo, { scale: 0.55, ease: 'none', duration: 0.3 }, 0.2);
    tl.to(heroImg, { filter: 'grayscale(100%) brightness(0.85)', ease: 'none', duration: 0.3 }, 0.2);

    // Phase 3 (30–55%): Signature wipes in from top to bottom via clip-path
    gsap.set(signature, { clipPath: 'inset(0% 0% 100% 0%)' });
    tl.to(signature, { autoAlpha: 1, duration: 0.01 }, 0.29);
    tl.to(signature, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 0.25 }, 0.30);

    // Marquee bg fades in and counter-scales to stay full size as photo shrinks
    if (marqueeBg) {
      tl.to(marqueeBg, { opacity: 1, ease: 'none', duration: 0.15 }, 0.25);
      // Photo scales from 1 → 0.55, so marquee must scale from 1 → 1/0.55 ≈ 1.82
      tl.fromTo(marqueeBg, { scale: 1 }, { scale: 1 / 0.55, ease: 'none', duration: 0.3 }, 0.2);
    }

    // Phase 4 (75–90%): TB label fades in
    tl.to(label, { opacity: 1, y: 0, ease: 'none', duration: 0.15 }, 0.75);

    // Background text parallax
    const heroBgText = document.querySelector('.hero-bg-text');
    if (heroBgText) {
      gsap.to(heroBgText, {
        y: 300, scale: 1.05, opacity: 0,
        scrollTrigger: { trigger: section, start: 'top top', end: '25% top', scrub: 1 }
      });
    }

    // Marquee parallax
    gsap.to('.impact-marquee-1', {
      y: -30,
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
    gsap.to('.impact-marquee-2', {
      y: 20,
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  }

  // ==========================================
  // SPLIT TEXT — line-level wipe
  // ==========================================
  function initSplitText() {
    document.querySelectorAll('.split-text').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      el.setAttribute('aria-label', text);
      const lineWrap = document.createElement('span');
      lineWrap.classList.add('line-wrap');
      const lineInner = document.createElement('span');
      lineInner.classList.add('line-inner');
      lineInner.textContent = text;
      lineWrap.appendChild(lineInner);
      el.appendChild(lineWrap);
    });

    document.querySelectorAll('.section-title.split-text').forEach(el => {
      const inner = el.querySelector('.line-inner');
      if (!inner) return;
      gsap.set(inner, { y: '110%' });
      gsap.to(inner, {
        y: '0%', duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
  }

  // ==========================================
  // SECTION HEADERS
  // ==========================================
  function initSectionHeaders() {
    document.querySelectorAll('.section-header').forEach(header => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: header, start: 'top 85%', once: true }
      });
      const index = header.querySelector('.section-index');
      const subtitle = header.querySelector('.section-subtitle');

      if (index) {
        gsap.set(index, { x: -30, opacity: 0 });
        tl.to(index, { x: 0, opacity: 1, duration: DURATION, ease: EASE });
      }
      if (subtitle) {
        gsap.set(subtitle, { y: 20, opacity: 0 });
        tl.to(subtitle, { y: 0, opacity: 1, duration: DURATION, ease: EASE }, '-=0.3');
      }
      tl.fromTo(header, { '--line-width': '0px' }, { '--line-width': '120px', duration: 1, ease: EASE }, '-=0.4');
    });
  }

  // ==========================================
  // WORD-BY-WORD REVEAL — About impact text
  // ==========================================
  function initWordReveal() {
    const words = document.querySelectorAll('.about-impact-text .word');
    if (!words.length) return;

    gsap.set(words, { opacity: 0.15, y: 12 });

    gsap.to(words, {
      opacity: 1, y: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: EASE,
      scrollTrigger: {
        trigger: '.about-impact-text',
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 1
      }
    });
  }

  // ==========================================
  // PINNED PHOTO SECTION — Full-bleed with word reveal
  // ==========================================
  function initPinnedPhoto() {
    const section = document.querySelector('.pinned-photo-section');
    if (!section) return;

    const words = section.querySelectorAll('.pinned-word');
    const bg = section.querySelector('.pinned-photo-img');

    // Set initial states
    gsap.set(words, { opacity: 0, y: 40 });

    // Pin the section and reveal words one by one
    const pinnedTL = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 1.5,
      }
    });

    // Background zoom
    if (bg) {
      pinnedTL.fromTo(bg, { scale: 1.2 }, { scale: 1, duration: 1 }, 0);
    }

    // Words reveal one by one with stagger
    pinnedTL.to(words, {
      opacity: 1, y: 0,
      stagger: 0.06,
      duration: 0.5,
      ease: EASE
    }, 0.2);

  }

  // ==========================================
  // FANNED CERTIFICATION CARDS
  // ==========================================
  function initFannedCards() {
    const fan = document.getElementById('certsFan');
    if (!fan) return;

    const cards = fan.querySelectorAll('.cert-fan-card');
    const totalCards = cards.length;
    const midIndex = (totalCards - 1) / 2;

    // Only apply fanned layout on screens wide enough
    if (window.innerWidth <= 480) return;

    // Set initial state: all cards stacked in center
    cards.forEach((card) => {
      gsap.set(card, { rotation: 0, y: 0, opacity: 0, scale: 0.9 });
    });

    // Fan out on scroll
    ScrollTrigger.create({
      trigger: fan,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        cards.forEach((card, i) => {
          const offset = i - midIndex;
          const rotation = offset * 5; // 5 degrees per card from center
          const xShift = offset * 30; // horizontal spread

          gsap.to(card, {
            rotation: rotation,
            x: xShift,
            y: Math.abs(offset) * -8, // slight arc — cards near edges lift
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: EASE_BACK,
            delay: Math.abs(offset) * 0.04, // center cards first, edges last
          });
        });
      }
    });

    // Continuous subtle float on scroll
    gsap.to(fan, {
      rotateY: 3,
      scrollTrigger: { trigger: fan, start: 'top bottom', end: 'bottom top', scrub: 2 }
    });
  }

  // ==========================================
  // SCROLL-VELOCITY MARQUEE — speed reacts to scroll
  // ==========================================
  function initScrollVelocityMarquee() {
    const tracks = document.querySelectorAll('.marquee-track');
    if (!tracks.length) return;

    // Modulate CSS animation speed based on scroll velocity
    let baseSpeed = 1;
    let currentSpeed = 1;

    function updateMarqueeSpeed() {
      const targetSpeed = 1 + Math.min(Math.abs(scrollVelocity) * 0.003, 4);
      currentSpeed += (targetSpeed - currentSpeed) * 0.08; // smooth lerp

      tracks.forEach(track => {
        track.style.animationDuration = (
          track.classList.contains('marquee-track-reverse')
            ? 30 / currentSpeed
            : 35 / currentSpeed
        ) + 's';
      });

      requestAnimationFrame(updateMarqueeSpeed);
    }

    updateMarqueeSpeed();

    // Also modulate impact marquee tracks
    const impactTracks = document.querySelectorAll('.impact-marquee-track');
    function updateImpactSpeed() {
      const targetSpeed = 1 + Math.min(Math.abs(scrollVelocity) * 0.002, 3);
      const smooth = 1 + (targetSpeed - 1) * 0.1;

      impactTracks.forEach(track => {
        const isReverse = track.classList.contains('impact-marquee-track-reverse');
        track.style.animationDuration = (isReverse ? 18 / smooth : 20 / smooth) + 's';
      });

      requestAnimationFrame(updateImpactSpeed);
    }
    if (impactTracks.length) updateImpactSpeed();
  }

  // ==========================================
  // CONTINUOUS PARALLAX
  // ==========================================
  function initContinuousParallax() {
    // Each section container drifts with scroll
    document.querySelectorAll('.section .container, .horizontal-header .container').forEach(container => {
      gsap.fromTo(container, { y: 60 }, {
        y: -60,
        scrollTrigger: {
          trigger: container.closest('.section') || container.closest('.horizontal-section'),
          start: 'top bottom', end: 'bottom top', scrub: 1.5
        }
      });
    });

    // Timeline items drift
    document.querySelectorAll('.timeline-item').forEach((item) => {
      gsap.fromTo(item, { y: 30 }, {
        y: -15,
        scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    });

    // Stat cards parallax with staggered depth
    document.querySelectorAll('.stat').forEach((stat, i) => {
      gsap.fromTo(stat, { y: 20 * (i + 1) }, {
        y: -15 * (i + 1),
        scrollTrigger: {
          trigger: stat.closest('.about-stats'),
          start: 'top bottom', end: 'bottom top', scrub: 1
        }
      });
    });

    // Project images scale on scroll
    document.querySelectorAll('.project-card-img img').forEach(img => {
      gsap.fromTo(img, { scale: 1.2 }, {
        scale: 1,
        scrollTrigger: {
          trigger: img.closest('.project-card'),
          start: 'top bottom', end: 'bottom top', scrub: 1
        }
      });
    });

    // Light sections fade in on approach
    document.querySelectorAll('.section[data-theme="light"]').forEach(section => {
      gsap.fromTo(section, { opacity: 0.6 }, {
        opacity: 1,
        scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 20%', scrub: 1 }
      });
    });

    // Education cards subtle rotation on scroll
    document.querySelectorAll('.edu-card').forEach((card, i) => {
      gsap.fromTo(card, { rotateY: i % 2 === 0 ? -3 : 3 }, {
        rotateY: i % 2 === 0 ? 3 : -3,
        transformPerspective: 1000,
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 2 }
      });
    });
  }

  // ==========================================
  // SCROLL REVEALS
  // ==========================================
  function initScrollReveals() {
    // About text paragraphs
    gsap.utils.toArray('.about-text .reveal').forEach((el, i) => {
      gsap.set(el, { y: 80, opacity: 0 });
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1.2, ease: EASE_EXPO,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        delay: i * 0.15
      });
    });

    // Timeline items — slide in from left with rotation
    gsap.utils.toArray('.timeline-item').forEach((item) => {
      gsap.set(item, { x: -80, opacity: 0, rotateY: -5 });
      gsap.to(item, {
        x: 0, opacity: 1, rotateY: 0,
        duration: 1.2, ease: EASE_EXPO,
        transformPerspective: 1000,
        scrollTrigger: { trigger: item, start: 'top 88%', once: true }
      });
    });

    // Stats — slide in staggered
    gsap.utils.toArray('.stat').forEach((stat, i) => {
      gsap.set(stat, { x: -60, opacity: 0, scale: 0.9 });
      ScrollTrigger.create({
        trigger: stat, start: 'top 88%', once: true,
        onEnter: () => {
          gsap.to(stat, {
            x: 0, opacity: 1, scale: 1,
            duration: 1, ease: EASE_BACK, delay: i * 0.15
          });
        }
      });
    });

    // Cards batch stagger
    ['.edu-card', '.pub-card', '.leadership-card', '.skill-category'].forEach(selector => {
      gsap.utils.toArray(selector).forEach(el => {
        gsap.set(el, { y: 80, opacity: 0, scale: 0.92 });
      });
      ScrollTrigger.batch(selector, {
        start: 'top 90%', once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0, opacity: 1, scale: 1,
            stagger: 0.1, duration: 1, ease: EASE_EXPO
          });
        }
      });
    });

    // Contact links stagger
    gsap.utils.toArray('.contact-link-item').forEach(el => {
      gsap.set(el, { y: 40, opacity: 0 });
    });
    ScrollTrigger.batch('.contact-link-item', {
      start: 'top 88%', once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, opacity: 1, stagger: 0.1, duration: DURATION, ease: EASE });
      }
    });

    // Project card images — clip-path circle reveal
    document.querySelectorAll('.project-card-img').forEach(img => {
      gsap.set(img, { clipPath: 'circle(0% at 50% 50%)' });
      gsap.to(img, {
        clipPath: 'circle(120% at 50% 50%)',
        duration: 1.5, ease: 'power4.inOut',
        scrollTrigger: { trigger: img, start: 'top 85%', once: true }
      });
    });
  }

  // ==========================================
  // CONTACT ANIMATION — title + autograph
  // ==========================================
  function initContactAnimation() {
    const contactTitle = document.querySelector('.contact-title');
    if (contactTitle) {
      gsap.set(contactTitle, { y: 80, opacity: 0, scale: 0.95 });
      gsap.to(contactTitle, {
        y: 0, opacity: 1, scale: 1,
        duration: 1.2, ease: EASE_EXPO,
        scrollTrigger: { trigger: contactTitle, start: 'top 85%', once: true }
      });
    }

    // Contact accent words get a staggered color pulse
    const accents = document.querySelectorAll('.contact-accent');
    if (accents.length) {
      gsap.set(accents, { opacity: 0.3, y: 20 });
      ScrollTrigger.create({
        trigger: '.contact-title',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(accents, {
            opacity: 1, y: 0,
            stagger: 0.2,
            duration: 1,
            ease: EASE_BACK,
            delay: 0.4
          });
        }
      });
    }

    // Contact section index
    const contactIndex = document.querySelector('.contact .section-index');
    if (contactIndex) {
      gsap.set(contactIndex, { x: -20, opacity: 0 });
      gsap.to(contactIndex, {
        x: 0, opacity: 1, duration: 0.8, ease: EASE,
        scrollTrigger: { trigger: contactIndex, start: 'top 88%', once: true }
      });
    }
  }

  // ==========================================
  // HORIZONTAL SCROLL
  // ==========================================
  function initHorizontalScroll() {
    const hSection = document.querySelector('.horizontal-section');
    const hTrack = document.querySelector('.horizontal-track');
    if (!hSection || !hTrack) return;

    const getScrollDist = () => hTrack.scrollWidth - window.innerWidth;

    gsap.to(hTrack, {
      x: () => -getScrollDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: hSection,
        start: 'top top',
        end: () => '+=' + getScrollDist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });
  }

  // ==========================================
  // MARQUEE CONTROLLED START
  // ==========================================
  function initMarquee() {
    document.querySelectorAll('.marquee-track').forEach(track => {
      track.style.animationPlayState = 'paused';
      ScrollTrigger.create({
        trigger: track.parentElement,
        start: 'top 95%', once: true,
        onEnter: () => { track.style.animationPlayState = 'running'; }
      });
    });
  }

  // ==========================================
  // NAV THEME SWITCHING
  // ==========================================
  function initNavTheme() {
    document.querySelectorAll('[data-theme]').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80px',
        end: 'bottom 80px',
        onEnter: () => nav.setAttribute('data-nav-theme', section.getAttribute('data-theme')),
        onEnterBack: () => nav.setAttribute('data-nav-theme', section.getAttribute('data-theme')),
      });
    });
  }

  // ==========================================
  // SKILL BARS
  // ==========================================
  function initSkillBars() {
    document.querySelectorAll('.skill-fill').forEach(el => {
      const width = el.getAttribute('data-width');
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => { gsap.to(el, { width: width + '%', duration: 1.5, ease: EASE_EXPO }); }
      });
    });
  }

  // ==========================================
  // COUNTERS
  // ==========================================
  function initCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'));
      const counter = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: target, duration: 2, ease: 'power4.out',
            onUpdate: () => { el.textContent = Math.round(counter.val); }
          });
        }
      });
    });
  }

  // ==========================================
  // TILT EFFECT ON CARDS
  // ==========================================
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;

        gsap.to(card, {
          rotateX, rotateY, z: 15, transformPerspective: 800,
          duration: 0.4, ease: 'power2.out', overwrite: 'auto'
        });

        const shine = card.querySelector('.project-card-shine, .edu-card-shine, .pub-card-shine, .leadership-card-shine');
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(67,97,238,0.2), transparent 60%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, z: 0, duration: 0.6, ease: EASE, overwrite: 'auto' });
        const shine = card.querySelector('.project-card-shine, .edu-card-shine, .pub-card-shine, .leadership-card-shine');
        if (shine) shine.style.background = 'none';
      });
    });
  }

  // ==========================================
  // MAGNETIC BUTTONS
  // ==========================================
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      const strength = parseFloat(btn.getAttribute('data-strength')) || 10;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x / strength, y: y / strength, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        const btnText = btn.querySelector('.btn-text');
        if (btnText) gsap.to(btnText, { x: x / (strength * 1.5), y: y / (strength * 1.5), duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: EASE, overwrite: 'auto' });
        const btnText = btn.querySelector('.btn-text');
        if (btnText) gsap.to(btnText, { x: 0, y: 0, duration: 0.6, ease: EASE, overwrite: 'auto' });
      });
    });
  }
})();
