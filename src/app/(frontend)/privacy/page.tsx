import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Section } from "@/components/ui/Section";
import { org } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <Section tone="surface">
        <div className="max-w-2xl space-y-4 text-base leading-relaxed text-ink-soft">
          <p>
            Justice Through Literacy respects your privacy. This policy explains
            what information we collect (such as names and emails from our mailing
            list) and how we use it. The full policy is being finalized and will
            be published here shortly.
          </p>
          <p>
            For any questions in the meantime, please reach us at{" "}
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
