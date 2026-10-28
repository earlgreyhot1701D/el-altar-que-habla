import { content, labels } from "./content.js";
import { sources, itemSourceMap } from "./sources.js";
import { illustrations } from "./illustrations.js";

// State Contract
export const state = {
  language: "en",
  selected: "flowers",
  tab: "context",
  visitedOfferings: new Set(["flowers"])
};

const $ = (id) => document.getElementById(id);

export function renderSources() {
  const en = state.language === "en";
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

  $("itemSources").replaceChildren();
  const label = document.createElement("span");
  label.textContent = l.supportingSources;
  $("itemSources").append(label);

  const mapped = itemSourceMap[state.selected] || [];
  mapped.forEach((id, i) => {
    if (i > 0) $("itemSources").append(document.createTextNode(" · "));
    const a = document.createElement("a");
    a.href = sources[id].url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = sources[id].publisher.split(" · ")[0];
    $("itemSources").append(a);
  });
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
  if (scene) scene.setAttribute("aria-label", l.sceneAria);

  $("stageHeading").textContent = l.stageHeading;
  const brandEm = document.querySelector(".brand em");
  if (brandEm) brandEm.textContent = l.brandSubtitle;
  const quote = document.querySelector(".quote");
  if (quote) quote.textContent = l.quote;

  // Hotspots ARIA & active classes
  document.querySelectorAll(".hotspot").forEach((b) => {
    const id = b.dataset.id;
    const name = l.names[id] || id;
    b.setAttribute("aria-label", (isEn ? "Explore " : "Explorar ") + name);
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
    b.setAttribute("aria-label", (isEn ? "Select " : "Seleccionar ") + name);
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

  // Facts
  $("facts").replaceChildren(
    ...d.facts.map(([symbol, name]) => {
      const div = document.createElement("div");
      div.className = "fact";
      const b = document.createElement("b");
      b.textContent = symbol;
      const s = document.createElement("span");
      s.textContent = name;
      div.append(b, s);
      return div;
    })
  );

  $("note").textContent = d.note;
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

export function selectOffering(id) {
  state.selected = id;
  state.visitedOfferings.add(id);
  state.tab = "context";
  $("answer").textContent = "";
  render();
  if (window.innerWidth <= 850) {
    document.querySelector(".panel")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start"
    });
  }
}

export async function ask() {
  const q = $("question").value.trim();
  if (!q) return;

  const currentOffering = state.selected;
  const currentLang = state.language;
  const d = content[currentOffering][currentLang];
  const l = labels[currentLang];

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

    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json();

    if (data.success && data.answer) {
      const citation = data.sourceMention ? ` (${data.sourceMention})` : "";
      $("answer").textContent = `${l.gemmaPrefix}${data.answer}${citation}`;
      return;
    }

    // Fallback if model was unavailable
    $("answer").textContent = `${l.answerPrefix}${d.context} ${d.variations}`;
  } catch (err) {
    // Graceful offline & error fallback
    $("answer").textContent = `${l.answerPrefix}${d.context} ${d.variations}`;
  }
}

export function dismissIntroModal() {
  const modal = $("introModal");
  if (modal) {
    modal.hidden = true;
    try {
      localStorage.setItem("altar_intro_seen", "true");
    } catch (_) {}
    // Return focus gracefully to main stage
    const firstHotspot = document.querySelector(".hotspot");
    if (firstHotspot) firstHotspot.focus();
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
      modal.hidden = false;
      // Focus the primary action button for keyboard users
      $("introBeginBtn")?.focus();
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

  // Language clicks - preserve selected tab and visited offerings
  ["es", "en"].forEach((lang) =>
    $(lang).addEventListener("click", () => {
      state.language = lang;
      $("answer").textContent = "";
      render();
    })
  );

  // Reset click
  $("reset").addEventListener("click", () => {
    state.selected = "flowers";
    state.tab = "context";
    $("answer").textContent = "";
    render();
  });

  // Navigation sidebar items
  document.querySelectorAll("[data-nav]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-nav]").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const mode = b.dataset.nav;
      const l = labels[state.language];
      if (mode === "sources") {
        document.getElementById("sourcesSection")?.scrollIntoView({ behavior: "smooth" });
        $("answer").textContent = "";
      } else if (l.navMessages[mode]) {
        $("answer").textContent = l.navMessages[mode];
      } else {
        $("answer").textContent = "";
      }
      if (window.innerWidth <= 850 && mode !== "explore" && mode !== "sources") {
        document.querySelector(".panel")?.scrollIntoView({ behavior: "smooth" });
      }
    })
  );

  // Question Q&A input
  $("askButton").addEventListener("click", ask);
  $("question").addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask();
  });

  // Initial render
  render();
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", init);
}
