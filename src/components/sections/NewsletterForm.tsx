"use client";

import { useState } from "react";

/**
 * Mailing-list signup. UI only — phase two wires this to Mailchimp (or a
 * Payload form-builder submission). For now it shows a local confirmation.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);

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
        setDone(true);
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
      <button
        type="submit"
        className="w-full bg-purple px-4 py-3 font-semibold text-on-purple transition-opacity hover:opacity-90"
      >
        Subscribe
      </button>
    </form>
  );
}
