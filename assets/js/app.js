/**
 * NOACH Transport Services — Main Client Application & View Router
 * Provides robust single-page navigation across all views (Home, Our Services,
 * How It Works, Request a Vehicle, Contact Us), slide-in Contact Us drawer,
 * mobile drawer management, active link syncing, and global toast notifications.
 * Safe for both HTTP/HTTPS and local file:/// protocol.
 */

(function () {
  const routes = ['home', 'services', 'how-it-works', 'request-vehicle', 'contact'];

  // Global Toast Notification System
  window.showToast = function (message, duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2A692" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ==========================================================================
  // CONTACT US SLIDE-IN RIGHT DRAWER CONTROLS
  // ==========================================================================
  window.openContactDrawer = function () {
    const drawer = document.getElementById('contact-drawer');
    const overlay = document.getElementById('contact-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const input = document.getElementById('contact-name');
        if (input) input.focus();
      }, 250);
    }
  };

  window.closeContactDrawer = function () {
    const drawer = document.getElementById('contact-drawer');
    const overlay = document.getElementById('contact-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  const closeContactBtn = document.getElementById('close-contact-drawer-btn');
  const contactOverlay = document.getElementById('contact-drawer-overlay');
  const drawerTabHandle = document.querySelector('.drawer-tab-handle');

  if (closeContactBtn) closeContactBtn.addEventListener('click', window.closeContactDrawer);
  if (contactOverlay) contactOverlay.addEventListener('click', window.closeContactDrawer);
  if (drawerTabHandle) drawerTabHandle.addEventListener('click', window.closeContactDrawer);

  // View Navigation Router (Safely switches views)
  window.navigateTo = function (pageId, scrollToTop = true) {
    if (!pageId || !routes.includes(pageId)) {
      pageId = 'home';
    }

    if (pageId === 'contact') {
      // Opening contact drawer over the current page
      window.openContactDrawer();
      return;
    }

    // Close contact drawer when switching to other views
    window.closeContactDrawer();

    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`view-${pageId}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update active state in navbars (desktop & mobile)
    document.querySelectorAll('.nav-link, .drawer-nav a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === `#${pageId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    closeMobileDrawer();

    // Scroll to top
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Safely update hash without throwing on local file:/// protocol
    try {
      if (window.location.hash !== `#${pageId}`) {
        if (window.history && window.history.pushState && window.location.protocol !== 'file:') {
          window.history.pushState(null, null, `#${pageId}`);
        } else {
          window.location.hash = `#${pageId}`;
        }
      }
    } catch (e) {
      try {
        window.location.hash = `#${pageId}`;
      } catch (_) {}
    }

    // Auto-focus first input field for better user experience
    if (pageId === 'request-vehicle') {
      setTimeout(() => {
        const input = document.getElementById('req-customer-name');
        if (input) input.focus();
      }, 150);
    }
  };

  // Mobile Drawer Controls
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMobileDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileDrawer);

  // Link click delegation for all # links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;
    const targetPage = href.replace('#', '');

    if (targetPage === 'contact') {
      e.preventDefault();
      closeMobileDrawer();
      window.openContactDrawer();
      return;
    }

    if (routes.includes(targetPage)) {
      e.preventDefault();
      window.closeContactDrawer();
      window.navigateTo(targetPage);

      // Preselection support for vehicle types
      const preselectVehicle = link.getAttribute('data-preselect-vehicle');
      if (preselectVehicle) {
        setTimeout(() => {
          const select = document.getElementById('req-vehicle-type');
          if (select) {
            select.value = preselectVehicle;
            const chip = document.querySelector(`.vehicle-chip[data-value="${preselectVehicle}"]`);
            if (chip) chip.click();
          }
        }, 80);
      }
    }
  });

  // Global escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeContactDrawer();
      closeMobileDrawer();
    }
  });

  // Sticky Header Effect on Scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Handle Browser Back / Forward & Hash Changes
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'contact') {
      window.openContactDrawer();
    } else {
      window.navigateTo(hash || 'home', false);
    }
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'contact') {
      window.openContactDrawer();
    } else if (routes.includes(hash)) {
      window.navigateTo(hash, false);
    }
  });

  // Initial load routing
  document.addEventListener('DOMContentLoaded', () => {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash === 'contact') {
      window.navigateTo('home', false);
      setTimeout(() => window.openContactDrawer(), 250);
    } else if (routes.includes(initialHash)) {
      window.navigateTo(initialHash, false);
    } else {
      window.navigateTo('home', false);
    }
  });
})();
