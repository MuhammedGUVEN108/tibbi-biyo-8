'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !preference.matches;
  const motionButton = $('#motion-toggle');
  function setMotion(enabled) {
    motion = enabled;
    root.dataset.motion = enabled ? 'on' : 'off';
    motionButton.setAttribute('aria-pressed', String(!enabled));
    motionButton.textContent = enabled ? 'Ⅱ Hareketi durdur' : '▷ Hareketi aç';
    motionButton.setAttribute('aria-label', motionButton.textContent);
  }
  setMotion(motion);
  motionButton.addEventListener('click', () => setMotion(!motion));
  preference.addEventListener('change', e => setMotion(!e.matches));
  // İçerik JavaScript veya gözlemci desteği olmadığında görünür kalır.
  if ('IntersectionObserver' in window && motion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
    $$('.hero-copy, .hero-visual, .hero-footer, .intro-grid p, .section-top, .wd-section h2, .wd-lead, .concept, .interactive, .histogram, .takeaway, .clarify, .recall-group, .source-gallery').forEach(el => {
      // Kapalı details içindeki içerik ayrıca gizlenmez.
      if (el.closest('details')) return;
      el.classList.add('reveal-ready');
      if (el.classList.contains('concept')) el.style.setProperty('--reveal-delay', (Array.from(el.parentElement.children).indexOf(el) * 65) + 'ms');
      observer.observe(el);
    });
  }
  function animate(el) {
    if (!el || !motion || typeof el.animate !== 'function') return;
    if (el._stageAnimation) el._stageAnimation.cancel();
    el._stageAnimation = el.animate([{ opacity: .3, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 470, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
  $$('[data-cycle]').forEach(b => b.addEventListener('click', () => { animate($('#cycle-detail')); animate($('#cycle-svg-phase')); }));
  $$('[data-mitosis]').forEach(b => b.addEventListener('click', () => { animate($('#mitosis-art')); animate($('#mitosis-detail')); }));
  $$('details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) Array.from(d.children).filter(c => c.tagName !== 'SUMMARY').forEach(animate);
  }));
  const links = $$('#topic-nav a');
  const sections = links.map(a => $(a.hash));
  let active = 0, pending = false;
  const previous = $('#chapter-prev'), next = $('#chapter-next');
  function update() {
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    const percent = Math.max(0, Math.min(100, Math.round(window.scrollY / max * 100)));
    $('#reading-number').textContent = '%' + percent;
    $('#rail-meter-fill').style.width = percent + '%';
    active = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= Math.min(window.innerHeight * .25, 160)) active = i; });
    if (window.scrollY >= max - 4) active = sections.length - 1;
    $('#chapter-name').textContent = links[active].textContent.trim().replace(/^\d+\s*/, '');
    $('#chapter-caption').textContent = `${String(active).padStart(2, '0')} / ${String(sections.length - 1).padStart(2, '0')} · ŞİMDİ OKUYORSUN`;
    previous.disabled = active === 0;
    next.disabled = active === sections.length - 1;
    pending = false;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('toggle', schedule, true);
  function go(index) {
    if (index < 0 || index >= sections.length) return;
    const s = sections[index];
    s.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
    s.setAttribute('tabindex', '-1');
    s.focus({ preventScroll: true });
    animate(s.querySelector('h2'));
  }
  previous.addEventListener('click', () => { update(); go(active - 1); });
  next.addEventListener('click', () => { update(); go(active + 1); });
  update();
})();
