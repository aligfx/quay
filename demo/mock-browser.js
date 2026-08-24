/**
 * In-browser Quay protocol mock for static hosting (GitHub Pages).
 * Intercepts fetch() calls under /api (or any URL ending with /api/...).
 */
(function () {
  const sessions = new Map();
  const originalFetch = window.fetch.bind(window);

  function json(data, status) {
    return new Response(JSON.stringify(data), {
      status: status || 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  function apiPath(url) {
    try {
      const u = new URL(url, location.href);
      const path = u.pathname.replace(/\/+$/, "") || "/";
      // Match /api, /api/send, .../api/preview, etc.
      const idx = path.lastIndexOf("/api");
      if (idx === -1) return null;
      const rest = path.slice(idx + 4) || "/";
      return { path: rest.startsWith("/") ? rest : "/" + rest, search: u.searchParams };
    } catch {
      return null;
    }
  }

  async function readJson(init) {
    if (!init || !init.body) return {};
    try {
      if (typeof init.body === "string") return JSON.parse(init.body);
      return JSON.parse(await new Response(init.body).text());
    } catch {
      return {};
    }
  }

  function hostReply(session, name) {
    const siteUrl = "https://aligfx.com";
    const isFirstHost = !session.messages.some((m) => m.from === "host");
    const label = name ? `, ${name}` : "";
    if (isFirstHost) {
      return {
        id: "host-" + Date.now(),
        from: "host",
        text: `Hey${label}. Demo only, built by Ali. ${siteUrl} - hover the + to react, or reply to this message.`,
        html: `Hey${label}. Demo only, built by Ali.<br><br><a href="${siteUrl}">aligfx.com</a><br>Hover the + to react, or reply to this message.`,
        ts: String(Math.floor(Date.now() / 1000) + 1),
      };
    }
    return {
      id: "host-" + Date.now(),
      from: "host",
      text: `Got it${label}. React or reply if you want. ${siteUrl}`,
      html: `Got it${label}. React or reply if you want.<br><a href="${siteUrl}">aligfx.com</a>`,
      ts: String(Math.floor(Date.now() / 1000) + 1),
    };
  }

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input && input.url;
    const hit = url && apiPath(url);
    if (!hit) return originalFetch(input, init);

    const method = ((init && init.method) || "GET").toUpperCase();
    const body = method === "GET" || method === "HEAD" ? {} : await readJson(init);

    if (hit.path === "/presence" && method === "GET") {
      return json({ ok: true, lastSeen: Math.floor(Date.now() / 1000) });
    }
    if (hit.path === "/visit" && method === "POST") return json({ ok: true });
    if (hit.path === "/end" && method === "POST") {
      const session = sessions.get(body.sessionId) || { messages: [] };
      session.ended = true;
      sessions.set(body.sessionId, session);
      return json({ ok: true });
    }
    if (hit.path === "/react" && method === "POST") return json({ ok: true });
    if (hit.path === "/preview" && method === "GET") {
      const target = hit.search.get("url") || "";
      let site = "";
      try {
        site = new URL(target).hostname.replace(/^www\./, "");
      } catch {}
      if (site === "aligfx.com") {
        return json({
          ok: true,
          url: "https://aligfx.com",
          title: "Ali Al-Janabi - Product Designer",
          description: "Design systems, design engineering, and craft-led product work.",
          image: "https://aligfx.com/og-image.png",
          site: "aligfx.com",
        });
      }
      return json({
        ok: true,
        url: target,
        title: site || "Link",
        description: "Preview from Quay demo",
        image: "",
        site,
      });
    }
    if (hit.path === "/send" && method === "POST") {
      const session = sessions.get(body.sessionId) || { messages: [] };
      const you = {
        id: "you-" + Date.now(),
        from: "you",
        text: String(body.text || ""),
        ts: String(Math.floor(Date.now() / 1000)),
        replyTo: body.replyTo || undefined,
        replyText: body.replyText || undefined,
        replyFrom: body.replyFrom || undefined,
      };
      session.messages.push(you);
      session.messages.push(hostReply(session, body.name));
      sessions.set(body.sessionId, session);
      return json({
        ok: true,
        threadTs: body.sessionId,
        sig: "demo",
        messages: [you],
      });
    }
    if (hit.path === "/poll" && method === "POST") {
      const session = sessions.get(body.sessionId) || { messages: [] };
      return json({
        ok: true,
        messages: session.messages,
        typing: false,
        ended: !!session.ended,
        reacts: {},
      });
    }

    return json({ ok: false, error: "not_found" }, 404);
  };
})();
