import { content, labels } from "./content.js";
import { sources, itemSourceMap } from "./sources.js";
import { illustrations } from "./illustrations.js";

// State Contract
export const state = {
  language: "en",
  selected: "flowers",
  tab: "context",
  visitedOfferings: new Set(["flowers"]),
  currentRequestId: 0
};

const $ = (id) => document.getElementById(id);

export function renderSources() {
  const l = labels[state.language];

  $("sourcesKicker").textContent = l.sourcesKicker;
  $("sourcesHeading").textContent = l.sourcesHeading;
  $("sourcesIntro").textContent = l.sourcesIntro;
  $("sourcesDisclaimer").textContent = l.sourcesDisclaimer;

  $("sourceCards").replaceChildren(
    ...Object.entries(sources).map(([id, src]) => {
      const card = document.createElement("article");
      card.className = "source-card";
      const pub = document.createElement("div");
      pub.className = "publisher";
      pub.textContent = src.publisher;
      const h = document.createElement("h3");
      h.textContent = src.name[state.language];
      const desc = document.createElement("p");
      desc.textContent = src.description[state.language];
      const a = document.createElement("a");
      a.href = src.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = l.readOriginal;
      card.append(pub, h, desc, a);
      return card;
    })
  );
}

export function renderOfferingDetailSources() {
  const l = labels[state.language];
  const listEl = $("offeringSourcesList");
  const titleEl = $("offeringSourcesTitle");
  if (titleEl) titleEl.textContent = l.detailSourcesTitle;
  if (!listEl) return;

  const mapped = itemSourceMap[state.selected] || [];
  listEl.replaceChildren(
    ...mapped.map((id) => {
      const src = sources[id];
      const li = document.createElement("li");
      li.className = "offering-source-item";

      const pub = document.createElement("span");
      pub.className = "offering-source-pub";
      pub.textContent = src.publisher;

      const a = document.createElement("a");
      a.className = "offering-source-link";
      a.href = src.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = `${src.name[state.language]} ↗`;

      li.append(pub, a);
      return li;
    })
  );
}

export function render() {
  const l = labels[state.language];
  const d = content[state.selected][state.language];
  const isEn = state.language === "en";

  document.documentElement.lang = state.language;

  // Render sources section & offering detail references
  renderSources();
  renderOfferingDetailSources();

  // Landmarks & labels
  const stage = document.querySelector(".stage");
  if (stage) stage.setAttribute("aria-label", l.stageAria);

  const scene = document.querySelector(".scene");
  if (scene) scene.setAttribute("alt", l.sceneAria);

  $("stageHeading").textContent = l.stageHeading;
  const brandEm = document.querySelector(".brand em");
  if (brandEm) brandEm.textContent = l.brandSubtitle;
  const quote = document.querySelector(".quote");
  if (quote) quote.textContent = l.quote;

  // Hotspots ARIA & active classes
  document.querySelectorAll(".hotspot").forEach((b) => {
    const id = b.dataset.id;
    const name = l.names[id] || id;
    b.setAttribute("aria-label", (isEn ? "Explore " : "Explorar ") + name + (state.visitedOfferings.has(id) ? (isEn ? " (explored)" : " (explorado)") : ""));
    b.setAttribute("aria-pressed", String(id === state.selected));
    b.classList.toggle("selected", id === state.selected);
  });

  // Non-spatial offering buttons with visited indicators
  const offeringsTitle = $("offeringsListTitle");
  if (offeringsTitle) offeringsTitle.textContent = l.offeringsListTitle;

  document.querySelectorAll(".offering-select-btn").forEach((b) => {
    const id = b.dataset.id;
    const name = l.names[id] || id;
    const isVisited = state.visitedOfferings.has(id);
    const visitedNotice = isVisited ? (isEn ? " (explored)" : " (explorado)") : "";
    b.setAttribute("aria-label", `${isEn ? "Select " : "Seleccionar "}${name}${visitedNotice}`);
    b.setAttribute("aria-pressed", String(id === state.selected));
    b.classList.toggle("active", id === state.selected);
    b.classList.toggle("is-visited", isVisited);
    const span = b.querySelector(".offering-btn-label");
    if (span) span.textContent = name;
  });

  // Update Visit Progress Bar & Completion
  const count = state.visitedOfferings.size;
  const total = 7;
  const pct = Math.round((count / total) * 100);

  const progressTitle = $("visitProgressTitle");
  if (progressTitle) progressTitle.textContent = l.progress.title;

  const progressCount = $("visitProgressCount");
  if (progressCount) progressCount.textContent = `${count} / ${total}`;

  const progressFill = $("visitProgressFill");
  if (progressFill) progressFill.style.width = `${pct}%`;

  const completionBadge = $("completionBadge");
  const completionText = $("completionText");
  if (completionBadge && completionText) {
    completionText.textContent = l.progress.complete;
    completionBadge.hidden = count < total;
  }

  // Update Intro Modal text if rendered
  const introBadge = $("introBadge");
  if (introBadge) introBadge.textContent = l.intro.badge;
  const introHeading = $("introHeading");
  if (introHeading) introHeading.textContent = l.intro.title;
  const introText = $("introText");
  if (introText) introText.textContent = l.intro.text;
  const introBegin = $("introBeginBtn");
  if (introBegin) introBegin.textContent = l.intro.begin;
  const introSkip = $("introSkipBtn");
  if (introSkip) introSkip.textContent = l.intro.skip;
  const introDismissX = $("introDismissX");
  if (introDismissX) introDismissX.setAttribute("aria-label", l.intro.dismiss);

  // Reset and ask buttons
  $("reset").setAttribute("aria-label", l.resetAria);
  $("askButton").setAttribute("aria-label", l.askButtonAria);

  // Panel content
  $("category").textContent = d.category;
  $("offeringArt").innerHTML = illustrations[state.selected] || "";
  $("title").textContent = d.title;
  $("subtitle").textContent = d.subtitle;
  $("description").textContent = d.description;

  $("tabcopy").textContent = d[state.tab];
  $("hint").textContent = l.hint;
  $("askLabel").textContent = l.ask;
  $("question").placeholder = l.placeholder;
  $("footnote").textContent = l.foot;

  // i18n data elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = l[el.dataset.i18n];
  });

  // Tabs
  document.querySelectorAll(".tabs button").forEach((el, i) => {
    el.textContent = l.tabs[i];
    el.classList.toggle("active", el.dataset.tab === state.tab);
    el.setAttribute("aria-pressed", String(el.dataset.tab === state.tab));
  });

  // Language buttons
  $("es").classList.toggle("active", state.language === "es");
  $("en").classList.toggle("active", state.language === "en");
  $("es").setAttribute("aria-pressed", String(state.language === "es"));
  $("en").setAttribute("aria-pressed", String(state.language === "en"));
}

function setActiveNav(section) {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    const active = button.dataset.nav === section;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "location");
    else button.removeAttribute("aria-current");
  });
}

function focusDestination(element) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "center"
  });
}

export function selectOffering(id) {
  if (!Object.hasOwn(content, id)) return;
  setActiveNav("explore");
  state.currentRequestId++;
  state.selected = id;
  state.visitedOfferings.add(id);
  state.tab = "context";
  $("answer").textContent = "";
  render();
  if (window.innerWidth <= 850) {
    focusDestination($("title"));
  }
}

export async function ask() {
  const q = $("question").value.trim();
  if (!q) return;

  const currentOffering = state.selected;
  const currentLang = state.language;
  const d = content[currentOffering][currentLang];
  const l = labels[currentLang];

  // Increment and capture request ID to guard against out-of-order race conditions
  const thisRequestId = ++state.currentRequestId;

  // Set loading state
  $("answer").textContent = l.thinkingMessage || "Consulting...";
  $("question").value = "";

  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offeringId: currentOffering,
        language: currentLang,
        question: q
      })
    });

    // Guard: ignore response if user navigated to a different offering, switched language, or submitted a newer question
    if (thisRequestId !== state.currentRequestId || state.selected !== currentOffering || state.language !== currentLang) {
      return;
    }

    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();

    // Guard again after parsing JSON
    if (thisRequestId !== state.currentRequestId || state.selected !== currentOffering || state.language !== currentLang) {
      return;
    }

    if (data.success && data.answer) {
      // Background reading is displayed separately, never attached as claim verification.
      $("answer").textContent = `${l.gemmaPrefix}${data.answer} ${l.aiReferenceNotice}`;
      return;
    }

    // Fallback if model was unavailable
    $("answer").textContent = `${l.answerPrefix}${d.context} ${d.variations}`;
  } catch (err) {
    // Guard in error handler
    if (thisRequestId !== state.currentRequestId || state.selected !== currentOffering || state.language !== currentLang) {
      return;
    }
    // Graceful offline & error fallback
    $("answer").textContent = `${l.answerPrefix}${d.context} ${d.variations}`;
  }
}

let previouslyFocusedElement = null;

export function trapFocus(event) {
  const modal = $("introModal");
  if (!modal || modal.hidden) return;

  const focusable = modal.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.key === "Tab") {
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}

export function openIntroModal() {
  const modal = $("introModal");
  if (!modal) return;

  previouslyFocusedElement = document.activeElement;
  modal.hidden = false;

  // Inert also prevents keyboard and pointer interaction with the background.
  const app = document.querySelector(".app");
  const sourcesSection = document.getElementById("sourcesSection");
  if (app) app.inert = true;
  if (sourcesSection) sourcesSection.inert = true;

  window.addEventListener("keydown", trapFocus);
  $("introBeginBtn")?.focus();
}

export function dismissIntroModal() {
  const modal = $("introModal");
  if (modal) {
    modal.hidden = true;
    try {
      localStorage.setItem("altar_intro_seen", "true");
    } catch (_) {}

    window.removeEventListener("keydown", trapFocus);

    // Restore background content visibility
    const app = document.querySelector(".app");
    const sourcesSection = document.getElementById("sourcesSection");
    if (app) app.inert = false;
    if (sourcesSection) sourcesSection.inert = false;

    // Restore focus gracefully to previously focused element or first hotspot
    if (previouslyFocusedElement?.isConnected && previouslyFocusedElement !== document.body && !modal.contains(previouslyFocusedElement)) {
      previouslyFocusedElement.focus();
    } else {
      const firstHotspot = document.querySelector(".hotspot.selected") || document.querySelector(".hotspot");
      if (firstHotspot) firstHotspot.focus();
    }
  }
}

export function init() {
  // Check first-visit welcome modal state
  const modal = $("introModal");
  if (modal) {
    let seen = false;
    try {
      seen = localStorage.getItem("altar_intro_seen") === "true";
    } catch (_) {}

    if (seen) {
      modal.hidden = true;
    } else {
      openIntroModal();
    }

    $("introDismissX")?.addEventListener("click", dismissIntroModal);
    $("introBeginBtn")?.addEventListener("click", dismissIntroModal);
    $("introSkipBtn")?.addEventListener("click", dismissIntroModal);

    // Escape key closes modal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) {
        dismissIntroModal();
      }
    });
  }

  // Hotspot clicks
  document.querySelectorAll(".hotspot").forEach((b) =>
    b.addEventListener("click", () => selectOffering(b.dataset.id))
  );

  // Non-spatial offering list clicks
  document.querySelectorAll(".offering-select-btn").forEach((b) =>
    b.addEventListener("click", () => selectOffering(b.dataset.id))
  );

  // Tabs clicks
  document.querySelectorAll(".tabs button").forEach((b) =>
    b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      render();
    })
  );

  // Language clicks - preserve selected tab and visited offerings, invalidate pending async requests
  ["es", "en"].forEach((lang) =>
    $(lang).addEventListener("click", () => {
      state.currentRequestId++;
      state.language = lang;
      $("answer").textContent = "";
      render();
    })
  );

  // The three section controls share the same focus/scroll contract.
  $("reset").addEventListener("click", () => selectOffering("flowers"));
  $("navExplore").addEventListener("click", () => {
    setActiveNav("explore");
    focusDestination(document.querySelector(".hotspot.selected"));
  });
  $("navOfferings").addEventListener("click", () => {
    setActiveNav("offerings");
    focusDestination(document.querySelector(".offering-select-btn.active"));
  });
  $("navSources").addEventListener("click", () => {
    setActiveNav("sources");
    focusDestination($("sourcesHeading"));
  });

  // Question Q&A input
  $("askButton").addEventListener("click", ask);
  $("question").addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id === "sourcesHeading" ? "sources" : "explore");
        }
      }
    }, { threshold: 0.5 });
    observer.observe($("sourcesHeading"));
    observer.observe(document.querySelector(".scene-frame"));
  }

  // Initial render
  render();
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", init);
}
