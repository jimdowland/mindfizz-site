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

  const canvas = document.getElementById('hero-canvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const context = canvas.getContext('2d');
    const seed = Array.from({ length: 256 }, (_, index) => index).sort(() => Math.random() - .5);
    const permutation = [...seed, ...seed];
    let width = 0;
    let height = 0;
    let spacing = 38;
    let time = 0;

    const fade = value => value * value * value * (value * (value * 6 - 15) + 10);
    const lerp = (amount, start, end) => start + amount * (end - start);
    const grad = (hash, x, y, z) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };
    const noise = (x, y, z) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x); const v = fade(y); const w = fade(z);
      const A = permutation[X] + Y; const AA = permutation[A] + Z; const AB = permutation[A + 1] + Z;
      const B = permutation[X + 1] + Y; const BA = permutation[B] + Z; const BB = permutation[B + 1] + Z;
      return lerp(w,
        lerp(v, lerp(u, grad(permutation[AA], x, y, z), grad(permutation[BA], x - 1, y, z)), lerp(u, grad(permutation[AB], x, y - 1, z), grad(permutation[BB], x - 1, y - 1, z))),
        lerp(v, lerp(u, grad(permutation[AA + 1], x, y, z - 1), grad(permutation[BA + 1], x - 1, y, z - 1)), lerp(u, grad(permutation[AB + 1], x, y - 1, z - 1), grad(permutation[BB + 1], x - 1, y - 1, z - 1)))
      );
    };

    const resize = () => {
      const box = canvas.parentElement.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(box.width); height = Math.round(box.height);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      spacing = width < 380 ? 27 : width < 600 ? 34 : 42;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      time += .002;
      const noiseScale = .001 + ((Math.sin(time * 1.6) + 1) / 2) * .0028;
      for (let x = spacing * .55; x < width; x += spacing) {
        for (let y = spacing * .55; y < height; y += spacing) {
          const angle = noise(x * noiseScale, y * noiseScale, time) * Math.PI * 2;
          const mix = Math.pow((Math.sin(angle) + 1) / 2, 1.1);
          const red = Math.round(70 + mix * 162); const green = Math.round(66 - mix * 16); const blue = Math.round(62 - mix * 20);
          const length = spacing * .52; const head = spacing * .15;
          context.save(); context.translate(x, y); context.rotate(angle); context.beginPath();
          context.moveTo(-length / 2, 0); context.lineTo(length / 2, 0);
          context.moveTo(length / 2, 0); context.lineTo(length / 2 - head, -head * .7);
          context.moveTo(length / 2, 0); context.lineTo(length / 2 - head, head * .7);
          context.strokeStyle = `rgba(${red},${green},${blue},${.58 + mix * .28})`;
          context.lineWidth = 1.1; context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke(); context.restore();
        }
      }
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
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
