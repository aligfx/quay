# Adapters

Quay does **not** host chat for you. An adapter is any backend that:

1. Speaks the [Quay HTTP protocol](./protocol.md) to the widget
2. Forwards visitor messages to Slack / Telegram / email / your CRM
3. Pushes host replies back into `/poll` (or SSE `/events`)

## Recommended shape

```
Browser (Quay widget)
        │  HTTP
        ▼
Your adapter (Worker / Node / serverless)
        │
        ├─► Slack
        ├─► Telegram
        └─► Custom webhook / queue
```

## Examples in this repo

| Guide | What it shows |
| --- | --- |
| [Generic webhook](../examples/adapters/generic-webhook.md) | Minimal Node handler + outbound webhook |
| [Slack](../examples/adapters/slack.md) | Incoming webhook + Events API sketch |
| [Telegram](../examples/adapters/telegram.md) | Bot + group replies |

## Security checklist

- Never put Slack/Telegram secrets in the browser bundle
- Validate origins (CORS allowlist)
- Sign or hash `sessionId` if you store threads server-side
- Rate-limit `/send`
- Strip PII from logs you do not need
