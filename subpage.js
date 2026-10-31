// Subpage Interactions, Cursor & Theme Sync
document.addEventListener('DOMContentLoaded', () => {
  // 1. Sync theme from localStorage
  const savedTheme = localStorage.getItem('portfolio_theme') || 'lime';
  document.body.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 2. Dot Cursor Tracking (matches main page glowing dot cursor)
  const cursorDot = document.getElementById('cursor-dot');
  if (cursorDot) {
    let mouseX = -100;
    let mouseY = -100;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(() => {
          cursorDot.classList.remove('hidden');
          cursorDot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
          isMoving = false;
        });
      }
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.classList.add('hidden');
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.classList.remove('hidden');
    });

    document.addEventListener('mousedown', () => {
      cursorDot.classList.remove('hidden');
    }, true);

    document.addEventListener('mouseup', () => {
      cursorDot.classList.remove('hidden');
    }, true);
  }

  // 3. Interactive Accordion for Q&A
  const accordionItems = document.querySelectorAll('.qna-accordion-item');
  if (accordionItems.length > 0) {
    accordionItems.forEach(item => {
      const trigger = item.querySelector('.qna-trigger');
      if (trigger) {
        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');

          // Close other open items for neat accordion behavior
          accordionItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('is-open');
              const otherTrigger = otherItem.querySelector('.qna-trigger');
              if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            }
          });

          // Toggle current
          if (isOpen) {
            item.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
          } else {
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });
  }

  // 4. Smooth scroll for internal anchor links (like privacy policy sidebar)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // 5. Universal Subpage Safe Navigator: guarantees subpages open cleanly in local file://, live server, and production
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
});
