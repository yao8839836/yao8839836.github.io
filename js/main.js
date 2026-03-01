/* ============================================================
   Academic Homepage — Main Script
   File: js/main.js
   ============================================================ */

/**
 * Load an HTML partial into a target container.
 * @param {string} url - Path to the section HTML file (e.g. "sections/about.html")
 * @param {string} targetId - The id of the placeholder element in index.html
 */
async function loadSection(url, targetId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    const html = await response.text();
    const target = document.getElementById(targetId);
    if (target) {
      target.innerHTML = html;

      // Scripts inserted via innerHTML are NOT executed by the browser.
      // We must manually re-create each <script> tag so the browser runs it.
      target.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        // Copy all attributes (src, type, id, etc.)
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        // Copy inline script content (if any)
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      // After injection, observe new fade-in elements
      target.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }
  } catch (err) {
    console.warn(`[loadSection] ${err.message}`);
  }
}

/* ----- Scroll Fade-in Animation (IntersectionObserver) ----- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

/* ----- Bootstrap: load all sections on DOMContentLoaded ----- */
document.addEventListener('DOMContentLoaded', () => {
  // List of sections to load: [partial file path, placeholder id]
  const sections = [
    ['sections/about.html',        'section-about'],
    ['sections/interests.html',    'section-interests'],
    ['sections/recruiting.html',   'section-recruiting'],
    ['sections/news.html',         'section-news'],
    ['sections/publications.html', 'section-publications'],
    ['sections/lab.html',          'section-lab'],
    ['sections/services.html',     'section-services'],
    ['sections/awards.html',       'section-awards'],
  ];

  // Load all sections in parallel, then initialise sliders
  Promise.all(sections.map(([url, id]) => loadSection(url, id))).then(() => {
    initSliders();
  });

  // Also observe any fade-in elements already in index.html (e.g. hero)
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

/* ----- Horizontal Slider / Carousel ----- */
function initSliders() {
  document.querySelectorAll('.slider-nav').forEach(nav => {
    const sliderId = nav.getAttribute('data-slider');
    const track = document.getElementById(sliderId);
    if (!track) return;

    const prevBtn = nav.querySelector('.slider-prev');
    const nextBtn = nav.querySelector('.slider-next');
    const scrollAmount = 280; // px per click

    const updateBtnState = () => {
      prevBtn.disabled = track.scrollLeft <= 0;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateBtnState);
    // Initial state
    updateBtnState();
  });
}
