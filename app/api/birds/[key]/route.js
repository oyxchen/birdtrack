import { NextResponse } from "next/server";
import { findExactBirdPhoto } from "../../../../lib/bird-image-source";

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

function commonsImage(pages, scientific) {
  const needle = scientific.toLocaleLowerCase();
  return Object.values(pages || {}).map((page) => {
    const info = page.imageinfo?.[0];
    const metadata = info?.extmetadata || {};
    const searchable = [
      page.title, metadata.ObjectName?.value, metadata.ImageDescription?.value,
      metadata.Categories?.value
    ].filter(Boolean).join(" ").replace(/<[^>]+>/g, " ").toLocaleLowerCase();
    const license = metadata.LicenseShortName?.value || "";
    return { page, info, searchable, license };
  }).find(({ info, searchable, license }) =>
    info?.thumburl &&
    /^image\/(?:jpeg|png|webp)$/i.test(info.mime || "") &&
    searchable.includes(needle) &&
    /^(?:CC0|CC BY|CC BY-SA|Public domain)/i.test(license)
  );
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
    const [wikiResponse, exactPhoto] = await Promise.all([
      fetch(`https://en.wikipedia.org/w/api.php?${wikiParams}`, {
        headers: { "User-Agent": "BirdTrack/1.0 educational bird tracker" },
        next: { revalidate: 60 * 60 * 24 * 14 }
      }),
      findExactBirdPhoto(scientific)
    ]);
    const wikiData = wikiResponse.ok ? await wikiResponse.json() : { query: { pages: {} } };
    const page = Object.values(wikiData.query?.pages || {})[0] || {};
    const text = page.extract || "";
    const list = sentences(text);

    const sizeSentence = findSentence(list, [/\b\d+(?:\.\d+)?\s*(?:cm|centimet|inches?|in\b|metres?|meters?)\b/i, /\b(?:length|wingspan|weighs?|weight)\b/i]);
    const dietSentence = findSentence(list, [/\b(?:diet|feeds? (?:mainly |mostly )?on|eats?|preys? on|food consists?)\b/i]);
    const behaviorSentence = findSentence(list, [/\b(?:migrat|forag|nocturnal|diurnal|social|territorial|flock|nests?|hunts?|dives?|soars?)\b/i]);
    const intro = list.slice(0, 5).join(" ");
    let image = exactPhoto?.url || (page.missing === undefined ? page.thumbnail?.source || "" : "");
    let imageSource = exactPhoto?.source || page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(scientific.replaceAll(" ", "_"))}`;
    let imageCredit = exactPhoto?.credit || (page.thumbnail ? "Wikimedia contributor" : "");
    let imageLicense = exactPhoto?.license || (page.thumbnail ? "Freely licensed Wikimedia image" : "");
    if (!image) {
      const commonsParams = new URLSearchParams({
        action: "query", format: "json", generator: "search",
        gsrsearch: `"${scientific}" filetype:bitmap`, gsrnamespace: "6", gsrlimit: "10",
        prop: "imageinfo", iiprop: "url|mime|extmetadata", iiurlwidth: "1200"
      });
      const commonsResponse = await fetch(`https://commons.wikimedia.org/w/api.php?${commonsParams}`, {
        headers: { "User-Agent": "BirdTrack/1.0 educational bird tracker" },
        next: { revalidate: 60 * 60 * 24 * 14 }
      });
      const commonsData = commonsResponse.ok ? await commonsResponse.json() : {};
      const commons = commonsImage(commonsData.query?.pages, scientific);
      if (commons) {
        image = commons.info.thumburl;
        imageSource = commons.info.descriptionurl;
        imageCredit = commons.info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, " ") || "Wikimedia Commons contributor";
        imageLicense = commons.license;
      }
    }

    return NextResponse.json({
      name: taxon?.vernacularName || taxon?.canonicalName || scientific,
      scientific,
      image,
      imageSource,
      imageCredit,
      imageLicense,
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
