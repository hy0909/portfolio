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
  const summationProperty = findPropertyByName(properties, "summation");
  const bodyProperty = findPropertyByName(properties, "body");
  const dateProperty = findPropertyByName(properties, "date");
  const imageProperty = findPropertyByName(properties, "img");
  const image1Property = findPropertyByName(properties, "img1");
  const image2Property = findPropertyByName(properties, "img2");
  const image3Property = findPropertyByName(properties, "img3");
  const image4Property = findPropertyByName(properties, "img4");
  const image5Property = findPropertyByName(properties, "img5");
  const image6Property = findPropertyByName(properties, "img6");
  const image7Property = findPropertyByName(properties, "img7");
  const image8Property = findPropertyByName(properties, "img8");
  const body1Property = findPropertyByName(properties, "body1");
  const body2Property = findPropertyByName(properties, "body2");
  const body3Property = findPropertyByName(properties, "body3");
  const tagsProperty = findPropertyByName(properties, "tags");
  const slotProperty = findPropertyByName(properties, "project");
  const altSlotProperty = findPropertyByName(properties, "slot");
  const projectLabel = readPlainText(slotProperty) || readPlainText(altSlotProperty);

  return {
    id: page.id,
    title: readPlainText(titleProperty) || "Untitled",
    summation: readPlainText(summationProperty),
    body: readRichText(bodyProperty),
    date: formatDateRange(readDateRange(dateProperty)),
    imageUrl: readFiles(imageProperty),
    project: projectLabel,
    img1: readFiles(image1Property) || readFiles(imageProperty),
    body1: readRichText(body1Property),
    img2: readFiles(image2Property),
    body2: readRichText(body2Property),
    img3: readFiles(image3Property),
    body3: readRichText(body3Property),
    img4: readFiles(image4Property),
    img5: readFiles(image5Property),
    img6: readFiles(image6Property),
    img7: readFiles(image7Property),
    img8: readFiles(image8Property),
    tags: readTags(tagsProperty),
    slot: projectLabel.toLowerCase(),
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

function readDateRange(property) {
  if (!property) {
    return null;
  }

  if (property.type === "date" && property.date && property.date.start) {
    return {
      start: property.date.start,
      end: property.date.end || "",
    };
  }

  if (property.type === "formula" && property.formula?.type === "date" && property.formula.date?.start) {
    return {
      start: property.formula.date.start,
      end: property.formula.date.end || "",
    };
  }

  if (property.type === "rich_text") {
    const text = readRichText(property).trim();
    if (text) {
      return {
        start: text,
        end: "",
        raw: true,
      };
    }
  }

  return null;
}

function formatDateRange(value) {
  if (!value || !value.start) {
    return "";
  }

  if (value.raw) {
    return value.start;
  }

  const start = formatDateValue(value.start);
  const end = value.end ? formatDateValue(value.end) : "";

  if (!end) {
    return start;
  }

  return `${start} ~ ${end}`;
}

function formatDateValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());

  return `${month}/${day}/${year}`;
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

function readTags(property) {
  if (!property) {
    return [];
  }

  if (property.type === "multi_select") {
    return property.multi_select.map((item) => item.name).filter(Boolean);
  }

  if (property.type === "rich_text") {
    return property.rich_text
      .map((item) => item.plain_text)
      .join(",")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (property.type === "formula" && property.formula?.type === "string" && property.formula.string) {
    return property.formula.string
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

async function writePayload(payload) {
  await fs.promises.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
