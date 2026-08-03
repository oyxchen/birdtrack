import { NextResponse } from "next/server";

const reusableLicense = /creativecommons\.org\/licenses\/(?:by|by-sa)\/|creativecommons\.org\/publicdomain|publicdomain|CC0/i;

function sentences(text = "") {
  return text
    .replace(/(\d)\.(\d)/g, "$1§DECIMAL§$2")
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]+/g)
    ?.map((sentence) => sentence.replaceAll("§DECIMAL§", ".").trim()) || [];
}

function findSentence(list, patterns) {
  return list.find((sentence) => patterns.some((pattern) => pattern.test(sentence)));
}

function shortValue(sentence, fallback) {
  if (!sentence) return fallback;
  const cleaned = sentence
    .replace(/^(?:Behaviour|Behavior|Ecology|Description|Diet|Feeding|Breeding)\s+/i, "")
    .trim();
  return cleaned.length > 105 ? `${cleaned.slice(0, 102).replace(/\s+\S*$/, "")}…` : cleaned;
}

export async function GET(request, { params }) {
  const { key } = await params;
  let scientific = new URL(request.url).searchParams.get("scientific") || "";
  let taxon = null;
  if (!/^\d+$/.test(key)) return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  if (!scientific) {
    const taxonResponse = await fetch(`https://api.gbif.org/v1/species/${key}`, { next: { revalidate: 60 * 60 * 24 * 14 } });
    if (!taxonResponse.ok) return NextResponse.json({ error: "Species not found." }, { status: 404 });
    taxon = await taxonResponse.json();
    scientific = taxon.canonicalName || taxon.species || "";
    if (!scientific) return NextResponse.json({ error: "Species not found." }, { status: 404 });
  }

  const wikiParams = new URLSearchParams({
    action: "query", format: "json", origin: "*", redirects: "1",
    prop: "extracts|pageimages|info", inprop: "url", titles: scientific,
    explaintext: "1", exsectionformat: "plain", piprop: "thumbnail",
    pithumbsize: "1200", pilicense: "free"
  });

  try {
    const [mediaResponse, wikiResponse] = await Promise.all([
      fetch(`https://api.gbif.org/v1/occurrence/search?taxon_key=${key}&media_type=StillImage&occurrence_status=present&limit=40`, { next: { revalidate: 60 * 60 * 24 * 7 } }),
      fetch(`https://en.wikipedia.org/w/api.php?${wikiParams}`, {
        headers: { "User-Agent": "BirdTrack/1.0 educational bird tracker" },
        next: { revalidate: 60 * 60 * 24 * 14 }
      })
    ]);

    const mediaData = mediaResponse.ok ? await mediaResponse.json() : { results: [] };
    const wikiData = wikiResponse.ok ? await wikiResponse.json() : { query: { pages: {} } };
    const page = Object.values(wikiData.query?.pages || {})[0] || {};
    const text = page.extract || "";
    const list = sentences(text);

    const reusableMedia = mediaData.results
      .flatMap((record) => (record.media || []).map((media) => ({ ...media, record })))
      .find((media) => media.type === "StillImage" && media.identifier && reusableLicense.test(media.license || media.record.license || ""));

    const sizeSentence = findSentence(list, [/\b\d+(?:\.\d+)?\s*(?:cm|centimet|inches?|in\b|metres?|meters?)\b/i, /\b(?:length|wingspan|weighs?|weight)\b/i]);
    const dietSentence = findSentence(list, [/\b(?:diet|feeds? (?:mainly |mostly )?on|eats?|preys? on|food consists?)\b/i]);
    const behaviorSentence = findSentence(list, [/\b(?:migrat|forag|nocturnal|diurnal|social|territorial|flock|nests?|hunts?|dives?|soars?)\b/i]);
    const intro = list.slice(0, 5).join(" ");
    const image = reusableMedia?.identifier || page.thumbnail?.source || "";
    const imageSource = reusableMedia?.references || reusableMedia?.record?.references || page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(scientific.replaceAll(" ", "_"))}`;

    return NextResponse.json({
      name: taxon?.vernacularName || taxon?.canonicalName || scientific,
      scientific,
      image,
      imageSource,
      imageCredit: reusableMedia?.creator || reusableMedia?.record?.recordedBy || (page.thumbnail ? "Wikimedia contributor" : ""),
      imageLicense: reusableMedia?.license || reusableMedia?.record?.license || (page.thumbnail ? "Freely licensed Wikimedia image" : ""),
      size: shortValue(sizeSentence, "Size information unavailable"),
      diet: shortValue(dietSentence, "Diet information unavailable"),
      behavior: shortValue(behaviorSentence, "Behavior information unavailable"),
      description: intro ? [intro.slice(0, 650), [dietSentence, behaviorSentence].filter(Boolean).join(" ")] : null,
      articleSource: page.fullurl || null
    });
  } catch {
    return NextResponse.json({ error: "Species details are temporarily unavailable." }, { status: 502 });
  }
}
