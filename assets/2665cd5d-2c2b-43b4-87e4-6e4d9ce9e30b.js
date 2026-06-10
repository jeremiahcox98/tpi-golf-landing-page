// ---- Reveal on scroll ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  // small stagger for siblings within a row
  el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
  io.observe(el);
});

// ---- VSL modal ----
const modal = document.getElementById('vslModal');
const modalVideo = document.getElementById('modalVideo');
const originalVideo = modalVideo.innerHTML;

function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // reset so a real iframe stops playing
  modalVideo.innerHTML = originalVideo;
}

document.querySelectorAll('[data-modal-open]').forEach((el) => {
  el.addEventListener('click', openModal);
  el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openModal(); }
  });
});
document.querySelectorAll('[data-modal-close]').forEach((el) => el.addEventListener('click', closeModal));
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

// ---- Booking buttons (replace href with your scheduler URL) ----
// Set BOOKING_URL to your online scheduler; falls back to scrolling to the offer + calling.
const BOOKING_URL = ''; // e.g. 'https://your-scheduler.com/book'
document.querySelectorAll('[data-book]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    if (BOOKING_URL) { return; } // let the href (set below) handle it
    e.preventDefault();
    // No scheduler configured yet — guide the user to call.
    window.location.href = 'tel:16157949155';
  });
  if (BOOKING_URL) { btn.setAttribute('href', BOOKING_URL); btn.setAttribute('target', '_blank'); btn.setAttribute('rel', 'noopener'); }
});

// ---- Reviews embed (lazy load + auto height) ----
const REVIEWS_EMBED_URL = 'https://reviews-widget.jeremiah-cox98.workers.dev/embed';
const reviewsIframe = document.getElementById('reviews-embed');

function setReviewsIframeHeight(height) {
  if (reviewsIframe && typeof height === 'number' && height > 0) {
    reviewsIframe.style.height = height + 'px';
    reviewsIframe.style.maxWidth = '100%';
    reviewsIframe.style.overflow = 'hidden';
  }
}

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'reviews-embed-height') {
    setReviewsIframeHeight(e.data.height);
  }
});

if (reviewsIframe) {
  const loadReviewsEmbed = () => {
    if (!reviewsIframe.src) reviewsIframe.src = reviewsIframe.dataset.src || REVIEWS_EMBED_URL;
  };
  if ('IntersectionObserver' in window) {
    const embedIo = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadReviewsEmbed();
        embedIo.disconnect();
      }
    }, { rootMargin: '200px 0px' });
    embedIo.observe(reviewsIframe);
  } else {
    loadReviewsEmbed();
  }
}
