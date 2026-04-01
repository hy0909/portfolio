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
    if (item.slot === "project1" || item.slot === "project2") {
      mapped[item.slot] = item;
    }
  }

  const fallbacks = items.filter((item) => item.slot !== "project1" && item.slot !== "project2");
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
      dateNode.textContent = item.date || "";
    }

    if (tagsNode && Array.isArray(item.tags) && item.tags.length > 0) {
      tagsNode.innerHTML = item.tags
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");
    }
  }
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
