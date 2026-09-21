import type { Payload } from "payload";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

import { escapeHtml } from "./email-branding";
import { highlightCss } from "./highlights";
import { SITE_URL } from "./site-url";

type LexicalData = Parameters<typeof convertLexicalToHTML>[0]["data"];
type LexicalNode = { type?: string; children?: unknown[]; [key: string]: unknown };
type UploadNode = LexicalNode & {
  value?: unknown;
  fields?: { alt?: unknown } | null;
};

/** Email clients need absolute URLs; media URLs are stored site-relative. */
export const absoluteUrl = (url: string) =>
  url.startsWith("/") ? `${SITE_URL}${url}` : url;

/** Every image (upload) node in a rich-text tree, however deeply nested. */
function collectUploadNodes(node: unknown, found: UploadNode[] = []): UploadNode[] {
  if (!node || typeof node !== "object") return found;
  const n = node as LexicalNode;
  if (n.type === "upload") found.push(n as UploadNode);
  if (Array.isArray(n.children)) {
    for (const child of n.children) collectUploadNodes(child, found);
  }
  return found;
}

/**
 * Rich-text content -> HTML for the subscriber emails and their admin
 * previews. Docs reach the send hooks and preview routes at depth 0, where an
 * image placed in the content is only a media id — and Payload's converter
 * renders nothing for an unpopulated upload. So the media docs are looked up
 * here, and each image becomes an inline-styled <img> with an absolute URL
 * that fits the 600px email column.
 */
export async function richTextToEmailHtml(
  content: unknown,
  payload: Payload,
): Promise<string> {
  if (!content || typeof content !== "object" || !("root" in content)) return "";

  const ids = new Set<number | string>();
  for (const node of collectUploadNodes((content as { root: unknown }).root)) {
    const { value } = node;
    if (typeof value === "number" || typeof value === "string") ids.add(value);
  }

  const mediaById = new Map<string, Record<string, unknown>>();
  if (ids.size) {
    try {
      const { docs } = await payload.find({
        collection: "media",
        where: { id: { in: [...ids] } },
        limit: ids.size,
        depth: 0,
        pagination: false,
      });
      for (const doc of docs as unknown as Record<string, unknown>[]) {
        mediaById.set(String(doc.id), doc);
      }
    } catch (err) {
      payload.logger.error({ err }, "email: could not load images used in the content");
    }
  }

  return convertLexicalToHTML({
    data: content as LexicalData,
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      // Highlighter colours: Payload's converter doesn't know about them.
      text: (args) => {
        const base = defaultConverters.text;
        const html = typeof base === "function" ? base(args) : "";
        const css = highlightCss(args.node);
        if (!css) return html;
        const style = Object.entries(css)
          .map(([prop, value]) => `${prop}:${value}`)
          .join(";");
        return `<span style="${style}">${html}</span>`;
      },
      upload: ({ node }) => {
        const { value, fields } = node as unknown as UploadNode;
        const media =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : mediaById.get(String(value));
        const url = typeof media?.url === "string" ? media.url : "";
        if (!media || !url) return "";

        const alt =
          (typeof fields?.alt === "string" && fields.alt) ||
          (typeof media.alt === "string" && media.alt) ||
          "";
        // Outlook ignores max-width, so cap the width attribute to the column.
        const width =
          typeof media.width === "number" && media.width > 0
            ? Math.min(media.width, 560)
            : 560;
        return `<img src="${escapeHtml(absoluteUrl(url))}" alt="${escapeHtml(alt)}" width="${width}" style="display:block;max-width:100%;height:auto;border-radius:6px;margin:18px auto;" />`;
      },
    }),
  });
}
