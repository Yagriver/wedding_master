/* Small, one-time entrances. Content stays visible if motion is unavailable. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let root;
  let cleanup = () => {};

  window.initWeddingMotion = (nextRoot) => {
    observer?.disconnect();
    cleanup();
    root = nextRoot;
    root.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
    if (reduced.matches || !('IntersectionObserver' in window)) return;

    const selector = '.hero-copy, .hero-photo, .floral-divider, .home-details article, .guest-updates, .photo-moment-copy, .page-heading, .venue-visual, .venue-copy, .venue-gallery, .venue-map-heading, .stay, .day-timeline li';
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -24px 0px'});

    root.querySelectorAll(selector).forEach(el => {
      el.classList.add('scroll-reveal', 'reveal-pending');
      if (el.parentElement.classList.contains('home-details')) {
        el.style.setProperty('--reveal-delay', `${Array.from(el.parentElement.children).indexOf(el) * 100}ms`);
      }
      observer.observe(el);
    });

    // Focusing a link must never leave its containing section invisible.
    const revealFocus = event => {
      const section = event.target.closest('.reveal-pending');
      if (section) {
        section.classList.remove('reveal-pending');
        section.classList.add('reveal-visible');
        observer.unobserve(section);
      }
    };
    root.addEventListener('focusin', revealFocus);
    cleanup = () => nextRoot.removeEventListener('focusin', revealFocus);
  };

  reduced.addEventListener('change', () => {
    if (root) window.initWeddingMotion(root);
  });
})();
