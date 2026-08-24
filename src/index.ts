import { createQuay as createQuayImpl } from "./createQuay.js";
import type { QuayInstance, QuayOptions } from "./types.js";

export type {
  QuayInstance,
  QuayMessage,
  QuayMessageFrom,
  QuayOptions,
  QuayPosition,
  QuayTheme,
} from "./types.js";

/**
 * Mount Quay Chat on the page.
 *
 * @example
 * ```ts
 * import { createQuay } from "@aligfx/quay";
 * import "@aligfx/quay/style.css";
 *
 * createQuay({
 *   endpoint: "https://chat.example.com",
 *   title: "Support",
 *   avatar: "/avatar.png",
 * });
 * ```
 */
export function createQuay(options: QuayOptions): QuayInstance {
  return createQuayImpl(options) as QuayInstance;
}

export default createQuay;
