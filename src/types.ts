/** Theme tokens map to CSS variables (`fg` → `--quay-fg`, or pass `--quay-fg` directly). */
export type QuayTheme = Record<string, string>;

export type QuayPosition = "left" | "right";

export interface QuayOptions {
  /** Backend base URL implementing the Quay HTTP protocol (required). */
  endpoint: string;
  /** Header title shown in the panel. @default "Chat" */
  title?: string;
  /** Avatar image URL. Omit for no avatar. */
  avatar?: string;
  /** Label used for host messages / a11y. @default title or "Host" */
  hostLabel?: string;
  /** Empty-state copy. */
  emptyText?: string;
  /** Composer placeholder. */
  placeholder?: string;
  /** Optional line under the name gate. */
  subtitle?: string;
  /** Name field placeholder. */
  namePlaceholder?: string;
  /** Dock side. @default "right" */
  position?: QuayPosition;
  /** localStorage key for session state. @default "quay_chat_v1" */
  storageKey?: string;
  /** Extra class on the root element. */
  className?: string;
  /** Override `--quay-*` CSS variables. */
  theme?: QuayTheme;
  /**
   * Only mount on desktop-class pointers/viewports.
   * @default true
   */
  desktopOnly?: boolean;
  /** Media query used when `desktopOnly` is true. */
  desktopMediaQuery?: string;
  pollIntervalMs?: number;
  pollSlowIntervalMs?: number;
  presenceIntervalMs?: number;
  onlineWithinSec?: number;
}

export interface QuayInstance {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

export type QuayMessageFrom = "you" | "host";

export interface QuayMessage {
  id: string;
  from: QuayMessageFrom;
  text: string;
  ts?: string;
  replyTo?: string;
  replyText?: string;
  replyFrom?: QuayMessageFrom;
  reactions?: Array<{ emoji: string; from: QuayMessageFrom }>;
}
