import { NextResponse } from "next/server";
import { EXTREMELY_RARE_SPECIES as VERIFIED_EXTREMELY_RARE_SPECIES } from "../../../lib/extremely-rare-species";
import { LIVING_SPECIES } from "../../../lib/living-species";

const COUNTRY_CODES = {
  "United States": "US", Canada: "CA", Mexico: "MX", "Costa Rica": "CR", Panama: "PA", Cuba: "CU", Jamaica: "JM",
  Brazil: "BR", Argentina: "AR", Colombia: "CO", Peru: "PE", Ecuador: "EC", Chile: "CL", Bolivia: "BO",
  "United Kingdom": "GB", France: "FR", Spain: "ES", Germany: "DE", Italy: "IT", Norway: "NO", Portugal: "PT",
  Kenya: "KE", "South Africa": "ZA", Tanzania: "TZ", Botswana: "BW", Morocco: "MA", Ghana: "GH", Uganda: "UG",
  Japan: "JP", China: "CN", India: "IN", Thailand: "TH", Indonesia: "ID", "South Korea": "KR", Vietnam: "VN",
  Australia: "AU", "New Zealand": "NZ", "Papua New Guinea": "PG", Fiji: "FJ", Samoa: "WS", Antarctica: "AQ"
};

const currentYear = new Date().getUTCFullYear();
const firstYear = currentYear - 10;
const UNALIGNED_RARE_TAXA = new Set([
  "Pachyptila macgillivrayi", "Gyps rueppelli", "Rhinoplax vigil",
  "Strigops habroptilus", "Cacatua citrinocristata", "Lathamus discolor",
  "Chiroxiphia bokermanni", "Hypsipetes platenae"
]);
const EXTREMELY_RARE_CATALOG = VERIFIED_EXTREMELY_RARE_SPECIES
  .filter((item) => !UNALIGNED_RARE_TAXA.has(item.scientific));

function rarityFor(count) {
  if (count >= 10000) return "Common";
  if (count >= 100) return "Uncommon";
  return "Rare";
}

function chooseCommonName(names) {
  const candidates = names
    .filter((item) => item.language === "eng")
    .filter((item) => {
      const name = item.vernacularName?.trim() || "";
      return name.length >= 4 &&
        !/^[A-Z0-9-]{2,8}$/.test(name) &&
        !/\b(?:sp\.|spp\.|hybrid| x )\b/i.test(name);
    })
    .map((item) => {
      const source = item.source || "";
      let score = 0;
      if (/Clements Checklist/i.test(source)) score += 120;
      if (/IOC World Bird List/i.test(source)) score += 110;
      if (/IUCN Red List/i.test(source)) score += 100;
      if (/Integrated Taxonomic Information System/i.test(source)) score += 80;
      if (item.preferred === true) score += 60;
      if (item.country === "US") score += 25;
      if (item.vernacularName.trim().includes(" ")) score += 15;
      if (/^[A-Z][a-z]+(?:[- ][A-Z]?[a-z]+)+$/.test(item.vernacularName.trim())) score += 10;
      return { name: item.vernacularName.trim(), score };
    })
    .sort((a, b) => b.score - a.score || a.name.length - b.name.length);
  return candidates[0]?.name || "";
}

async function hybridDisplayName(scientific) {
  const parts = scientific.split(/\s+(?:x|×)\s+/i);
  if (parts.length !== 2) return `${scientific.replace(/\s+x\s+/i, " × ")} hybrid`;
  const genus = parts[0].split(" ")[0];
  const parentNames = await Promise.all(parts.map(async (part, index) => {
    const parent = index === 1 && !part.includes(" ") ? `${genus} ${part}` : part;
    try {
      const matchResponse = await fetch(`https://api.gbif.org/v1/species/match?${new URLSearchParams({ name: parent, class: "Aves", rank: "SPECIES" })}`, {
        next: { revalidate: 60 * 60 * 24 * 14 }
      });
      if (!matchResponse.ok) return parent;
      const match = await matchResponse.json();
      const key = match.usageKey || match.speciesKey;
      if (!key) return parent;
      const namesResponse = await fetch(`https://api.gbif.org/v1/species/${key}/vernacularNames?limit=100`, {
        next: { revalidate: 60 * 60 * 24 * 14 }
      });
      const names = namesResponse.ok ? (await namesResponse.json()).results || [] : [];
      return chooseCommonName(names) || parent;
    } catch {
      return parent;
    }
  }));
  return `${parentNames.join(" × ")} hybrid`;
}

async function speciesDetails(item) {
  const [response, namesResponse] = await Promise.all([
    fetch(`https://api.gbif.org/v1/species/${item.name}`, { next: { revalidate: 60 * 60 * 24 * 14 } }),
    fetch(`https://api.gbif.org/v1/species/${item.name}/vernacularNames?limit=100`, { next: { revalidate: 60 * 60 * 24 * 14 } })
  ]);
  if (!response.ok) return null;
  const taxon = await response.json();
  const names = namesResponse.ok ? (await namesResponse.json()).results || [] : [];
  const scientific = taxon.canonicalName || taxon.scientificName;
  const isHybrid = /\s(?:x|×)\s/i.test(scientific || "") || /hybrid/i.test(taxon.taxonomicStatus || "");
  if (taxon.rank !== "SPECIES" && !isHybrid) return null;
  const englishName = chooseCommonName(names);
  const taxonVernacular = taxon.vernacularName?.trim() || "";
  const displayName = englishName ||
    (taxonVernacular && taxonVernacular.toLowerCase() !== scientific?.toLowerCase() ? taxonVernacular : "") ||
    (isHybrid ? await hybridDisplayName(scientific) : "");
  if (!displayName) return null;
  return {
    id: `gbif-${taxon.key}`,
    gbifKey: taxon.key,
    name: displayName,
    scientific,
    rarity: rarityFor(item.count),
    sightings: item.count,
    emoji: "◉",
    size: "See species sources",
    diet: "Varies by species",
    behavior: "Recorded in this area",
    image: "",
    source: `https://www.gbif.org/species/${taxon.key}`,
    description: [
      `${displayName} (${scientific}) has been documented ${item.count.toLocaleString()} times in this area during BirdTrack’s rolling ten-year data window.`,
      "Open the GBIF species source for taxonomy and occurrence details. A richer sourced profile and freely licensed photograph can be added when this species page is opened."
    ]
  };
}

async function matchLivingSpecies([name, scientific], count = 0) {
  const params = new URLSearchParams({
    q: scientific,
    highertaxon_key: "212",
    rank: "SPECIES",
    limit: "20"
  });
  const response = await fetch(`https://api.gbif.org/v1/species/search?${params}`, {
    next: { revalidate: 60 * 60 * 24 * 14 }
  });
  if (!response.ok) return null;
  const data = await response.json();
  const normalize = (value = "") => value
    .normalize("NFKD")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
  const exact = (data.results || []).find((result) =>
    result.rank === "SPECIES" &&
    result.class === "Aves" &&
    normalize(result.canonicalName || result.scientificName?.replace(/\s+[A-Z][a-z]*,?.*$/, "")) === normalize(scientific)
  );
  const key = exact?.acceptedKey || exact?.nubKey || exact?.key;
  if (!key) return null;
  const bird = await speciesDetails({ name: key, count });
  return bird ? { ...bird, name, scientific } : null;
}

async function searchSpecies(query) {
  if (/\s(?:x|×)\s|\bhybrid\b/i.test(query)) {
    const params = new URLSearchParams({ q: query, highertaxon_key: "212", limit: "20" });
    const response = await fetch(`https://api.gbif.org/v1/species/search?${params}`, {
      next: { revalidate: 60 * 60 * 24 }
    });
    if (!response.ok) throw new Error("GBIF hybrid search failed");
    const data = await response.json();
    const normalized = query.replace(/\s+/g, " ").trim().toLocaleLowerCase();
    const hybrids = (data.results || [])
      .filter((result) => /\s(?:x|×)\s/i.test(result.scientificName || ""))
      .filter((result) => (result.scientificName || "").replace(/\s+/g, " ").trim().toLocaleLowerCase() === normalized)
      .slice(0, 10);
    const birds = (await Promise.all(hybrids.map((result) => speciesDetails({
      name: result.acceptedKey || result.nubKey || result.key,
      count: 0
    })))).filter(Boolean);
    return birds.map((bird) => ({ ...bird, rarity: "Hybrid", sightings: undefined }));
  }
  const normalized = query.toLocaleLowerCase();
  const matches = LIVING_SPECIES
    .filter(([name, scientific]) =>
      name.toLocaleLowerCase().includes(normalized) ||
      scientific.toLocaleLowerCase().includes(normalized)
    )
    .sort(([aName, aScientific], [bName, bScientific]) => {
      const a = aName.toLocaleLowerCase() === normalized || aScientific.toLocaleLowerCase() === normalized ? 0 : 1;
      const b = bName.toLocaleLowerCase() === normalized || bScientific.toLocaleLowerCase() === normalized ? 0 : 1;
      return a - b || aName.localeCompare(bName);
    })
    .slice(0, 10);
  const birds = (await Promise.all(matches.map((item) => matchLivingSpecies(item)))).filter(Boolean);
  return birds.map((bird) => ({ ...bird, rarity: "Recorded", sightings: undefined }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("rare") === "true") {
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const limit = Math.min(40, Math.max(8, Number(searchParams.get("limit")) || 12));
    const page = EXTREMELY_RARE_CATALOG.slice(offset, offset + limit);
    try {
      const birds = (await Promise.all(page.map(async (item) => {
        const bird = await matchLivingSpecies([item.name, item.scientific]);
        return bird ? {
          ...bird,
          name: item.name,
          scientific: item.scientific,
          rarity: "Extremely Rare",
          endangered: true,
          conservationStatus: "Critically Endangered",
          avibaseId: item.avibaseId
        } : null;
      }))).filter(Boolean);
      return NextResponse.json({
        birds,
        total: EXTREMELY_RARE_CATALOG.length,
        nextOffset: offset + page.length < EXTREMELY_RARE_CATALOG.length ? offset + page.length : null,
        source: "AviList v2025b taxonomy and English names; BirdLife/IUCN Red List October 2025 status; GBIF taxon matching",
        auditedAt: "2026-08-04"
      });
    } catch {
      return NextResponse.json({ error: "Extremely rare birds are temporarily unavailable." }, { status: 502 });
    }
  }

  const query = searchParams.get("q")?.trim() || "";
  if (query) {
    if (query.length < 2) return NextResponse.json({ birds: [] });
    try {
      return NextResponse.json({ birds: await searchSpecies(query), source: "AviList v2025b living species matched to GBIF taxonomy" });
    } catch {
      return NextResponse.json({ error: "Bird search is temporarily unavailable." }, { status: 502 });
    }
  }

  const country = searchParams.get("country") || "";
  const countryCode = COUNTRY_CODES[country];
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(100, Math.max(20, Number(searchParams.get("limit")) || 60));
  if (!countryCode) return NextResponse.json({ error: "This country is not configured." }, { status: 400 });

  const params = new URLSearchParams({
    country: countryCode,
    taxon_key: "212",
    year: `${firstYear},${currentYear}`,
    occurrence_status: "present",
    has_geospatial_issue: "false",
    limit: "0",
    facet: "speciesKey",
    facetLimit: "3000"
  });

  try {
    const occurrenceResponse = await fetch(`https://api.gbif.org/v1/occurrence/search?${params}`, { next: { revalidate: 60 * 60 * 12 } });
    if (!occurrenceResponse.ok) throw new Error("GBIF occurrence request failed");
    const occurrenceData = await occurrenceResponse.json();
    const qualifying = (occurrenceData.facets?.[0]?.counts || []).filter((item) => item.count >= 10);
    const page = qualifying.slice(offset, offset + limit);
    const birds = (await Promise.all(page.map(speciesDetails))).filter(Boolean);
    return NextResponse.json({
      birds,
      total: qualifying.length,
      offset,
      nextOffset: offset + page.length < qualifying.length ? offset + page.length : null,
      window: `${firstYear}–${currentYear}`,
      source: "GBIF occurrence records"
    });
  } catch {
    return NextResponse.json({ error: "Live occurrence data is temporarily unavailable." }, { status: 502 });
  }
}
