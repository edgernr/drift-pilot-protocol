/* App router + scroll reveal */
(function () {
  const screens = ['landing', 'signup', 'dashboard', 'quest'];

  function goto(screen) {
    screens.forEach(s => {
      const el = document.getElementById('screen-' + s);
      if (el) el.classList.toggle('active', s === screen);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    try { localStorage.setItem('eva-screen', screen); } catch (e) {}
    // re-init observers for newly-shown content
    setTimeout(initReveal, 50);
  }

  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
  }

  // Global click delegation for data-goto
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-goto]');
    if (btn) {
      ev.preventDefault();
      goto(btn.dataset.goto);
    }
  });

  // Smooth-scroll hash links
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      ev.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  window.evaGoto = goto;

  // Restore previous screen
  try {
    const saved = localStorage.getItem('eva-screen');
    if (saved && screens.includes(saved)) goto(saved);
  } catch (e) {}

  initReveal();
})();
