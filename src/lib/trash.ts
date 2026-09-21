import type { Access, Field, Payload } from "payload";
import { isAdminUser } from "./editorial";

/**
 * Shared pieces for collections with Payload's trash (`trash: true`), which
 * turns deleting into a soft delete: the document gets a `deletedAt` stamp,
 * drops out of the site and the normal admin list, and can be restored from
 * the list's Trash tab. Every content collection uses it; Users does not —
 * removing accounts stays with the user managers (see Users.ts).
 */

/**
 * "Actions" list column: a visible Delete button on every row, Restore in the
 * Trash tab. Add this to `fields` and "rowActions" to `admin.defaultColumns`.
 * It stores nothing and shows nothing on the edit screen. Saved list layouts
 * can't hide it for long — see `ensureRowActionsColumn` below.
 */
export const rowActionsField = {
  name: "rowActions",
  label: "Actions",
  type: "ui",
  admin: {
    components: {
      Cell: "/components/admin/RowTrashCell#RowTrashCell",
      Field: "/components/admin/RowTrashCell#NoField",
    },
  },
} satisfies Field;

/**
 * Read access for collections the public site shows. Visitors never see
 * trashed documents — not even by asking the API for `?trash=true`; signed-in
 * editors see everything, which is what fills the Trash tab.
 */
export const publicReadExceptTrash: Access = ({ req }) =>
  req.user ? true : { deletedAt: { exists: false } };

/**
 * Delete access for every collection with a trash: any signed-in user may
 * move a document to the Trash (and restore it — that is an ordinary update),
 * but only Admins may delete permanently, which cannot be undone.
 *
 * Payload asks this one question in three situations, told apart by `data`:
 * - a trash request carries just the new `deletedAt` stamp;
 * - a permanent delete carries no data at all;
 * - the admin panel's "can this user delete?" check carries the whole
 *   document. For a document already in the Trash, the only delete left is
 *   the permanent one, so Staff don't get offered it.
 */
export const trashForAllDeleteForAdmins: Access = ({ req, data }) => {
  if (!req.user) return false;
  const admin = isAdminUser(req.user as Parameters<typeof isAdminUser>[0]);
  if (!data) return admin;
  const isTrashRequest = Object.keys(data).every((k) => k === "deletedAt") && Boolean(data.deletedAt);
  if (isTrashRequest) return true;
  return data.deletedAt ? admin : true;
};

type SavedColumn = { accessor?: string; active?: boolean };

/**
 * Keeps the "Actions" column — and, where a collection has one, the "Stage"
 * column (src/lib/stage.ts) — switched on for everyone. Payload has no
 * always-on columns: once a user rearranges a list, their saved layout wins
 * over `defaultColumns`, so a layout saved before this column existed (or one
 * where it was switched off) would hide the Delete button until the user
 * found it in the Columns picker. Run from `onInit`, this adds the column back
 * to every saved layout of a collection that has it. Never throws — a failure
 * here must not stop Payload from starting.
 */
export async function ensureRowActionsColumn(payload: Payload): Promise<void> {
  try {
    // Always-on columns per collection, in display order (Actions last).
    const alwaysOn = new Map<string, string[]>();
    for (const c of payload.config.collections) {
      if (!c.trash) continue;
      const names = ["stage", rowActionsField.name].filter((name) =>
        c.fields.some((f) => "name" in f && f.name === name),
      );
      if (names.length) alwaysOn.set(`collection-${c.slug}`, names);
    }
    const keys = [...alwaysOn.keys()];
    if (!keys.length) return;

    const { docs } = await payload.find({
      collection: "payload-preferences",
      where: { key: { in: keys } },
      pagination: false,
      depth: 0,
    });
    for (const pref of docs) {
      const value = pref.value as { columns?: SavedColumn[] } | null;
      if (!value || !Array.isArray(value.columns)) continue; // on defaults
      const names = alwaysOn.get(String(pref.key)) ?? [];
      const isOn = (name: string) =>
        value.columns?.some((c) => c.accessor === name && c.active);
      if (names.every(isOn)) continue;

      const columns = [
        ...value.columns.filter((c) => !names.includes(c.accessor ?? "")),
        ...names.map((accessor) => ({ accessor, active: true })),
      ];
      // Straight through the database adapter: preferences belong to a user,
      // and the Local API's validation rejects an update made without one.
      await payload.db.updateOne({
        collection: "payload-preferences",
        id: pref.id,
        data: { value: { ...value, columns } },
      });
    }
  } catch (err) {
    payload.logger.error({ err }, "trash: could not switch the Actions column on");
  }
}
