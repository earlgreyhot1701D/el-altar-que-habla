// Visit-only interactions. No persistence, requests, or model context.
export const MONARCH_TIMING = { first: 30000, between: 90000, duration: 11000, maximum: 3 };

export function createVisitState() {
  return { lit: false, paused: false, appearances: 0, waiting: 0, flightAge: 0, flying: false };
}

export function lightVisitCandle(state) {
  if (state.lit) return false;
  state.lit = true;
  return true;
}

export function overlaps(a, b, clearance = 8) {
  return a.left < b.right + clearance && a.right > b.left - clearance &&
    a.top < b.bottom + clearance && a.bottom > b.top - clearance;
}

export function monarchCorridor(frame, obstacles) {
  // The complete swept rectangle includes the 24px wings and 8px lateral drift.
  const top = frame.top + frame.height * 0.26;
  const distance = frame.height * 0.14;
  const route = { left: frame.left + 8, right: frame.left + 40, top, bottom: top + distance + 24 };
  if (frame.width < 48 || route.bottom > frame.bottom || obstacles.some(box => overlaps(route, box))) return null;
  return { ...route, distance };
}

export function advanceMonarch(state, elapsed, eligible) {
  if (!eligible) {
    if (state.flying) { state.flying = false; state.waiting = 0; state.flightAge = 0; }
    return;
  }
  if (state.flying) {
    state.flightAge += elapsed;
    if (state.flightAge >= MONARCH_TIMING.duration) {
      state.flying = false;
      state.waiting = 0;
      state.flightAge = 0;
    }
  } else if (state.appearances < MONARCH_TIMING.maximum) {
    state.waiting += elapsed;
    const delay = state.appearances === 0 ? MONARCH_TIMING.first : MONARCH_TIMING.between;
    if (state.waiting >= delay) {
      state.appearances++;
      state.waiting = 0;
      state.flightAge = 0;
      state.flying = true;
    }
  }
}

export function initVisitMoments({ getCopy, sources }) {
  const state = createVisitState();
  const $ = id => document.getElementById(id);
  const layer = $("visitMonarch");
  const moment = $("visitMoment");
  const motion = $("visitMotion");
  const candle = $("lightCandle");
  const frame = document.querySelector(".scene-frame");
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lastTick = performance.now();

  function availableRoute() {
    if (document.hidden || !$("introModal").hidden || $("offeringsDialog").open ||
        !document.querySelector(".panel").hidden || document.activeElement === $("question")) return null;
    const bounds = frame.getBoundingClientRect();
    const obstacles = [...document.querySelectorAll(".hotspot")].map(el => el.getBoundingClientRect());
    for (const el of [document.querySelector(".panel"), $("question")]) {
      if (el.getClientRects().length) obstacles.push(el.getBoundingClientRect());
    }
    const route = monarchCorridor(bounds, obstacles);
    if (!route || route.top < 0 || route.bottom > innerHeight || route.left < 0 || route.right > innerWidth) return null;
    return route;
  }

  function paint(route) {
    const still = preference.matches || state.paused;
    const visible = Boolean(route && (still || state.flying));
    layer.hidden = !visible;
    layer.dataset.mode = visible ? (still ? "still" : "flight") : "hidden";
    layer.dataset.appearances = String(state.appearances);
    if (route) {
      layer.style.setProperty("--monarch-distance", `${route.distance}px`);
      layer.style.setProperty("--monarch-start", `${frame.getBoundingClientRect().height * 0.26}px`);
    }
  }

  function reconcile() {
    const route = availableRoute();
    advanceMonarch(state, 0, Boolean(route && !preference.matches && !state.paused));
    paint(route);
  }

  function render() {
    const l = getCopy();
    const text = (id, value) => { if ($(id).textContent !== value) $(id).textContent = value; };
    text("lightCandle", l.light);
    candle.setAttribute("aria-disabled", String(state.lit));
    text("candleStatus", state.lit ? l.lit : "");
    text("candleQuiet", state.lit ? l.quiet : "");
    text("visitMotion", preference.matches ? l.reduced : (state.paused ? l.resume : l.pause));
    motion.setAttribute("aria-disabled", String(preference.matches));
    motion.setAttribute("aria-pressed", String(state.paused));
    for (const [id, value] of [["skullHeading", l.skullHeading], ["skullInpi", l.skullInpi],
      ["skullChocolate", l.skullChocolate], ["skullVariation", l.variation],
      ["monarchHeading", l.monarchHeading], ["monarchExplanation", l.monarchText]]) text(id, value);
    for (const [id, label, source] of [["skullInpiLink", l.inpiLink, sources.inpi],
      ["skullChocolateLink", l.chocolateLink, sources.alas], ["monarchSourceLink", l.monarchLink, sources.monarch]]) {
      text(id, label);
      $(id).href = source.url;
    }
    reconcile();
  }

  candle.addEventListener("click", () => {
    if (!lightVisitCandle(state)) return;
    moment.dataset.lit = "true";
    render();
  });
  motion.addEventListener("click", () => {
    if (preference.matches) return;
    state.paused = !state.paused;
    render();
  });
  preference.addEventListener("change", () => { lastTick = performance.now(); render(); });
  document.addEventListener("visibilitychange", () => { lastTick = performance.now(); reconcile(); });
  document.addEventListener("focusin", reconcile);
  document.addEventListener("focusout", () => queueMicrotask(reconcile));
  window.addEventListener("scroll", () => { advanceMonarch(state, 0, false); reconcile(); }, { passive: true });
  window.addEventListener("resize", () => { advanceMonarch(state, 0, false); reconcile(); });
  const observer = new MutationObserver(reconcile);
  for (const el of [$("introModal"), $("offeringsDialog"), document.querySelector(".panel")]) {
    observer.observe(el, { attributes: true, attributeFilter: ["hidden", "open"] });
  }
  const resize = new ResizeObserver(() => { advanceMonarch(state, 0, false); reconcile(); });
  resize.observe(frame);
  const timer = window.setInterval(() => {
    const now = performance.now();
    // Throttled/background time never turns into a burst of delayed appearances.
    const elapsed = Math.min(1000, Math.max(0, now - lastTick));
    lastTick = now;
    const route = availableRoute();
    advanceMonarch(state, elapsed, Boolean(route && !state.paused && !preference.matches));
    paint(route);
  }, 1000);
  window.addEventListener("pagehide", () => { clearInterval(timer); observer.disconnect(); resize.disconnect(); }, { once: true });
  render();
  return { render };
}
