"use client";

import { Button, useDocumentInfo } from "@payloadcms/ui";

/**
 * Replaces Payload's icon-only preview button with one labeled "Preview".
 * Blogs use the per-document newsletter preview (the default basePath), News
 * passes basePath "/news-preview", and the Subscriber Welcome Email global
 * passes its fixed preview URL via clientProps.href.
 */
export function PreviewLinkButton({
  href,
  basePath = "/newsletter-preview",
}: {
  href?: string;
  basePath?: string;
}) {
  const { id } = useDocumentInfo();
  const url = href ?? (id ? `${basePath}/${id}` : null);
  if (!url) return null;
  return (
    <Button buttonStyle="secondary" el="anchor" newTab url={url}>
      Preview
    </Button>
  );
}
