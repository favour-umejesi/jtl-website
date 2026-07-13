import type { Metadata } from "next";
import { Lexend, Yeseva_One } from "next/font/google";
import "../globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { org } from "@/lib/site";

// Heading font. Yeseva One ships a single 400 weight, hence the fixed weight
// (and the font-synthesis rule in globals.css that stops faux-bolding).
const yeseva = Yeseva_One({
  variable: "--font-yeseva",
  weight: "400",
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
      className={`${yeseva.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface text-ink">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
