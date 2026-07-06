import { Eyebrow } from "@/components/ui/Section";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { getPartners } from "@/lib/payload-data";

/**
 * Partner / supporter logo strip. Reads from Payload (Partners collection),
 * falling back to the static list when the CMS is empty/unavailable.
 */
export async function Partners() {
  const partners = await getPartners();
  return (
    <div className="flex flex-col items-center gap-6">
      <Reveal>
        <Eyebrow className="text-ink-soft">Our partners &amp; supporters</Eyebrow>
      </Reveal>
      <Stagger className="grid w-full gap-3 sm:grid-cols-3">
        {partners.map((p) => {
          const logo = (
            <ImagePlaceholder
              src={p.logo}
              fit="contain"
              containPadding="p-2 sm:p-3"
              rounded="rounded-none"
              className="aspect-[5/3] w-full"
              label={`${p.name} logo`}
            />
          );
          const cardClass =
            "block h-full rounded-none border border-dust/25 bg-surface-soft p-2";
          return (
            <StaggerItem key={p.name} hoverLift className="h-full">
              {p.url ? (
                <a
                  href={p.url}
                  title={p.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cardClass} transition-opacity hover:opacity-80`}
                >
                  {logo}
                </a>
              ) : (
                <div title={p.name} className={cardClass}>
                  {logo}
                </div>
              )}
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
