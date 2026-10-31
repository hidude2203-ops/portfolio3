function initApp() {
  const hasVisited = sessionStorage.getItem('portfolio_visited') === 'true';
  const urlHash = window.location.hash;

  if (!hasVisited) {
    sessionStorage.setItem('portfolio_visited', 'true');
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  } else if (urlHash) {
    setTimeout(() => {
      const targetEl = document.querySelector(urlHash);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  }

  // ----------------------------------------------------
  // 0. GLOBAL DOM DECLARATIONS
  // ----------------------------------------------------
  const themes = ['lime', 'black', 'white', 'rose', 'pink'];
  let currentThemeIndex = 0;

  const navCapsule = document.getElementById('nav-capsule');
  const navIndicator = document.getElementById('nav-indicator');
  const navItems = document.querySelectorAll('.nav-item');
  const heroCard = document.getElementById('hero-card');
  let activeNavItem = (navItems && navItems.length > 0) ? navItems[0] : null;

  const prevThemeBtn = document.getElementById('prev-theme-btn');
  const nextThemeBtn = document.getElementById('next-theme-btn');

  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderStatus = document.getElementById('preloader-status');
  const preloaderPercent = document.getElementById('preloader-percent');

  const contactDrawer = document.getElementById('contact-drawer');
  const caseStudyDrawer = document.getElementById('case-study-drawer');
  const approachDrawer = document.getElementById('approach-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  const welcomeBackdrop = document.getElementById('welcome-modal-backdrop');
  const welcomeCloseBtn = document.getElementById('welcome-modal-close-btn');
  const welcomeContinueBtn = document.getElementById('welcome-continue-btn');
  const welcomeThemeCircles = document.querySelectorAll('.welcome-theme-circle');

  // ----------------------------------------------------
  // 1. FAST & FAILSAFE PRELOADER HIDING
  // ----------------------------------------------------
  const hidePreloader = () => {
    if (preloader) {
      preloader.classList.add('is-hidden');
      preloader.style.display = 'none';
    }
    document.body.classList.add('hero-animated');
  };

  if (hasVisited) {
    hidePreloader();
  } else if (preloader) {
    let startTime = null;
    const duration = 1000; // 1 second total fill duration

    function animatePreloader(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);

      if (preloaderBar) preloaderBar.style.width = `${progress}%`;
      if (preloaderPercent) preloaderPercent.textContent = `${Math.floor(progress)}%`;

      if (progress < 100) {
        requestAnimationFrame(animatePreloader);
      } else {
        if (preloaderBar) preloaderBar.style.width = '100%';
        if (preloaderPercent) preloaderPercent.textContent = '100%';
        if (preloaderStatus) preloaderStatus.textContent = 'CANVAS READY!';
        setTimeout(hidePreloader, 200);
      }
    }

    requestAnimationFrame(animatePreloader);
  }

  // ----------------------------------------------------
  // 2. THEME SWITCHER (WHITE, ROSE, BLACK, LIME, PINK)
  // ----------------------------------------------------
  function applyTheme(index) {
    currentThemeIndex = (index + themes.length) % themes.length;
    const activeTheme = themes[currentThemeIndex];
    document.body.setAttribute('data-theme', activeTheme);
    try {
      localStorage.setItem('portfolio_theme', activeTheme);
    } catch (e) {}

    if (welcomeThemeCircles) {
      welcomeThemeCircles.forEach(circle => {
        if (circle.dataset.theme === activeTheme) {
          circle.classList.add('is-selected');
        } else {
          circle.classList.remove('is-selected');
        }
      });
    }

    if (activeNavItem) {
      setTimeout(() => moveIndicatorTo(activeNavItem), 50);
    }
  }

  // Restore saved theme on load if available
  try {
    const savedTheme = localStorage.getItem('portfolio_theme');
    if (savedTheme && themes.includes(savedTheme)) {
      currentThemeIndex = themes.indexOf(savedTheme);
      applyTheme(currentThemeIndex);
    }
  } catch (e) {}

  if (prevThemeBtn) {
    prevThemeBtn.addEventListener('click', () => {
      applyTheme(currentThemeIndex - 1);
    });
  }

  if (nextThemeBtn) {
    nextThemeBtn.addEventListener('click', () => {
      applyTheme(currentThemeIndex + 1);
    });
  }

  // ----------------------------------------------------
  // 3. DYNAMIC SLIDING NAV PILL INDICATOR
  // ----------------------------------------------------
  let indicatorRaf = null;
  function moveIndicatorTo(item) {
    if (!item || !navIndicator) return;
    if (indicatorRaf) cancelAnimationFrame(indicatorRaf);
    indicatorRaf = requestAnimationFrame(() => {
      const leftOffset = item.offsetLeft;
      const itemWidth = item.offsetWidth;

      navIndicator.style.left = `${leftOffset}px`;
      navIndicator.style.width = `${itemWidth}px`;

      navItems.forEach(nav => {
        if (nav === item) {
          nav.classList.add('is-active-highlight');
        } else {
          nav.classList.remove('is-active-highlight');
        }
      });
    });
  }

  setTimeout(() => {
    if (activeNavItem) moveIndicatorTo(activeNavItem);
  }, 60);

  const heroAiHubCol = document.querySelector('.hero-ai-hub-col');
  function handleAiCoreVisibility() {
    if (!heroAiHubCol) return;
    if (window.innerWidth <= 1120) {
      heroAiHubCol.style.display = 'none';
    } else {
      heroAiHubCol.style.display = '';
    }
  }
  handleAiCoreVisibility();

  window.addEventListener('resize', () => {
    if (activeNavItem) moveIndicatorTo(activeNavItem);
    handleAiCoreVisibility();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (activeNavItem) moveIndicatorTo(activeNavItem);
      handleAiCoreVisibility();
    }, 150);
  });

  if (navItems) {
    navItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        moveIndicatorTo(item);
      });

      item.addEventListener('click', (e) => {
        e.preventDefault();
        activeNavItem = item;
        moveIndicatorTo(item);

        const targetId = item.getAttribute('href')?.replace('#', '');

        // Special Behavior for ABOUT US: Nudge bounce to indicate you are on About section
        if (targetId === 'about') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (heroCard) {
            heroCard.classList.remove('nudge-bounce');
            void heroCard.offsetWidth; // Trigger reflow
            heroCard.classList.add('nudge-bounce');
            setTimeout(() => heroCard.classList.remove('nudge-bounce'), 500);
          }
        }
        // Scroll down when SKILLS or other valid sections are clicked
        else if (targetId && targetId !== 'contact') {
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // Handle 'About Design' button click in Skills section
  const aboutAutoBtn = document.getElementById('about-automation-btn');
  if (aboutAutoBtn) {
    aboutAutoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const autoSection = document.getElementById('automation');
      if (autoSection) {
        autoSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (navCapsule) {
    navCapsule.addEventListener('mouseleave', () => {
      if (activeNavItem) moveIndicatorTo(activeNavItem);
    });
  }

  // Scroll Sync with Navigation Indicator
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const matchingNavItem = document.querySelector(`.nav-item[href="#${id}"]`);
        if (matchingNavItem) {
          activeNavItem = matchingNavItem;
          moveIndicatorTo(matchingNavItem);
        }
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('section[id]').forEach(section => {
    sectionObserver.observe(section);
  });

  // ----------------------------------------------------
  // 4. CONTACT & FIND US RIGHT SIDE DRAWER
  // ----------------------------------------------------
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const contactNavItem = document.getElementById('contact-nav-item');
  const findUsBtn = document.getElementById('find-us-btn');

  function openDrawer() {
    if (contactDrawer && drawerBackdrop) {
      contactDrawer.classList.add('is-open');
      drawerBackdrop.classList.add('is-open');
    }
  }

  function closeDrawer() {
    if (contactDrawer) contactDrawer.classList.remove('is-open');
    if (drawerBackdrop && 
        (!caseStudyDrawer || !caseStudyDrawer.classList.contains('is-open')) && 
        (!approachDrawer || !approachDrawer.classList.contains('is-open'))) {
      drawerBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  // 0.5-second (500ms) hover delay for CONTACT navigation item
  let contactHoverTimer = null;

  if (contactNavItem) {
    contactNavItem.addEventListener('mouseenter', () => {
      if (contactHoverTimer) clearTimeout(contactHoverTimer);
      contactHoverTimer = setTimeout(() => {
        openDrawer();
      }, 500);
    });

    contactNavItem.addEventListener('mouseleave', () => {
      if (contactHoverTimer) {
        clearTimeout(contactHoverTimer);
        contactHoverTimer = null;
      }
    });

    contactNavItem.addEventListener('click', (e) => {
      e.preventDefault();
      if (contactHoverTimer) clearTimeout(contactHoverTimer);
      openDrawer();
    });
  }

  // Open drawer instantly when clicking 'Find us'
  if (findUsBtn) {
    findUsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (contactHoverTimer) clearTimeout(contactHoverTimer);
      openDrawer();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }

  // ----------------------------------------------------
  // 5. INTERACTIVE BRAND MATRIX & PHILOSOPHY TABS
  // ----------------------------------------------------
  const brandTabs = document.querySelectorAll('.brand-tab');
  const brandTabContents = document.querySelectorAll('.brand-tab-content');

  if (brandTabs.length > 0) {
    brandTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = `tab-${tab.getAttribute('data-tab')}`;

        // Deactivate all tabs & contents
        brandTabs.forEach(t => t.classList.remove('active'));
        brandTabContents.forEach(c => c.classList.remove('active'));

        // Activate selected tab & content
        tab.classList.add('active');
        const targetContent = document.getElementById(targetTabId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // ----------------------------------------------------
  // 6. INSTANT OPTIMIZED CUSTOM CURSOR & EYE TRACKER
  // ----------------------------------------------------
  const cursorDot = document.getElementById('cursor-dot');
  const navEyesBtn = document.getElementById('nav-eyes-btn');
  const eyeSockets = document.querySelectorAll('.eye-socket');

  let eyeSocketCache = [];
  let isSection1Active = true;
  let mouseX = -100;
  let mouseY = -100;
  let cursorPending = false;
  let isTabActive = true;

  function updateEyeSocketCache() {
    eyeSocketCache = [];
    eyeSockets.forEach(socket => {
      const pupil = socket.querySelector('.eye-pupil');
      if (pupil) {
        const rect = socket.getBoundingClientRect();
        eyeSocketCache.push({
          pupil: pupil,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        });
      }
    });
  }

  function updateFaceState() {
    isSection1Active = window.scrollY < (window.innerHeight * 0.75);

    if (navEyesBtn) {
      if (isSection1Active) {
        navEyesBtn.classList.remove('is-sleeping');
      } else {
        navEyesBtn.classList.add('is-sleeping');
        eyeSocketCache.forEach(item => {
          item.pupil.style.transform = 'translate3d(0px, 0px, 0)';
        });
      }
    }
  }

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(updateFaceState);
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (isSection1Active) updateEyeSocketCache();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (isTabActive && isSection1Active) {
      updateEyeSocketCache();
    }
  });

  let lastPupilMouseX = -999;
  let lastPupilMouseY = -999;

  function renderCursorAndEyes() {
    cursorPending = false;
    if (!isTabActive) return;

    // 1. Move Custom Cursor Dot
    if (cursorDot) {
      cursorDot.classList.remove('hidden');
      cursorDot.style.transform = `translate3d(${mouseX - 4.5}px, ${mouseY - 4.5}px, 0)`;
    }

    // 2. Track Pupils (Only when in Section 1 and mouse moved)
    if (isSection1Active && eyeSocketCache.length > 0) {
      if (Math.abs(mouseX - lastPupilMouseX) > 1.5 || Math.abs(mouseY - lastPupilMouseY) > 1.5) {
        lastPupilMouseX = mouseX;
        lastPupilMouseY = mouseY;
        for (let i = 0; i < eyeSocketCache.length; i++) {
          const item = eyeSocketCache[i];
          const deltaX = mouseX - item.centerX;
          const deltaY = mouseY - item.centerY;
          const distSq = deltaX * deltaX + deltaY * deltaY;
          if (distSq > 0) {
            const dist = Math.sqrt(distSq);
            const factor = Math.min(4.8, dist / 8) / dist;
            const moveX = Math.round(deltaX * factor * 10) / 10;
            const moveY = Math.round(deltaY * factor * 10) / 10;
            item.pupil.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
          }
        }
      }
    }
  }

  if (cursorDot || eyeSockets.length > 0) {
    updateEyeSocketCache();

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!cursorPending) {
        cursorPending = true;
        requestAnimationFrame(renderCursorAndEyes);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.classList.add('hidden');
    });

    document.addEventListener('mouseenter', () => {
      if (cursorDot) cursorDot.classList.remove('hidden');
    });

    document.addEventListener('mousedown', () => {
      if (cursorDot) cursorDot.classList.remove('hidden');
    }, true);

    document.addEventListener('mouseup', () => {
      if (cursorDot) cursorDot.classList.remove('hidden');
    }, true);
  }

  // ----------------------------------------------------
  // 7. EXPAND / COLLAPSE TOOLS Capsules (+ More / - Less)
  // ----------------------------------------------------
  const toggleMoreToolsBtn = document.getElementById('toggle-more-tools-btn');
  const toggleLessToolsBtn = document.getElementById('toggle-less-tools-btn');
  const extraToolsContainer = document.getElementById('extra-tools-container');

  if (extraToolsContainer) {
    if (toggleMoreToolsBtn) {
      toggleMoreToolsBtn.addEventListener('click', () => {
        extraToolsContainer.classList.remove('is-hidden');
        toggleMoreToolsBtn.classList.add('is-hidden');
        toggleMoreToolsBtn.style.display = 'none';
      });
    }
    if (toggleLessToolsBtn) {
      toggleLessToolsBtn.addEventListener('click', () => {
        extraToolsContainer.classList.add('is-hidden');
        if (toggleMoreToolsBtn) {
          toggleMoreToolsBtn.classList.remove('is-hidden');
          toggleMoreToolsBtn.style.display = 'inline-flex';
        }
      });
    }
  }

  // ----------------------------------------------------
  // ----------------------------------------------------
  // 8. SYSTEMS I'VE BUILT (PROJECTS SHOWCASE SWITCHER - 4 PROJECTS)
  // ----------------------------------------------------
  const darkCards = document.querySelectorAll('.project-dark-card');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const mainPanel = document.getElementById('projects-main-panel');

  function getToolIcon(tool) {
    const t = (tool || '').toLowerCase();
    if (t.includes('photoshop') || t.includes('ps')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="#31A8FF"><rect width="24" height="24" rx="4" fill="#001E36"/><path d="M5.5 6.5h4.2c2.2 0 3.8 1.2 3.8 3.2 0 2.2-1.6 3.3-3.8 3.3h-2v4.5h-2.2V6.5zm2.2 4.7h2c1 0 1.8-.4 1.8-1.5s-.8-1.4-1.8-1.4h-2v2.9zm8.1 4.3c.7.5 1.7.9 2.7.9 1.1 0 1.6-.4 1.6-1 0-1.6-4.5-.8-4.5-3.8 0-1.7 1.4-2.8 3.5-2.8 1.1 0 2 .3 2.6.7l-.6 1.7c-.5-.3-1.2-.6-2-.6-1 0-1.4.4-1.4.9 0 1.5 4.5.8 4.5 3.8 0 1.7-1.4 2.8-3.7 2.8-1.2 0-2.3-.3-3.1-.9l.9-1.7z" fill="#31A8FF"/></svg>';
    }
    if (t.includes('illustrator') || (t.includes('ai') && !t.includes('chain') && !t.includes('air'))) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="#FF9A00"><rect width="24" height="24" rx="4" fill="#330000"/><path d="M5 17.5l3.8-11h2.2l3.8 11h-2.3l-.8-2.6H7.7l-.8 2.6H5zm3.2-4.5h3.2l-1.6-5.1-1.6 5.1zm8.3-4.5v9h-2.1v-9h2.1zm-1.1-2c.7 0 1.2-.5 1.2-1.2s-.5-1.2-1.2-1.2-1.2.5-1.2 1.2.5 1.2 1.2 1.2z" fill="#FF9A00"/></svg>';
    }
    if (t.includes('indesign') || t.includes('id')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="#FF3366"><rect width="24" height="24" rx="4" fill="#49021F"/><path d="M6 6.5h2.4v11H6v-11zm5.2 0h3.5c3.2 0 4.8 2.2 4.8 5.5 0 3.4-1.8 5.5-4.8 5.5h-3.5v-11zm2.4 9.1h1.1c1.8 0 2.6-1.5 2.6-3.6 0-2-1-3.6-2.6-3.6h-1.1v7.2z" fill="#FF3366"/></svg>';
    }
    if (t.includes('figma')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF"/><path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE"/></svg>';
    }
    if (t.includes('lightroom') || t.includes('lr')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="#31A8FF"><rect width="24" height="24" rx="4" fill="#001E36"/><path d="M6 6.5h2.2v9h4.5v2H6v-11zm8.2 4.2h1.9v1.2c.4-.9 1.3-1.4 2.2-1.4.3 0 .6 0 .8.1v2.1c-.3-.1-.6-.1-.9-.1-1.3 0-1.8.8-1.8 2.3v2.7h-2.2v-6.9z" fill="#31A8FF"/></svg>';
    }
    if (t.includes('after effects') || t.includes('ae')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="#9999FF"><rect width="24" height="24" rx="4" fill="#00005B"/><path d="M5.5 17.5l3.5-11h2.2l3.5 11h-2.1l-.7-2.6H8.2l-.7 2.6H5.5zm3.2-4.5h2.8l-1.4-4.8-1.4 4.8zm7.3 1.2c.6 1.4 1.8 1.9 3.2 1.9 1 0 1.9-.3 2.5-.8l.8 1.4c-.9.7-2.1 1.1-3.6 1.1-2.9 0-4.8-1.9-4.8-4.8s1.9-4.8 4.6-4.8c2.9 0 4.4 2 4.4 4.6 0 .4 0 .7-.1 1h-7zm5-1.5c-.1-1.1-.9-2.2-2.3-2.2-1.3 0-2.2 1-2.4 2.2h4.7z" fill="#9999FF"/></svg>';
    }
    if (t.includes('typography') || t.includes('font') || t.includes('type') || t.includes('glyphs')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>';
    }
    if (t.includes('vector') || t.includes('pen') || t.includes('bezier') || t.includes('grid')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>';
    }
    if (t.includes('print') || t.includes('prepress') || t.includes('cmyk') || t.includes('preflight')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
    }
    if (t.includes('procreate') || t.includes('brush') || t.includes('media')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.375-9.375z"/><path d="M18 19c-1.5 1.5-4 2-6 2s-4.5-.5-6-2-2-4.5-2-6 1.5-4 3-4"/></svg>';
    }
    if (t.includes('displacement') || t.includes('texture') || t.includes('paper') || t.includes('halftone')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';
    }
    if (t.includes('color') || t.includes('grading')) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20v-20z" fill="#3B82F6"/></svg>';
    }
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }

  const projectsData = [
    {
      id: 0,
      title: "Interstellar: Best Font Pairings Specimen Poster",
      desc: "Cinematic sci-fi typographic specimen poster exploring cosmic scale, Gargantua black hole gravitational lensing, and curated editorial font pairing architecture.",
      hasFullData: true,
      imgSrc: "Interstellar Font Pairings Poster (1).png",
      imgAlt: "Interstellar Best Font Pairings Gargantua Black Hole Typographic Specimen Poster",
      nodes: [
        {
          title: "Cosmic Visual Research",
          desc: "Analyzed sci-fi cinematography and accretion disk gravitational lensing physics.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20v-20z" fill="currentColor"/></svg>'
        },
        {
          title: "Editorial Font Pairing Study",
          desc: "Harmonized bold grotesque sans with high-contrast italic swash serifs.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "Periodic Element Badge",
          desc: "Constructed the signature 08 Pa element badge with mathematical kerning.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h6M7 16h8"/></svg>'
        },
        {
          title: "Atmospheric Compositing",
          desc: "Blended icy mountain vistas, deep starfield nebulae, and lighting rim glows.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        },
        {
          title: "Prepress Print Calibration",
          desc: "Color-managed deep space rich blacks and golden photon ring CMYK balances.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>'
        }
      ],
      tools: ["Photoshop", "Illustrator", "Typography", "Prepress"],
      results: [
        { stat: "08 Pairings", label: "Curated typographic systems" },
        { stat: "300 DPI", label: "Large-format exhibition ready" },
        { stat: "Deep Space", label: "Gargantua black hole key art" }
      ],
      caseStudy: {
        title: "Interstellar: Best Font Pairings & Cinematic Specimen Poster",
        subtitle: "Harmonizing cosmic cinematic scale with editorial typographic pairing theory.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">The Creative Concept</h4>
            <p class="cs-block-p">Designed as both a visual tribute to Christopher Nolan's <em>Interstellar</em> and a practical design reference poster celebrating the art of typographic contrast. The poster captures the immense scale of human exploration juxtaposed against curated typographic pairing architecture.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Typographic Architecture</h4>
            <p class="cs-block-p">Centers around the dynamic interplay between a modern geometric sans ("best") and an expressive high-contrast italic serif ("font"), anchored by the periodic element box ("08 Pa irings"). Mathematical tracking and kerning balance ensure instant optical legibility across interstellar distances.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Compositing &amp; Lighting</h4>
            <ul class="cs-block-list">
              <li>🌌 <strong>Gargantua Accretion Disk:</strong> Gravitational lensing effects rendered with hyper-realistic photon ring glow curves.</li>
              <li>❄️ <strong>Atmospheric Depth:</strong> Frozen mountain terrain composited with directional rim lighting and ambient cosmic star dust.</li>
              <li>🖨️ <strong>Fine Art Print Quality:</strong> Calibrated for 300 DPI fine-art exhibition prints with rich space blacks and vivid golden hues.</li>
            </ul>
          </div>
        `,
        metricLabel: "Medium:",
        metricTag: "Key Art & Specimen ⚡"
      }
    },
    {
      id: 1,
      title: "Cinevision: Cillian Murphy Retrospective",
      desc: "High-contrast cinematic tribute poster featuring split duotone photo manipulation, bold Swiss typography, grainy texture overlays, and festival credits.",
      hasFullData: true,
      imgSrc: "Cinevision_ Cillian Murphy Retrospective.png",
      imgAlt: "Cinevision Cillian Murphy Film Retrospective Poster Design",
      nodes: [
        {
          title: "Creative Brief & Film Research",
          desc: "Curated key film stills and defined dramatic visual tone.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>'
        },
        {
          title: "Split Duotone Treatment",
          desc: "Crafted high-contrast black and amber/cyan split tone grading.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20v-20z" fill="currentColor"/></svg>'
        },
        {
          title: "Swiss Grid Architecture",
          desc: "Constructed rigid typographic hierarchy and festival billing blocks.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>'
        },
        {
          title: "Texture & Film Grain Overlay",
          desc: "Infused 35mm analogue grain, scratches, and subtle paper wear.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
        },
        {
          title: "Prepress Separation",
          desc: "Calibrated 300 DPI CMYK rich black ink balance.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>'
        }
      ],
      tools: ["Photoshop", "Illustrator", "Typography", "Prepress"],
      results: [
        { stat: "300 DPI", label: "Museum-grade print ready" },
        { stat: "Split Tone", label: "Bespoke color grading" },
        { stat: "Swiss Grid", label: "Editorial type balance" }
      ],
      caseStudy: {
        title: "Cinevision: Cillian Murphy Retrospective Key Art & Editorial Poster",
        subtitle: "Cinematic portrait treatment blending high-contrast split lighting with vintage festival editorial typography.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">The Creative Brief</h4>
            <p class="cs-block-p">The film retrospective needed an iconic centerpiece poster that captured the transformative gravitas of Cillian Murphy's career—bridging historical drama, noir tension, and psychological cinema into one unified visual narrative.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">The Design Solution</h4>
            <p class="cs-block-p">Created a multi-layered composite utilizing a striking split duotone color palette. Deep shadow undertones are counterbalanced by vivid amber highlights, honoring classic 35mm film grain. The composition leverages strict Swiss typographic alignment, framing the subject with clean festival metadata, bold tracking, and authentic credit typography.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Craft &amp; Execution</h4>
            <ul class="cs-block-list">
              <li>🎨 <strong>Split Duotone Grading:</strong> Hand-crafted curves in Photoshop for cinematic tonal depth.</li>
              <li>📐 <strong>Swiss Grid Hierarchy:</strong> Mathematical layout structuring festival dates, credits, and billing blocks.</li>
              <li>🖨️ <strong>Print Perfection:</strong> Color-managed CMYK separation calibrated for 300 DPI large-format exhibition.</li>
            </ul>
          </div>
        `,
        metricLabel: "Print Spec:",
        metricTag: "300 DPI CMYK ⚡"
      }
    },
    {
      id: 2,
      title: "Distorted Afterimage: Sonic Archive",
      desc: "Dark psychedelic audio-visual event poster showcasing glitch typography, chromatic aberration, fluid motion blur distortion, and a minimalist grid.",
      hasFullData: true,
      imgSrc: "Distorted Afterimage Archive.png",
      imgAlt: "Distorted Afterimage Sonic Archive Experimental Music Poster",
      nodes: [
        {
          title: "Soundscape Analysis",
          desc: "Distilled underground electronic and ambient audio frequencies.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5v14M7 9v6M22 11v2M2 11v2"/></svg>'
        },
        {
          title: "Kinetic Motion Displacement",
          desc: "Created optical motion blur and dynamic liquify wave distortion.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a9 9 0 1 0 0 12.7M14.1 11.3a4 4 0 1 0 0 5.7"/></svg>'
        },
        {
          title: "Chromatic Aberration",
          desc: "Separated RGB channels to induce eerie analog spectral glow.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0"/></svg>'
        },
        {
          title: "Glitch Typographic System",
          desc: "Arranged experimental monospaced track listings and coordinates.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "Deep Contrast Calibration",
          desc: "Pushed pure blacks for OLED displays and screen-printing.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20v-20z" fill="currentColor"/></svg>'
        }
      ],
      tools: ["Photoshop", "Illustrator", "Typography"],
      results: [
        { stat: "RGB & CMYK", label: "Dual digital/print assets" },
        { stat: "Glitch FX", label: "Kinetic motion distortion" },
        { stat: "High Impact", label: "Club & gallery presence" }
      ],
      caseStudy: {
        title: "Distorted Afterimage: Experimental Sonic Archive Key Visuals",
        subtitle: "Deconstructed typography and chromatic wave displacement for an underground audiovisual festival.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">The Creative Concept</h4>
            <p class="cs-block-p">The client sought a poster that visually echoed the disorienting, resonant frequencies of dark ambient and modular synthesizer performances. The visual had to feel alive with kinetic energy.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Visual Architecture</h4>
            <p class="cs-block-p">Constructed an optical illusion using multi-pass directional blur and displacement mapping. Monospaced typographic elements act as an anchor, creating high tension between rigid data and fluid, psychedelic distortion.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Highlights</h4>
            <ul class="cs-block-list">
              <li>⚡ <strong>Chromatic Channel Shift:</strong> Subtle RGB split creating analog CRT monitor aesthetic.</li>
              <li>📐 <strong>Modular Grid:</strong> Minimalist coordinates and event metadata for balanced readability.</li>
              <li>🖤 <strong>True Pitch Blacks:</strong> Optimized for silk-screen print and vibrant digital screens.</li>
            </ul>
          </div>
        `,
        metricLabel: "Aesthetic:",
        metricTag: "Glitch & Dark Wave ⚡"
      }
    },
    {
      id: 3,
      title: "Vanguard Partners: Every Dollar Counts",
      desc: "Brutalist financial campaign poster with high-contrast monetary typography, diagonal dynamic composition, and impactful focal accents.",
      hasFullData: true,
      imgSrc: "Every Dollar Counts Marketing Poster.png",
      imgAlt: "Every Dollar Counts Corporate Financial Campaign Poster",
      nodes: [
        {
          title: "Strategic Message Definition",
          desc: "Identified core call-to-action for financial efficiency.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
        },
        {
          title: "Diagonal Dynamic Composition",
          desc: "Engineered a high-tension diagonal baseline for visual momentum.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>'
        },
        {
          title: "Brutalist Typography",
          desc: "Paired ultra-bold headlines with crisp tabular financial data.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "High-Contrast Accent Grading",
          desc: "Spotlit key metrics using electric green focal illumination.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
        },
        {
          title: "Multi-Format Export",
          desc: "Generated large-format billboard and digital campaign assets.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
        }
      ],
      tools: ["InDesign", "Illustrator", "Photoshop", "Typography"],
      results: [
        { stat: "High Impact", label: "Instant headline retention" },
        { stat: "Vector Clean", label: "Infinitely crisp scaling" },
        { stat: "Omnichannel", label: "Print & digital billboard" }
      ],
      caseStudy: {
        title: "Vanguard Partners: 'Every Dollar Counts' Brand Campaign",
        subtitle: "Bold typographic campaign driving clarity and decisive momentum for financial advisory clients.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">The Campaign Challenge</h4>
            <p class="cs-block-p">Financial advisory communications are frequently perceived as dry and unengaging. The objective was to design a high-energy campaign poster that commands attention in corporate headquarters and metro stations alike.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Design Architecture</h4>
            <p class="cs-block-p">Utilized bold neo-brutalist typography, dynamic diagonal angles, and high-visibility financial callouts. Vibrant neon green accents cut through the deep charcoal paper texture, directing the viewer's eye straight to key ROI metrics.</p>
          </div>
        `,
        metricLabel: "Campaign Reach:",
        metricTag: "Metro & Digital ⚡"
      }
    },
    {
      id: 4,
      title: "Division: Tactical Streetwear Archive",
      desc: "Utilitarian streetwear poster featuring monochrome industrial aesthetics, technical barcode motifs, distressed stencil typography, and modular grids.",
      hasFullData: true,
      imgSrc: "Tactical Streetwear Archive Poster.png",
      imgAlt: "Tactical Streetwear Archive Fashion Lookbook Poster",
      nodes: [
        {
          title: "Apparel Silhouette Study",
          desc: "Captured high-fashion tactical garment hardware and fabrics.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
        },
        {
          title: "Industrial Swiss Grid",
          desc: "Engineered technical spec layout with precise metric callouts.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'
        },
        {
          title: "Technical Barcodes & Badges",
          desc: "Vectorized authentic scannable barcodes and serial insignias.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/></svg>'
        },
        {
          title: "Distressed Stencil Lettering",
          desc: "Designed rugged typography inspired by military cargo crates.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "Wheatpaste Poster Layout",
          desc: "Tailored layout for urban outdoor billposting and lookbooks.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
        }
      ],
      tools: ["Photoshop", "Illustrator", "Figma", "Prepress"],
      results: [
        { stat: "Lookbook Ready", label: "Seasonal collection hero" },
        { stat: "Monochrome", label: "Sleek industrial palette" },
        { stat: "Wheatpaste", label: "A1/A2 outdoor print specs" }
      ],
      caseStudy: {
        title: "Division: Tactical Urban Streetwear Seasonal Campaign Poster",
        subtitle: "Raw industrial aesthetics meeting technical fashion documentation for youth culture brand.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">Brand Context</h4>
            <p class="cs-block-p">Division needed a hero campaign poster for their seasonal tactical streetwear drop. The design had to merge utilitarian technical specifications with raw cyberpunk streetwear culture.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Design Execution</h4>
            <p class="cs-block-p">Incorporated military stencil lettering, serial tracking stamps, and a high-contrast monochrome aesthetic. The poster serves as both a wearable art lookbook piece and an urban wheatpaste poster designed to stand out on city brick walls.</p>
          </div>
        `,
        metricLabel: "Application:",
        metricTag: "Urban Streetwear ⚡"
      }
    },
    {
      id: 5,
      title: "The 911 Standard: Neo-Ukiyo-e Series",
      desc: "Fusion of classical Japanese woodblock print aesthetics with iconic automotive design, featuring Mount Fuji, the red sun, and custom kanji.",
      hasFullData: true,
      imgSrc: "The 911 Standard.png",
      imgAlt: "The 911 Standard Japanese Neo-Traditional Automotive Poster",
      nodes: [
        {
          title: "Historical Art Research",
          desc: "Studied Hokusai wave textures and traditional ukiyo-e palettes.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        },
        {
          title: "Automotive Vector Profiling",
          desc: "Digitally traced the aerodynamic silhouette of the Porsche 911.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>'
        },
        {
          title: "Halftone & Grain Shading",
          desc: "Applied vintage screen-print halftones and woodblock textures.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        },
        {
          title: "Custom Kanji Lettering",
          desc: "Integrated traditional Japanese typography and red seal stamps.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8M12 8v8M9 16h6"/></svg>'
        },
        {
          title: "Collector Fine Art Finish",
          desc: "Prepared 300 DPI giclée archival print specifications.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'
        }
      ],
      tools: ["Illustrator", "Photoshop", "Vector", "Prepress"],
      results: [
        { stat: "Giclée 300", label: "Archival fine art print" },
        { stat: "100% Vector", label: "Hand-crafted silhouette" },
        { stat: "Collector Art", label: "Limited edition series" }
      ],
      caseStudy: {
        title: "The 911 Standard: Heritage Automotive Meets Neo-Ukiyo-e Woodblock Art",
        subtitle: "Bridging European sports car engineering with 19th-century Japanese master woodblock aesthetics.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">Artistic Concept</h4>
            <p class="cs-block-p">An artistic homage exploring how European automotive icons translate into the timeless visual vernacular of Edo-period Japanese woodblock prints.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Craftsmanship</h4>
            <p class="cs-block-p">The legendary Porsche 911 is hand-vectorized with subtle linework, positioned beneath Mount Fuji and an imposing vermilion rising sun. Textured halftone ocean waves and traditional Japanese chop stamps complete this museum-worthy collector piece.</p>
          </div>
        `,
        metricLabel: "Medium:",
        metricTag: "Archival Giclée ⚡"
      }
    },
    {
      id: 6,
      title: "The Crow: Rainy Noir Theatrical Poster",
      desc: "Gothic noir tribute poster capturing atmospheric rain particle effects, moody ambient backlight, bespoke lettering, and cinematic contrast.",
      hasFullData: true,
      imgSrc: "The Crow_ Rainy Noir Poster.png",
      imgAlt: "The Crow Rainy Noir Atmospheric Theatrical Poster",
      nodes: [
        {
          title: "Dark Romantic Concept",
          desc: "Defined moody visual tone honoring gothic cinematic heritage.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>'
        },
        {
          title: "Atmospheric Lighting Setup",
          desc: "Painted cold blue rim lighting and torrential rain streaks.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/><line x1="16" y1="13" x2="16" y2="15"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="12" y1="15" x2="12" y2="17"/></svg>'
        },
        {
          title: "Character Silhouette Compositing",
          desc: "Integrated dramatic trench coat pose with dynamic shadow cast.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        },
        {
          title: "Hand-Lettered Title Treatment",
          desc: "Crafted distressed gothic serif typography for the title.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "Cinematic Billing Block",
          desc: "Formatted studio credits and theatrical release billing.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>'
        }
      ],
      tools: ["Photoshop", "Lightroom", "Typography"],
      results: [
        { stat: "Ultra Noir", label: "High-contrast dynamic range" },
        { stat: "Theatrical", label: "Key art standard layout" },
        { stat: "Atmospheric", label: "Hand-painted rain particles" }
      ],
      caseStudy: {
        title: "The Crow: Gothic Theatrical Tribute & Cinematic Key Art",
        subtitle: "Deep noir lighting and atmospheric rainfall compositing for cult film revival.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">The Vision</h4>
            <p class="cs-block-p">Created as a tribute key art poster celebrating the dark romanticism of 90s gothic cinema. The poster explores vulnerability and vengeance through silhouette, shadow, and heavy downpour atmosphere.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Atmosphere &amp; Texture</h4>
            <p class="cs-block-p">Utilized custom digital brushes for directional rain splashing against leather textures, backed by subtle industrial city streetlights. The typography is distressed by hand to evoke weathered gravestones.</p>
          </div>
        `,
        metricLabel: "Genre:",
        metricTag: "Cinematic Noir ⚡"
      }
    },
    {
      id: 7,
      title: "True Power: Vintage Birmingham Heritage",
      desc: "1920s Industrial Birmingham period key art celebrating grit and smoke with authentic letterpress woodtype and tactile parchment textures.",
      hasFullData: true,
      imgSrc: "True Power_ Vintage Birmingham Poster.png",
      imgAlt: "True Power Vintage Birmingham 1920s Heritage Poster",
      nodes: [
        {
          title: "Period Archive Documentation",
          desc: "Researched 1920s British industrial and woodtype posters.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>'
        },
        {
          title: "Authentic Letterpress Type",
          desc: "Typeset multi-weight slab serifs with historic character quirks.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "Foundry & Smoke Textures",
          desc: "Digitally blended soot, coal dust, and oxidized iron overlays.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        },
        {
          title: "Aged Paper Patina",
          desc: "Simulated tea-stained paper fibers and deckled edge fading.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
        },
        {
          title: "Sepia Harmonization",
          desc: "Calibrated muted warm umber and soot black color palette.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20v-20z" fill="currentColor"/></svg>'
        }
      ],
      tools: ["Photoshop", "Illustrator", "Typography", "Prepress"],
      results: [
        { stat: "1920s Woodtype", label: "Authentic letterpress look" },
        { stat: "Tactile Paper", label: "Textured fiber simulation" },
        { stat: "Historic Key Art", label: "Heritage exhibition ready" }
      ],
      caseStudy: {
        title: "True Power: Industrial Birmingham 1920s Heritage Key Art",
        subtitle: "Reviving early 20th-century British industrial typography with authentic letterpress aesthetics.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">Historical Concept</h4>
            <p class="cs-block-p">Drawing inspiration from post-WWI industrial Britain and historical Peaky Blinders lore, this piece captures the raw industrial grit, foundry smoke, and sheer willpower of 1920s Birmingham.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Letterpress Authenticity</h4>
            <p class="cs-block-p">Every typographic element replicates physical woodblock printing imperfections: uneven ink spread, slight letter misalignment, and authentic paper texture fiber that grounds the artwork in historical reality.</p>
          </div>
        `,
        metricLabel: "Style:",
        metricTag: "Vintage Woodtype ⚡"
      }
    },
    {
      id: 8,
      title: "Kiran Design: Geometric Identity Grid",
      desc: "Mathematical logo construction blueprint demonstrating golden-ratio bezier curves, precision geometric alignment, and dark vector aesthetics.",
      hasFullData: true,
      imgSrc: "Gemini_Generated_Image_cf1c4mcf1c4mcf1c.png",
      imgAlt: "Kiran Design Geometric Logo Construction Blueprint",
      nodes: [
        {
          title: "Concept & Monogram Sketches",
          desc: "Explored intersecting geometric initials and modern tech angles.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>'
        },
        {
          title: "Golden Ratio Geometry",
          desc: "Constructed mathematical circle tangents and proportional arcs.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 5 5 0 0 0 5-5 5 5 0 0 0-5-5 2.5 2.5 0 0 1-2.5-2.5 2.5 2.5 0 0 1 2.5-2.5"/></svg>'
        },
        {
          title: "Vector Bezier Crafting",
          desc: "Eliminated micro-nodes for seamless mathematical curvature.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
        },
        {
          title: "Blueprint Construction Sheet",
          desc: "Annotated radius lines, angle coordinates, and grid guides.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
        },
        {
          title: "Scalability Stress Testing",
          desc: "Verified legibility from 16px favicon to 10-meter signage.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>'
        }
      ],
      tools: ["Illustrator", "Vector", "Prepress"],
      results: [
        { stat: "Golden Ratio", label: "Harmonic curve geometry" },
        { stat: "Infinite Scale", label: "Lossless vector math" },
        { stat: "16px - 10m", label: "Flawless size legibility" }
      ],
      caseStudy: {
        title: "Kiran Design: Geometric Brandmark Construction & Blueprint",
        subtitle: "Precision geometric logo development using circular arcs, golden-ratio proportions, and blueprint documentation.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">The Brand Architecture</h4>
            <p class="cs-block-p">To embody cutting-edge technological prowess and structured elegance, the identity needed a mathematically sound geometric mark that communicates speed, precision, and architectural balance.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Mathematical Construction</h4>
            <p class="cs-block-p">Developed directly on a coordinate grid utilizing interlocking circles derived from the Fibonacci sequence. The technical blueprint sheet documents the exact arc radials, focal anchor points, and clear-space boundaries ensuring identical reproduction across digital and physical substrates.</p>
          </div>
        `,
        metricLabel: "Scalability:",
        metricTag: "Lossless Vector ⚡"
      }
    },
    {
      id: 9,
      title: "Kiran: Custom Retro Serif Wordmark",
      desc: "Custom tailored wordmark blending 1970s editorial warmth with crisp modern geometry, high-contrast serifs, and a vintage color palette.",
      hasFullData: true,
      imgSrc: "kiran.png",
      imgAlt: "Kiran Custom Retro Serif Handcrafted Wordmark",
      nodes: [
        {
          title: "Editorial Typographic Study",
          desc: "Analyzed 1970s publication mastheads and warm lifestyle logotypes.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
        },
        {
          title: "Custom Glyph Architecture",
          desc: "Drew bespoke teardrop terminals, sharp serifs, and curved ligatures.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>'
        },
        {
          title: "Optical Kerning Balance",
          desc: "Hand-spaced character pairs to achieve rhythm and visual weight.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "Warm Nostalgic Palette",
          desc: "Graded rich sunset orange, golden cream, and warm charcoal.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20v-20z" fill="currentColor"/></svg>'
        },
        {
          title: "Cross-Media Master Assets",
          desc: "Exported SVG, EPS, PDF, and high-res transparent PNGs.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
        }
      ],
      tools: ["Illustrator", "Typography", "Vector"],
      results: [
        { stat: "100% Bespoke", label: "Original letterforms" },
        { stat: "Editorial", label: "1970s retro aesthetic" },
        { stat: "Universal", label: "Vector, print & digital" }
      ],
      caseStudy: {
        title: "Kiran: Bespoke Retro Serif Typographic Wordmark",
        subtitle: "Handcrafted typographic identity harmonizing editorial nostalgia with contemporary clarity.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">Design Inspiration</h4>
            <p class="cs-block-p">Designed as a warm, humanistic signature brandmark. The bespoke letterforms recall the golden era of editorial book titles and record label typography while maintaining crisp modern vector geometry.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Bespoke Lettering</h4>
            <p class="cs-block-p">Features high-contrast stem-to-hairline ratios, smooth teardrop terminals on the lowercase forms, and tight optical kerning that radiates confidence, creativity, and timeless sophistication.</p>
          </div>
        `,
        metricLabel: "Type:",
        metricTag: "Custom Handcrafted ⚡"
      }
    },
    {
      id: 10,
      title: "Kiran Identity System: Brand Guidelines",
      desc: "Comprehensive brand identity system showcasing business cards, letterheads, typography rules, color swatches, and physical packaging applications.",
      hasFullData: true,
      imgSrc: "Gemini_Generated_Image_ck8qvnck8qvnck8q.png",
      imgAlt: "Kiran Complete Brand Identity System and Stationery Mockups",
      nodes: [
        {
          title: "Brand Identity Ecosystem",
          desc: "Defined voice, visual hierarchy, clear space, and brand ethos.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
        },
        {
          title: "Color Palette & Token System",
          desc: "Standardized HEX, RGB, CMYK, and Pantone spot colors.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20v-20z" fill="currentColor"/></svg>'
        },
        {
          title: "Typographic Hierarchy Manual",
          desc: "Specified headline, subhead, body, and caption pairings.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        },
        {
          title: "Stationery & Collateral Mockups",
          desc: "Rendered realistic business cards, letterheads, and envelopes.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
        },
        {
          title: "Comprehensive Brand Guide",
          desc: "Compiled complete brand bible for seamless corporate handoff.",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'
        }
      ],
      tools: ["InDesign", "Photoshop", "Illustrator", "Figma", "Prepress"],
      results: [
        { stat: "Full System", label: "Turnkey brand guidelines" },
        { stat: "Pantone + CMYK", label: "Calibrated print tokens" },
        { stat: "3D Mockups", label: "Real-world collateral proof" }
      ],
      caseStudy: {
        title: "Kiran Identity System: End-to-End Brand Guidelines & Stationery Suite",
        subtitle: "A complete corporate visual identity manual establishing cohesive rules across digital and tactile physical touchpoints.",
        execSummaryHTML: `
          <div class="cs-block">
            <h4 class="cs-block-heading">The Complete Identity Solution</h4>
            <p class="cs-block-p">A great logo requires a unified ecosystem to protect its integrity. This comprehensive brand manual provides turnkey guidelines across typography scales, color harmony tokens (RGB, CMYK, Pantone), clear space exclusion zones, and tactile print collateral.</p>
          </div>
          <div class="cs-block">
            <h4 class="cs-block-heading">Multi-Medium Collateral</h4>
            <p class="cs-block-p">Includes photorealistic mockups for ultra-thick foil-stamped business cards, executive letterheads, branded envelopes, and presentation templates ensuring immediate real-world executive presentation.</p>
          </div>
        `,
        metricLabel: "Assets:",
        metricTag: "Turnkey System ⚡"
      }
    }
  ];

  // Save Project 0 HTML for dynamic restoration
  const project0HTML = mainPanel ? mainPanel.innerHTML : '';
  let currentProjectIndex = 0;

  function selectProject(index) {
    if (index < 0 || index >= projectsData.length) return;
    currentProjectIndex = index;
    const data = projectsData[index];
    const isAboutMore = !!data.isAboutMore || (!data.hasFullData && index === projectsData.length - 1);

    // 1. Update Dark Cards active class
    darkCards.forEach(card => {
      const pIdx = parseInt(card.dataset.project, 10);
      if (pIdx === index) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    // 2. Update Left Timeline Col
    timelineItems.forEach(item => {
      const pIdx = parseInt(item.dataset.project, 10);
      if (pIdx === index) {
        item.classList.add('is-active');
        let body = item.querySelector('.timeline-content-body');
        if (!body) {
          body = document.createElement('div');
          body.className = 'timeline-content-body';
          item.appendChild(body);
        }
        const caseStudyBtnHTML = isAboutMore ? '' : `
          <a href="#contact" class="case-study-link" data-project="${index}">
            <span>View case study</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        `;
        body.innerHTML = `
          <h3 class="timeline-title">${data.title}</h3>
          <p class="timeline-desc">${data.desc}</p>
          ${caseStudyBtnHTML}
        `;
      } else {
        item.classList.remove('is-active');
        const body = item.querySelector('.timeline-content-body');
        if (body) body.remove();
      }
    });

    // 3. Update Main Panel Content
    if (mainPanel) {
      if (isAboutMore) {
        // Strip screenshot, process overview, tools used, and right results panel for "About More Projects"
        mainPanel.innerHTML = `
          <div class="about-more-projects-panel" style="width: 100%; height: 100%; min-height: 420px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 48px 36px; background: var(--card-bg, rgba(255,255,255,0.02)); border-radius: 24px; border: 1px solid var(--icon-btn-border, rgba(255,255,255,0.08)); position: relative; overflow: hidden; box-shadow: var(--card-shadow, none);">
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 20px; background: var(--btn-bg, rgba(255,255,255,0.08)); color: #000000 !important; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 22px; border: 1px solid var(--icon-btn-border, rgba(255,255,255,0.15));">
              <span style="color: #000000 !important;">⚡ 40+ SUCCESSFUL BUILDS</span>
            </div>
            <h3 style="font-size: 28px; font-weight: 800; line-height: 1.35; margin-bottom: 18px; color: var(--text-main, #ffffff); max-width: 680px;">
              The projects you have just seen are our best time-saving projects ever made.
            </h3>
            <p style="font-size: 15px; font-weight: 500; line-height: 1.65; color: var(--text-muted, rgba(255,255,255,0.7)); max-width: 620px; margin: 0 auto 28px auto;">
              We have showcased key highlights, but we have completed over 50+ graphic design projects and are continuously crafting more visual art!
            </p>
            <div style="display: flex; gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
              <div style="padding: 16px 28px; background: var(--nav-capsule-bg, rgba(0,0,0,0.25)); border-radius: 16px; border: 1px solid var(--icon-btn-border, rgba(255,255,255,0.1)); min-width: 170px;">
                <span style="display: block; font-size: 26px; font-weight: 800; color: var(--text-main, #ffffff);">40+</span>
                <span style="font-size: 10px; font-weight: 700; color: var(--text-muted, #888888); text-transform: uppercase; letter-spacing: 0.6px;">Successful Builds</span>
              </div>
              <div style="padding: 16px 28px; background: var(--nav-capsule-bg, rgba(0,0,0,0.25)); border-radius: 16px; border: 1px solid var(--icon-btn-border, rgba(255,255,255,0.1)); min-width: 170px;">
                <span style="display: block; font-size: 26px; font-weight: 800; color: var(--text-main, #ffffff);">Continuous</span>
                <span style="font-size: 10px; font-weight: 700; color: var(--text-muted, #888888); text-transform: uppercase; letter-spacing: 0.6px;">Design Projects Completed</span>
              </div>
            </div>

            <button class="next-project-btn" id="next-project-btn" type="button" aria-label="Go to next project" style="margin-top: 26px; max-width: 270px;">
              <div class="next-btn-content">
                <span class="next-btn-badge">START OVER</span>
                <span class="next-btn-title">01 • Cinevision Poster</span>
              </div>
              <div class="next-btn-arrow-circle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </button>
          </div>
        `;
      } else {
        // Restore standard layout structure if returning from About More Projects
        if (!mainPanel.querySelector('.projects-center-panel')) {
          mainPanel.innerHTML = project0HTML;
        }

        // Update screenshot
        const screenshotImg = mainPanel.querySelector('.screenshot-img-placeholder img');
        if (screenshotImg && data.imgSrc) {
          screenshotImg.src = data.imgSrc;
          if (data.imgAlt) screenshotImg.alt = data.imgAlt;
        }

        // Update Design Process Track Nodes
        const workflowTrack = mainPanel.querySelector('.workflow-diagram-track');
        if (workflowTrack && data.nodes) {
          let nodesHTML = '';
          data.nodes.forEach((node, i) => {
            if (i > 0) {
              nodesHTML += `<div class="workflow-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>`;
            }
            nodesHTML += `
              <div class="workflow-node">
                <div class="node-icon-box">
                  ${node.icon}
                </div>
                <h4 class="node-step-title">${node.title}</h4>
                ${node.desc ? `<p class="node-step-desc">${node.desc}</p>` : ''}
              </div>
            `;
          });
          workflowTrack.innerHTML = nodesHTML;
        }

        // Update Tools Used with Icons
        const toolsGrid = mainPanel.querySelector('.tools-used-grid');
        if (toolsGrid && data.tools) {
          toolsGrid.innerHTML = data.tools.map(tool => `
            <div class="tool-capsule-mini">
              ${getToolIcon(tool)}
              <span>${tool}</span>
            </div>
          `).join('');
        }

        // Update Key Results
        const resultsList = mainPanel.querySelector('.results-list');
        if (resultsList && data.results) {
          resultsList.innerHTML = data.results.map(r => `
            <div class="result-item">
              <div class="result-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="result-text">
                <span class="result-stat-num">${r.stat}</span>
                <span class="result-stat-label">${r.label}</span>
              </div>
            </div>
          `).join('');
        }

        // Update Next Project Button Title Preview
        const nextIdx = (index + 1) % projectsData.length;
        const nextTitleEl = mainPanel.querySelector('#next-project-title-preview');
        if (nextTitleEl) {
          const nextNum = String(nextIdx + 1).padStart(2, '0');
          const nextTitle = projectsData[nextIdx].title;
          const cleanTitle = nextTitle.length > 24 ? nextTitle.substring(0, 22) + '...' : nextTitle;
          nextTitleEl.textContent = `${nextNum} • ${cleanTitle}`;
          nextTitleEl.title = `${nextNum} • ${nextTitle}`;
        }
      }
    }
  }

  darkCards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.project, 10);
      selectProject(idx);
    });
  });

  timelineItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.project, 10);
      selectProject(idx);
    });
  });

  // Next Project Button Click Handler (leads to the next project)
  document.addEventListener('click', (e) => {
    const nextBtn = e.target.closest('#next-project-btn');
    if (nextBtn) {
      e.preventDefault();
      const nextIdx = (currentProjectIndex + 1) % projectsData.length;
      selectProject(nextIdx);
    }
  });

  // ----------------------------------------------------
  // 9. CASE STUDY SLIDING SIDE DRAWER
  // ----------------------------------------------------
  function openCaseStudyDrawer(projectIndex) {
    if (!caseStudyDrawer || !drawerBackdrop) return;
    const pIdx = (projectIndex !== undefined && !isNaN(projectIndex) && projectsData[projectIndex]) ? projectIndex : 0;
    const project = projectsData[pIdx];
    const cs = project.caseStudy || projectsData[0].caseStudy;

    const titleEl = document.getElementById('case-study-drawer-title');
    if (titleEl) titleEl.textContent = cs.title;

    const subEl = document.getElementById('case-study-drawer-subtitle');
    if (subEl) subEl.textContent = cs.subtitle;

    const execEl = document.getElementById('case-study-exec-text');
    if (execEl) execEl.innerHTML = cs.execSummaryHTML || cs.execSummary;

    const metricLabelEl = document.getElementById('case-study-metric-label');
    if (metricLabelEl) metricLabelEl.textContent = cs.metricLabel || 'Response Latency:';

    const metricTagEl = document.getElementById('case-study-latency-tag');
    if (metricTagEl) metricTagEl.textContent = cs.metricTag || 'Sub-2 Seconds ⚡';

    caseStudyDrawer.classList.add('is-open');
    drawerBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCaseStudyDrawer() {
    if (caseStudyDrawer) caseStudyDrawer.classList.remove('is-open');
    if (drawerBackdrop && 
        (!contactDrawer || !contactDrawer.classList.contains('is-open')) && 
        (!approachDrawer || !approachDrawer.classList.contains('is-open'))) {
      drawerBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  const caseStudyCloseBtn = document.getElementById('case-study-close-btn');
  if (caseStudyCloseBtn) {
    caseStudyCloseBtn.addEventListener('click', closeCaseStudyDrawer);
  }

  // Event Delegation for "View case study" links anywhere
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.case-study-link');
    if (link) {
      e.preventDefault();
      const pIdxAttr = link.getAttribute('data-project');
      let pIdx = pIdxAttr !== null ? parseInt(pIdxAttr, 10) : NaN;
      if (isNaN(pIdx)) {
        const activeTimeline = document.querySelector('.timeline-item.is-active');
        pIdx = activeTimeline ? parseInt(activeTimeline.dataset.project, 10) : 0;
      }
      openCaseStudyDrawer(pIdx);
    }
  });

  // ----------------------------------------------------
  // 10. MY APPROACH LEFT-SLIDING SIDE DRAWER (SECTION 4)
  // ----------------------------------------------------
  function openApproachDrawer() {
    if (!approachDrawer || !drawerBackdrop) return;
    approachDrawer.classList.add('is-open');
    drawerBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeApproachDrawer() {
    if (approachDrawer) approachDrawer.classList.remove('is-open');
    if (drawerBackdrop && 
        (!contactDrawer || !contactDrawer.classList.contains('is-open')) && 
        (!caseStudyDrawer || !caseStudyDrawer.classList.contains('is-open'))) {
      drawerBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  const approachCloseBtn = document.getElementById('approach-close-btn');
  if (approachCloseBtn) {
    approachCloseBtn.addEventListener('click', closeApproachDrawer);
  }

  // Event Delegation for clicking 'My Approach' card in section 4
  document.addEventListener('click', (e) => {
    const approachBox = e.target.closest('.auto-approach-box');
    if (approachBox) {
      e.preventDefault();
      openApproachDrawer();
    }
  });

  // Universal Backdrop Close Handler
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => {
      closeDrawer();
      closeCaseStudyDrawer();
      closeApproachDrawer();
    });
  }

  // ----------------------------------------------------
  // 11. WELCOME POP-UP MODAL & THEME PREVIEW SELECTOR
  // ----------------------------------------------------
  function triggerHeroAnimation() {
    document.body.classList.remove('hero-animated');
    void document.body.offsetWidth; // Reflow for smooth entrance transition
    document.body.classList.add('hero-animated');
  }

  function openWelcomeModal() {
    if (welcomeBackdrop) {
      welcomeBackdrop.classList.add('is-open');
    }
    document.body.classList.add('welcome-modal-open');
  }

  function closeWelcomeModal() {
    if (welcomeBackdrop) {
      welcomeBackdrop.classList.remove('is-open');
    }
    document.body.classList.remove('welcome-modal-open');
    triggerHeroAnimation();
  }

  // Auto-open Welcome Modal only on first session visit
  if (!hasVisited) {
    setTimeout(openWelcomeModal, 250);
  }

  if (welcomeCloseBtn) {
    welcomeCloseBtn.addEventListener('click', closeWelcomeModal);
  }
  if (welcomeContinueBtn) {
    welcomeContinueBtn.addEventListener('click', closeWelcomeModal);
  }
  if (welcomeBackdrop) {
    welcomeBackdrop.addEventListener('click', (e) => {
      if (e.target === welcomeBackdrop) {
        closeWelcomeModal();
      }
    });
  }

  if (welcomeThemeCircles) {
    welcomeThemeCircles.forEach(circle => {
      circle.addEventListener('click', () => {
        const themeName = circle.dataset.theme;
        const themeIdx = themes.indexOf(themeName);
        if (themeIdx !== -1) {
          applyTheme(themeIdx);
        }
        welcomeThemeCircles.forEach(c => c.classList.remove('is-selected'));
        circle.classList.add('is-selected');
        triggerHeroAnimation();
      });
    });
  }
  // ----------------------------------------------------
  // 12. SECTION 5 CONTACT BUTTON CONTROLLER
  // ----------------------------------------------------
  const sec5OpenContactBtn = document.getElementById('sec5-open-contact-btn');
  if (sec5OpenContactBtn && contactDrawer && drawerBackdrop) {
    sec5OpenContactBtn.addEventListener('click', () => {
      contactDrawer.classList.add('is-open');
      drawerBackdrop.classList.add('is-open');
    });
  }

  // ----------------------------------------------------
  // 13. ESCAPE KEY MODAL CLOSER
  // ----------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const imgModal = document.getElementById('image-modal-lightbox');
      if (imgModal) {
        imgModal.style.display = 'none';
        document.body.classList.remove('image-lightbox-open');
      }
      const upworkModal = document.getElementById('upwork-modal-backdrop');
      if (upworkModal) {
        upworkModal.classList.remove('is-open');
      }
    }
  });

  // ----------------------------------------------------
  // 14. UPWORK PARTNER PROFILE NOTICE MODAL HANDLER
  // ----------------------------------------------------
  const upworkCapsuleBtn = document.getElementById('upwork-capsule-btn');
  const upworkModalBackdrop = document.getElementById('upwork-modal-backdrop');
  const upworkModalCloseBtn = document.getElementById('upwork-modal-close-btn');
  const upworkContinueBtn = document.getElementById('upwork-continue-btn');

  if (upworkCapsuleBtn && upworkModalBackdrop) {
    upworkCapsuleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      upworkModalBackdrop.classList.add('is-open');
    });
  }

  if (upworkModalCloseBtn && upworkModalBackdrop) {
    upworkModalCloseBtn.addEventListener('click', () => {
      upworkModalBackdrop.classList.remove('is-open');
    });
  }

  if (upworkModalBackdrop) {
    upworkModalBackdrop.addEventListener('click', (e) => {
      if (e.target === upworkModalBackdrop) {
        upworkModalBackdrop.classList.remove('is-open');
      }
    });
  }

  if (upworkContinueBtn && upworkModalBackdrop) {
    upworkContinueBtn.addEventListener('click', () => {
      upworkModalBackdrop.classList.remove('is-open');
    });
  }
  // Universal Subpage Safe Navigator: guarantees subpages open cleanly in local file://, live server, and production
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('javascript:')) return;
    
    if (window.location.protocol === 'file:' || href.startsWith('/')) {
      let targetPath = href;
      if (targetPath.startsWith('/')) targetPath = targetPath.slice(1);
      if (!targetPath) targetPath = 'index.html';
      else if (targetPath.startsWith('#')) targetPath = 'index.html' + targetPath;
      else if (!targetPath.includes('.html') && !targetPath.includes('#')) targetPath += '.html';
      else if (targetPath.includes('#') && !targetPath.includes('.html')) {
        const parts = targetPath.split('#');
        targetPath = (parts[0] ? parts[0] + '.html' : 'index.html') + '#' + parts[1];
      }
      e.preventDefault();
      window.location.href = targetPath;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
