import { createFileRoute } from "@tanstack/react-router";

import { CampusPage } from "@/game/CampusPage";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "BrightPath Classes | Coaching in Sector 62, Noida" },
      { name: "description", content: "Explore BrightPath Classes in Sector 62, Noida. Find Class 9–12 courses, monthly fees, results and teachers, or book a free demo class." },
      { property: "og:title", content: "BrightPath Classes | Sector 62, Noida" },
      { property: "og:description", content: "Class 9–12 coaching with small batches, clear teaching and a free first demo class." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampusPage,
});
