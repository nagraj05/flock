"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Bird = {
  id: string;
  name: string;
  scientific: string;
  order: string;
  family: string;
  region: string;
  path: string;
  score: number | null;
  quality: boolean;
};

type BirdData = { count: number; species: Bird[] };

const RAW_BASE = "https://raw.githubusercontent.com/alchaincyf/huashu-bird-sticker/main";
const PAGE_SIZE = 48;
const colors = ["orange", "cyan", "pink", "yellow", "purple"];

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const needle = query.trim().toLocaleLowerCase();
  const index = text.toLocaleLowerCase().indexOf(needle);
  if (!needle || index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

export default function BirdsClient() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [selectedBirdId, setSelectedBirdId] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [order, setOrder] = useState("All orders");
  const [qualityOnly, setQualityOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    fetch("/data/birds-index.json")
      .then((response) => {
        if (!response.ok) throw new Error("Bird data failed to load");
        return response.json() as Promise<BirdData>;
      })
      .then((data) => {
        if (!active) return;
        setBirds(data.species);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, []);

  const orders = useMemo(
    () => ["All orders", ...Array.from(new Set(birds.map((bird) => bird.order))).sort()],
    [birds],
  );

  const deferredSearchInput = useDeferredValue(searchInput);
  const suggestions = useMemo(() => {
    const needle = deferredSearchInput.toLocaleLowerCase().trim();
    if (needle.length < 2) return [];
    return birds
      .filter((bird) => `${bird.name} ${bird.scientific} ${bird.family}`.toLocaleLowerCase().includes(needle))
      .sort((a, b) => {
        const rank = (bird: Bird) => {
          const name = bird.name.toLocaleLowerCase();
          const scientific = bird.scientific.toLocaleLowerCase();
          if (name.startsWith(needle)) return 0;
          if (scientific.startsWith(needle)) return 1;
          if (name.includes(needle)) return 2;
          if (scientific.includes(needle)) return 3;
          return 4;
        };
        return rank(a) - rank(b) || a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [birds, deferredSearchInput]);

  const filtered = useMemo(() => {
    const needle = query.toLocaleLowerCase().trim();
    return birds.filter((bird) => {
      const matchesOrder = order === "All orders" || bird.order === order;
      const matchesQuality = !qualityOnly || bird.quality;
      const matchesSelectedBird = !selectedBirdId || bird.id === selectedBirdId;
      const haystack = `${bird.name} ${bird.scientific} ${bird.family} ${bird.order}`.toLocaleLowerCase();
      return matchesOrder && matchesQuality && matchesSelectedBird && (!needle || haystack.includes(needle));
    });
  }, [birds, order, qualityOnly, query, selectedBirdId]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateSearchInput(value: string) {
    setSearchInput(value);
    setSuggestionsOpen(Boolean(value));
    setActiveSuggestion(-1);
  }

  function selectBird(bird: Bird) {
    setSearchInput(bird.name);
    setSelectedBirdId(bird.id);
    setQuery("");
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
    setPage(1);
  }

  function applySearch() {
    setSelectedBirdId("");
    setQuery(searchInput.trim());
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
    setPage(1);
  }

  function clearSearch() {
    setSearchInput("");
    setQuery("");
    setSelectedBirdId("");
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
    setPage(1);
  }

  function updateOrder(value: string) {
    setOrder(value);
    setPage(1);
  }

  function changePage(next: number) {
    setPage(Math.min(pageCount, Math.max(1, next)));
    document.querySelector(".sticky-search-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    clearSearch();
    setOrder("All orders");
    setQualityOnly(false);
  }

  return (
    <>
      <div className="sticky-search-panel">
        <section className="birds-controls" aria-label="Bird filters">
          <form
            className="search-box"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const suggestion = suggestions[activeSuggestion];
              if (suggestion) selectBird(suggestion);
              else applySearch();
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false);
            }}
          >
            <span>SEARCH ALL BIRDS</span>
            <div className="search-control">
              <input
                value={searchInput}
                onChange={(event) => updateSearchInput(event.target.value)}
                onFocus={() => setSuggestionsOpen(Boolean(searchInput))}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setSuggestionsOpen(true);
                    setActiveSuggestion((current) => Math.min(current + 1, suggestions.length - 1));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveSuggestion((current) => Math.max(current - 1, 0));
                  }
                  if (event.key === "Escape") {
                    setSuggestionsOpen(false);
                    setActiveSuggestion(-1);
                  }
                }}
                placeholder="Try ‘macaw’, ‘Bubo’, or ‘Corvidae’"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen}
                aria-controls="bird-suggestions"
                aria-activedescendant={activeSuggestion >= 0 ? `bird-suggestion-${activeSuggestion}` : undefined}
                autoComplete="off"
              />
              {(searchInput || query || selectedBirdId) && (
                <button className="search-clear" type="button" onClick={clearSearch} aria-label="Clear bird search">×</button>
              )}
              <button className="search-submit" type="submit">Search</button>
            </div>

            {suggestionsOpen && searchInput && (
              <div className="search-suggestions" id="bird-suggestions" role="listbox">
                {suggestions.length > 0 ? suggestions.map((bird, index) => (
                  <button
                    id={`bird-suggestion-${index}`}
                    className={`suggestion-option ${activeSuggestion === index ? "active" : ""}`}
                    key={bird.id}
                    type="button"
                    role="option"
                    aria-selected={activeSuggestion === index}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectBird(bird)}
                  >
                    <span className="suggestion-name"><HighlightMatch text={bird.name} query={deferredSearchInput} /></span>
                    <i><HighlightMatch text={bird.scientific} query={deferredSearchInput} /></i>
                    <small>{bird.family} · {bird.order}</small>
                  </button>
                )) : (
                  <div className="suggestion-empty">
                    {searchInput.trim().length < 2 ? "Type one more letter…" : "No matching birds yet."}
                  </div>
                )}
                <div className="suggestion-help">Choose a bird for an exact match, or press Search for broader results.</div>
              </div>
            )}
          </form>
          <label className="select-box">
            <span>ORDER</span>
            <select value={order} onChange={(event) => updateOrder(event.target.value)} disabled={status !== "ready"}>
              {orders.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="quality-toggle">
            <input
              type="checkbox"
              checked={qualityOnly}
              onChange={(event) => { setQualityOnly(event.target.checked); setPage(1); }}
            />
            <span aria-hidden="true" />
            Quality picks only
          </label>
        </section>

        <div className="result-line" aria-live="polite">
          <span>{status === "loading" ? "COUNTING THE FLOCK…" : `${filtered.length.toLocaleString()} BIRDS FOUND`}</span>
          <span>{status === "ready" ? `PAGE ${safePage} / ${pageCount.toLocaleString()}` : "STICKER MODE: ON"}</span>
        </div>
      </div>

      {status === "loading" && (
        <div className="loading-state">
          <span>FLAP</span><span>FLAP</span><span>FLAP</span>
          <p>Opening the complete aviary…</p>
        </div>
      )}

      {status === "error" && (
        <div className="empty-state">
          <span>!</span>
          <h2>THE FLOCK FLEW OFF.</h2>
          <p>Refresh the page to try loading the bird collection again.</p>
        </div>
      )}

      {status === "ready" && visible.length > 0 && (
        <>
          <section className="bird-grid" aria-live="polite">
            {visible.map((bird, index) => (
              <Link className="bird-card-link" href={`/birds/${bird.id}`} key={bird.id}>
                <article className={`bird-card ${colors[((safePage - 1) * PAGE_SIZE + index) % colors.length]}`}>
                  <div className="bird-index">#{String((safePage - 1) * PAGE_SIZE + index + 1).padStart(5, "0")}</div>
                  <div className="bird-image-wrap">
                    {/* The full 700 MB sticker set stays upstream; only the visible page is loaded. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${RAW_BASE}/${bird.path}`}
                      alt={`Illustrated ${bird.name} sticker`}
                      loading="lazy"
                      width="620"
                      height="620"
                    />
                  </div>
                  <div className="bird-card-copy">
                    <span>{bird.order} · {bird.family}</span>
                    <h2>{bird.name}</h2>
                    <em>{bird.scientific}</em>
                    <div className="bird-meta">
                      <b>{bird.region || "Range not listed"}</b>
                      {bird.score && <b>ART SCORE {bird.score}</b>}
                      <b>VIEW DETAILS ↗</b>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </section>

          <nav className="pagination" aria-label="Bird pages">
            <button type="button" onClick={() => changePage(safePage - 1)} disabled={safePage === 1}>← Previous</button>
            <span>{safePage.toLocaleString()} / {pageCount.toLocaleString()}</span>
            <button type="button" onClick={() => changePage(safePage + 1)} disabled={safePage === pageCount}>Next →</button>
          </nav>
        </>
      )}

      {status === "ready" && visible.length === 0 && (
        <div className="empty-state" aria-live="polite">
          <span>?</span>
          <h2>NO BIRDS HERE.</h2>
          <p>Try another name, family, or order.</p>
          <button type="button" onClick={reset}>Reset the flock</button>
        </div>
      )}
    </>
  );
}
