# Theming

Quay ships a dark, compact panel close to a Composer-style language. Override tokens via `theme` or CSS.

## Via `theme`

Keys without `--` are prefixed with `--quay-`:

```ts
createQuay({
  endpoint: "…",
  theme: {
    panel: "#0f1115",
    well: "#16181d",
    fg: "#f4f4f5",
    muted: "#9a9aa3",
    line: "color-mix(in oklab, #fff 10%, transparent)",
    radius: "1rem",
    fab: "3rem",
  },
});
```

## Via CSS

```css
.quay {
  --quay-panel: #0f1115;
  --quay-well: #16181d;
  --quay-fg: #f4f4f5;
  --quay-muted: #9a9aa3;
  --quay-line: color-mix(in oklab, #fff 10%, transparent);
  --quay-radius: 1rem;
  font-family: "Your Sans", ui-sans-serif, system-ui, sans-serif;
}
```

## Core tokens

| Token | Role |
| --- | --- |
| `--quay-panel` | Panel background |
| `--quay-well` | Composer / wells |
| `--quay-fg` | Primary text |
| `--quay-muted` | Secondary text |
| `--quay-line` | Hairlines / borders |
| `--quay-radius` | Corner radius |
| `--quay-fab` | Toggle button size |
| `--quay-w` / `--quay-h` | Panel width / height |
| `--quay-ease` / `--quay-out` | Motion curves |
