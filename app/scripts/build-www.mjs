// Raid Hesap: claude.ai sürümündeki ../index.html'den iPhone uygulaması için www/ klasörünü üretir.
//  - Tam bir HTML belgesi yapar (doctype, head, viewport)
//  - Google Fonts bağlantısını uygulamanın içine gömülü yazı tipleriyle değiştirir (internetsiz çalışır)
//  - Açılış reklamı betiğini (src/ads.js) ekler
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const www = join(root, "www");
const src = readFileSync(join(root, "..", "index.html"), "utf8");

rmSync(www, { recursive: true, force: true });
mkdirSync(join(www, "fonts"), { recursive: true });

// Yazı tipleri: latin + latin-ext (Türkçe karakterler için)
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
    if (!existsSync(cssFile)) throw new Error("Yazı tipi bulunamadı: " + cssFile);
    let css = readFileSync(cssFile, "utf8");
    css = css.replace(/url\(\.\/files\/([^)]+)\)/g, (_, f) => {
      if (f.endsWith(".woff2")) copyFileSync(join(dir, "files", f), join(www, "fonts", f));
      return `url(fonts/${f})`;
    });
    // woff yedeğini at, sadece woff2 kalsın (iOS 12+ destekler)
    css = css.replace(/,\s*url\(fonts\/[^)]+\.woff\)\s*format\('woff'\)/g, "");
    fontCss += css + "\n";
  }
}
writeFileSync(join(www, "fonts.css"), fontCss);

// Google Fonts bağlantılarını çıkar, yerel yazı tiplerini bağla
let body = src
  .replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n?/, "")
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/, "");
const titleMatch = body.match(/<title>[^<]*<\/title>\n?/);
const title = titleMatch ? titleMatch[0] : "<title>Raid Hesap</title>\n";
body = body.replace(title, "");
// <meta> satırlarını head'e taşı
const metas = (body.match(/^<meta [^>]*>\n?/gm) || []).join("");
body = body.replace(/^<meta [^>]*>\n?/gm, "");
const styleMatch = body.match(/<style>[\s\S]*?<\/style>\n?/);
const style = styleMatch ? styleMatch[0] : "";
body = body.replace(style, "");

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${title}${metas}<link rel="stylesheet" href="fonts.css">
<style>
:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
body { margin: 0; }
img { max-width: 100%; }
</style>
${style}</head>
<body>
${body}
<script src="ads.js"></script>
</body>
</html>
`;
writeFileSync(join(www, "index.html"), html);
copyFileSync(join(root, "src", "ads.js"), join(www, "ads.js"));
copyFileSync(join(root, "src", "privacy.html"), join(www, "privacy.html"));
console.log("www/ hazır:", (html.length / 1024).toFixed(0) + " KB, yazı tipleri gömülü.");
