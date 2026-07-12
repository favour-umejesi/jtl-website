"use client";

import { useState, useTransition } from "react";
import { subscribeToMailingList } from "@/lib/actions";

/**
 * Mailing-list signup. Submits to the `subscribers` collection through a
 * server action; everyone on that list receives new blogs by email.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass =
    "w-full border border-dust/40 bg-surface-soft px-4 py-3 text-[15px] outline-none focus:border-purple";

  if (done) {
    return (
      <div className="rounded-none bg-surface p-8 text-center">
        <p className="font-heading text-xl font-semibold text-purple">
          Thank you for subscribing!
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          We&apos;ll keep you posted on stories from the field and ways to help.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = `${data.get("firstName") ?? ""} ${data.get("lastName") ?? ""}`.trim();
        const email = String(data.get("email") ?? "");
        setError(null);
        startTransition(async () => {
          const result = await subscribeToMailingList(name, email);
          if (result.ok) setDone(true);
          else setError(result.message);
        });
      }}
      className="space-y-3.5 rounded-none bg-surface p-8"
    >
      <div className="flex flex-col gap-3.5 sm:flex-row">
        <input required name="firstName" placeholder="First name" className={inputClass} />
        <input required name="lastName" placeholder="Last name" className={inputClass} />
      </div>
      <input
        required
        type="email"
        name="email"
        placeholder="Email address"
        className={inputClass}
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-purple px-4 py-3 font-semibold text-on-purple transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
