import { BIRDS, CONTINENTS, COUNTRIES } from "./data";

export function slugify(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function routeToPath(route) {
  if (!route || route.view === "home") return "/";
  if (route.view === "continent") return `/continents/${slugify(route.continent)}`;
  if (route.view === "area") return `/places/${slugify(route.continent)}/${slugify(route.country)}`;
  if (route.view === "bird") return `/birds/${route.birdId}`;
  if (route.view === "life-list") return "/life-list";
  if (route.view === "workspace") return `/workspace/${route.tab || "journal"}`;
  return "/";
}

export function pathToRoute(pathname = "/") {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return { view: "home" };

  if (parts[0] === "life-list" && parts.length === 1) {
    return { view: "life-list" };
  }

  if (parts[0] === "continents" && parts[1]) {
    const continent = CONTINENTS.find((item) => slugify(item.name) === parts[1])?.name;
    if (continent) return { view: "continent", continent };
  }

  if (parts[0] === "places" && parts[1] && parts[2]) {
    const continent = CONTINENTS.find((item) => slugify(item.name) === parts[1])?.name;
    const country = continent && (COUNTRIES[continent] || []).find((item) => slugify(item) === parts[2]);
    if (continent && country) return { view: "area", continent, country };
  }

  if (parts[0] === "birds" && parts[1]) {
    const bird = BIRDS.find((item) => item.id === parts[1]);
    return { view: "bird", birdId: parts[1], bird };
  }

  if (parts[0] === "workspace" && ["journal", "research"].includes(parts[1])) {
    return { view: "workspace", tab: parts[1] };
  }

  return { view: "not-found" };
}

export function allPublicPaths() {
  return [
    "/",
    ...CONTINENTS.map((item) => `/continents/${slugify(item.name)}`),
    ...CONTINENTS.flatMap((continent) =>
      (COUNTRIES[continent.name] || []).map(
        (country) => `/places/${slugify(continent.name)}/${slugify(country)}`
      )
    ),
    ...BIRDS.map((bird) => `/birds/${bird.id}`),
    "/workspace/journal",
    "/workspace/research",
    "/life-list"
  ];
}
