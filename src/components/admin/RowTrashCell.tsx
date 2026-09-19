"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  ConfirmationModal,
  toast,
  useConfig,
  useModal,
} from "@payloadcms/ui";

/**
 * List-view cell with a visible per-row action for collections that have
 * Payload's trash enabled (`trash: true`): a "Delete" button in the normal
 * list, a "Restore" button in the Trash tab. Out of the box, deleting from a
 * list means ticking the row's checkbox and finding the bulk-action button,
 * which non-technical staff miss. Deleting only moves the document to the
 * trash — same requests Payload's own buttons make — so it can be restored.
 */
export function RowTrashCell({
  collectionSlug,
  rowData,
  viewType,
}: {
  collectionSlug: string;
  rowData: {
    id: number | string;
    _status?: string | null;
    // Whichever of these the collection has names the row in messages.
    subject?: string;
    title?: string;
    name?: string;
    email?: string;
    filename?: string;
  };
  viewType?: string;
}) {
  const router = useRouter();
  const { openModal } = useModal();
  const {
    config: {
      routes: { api },
    },
    getEntityConfig,
  } = useConfig();

  const { id } = rowData;
  const name =
    rowData.subject ||
    rowData.title ||
    rowData.name ||
    rowData.email ||
    rowData.filename ||
    "this item";
  const inTrash = viewType === "trash";
  const modalSlug = `row-trash-${collectionSlug}-${id}`;

  const request = async (url: string, body: Record<string, unknown>, done: string) => {
    try {
      const res = await fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.errors?.[0]?.message || "Something went wrong.");
      }
      toast.success(done);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (inTrash) {
    // Trashed documents are only reachable through the bulk endpoint with
    // ?trash=true. In collections with drafts the document comes back as it
    // was: a published article is live again, a draft is still a draft.
    const hasDrafts = Boolean(getEntityConfig({ collectionSlug })?.versions?.drafts);
    const query = `trash=true&where[and][0][id][equals]=${id}&where[and][1][deletedAt][exists]=true`;
    return (
      <Button
        buttonStyle="secondary"
        margin={false}
        onClick={() =>
          request(
            `${api}/${collectionSlug}?${query}`,
            {
              deletedAt: null,
              ...(hasDrafts
                ? { _status: rowData._status === "published" ? "published" : "draft" }
                : {}),
            },
            `“${name}” was restored.`,
          )
        }
        size="small"
      >
        Restore
      </Button>
    );
  }

  return (
    <>
      <Button
        aria-label={`Delete “${name}”`}
        buttonStyle="secondary"
        margin={false}
        onClick={() => openModal(modalSlug)}
        size="small"
      >
        <span style={{ alignItems: "center", display: "inline-flex", gap: 6 }}>
          <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
          </svg>
          Delete
        </span>
      </Button>
      <ConfirmationModal
        body={`“${name}” will be moved to the Trash. If this is a mistake, open the Trash tab at the top of this list and click Restore.`}
        confirmLabel="Move to Trash"
        heading="Move to the Trash?"
        modalSlug={modalSlug}
        onConfirm={() =>
          request(
            `${api}/${collectionSlug}/${id}`,
            { deletedAt: new Date().toISOString() },
            `“${name}” was moved to the Trash.`,
          )
        }
      />
    </>
  );
}

/** The `ui` field behind this column has nothing to show on the edit screen. */
export function NoField() {
  return null;
}
