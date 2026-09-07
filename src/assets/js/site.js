(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    const closeNav = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('open');
      document.body.classList.remove('nav-open');
    };

    navToggle.addEventListener('click', () => {
      const opening = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(opening));
      siteNav.classList.toggle('open', opening);
      document.body.classList.toggle('nav-open', opening);
    });

    siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
    window.addEventListener('resize', () => { if (window.innerWidth > 1000) closeNav(); });
  }

  const fades = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    fades.forEach(element => observer.observe(element));
  } else {
    fades.forEach(element => element.classList.add('visible'));
  }

  const status = new URLSearchParams(window.location.search).get('contact');
  const successMessage = document.querySelector('[data-form-success]');
  const errorMessage = document.querySelector('[data-form-error]');
  if (status === 'success' && successMessage) successMessage.hidden = false;
  if (status === 'error' && errorMessage) errorMessage.hidden = false;
  if (status && history.replaceState) history.replaceState({}, document.title, window.location.pathname);

  const form = document.querySelector('.contact-form');
  if (form && window.fetch && window.FormData) {
    const button = form.querySelector('button[type="submit"]');
    const original = button.innerHTML;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (successMessage) successMessage.hidden = true;
      if (errorMessage) errorMessage.hidden = true;
      button.disabled = true; button.textContent = 'Sending…';
      try {
        const data = new FormData(form); data.append('_ajax', '1');
        const response = await fetch(form.action, { method: 'POST', body: data, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        const result = await response.json();
        if (!result.success) throw new Error('Send failed');
        form.reset(); successMessage.hidden = false; successMessage.focus({ preventScroll: true });
      } catch (error) {
        errorMessage.hidden = false; errorMessage.focus({ preventScroll: true });
      } finally {
        button.disabled = false; button.innerHTML = original;
      }
    });
  }

  const analyticsToggles = document.querySelectorAll('[data-analytics-toggle]');
  const analyticsDisabled = () => {
    try { return localStorage.getItem('umami.disabled') === '1'; } catch (error) { return false; }
  };
  const updateAnalytics = () => analyticsToggles.forEach(toggle => { toggle.textContent = analyticsDisabled() ? 'Enable analytics' : 'Disable analytics'; });
  analyticsToggles.forEach(toggle => toggle.addEventListener('click', () => {
    try {
      if (analyticsDisabled()) localStorage.removeItem('umami.disabled'); else localStorage.setItem('umami.disabled', '1');
      updateAnalytics();
    } catch (error) { /* Storage may be unavailable. */ }
  }));
  updateAnalytics();
})();
