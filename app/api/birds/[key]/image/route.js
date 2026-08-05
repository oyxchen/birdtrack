import { NextResponse } from "next/server";
import { findExactBirdPhoto } from "../../../../../lib/bird-image-source";

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
    return { info, searchable, license };
  }).find(({ info, searchable, license }) =>
    info?.thumburl &&
    /^image\/(?:jpeg|png|webp)$/i.test(info.mime || "") &&
    searchable.includes(needle) &&
    /^(?:CC0|CC BY|CC BY-SA|Public domain)/i.test(license)
  )?.info;
}

export async function GET(request, { params }) {
  const { key } = await params;
  if (!/^\d+$/.test(key)) return new NextResponse(null, { status: 404 });

  try {
    const taxonResponse = await fetch(`https://api.gbif.org/v1/species/${key}`, {
      next: { revalidate: 60 * 60 * 24 * 14 }
    });
    if (!taxonResponse.ok) throw new Error();
    const taxon = await taxonResponse.json();
    const requestedScientific = new URL(request.url).searchParams.get("scientific")?.trim();
    const scientific = requestedScientific || taxon.canonicalName || taxon.species;
    if (!scientific || taxon.rank !== "SPECIES") return new NextResponse(null, { status: 404 });
    const exactPhoto = await findExactBirdPhoto(scientific);
    if (exactPhoto) {
      return NextResponse.redirect(exactPhoto.url, {
        status: 307,
        headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" }
      });
    }
    const wikiParams = new URLSearchParams({
      action: "query", format: "json", redirects: "1", prop: "pageimages",
      titles: scientific, piprop: "thumbnail", pithumbsize: "900", pilicense: "free"
    });
    const wikiResponse = await fetch(`https://en.wikipedia.org/w/api.php?${wikiParams}`, {
      headers: { "User-Agent": "BirdTrack/1.0 educational bird tracker" },
      next: { revalidate: 60 * 60 * 24 * 14 }
    });
    if (!wikiResponse.ok) throw new Error();
    const wikiData = await wikiResponse.json();
    const page = Object.values(wikiData.query?.pages || {})[0] || {};
    let image = page.missing === undefined ? page.thumbnail?.source || "" : "";
    if (!image) {
      const commonsParams = new URLSearchParams({
        action: "query", format: "json", generator: "search",
        gsrsearch: `"${scientific}" filetype:bitmap`, gsrnamespace: "6", gsrlimit: "10",
        prop: "imageinfo", iiprop: "url|mime|extmetadata", iiurlwidth: "900"
      });
      const commonsResponse = await fetch(`https://commons.wikimedia.org/w/api.php?${commonsParams}`, {
        headers: { "User-Agent": "BirdTrack/1.0 educational bird tracker" },
        next: { revalidate: 60 * 60 * 24 * 14 }
      });
      const commonsData = commonsResponse.ok ? await commonsResponse.json() : {};
      image = commonsImage(commonsData.query?.pages, scientific)?.thumburl || "";
    }
    if (!image) return new NextResponse(null, { status: 404 });
    return NextResponse.redirect(image, {
      status: 307,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
