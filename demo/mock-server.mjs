import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const port = Number(process.env.PORT || 4173);

/** @type {Map<string, { messages: any[], ended?: boolean }>} */
const sessions = new Map();

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, body) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

function contentType(file) {
  switch (extname(file)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".map":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function serveStatic(res, filePath) {
  if (!existsSync(filePath)) {
    res.writeHead(404).end("Not found");
    return;
  }
  const data = readFileSync(filePath);
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);

  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204).end();
    return;
  }

  // --- Quay protocol (mock) ---
  if (url.pathname === "/api/presence" && req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      lastSeen: Math.floor(Date.now() / 1000),
    });
  }

  if (url.pathname === "/api/visit" && req.method === "POST") {
    await readBody(req);
    return sendJson(res, 200, { ok: true });
  }

  if (url.pathname === "/api/end" && req.method === "POST") {
    const body = await readBody(req);
    const session = sessions.get(body.sessionId) || { messages: [] };
    session.ended = true;
    sessions.set(body.sessionId, session);
    return sendJson(res, 200, { ok: true });
  }

  if (url.pathname === "/api/react" && req.method === "POST") {
    await readBody(req);
    return sendJson(res, 200, { ok: true });
  }

  if (url.pathname === "/api/preview" && req.method === "GET") {
    const target = url.searchParams.get("url") || "";
    let site = "";
    try {
      site = new URL(target).hostname.replace(/^www\./, "");
    } catch {}

    // Rich card for Ali's site in the demo
    if (site === "aligfx.com") {
      return sendJson(res, 200, {
        ok: true,
        url: "https://aligfx.com",
        title: "Ali Al-Janabi - Product Designer",
        description:
          "Design systems, design engineering, and craft-led product work.",
        image: "https://aligfx.com/og-image.png",
        site: "aligfx.com",
      });
    }

    return sendJson(res, 200, {
      ok: true,
      url: target,
      title: site || "Link",
      description: "Preview from Quay demo mock server",
      image: "",
      site,
    });
  }

  if (url.pathname === "/api/send" && req.method === "POST") {
    const body = await readBody(req);
    const session = sessions.get(body.sessionId) || { messages: [] };
    const now = String(Math.floor(Date.now() / 1000));
    const you = {
      id: "you-" + Date.now(),
      from: "you",
      text: String(body.text || ""),
      ts: now,
      replyTo: body.replyTo || undefined,
      replyText: body.replyText || undefined,
      replyFrom: body.replyFrom || undefined,
    };
    session.messages.push(you);

    const name = body.name ? `, ${body.name}` : "";
    const isFirstHost = !session.messages.some((m) => m.from === "host");
    const siteUrl = "https://aligfx.com";

    const host = isFirstHost
      ? {
          id: "host-" + Date.now(),
          from: "host",
          text: `Hey${name}. Demo only, built by Ali. ${siteUrl} - hover the + to react, or reply to this message.`,
          html: `Hey${name}. Demo only, built by Ali.<br><br><a href="${siteUrl}">aligfx.com</a><br>Hover the + to react, or reply to this message.`,
          ts: String(Math.floor(Date.now() / 1000) + 1),
        }
      : {
          id: "host-" + Date.now(),
          from: "host",
          text: `Got it${name}. React or reply if you want. ${siteUrl}`,
          html: `Got it${name}. React or reply if you want.<br><a href="${siteUrl}">aligfx.com</a>`,
          ts: String(Math.floor(Date.now() / 1000) + 1),
        };

    session.messages.push(host);
    sessions.set(body.sessionId, session);

    return sendJson(res, 200, {
      ok: true,
      threadTs: body.sessionId,
      sig: "demo",
      messages: [you],
    });
  }

  if (url.pathname === "/api/poll" && req.method === "POST") {
    const body = await readBody(req);
    const session = sessions.get(body.sessionId) || { messages: [] };
    return sendJson(res, 200, {
      ok: true,
      messages: session.messages,
      typing: false,
      ended: !!session.ended,
      reacts: {},
    });
  }

  // --- static ---
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return serveStatic(res, join(__dirname, "index.html"));
  }
  if (url.pathname.startsWith("/dist/")) {
    return serveStatic(res, join(root, url.pathname.slice(1)));
  }
  if (url.pathname === "/demo.css") {
    return serveStatic(res, join(__dirname, "demo.css"));
  }
  if (url.pathname === "/mock-browser.js") {
    return serveStatic(res, join(__dirname, "mock-browser.js"));
  }
  if (url.pathname === "/icon.png" || url.pathname === "/favicon.png" || url.pathname === "/favicon.ico") {
    return serveStatic(res, join(__dirname, "icon.png"));
  }

  res.writeHead(404).end("Not found");
});

server.listen(port, () => {
  console.log(`\n  Quay demo → http://127.0.0.1:${port}\n`);
});
