"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { stageOf, type Stage } from "@/lib/stage";

/**
 * The "Stage" of a Website Article, Newsletter or Custom Email — Draft, In
 * review, Live, Sent — as a list column (StageCell) and as a box at the top
 * of the edit screen's sidebar (StageField). The wording lives in
 * src/lib/stage.ts.
 */

const TONES: Record<Stage["tone"], { background: string; color: string }> = {
  neutral: { background: "var(--theme-elevation-100)", color: "var(--theme-elevation-800)" },
  waiting: { background: "#fdf0c4", color: "#5c4300" },
  done: { background: "#d9f2df", color: "#14532d" },
};

function StagePill({ stage }: { stage: Stage }) {
  return (
    <span
      style={{
        ...TONES[stage.tone],
        borderRadius: 999,
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        padding: "5px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {stage.label}
    </span>
  );
}

export function StageCell({
  collectionSlug,
  rowData,
}: {
  collectionSlug: string;
  rowData: Parameters<typeof stageOf>[1];
}) {
  return <StagePill stage={stageOf(collectionSlug, rowData)} />;
}

export function StageField() {
  const { collectionSlug, id } = useDocumentInfo();
  // The saved values: the stage changes when a save goes through, not while typing.
  const doc = useFormFields(([fields]) => ({
    _status: fields._status?.initialValue as string | undefined,
    sentAt: fields.sentAt?.initialValue as string | undefined,
    reviewRequestedAt: fields.reviewRequestedAt?.initialValue as string | undefined,
  }));
  if (!collectionSlug || !id) return null;

  const stage = stageOf(collectionSlug, doc);
  return (
    <div
      style={{
        background: "var(--theme-elevation-50)",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 4,
        marginBottom: 20,
        padding: "12px 14px",
      }}
    >
      <StagePill stage={stage} />
      <p style={{ fontSize: 13, lineHeight: 1.5, margin: "8px 0 0" }}>{stage.detail}</p>
    </div>
  );
}
