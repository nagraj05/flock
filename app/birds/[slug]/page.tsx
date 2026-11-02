import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  describeConservation,
  describeRegion,
  getBirdById,
  getBirdNeighbors,
} from "@/lib/birds";

const RAW_BASE = "https://raw.githubusercontent.com/alchaincyf/huashu-bird-sticker/main";

const languageLabels: Record<string, string> = {
  en: "English",
  "zh-Hans": "Chinese",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
  de: "German",
};

export function generateStaticParams() {
  return [{ slug: "Struthio_camelus" }];
}

export async function generateMetadata({ params }: PageProps<"/birds/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const bird = getBirdById(slug);
  if (!bird) return { title: "Bird not found — FLOCK!" };
  return {
    title: `${bird.name} — FLOCK!`,
    description: `Meet the ${bird.name} (${bird.scientific}): range, habitat, measurements, conservation status, and more.`,
  };
}

function Measurement({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return (
    <div className="measurement">
      <span>{label}</span>
      <strong>{value == null ? "—" : value.toLocaleString()}</strong>
      <small>{value == null ? "NO DATA" : unit}</small>
    </div>
  );
}

function BirdDetailLoading() {
  return (
    <main className="bird-detail-page">
      <nav className="site-nav detail-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Flock home">
          <span>FLOCK!</span>
          <span className="brand-dot" aria-hidden="true" />
        </Link>
        <Link className="back-link" href="/birds">← All birds</Link>
      </nav>
      <section className="detail-loading" aria-live="polite">
        <span>OPENING BIRD FILE…</span>
        <h1>FLAP.<br />FLAP.<br />FLAP.</h1>
      </section>
    </main>
  );
}

export default function BirdDetailPage(props: PageProps<"/birds/[slug]">) {
  return (
    <Suspense fallback={<BirdDetailLoading />}>
      <BirdDetailContent {...props} />
    </Suspense>
  );
}

async function BirdDetailContent({ params }: PageProps<"/birds/[slug]">) {
  const { slug } = await params;
  const bird = getBirdById(slug);
  if (!bird) notFound();

  const { previous, next } = getBirdNeighbors(bird.id);
  const names = Object.entries(bird.names ?? {}).filter((entry): entry is [string, string] => Boolean(entry[1]));
  const externalLinks = [
    bird.ids?.ebird && { label: "eBird", href: `https://ebird.org/species/${bird.ids.ebird}` },
    bird.ids?.inaturalist && { label: "iNaturalist", href: `https://www.inaturalist.org/taxa/${bird.ids.inaturalist}` },
    bird.ids?.gbif && { label: "GBIF", href: `https://www.gbif.org/species/${bird.ids.gbif}` },
    bird.ids?.wikidata && { label: "Wikidata", href: `https://www.wikidata.org/wiki/${bird.ids.wikidata}` },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <main className="bird-detail-page">
      <nav className="site-nav detail-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Flock home">
          <span>FLOCK!</span>
          <span className="brand-dot" aria-hidden="true" />
        </Link>
        <Link className="back-link" href="/birds">
          ← All birds
        </Link>
      </nav>

      <div className="detail-kicker">
        <span>BIRD FILE / {bird.id.replaceAll("_", " ")}</span>
        <span>
          {bird.order} · {bird.family}
        </span>
      </div>

      <header className="detail-hero">
        <div className="detail-title">
          <span className="detail-family">
            {bird.genus} / {bird.family}
          </span>
          <h1>{bird.name}</h1>
          <p>
            <i>{bird.scientific}</i> {bird.authority}
          </p>
          <div className="detail-badges">
            <b>{describeRegion(bird.region)}</b>
            <b>{bird.traits?.habitat || "Habitat not listed"}</b>
            <b>{describeConservation(bird.conservation?.iucn)}</b>
          </div>
        </div>
        <div className="detail-sticker-stage">
          <div className="detail-sunburst" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${RAW_BASE}/${bird.path}`}
            alt={`Illustrated ${bird.name} sticker`}
            width="900"
            height="900"
          />
        </div>
      </header>

      <section className="detail-summary" aria-label="Bird summary">
        <div>
          <span>ORDER</span>
          <strong>{bird.order}</strong>
        </div>
        <div>
          <span>FAMILY</span>
          <strong>{bird.family}</strong>
        </div>
        <div>
          <span>MIGRATION</span>
          <strong>{bird.traits?.migration || "Unknown"}</strong>
        </div>
        <div>
          <span>DIET TYPE</span>
          <strong>
            {bird.traits?.trophicNiche ||
              bird.traits?.trophicLevel ||
              "Unknown"}
          </strong>
        </div>
      </section>

      <section className="detail-section range-section">
        <div className="detail-section-heading">
          <span>01 / WHERE IT LIVES</span>
          <h2>
            RANGE &amp;
            <br />
            HABITAT.
          </h2>
        </div>
        <div className="range-panel">
          <div className="range-primary">
            <span>BREEDING REGION</span>
            <strong>{describeRegion(bird.range?.breedingRegion)}</strong>
            <p>
              {bird.range?.breeding ||
                "Detailed breeding-range information is not listed for this species."}
            </p>
          </div>
          <div className="range-note">
            <span>OUTSIDE BREEDING SEASON</span>
            <p>
              {bird.range?.nonbreeding ||
                "No separate nonbreeding range is listed."}
            </p>
          </div>
          <div className="range-note orange-note">
            <span>HOME TURF</span>
            <strong>{bird.traits?.habitat || "Not listed"}</strong>
            <p>
              {bird.traits?.primaryLifestyle
                ? `Primary lifestyle: ${bird.traits.primaryLifestyle}.`
                : "Lifestyle information is not listed."}
            </p>
          </div>
        </div>
      </section>

      <section className="detail-section measurement-section">
        <div className="detail-section-heading">
          <span>02 / THE NUMBERS</span>
          <h2>
            BUILT
            <br />
            LIKE THIS.
          </h2>
        </div>
        <div className="measurement-grid">
          <Measurement
            label="BODY MASS"
            value={bird.traits?.massG}
            unit="GRAMS"
          />
          <Measurement
            label="WING"
            value={bird.traits?.wingMm}
            unit="MILLIMETRES"
          />
          <Measurement
            label="TAIL"
            value={bird.traits?.tailMm}
            unit="MILLIMETRES"
          />
          <Measurement
            label="BEAK"
            value={bird.traits?.beakCulmenMm}
            unit="MILLIMETRES"
          />
          <Measurement
            label="TARSUS"
            value={bird.traits?.tarsusMm}
            unit="MILLIMETRES"
          />
          <Measurement
            label="HAND-WING INDEX"
            value={bird.traits?.handWingIndex}
            unit="INDEX"
          />
        </div>
      </section>

      <section className="detail-section status-section">
        <div className="status-card">
          <span>03 / CONSERVATION</span>
          <div className="status-code">{bird.conservation?.iucn || "—"}</div>
          <h2>{describeConservation(bird.conservation?.iucn)}</h2>
          <p>
            IUCN category
            {bird.conservation?.cites
              ? ` · CITES Appendix ${bird.conservation.cites}`
              : ""}
          </p>
          {bird.conservation?.chinaProtection && (
            <b>{bird.conservation.chinaProtection}</b>
          )}
        </div>
        <div className="names-card">
          <span>NAMES AROUND THE WORLD</span>
          <div className="name-list">
            {names.map(([code, name]) => (
              <div key={code}>
                <small>{languageLabels[code] || code}</small>
                <strong>{name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(bird.subspecies?.length ?? 0) > 0 && (
        <section className="subspecies-section">
          <details>
            <summary>
              <span>
                {String(bird.subspecies?.length).padStart(2, "0")} SUBSPECIES
              </span>
              <b>Open the list +</b>
            </summary>
            <div className="subspecies-list">
              {bird.subspecies?.map((subspecies, index) => (
                <article key={`${subspecies.name}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>
                    {bird.genus} {subspecies.name}
                  </h3>
                  <p>{subspecies.range || "Range not listed"}</p>
                  <small>{subspecies.authority}</small>
                </article>
              ))}
            </div>
          </details>
        </section>
      )}

      <section className="source-section">
        <div>
          <span>KEEP EXPLORING</span>
          <h2>
            VERIFY. LEARN.
            <br />
            LOOK CLOSER.
          </h2>
          <p>
            This is a friendly illustration, not a field-guide plate. Use the
            linked biodiversity databases when fine identification details
            matter.
          </p>
        </div>
        <div className="source-links">
          {externalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label} ↗
            </a>
          ))}
          {bird.reference?.page && (
            <a href={bird.reference.page} target="_blank" rel="noreferrer">
              Artwork reference ↗
            </a>
          )}
        </div>
      </section>

      <nav className="bird-neighbors" aria-label="Adjacent birds">
        {previous && (
          <Link href={`/birds/${previous.id}`}>
            <span>← PREVIOUS</span>
            <strong>{previous.name}</strong>
          </Link>
        )}
        {next && (
          <Link href={`/birds/${next.id}`}>
            <span>NEXT →</span>
            <strong>{next.name}</strong>
          </Link>
        )}
      </nav>

      <footer>
        <span>FLOCK! © 2026</span>
        <p>Created by Nagraj Tadingi</p>
        <Link href="/birds">All birds ↗</Link>
      </footer>
    </main>
  );
}
