# Generic webhook adapter

Minimal pattern: receive Quay `/send`, POST JSON to your own webhook, store replies for `/poll`.

## Sketch (Node)

```js
import http from "node:http";

const sessions = new Map(); // sessionId -> { messages: [] }
const WEBHOOK = process.env.OUTBOUND_WEBHOOK_URL;

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

http
  .createServer(async (req, res) => {
    if (req.method === "OPTIONS") return json(res, 204, {});

    const url = new URL(req.url, "http://localhost");
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString() || "{}") : {};

    if (req.method === "POST" && url.pathname === "/send") {
      const session = sessions.get(body.sessionId) || { messages: [] };
      const msg = {
        id: "m-" + Date.now(),
        from: "you",
        text: body.text,
        ts: String(Math.floor(Date.now() / 1000)),
      };
      session.messages.push(msg);
      sessions.set(body.sessionId, session);

      if (WEBHOOK) {
        await fetch(WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: body.sessionId,
            name: body.name,
            text: body.text,
          }),
        });
      }

      return json(res, 200, { ok: true, messages: [msg] });
    }

    if (req.method === "POST" && url.pathname === "/poll") {
      const session = sessions.get(body.sessionId) || { messages: [] };
      return json(res, 200, { ok: true, messages: session.messages, typing: false });
    }

    if (req.method === "GET" && url.pathname === "/presence") {
      return json(res, 200, { ok: true, lastSeen: Math.floor(Date.now() / 1000) });
    }

    if (req.method === "POST" && url.pathname === "/end") {
      return json(res, 200, { ok: true });
    }

    json(res, 404, { ok: false });
  })
  .listen(8787);
```

Point Quay at `http://127.0.0.1:8787` and set `OUTBOUND_WEBHOOK_URL` to whatever should receive visitor messages (Zapier, Make, your bot, etc.).

To reply, push a `{ id, from: "host", text, ts }` message into that session’s store (admin API, second webhook, etc.).
