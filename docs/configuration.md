# Configuration

```ts
import { createQuay } from "@aligfx/quay";
import type { QuayOptions } from "@aligfx/quay";
import "@aligfx/quay/style.css";

const options: QuayOptions = {
  endpoint: "https://chat.example.com",
  title: "Support",
  hostLabel: "Alex",
  avatar: "https://example.com/avatar.png",
  emptyText: "Ask anything — we reply in this thread.",
  placeholder: "Write a message…",
  subtitle: "A human replies. Not a bot.",
  namePlaceholder: "Your name",
  position: "right",
  storageKey: "my_site_chat_v1",
  desktopOnly: true,
  theme: {
    panel: "#141416",
    well: "#1a1a1d",
    fg: "#ececee",
    muted: "#8b8b93",
    radius: "0.875rem",
  },
};

const chat = createQuay(options);

// Optional controls
chat.open();
chat.close();
chat.destroy();
```

## Required

### `endpoint`

Base URL of your Quay-compatible backend (no trailing slash required).

The widget calls:

- `POST {endpoint}/send`
- `POST {endpoint}/poll`
- `GET  {endpoint}/presence`
- `POST {endpoint}/end`
- `POST {endpoint}/react`
- `POST {endpoint}/visit` (optional)
- `GET  {endpoint}/events?sessionId=` (optional SSE)
- `GET  {endpoint}/preview?url=` (optional link previews)

See [protocol.md](./protocol.md).

## Instance API

`createQuay` returns:

| Method | Description |
| --- | --- |
| `open()` | Opens the panel |
| `close()` | Closes the panel |
| `destroy()` | Removes the widget from the DOM |

On non-desktop viewports (when `desktopOnly` is true), mount is a no-op and these methods are safe no-ops.
