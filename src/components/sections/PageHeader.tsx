import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/motion";

export function PageHeader({
  eyebrow,
  title,
  intro,
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
}) {
  return (
    <section className={image ? "bg-surface-soft" : "bg-purple text-on-purple"}>
      {image && (
        <div className="relative h-52 w-full sm:h-60 md:h-72 lg:h-80">
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className={image ? "bg-purple text-on-purple" : undefined}>
        <Container className="py-14 md:py-20">
          <Reveal className="max-w-3xl space-y-5">
            <Eyebrow className="text-yellow">{eyebrow}</Eyebrow>
            <h1 className="text-4xl font-semibold leading-[1.1] md:text-5xl">
              {title}
            </h1>
            {intro && (
              <p className="max-w-2xl text-lg leading-relaxed text-dust">
                {intro}
              </p>
            )}
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
