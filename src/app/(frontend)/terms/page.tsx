import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" />
      <Section tone="surface">
        <div className="max-w-3xl space-y-10">
          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-semibold">Legal Disclaimer</h2>
            <p className="text-base leading-relaxed text-ink-soft">
              Welcome to Justice Through Literacy&apos;s Terms &amp; Conditions
              page. The information provided here serves as a general guide on
              creating your own Terms &amp; Conditions document. It&apos;s
              important to note that this content does not constitute legal
              advice or specific recommendations for your organization. Every
              entity&apos;s Terms &amp; Conditions should be tailored to its
              unique circumstances. We strongly advise seeking legal counsel to
              ensure your Terms &amp; Conditions accurately reflect your
              organization&apos;s requirements and legal obligations.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-semibold">
              Understanding Terms &amp; Conditions
            </h2>
            <p className="text-base leading-relaxed text-ink-soft">
              At Justice Through Literacy, Terms and Conditions (T&amp;C)
              establish the legal framework governing interactions between our
              website visitors or donors and our organization. These terms
              define the rights and responsibilities of all parties involved,
              aiming to establish a transparent and fair relationship. As each
              organization&apos;s nature and offerings vary, it&apos;s crucial to
              customize T&amp;C to suit the specific context and purpose. Whether
              you&apos;re providing educational resources, receiving donations,
              or offering volunteer opportunities, tailored T&amp;C can safeguard
              your organization&apos;s interests and ensure compliance with
              relevant laws and regulations.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-semibold">
              Key Elements of T&amp;C
            </h2>
            <p className="text-base leading-relaxed text-ink-soft">
              In general, our Terms &amp; Conditions cover a wide range of
              aspects, including user eligibility, donation methods, the
              organization&apos;s right to modify its offerings, warranties,
              intellectual property rights, account management, and more. For
              comprehensive insights into this topic, explore our guide on
              &lsquo;Crafting a Comprehensive Terms and Conditions Policy&rsquo;
              to ensure your organization&apos;s legal protection and clarity for
              all stakeholders.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
