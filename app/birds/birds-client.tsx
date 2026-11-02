"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function BirdsClient() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const needle = query.toLocaleLowerCase().trim();
    return birds.filter((bird) => {
      const matchesOrder = order === "All orders" || bird.order === order;
      const matchesQuality = !qualityOnly || bird.quality;
      const haystack = `${bird.name} ${bird.scientific} ${bird.family} ${bird.order}`.toLocaleLowerCase();
      return matchesOrder && matchesQuality && (!needle || haystack.includes(needle));
    });
  }, [birds, order, qualityOnly, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateOrder(value: string) {
    setOrder(value);
    setPage(1);
  }

  function changePage(next: number) {
    setPage(Math.min(pageCount, Math.max(1, next)));
    document.querySelector(".birds-controls")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setQuery("");
    setOrder("All orders");
    setQualityOnly(false);
    setPage(1);
  }

  return (
    <>
      <div className="sticky-search-panel">
        <section className="birds-controls" aria-label="Bird filters">
          <label className="search-box">
            <span>SEARCH ALL BIRDS</span>
            <input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Try ‘macaw’, ‘Bubo’, or ‘Corvidae’"
            />
            <b aria-hidden="true">⌕</b>
          </label>
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
