"use client";

import { Button, useDocumentInfo, useFormModified } from "@payloadcms/ui";

/**
 * Always-visible "Preview email" box on the custom email edit screen (a `ui`
 * field in src/collections/Emails.ts). Payload's own preview button only
 * appears once a document has been saved, which non-technical staff read as
 * "there is no preview" — this box is there from the start and says what to
 * do: save a draft first, and save again to see later edits.
 */
export function EmailPreviewField() {
  const { id } = useDocumentInfo();
  const modified = useFormModified();

  let hint = "Opens the email in a new tab. Nothing is sent.";
  if (!id) hint = "Click Save Draft first. Then you can preview here.";
  else if (modified)
    hint = "Click Save Draft to see your latest changes in the preview.";

  return (
    <div
      style={{
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 4,
        padding: "12px 14px",
        marginBottom: 20,
        background: "var(--theme-elevation-50)",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4 }}>Preview before sending</strong>
      <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.5 }}>{hint}</p>
      <Button
        buttonStyle="secondary"
        disabled={!id}
        el={id ? "anchor" : "button"}
        margin={false}
        newTab
        url={id ? `/email-preview/${id}` : undefined}
      >
        Preview email
      </Button>
    </div>
  );
}
