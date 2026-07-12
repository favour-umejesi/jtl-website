import type { Metadata } from "next";
import { Fraunces, Lexend } from "next/font/google";
import "../globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { org } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

// Body font. Lexend was designed to improve reading proficiency — a deliberate
// fit for a literacy nonprofit.
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${org.name} | ${org.tagline}`,
    template: `%s · ${org.name}`,
  },
  description: org.description,
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface text-ink">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
