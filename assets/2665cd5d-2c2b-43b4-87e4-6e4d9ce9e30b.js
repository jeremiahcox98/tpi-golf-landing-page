// ---- Reveal on scroll ----
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
  io.observe(el);
});

// ---- Modals ----
const vslModal = document.getElementById('vslModal');
const modalVideo = document.getElementById('modalVideo');
const originalVideo = modalVideo ? modalVideo.innerHTML : '';

const scheduleModal = document.getElementById('scheduleModal');
const scheduleFormWrap = document.getElementById('scheduleFormWrap');
const scheduleForm = document.getElementById('scheduleForm');
const scheduleSuccess = document.getElementById('scheduleSuccess');

// Set to your form endpoint (Formspree, webhook, etc.) to POST submissions.
const FORM_ENDPOINT = '';

function openVslModal() {
  if (!vslModal) return;
  vslModal.classList.add('open');
  vslModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeVslModal() {
  if (!vslModal) return;
  vslModal.classList.remove('open');
  vslModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (modalVideo) modalVideo.innerHTML = originalVideo;
}

function resetScheduleForm() {
  if (scheduleFormWrap) scheduleFormWrap.classList.remove('is-submitted');
  if (scheduleSuccess) scheduleSuccess.classList.remove('is-visible');
  if (scheduleForm) scheduleForm.reset();
}

function openScheduleModal() {
  if (!scheduleModal) return;
  resetScheduleForm();
  scheduleModal.classList.add('open');
  scheduleModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstInput = scheduleForm && scheduleForm.querySelector('input[name="name"]');
  if (firstInput) setTimeout(() => firstInput.focus(), 120);
}

function closeScheduleModal() {
  if (!scheduleModal) return;
  scheduleModal.classList.remove('open');
  scheduleModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-modal-open]').forEach((el) => {
  el.addEventListener('click', openVslModal);
  el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openVslModal(); }
  });
});

document.querySelectorAll('[data-modal-close]').forEach((el) => {
  el.addEventListener('click', closeVslModal);
});

if (vslModal) {
  vslModal.addEventListener('click', (e) => { if (e.target === vslModal) closeVslModal(); });
}

document.querySelectorAll('[data-schedule-open]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    openScheduleModal();
  });
});

document.querySelectorAll('[data-schedule-close]').forEach((el) => {
  el.addEventListener('click', closeScheduleModal);
});

if (scheduleModal) {
  scheduleModal.addEventListener('click', (e) => { if (e.target === scheduleModal) closeScheduleModal(); });
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (scheduleModal && scheduleModal.classList.contains('open')) closeScheduleModal();
  else if (vslModal && vslModal.classList.contains('open')) closeVslModal();
});

if (scheduleForm) {
  scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!scheduleForm.reportValidity()) return;

    const data = Object.fromEntries(new FormData(scheduleForm).entries());
    const submitBtn = scheduleForm.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Request failed');
      }
      scheduleFormWrap.classList.add('is-submitted');
      scheduleSuccess.classList.add('is-visible');
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request My Callback';
      }
      alert('Something went wrong. Please call us at 615-794-9155 and we\'ll get you scheduled.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request My Callback';
    }
  });
}

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
