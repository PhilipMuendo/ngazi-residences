import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { site, UNITS, PRICING } from "@/config/site";
import { SmoothScroll } from "@/lib/smooth-scroll";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: `%s | ${site.name}` },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.name, title: site.seo.title, description: site.seo.description, locale: "en_KE" },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: site.brand.paper, width: "device-width", initialScale: 1 };

const prices = UNITS.map((u) => u.price);
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ApartmentComplex",
  name: `${site.name} ${site.tagline}`,
  description: site.seo.description,
  url: site.url,
  numberOfAccommodationUnits: UNITS.length,
  numberOfAvailableAccommodationUnits: UNITS.filter((u) => u.status === "available").length,
  address: { "@type": "PostalAddress", streetAddress: "Riverside Drive", addressLocality: "Nairobi", addressCountry: "KE" },
  telephone: site.contact.phone,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "KES",
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    availabilityEnds: PRICING.completion,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const vars = {
    "--brand-paper": site.brand.paper,
    "--brand-graphite": site.brand.graphite,
    "--brand-stone": site.brand.stone,
    "--brand-mid": site.brand.mid,
    "--brand-accent": site.brand.accent,
  } as CSSProperties;
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`} style={vars}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
