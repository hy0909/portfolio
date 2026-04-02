async function loadProjectDetail() {
  const pageSlot = normalizeSlot(document.body.dataset.projectSlot);
  if (!pageSlot) {
    return;
  }

  try {
    const response = await fetch("./data/notion-boxes.json", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || `HTTP ${response.status}`);
    }

    if (payload.configured === false) {
      return;
    }

    hydrateDetailPage(payload.items ?? [], pageSlot);
  } catch (error) {
    console.error(error);
  }
}

function hydrateDetailPage(items, pageSlot) {
  const exactMatch = items.find((item) => normalizeSlot(item.slot) === pageSlot);
  const fallbackIndex = pageSlot === "project1" ? 0 : 1;
  const fallback = items[fallbackIndex] || null;
  const item = exactMatch || fallback;

  if (!item) {
    return;
  }

  setText('[data-detail-field="project"]', item.project || pageSlot.toUpperCase());
  setText('[data-detail-field="title"]', item.title || "Untitled");
  setText('[data-detail-field="date"]', item.date || "");
  setText('[data-detail-field="intro"]', item.summation || item.body1 || "");

  renderTags(item.tags || []);
  renderSection(1, item.img1, item.body1);
  renderSection(2, item.img2, item.body2);
  renderSection(3, item.img3, item.body3);
}

function renderTags(tags) {
  const tagsNode = document.querySelector('[data-detail-field="tags"]');
  if (!tagsNode) {
    return;
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    tagsNode.innerHTML = "";
    return;
  }

  tagsNode.innerHTML = tags
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");
}

function renderSection(index, imageUrl, body) {
  const section = document.querySelector(`[data-detail-section="${index}"]`);
  if (!section) {
    return;
  }

  const imageNode = section.querySelector('[data-detail-image]');
  const bodyNode = section.querySelector('[data-detail-body]');

  if (!imageUrl && !body) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  if (imageNode) {
    if (imageUrl) {
      imageNode.style.backgroundImage = `linear-gradient(180deg, rgba(17, 24, 39, 0.08), rgba(17, 24, 39, 0.08)), url("${escapeCssUrl(imageUrl)}")`;
      imageNode.classList.add("is-notion-image");
    } else {
      imageNode.style.backgroundImage = "";
      imageNode.classList.remove("is-notion-image");
    }
  }

  if (bodyNode) {
    bodyNode.textContent = body || "";
  }
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value || "";
  }
}

function normalizeSlot(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(/\s+/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeCssUrl(value) {
  return String(value).replaceAll('"', '\\"');
}

loadProjectDetail();
