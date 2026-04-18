module.exports = async (req, res) => {
  const notionToken = process.env.NOTION_TOKEN || "";
  const notionDatabaseId = process.env.NOTION_DATABASE_ID || "";
  const notionVersion = "2022-06-28";
  const slot = normalizeSlot(req.query?.slot || "");

  if (!notionToken || !notionDatabaseId) {
    return res.status(500).json({
      ok: false,
      message: "Missing NOTION_TOKEN or NOTION_DATABASE_ID.",
    });
  }

  if (!slot) {
    return res.status(400).json({
      ok: false,
      message: "Missing slot query parameter.",
    });
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": notionVersion,
      },
      body: JSON.stringify({
        page_size: 100,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: data.message || "Failed to query Notion database.",
      });
    }

    const items = (data.results || []).map(mapNotionPage).filter(Boolean);
    const item = items.find((entry) => normalizeSlot(entry.slot) === slot);

    if (!item) {
      return res.status(404).json({
        ok: false,
        message: `No Notion item found for slot "${slot}".`,
      });
    }

    return res.status(200).json({
      ok: true,
      item,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Unknown Notion error.",
    });
  }
};

function mapNotionPage(page) {
  const properties = page.properties || {};
  const slotProperty = findPropertyByName(properties, "project");
  const altSlotProperty = findPropertyByName(properties, "slot");
  const projectLabel = readPlainText(slotProperty) || readPlainText(altSlotProperty);

  return {
    slot: projectLabel,
    img1: readFiles(findPropertyByName(properties, "img1")) || readFiles(findPropertyByName(properties, "img")),
    img2: readFiles(findPropertyByName(properties, "img2")),
    img3: readFiles(findPropertyByName(properties, "img3")),
    img4: readFiles(findPropertyByName(properties, "img4")),
    img5: readFiles(findPropertyByName(properties, "img5")),
    img6: readFiles(findPropertyByName(properties, "img6")),
    img7: readFiles(findPropertyByName(properties, "img7")),
    img8: readFiles(findPropertyByName(properties, "img8")),
  };
}

function findPropertyByName(properties, expectedName) {
  if (properties[expectedName]) {
    return properties[expectedName];
  }

  for (const [name, property] of Object.entries(properties)) {
    if (name.toLowerCase() === expectedName.toLowerCase()) {
      return property;
    }
  }

  return null;
}

function readPlainText(property) {
  if (!property) {
    return "";
  }

  if (property.type === "title") {
    return property.title.map((item) => item.plain_text).join("");
  }

  if (property.type === "rich_text") {
    return property.rich_text.map((item) => item.plain_text).join("");
  }

  return "";
}

function readFiles(property) {
  if (!property || property.type !== "files" || !Array.isArray(property.files) || !property.files.length) {
    return "";
  }

  const [firstFile] = property.files;
  if (firstFile.type === "external") {
    return firstFile.external?.url || "";
  }

  if (firstFile.type === "file") {
    return firstFile.file?.url || "";
  }

  return "";
}

function normalizeSlot(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(/\s+/g, "");
}
