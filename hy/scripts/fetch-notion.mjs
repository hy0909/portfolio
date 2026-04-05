import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const dataDir = path.join(rootDir, "data");
const outputFile = path.join(dataDir, "notion-boxes.json");

const notionToken = process.env.NOTION_TOKEN || "";
const notionDatabaseId = process.env.NOTION_DATABASE_ID || "";
const notionVersion = "2022-06-28";

await fs.promises.mkdir(dataDir, { recursive: true });

if (!notionToken || !notionDatabaseId) {
  await writePayload({
    items: [],
    configured: false,
    message: "Missing NOTION_TOKEN or NOTION_DATABASE_ID in GitHub Actions secrets.",
  });
  process.exit(0);
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
      sorts: [
        {
          property: "date",
          direction: "descending",
        },
      ],
      page_size: 100,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    await writePayload({
      items: [],
      configured: true,
      message: data.message || "Failed to query Notion database.",
    });
    process.exit(1);
  }

  const items = (data.results || []).map(mapNotionPage).filter(Boolean);
  await writePayload({ items, configured: true });
} catch (error) {
  await writePayload({
    items: [],
    configured: true,
    message: error.message || "Unknown Notion error.",
  });
  process.exit(1);
}

function mapNotionPage(page) {
  const properties = page.properties || {};
  const titleProperty = findPropertyByName(properties, "title");
  const bodyProperty = findPropertyByName(properties, "body");
  const dateProperty = findPropertyByName(properties, "date");
  const imageProperty = findPropertyByName(properties, "img");

  return {
    id: page.id,
    title: readPlainText(titleProperty) || "Untitled",
    body: readRichText(bodyProperty),
    date: formatDate(readDate(dateProperty)),
    imageUrl: readFiles(imageProperty),
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
    return readTitle(property);
  }

  if (property.type === "rich_text") {
    return readRichText(property);
  }

  return "";
}

function readTitle(property) {
  if (!property || property.type !== "title") {
    return "";
  }

  return property.title.map((item) => item.plain_text).join("");
}

function readRichText(property) {
  if (!property || property.type !== "rich_text") {
    return "";
  }

  return property.rich_text.map((item) => item.plain_text).join("");
}

function readDate(property) {
  if (!property || property.type !== "date" || !property.date || !property.date.start) {
    return "";
  }

  return property.date.start;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
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

async function writePayload(payload) {
  await fs.promises.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
