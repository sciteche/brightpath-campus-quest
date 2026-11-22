import { createFileRoute } from "@tanstack/react-router";

import { CampusPage } from "@/game/CampusPage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Structured data for search engines. The street address is a placeholder for the
// demo business — replace it with the real one before a real launch.
const ORGANIZATION_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  description: "Coaching centre for Classes 9–12 with small batches and a free first demo class.",
  url: SITE_URL,
  logo: `${SITE_URL}favicon.svg`,
  image: `${SITE_URL}og-image.png`,
  telephone: "+91 90000 00000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "A-1, Example Street, Sector 62",
    addressLocality: "Noida",
    addressRegion: "Uttar Pradesh",
    postalCode: "201301",
    addressCountry: "IN",
  },
});

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "BrightPath Classes | Coaching in Sector 62, Noida" },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:title", content: "BrightPath Classes | Sector 62, Noida" },
      {
        property: "og:description",
        content:
          "Class 9–12 coaching with small batches, clear teaching and a free first demo class.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "BrightPath Classes — Class 9–12 coaching in Sector 62, Noida",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BrightPath Classes | Sector 62, Noida" },
      {
        name: "twitter:description",
        content:
          "Class 9–12 coaching with small batches, clear teaching and a free first demo class.",
      },
      { name: "twitter:image", content: `${SITE_URL}og-image.png` },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [{ type: "application/ld+json", children: ORGANIZATION_JSON_LD }],
  }),
  component: CampusPage,
});
