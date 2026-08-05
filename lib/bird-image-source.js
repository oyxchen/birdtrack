const REUSABLE_LICENSES = new Set(["cc0", "cc-by", "cc-by-sa", "cc-by-nc", "cc-by-nc-sa"]);

export async function findExactBirdPhoto(scientific) {
  const taxonParams = new URLSearchParams({
    q: scientific,
    rank: "species",
    per_page: "10"
  });
  const taxonResponse = await fetch(`https://api.inaturalist.org/v1/taxa?${taxonParams}`, {
    headers: { "User-Agent": "BirdTrack/1.0 educational bird tracker" },
    next: { revalidate: 60 * 60 * 24 * 14 }
  });
  if (!taxonResponse.ok) return null;
  const taxonData = await taxonResponse.json();
  const normalized = scientific.replace(/\s+/g, " ").trim().toLocaleLowerCase();
  const taxon = (taxonData.results || []).find((item) =>
    item.rank === "species" &&
    item.is_active !== false &&
    item.extinct !== true &&
    item.name?.replace(/\s+/g, " ").trim().toLocaleLowerCase() === normalized
  );
  if (!taxon) return null;
  const defaultPhoto = taxon.default_photo;
  if (
    defaultPhoto &&
    REUSABLE_LICENSES.has(defaultPhoto.license_code?.toLocaleLowerCase()) &&
    /^https:\/\//.test(defaultPhoto.medium_url || defaultPhoto.url || "")
  ) {
    return {
      url: defaultPhoto.medium_url || defaultPhoto.url.replace(/\/square\./i, "/large."),
      source: `https://www.inaturalist.org/photos/${defaultPhoto.id}`,
      credit: defaultPhoto.attribution || "iNaturalist contributor",
      license: defaultPhoto.license_code.toUpperCase(),
      provider: "iNaturalist exact-species taxon photo"
    };
  }

  const observationParams = new URLSearchParams({
    taxon_id: String(taxon.id),
    photos: "true",
    quality_grade: "research",
    photo_license: "cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa",
    order_by: "votes",
    order: "desc",
    per_page: "20"
  });
  const observationResponse = await fetch(`https://api.inaturalist.org/v1/observations?${observationParams}`, {
    headers: { "User-Agent": "BirdTrack/1.0 educational bird tracker" },
    next: { revalidate: 60 * 60 * 24 * 14 }
  });
  if (!observationResponse.ok) return null;
  const observationData = await observationResponse.json();
  for (const observation of observationData.results || []) {
    const photo = (observation.photos || []).find((item) =>
      REUSABLE_LICENSES.has(item.license_code?.toLocaleLowerCase()) &&
      /^https:\/\//.test(item.url || "")
    );
    if (!photo) continue;
    return {
      url: photo.url.replace(/\/square\.(jpe?g|png|webp)$/i, "/large.$1"),
      source: `https://www.inaturalist.org/observations/${observation.id}`,
      credit: photo.attribution || "iNaturalist contributor",
      license: photo.license_code.toUpperCase(),
      provider: "iNaturalist research-grade observation"
    };
  }
  return null;
}
