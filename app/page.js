"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BIRDS,
  CONTINENTS,
  COUNTRIES,
  LOCATIONS,
  WORLD_SPECIES_COUNT
} from "../lib/data";
import { pathToRoute, routeToPath } from "../lib/routes";

const Icon = ({ children, size = 20 }) => (
  <span className="icon" style={{ width: size, height: size }} aria-hidden="true">{children}</span>
);

function normalizeBirdLabel(value = "") {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function uniqueBirds(list) {
  const result = [];
  const scientificNames = new Map();
  const commonNames = new Map();
  for (const bird of list) {
    const name = normalizeBirdLabel(bird.name);
    const scientific = normalizeBirdLabel(bird.scientific);
    if (scientific && scientificNames.has(scientific)) continue;
    const sameNameIndex = name ? commonNames.get(name) : undefined;
    if (sameNameIndex !== undefined) {
      const existing = result[sameNameIndex];
      if (bird.catalogVerified && existing.catalogVerified) {
        // Current authoritative checklists can occasionally retain identical
        // English names for genuinely distinct species concepts.
      } else if (bird.catalogVerified && !existing.catalogVerified) {
        const oldScientific = normalizeBirdLabel(existing.scientific);
        if (oldScientific) scientificNames.delete(oldScientific);
        result[sameNameIndex] = bird;
        if (scientific) scientificNames.set(scientific, sameNameIndex);
        continue;
      } else {
        continue;
      }
    }
    const index = result.length;
    result.push(bird);
    if (scientific) scientificNames.set(scientific, index);
    if (name && !commonNames.has(name)) commonNames.set(name, index);
  }
  return result;
}

function Logo({ onClick }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Open journal and bird research">
      <img src="/birdtrack-logo.png" alt="BirdTrack" />
    </button>
  );
}

function Header({ seenCount, onSeen, onLogo, onSearch, search }) {
  return (
    <header>
      <button className="world-count" onClick={onSeen} aria-label={`Open your life list: ${seenCount} birds seen`}>
        <span className="count-icon">✓</span>
        <div><strong>{seenCount.toLocaleString()} / {WORLD_SPECIES_COUNT.toLocaleString()}</strong><small>birds spotted</small></div>
      </button>
      <label className="search">
        <span>⌕</span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search birds or places..."
          aria-label="Search birds or places"
        />
      </label>
      <Logo onClick={onLogo} />
    </header>
  );
}

function Home({ navigate, seenCount, search, setSearch, onWorkspace }) {
  const [catalogBirds, setCatalogBirds] = useState([]);
  const [searchingBirds, setSearchingBirds] = useState(false);
  const [extremelyRareBirds, setExtremelyRareBirds] = useState([]);
  const [rareTotal, setRareTotal] = useState(0);
  const [rareNextOffset, setRareNextOffset] = useState(0);
  const [loadingRare, setLoadingRare] = useState(true);
  const loadExtremelyRare = async (offset = 0) => {
    setLoadingRare(true);
    try {
      const response = await fetch(`/api/birds?rare=true&offset=${offset}&limit=12`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setExtremelyRareBirds((current) => uniqueBirds(offset === 0 ? data.birds : [...current, ...data.birds]));
      setRareTotal(data.total);
      setRareNextOffset(data.nextOffset);
    } catch {
      if (offset === 0) setExtremelyRareBirds([]);
    } finally {
      setLoadingRare(false);
    }
  };
  useEffect(() => { loadExtremelyRare(0); }, []);
  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      setCatalogBirds([]);
      setSearchingBirds(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchingBirds(true);
      try {
        const response = await fetch(`/api/birds?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = await response.json();
        if (response.ok) setCatalogBirds(data.birds || []);
      } catch (error) {
        if (error.name !== "AbortError") setCatalogBirds([]);
      } finally {
        if (!controller.signal.aborted) setSearchingBirds(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [search]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const localBirds = BIRDS.filter((bird) => `${bird.name} ${bird.scientific}`.toLowerCase().includes(q));
    const allBirds = uniqueBirds([...localBirds, ...catalogBirds]);
    const birds = allBirds
      .map((b) => ({ type: "bird", title: b.name, subtitle: b.scientific, value: b.id }));
    const places = Object.values(LOCATIONS).flatMap((l) => l.regions)
      .filter((p) => p.toLowerCase().includes(q))
      .map((p) => ({ type: "place", title: p, subtitle: "Place", value: p }));
    return [...birds, ...places].slice(0, 8);
  }, [search, catalogBirds]);

  return (
    <main className="page home-page">
      <Header seenCount={seenCount} onSeen={() => navigate({ view: "life-list" })} onLogo={onWorkspace} onSearch={setSearch} search={search} />
      {search && (
        <section className="search-results card">
          <p className="eyebrow">Search results</p>
          {results.length ? results.map((r) => (
            <button key={`${r.type}-${r.value}`} onClick={() => r.type === "bird" ? navigate({ view: "bird", birdId: r.value, back: { view: "home", restoreScroll: window.scrollY } }) : setSearch("")}>
              <span>{r.type === "bird" ? "🐦" : "⌖"}</span><div><b>{r.title}</b><small>{r.subtitle}</small></div><em>→</em>
            </button>
          )) : <p className="muted">{searchingBirds ? "Searching the complete bird catalog…" : "No birds or places found."}</p>}
        </section>
      )}
      <section className="hero">
        <div>
          <p className="eyebrow">YOUR BIRDWATCHING WORLD</p>
          <h1>Where did your<br/><em>curiosity</em> take you?</h1>
          <p className="hero-copy">Choose a continent to explore its birds, mark the ones you’ve seen, and grow your life list.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="sun" />
          <span className="branch">⌁</span>
          <span className="hero-bird">◖</span>
          <span className="leaf l1">◒</span><span className="leaf l2">◒</span><span className="leaf l3">◒</span>
        </div>
      </section>
      <section className="explore">
        <div className="section-title"><div><p className="eyebrow">EXPLORE BY PLACE</p><h2>Choose a continent</h2></div><span>7 regions to discover</span></div>
        <div className="continent-grid">
          {CONTINENTS.map((c, i) => (
            <button className="continent-card" key={c.name} onClick={() => navigate({ view: "continent", continent: c.name })}>
              <span className={`continent-shape shape-${i}`}>{c.symbol}</span>
              <div><h3>{c.name}</h3><p>{c.blurb}</p></div><b>→</b>
            </button>
          ))}
        </div>
      </section>
      <section className="extremely-rare-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">WORLDWIDE RECORD WATCH</p>
            <h2>Extremely Rare</h2>
            <p>Living species classified as Critically Endangered in the October 2025 BirdLife/IUCN assessment, using AviList’s official English names and taxonomy.</p>
          </div>
          <span>{rareTotal ? `${rareTotal} species` : "Checking records…"}</span>
        </div>
        <div className="rare-bird-grid">
          {extremelyRareBirds.map((bird) => (
            <button
              key={bird.id}
              className="rare-bird-card"
              data-restore-bird={bird.id}
              onClick={(event) => navigate({
                view: "bird",
                birdId: bird.id,
                bird,
                back: {
                  view: "home",
                  restoreScroll: window.scrollY,
                  restoreBird: bird.id,
                  restoreViewportTop: event.currentTarget.getBoundingClientRect().top
                }
              })}
            >
              <span className="rare-bird-photo">
                <img src={`/api/birds/${bird.gbifKey}/image?scientific=${encodeURIComponent(bird.scientific)}`} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              </span>
              <span><b>{bird.name}</b><i>{bird.scientific}</i><small>Critically Endangered · verified living species</small></span>
              <em>→</em>
            </button>
          ))}
        </div>
        {loadingRare && <div className="loading-birds"><span /><p>Checking extremely rare species…</p></div>}
        {!loadingRare && rareNextOffset !== null && extremelyRareBirds.length > 0 && (
          <button className="load-more" onClick={() => loadExtremelyRare(rareNextOffset)}>
            Show more extremely rare birds <small>{extremelyRareBirds.length} of {rareTotal} shown</small>
          </button>
        )}
      </section>
    </main>
  );
}

function Continent({ continent, navigate }) {
  const list = COUNTRIES[continent] || [];
  return (
    <main className="inner-page">
      <NavBar onBack={() => navigate({ view: "home" })} title={continent} />
      <section className="inner-hero">
        <p className="eyebrow">EXPLORE {continent.toUpperCase()}</p>
        <h1>Choose a country</h1>
        <p>Select a country to browse its states, regions, cities, and recorded bird species.</p>
      </section>
      <section className="country-list card">
        {list.map((country) => (
          <button key={country} onClick={() => navigate({ view: "area", continent, country })}>
            <span className="round-flag">⌖</span><b>{country}</b><span>Explore birds&nbsp; →</span>
          </button>
        ))}
      </section>
    </main>
  );
}

function NavBar({ onBack, title, onHome }) {
  return (
    <nav className="nav-bar">
      <button className="back-btn" onClick={onBack}>← <span>Back</span></button>
      <strong>{title}</strong>
      <div className="nav-actions"><button className="home-btn" onClick={onHome || onBack} aria-label="Home">⌂</button></div>
    </nav>
  );
}

function Area({ continent, country, navigate, sightings, requestToggle }) {
  const location = LOCATIONS[country] || { regions: ["All areas"], birds: BIRDS.map((b) => b.id) };
  const [place, setPlace] = useState("All areas");
  const [showPlaces, setShowPlaces] = useState(true);
  const [sort, setSort] = useState("common");
  const [liveBirds, setLiveBirds] = useState([]);
  const [liveTotal, setLiveTotal] = useState(null);
  const [nextOffset, setNextOffset] = useState(0);
  const [loadingBirds, setLoadingBirds] = useState(true);
  const [dataError, setDataError] = useState("");
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [searchBirds, setSearchBirds] = useState([]);
  const [searchingSpecies, setSearchingSpecies] = useState(false);
  const rarityOrder = { Common: 0, Uncommon: 1, Rare: 2 };
  const starterBirds = location.birds.map((id) => BIRDS.find((b) => b.id === id)).filter(Boolean);
  const sourceBirds = liveBirds.length ? liveBirds : starterBirds;
  const birds = [...sourceBirds]
    .sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "za" ? b.name.localeCompare(a.name) :
      sort === "rare" ? rarityOrder[b.rarity] - rarityOrder[a.rarity] : rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  const loadBirds = async (offset = 0) => {
    setLoadingBirds(true); setDataError("");
    try {
      const response = await fetch(`/api/birds?country=${encodeURIComponent(country)}&offset=${offset}&limit=80`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLiveBirds((current) => uniqueBirds(offset === 0 ? data.birds : [...current, ...data.birds]));
      setLiveTotal(data.total); setNextOffset(data.nextOffset);
    } catch (error) { setDataError(error.message || "Live bird data could not be loaded."); }
    finally { setLoadingBirds(false); }
  };

  useEffect(() => { setLiveBirds([]); setLiveTotal(null); setNextOffset(0); loadBirds(0); }, [country]);
  useEffect(() => {
    if (!loadingBirds && !dataError && nextOffset !== null && liveBirds.length > 0) loadBirds(nextOffset);
  }, [loadingBirds, dataError, nextOffset, liveBirds.length]);
  useEffect(() => {
    if (!loadingBirds && !dataError && nextOffset === null && liveBirds.length > 0) {
      setLiveTotal(liveBirds.length);
    }
  }, [loadingBirds, dataError, nextOffset, liveBirds.length]);
  useEffect(() => {
    const query = speciesSearch.trim();
    if (query.length < 2) {
      setSearchBirds([]);
      setSearchingSpecies(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchingSpecies(true);
      try {
        const response = await fetch(`/api/birds?country=${encodeURIComponent(country)}&q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (response.ok) setSearchBirds(uniqueBirds(data.birds || []));
      } catch (error) {
        if (error.name !== "AbortError") setSearchBirds([]);
      } finally {
        if (!controller.signal.aborted) setSearchingSpecies(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [speciesSearch, country]);

  const shownBirds = speciesSearch.trim().length >= 2 ? searchBirds : birds;

  return (
    <main className="inner-page area-page">
      <NavBar onBack={() => navigate({ view: "continent", continent })} onHome={() => navigate({ view: "home" })} title={`${continent}  ›  ${country}`} />
      <section className="area-head">
        <div><p className="eyebrow">BIRDS OF</p><h1>{place === "All areas" ? country : place}</h1><p>Species documented at least 10 times in the past 10 years.</p></div>
        <span className="species-total"><b>{liveTotal ?? birds.length}</b> species</span>
      </section>
      <section className="place-picker card">
        <button className="place-toggle" onClick={() => setShowPlaces(!showPlaces)}>
          <span>⌖</span><div><small>SELECTED AREA</small><b>{place === "All areas" ? `All of ${country}` : place}</b></div><em>{showPlaces ? "Hide places ↑" : "Show places ↓"}</em>
        </button>
        {showPlaces && <div className="place-chips">
          {["All areas", ...location.regions].map((p) => <button key={p} className={place === p ? "active" : ""} onClick={() => setPlace(p)}>{p === "All areas" ? `All of ${country}` : p}</button>)}
        </div>}
      </section>
      <div className="list-tools">
        <div><p className="eyebrow">SPECIES LIST</p><h2>Birds seen in this area</h2></div>
        <div className="species-list-controls">
          <label className="species-search"><span>⌕</span><input value={speciesSearch} onChange={(event) => setSpeciesSearch(event.target.value)} placeholder={`Search every bird in ${country}…`} aria-label={`Search birds recorded in ${country}`} /></label>
          <label>Sort by <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="common">Common ↑</option><option value="rare">Rare ↑</option><option value="az">A–Z</option><option value="za">Z–A</option></select></label>
        </div>
      </div>
      <section className="bird-list">
        {shownBirds.map((bird) => <BirdRow key={bird.id} bird={bird} seen={!!sightings[bird.id]} onOpen={() => navigate({ view: "bird", birdId: bird.id, bird, back: { view: "area", continent, country, restoreScroll: window.scrollY } })} onToggle={() => requestToggle(bird)} />)}
      </section>
      {searchingSpecies && <div className="loading-birds"><span /><p>Checking every species recorded in {country}…</p></div>}
      {!searchingSpecies && speciesSearch.trim().length >= 2 && searchBirds.length === 0 && <div className="data-warning">No qualifying bird found for “{speciesSearch.trim()}” in {country}.</div>}
      {loadingBirds && liveBirds.length === 0 && <div className="loading-birds"><span /><p>Finding every qualifying bird recorded in {country}…</p></div>}
      {dataError && <div className="data-warning">{dataError} Showing the offline starter list. <button onClick={() => loadBirds(0)}>Try again</button></div>}
      {loadingBirds && liveBirds.length > 0 && <div className="loading-birds"><span /><p>Loading all species… {liveBirds.length} of {liveTotal ?? "many"} shown</p></div>}
      <p className="data-note">Source: GBIF occurrence records • Includes species with 10+ valid records during the rolling previous 10 years • Updated every 12 hours.</p>
    </main>
  );
}

function BirdRow({ bird, seen, onOpen, onToggle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnail = bird.image || (bird.gbifKey ? `/api/birds/${bird.gbifKey}/image?scientific=${encodeURIComponent(bird.scientific)}` : "");
  return (
    <article className="bird-row">
      <button className="bird-main" onClick={onOpen}>
        <span className="bird-avatar">
          {thumbnail && !imageFailed
            ? <img src={thumbnail} alt="" loading="lazy" onError={() => setImageFailed(true)} />
            : <span className="bird-photo-fallback">🐦</span>}
        </span>
        <div><h3>{bird.name}</h3><i>{bird.scientific}</i><p><span className={`rarity ${bird.rarity.toLowerCase()}`}>{bird.rarity}</span>{bird.endangered && <span className="endangered">Endangered</span>}</p></div>
      </button>
      <button className={`status ${seen ? "seen" : "unseen"}`} onClick={onToggle} aria-label={`Mark ${bird.name} ${seen ? "unseen" : "seen"}`}>{seen ? "✓" : "×"}<small>{seen ? "Seen" : "Not seen"}</small></button>
      <button className="row-arrow" onClick={onOpen} aria-label={`Open ${bird.name}`}>›</button>
    </article>
  );
}

function LifeList({ navigate, sightings, seenBirds, requestToggle }) {
  const seenIds = Object.keys(sightings).filter((id) => sightings[id]);
  const [restoredBirds, setRestoredBirds] = useState({});
  useEffect(() => {
    const missingKeys = seenIds
      .filter((id) => !seenBirds[id] && !BIRDS.some((bird) => bird.id === id))
      .map((id) => [id, id.match(/^gbif-(\d+)$/)?.[1]])
      .filter(([, key]) => key);
    if (!missingKeys.length) return;
    let active = true;
    Promise.all(missingKeys.map(async ([id, key]) => {
      const response = await fetch(`/api/birds/${key}`);
      if (!response.ok) return null;
      const data = await response.json();
      return [id, { id, gbifKey: Number(key), name: data.name, scientific: data.scientific, rarity: "Recorded", ...data }];
    })).then((entries) => {
      if (active) setRestoredBirds(Object.fromEntries(entries.filter(Boolean)));
    }).catch(() => {});
    return () => { active = false; };
  }, [seenIds.join("|")]);
  const resolvedBirds = seenIds
    .map((id) => seenBirds[id] || BIRDS.find((bird) => bird.id === id) || restoredBirds[id])
    .filter(Boolean);
  const birds = uniqueBirds(resolvedBirds)
    .sort((a, b) => a.name.localeCompare(b.name));
  const unresolved = seenIds.length - resolvedBirds.length;
  return (
    <main className="inner-page life-list-page">
      <NavBar onBack={() => navigate({ view: "home" })} onHome={() => navigate({ view: "home" })} title="My life list" />
      <section className="inner-hero">
        <p className="eyebrow">BIRDS YOU’VE SEEN</p>
        <h1>Your life list</h1>
        <p>{seenIds.length ? `${seenIds.length.toLocaleString()} of ${WORLD_SPECIES_COUNT.toLocaleString()} living bird species marked as seen.` : "Birds you mark as seen will appear here."}</p>
      </section>
      <section className="bird-list">
        {birds.map((bird) => (
          <BirdRow
            key={bird.id}
            bird={bird}
            seen
            onOpen={() => navigate({ view: "bird", birdId: bird.id, bird, back: { view: "life-list", restoreScroll: window.scrollY } })}
            onToggle={() => requestToggle(bird)}
          />
        ))}
      </section>
      {!birds.length && <section className="card empty-life-list"><span>🪶</span><h2>Your list is ready to grow</h2><p>Explore a place or search for a living species, then press the check mark to add it.</p><button onClick={() => navigate({ view: "home" })}>Explore birds</button></section>}
      {unresolved > 0 && <p className="data-note">{unresolved} older saved {unresolved === 1 ? "entry is" : "entries are"} missing profile details. Open and mark those birds again to restore them.</p>}
    </main>
  );
}

function BirdDetail({ bird, seen, navigate, back, requestToggle }) {
  const [profile, setProfile] = useState(bird);
  const [profileLoading, setProfileLoading] = useState(!!bird?.gbifKey);
  useEffect(() => {
    setProfile(bird);
    if (!bird?.gbifKey) { setProfileLoading(false); return; }
    let active = true;
    setProfileLoading(true);
    fetch(`/api/birds/${bird.gbifKey}?scientific=${encodeURIComponent(bird.scientific)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((details) => {
        if (!active) return;
        setProfile({
          ...bird, ...details,
          name: bird.name,
          rarity: bird.rarity,
          endangered: bird.endangered,
          sightings: bird.sightings,
          source: details.imageSource || bird.source,
          description: details.description?.filter(Boolean).length ? details.description.filter(Boolean) : bird.description
        });
      })
      .catch(() => {})
      .finally(() => active && setProfileLoading(false));
    return () => { active = false; };
  }, [bird?.id]);
  if (!bird) return null;
  const shownBird = profile || bird;
  return (
    <main className="detail-page">
      <NavBar onBack={() => navigate(back || { view: "home" })} onHome={() => navigate({ view: "home" })} title="Species profile" />
      <section className="bird-detail-grid">
        <div className="bird-photo">
          {shownBird.image ? <img src={shownBird.image} alt={shownBird.name} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling.style.display = "grid"; }} /> : null}
          <div className="image-fallback" style={!shownBird.image ? { display: "grid" } : undefined}>{profileLoading ? "Finding a reusable photograph…" : "Image unavailable"}</div>
          <a href={shownBird.source} target="_blank" rel="noreferrer">{shownBird.imageCredit ? `${shownBird.imageCredit} · ${shownBird.imageLicense}` : shownBird.image ? "Image source & license · Wikimedia Commons" : "View species record · GBIF"} ↗</a>
        </div>
        <div className="bird-copy">
          <p className="eyebrow">SPECIES PROFILE</p>
          <h1>{shownBird.name}</h1><i className="scientific">{shownBird.scientific}</i>
          <div className="badges"><span className={`rarity ${shownBird.rarity.toLowerCase().replaceAll(" ", "-")}`}>{shownBird.rarity === "Extremely Rare" ? `${shownBird.rarity} worldwide` : `${shownBird.rarity} locally`}{shownBird.sightings ? ` · ${shownBird.sightings.toLocaleString()} records` : ""}</span>{shownBird.endangered && <span className="endangered">Endangered</span>}</div>
          <p>{shownBird.description[0]}</p><p>{shownBird.description[1]}</p>
          {profileLoading && <p className="profile-loading">Updating this profile from live species sources…</p>}
          <div className="quick-facts">
            <div><small>SIZE</small><b>{shownBird.size}</b></div><div><small>DIET</small><b>{shownBird.diet}</b></div><div><small>BEHAVIOR</small><b>{shownBird.behavior}</b></div>
          </div>
          <div className="seen-panel">
            <div><p className="eyebrow">YOUR LIFE LIST</p><h3>{seen ? "You’ve seen this bird!" : "Have you seen this bird?"}</h3></div>
            <div className="big-actions">
              <button className="big-check" onClick={() => !seen && requestToggle(bird)} disabled={seen}>✓<small>{seen ? "Seen" : "Mark seen"}</small></button>
              {seen && <button className="big-x" onClick={() => requestToggle(bird)}>×<small>Not seen</small></button>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Workspace({ navigate, initialTab = "journal" }) {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);
  const changeTab = (nextTab) => {
    setTab(nextTab);
    window.history.pushState({}, "", routeToPath({ view: "workspace", tab: nextTab }));
  };
  const [docs, setDocs] = useStoredState("birdtrack-docs", []);
  const [activeDoc, setActiveDoc] = useState(null);
  const createDoc = () => {
    const doc = { id: Date.now(), title: "Untitled bird story", body: "", updated: Date.now() };
    setDocs([doc, ...docs]); setActiveDoc(doc.id);
  };
  const updateDoc = (patch) => setDocs(docs.map((d) => d.id === activeDoc ? { ...d, ...patch, updated: Date.now() } : d));
  const current = docs.find((d) => d.id === activeDoc);
  return (
    <main className="workspace-page">
      <NavBar onBack={() => navigate({ view: "home" })} onHome={() => navigate({ view: "home" })} title="My BirdTrack" />
      <section className="workspace-head"><div><p className="eyebrow">YOUR PRIVATE SPACE</p><h1>Stories &amp; discoveries</h1></div><div className="tabs"><button className={tab === "journal" ? "active" : ""} onClick={() => changeTab("journal")}>Journal</button><button className={tab === "research" ? "active" : ""} onClick={() => changeTab("research")}>Bird Research</button></div></section>
      {tab === "journal" ? current ? (
        <JournalEditor
          doc={current}
          onChange={updateDoc}
          onClose={() => setActiveDoc(null)}
          onDelete={() => {
            if (!window.confirm(`Delete “${current.title || "Untitled"}”? This cannot be undone.`)) return;
            setDocs(docs.filter((document) => document.id !== current.id));
            setActiveDoc(null);
          }}
        />
      ) : (
        <section className="doc-grid">
          <button className="new-doc" onClick={createDoc}><b>＋</b><span>New bird story</span></button>
          {[...docs].sort((a,b) => b.updated-a.updated).map((d) => <button className="doc-card" key={d.id} onClick={() => setActiveDoc(d.id)}><span>🪶</span><div><h3>{d.title || "Untitled"}</h3><p>{stripHtml(d.body).slice(0, 90) || "Start writing your story..."}</p><small>Edited {relativeDate(d.updated)}</small></div></button>)}
        </section>
      ) : <Research />}
    </main>
  );
}

function JournalEditor({ doc, onChange, onClose, onDelete }) {
  const command = (name, value) => { document.execCommand(name, false, value); };
  return (
    <section className="editor-wrap">
      <div className="editor-top">
        <button onClick={onClose}>← All documents</button>
        <div><span>Saved privately on this device</span><button className="delete-doc" onClick={onDelete}>Delete document</button></div>
      </div>
      <input className="doc-title" value={doc.title} onChange={(e) => onChange({ title: e.target.value })} aria-label="Document title" />
      <div className="toolbar">
        <button onClick={() => command("bold")}><b>B</b></button><button onClick={() => command("italic")}><i>I</i></button>
        <button onClick={() => command("formatBlock", "h2")}>Heading</button><button onClick={() => command("insertUnorderedList")}>• List</button>
        <label>Highlight <input type="color" defaultValue="#ffe3a3" onChange={(e) => command("hiliteColor", e.target.value)} /></label>
      </div>
      <div className="paper" contentEditable suppressContentEditableWarning onInput={(e) => onChange({ body: e.currentTarget.innerHTML })} dangerouslySetInnerHTML={{ __html: doc.body }} />
    </section>
  );
}

function Research() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useStoredState("birdtrack-saved-research", []);
  const ask = async (e) => {
    e.preventDefault(); if (!question.trim()) return;
    const q = question.trim(); setQuestion(""); setLoading(true);
    try {
      const res = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) });
      const data = await res.json();
      setMessages((m) => [{ id: Date.now(), q, ...data }, ...m].slice(0, 2));
    } catch {
      setMessages((m) => [{ id: Date.now(), q, answer: "I couldn’t reach the research service. Please try again.", sources: [] }, ...m].slice(0, 2));
    } finally { setLoading(false); }
  };
  return (
    <section className="research">
      <div className="research-intro"><span>✦</span><h2>Ask about birds</h2><p>Get simple, sourced answers to bird-related questions.</p></div>
      <form onSubmit={ask}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Why do flamingos turn pink?" /><button disabled={loading}>{loading ? "Thinking…" : "Ask →"}</button></form>
      <div className="suggestions">{["How do birds migrate?", "What do owls eat?", "Why do birds sing?"].map((q) => <button onClick={() => setQuestion(q)} key={q}>{q}</button>)}</div>
      <div className="answers">{messages.map((m) => <article key={m.id}><p className="question">You asked: {m.q}</p><h3>BirdTrack says</h3><p>{m.answer}</p>{m.sources?.length > 0 && <div className="sources">{m.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>)}</div>}<button className="save-chat" disabled={saved.some((s) => s.id === m.id)} onClick={() => setSaved([...saved, m])}>♡ {saved.some((s) => s.id === m.id) ? "Saved" : "Save chat"}</button></article>)}</div>
    </section>
  );
}

function Confirm({ bird, seen, onCancel, onConfirm }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true"><span className={seen ? "modal-x" : "modal-check"}>{seen ? "×" : "✓"}</span><h2>{seen ? "Mark as not seen?" : "Add to your life list?"}</h2><p>{seen ? `Remove ${bird.name} from the birds you’ve seen?` : `Confirm that you’ve seen a ${bird.name}.`}</p><div><button className="cancel" onClick={onCancel}>Cancel</button><button className="confirm" onClick={onConfirm}>{seen ? "Mark not seen" : "Yes, I’ve seen it!"}</button></div></div></div>;
}

function useStoredState(key, initial) {
  const [value, setValue] = useState(initial);
  useEffect(() => { try { const saved = localStorage.getItem(key); if (saved) setValue(JSON.parse(saved)); } catch {} }, [key]);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}
const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ");
const relativeDate = (date) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);

function DirectBird({ route, navigate, sightings, requestToggle }) {
  const [bird, setBird] = useState(route.bird || BIRDS.find((item) => item.id === route.birdId));
  const [error, setError] = useState("");
  useEffect(() => {
    setBird(route.bird || BIRDS.find((item) => item.id === route.birdId));
    setError("");
    const key = route.birdId?.match(/^gbif-(\d+)$/)?.[1];
    if (!key || route.bird) return;
    fetch(`/api/birds/${key}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setBird({
        id: route.birdId,
        gbifKey: Number(key),
        name: data.name,
        scientific: data.scientific,
        rarity: "Recorded",
        emoji: "🐦",
        size: data.size,
        diet: data.diet,
        behavior: data.behavior,
        image: data.image,
        source: data.imageSource || data.articleSource,
        imageCredit: data.imageCredit,
        imageLicense: data.imageLicense,
        description: data.description || ["This bird has verified occurrence records.", "Open the source for more information."]
      }))
      .catch(() => setError("This bird profile could not be loaded."));
  }, [route.birdId, route.bird]);

  if (error) return <main className="inner-page route-message"><h1>Bird unavailable</h1><p>{error}</p><button onClick={() => navigate({ view: "home" })}>Return home</button></main>;
  if (!bird) return <main className="inner-page route-message"><div className="loading-birds"><span /><p>Loading bird profile…</p></div></main>;
  return <BirdDetail bird={bird} seen={!!sightings[route.birdId]} navigate={navigate} back={route.back} requestToggle={requestToggle} />;
}

function RouteNotFound({ navigate }) {
  return <main className="inner-page route-message"><p className="eyebrow">404</p><h1>That page flew away.</h1><p>The BirdTrack page you requested could not be found.</p><button onClick={() => navigate({ view: "home" })}>Return home</button></main>;
}

export default function App() {
  const [route, setRoute] = useState({ view: "home" });
  const [search, setSearch] = useState("");
  const [sightings, setSightings] = useStoredState("birdtrack-sightings", {});
  const [seenBirds, setSeenBirds] = useStoredState("birdtrack-seen-birds", {});
  const [confirmBird, setConfirmBird] = useState(null);
  useEffect(() => {
    const syncRoute = () => setRoute(pathToRoute(window.location.pathname));
    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);
  const navigate = (next) => {
    window.history.pushState({}, "", routeToPath(next));
    setRoute(next);
    setSearch("");
    const target = Number.isFinite(next.restoreScroll) ? next.restoreScroll : 0;
    const restorePosition = () => {
      const escapedBird = next.restoreBird && window.CSS?.escape ? window.CSS.escape(next.restoreBird) : next.restoreBird;
      const bird = escapedBird ? document.querySelector(`[data-restore-bird="${escapedBird}"]`) : null;
      if (bird && Number.isFinite(next.restoreViewportTop)) {
        const adjustment = bird.getBoundingClientRect().top - next.restoreViewportTop;
        window.scrollBy({ top: adjustment, behavior: "auto" });
      } else {
        window.scrollTo({ top: target, behavior: "auto" });
      }
    };
    window.requestAnimationFrame(() => window.requestAnimationFrame(restorePosition));
    if (next.restoreBird) {
      window.setTimeout(restorePosition, 150);
      window.setTimeout(restorePosition, 500);
    }
  };
  const toggle = () => {
    const willBeSeen = !sightings[confirmBird.id];
    setSightings({ ...sightings, [confirmBird.id]: willBeSeen });
    if (willBeSeen) setSeenBirds({ ...seenBirds, [confirmBird.id]: confirmBird });
    setConfirmBird(null);
  };
  const seenCount = Object.values(sightings).filter(Boolean).length;
  const preservedArea = route.view === "area"
    ? route
    : route.view === "bird" && route.back?.view === "area"
      ? route.back
      : null;
  return <>
    <div hidden={route.view !== "home"}>
      <Home navigate={navigate} seenCount={seenCount} search={search} setSearch={setSearch} onWorkspace={() => navigate({ view: "workspace", tab: "journal" })} />
    </div>
    {route.view === "continent" && <Continent continent={route.continent} navigate={navigate} />}
    {preservedArea && (
      <div hidden={route.view !== "area"}>
        <Area {...preservedArea} navigate={navigate} sightings={sightings} requestToggle={setConfirmBird} />
      </div>
    )}
    {route.view === "bird" && <DirectBird route={route} sightings={sightings} navigate={navigate} requestToggle={setConfirmBird} />}
    {route.view === "life-list" && <LifeList navigate={navigate} sightings={sightings} seenBirds={seenBirds} requestToggle={setConfirmBird} />}
    {route.view === "workspace" && <Workspace navigate={navigate} initialTab={route.tab} />}
    {route.view === "not-found" && <RouteNotFound navigate={navigate} />}
    {confirmBird && <Confirm bird={confirmBird} seen={!!sightings[confirmBird.id]} onCancel={() => setConfirmBird(null)} onConfirm={toggle} />}
  </>;
}
