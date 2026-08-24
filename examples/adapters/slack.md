# Slack adapter

## Outbound (visitor → Slack)

Use a Slack [Incoming Webhook](https://api.slack.com/messaging/webhooks) from your adapter’s `/send` handler:

```js
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: `*${name}* (${sessionId})\n${text}`,
  }),
});
```

## Inbound (Slack → widget)

Options:

1. **Slack Events API** — subscribe to `message` events in your channel; when a human replies in the thread, map `thread_ts` → `sessionId` and append `{ from: "host", text }` for `/poll`.
2. **Slash command / shortcut** — e.g. `/quay-reply <sessionId> <text>`.
3. **Manual admin tool** — simplest for prototypes.

## Mapping tips

- Store `sessionId ↔ Slack thread_ts` when you post the first visitor message
- Prefer threading so each visitor stays in one Slack thread
- Keep bot tokens on the server only

Quay does not call Slack directly from the browser.
