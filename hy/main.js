const container = document.querySelector("#notion-boxes");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatBody(text) {
  return escapeHtml(text).replaceAll("\n", "<br />");
}

function renderStatus(title, body) {
  container.innerHTML = `
    <article class="boxed boxed-status">
      <p><strong>${escapeHtml(title)}</strong></p>
      <p>${formatBody(body)}</p>
    </article>
  `;
}

function renderBoxes(items) {
  if (!items.length) {
    renderStatus("No Content", "Your Notion database has no published rows yet.");
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <article class="boxed">
          <p><strong>${escapeHtml(item.title)}</strong></p>
          ${item.date ? `<p class="post-date">${escapeHtml(item.date)}</p>` : ""}
          ${item.imageUrl ? `<img class="post-image" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" />` : ""}
          <p>${formatBody(item.body)}</p>
        </article>
      `,
    )
    .join("");
}

async function loadBoxes() {
  try {
    const response = await fetch("./data/notion-boxes.json", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || `HTTP ${response.status}`);
    }

    if (payload.configured === false) {
      renderStatus(
        "Notion Connection Needed",
        payload.message || "Set NOTION_TOKEN and NOTION_DATABASE_ID in GitHub Actions secrets.",
      );
      return;
    }

    renderBoxes(payload.items ?? []);
  } catch (error) {
    renderStatus(
      "Notion Error",
      error.message || "Please check your Notion token, database ID, and GitHub Actions secrets.",
    );
    console.error(error);
  }
}

loadBoxes();
