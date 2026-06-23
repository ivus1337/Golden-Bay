/* ================================================================
   MONTE GEMS TOURS — main.js
   Handles: navbar scroll effect, scroll animations, gallery slider
   ================================================================ */

/* ---------------------------------------------------------------
   1. LUCIDE ICONS — initialise all icons on the page
   --------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ---------------------------------------------------------------
   2. NAVBAR — add .scrolled class when page is scrolled > 20px
   --------------------------------------------------------------- */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNav() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      // Keep scrolled on pages that start with the class (tours.html)
      if (!navbar.classList.contains('always-scrolled')) {
        navbar.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // Run on load
})();

/* ---------------------------------------------------------------
   3. SCROLL ANIMATIONS — reveal elements with .animate-on-scroll
      when they enter the viewport
   --------------------------------------------------------------- */
(function () {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ---------------------------------------------------------------
   4. GALLERY SLIDER
      - Shows 3 slides on desktop, 2 on tablet, 1 on mobile
      - Auto-advances every 4 seconds (pauses on hover)
      - Prev / Next buttons + dot indicators
   --------------------------------------------------------------- */
(function () {
  const track  = document.getElementById('galleryTrack');
  const prev   = document.getElementById('galleryPrev');
  const next   = document.getElementById('galleryNext');
  const dotsEl = document.getElementById('galleryDots');
  if (!track || !prev || !next) return;

  const slides = Array.from(track.querySelectorAll('.gallery-slide'));
  const total  = slides.length;
  let current  = 0;
  let autoTimer;

  /* How many slides are visible at once based on viewport width */
  function slidesVisible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  /* Maximum index we can scroll to */
  function maxIndex() {
    return Math.max(0, total - slidesVisible());
  }

  /* Build dot buttons */
  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'gallery-dot' + (i === current ? ' active' : '');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(btn);
    }
  }

  /* Move to a specific index */
  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const slideWidth = slides[0].offsetWidth + 24; // 24 = gap (1.5rem)
    track.style.transform = `translateX(-${current * slideWidth}px)`;
    updateDots();
  }

  function updateDots() {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function advance() { goTo(current >= maxIndex() ? 0 : current + 1); }

  function startAuto() { autoTimer = setInterval(advance, 4000); }
  function stopAuto()  { clearInterval(autoTimer); }

  prev.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  next.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  /* Touch / swipe support on mobile */
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAuto();
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      startAuto();
    }
  });

  /* Re-calculate on resize */
  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, maxIndex()));
  });

  /* Init */
  buildDots();
  goTo(0);
  startAuto();
})();
