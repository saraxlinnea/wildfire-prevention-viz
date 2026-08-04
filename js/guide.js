/* global WF */
(function () {
  const STORAGE_KEY = 'wf-guide-seen';
  const STEPS = [
    {
      tab: 'overview',
      title: 'Overview',
      body: 'Start with U.S. acres burned so far in 2026, then where those acres landed by region. Year-to-date is not a full year.',
      target: '#chart-fire'
    },
    {
      tab: 'drivers',
      title: 'Drivers',
      body: 'Regional pairings first, then western dryness and acres. South and East chips change the handoff into the western zoom.',
      target: '#regional-top-drivers-section, #chart-regional-top-drivers'
    },
    {
      tab: 'context',
      title: 'Context',
      body: 'How many hazardous-fuels acres did agencies report, and how much was tagged near communities? Different clock from burn totals.',
      target: '#tab-context .chart-container--policy'
    },
    {
      tab: 'impacts',
      title: 'Impacts',
      body: 'Acres burned are not the same as smoke people breathe. This tab starts with air quality.',
      target: '#chart-smoke-pm25, .interp-section--smoke'
    }
  ];

  let stepIndex = 0;
  let lastFocus = null;
  let trapHandler = null;

  const welcome = document.getElementById('guide-welcome');
  const tour = document.getElementById('guide-tour');
  const spotlight = document.getElementById('guide-spotlight');
  const titleEl = document.getElementById('guide-tour-title');
  const bodyEl = document.getElementById('guide-tour-body');
  const metaEl = document.getElementById('guide-step-meta');
  const nextBtn = document.getElementById('guide-tour-next');
  const backBtn = document.getElementById('guide-tour-back');
  const skipTourBtn = document.getElementById('guide-tour-skip');

  function markSeen() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
  }

  function hasSeen() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }

  function focusable(root) {
    return [...root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
  }

  function openDialog(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    const items = focusable(el);
    (items[0] || el).focus();
    trapHandler = function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!tour.hidden) endTour(true);
        else closeWelcome(true);
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusable(el);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trapHandler);
  }

  function closeDialog(el) {
    el.hidden = true;
    if (trapHandler) {
      document.removeEventListener('keydown', trapHandler);
      trapHandler = null;
    }
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  function closeWelcome(skipMark) {
    if (!welcome) return;
    closeDialog(welcome);
    if (skipMark) markSeen();
  }

  function resolveTarget(selector) {
    const parts = selector.split(',').map(s => s.trim());
    for (let i = 0; i < parts.length; i++) {
      const el = document.querySelector(parts[i]);
      if (el && !el.hidden && el.getClientRects().length) return el;
    }
    return document.querySelector(parts[0]);
  }

  function placeSpotlight(el) {
    if (!spotlight || !el) return;
    const r = el.getBoundingClientRect();
    const pad = 8;
    spotlight.style.top = Math.max(8, r.top - pad) + 'px';
    spotlight.style.left = Math.max(8, r.left - pad) + 'px';
    spotlight.style.width = Math.min(window.innerWidth - 16, r.width + pad * 2) + 'px';
    spotlight.style.height = Math.min(window.innerHeight - 16, r.height + pad * 2) + 'px';
  }

  function renderStep() {
    const step = STEPS[stepIndex];
    if (!step) return;
    if (typeof WF !== 'undefined' && typeof WF.switchTab === 'function') {
      WF.switchTab(step.tab);
    }
    if (titleEl) titleEl.textContent = step.title;
    if (bodyEl) bodyEl.textContent = step.body;
    if (metaEl) metaEl.textContent = `${stepIndex + 1} / ${STEPS.length}`;
    if (backBtn) backBtn.disabled = stepIndex === 0;
    if (nextBtn) nextBtn.textContent = stepIndex === STEPS.length - 1 ? 'Done' : 'Next';
    requestAnimationFrame(() => {
      const target = resolveTarget(step.target);
      placeSpotlight(target);
      if (nextBtn) nextBtn.focus();
    });
  }

  function startTour() {
    markSeen();
    closeWelcome(false);
    stepIndex = 0;
    if (!tour) return;
    openDialog(tour);
    renderStep();
  }

  function endTour(returnSeason) {
    if (tour) closeDialog(tour);
    markSeen();
    if (returnSeason !== false && typeof WF !== 'undefined' && typeof WF.switchTab === 'function') {
      WF.switchTab('overview');
    }
  }

  function next() {
    if (stepIndex >= STEPS.length - 1) {
      endTour(true);
      return;
    }
    stepIndex += 1;
    renderStep();
  }

  function back() {
    if (stepIndex <= 0) return;
    stepIndex -= 1;
    renderStep();
  }

  function maybeShowWelcome() {
    if (!welcome) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === '1') {
      markSeen();
      startTour();
      if (window.history && window.history.replaceState) {
        const url = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', url);
      }
      return;
    }
    if (hasSeen()) return;
    openDialog(welcome);
  }

  document.getElementById('guide-welcome-start')?.addEventListener('click', startTour);
  document.getElementById('guide-welcome-skip')?.addEventListener('click', () => closeWelcome(true));
  document.getElementById('header-tour-btn')?.addEventListener('click', startTour);
  nextBtn?.addEventListener('click', next);
  backBtn?.addEventListener('click', back);
  skipTourBtn?.addEventListener('click', () => endTour(true));

  window.addEventListener('resize', () => {
    if (tour && !tour.hidden) {
      const step = STEPS[stepIndex];
      if (step) placeSpotlight(resolveTarget(step.target));
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeShowWelcome);
  } else {
    maybeShowWelcome();
  }
})();
