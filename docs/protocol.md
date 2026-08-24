# Quay HTTP protocol

Your backend must accept CORS requests from the site that embeds the widget.

Message `from` values:

- `"you"` — visitor
- `"host"` — site operator / channel reply

## `POST /send`

Visitor sends a message.

**Body**

```json
{
  "sessionId": "abc123",
  "name": "Sam",
  "text": "Hello",
  "threadTs": "",
  "sig": "",
  "replyTo": "",
  "replyText": "",
  "replyFrom": "",
  "role": "",
  "info": {}
}
```

**Success**

```json
{
  "ok": true,
  "threadTs": "optional-thread-id",
  "sig": "optional-signature",
  "messages": [
    {
      "id": "m1",
      "from": "you",
      "text": "Hello",
      "ts": "1710000000"
    }
  ]
}
```

**Failure**

```json
{ "ok": false, "ended": false }
```

If `ended: true`, the widget locks the thread.

## `POST /poll`

Pull host replies and reaction updates.

**Body**

```json
{
  "sessionId": "abc123",
  "threadTs": "",
  "sig": ""
}
```

**Success**

```json
{
  "ok": true,
  "messages": [
    {
      "id": "m2",
      "from": "host",
      "text": "Hi Sam — how can I help?",
      "ts": "1710000005"
    }
  ],
  "typing": false,
  "ended": false,
  "reacts": {}
}
```

## `GET /presence`

```json
{
  "ok": true,
  "lastSeen": 1710000000,
  "status": null
}
```

`lastSeen` is a Unix timestamp (seconds). Optional `status`:

```json
{ "text": "In a meeting", "tone": "busy" }
```

`tone`: `busy` | `away` | `work`

## `POST /end`

```json
{ "sessionId": "abc123" }
```

```json
{ "ok": true }
```

## `POST /react`

```json
{
  "sessionId": "abc123",
  "messageId": "m2",
  "emoji": "👍",
  "threadTs": "",
  "sig": ""
}
```

```json
{ "ok": true }
```

## `POST /visit` (optional)

Fired when the visitor sets their name. Useful for “someone is on the site” pings.

```json
{
  "sessionId": "abc123",
  "name": "Sam",
  "info": {}
}
```

## `GET /events?sessionId=` (optional)

Server-Sent Events stream. If present, the widget prefers it over tight polling while the tab is open.

## `GET /preview?url=` (optional)

Link unfurl for URLs in messages:

```json
{
  "ok": true,
  "url": "https://example.com",
  "title": "Example",
  "description": "…",
  "image": "https://…",
  "site": "example.com"
}
```

## CORS

Allow the embedding origin:

```
Access-Control-Allow-Origin: https://yoursite.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
