import App from "../page";
import { pathToRoute } from "../../lib/routes";

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const route = pathToRoute(`/${slug.join("/")}`);
  if (route.view === "continent") {
    return {
      title: `Birds of ${route.continent}`,
      description: `Explore countries and recorded bird species across ${route.continent}.`
    };
  }
  if (route.view === "area") {
    return {
      title: `Birds recorded in ${route.country}`,
      description: `Browse bird species documented in ${route.country} at least ten times during the previous ten years.`
    };
  }
  if (route.view === "bird") {
    return {
      title: route.bird ? `${route.bird.name} (${route.bird.scientific})` : "Bird species profile",
      description: route.bird ? `Identification, behavior, diet, size, and sighting information for the ${route.bird.name}.` : "Bird species identification and sighting information."
    };
  }
  if (route.view === "workspace") {
    return {
      title: route.tab === "research" ? "Bird Research" : "Bird Journal",
      description: route.tab === "research" ? "Ask focused questions about birds and ornithology." : "Write and organize private birdwatching journal entries."
    };
  }
  if (route.view === "life-list") {
    return {
      title: "My Bird Life List",
      description: "Review the bird species you have marked as seen in BirdTrack."
    };
  }
  return { title: "Page not found" };
}

export default App;
