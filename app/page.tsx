import Image from "next/image";
import Link from "next/link";

const marqueeBirds = [
  "KINGFISHER",
  "TOCO TOUCAN",
  "SCARLET MACAW",
  "EURASIAN EAGLE-OWL",
  "GREATER FLAMINGO",
];

export default function Home() {
  return (
    <main className="home-page">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Flock home">
          <span>FLOCK!</span>
          <span className="brand-dot" aria-hidden="true" />
        </Link>
        <div className="nav-links">
          <a href="#about">About</a>
          <Link className="nav-cta" href="/birds">
            All 11,064 birds <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">A loud little corner of the internet</p>
          <h1 id="hero-title">
            <span>BIRDS</span>
            <span className="outline-word">ARE NOT</span>
            <span>BORING.</span>
          </h1>
          <div className="hero-bottom">
            <p>
              Strange beaks. Loud feathers. Zero apologies. Meet every living
              bird species, one excellent sticker at a time.
            </p>
            <Link className="brutal-button yellow" href="/birds">
              Open the aviary <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="hero-art" aria-label="Bird sticker collage">
          <div className="sunburst" aria-hidden="true" />
          <div className="sticker-card sticker-owl">
            <Image
              src="/birds/bubo-bubo.webp"
              alt="Illustrated Eurasian eagle-owl sticker"
              width={760}
              height={760}
              priority
            />
          </div>
          <div className="sticker-card sticker-kingfisher">
            <Image
              src="/birds/alcedo-atthis.webp"
              alt="Illustrated common kingfisher sticker"
              width={520}
              height={520}
              priority
            />
          </div>
          <div className="comic-burst burst-one">WOW!</div>
          <div className="comic-burst burst-two">TWEET</div>
          <span className="scribble" aria-hidden="true">
            ✦
          </span>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...marqueeBirds, ...marqueeBirds].map((bird, index) => (
            <span key={`${bird}-${index}`}>
              {bird} <b>✹</b>
            </span>
          ))}
        </div>
      </div>

      <section
        className="manifesto"
        id="about"
        aria-labelledby="manifesto-title"
      >
        <div className="manifesto-intro">
          <span className="section-number">01 / FIELD NOTES</span>
          <h2 id="manifesto-title">FEATHERS WITH MAIN-CHARACTER ENERGY.</h2>
        </div>
        <div className="manifesto-grid">
          <article className="fact-card blue-card">
            <span className="fact-number">11,064</span>
            <h3>living species</h3>
            <p>
              Every one has its own look, its own range, and a seriously
              specific name.
            </p>
          </article>
          <article className="fact-card pink-card">
            <Image
              src="/birds/ara-macao.webp"
              alt="Illustrated scarlet macaw sticker"
              width={420}
              height={420}
            />
            <div>
              <span className="fact-number">44</span>
              <h3>orders</h3>
            </div>
          </article>
          <article className="fact-card cream-card">
            <p className="big-quote">“Nature has no chill.”</p>
            <Image
              src="/birds/ramphastos-toco.webp"
              alt="Illustrated toco toucan sticker"
              width={360}
              height={360}
            />
          </article>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="cta-title">
        <div>
          <span className="section-number">02 / THE AVIARY</span>
          <h2 id="cta-title">
            PICK A BIRD.
            <br />
            FIND A NEW FAVORITE.
          </h2>
        </div>
        <Link
          className="round-link"
          href="/birds"
          aria-label="Go to the birds page"
        >
          <span>FLY IN</span>
          <b aria-hidden="true">↗</b>
        </Link>
        <Image
          className="cta-bird"
          src="/birds/paradisaea-raggiana.webp"
          alt="Illustrated Raggiana bird-of-paradise sticker"
          width={560}
          height={560}
        />
      </section>

      <footer>
        <span>FLOCK! © 2026</span>
        <p>Created by Nagraj Tadingi</p>
        <Link href="/birds">Birds ↗</Link>
      </footer>
    </main>
  );
}
