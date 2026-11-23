// RaidKit: tek dosyalık HTML üretir (../RaidKit.html).
// Yazı tipleri base64 olarak gömülür; dosya internetsiz ve tek başına çalışır.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = "https://kagan4545.github.io/Tak-lma-/";
const src = readFileSync(join(root, "..", "index.html"), "utf8");

const FONTS = {
  "saira-condensed": [600, 700, 800],
  "ibm-plex-sans": [400, 500, 600],
  "jetbrains-mono": [500, 700],
};
let fontCss = "";
for (const [fam, weights] of Object.entries(FONTS)) {
  const dir = join(root, "node_modules", "@fontsource", fam);
  for (const w of weights) for (const sub of ["latin-ext", "latin"]) {
    const cssFile = join(dir, `${sub}-${w}.css`);
    if (!existsSync(cssFile)) throw new Error("Yazı tipi bulunamadı: " + cssFile + " (önce app klasöründe npm install çalıştır)");
    let css = readFileSync(cssFile, "utf8");
    css = css.replace(/,\s*url\(\.\/files\/[^)]+\.woff\)\s*format\('woff'\)/g, "");
    css = css.replace(/url\(\.\/files\/([^)]+\.woff2)\)/g, (_, f) =>
      `url(data:font/woff2;base64,${readFileSync(join(dir, "files", f)).toString("base64")})`);
    fontCss += css.replace(/\/\*[\s\S]*?\*\//g, "").trim() + "\n";
  }
}

let body = src
  .replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n?/, "")
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/, "")
  .replace(/^<meta name="claude:[^>]*>\n?/m, "");
const title = (body.match(/<title>[^<]*<\/title>\n?/) || ["<title>RaidKit</title>\n"])[0];
body = body.replace(title, "");
const metas = (body.match(/^<meta [^>]*>\n?/gm) || []).join("");
body = body.replace(/^<meta [^>]*>\n?/gm, "");
const style = (body.match(/<style>[\s\S]*?<\/style>\n?/) || [""])[0];
body = body.replace(style, "");

const icon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#1b1513"/><rect x="5" y="14" width="38" height="26" rx="4" fill="#6f6a4b" stroke="#000" stroke-width="1.4"/><rect x="10" y="24" width="18" height="11" rx="2" fill="#111"/><rect x="12.5" y="27" width="4" height="5" rx="1" fill="#e5533f"/><rect x="18" y="27" width="4" height="5" rx="1" fill="#e5533f"/><circle cx="35.5" cy="29.5" r="4" fill="#c9c2a0"/><path d="M15 15C11 5 23 4 20 14" stroke="#3d86e6" stroke-width="2.2" fill="none"/><path d="M31 15C29 4 42 5 37 14" stroke="#e04a35" stroke-width="2.2" fill="none"/></svg>')}`;

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="RaidKit: Rust oyuncuları için raid, kit ve toplama hesaplayıcısı. En ucuz raid yolu, patlayıcı ve sülfür maliyeti.">
${title}${metas}<link rel="icon" type="image/png" href="favicon.png">
<link rel="icon" href="${icon}">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="RaidKit">
<!-- Bağlantı önizlemesi (WhatsApp, iMessage, Discord) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="RaidKit">
<meta property="og:title" content="RaidKit · Raid, kit ve toplama hesaplayıcı">
<meta property="og:description" content="Kapı, duvar, taret: en ucuz raid yolunu, gereken patlayıcıyı ve sülfürü anında gör. Telefonda ve bilgisayarda çalışır.">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="RaidKit logosu ve patlayıcı ikonları">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="RaidKit · Raid, kit ve toplama hesaplayıcı">
<meta name="twitter:description" content="En ucuz raid yolunu, gereken patlayıcıyı ve sülfürü anında gör.">
<meta name="twitter:image" content="${SITE}og.png">
<style>
${fontCss}:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
body { margin: 0; }
img { max-width: 100%; }
</style>
${style}</head>
<body>
${body}
</body>
</html>
`;
const out = join(root, "..", "RaidKit.html");
writeFileSync(out, html);
console.log("RaidKit.html hazır:", (html.length / 1024).toFixed(0) + " KB");
