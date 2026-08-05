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
// Audited from all paginated GBIF Aves occurrence facets on 2026-08-04.
// Each entry is [GBIF species key, worldwide occurrence count] for 2016–2026.
const EXTREMELY_RARE_SPECIES = [[10034489,9],[11208626,9],[2474548,9],[2478832,9],[2480598,9],[2480608,9],[2481093,9],[2481892,9],[2482517,9],[2484621,9],[2492553,9],[2493542,9],[5228134,9],[5231278,9],[5788694,9],[6100792,9],[6101203,9],[7341380,9],[7837644,9],[10681162,8],[11057372,8],[11112288,8],[2474407,8],[2476132,8],[2478561,8],[2480620,8],[2480623,8],[2481697,8],[2485046,8],[2486979,8],[2489009,8],[5228178,8],[5229071,8],[5230727,8],[5845000,8],[8026134,8],[8605364,8],[9363385,8],[10308870,7],[10550799,7],[10808559,7],[10841608,7],[11152982,7],[12185957,7],[2479830,7],[2480169,7],[2480324,7],[2480617,7],[2481091,7],[2483969,7],[2485312,7],[2486085,7],[2486697,7],[2489379,7],[2490582,7],[2490598,7],[2492480,7],[2492589,7],[2492671,7],[4845538,7],[4850140,7],[4966413,7],[5229958,7],[5230426,7],[5788827,7],[5789091,7],[5789220,7],[5844169,7],[6095354,7],[6100839,7],[7713533,7],[10687503,6],[10832796,6],[10842416,6],[10850433,6],[10863020,6],[10892957,6],[2476517,6],[2479426,6],[2487281,6],[2489352,6],[2493652,6],[2494009,6],[2494038,6],[2495139,6],[4966524,6],[5230676,6],[5231622,6],[5231850,6],[5232286,6],[5789033,6],[5959115,6],[6094232,6],[6100813,6],[6100823,6],[6100840,6],[8071275,6],[8083525,6],[8384528,6],[8961503,6],[9038593,6],[9285648,6],[10080633,5],[10682031,5],[10735513,5],[10793307,5],[11205963,5],[2479836,5],[2495357,5],[2495989,5],[5232107,5],[5844708,5],[5844994,5],[5959172,5],[6100884,5],[6101170,5],[6101193,5],[7341193,5],[7666175,5],[9719579,5],[10160206,4],[10226232,4],[10650067,4],[10700558,4],[10810250,4],[10853550,4],[10884824,4],[10973400,4],[12356578,4],[2474392,4],[2478833,4],[2479684,4],[2479769,4],[2480054,4],[2480323,4],[2480611,4],[2480622,4],[2480638,4],[2481730,4],[2482005,4],[2486139,4],[2487125,4],[2489272,4],[2493692,4],[2496045,4],[5229032,4],[5230060,4],[5231390,4],[6101191,4],[7428392,4],[7470332,4],[8145843,4],[8345560,4],[10187426,3],[10223019,3],[10498423,3],[10673624,3],[10693008,3],[10779795,3],[10846658,3],[10862164,3],[10915216,3],[10968410,3],[11095319,3],[11111842,3],[11143584,3],[11180458,3],[11195824,3],[12251645,3],[2479483,3],[2480032,3],[2480062,3],[2480600,3],[2480630,3],[2480639,3],[2481789,3],[2484695,3],[2484709,3],[2486117,3],[2487523,3],[2489271,3],[2489343,3],[2490583,3],[2492271,3],[2493712,3],[2494141,3],[2496330,3],[2497378,3],[2497561,3],[5229821,3],[5789092,3],[5846386,3],[6088981,3],[6089194,3],[6100850,3],[6100878,3],[6101040,3],[6101106,3],[7341186,3],[7899445,3],[8086522,3],[8521860,3],[10068709,2],[10528985,2],[10711832,2],[10726050,2],[10726503,2],[10747072,2],[10747371,2],[10759458,2],[10790779,2],[10817112,2],[10868500,2],[11024172,2],[11070244,2],[11172958,2],[11792185,2],[11795129,2],[2474703,2],[2475990,2],[2479001,2],[2479402,2],[2479675,2],[2480086,2],[2480267,2],[2480293,2],[2480522,2],[2481503,2],[2482585,2],[2484702,2],[2485610,2],[2486695,2],[2489028,2],[2489855,2],[2492791,2],[2493685,2],[2494060,2],[2495834,2],[2496094,2],[2496198,2],[2498008,2],[5231894,2],[5788412,2],[5788552,2],[5788587,2],[6088788,2],[6100886,2],[6101228,2],[7341341,2],[7384015,2],[7384180,2],[7780994,2],[8543821,2],[8785272,2],[9056574,2],[9101785,2],[9561126,2],[10432127,1],[10556333,1],[10692457,1],[10706510,1],[10734567,1],[10762970,1],[10768888,1],[10777905,1],[10815309,1],[10857548,1],[10939351,1],[10979844,1],[11122406,1],[11185414,1],[11478882,1],[11667562,1],[12037443,1],[12107555,1],[12321423,1],[12338140,1],[12381723,1],[2474370,1],[2474468,1],[2474484,1],[2475036,1],[2476044,1],[2477211,1],[2477238,1],[2479306,1],[2479484,1],[2479490,1],[2479812,1],[2479963,1],[2480092,1],[2480148,1],[2480290,1],[2480582,1],[2480607,1],[2480619,1],[2480736,1],[2481731,1],[2481783,1],[2482042,1],[2482050,1],[2482076,1],[2482140,1],[2482280,1],[2484437,1],[2484698,1],[2486091,1],[2486099,1],[2486466,1],[2487128,1],[2489021,1],[2489442,1],[2490578,1],[2490907,1],[2492829,1],[2492934,1],[2493303,1],[2493474,1],[2493678,1],[2496514,1],[2496838,1],[2498189,1],[4408496,1],[4845986,1],[4850092,1],[5228152,1],[5228186,1],[5228212,1],[5228215,1],[5228224,1],[5228535,1],[5229129,1],[5231326,1],[5231723,1],[5232003,1],[5232436,1],[5788380,1],[5788601,1],[5788653,1],[5788753,1],[5788758,1],[5789136,1],[5845533,1],[5845725,1],[5845786,1],[5959232,1],[6066242,1],[6100864,1],[6100885,1],[6100971,1],[6101169,1],[7340480,1],[7341844,1],[7433353,1],[7476581,1],[7724555,1],[7932595,1],[7949268,1],[8134022,1],[8197964,1],[8209081,1],[8215570,1],[8227418,1],[8257263,1],[8311805,1],[8735373,1],[8783251,1],[8951546,1],[9151889,1],[9213892,1],[9697534,1],[9722806,1],[9743024,1],[9800382,1],[9819345,1],[9870452,1]];

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

async function speciesDetails(item) {
  const [response, namesResponse] = await Promise.all([
    fetch(`https://api.gbif.org/v1/species/${item.name}`, { next: { revalidate: 60 * 60 * 24 * 14 } }),
    fetch(`https://api.gbif.org/v1/species/${item.name}/vernacularNames?limit=100`, { next: { revalidate: 60 * 60 * 24 * 14 } })
  ]);
  if (!response.ok) return null;
  const taxon = await response.json();
  const names = namesResponse.ok ? (await namesResponse.json()).results || [] : [];
  if (taxon.rank !== "SPECIES") return null;
  const scientific = taxon.canonicalName || taxon.scientificName;
  const englishName = chooseCommonName(names);
  const taxonVernacular = taxon.vernacularName?.trim() || "";
  const displayName = englishName ||
    (taxonVernacular && taxonVernacular.toLowerCase() !== scientific?.toLowerCase() ? taxonVernacular : "") ||
    "Common name unavailable";
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

async function searchSpecies(query) {
  const params = new URLSearchParams({
    q: query,
    highertaxon_key: "212",
    rank: "SPECIES",
    status: "ACCEPTED",
    limit: "16"
  });
  const response = await fetch(`https://api.gbif.org/v1/species/search?${params}`, {
    next: { revalidate: 60 * 60 * 24 }
  });
  if (!response.ok) throw new Error("GBIF species search failed");
  const data = await response.json();
  const unique = [];
  const seen = new Set();
  for (const result of data.results || []) {
    const key = result.nubKey || result.key;
    if (!key || result.rank !== "SPECIES" || result.class !== "Aves" || seen.has(key)) continue;
    seen.add(key);
    unique.push({ name: key, count: 0 });
    if (unique.length === 10) break;
  }
  const birds = (await Promise.all(unique.map(speciesDetails))).filter(Boolean);
  return birds.map((bird) => ({ ...bird, rarity: "Recorded", sightings: undefined }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("rare") === "true") {
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const limit = Math.min(40, Math.max(8, Number(searchParams.get("limit")) || 12));
    const page = EXTREMELY_RARE_SPECIES.slice(offset, offset + limit);
    try {
      const birds = (await Promise.all(page.map(([name, count]) => speciesDetails({ name, count })))).filter(Boolean)
        .map((bird) => ({ ...bird, rarity: "Extremely Rare", endangered: true }));
      return NextResponse.json({
        birds,
        total: EXTREMELY_RARE_SPECIES.length,
        nextOffset: offset + page.length < EXTREMELY_RARE_SPECIES.length ? offset + page.length : null,
        window: `${firstYear}–${currentYear}`,
        source: "GBIF worldwide occurrence records",
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
      return NextResponse.json({ birds: await searchSpecies(query), source: "GBIF species taxonomy" });
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
