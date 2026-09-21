import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  LinkFeature,
  TextStateFeature,
} from "@payloadcms/richtext-lexical";
import { HIGHLIGHT_STATE_KEY, HIGHLIGHTS } from "./highlights";

/**
 * The rich-text editor behind every "Content"/"Message" box in the admin,
 * trimmed to what a non-technical editor needs.
 *
 * Payload's default only shows formatting buttons in a bubble that appears
 * after text is selected, which editors never discover. This swaps it for a
 * toolbar that is always visible above the box: bold, italic, underline,
 * headings, lists, quotes, links, images, plus a highlighter (highlights.ts).
 */

// Dropped from Payload's defaults. None of these appear in existing content.
const REMOVED = new Set([
  // One toolbar, not two: the select-to-reveal bubble.
  "toolbarInline",
  // Embeds a link to another CMS record (a subscriber, a team member...).
  // Neither the website nor the emails render it, so it only confused people.
  "relationship",
  // Checkboxes, code and sub/superscript: no use in articles or newsletters,
  // and email clients render them unreliably.
  "checklist",
  "inlineCode",
  "subscript",
  "superscript",
  // Replaced below with narrowed-down versions.
  "heading",
  "link",
]);

export const siteEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => !REMOVED.has(feature.key)),
    // The page or email title is the H1, so headings inside start at H2.
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    // Web addresses only: no "internal link" picker of CMS records.
    LinkFeature({ enabledCollections: [] }),
    FixedToolbarFeature(),
    TextStateFeature({ state: { [HIGHLIGHT_STATE_KEY]: HIGHLIGHTS } }),
  ],
});
