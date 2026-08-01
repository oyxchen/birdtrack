import { NextResponse } from "next/server";

const reusableLicense = /creativecommons\.org\/licenses\/(?:by|by-sa)\/|creativecommons\.org\/publicdomain|publicdomain|CC0/i;

export async function GET(request, { params }) {
  const { key } = await params;
  if (!/^\d+$/.test(key)) return new NextResponse(null, { status: 404 });

  try {
    const response = await fetch(
      `https://api.gbif.org/v1/occurrence/search?taxon_key=${key}&media_type=StillImage&occurrence_status=present&limit=40`,
      { next: { revalidate: 60 * 60 * 24 * 7 } }
    );
    if (!response.ok) throw new Error();
    const data = await response.json();
    const image = data.results
      .flatMap((record) => (record.media || []).map((media) => ({ ...media, record })))
      .find((media) =>
        media.type === "StillImage" &&
        /^https:\/\//.test(media.identifier || "") &&
        reusableLicense.test(media.license || media.record.license || "")
      );
    if (!image) return new NextResponse(null, { status: 404 });
    return NextResponse.redirect(image.identifier, {
      status: 307,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
