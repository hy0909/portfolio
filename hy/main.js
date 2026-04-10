async function loadProjects() {
  try {
    const response = await fetch("./data/notion-boxes.json", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || `HTTP ${response.status}`);
    }

    if (payload.configured === false) {
      return;
    }

    hydrateProjectCards(payload.items ?? []);
  } catch (error) {
    console.error(error);
  }
}

function hydrateProjectCards(items) {
  const mapped = {
    project1: null,
    project2: null,
  };

  for (const item of items) {
    const normalizedSlot = normalizeSlot(item.slot);
    if (normalizedSlot === "project1" || normalizedSlot === "project2") {
      mapped[normalizedSlot] = item;
    }
  }

  const fallbacks = items.filter((item) => {
    const normalizedSlot = normalizeSlot(item.slot);
    return normalizedSlot !== "project1" && normalizedSlot !== "project2";
  });
  if (!mapped.project1 && fallbacks[0]) {
    mapped.project1 = fallbacks[0];
  }
  if (!mapped.project2 && fallbacks[1]) {
    mapped.project2 = fallbacks[1];
  }

  for (const [slot, item] of Object.entries(mapped)) {
    if (!item) {
      continue;
    }

    const card = document.querySelector(`[data-project-slot="${slot}"]`);
    if (!card) {
      continue;
    }

    const titleNode = card.querySelector('[data-field="title"]');
    const summationNode = card.querySelector('[data-field="summation"]');
    const dateNode = card.querySelector('[data-field="date"]');
    const tagsNode = card.querySelector('[data-field="tags"]');

    if (titleNode && item.title) {
      titleNode.textContent = item.title;
    }

    if (summationNode && item.summation) {
      summationNode.textContent = item.summation;
    }

    if (dateNode) {
      dateNode.textContent = formatProjectDate(item.date);
    }

    if (tagsNode && Array.isArray(item.tags) && item.tags.length > 0) {
      tagsNode.innerHTML = item.tags
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");
    }
  }
}

function normalizeSlot(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(/\s+/g, "");
}

function formatProjectDate(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (/^\d{4}\.\s\d{2}\.\s\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{4}$/.test(raw)) {
    return `${raw}. 01. 01`;
  }

  const normalized = raw.replaceAll(".", "-").replaceAll("/", "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}. ${month.padStart(2, "0")}. ${day.padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}. ${String(parsed.getMonth() + 1).padStart(2, "0")}. ${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return raw;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

loadProjects();
