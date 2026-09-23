import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Praxis",
    short_name: "Praxis",
    description: "Turn what you learn into what you do.",
    start_url: "/today",
    display: "standalone",
    background_color: "#f5f2ea",
    theme_color: "#1e352b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
