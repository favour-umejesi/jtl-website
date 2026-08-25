import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  childSponsorshipCopy,
  type DonateChild,
} from "@/lib/content";

/**
 * Compact sponsorship card: short bio teaser + stats.
 * "Learn more" opens the child's GoFundMe for the full story and donation.
 */
export function ChildSponsorCard({
  child,
  costPerYear,
}: {
  child: DonateChild;
  costPerYear?: number;
}) {
  const copy = childSponsorshipCopy(child, costPerYear);

  return (
    <article className="flex h-full flex-col space-y-4 rounded-none border border-dust/30 bg-surface p-7 transition-shadow hover:shadow-lg hover:shadow-purple/5">
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar
          src={child.photo || undefined}
          name={child.firstName || "Child"}
          className="size-24"
        />
        <h3 className="font-heading text-xl font-semibold text-purple">
          {copy.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col space-y-3 text-left">
        <p className="text-[15px] leading-relaxed text-ink-soft">{copy.bio}</p>

        <dl className="space-y-1.5 border-t border-dust/30 pt-3 text-[13px] text-ink-soft">
          <div className="flex justify-between gap-3">
            <dt>Sponsorship goal</dt>
            <dd className="font-semibold text-purple">
              {copy.stats.goal != null ? `$${copy.stats.goal}` : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Years of education needed</dt>
            <dd className="font-semibold text-purple">
              {copy.stats.years != null ? copy.stats.years : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Cost per year</dt>
            <dd className="font-semibold text-purple">
              ${copy.stats.costPerYear}
            </dd>
          </div>
        </dl>
      </div>

      <div className="pt-1">
        <Button
          href={child.gofundmeUrl || "#"}
          variant="outline"
          className="w-full"
        >
          Learn more
        </Button>
      </div>
    </article>
  );
}
