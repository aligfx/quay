import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "site");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(join(root, "dist/quay.js"), join(out, "quay.js"));
cpSync(join(root, "dist/quay.css"), join(out, "quay.css"));
cpSync(join(root, "demo/demo.css"), join(out, "demo.css"));
cpSync(join(root, "demo/mock-browser.js"), join(out, "mock-browser.js"));
cpSync(join(root, "demo/icon.png"), join(out, "icon.png"));

let html = readFileSync(join(root, "demo/index.html"), "utf8");
html = html
  .replaceAll('href="/dist/quay.css"', 'href="./quay.css"')
  .replaceAll('href="/demo.css"', 'href="./demo.css"')
  .replaceAll('href="/icon.png"', 'href="./icon.png"')
  .replaceAll('src="/icon.png"', 'src="./icon.png"')
  .replaceAll('src="/mock-browser.js"', 'src="./mock-browser.js"')
  .replaceAll('from "/dist/quay.js"', 'from "./quay.js"')
  .replaceAll(
    "endpoint: location.origin + \"/api\"",
    'endpoint: new URL("./api", location.href).href.replace(/\\/$/, "")'
  );

writeFileSync(join(out, "index.html"), html);
writeFileSync(join(out, ".nojekyll"), "");
console.log("Built static demo → site/");
