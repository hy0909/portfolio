async function loadProjectImages() {
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

    hydrateProjectImages(payload.items ?? [], pageSlot);
  } catch (error) {
    console.error(error);
  }
}

function hydrateProjectImages(items, pageSlot) {
  const exactMatch = items.find((item) => normalizeSlot(item.slot) === pageSlot);
  const fallbackIndex = pageSlot === "project1" ? 0 : 1;
  const item = exactMatch || items[fallbackIndex] || null;

  if (!item) {
    return;
  }

  for (let index = 1; index <= 8; index += 1) {
    const imageUrl = item[`img${index}`] || "";
    const imageNode = document.querySelector(`[data-notion-image-index="${index}"]`);
    if (!imageNode || !imageUrl) {
      continue;
    }

    imageNode.style.backgroundImage = `linear-gradient(180deg, rgba(17, 24, 39, 0.08), rgba(17, 24, 39, 0.08)), url("${escapeCssUrl(imageUrl)}")`;
    imageNode.classList.add("is-notion-image");
  }
}

function normalizeSlot(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(/\s+/g, "");
}

function escapeCssUrl(value) {
  return String(value).replaceAll('"', '\\"');
}

loadProjectImages();
