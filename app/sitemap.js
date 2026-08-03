import { allPublicPaths } from "../lib/routes";

export default function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://birdtrack.vercel.app").replace(/\/$/, "");
  const now = new Date();
  return allPublicPaths().map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/places/") ? 0.8 : 0.7
  }));
}
