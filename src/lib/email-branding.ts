import { SITE_URL } from "./site-url";

/**
 * Shared pieces for the HTML emails Payload sends (welcome/verify, blog
 * newsletter, review notifications). Email clients ignore <style> blocks and
 * webfonts, so everything is inline styles and system fonts: Georgia for
 * editorial text, Courier New for the typewriter-style accents.
 */

export const BRAND = {
  purple: "#310061",
  yellow: "#d7ad0d",
  ink: "#1a1a1a",
  inkSoft: "#444444",
  muted: "#8a8a8a",
  paper: "#fffdf6",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', Courier, monospace",
} as const;

/** Escape user-entered text before interpolating it into email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Centered JTL logo masthead used at the top of every email. */
export function emailMasthead(): string {
  return `
    <div style="text-align:center;padding:18px 0 14px;">
      <img src="${SITE_URL}/images/jtl-logo.png" alt="Justice Through Literacy" width="72" style="display:inline-block;width:72px;height:auto;" />
    </div>`;
}
