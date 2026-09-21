/**
 * Text highlight colours offered in the rich-text editor's toolbar (see
 * rich-text-editor.ts). The editor stores only the colour's key on the text
 * ("yellow"), not the styling, so everything that renders rich text — the
 * admin editor, the website (RichTextContent.tsx) and the emails
 * (email-rich-text.ts) — reads the actual CSS from here.
 */

export const HIGHLIGHT_STATE_KEY = "highlight";

// A dark text colour is set alongside each background so highlighted words
// stay readable in the admin's dark theme and in dark-mode email clients.
export const HIGHLIGHTS = {
  yellow: {
    label: "Yellow highlight",
    css: { "background-color": "#fff2a8", color: "#1a1a1a" },
  },
  gold: {
    label: "Gold highlight (JTL)",
    css: { "background-color": "#f3d977", color: "#1a1a1a" },
  },
  purple: {
    label: "Purple highlight (JTL)",
    css: { "background-color": "#e6d9f7", color: "#310061" },
  },
  green: {
    label: "Green highlight",
    css: { "background-color": "#cdf2d4", color: "#1a1a1a" },
  },
  pink: {
    label: "Pink highlight",
    css: { "background-color": "#ffd6e7", color: "#1a1a1a" },
  },
} as const;

/** The CSS for a rich-text text node's highlight, or null if it has none. */
export function highlightCss(node: unknown): Record<string, string> | null {
  const state = (node as { $?: Record<string, unknown> } | null)?.$;
  const key = state?.[HIGHLIGHT_STATE_KEY];
  if (typeof key !== "string" || !(key in HIGHLIGHTS)) return null;
  return { ...HIGHLIGHTS[key as keyof typeof HIGHLIGHTS].css, padding: "0 2px", "border-radius": "2px" };
}
