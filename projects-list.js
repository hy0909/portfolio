async function loadProjectListImages() {
  const imageNodes = document.querySelectorAll("[data-project-list-image]");
  if (!imageNodes.length) {
    return;
  }

  try {
    const apiPayload = await fetchLiveProjectListImages();
    if (apiPayload?.item) {
      hydrateProjectListImages(apiPayload.item);
      return;
    }

    const response = await fetch("./data/notion-boxes.json", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || `HTTP ${response.status}`);
    }

    if (payload.configured === false) {
      return;
    }

    const item = findProjectListItem(payload.items ?? []);
    if (item) {
      hydrateProjectListImages(item);
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetchLiveProjectListImages() {
  const response = await fetch("/api/notion-project-images?slot=projectlist", { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  return response.json();
}

function findProjectListItem(items) {
  return items.find((item) => normalizeSlot(item.slot) === "projectlist") || null;
}

function hydrateProjectListImages(item) {
  [1, 2].forEach((index) => {
    const imageUrl = item[`img${index}`] || "";
    const imageNode = document.querySelector(`[data-project-list-image="${index}"]`);
    if (!imageNode || !imageUrl) {
      return;
    }

    imageNode.style.backgroundImage = `url("${escapeCssUrl(imageUrl)}")`;
  });
}

function normalizeSlot(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(/\s+/g, "");
}

function escapeCssUrl(value) {
  return String(value).replaceAll('"', '\\"');
}

loadProjectListImages();
