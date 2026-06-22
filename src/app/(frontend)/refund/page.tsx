import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Section } from "@/components/ui/Section";
import { org } from "@/lib/site";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Refund Policy" />
      <Section tone="surface">
        <div className="max-w-2xl space-y-4 text-base leading-relaxed text-ink-soft">
          <p>
            Donations to Justice Through Literacy go directly toward our camps,
            scholarships, and mentorship programs. If you believe a donation was
            made in error, please contact us and we will do our best to help.
            The full refund policy is being finalized and will be published here
            shortly.
          </p>
          <p>
            For refund requests or questions, reach us at{" "}
            <a href={`mailto:${org.email}`} className="font-semibold text-purple underline">
              {org.email}
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
