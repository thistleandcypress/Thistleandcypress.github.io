const fs = require("fs");
const fg = require("fast-glob");

// --- CONFIGURE YOUR INCLUDED FOLDERS HERE ---
const INCLUDED_FOLDERS = [
  "kitchen",
  "garden",
  "craft",
  "rhythm"
];

// Root-level HTML pages to include
const ROOT_PAGES = ["index.html", "about.html"];

// Base URL for your site
const BASE_URL = "https://thistleandcypress.com";

// Utility: convert file path to clean URL
function toUrl(path) {
  // Remove leading slash
  path = path.replace(/^\//, "");

  // Convert folder/index.html → /folder/
  if (path.endsWith("index.html")) {
    const folder = path.replace("index.html", "");
    return `${BASE_URL}/${folder}`;
  }

  // Normal HTML file
  return `${BASE_URL}/${path}`;
}

// Utility: get last modified date
function getLastMod(path) {
  const stats = fs.statSync(path);
  return stats.mtime.toISOString().split("T")[0];
}

// Collect URLs
let urls = [];

// Add root-level pages
ROOT_PAGES.forEach((file) => {
  if (fs.existsSync(file)) {
    urls.push({
      loc: `${BASE_URL}/${file === "index.html" ? "" : file}`,
      lastmod: getLastMod(file)
    });
  }
});

// Add pillar folders + all subfolders
INCLUDED_FOLDERS.forEach((folder) => {
  const pattern = `${folder}/**/*.html`;
  const files = fg.sync(pattern);

  files.forEach((file) => {
    urls.push({
      loc: toUrl(file),
      lastmod: getLastMod(file)
    });
  });
});

// Build XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
  )
  .join("")}
</urlset>
`;

// Write sitemap.xml
fs.writeFileSync("sitemap.xml", xml.trim());

console.log("Dynamic sitemap generated.");
