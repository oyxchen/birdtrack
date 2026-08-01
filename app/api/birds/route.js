import { NextResponse } from "next/server";

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

function rarityFor(count) {
  if (count >= 10000) return "Common";
  if (count >= 100) return "Uncommon";
  return "Rare";
}

function chooseCommonName(names, fallback) {
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
  return candidates[0]?.name || fallback;
}

async function speciesDetails(item) {
  const [response, namesResponse] = await Promise.all([
    fetch(`https://api.gbif.org/v1/species/${item.name}`, { next: { revalidate: 60 * 60 * 24 * 14 } }),
    fetch(`https://api.gbif.org/v1/species/${item.name}/vernacularNames?limit=100`, { next: { revalidate: 60 * 60 * 24 * 14 } })
  ]);
  if (!response.ok) return null;
  const taxon = await response.json();
  const names = namesResponse.ok ? (await namesResponse.json()).results || [] : [];
  if (taxon.rank !== "SPECIES") return null;
  const englishName = chooseCommonName(names, taxon.vernacularName || taxon.canonicalName || taxon.scientificName);
  return {
    id: `gbif-${taxon.key}`,
    gbifKey: taxon.key,
    name: englishName || taxon.vernacularName || taxon.canonicalName || taxon.scientificName,
    scientific: taxon.canonicalName || taxon.scientificName,
    rarity: rarityFor(item.count),
    sightings: item.count,
    emoji: "◉",
    size: "See species sources",
    diet: "Varies by species",
    behavior: "Recorded in this area",
    image: "",
    source: `https://www.gbif.org/species/${taxon.key}`,
    description: [
      `${englishName || taxon.vernacularName || taxon.canonicalName} (${taxon.canonicalName || taxon.scientificName}) has been documented ${item.count.toLocaleString()} times in this area during BirdTrack’s rolling ten-year data window.`,
      "Open the GBIF species source for taxonomy and occurrence details. A richer sourced profile and freely licensed photograph can be added when this species page is opened."
    ]
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
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
