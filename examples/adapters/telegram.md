# Telegram adapter

## Outbound (visitor → Telegram)

From `/send`, call Bot API `sendMessage` into your ops group:

```js
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text: `Visitor · ${name}\n${text}`,
    // Keep message_id → sessionId so replies can be threaded
  }),
});
```

## Inbound (Telegram → widget)

1. Set a webhook on your adapter: `https://your-adapter/webhook`
2. When someone **replies** to the visitor message in Telegram, resolve `reply_to_message.message_id` → `sessionId`
3. Append `{ from: "host", text }` for that session so `/poll` returns it

## Bot privacy

In BotFather → **Group Privacy → Off** (or make the bot admin) so it can see reply messages in a group.

## Secrets

`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and webhook secrets stay on the server — never in Quay’s frontend config.
